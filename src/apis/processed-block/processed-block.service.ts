import {
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import Web3 from 'web3';
import { initClient } from '../../commons/utils/blockchain.js';
import {
  chunkArray,
  chunkArrayReturnHex,
  sleep,
} from '../../commons/utils/index.js';
import {
  EventEntity,
  EventMessageEntity,
  NetworkEntity,
  ProcessedBlockEntity,
} from '../../entities/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { NetworkService } from '../network/network.service.js';
import { Web3Client } from '../../commons/utils/web3-client.js';
import { BLOCKS_RECOVER_ORPHAN, SECONDS_TO_MILLISECONDS } from '../../config/constants.js';
import { BlockCoinTransfer, BlockTransactionData, ScanOption } from '../../commons/interfaces/index.js';
import { JsonRpcClient } from '../../commons/utils/json-rpc-client.js';

export interface ScanResult {
  longSleep: boolean;
  error?: any;
}

@Injectable()
export class ProcessedBlockService {
  private web3Client: Web3Client;

  constructor(
    private connection: DataSource,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
    @Inject(forwardRef(() => EventMessageService))
    private eventMsgService: EventMessageService,
    @Inject(forwardRef(() => NetworkService))
    private networkService: NetworkService,

  ) {
    this.web3Client = new Web3Client({});
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
   * Get the from block number need to scan from DB for a given chainId.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<number | null>} - The next block number.
   */
  private async _getNextBlockNoFromDB(chainId: number): Promise<number | null> {
    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    return latestProcessBlock ? latestProcessBlock.block_no + 1 : null;
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

    const client = initClient(nodeUrl);
    // Get the next block number to scan from the database
    const nextBlockNo = await this._getNextBlockNoFromDB(scanOptions.chain_id);
    // Get the current block number from the blockchain
    const currentBlockNo = await client.eth.getBlockNumber();

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
    const [fromBlock, toBlock] = await this._getBlockRange(nodeUrl, scanOptions);
    const isRescan = !!(scanOptions.from_block && scanOptions.to_block);
    const blockRangeChunks = chunkArray(fromBlock, toBlock, scanRangeNo);
    const registedEvents = await this.eventService.getEventsByChain(scanOptions.chain_id);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      for (const blockRange of blockRangeChunks) {
        await this._processBlockRange(
          queryRunner,
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
      console.log("🚀 ~ ProcessedBlockService ~ error:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Scan blockchain events for a given chainId within a specified block range.
   */
  async scanBlockEvents(scanOptions: ScanOption, latestScanResult?: ScanResult) : Promise<ScanResult> {
    try {
      const network = await this._findNetworkBy(scanOptions.chain_id, latestScanResult);
      if (network.is_stop_scan) {
        console.info(`Pause the scan on the ${network.chain_id} network`);
        return { longSleep: false };
      }

      const topics = await this.eventService.getTopicsByChainId(scanOptions.chain_id);
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
      throw new Error(`Invalid network: ${chainId}`);
    }
    // Only switch to another node if the previous scan step got error
    if (latestScanResult?.longSleep) {
      console.info(`${new Date()} - Switch to another node for ${network.chain_id} network`);
      network = await this.networkService.pickAndUpdateAvailableNode(network);
    }

    return network;
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
    queryRunner: QueryRunner,
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

    await queryRunner.startTransaction();

    try {
      const client = initClient(nodeUrl);
      const blockDataMap = await this.getBulkBlocksData(client, blockRange[0], blockRange[1]);
      const [firstBlockData, latestBlockData] = this._getFirstAndLastBlockNo(blockDataMap);

      if (!isRescan) { await this._handleOrphanBlock(chainId, firstBlockData); }

      const coinTransferMessages = await this._processCoinTransferEvents(nodeUrl, blockRange, chainId, blockDataMap);
      const contractEventMessages = await this._processContractEvents(client, blockRange, topics, registedEvents, chainId, blockDataMap);

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

  /**
   * Process logs and create event messages.
   *
   * @returns {EventMessageEntity[]} - The event messages created from the logs.
   */
  private async _processContractEvents(
    client: Web3,
    blockRange: number[],
    topics: string[],
    registedEvents: any[],
    chainId: number,
    blockDataMap: { [blockNo: number]: BlockTransactionData; }
  ): Promise<EventMessageEntity[]> {
    const logs = await this.scanEventByTopics(client, blockRange[0], blockRange[1], topics);
    let eventMessages = [];

    for (const log of logs) {
      const topic = log['topics'][0];
      const events = registedEvents.filter(
        (event) => event.event_topic === topic && event.chain_id === chainId
      );

      events.map((event) => {
        const newMessage = this.eventMsgService.createEventMessage(event, log, blockDataMap[log['blockNumber']]);
        if (newMessage !== null) { eventMessages.push(newMessage); }
      });
    }

    return eventMessages;
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

    return await this.web3Client.call(getLogsPromise);
  }

  private async _getBlock(client: Web3, blockNo: number): Promise<BlockTransactionData> {
    const getBlockPromise = client.eth.getBlock(blockNo);
    return await this.web3Client.call(getBlockPromise);
  }

  async getBulkBlocksData(
    client: Web3,
    fromBlock: number,
    toBlock: number
  ): Promise<{ [blockNo: number]: BlockTransactionData }> {
    const blockDataMap: { [blockNo: number]: BlockTransactionData } = {};

    const fetchBlockData = async (blockNo: number): Promise<void> => {
      const blockInfo = await this._getBlock(client, blockNo);
      blockDataMap[blockNo] = {
        number: BigInt(blockInfo.number),
        timestamp: BigInt(blockInfo.timestamp),
        hash: blockInfo?.hash,
        parentHash: blockInfo?.parentHash,
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
        this.scanEventByTopicsByBlockHexs(
          client,
          hexChunks[chunkIndex][0],
          hexChunks[chunkIndex][1],
          topics
        )
      );
    }
    const logsNestedArray = await Promise.all(getLogsPromises);
    const filteredLogs = logsNestedArray.filter(logs => logs !== undefined);

    return Array.prototype.concat([], ...filteredLogs);
  }
}
