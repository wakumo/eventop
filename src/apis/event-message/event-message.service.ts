import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { Injectable } from '@nestjs/common';
import { BlockCoinTransfer, BlockTransactionData, LogData } from '../../commons/interfaces/index.js';
import { DataSource, DeleteResult, QueryRunner } from 'typeorm';
import Web3 from 'web3';
import { EventEntity } from '../../entities/event.entity.js';
import { EventMessageStatus } from "../../commons/enums/event_message_status.enum.js";
import { EventMqProducer } from "../../rabbitmq/services/eventmq-producer.service.js";
import { COIN_TRANSFER_EVENT } from '../../config/constants.js';

@Injectable()
export class EventMessageService {
  private readonly web3: Web3;

  constructor(
    private connection: DataSource,
    private readonly producer: EventMqProducer
  ) {
    // Any https provider is fine. Just put to avoid raise warning
    // Decode no need to connect to blockchain
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.ankr.com/eth'));
  }

  createEventMessage(
    event: EventEntity,
    log: string | LogData,
    blockData: BlockTransactionData,
  ) {
    let payload = {};
    // Return and not raise error if got decodeLog error
    try {
      payload = this.web3.eth.abi.decodeLog(
        JSON.parse(event.abi).inputs,
        log['data'],
        log['topics'],
      );
    } catch (error) {
      return null;
    }

    const transactionHash = log['transactionHash'].toLowerCase();
    try {
      let from, to;
      if (blockData?.transactionsByHash && blockData?.transactionsByHash[transactionHash]) {
        from = blockData.transactionsByHash[transactionHash]['from'];
        to = blockData.transactionsByHash[transactionHash]['to'];
      }
      return EventMessageEntity.create({
        event_id: event.id,
        payload: JSON.stringify(payload),
        tx_id: transactionHash,
        log_index: log['logIndex'],
        block_no: log['blockNumber'],
        contract_address: log['address'],
        timestamp: blockData.timestamp.toString(),
        from,
        to,
      });
    } catch (error) {
      throw error;
    }
  }

  async createCoinTransferEventMessage(
    chainId: number,
    coinTransfers: BlockCoinTransfer[],
    blockDataMap: { [blockNo: number]: BlockTransactionData; }
  ) {
    if (!coinTransfers.length) return [];

    // Find all coin transfer events for the given chainId
    const coinTransferEvents = await EventEntity.find({ where: { name: COIN_TRANSFER_EVENT, chain_id: chainId } });
    if (!coinTransferEvents.length) {
      throw new Error('Coin transfer events not found');
    }

    let messages: EventMessageEntity[] = [];
    for (const event of coinTransferEvents) {
      const newMessages = coinTransfers.map((coinTransfer) => {
        return EventMessageEntity.create({
          event_id: event.id,
          payload: JSON.stringify(coinTransfer),
          tx_id: coinTransfer.txid,
          block_no: coinTransfer.block_number,
          timestamp: blockDataMap[coinTransfer.block_number].timestamp.toString(),
        });
      });
      if (newMessages.length) messages.push(...newMessages);
    }

    return messages;
  }

  async sendPendingMessages(): Promise<void> {
    const pendingMessages = await EventMessageEntity.find({
      where: { status: EventMessageStatus.PENDING },
      relations: ["event"], skip: 0, take: 5000,
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
        const routingKey = message.event.routing_key || `eventop.events.${serviceName}.${eventTopic}`;
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
          from: message.from,
          to: message.to,
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
