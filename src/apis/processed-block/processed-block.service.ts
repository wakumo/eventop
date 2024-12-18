import { DataSource, QueryRunner } from 'typeorm';
import Web3 from 'web3';

import { forwardRef, Inject, Injectable } from '@nestjs/common';

import {
  BlockCoinTransfer,
  BlockTransactionData,
  ScanOption,
  TransactionsByHash
} from '../../commons/interfaces/index.js';
import { initClient } from '../../commons/utils/blockchain.js';
import { chunkArray, chunkArrayReturnHex, sleep } from '../../commons/utils/index.js';
import { JsonRpcClient } from '../../commons/utils/json-rpc-client.js';
import { RetryManager } from '../../commons/utils/retry-manager.js';
import {
  BLOCKS_RECOVER_ORPHAN,
  PROCESS_TIMEOUT_IN_MS,
  SECONDS_TO_MILLISECONDS
} from '../../config/constants.js';
import {
  EventEntity,
  EventMessageEntity,
  NetworkEntity,
  ProcessedBlockEntity
} from '../../entities/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { NetworkService } from '../network/network.service.js';
import { CacheManagerService } from '../../commons/cache-manager/cache-manager.service.js';

export interface ScanResult {
  longSleep: boolean;
  error?: any;
}

const withTimeout = (promise: Promise<any>, timeoutMs: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("[ISE] Timeout exceeded")), timeoutMs))
  ]);
};

@Injectable()
export class ProcessedBlockService {
  private readonly retryManager: RetryManager;

  constructor(
    private connection: DataSource,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
    @Inject(forwardRef(() => EventMessageService))
    private eventMsgService: EventMessageService,
    @Inject(forwardRef(() => NetworkService))
    private networkService: NetworkService,
    private readonly cacheManager: CacheManagerService,
  ) {
    this.retryManager = new RetryManager({});
  }

  /**
   * Get the latest processed block for a given chainId.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<ProcessedBlockEntity | undefined>} - The latest processed block entity.
   */
  private async latestProccessedBlockBy(chainId: number): Promise<ProcessedBlockEntity | undefined> {
    return await ProcessedBlockEntity.findOne({
      where: {
        chain_id: chainId
      },
      order: { block_no: 'DESC' }
    });
  }

  /**
   * Get latest processed block record from DB for a given chainId.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<ProcessedBlockEntity | null>} - The latest processed block
   */
  private async _getLatestScannedBlock(chainId: number): Promise<ProcessedBlockEntity | null> {
    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    return latestProcessBlock;
  }
  /**
   * Get the block range for scanning coin transfers.
   *
   * @param {nodeUrl} nodeUrl - Blockchain node url
   * @returns {Promise<number[]>} - An array containing the starting and ending block numbers.
   */
  private async _getBlockRange(
    nodeUrl: string,
    scanOptions: ScanOption,
  ): Promise<number[]> {
    if (scanOptions.from_block && scanOptions.to_block) {
      return [scanOptions.from_block, scanOptions.to_block];
    }
    // Get the next block number to scan from the database
    const latestProcessedBlock = await this._getLatestScannedBlock(scanOptions.chain_id);
    const nextBlockNo = latestProcessedBlock ? latestProcessedBlock.block_no + 1 : null;
    // Get the current block number from the blockchain
    const rpcClient = new JsonRpcClient(nodeUrl);
    const currentBlockNo = await rpcClient.getCurrentBlock();

    // Calculate the starting block number based on the next block or current block
    let fromBlock = nextBlockNo || Number(currentBlockNo.toString());
    // Calculate the ending block number, limiting the range to 500 blocks
    let toBlock = Number(currentBlockNo.toString());
    toBlock = Math.min(fromBlock + 500, toBlock);

    return [fromBlock, toBlock];
  }

  private async _scanBlockEvents(
    nodeUrl: string,
    scanOptions: ScanOption,
    topics: string[],
    scanRangeNo: number,
  ) {
    const registedEvents = await this.cacheManager.findOrCache(
      this.eventService.getEventsByChain.bind(null, scanOptions.chain_id),
      `EventsByChain.${scanOptions.chain_id}`
    );
    const [fromBlock, toBlock] = await this._getBlockRange(nodeUrl, scanOptions);
    const isRescan = !!(scanOptions.from_block && scanOptions.to_block);
    const blockRangeChunks = chunkArray(fromBlock, toBlock, scanRangeNo);

    try {
      for (const blockRange of blockRangeChunks) {
        await this._processBlockRange(
          scanOptions.chain_id,
          nodeUrl,
          blockRange,
          topics,
          registedEvents,
          isRescan,
        );
        await await sleep(0.1 * SECONDS_TO_MILLISECONDS);
      }
      return { longSleep: false }
    } catch (error) {
      return { longSleep: true }
    }
  }

  /**
   * Scan blockchain events for a given chainId within a specified block range.
   */
  async scanBlockEvents(scanOptions: ScanOption, latestScanResult?: ScanResult) : Promise<ScanResult> {
    try {
      const network = await this._findNetworkBy(scanOptions.chain_id, latestScanResult);
      const isRescan = !!(scanOptions.from_block && scanOptions.to_block);
      if (!isRescan && network.is_stop_scan) {
        console.info(`Pause the scan on the ${network.chain_id} network`);
        return { longSleep: false };
      }

      const topics = await this.cacheManager.findOrCache(
        this.eventService.getTopicsByChainId.bind(null, scanOptions.chain_id),
        `TopicsByChainId.${scanOptions.chain_id}`
      );
      if (topics.length === 0) {
        console.info(`Event topic not found on ${network.chain_id} network`);
        return { longSleep: false };
      };

      const scanResult = await this._scanBlockEvents(network.http_url, scanOptions, topics, network.scan_range_no);

      return scanResult;
    } catch (error) {
      console.log(`${new Date()} - Error while scanning block: ${error}`);
      return { longSleep: true };
    }
  }

  /**
   * Finds a network entity by its chain ID.
   * Only switch to another node if the previous scan step got error.
   * Replace the URL with a new one in case of a crash.
   *
   * @param chainId The chain ID to search for.
   * @param latestScanResult The latest scan result object.
   *
   * @returns The found network entity.
   */
  private async _findNetworkBy(chainId: number, latestScanResult?: ScanResult): Promise<NetworkEntity> {
    let network = await NetworkEntity.findOne({ where: { chain_id: chainId } });

    if (!network) {
      throw new Error(`Network not found for chain ID: ${chainId}`);
    }
    if (network.is_stop_scan) { return network; }

    // Determine if switching to another node is necessary
    const isShouldSwitchNode = await this._shouldSwitchNode(latestScanResult, chainId);
    if (isShouldSwitchNode) {
      console.info(`${new Date()} - Switching to another node for network ${network.chain_id}`);
      const nodesToExclude = latestScanResult?.longSleep ? [] : [network.http_url];
      network = await withTimeout(this.networkService.pickAndUpdateAvailableNode(network, nodesToExclude), 10_000);
    }

    return network;
  }

  // Determine if switching to another node is necessary based on the latest scan result
  private async _shouldSwitchNode(latestScanResult: ScanResult, chainId: number): Promise<boolean> {
    return latestScanResult?.longSleep || await this._isCurrentBlockOutdated(chainId);
  }

  // Check if the current node's block is outdated
  private async _isCurrentBlockOutdated(chainId: number): Promise<boolean> {
    const latestProcessedBlock = await this._getLatestScannedBlock(chainId);
    return latestProcessedBlock && latestProcessedBlock.updated_at && latestProcessedBlock.updated_at.getTime() + PROCESS_TIMEOUT_IN_MS < Date.now();
  }

  /**
   * Process a range of blocks for a given chainId.
   *
   * @param {QueryRunner} queryRunner - The TypeORM query runner.
   * @param {number} chainId - The ID of the blockchain network.
   * @param {nodeUrl} nodeUrl - The blockchain node http url
   * @param {number[]} blockRange - The range of blocks to process.
   * @param {string[]} topics - The topics to filter events.
   * @param {EventEntity[]} registedEvents - The registered events for the chain.
   */
  private async _processBlockRange(
    chainId: number,
    nodeUrl: string,
    blockRange: number[],
    topics: string[] = [],
    registedEvents: EventEntity[],
    isRescan: boolean = false,
  ) {
    console.info(
      `${new Date()} [ChainId: ${chainId}] Scanning event from block ${blockRange[0]} to block ${blockRange[1]}`
    );
    console.info(`${new Date()} - getting bulk blocks data`);
    const blockDataMap = await this.getBulkBlocksData(nodeUrl, blockRange[0], blockRange[1]);
    console.info(`${new Date()} - got bulk blocks data`);
    const [firstBlockData, latestBlockData] = this._getFirstAndLastBlockNo(blockDataMap);
    console.info(`${new Date()} - firstBlockData: ${firstBlockData.number}, latestBlockData: ${latestBlockData.number}`);
    if (!isRescan) { await this._handleOrphanBlock(chainId, firstBlockData); }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    console.info(`${new Date()} - starting transaction`);

    try {
      await queryRunner.startTransaction();
      console.info(`${new Date()} - processing coin transfer events`);
      const coinTransferMessages = await this._processCoinTransferEvents(nodeUrl, blockRange, chainId, blockDataMap);
      console.info(`${new Date()} - processing contract events`);
      const contractEventMessages = await this._processContractEvents(nodeUrl, blockRange, topics, registedEvents, chainId, blockDataMap);
      console.info(`${new Date()} - saving event messages`);
      const messages = [...contractEventMessages, ...coinTransferMessages];
      if (messages.length !== 0) {
        await queryRunner.manager.save(messages, { chunk: 200 });
        console.info(`Saved ${messages.length} event messages`)
      }

      if (!isRescan) {
        await this._updateProcessedBlock(queryRunner, blockRange[1], chainId, latestBlockData.hash);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(`${new Date()} - Error while scanning block: ${error}`);
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error to stop further processing
    } finally {
      await queryRunner.release();
    }
  }

  // loop through the trace blocks and get the trace data using promise.all
  private async _getTraceBlocks(nodeUrl: string, fromBlock: number, toBlock: number) {
    const jsonRpcClient = new JsonRpcClient(nodeUrl);
    const traceBlocks = [];
    for (let blockNo = fromBlock; blockNo <= toBlock; blockNo++) {
      const traceBlock = jsonRpcClient.getTraceBlock(blockNo);
      traceBlocks.push(traceBlock);
    }

    return await Promise.all(traceBlocks);
  }

  private async _handleOrphanBlock(chainId: number, firstBlockData: BlockTransactionData) {
    const latestScannedBlock = await this.latestProccessedBlockBy(chainId);
    if (latestScannedBlock?.block_hash && latestScannedBlock.block_hash !== firstBlockData.parentHash) {
      latestScannedBlock.block_no -= BLOCKS_RECOVER_ORPHAN;
      latestScannedBlock.block_hash = null;
      await ProcessedBlockEntity.save(latestScannedBlock);

      throw new Error(`${new Date()} - Orphan block detected, rollback 128 blocks and rescan`);
    }
  }

  private _getFirstAndLastBlockNo(
    blockData: { [blockNo: number]: BlockTransactionData }
  ): [BlockTransactionData, BlockTransactionData] {
    const blockNumbers = Object.keys(blockData);
    const firstBlockData: BlockTransactionData = blockData[blockNumbers[0]];
    const latestBlockData: BlockTransactionData = blockData[blockNumbers[blockNumbers.length - 1]];

    return [firstBlockData, latestBlockData];
  }

  private async _processContractEvents(
    nodeUrl: string,
    blockRange: number[],
    topics: string[],
    registedEvents: any[],
    chainId: number,
    blockDataMap: { [blockNo: number]: BlockTransactionData; }
  ): Promise<EventMessageEntity[]> {
    const client = initClient(nodeUrl);
    console.info(`${new Date()} - scanning event by topics`);
    const logs = await this.scanEventByTopics(client, blockRange[0], blockRange[1], topics);
    console.info(`${new Date()} - got logs`);
    const eventMessages: EventMessageEntity[][] = await Promise.all(logs.map(async (log) => {
      const topic = log['topics'][0];

      const relevantEvents = registedEvents.filter(
        (event) => event.event_topic === topic && event.chain_id === chainId
      );
      const messages = await Promise.all(relevantEvents.map(async (event) => {
        return this.eventMsgService.createEventMessage(event, log, blockDataMap[log['blockNumber']]);
      }));

      return messages.filter((msg) => msg !== null);
    }));

    const flattenedMessages = eventMessages.flat();

    return flattenedMessages;
  }

  private async _processCoinTransferEvents(
    nodeUrl: string,
    blockRange: number[],
    chainId: number,
    blockDataMap: { [blockNo: number]: BlockTransactionData; }
  ) {
    const traceBlocks = await this._getTraceBlocks(nodeUrl, blockRange[0], blockRange[1]);

    const coinTransfers: BlockCoinTransfer[] = [];
    for (const traceBlock of traceBlocks) {
      if (!traceBlock || traceBlock.length === 0) { continue; }
      const results = this._findCoinTransferAddresses(traceBlock);
      if (results.length > 0) { coinTransfers.push(...results); }
    }
    if (coinTransfers.length === 0) { return []; }

    return await this.eventMsgService.createCoinTransferEventMessage(chainId, coinTransfers, blockDataMap);
  }

  private _findCoinTransferAddresses(traceBlock: any): BlockCoinTransfer[] {
    const addressMap: { [txid: string]: Set<string> } = {};
    const blockNo: number = traceBlock[0].blockNumber;

    // Group addresses by transactionHash
    traceBlock.forEach(block => {
      const action = block.action;
      const from = action.from;
      const to = action.to;
      const value = action.value;
      const txid = block.transactionHash;

      if (!value || value === "0x0") {
        return;
      }

      // Initialize address set for this transactionHash if not exists
      if (!addressMap[txid]) {
        addressMap[txid] = new Set<string>();
      }

      // Check if from and to are truthy before adding to the set
      if (from) { addressMap[txid].add(from.toLowerCase()); }
      if (to) { addressMap[txid].add(to.toLowerCase()); }
    });

    // Convert addressMap to array format
    const result: { block_number: number, addresses: string[], txid: string }[] = [];

    for (const txid in addressMap) {
      if (!Object.prototype.hasOwnProperty.call(addressMap, txid)) { continue; }

      const addresses = Array.from(addressMap[txid]);
      if (!txid || addresses.length === 0) {
        continue; // Skip if txid is undefined or addresses array is empty
      }

      // Only add entries with valid txid and non-empty addresses
      result.push({ block_number: blockNo, addresses, txid });
    }

    return result;
  }

  /**
   * Update the processed block after scanning.
   */
  private async _updateProcessedBlock(
    queryRunner: QueryRunner,
    latestBlock: number,
    chainId: number,
    latestBlockHash: string,
  ) {
    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    const updateParams = { block_no: latestBlock, block_hash: latestBlockHash };

    if (latestProcessBlock) {
      await queryRunner.manager.update(ProcessedBlockEntity, latestProcessBlock.id, updateParams);
    } else {
      await this._createAndSaveNewProcessedBlock(queryRunner, chainId, updateParams);
    }
  }

  private async _createAndSaveNewProcessedBlock(
    queryRunner: QueryRunner,
    chainId: number,
    updateParams: any,
  ) {
    const newProcessedBlock = queryRunner.manager.create(ProcessedBlockEntity, {
      chain_id: chainId,
      ...updateParams,
    });
    await queryRunner.manager.save(newProcessedBlock);
  }

  /**
   * Scan blockchain events by topics within a specified block range using hex block numbers.
   *
   * @param {Web3} client - The Web3 client for blockchain interaction.
   * @param {number} fromBlockHex - The starting block number in hexadecimal format.
   * @param {number} toBlockHex - The ending block number in hexadecimal format.
   * @param {string[]} topics - The topics to filter events.
   * @returns {Promise<any[]>} - The logs retrieved from the blockchain.
   */
  async scanEventByTopicsByBlockHexs(
    client: Web3,
    fromBlockHex: number,
    toBlockHex: number,
    topics: string[],
  ) {
    const getLogsPromise = client.eth.getPastLogs({
      fromBlock: fromBlockHex,
      toBlock: toBlockHex,
      topics: [topics],
    });

    return await this.retryManager.call(getLogsPromise);
  }

  private async _getBlock(nodeUrl: string, blockNo: number, isVerbose: boolean = true): Promise<BlockTransactionData> {
    const client = initClient(nodeUrl);
    const getBlockPromise = client.eth.getBlock(blockNo, isVerbose);
    const blockResponse = await this.retryManager.call(getBlockPromise);
    this._addTransactionsByHashToBlockData(blockResponse);
    return blockResponse;
  }

  // remapping transactions
  // transform transactions array to object with tx_hash as key
  private async _addTransactionsByHashToBlockData(blockResponse: any) {
    let transactionsByHash : TransactionsByHash;
    if (blockResponse?.transactions) {
      transactionsByHash = blockResponse.transactions.reduce( (joined, value) => {
        joined[value.hash.toLowerCase()] = {
          from: value.from,
          to: value.to
        };
        return joined;
      }, {})
      blockResponse.transactionsByHash = transactionsByHash;
    }
  }

  async getBulkBlocksData(
    nodeUrl: string,
    fromBlock: number,
    toBlock: number
  ): Promise<{ [blockNo: number]: BlockTransactionData }> {
    const blockDataMap: { [blockNo: number]: BlockTransactionData } = {};
    const fetchBlockData = async (blockNo: number): Promise<void> => {
      const blockInfo = await withTimeout(this._getBlock(nodeUrl, blockNo), 10000); // 10-second timeout
      blockDataMap[blockNo] = {
        number: BigInt(blockInfo.number),
        timestamp: BigInt(blockInfo.timestamp),
        hash: blockInfo?.hash,
        parentHash: blockInfo?.parentHash,
        transactionsByHash: blockInfo?.transactionsByHash
      };
    };

    const fetchPromises: Promise<void>[] = [];

    for (let blockNo = fromBlock; blockNo <= toBlock; blockNo++) {
      fetchPromises.push(fetchBlockData(blockNo));
    }

    await Promise.all(fetchPromises);

    return blockDataMap;
  }

  async scanEventByTopics(
    client: Web3,
    fromBlock: number,
    toBlock: number,
    topics: string[],
  ) {
    const hexChunks = chunkArrayReturnHex(fromBlock, toBlock, 2);
    const getLogsPromises = [];

    for (let chunkIndex = 0; chunkIndex < hexChunks.length; chunkIndex++) {
      getLogsPromises.push(
        withTimeout(this.scanEventByTopicsByBlockHexs(
          client,
          hexChunks[chunkIndex][0],
          hexChunks[chunkIndex][1],
          topics
        ), 10_000)
      );
    }
    const logsNestedArray = await Promise.all(getLogsPromises);
    const filteredLogs = logsNestedArray.filter(logs => logs !== undefined);

    return Array.prototype.concat([], ...filteredLogs);
  }
}
