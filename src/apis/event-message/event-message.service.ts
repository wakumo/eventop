import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { Injectable } from '@nestjs/common';
import { LogData } from '../../commons/interfaces/index.js';
import { DataSource, In, QueryRunner } from 'typeorm';
import Web3 from 'web3';
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
  ) {
    // const msg = await this.findEventMessage(
    //   event.id,
    //   log['transactionHash'],
    //   log['logIndex'],
    // );
    // // Return if msg is existed
    // if (msg) { return null; }

    const web3 = new Web3();
    let payload = {};

    // Return and not raise error if got decodeLog error
    try {
      payload = web3.eth.abi.decodeLog(
        JSON.parse(event.abi).inputs,
        log['data'],
        log['topics'],
      );
    } catch (error) {
      console.log(error);
      return null;
    }

    try {
      return EventMessageEntity.create({
        event_id: event.id,
        payload: JSON.stringify(payload),
        tx_id: log['transactionHash'],
        log_index: log['logIndex'],
        block_no: log['blockNumber'],
        contract_address: log['address'],
      });
    } catch (error) {
      throw error;
    }
  }

  async sendPendingMessages(): Promise<void> {
    const pendingMessages = await EventMessageEntity.find({
      where: { status: EventMessageStatus.PENDING },
      relations: ["event"], skip: 0, take: 1000,
      order: {
        created_at: "ASC"
      }
    });

    if (!pendingMessages.length) return;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    let messages = [];

    try {
      for (const message of pendingMessages) {
        const { service_name: serviceName, event_topic: eventTopic } = message.event;
        const routingKey = `avacuscc.events.${serviceName}.${eventTopic}`;

        console.log(`serviceName: ${serviceName}, routingKey: ${routingKey}`);

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
        // console.log(`Message Body: ${JSON.stringify(body)}`);
        this.producer.publish(null, routingKey, body);
      }
      await queryRunner.manager.delete(EventMessageEntity, pendingMessages);
    } catch (ex) {
      console.log("An error happened while trying to send RabbitMQ messages");
      console.log(ex);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
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
