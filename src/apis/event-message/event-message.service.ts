import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { Injectable } from '@nestjs/common';
import { BlockTransactionData, LogData } from '../../commons/interfaces/index.js';
import { DataSource, DeleteResult, QueryRunner } from 'typeorm';
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
    blockData: BlockTransactionData,
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
        timestamp: blockData.timestamp.toString(),
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
          timestamp: message.timestamp,
        }
        // console.log(`Message Body: ${JSON.stringify(body)}`);
        this.producer.publish(null, routingKey, body);
      }
      await this._deleteDeliveredMessage(queryRunner, pendingMessages);

      console.log(`${new Date()}Finished send pending messages`);
    } catch (ex) {
      console.log("An error happened while trying to send RabbitMQ messages");
      console.log(ex);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async _deleteDeliveredMessage(queryRunner: QueryRunner, pendingMessages: EventMessageEntity[]) {
    if (pendingMessages.length === 0) { return; }

    await queryRunner.manager.createQueryBuilder(EventMessageEntity, 'event_messages')
      .whereInIds(pendingMessages.map((message) => message.id))
      .delete()
      .execute();
  }

  /**
   * Deletes delivered EventMessageEntity records that are older than two days.
   */
  async deleteDeliveredMessage(): Promise<void> {
    try {
      const currentTime = new Date();
      const twoDaysAgo = new Date(currentTime.getTime() - (2 * 24 * 60 * 60 * 1000));

      const deleteResult: DeleteResult = await EventMessageEntity.createQueryBuilder('event_messages')
        .where('event_messages.status = :status', {
          status: EventMessageStatus.DELIVERED,
        })
        .andWhere('event_messages.updated_at <= :twoDaysAgo', {
          twoDaysAgo: twoDaysAgo,
        })
        .delete()
        .execute();

      console.info(`${new Date()} - ${deleteResult.affected} records deleted.`);
    } catch (error) {
      console.error(error);
    }
  }
}
