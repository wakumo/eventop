import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Web3 from 'web3';

import { initClient } from '../../commons/utils/blockchain.js';
import { chunkArray } from '../../commons/utils/index.js';
import { NetworkEntity, ProcessedBlockEntity } from '../../entities/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';

@Injectable()
export class ProcessedBlockService {
  constructor(
    private connection: DataSource,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
    @Inject(forwardRef(() => EventMessageService))
    private eventMsgService: EventMessageService,
  ) {}

  async getNextScanBlockNoFromDB(chainId: number) {
    const lastScannedBlock = await ProcessedBlockEntity.createQueryBuilder(
      'processed_block',
    )
      .where('processed_block.chain_id = :chainId', { chainId: chainId })
      .orderBy('processed_block.block_no', 'DESC')
      .getOne();
    if (lastScannedBlock) {
      return lastScannedBlock.block_no + 1;
    } else {
      return null;
    }
  }

  async scanBlockEvents(
    chainId: number,
    fromBlock?: number,
    toBlock?: number,
    ignoreUpdate = false
  ) {
    const network = await NetworkEntity.findOne({
      where: { chain_id: chainId },
    });
    if (!network) {
      throw `Invalid network: ${chainId}`;
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      const nextBlockNo = await this.getNextScanBlockNoFromDB(chainId);
      const client = initClient(network.http_url);
      const currentBlock = await client.eth.getBlockNumber();
      fromBlock = fromBlock || nextBlockNo || currentBlock;
      toBlock = toBlock || currentBlock;
      const chunkBlockRanges = chunkArray(fromBlock, toBlock);
      const topics = await this.eventService.getTopicsByChainId(chainId);

      if (topics.length !== 0) {
        const registedEvents = await this.eventService.getEventsByChain(
          chainId,
        );
        for (const blockRange of chunkBlockRanges) {
          console.log(
            `[ChainId: ${chainId}] Scanning event from block ${blockRange[0]} to block ${blockRange[1]}`,
          );
          const logs = await this.scanEventByTopics(
            client,
            blockRange[0],
            blockRange[1],
            topics,
          );
          for (const log of logs) {
            console.log(log);
            let topic = log.topics[0];
            let events = registedEvents.filter(
              (event) => event.event_topic === topic,
            );
            for (const event of events) {
              await this.eventMsgService.createEventMessage(
                event,
                log,
                queryRunner,
              );
            }
          }
          if (!ignoreUpdate) {
            await ProcessedBlockEntity.create({
              chain_id: chainId,
              block_no: blockRange[1],
            }).save();
          }
        }
      }
      console.log(`[ChainId: ${chainId}] Last scanned block no: ${toBlock}`);
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  async scanEventByTopics(
    client: Web3,
    fromBlock: number,
    toBlock: number,
    topics: string[],
  ) {
    const logs = await client.eth.getPastLogs({
      fromBlock,
      toBlock,
      topics: [topics],
    });
    return logs;
  }
}
