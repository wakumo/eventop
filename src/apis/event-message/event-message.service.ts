import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { Injectable } from '@nestjs/common';
import { LogData } from '../../commons/interfaces/index.js';
import { DataSource, QueryRunner } from 'typeorm';
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

  createEventMessage(
    event: EventEntity,
    log: string | LogData,
  ) {
    // Any https provider is fine. Just put to avoid raise warning
    // Decode no need to connect to blockchain
    const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.ankr.com/eth'));
    let payload = {};

    // Return and not raise error if got decodeLog error
    try {
      payload = web3.eth.abi.decodeLog(
        JSON.parse(event.abi).inputs,
        log['data'],
        log['topics'],
      );
    } catch (error) {
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
        block_no: "ASC"
      }
    });

    if (!pendingMessages.length) return;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log(`${new Date()}Starting send ${pendingMessages.length} pending messages`);
      for (const message of pendingMessages) {

        // Next if message.event have contract_addresses settings
        // and message.contract_address not in contract_addresses
        if (
          message.event.contract_addresses.length > 0 &&
          !message.event.contract_addresses.includes(message.contract_address.toLowerCase())
        ) {
          continue;
        }

        const { service_name: serviceName, event_topic: eventTopic } = message.event;
        const routingKey = message.event.routing_key || `avacuscc.events.${serviceName}.${eventTopic}`;
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
      const deliveredMessages = pendingMessages.map((message) => { message.status = EventMessageStatus.DELIVERED; return message; });
      await queryRunner.manager.save(deliveredMessages);

      await this._deleteOldDeliveredMessage(queryRunner);
      console.log(`${new Date()}Finished send pending messages`);
    } catch (ex) {
      console.log("An error happened while trying to send RabbitMQ messages");
      console.log(ex);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete old delivered event messages that are more than one hour old.
   *
   * @param {QueryRunner} queryRunner - The TypeORM query runner.
   * @returns {Promise<void>} - A promise that resolves once the old messages are deleted.
   */
  private async _deleteOldDeliveredMessage(queryRunner: QueryRunner): Promise<void> {
    const currentTime = new Date();
    const oneHourAgo = new Date(currentTime.getTime() - (60 * 60 * 1000));

    // Delete old delivered event messages from the database
    await queryRunner.manager.createQueryBuilder(EventMessageEntity, 'event_messages')
      .where('event_messages.status = :status', { status: EventMessageStatus.DELIVERED })
      .andWhere('event_messages.updated_at < :oneHourAgo', { oneHourAgo })
      .delete()
      .execute();
  }

  async deleteDeliveredMessage(): Promise<void> {
    let queryRunner: QueryRunner;
    queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Delete all delivered event messsages
      // which are delivered to RabbitMq
      await queryRunner.manager.createQueryBuilder(EventMessageEntity, 'event_messages')
        .where('event_messages.status = :status', { status: EventMessageStatus.DELIVERED })
        .delete()
        .execute();
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
