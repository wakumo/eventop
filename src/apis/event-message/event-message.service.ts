import { Injectable } from '@nestjs/common';
import { LogData } from '../../commons/interfaces/index.js';
import { DataSource, QueryRunner } from 'typeorm';
import Web3EthAbi from 'web3-eth-abi';
import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { EventEntity } from '../../entities/event.entity.js';

@Injectable()
export class EventMessageService {
  constructor(private connection: DataSource) {}

  async findEventMessage(
    eventId: number,
    transactionId: string,
    logIndex: number,
  ) {
    const message = await EventMessageEntity.createQueryBuilder(
      'event_messages',
    )
      .where('event_messages.event_id = :eventId', { eventId: eventId })
      .andWhere('event_messages.tx_id = :txId', { txId: transactionId })
      .andWhere('event_messages.log_index = :logIndex', { logIndex: logIndex })
      .getOne();

    return message;
  }

  async createEventMessage(
    event: EventEntity,
    log: LogData,
    queryRunner?: QueryRunner,
  ) {
    const msg = await this.findEventMessage(
      event.id,
      log.transactionHash,
      log.logIndex,
    );
    if (msg) {
      return;
    }
    let isParentQueryRunner = true;
    try {
      if (!queryRunner) {
        isParentQueryRunner = false;
        queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
      }
      await queryRunner.startTransaction();

      const payload = Web3EthAbi.decodeLog(
        JSON.parse(event.abi).inputs,
        log.data,
        log.topics,
      );
      const message = EventMessageEntity.create({
        event_id: event.id,
        payload: JSON.stringify(payload),
        tx_id: log.transactionHash,
        log_index: log.logIndex,
        block_no: log.blockNumber,
        contract_address: log.address,
      });
      await queryRunner.manager.save(message);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (!isParentQueryRunner) {
        await queryRunner.release();
      }
    }
  }
}
