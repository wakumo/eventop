import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Web3 from 'web3';

import { initClient } from '../../commons/utils/blockchain.js';
import { chunkArray, chunkArrayReturnHex } from '../../commons/utils/index.js';
import { NetworkEntity, ProcessedBlockEntity } from '../../entities/index.js';
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

  async latestProccessedBlockBy(chainId: number) {
    return await ProcessedBlockEntity.findOne({
      where: {
        chain_id: chainId
      },
      order: { block_no: 'DESC' }
    });
  }

  async scanBlockEvents(
    chainId: number,
    fromBlock?: number,
    toBlock?: number,
    ignoreUpdate = false
  ) {
    let network = await NetworkEntity.findOne({
      where: { chain_id: chainId },
    });
    if (!network) {
      throw `Invalid network: ${chainId}`;
    }
    if (network.is_stop_scan === true) {
      console.info(`Pause the scan on the ${network.chain_id} network`);
      return;
    }

    let nextBlockNo = null;

    const latestProcessBlock = await this.latestProccessedBlockBy(chainId);
    if (latestProcessBlock) {
      nextBlockNo = latestProcessBlock.block_no + 1;
    }

    network = await this.networkService.validateAvailableNodes(network);
    const client = initClient(network.http_url);
    const currentBlockNo = await client.eth.getBlockNumber();
    const currentBlock = await client.eth.getBlock(currentBlockNo, false);

    if (!currentBlock) {
      console.error(`Can't fetch current block on the ${network.chain_id} network`);
      return;
    }

    // Validate orphan block or not to rescan last chunk blocks
    // Check if (latestProcessBlock.block_no + 1).parentHash === latestProcessBlock.block_hash
    // True is valid, False is orphan block
    //
    // Only check if latestProcessBlock is not null and its block_hash is not null
    if (latestProcessBlock && latestProcessBlock.block_hash && latestProcessBlock.block_no < currentBlockNo) {
      const nextStartBlock = await client.eth.getBlock(latestProcessBlock.block_no + 1, false);
      if (!nextStartBlock) {
        console.error(`Can't fetch nextStartBlock on the ${network.chain_id} network`);
        return;
      }
      if (nextStartBlock.parentHash?.toLowerCase() !== latestProcessBlock.block_hash?.toLowerCase()) {
        fromBlock = latestProcessBlock.block_no - network.scan_range_no; // rescan last chunk blocks if orphan block
      }
    }

    fromBlock = fromBlock || nextBlockNo || Number(currentBlockNo.toString());
    toBlock = toBlock || Number(currentBlockNo.toString());
    const chunkBlockRanges = chunkArray(fromBlock, toBlock, network.scan_range_no);
    const topics = await this.eventService.getTopicsByChainId(chainId);
    if (topics.length === 0) { return };

    const registedEvents = await this.eventService.getEventsByChain(chainId);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    for (const blockRange of chunkBlockRanges) {
      // Put each blockRange in a single transaction
      // Any error except decodeLog error will make this step rollback
      await queryRunner.startTransaction();
      try {
        console.info(
          `[ChainId: ${chainId}] Scanning event from block ${blockRange[0]} to block ${blockRange[1]}`,
        );
        const logs = await this.scanEventByTopics(
          client,
          blockRange[0],
          blockRange[1],
          topics,
        );
        let eventMessages = [];
        for (const log of logs) {
          const topic = log['topics'][0];
          const events = registedEvents.filter(
            (event) => event.event_topic === topic && event.chain_id === chainId,
          );
          events.map((event) => {
            const newMessage = this.eventMsgService.createEventMessage(
              event,
              log,
            );
            if (newMessage !== null) {
              eventMessages.push(newMessage);
            }
          });
        }
        if (eventMessages.length !== 0) {
          await queryRunner.manager.save(eventMessages, { chunk: 200 });
        }
        if (!ignoreUpdate) {
          if (latestProcessBlock) {
            await queryRunner.manager.update(
              ProcessedBlockEntity,
              latestProcessBlock.id,
              {
                block_no: blockRange[1],
                block_hash: currentBlock.hash?.toLowerCase(),
              }
            );
          } else {
            await queryRunner.manager.create(ProcessedBlockEntity, {
              chain_id: chainId,
              block_no: blockRange[1],
              block_hash: currentBlock.hash?.toLowerCase(),
            }).save();
          }
        }
        await queryRunner.commitTransaction();
        // End and commit transction
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(error);
        break;
      }
    }

    await queryRunner.release();
  }

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
