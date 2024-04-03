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
import { NoAvailableNodeException, Web3RateLimitExceededException } from '../../commons/exceptions/index.js';
import { SECONDS_TO_MILLISECONDS } from '../../config/constants.js';
import { BlockTransactionData, ScanOption } from '../../commons/interfaces/index.js';

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
  async latestProccessedBlockBy(chainId: number): Promise<ProcessedBlockEntity | undefined> {
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
   * @param {Web3} client - The Web3 client instance.
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<number[]>} - An array containing the starting and ending block numbers.
   */
  private async _getBlockRange(
    client: Web3,
    scanOptions: ScanOption,
  ): Promise<number[]> {
    if (scanOptions.from_block && scanOptions.to_block) {
      return [scanOptions.from_block, scanOptions.to_block];
    }

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
    const client = initClient(nodeUrl);
    const [fromBlock, toBlock] = await this._getBlockRange(client, scanOptions);
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
          client,
          blockRange,
          topics,
          registedEvents,
          isRescan,
        );
        await await sleep(0.1 * SECONDS_TO_MILLISECONDS);
      }
      return { longSleep: false }
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Scan blockchain events for a given chainId within a specified block range.
   *
   * @param {number} chainId - The ID of the blockchain network.
   */
  async scanBlockEvents(scanOptions: ScanOption, latestScanResult?: ScanResult) : Promise<ScanResult> {
    try {
      const network = await this._getValidNetwork(scanOptions.chain_id, latestScanResult);
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
      const isLongSleep = error instanceof(Web3RateLimitExceededException) || error instanceof(NoAvailableNodeException);
      return { longSleep: isLongSleep };
    }
  }

  private async _getValidNetwork(chainId: number, latestScanResult?: ScanResult): Promise<NetworkEntity> {
    let network = await NetworkEntity.findOne({ where: { chain_id: chainId } });

    if (!network) {
      throw new Error(`Invalid network: ${chainId}`);
    }
    // Only switch to another node if the previous scan step got error
    if (latestScanResult?.longSleep) {
      network = await this.networkService.pickAndUpdateAvailableNode(network);
    }

    return network;
  }

  /**
   * Process a range of blocks for a given chainId.
   *
   * @param {QueryRunner} queryRunner - The TypeORM query runner.
   * @param {number} chainId - The ID of the blockchain network.
   * @param {Web3} client - The Web3 client for blockchain interaction.
   * @param {number[]} blockRange - The range of blocks to process.
   * @param {string[]} topics - The topics to filter events.
   * @param {EventEntity[]} registedEvents - The registered events for the chain.
   */
  private async _processBlockRange(
    queryRunner: QueryRunner,
    chainId: number,
    client: Web3,
    blockRange: number[],
    topics: string[] = [],
    registedEvents: EventEntity[],
    isRescan: boolean = false,
  ) {
    await queryRunner.startTransaction();

    try {
      console.info(
        `${new Date()} [ChainId: ${chainId}] Scanning event from block ${blockRange[0]} to block ${blockRange[1]}`
      );

      const logs = await this.scanEventByTopics(client, blockRange[0], blockRange[1], topics);
      const blockDataMap = await this.getBulkBlocksData(client, blockRange[0], blockRange[1]);
      const eventMessages = this._processLogs(logs, registedEvents, chainId, blockDataMap);

      if (eventMessages.length !== 0) {
        await queryRunner.manager.save(eventMessages, { chunk: 200 });
        console.info(`Saved ${eventMessages.length} event messages`)
      }

      if (!isRescan) {
        const blockNumbers = Object.keys(blockDataMap);
        const latestBlockData: BlockTransactionData = blockDataMap[blockNumbers[blockNumbers.length - 1]];
        await this._updateProcessedBlock(queryRunner, blockRange[1], chainId, latestBlockData.hash);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error to stop further processing
    }
  }

  /**
   * Process logs and create event messages.
   *
   * @param {any[]} logs - The logs retrieved from the blockchain.
   * @param {EventEntity[]} registedEvents - The registered events for the chain.
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {any[]} - The event messages created from the logs.
   */
  private _processLogs(
    logs: any[], registedEvents: any[],
    chainId: number,
    blockDataMap: { [blockNo: number]: BlockTransactionData; }
  ): EventMessageEntity[] {
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

  /**
   * Update the processed block after scanning.
   *
   * @param {QueryRunner} queryRunner - The TypeORM query runner.
   * @param {boolean} ignoreUpdate - Flag to ignore block updates.
   * @param {number[]} blockRange - The range of blocks processed.
   * @param {number} chainId - The ID of the blockchain network.
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
    console.info('\nStarting to get getLogsPromises');
    const logsNestedArray = await Promise.all(getLogsPromises);
    console.info('\nFinished getLogsPromises');
    return Array.prototype.concat([], ...logsNestedArray);
  }
}
