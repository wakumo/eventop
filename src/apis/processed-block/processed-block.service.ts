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
} from '../../commons/utils/index.js';
import {
  EventEntity,
  NetworkEntity,
  ProcessedBlockEntity,
} from '../../entities/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { NetworkService } from '../network/network.service.js';

@Injectable()
export class ProcessedBlockService {

  constructor(
    private connection: DataSource,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
    @Inject(forwardRef(() => EventMessageService))
    private eventMsgService: EventMessageService,
    @Inject(forwardRef(() => NetworkService))
    private networkService: NetworkService,
  ) {}

  /**
   * Get the latest processed block for a given chainId.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<ProcessedBlockEntity | undefined>} - The latest processed block entity.
   */
  async latestProccessedBlockBy(chainId: number) {
    return await ProcessedBlockEntity.findOne({
      where: {
        chain_id: chainId
      },
      order: { block_no: 'DESC' }
    });
  }

  private async _validateNetwork(chainId: number) {
    let network = await NetworkEntity.findOne({ where: { chain_id: chainId } });
    if (!network) {
      throw `Invalid network: ${chainId}`;
    }
    network = await this.networkService.validateAvailableNodes(network);

    return network;
  }

  /**
   * Get the next block number for a given chainId.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @returns {Promise<number | null>} - The next block number.
   */
  private async _getNextBlockNo(chainId: number) {
    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    return latestProcessBlock ? latestProcessBlock.block_no + 1 : null;
  }

  /**
   * Scan blockchain events for a given chainId within a specified block range.
   *
   * @param {number} chainId - The ID of the blockchain network.
   * @param {number} fromBlock - The starting block number.
   * @param {number} toBlock - The ending block number.
   * @param {boolean} ignoreUpdate - Flag to ignore block updates.
   */
  async scanBlockEvents(
    chainId: number,
    fromBlock?: number,
    toBlock?: number,
    ignoreUpdate = false
  ) {
    let network = await this._validateNetwork(chainId);
    if (network.is_stop_scan) {
      console.info(`Pause the scan on the ${network.chain_id} network`);
      return;
    }

    const nextBlockNo = await this._getNextBlockNo(chainId);
    const client = initClient(network.http_url);
    const currentBlockNo = await client.eth.getBlockNumber();
    const currentBlock = await client.eth.getBlock(currentBlockNo, false);

    if (!currentBlock) {
      console.error(`Can't fetch current block on the ${network.chain_id} network`);
      return;
    }

    fromBlock = fromBlock || nextBlockNo || Number(currentBlockNo.toString());
    toBlock = toBlock || Number(currentBlockNo.toString());

    if (toBlock - fromBlock > 500) { toBlock = fromBlock + 500; } // Limit to 500 blocks per scan
    const chunkBlockRanges = chunkArray(fromBlock, toBlock, network.scan_range_no);
    const topics = await this.eventService.getTopicsByChainId(chainId);

    if (topics.length === 0) {
      console.info(`Event topic not found on ${network.chain_id} network`);
      return
    };

    const registedEvents = await this.eventService.getEventsByChain(chainId);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      for (const blockRange of chunkBlockRanges) {
        await this._processBlockRange(
          queryRunner,
          chainId,
          client,
          blockRange,
          topics,
          registedEvents,
          ignoreUpdate
        );
      }
    } finally {
      await queryRunner.release();
    }
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
   * @param {boolean} ignoreUpdate - Flag to ignore block updates.
   */
  private async _processBlockRange(
    queryRunner: QueryRunner,
    chainId: number,
    client: Web3,
    blockRange: number[],
    topics: string[] = [],
    registedEvents: EventEntity[],
    ignoreUpdate: boolean
  ) {
    await queryRunner.startTransaction();

    try {
      console.info(
        `[ChainId: ${chainId}] Scanning event from block ${blockRange[0]} to block ${blockRange[1]}`
      );

      const logs = await this.scanEventByTopics(client, blockRange[0], blockRange[1], topics);
      const eventMessages = this._processLogs(logs, registedEvents, chainId);

      if (eventMessages.length !== 0) {
        await queryRunner.manager.save(eventMessages, { chunk: 200 });
      }

      await this._updateProcessedBlock(queryRunner, ignoreUpdate, blockRange, chainId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
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
  private _processLogs(logs: any[], registedEvents: any[], chainId: number) {
    let eventMessages = [];

    for (const log of logs) {
      const topic = log['topics'][0];
      const events = registedEvents.filter(
        (event) => event.event_topic === topic && event.chain_id === chainId
      );

      events.map((event) => {
        const newMessage = this.eventMsgService.createEventMessage(event, log);

        if (newMessage !== null) {
          eventMessages.push(newMessage);
        }
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
    ignoreUpdate: boolean,
    blockRange: number[],
    chainId: number
  ) {
    if (ignoreUpdate) {
      return;
    }

    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    const updateParams = { block_no: blockRange[1] };

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
    return await client.eth.getPastLogs({
      fromBlock: fromBlockHex,
      toBlock: toBlockHex,
      topics: [topics],
    });
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
    return Array.prototype.concat([], ...logsNestedArray);
  }
}
