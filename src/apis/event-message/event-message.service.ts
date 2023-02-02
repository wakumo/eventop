import { TRANSFERED_EVENT_TOPIC } from '../../config/constants.js';
import { Injectable } from '@nestjs/common';
import { LogData } from '../../commons/interfaces/index.js';
import { DataSource, In, QueryRunner } from 'typeorm';
import Web3 from 'web3';
import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { EventEntity } from '../../entities/event.entity.js';
import { EventMessageStatus } from "../../commons/enums/event_message_status.enum.js";
import { EventMqProducer } from "../../rabbitmq/services/eventmq-producer.service.js";

@Injectable()
export class EventMessageService {
  constructor(
    private connection: DataSource,
    private readonly producer: EventMqProducer
  ) { }

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
    log: string | LogData,
    queryRunner?: QueryRunner,
  ) {
    const msg = await this.findEventMessage(
      event.id,
      log['transactionHash'],
      log['logIndex'],
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
      const web3 = new Web3();
      const payload = web3.eth.abi.decodeLog(
        JSON.parse(event.abi).inputs,
        log['data'],
        log['topics'],
      );
      const message = EventMessageEntity.create({
        event_id: event.id,
        payload: JSON.stringify(payload),
        tx_id: log['transactionHash'],
        log_index: log['logIndex'],
        block_no: log['blockNumber'],
        contract_address: log['address'],
      });
      await queryRunner.manager.save(message);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      if (!isParentQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  async sendPendingMessages(): Promise<void> {
    const messages = await EventMessageEntity.find({
      where: { status: EventMessageStatus.PENDING },
      relations: ["event"], skip: 0, take: 1000,
      order: {
        created_at: "ASC"
      }
    });
    if (!messages.length) return;

    try {
      for (const message of messages) {
        const { service_name: serviceName, event_topic: eventTopic } = message.event;
        console.log(`serviceName: ${serviceName}`);
        const routingKey = `avacuscc.events.${serviceName}.${eventTopic}`;
        console.log(`RoutingKey: ${routingKey}`);
        const body = {
          id: message.id,
          payload: JSON.parse(message.payload),
          serviceName: serviceName,
          eventName: message.event.name,
          eventTopic: eventTopic,
          chainId: message.event.chain_id,
          txId: message.tx_id,
          logIndex: message.log_index,
          blockNo: message.block_no,
          contractAddress: message.contract_address,
        }
        console.log(`Message Body: ${JSON.stringify(body)}`);
        this.producer.publish(null, routingKey, body);
        message.status = EventMessageStatus.DELIVERED;
        await message.save();
      }
    } catch (ex) {
      console.log("An error happened while trying to send RabbitMQ messages");
      console.log(ex);
    }
  }

  async deleteDeliveredMessage(): Promise<void> {
    let queryRunner: QueryRunner;
    queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Delete all delivered event messsages
      // which are delivered to RabbitMq
      const deliveredMessages = await queryRunner.manager.createQueryBuilder(EventMessageEntity, 'event_messages')
        .where('event_messages.status = :status', { status: EventMessageStatus.DELIVERED })
        .delete()
        .execute();
      await queryRunner.commitTransaction();

      console.info(`Deleted all delivered messages: ${deliveredMessages.affected}`);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
