jest.setTimeout(60000);

import "./mock-rabbitmq-spec.event-message";
import "../../../test/utils/mock-eventmq.module";

import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { EventMessageService } from './event-message.service';
import { DataSource } from "typeorm";
import { EventEntity, EventMessageEntity } from "../../entities";
import { EventMessageStatus } from "../../commons/enums";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EventMqMockModule } from "../../../test/utils/mock-eventmq.module";
import { getTopicFromEvent } from "../../commons/utils/blockchain.js";

describe('EventMessageService', () => {
  let service: EventMessageService;
  let connection: DataSource;
  let amqpConnection: AmqpConnection;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();

    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, EventMqMockModule],
      providers: [EventMessageService],
    }).compile();

    service = module.get<EventMessageService>(EventMessageService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  afterEach(async () => {
    await clearDB(connection)
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should send rabbitmq message", async () => {
    const createdCampaignEvent = {
      "service_name": "ctn",
      "name": "CampaignCreated(bytes32,bytes16,address,address,address,uint8,uint256,uint256)",
      "routing_key": "eventop.events.ctn.campaign.created",
      "abi": { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes16", "name": "salt", "type": "bytes16" }, { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "campaign", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "enum DataTypes.TOKEN_TYPE", "name": "tokenType", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFeePercent", "type": "uint256" } ], "name": "CampaignCreated", "type": "event" },
      "chain_ids": [97, 80001]
    }
    const eventTopic = getTopicFromEvent(createdCampaignEvent.name);
    await EventEntity.create({
      service_name: createdCampaignEvent.service_name,
      name: createdCampaignEvent.name,
      routing_key: createdCampaignEvent.routing_key,
      abi: JSON.stringify(createdCampaignEvent.abi),
      event_topic: eventTopic,
      chain_id: 97,
    }).save();
    const event = await EventEntity.findOne({ where: { routing_key: 'eventop.events.ctn.campaign.created' } });
    const eventMessage = await EventMessageEntity.create({
      payload: `{"message": "test_message"}`,
      tx_id: "0x25ec682fb51dd5d753defd0cc001b9d209da4899512a5340e806d2a790e34ec9",
      event_id: event.id,
      block_no: 10_000_000,
      status: EventMessageStatus.PENDING,
      contract_address: "0x0E1eF4b2a2f3D7eC00521648B690dC6D4f5d83ea",
      log_index: 1
    }).save();

    const eventMqRequest = jest.spyOn(amqpConnection, "publish");
    await service.sendPendingMessages();

    const eventMsgAfterSend = await EventMessageEntity.findOne({ where: { id: eventMessage.id } });

    // expect rabbitmq message request was called with correct routing key and body
    // and returned with true (other service has received and accepted message)
    expect(eventMqRequest).toHaveBeenCalledWith(
      "eventop-event-mq",
      "eventop.events.ctn.campaign.created",
      {
        id: eventMessage.id,
        payload: { "message": "test_message" },
        serviceName: 'ctn',
        eventName: "CampaignCreated(bytes32,bytes16,address,address,address,uint8,uint256,uint256)",
        eventTopic: '0x91ae3e686459a1bf51a7d31d88be264d8b0589b0729b28e83e73ba36d4329969',
        chainId: 97,
        txId: '0x25ec682fb51dd5d753defd0cc001b9d209da4899512a5340e806d2a790e34ec9',
        logIndex: 1,
        blockNo: '10000000',
        timestamp: null,
        contractAddress: '0x0E1eF4b2a2f3D7eC00521648B690dC6D4f5d83ea',
        from: null,
        to: null
      },
      undefined
    );
  })

  it("should mark messages as DELIVERED when KEEP_SENT_MESSAGES=1", async () => {
    process.env.KEEP_SENT_MESSAGES = '1';
    const event = await EventEntity.create({
      service_name: "test-service",
      name: "TestEvent()",
      routing_key: "eventop.events.test.event",
      abi: JSON.stringify({ "inputs": [], "name": "TestEvent", "type": "event" }),
      event_topic: "0xtest123",
      chain_id: 1,
    }).save();

    const message = await EventMessageEntity.create({
      payload: `{"test": "data"}`,
      tx_id: "0xtest456",
      event_id: event.id,
      block_no: 100,
      status: EventMessageStatus.PENDING,
      contract_address: "0xabc123",
      log_index: 0
    }).save();

    await service.sendPendingMessages();

    const updatedMessage = await EventMessageEntity.findOne({ where: { id: message.id } });
    expect(updatedMessage).toBeDefined();
    expect(updatedMessage.status).toBe(EventMessageStatus.DELIVERED);

    delete process.env.KEEP_SENT_MESSAGES;
  })

  it("should delete messages immediately when KEEP_SENT_MESSAGES=0 or unset", async () => {
    process.env.KEEP_SENT_MESSAGES = '0';

    const event = await EventEntity.create({
      service_name: "test-service",
      name: "TestEvent()",
      routing_key: "eventop.events.test.event",
      abi: JSON.stringify({ "inputs": [], "name": "TestEvent", "type": "event" }),
      event_topic: "0xtest123",
      chain_id: 1,
    }).save();

    const message = await EventMessageEntity.create({
      payload: `{"test": "data"}`,
      tx_id: "0xtest456",
      event_id: event.id,
      block_no: 100,
      status: EventMessageStatus.PENDING,
      contract_address: "0xabc123",
      log_index: 0
    }).save();

    await service.sendPendingMessages();

    const deletedMessage = await EventMessageEntity.findOne({ where: { id: message.id } });
    expect(deletedMessage).toBeNull();

    delete process.env.KEEP_SENT_MESSAGES;
  })

  it("should delete delivered messages older than configured retention period", async () => {
    process.env.EVENT_MESSAGE_RETENTION_HOURS = '24'; // 1 day
    const event = await EventEntity.create({
      service_name: "test-service",
      name: "TestEvent()",
      routing_key: "eventop.events.test.event",
      abi: JSON.stringify({ "inputs": [], "name": "TestEvent", "type": "event" }),
      event_topic: "0xtest123",
      chain_id: 1,
    }).save();

    // Create old delivered message (2 days ago)
    const oldMessage = await EventMessageEntity.create({
      payload: `{"test": "old"}`,
      tx_id: "0xold",
      event_id: event.id,
      block_no: 100,
      status: EventMessageStatus.DELIVERED,
      contract_address: "0xold",
      log_index: 0
    }).save();

    // Manually set updated_at to 2 days ago
    await EventMessageEntity.update(
      { id: oldMessage.id },
      { updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    );

    // Create recent delivered message (1 hour ago)
    const recentMessage = await EventMessageEntity.create({
      payload: `{"test": "recent"}`,
      tx_id: "0xrecent",
      event_id: event.id,
      block_no: 200,
      status: EventMessageStatus.DELIVERED,
      contract_address: "0xrecent",
      log_index: 0
    }).save();

    // Create pending message (should not be deleted)
    const pendingMessage = await EventMessageEntity.create({
      payload: `{"test": "pending"}`,
      tx_id: "0xpending",
      event_id: event.id,
      block_no: 300,
      status: EventMessageStatus.PENDING,
      contract_address: "0xpending",
      log_index: 0
    }).save();
    await EventMessageEntity.update(
      { id: pendingMessage.id },
      { updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    );

    await service.deleteDeliveredMessage();

    // Old delivered message should be deleted
    const oldMessageAfter = await EventMessageEntity.findOne({ where: { id: oldMessage.id } });
    expect(oldMessageAfter).toBeNull();

    // Recent delivered message should still exist
    const recentMessageAfter = await EventMessageEntity.findOne({ where: { id: recentMessage.id } });
    expect(recentMessageAfter).toBeDefined();
    expect(recentMessageAfter.status).toBe(EventMessageStatus.DELIVERED);

    // Pending message should still exist (not affected by cleanup)
    const pendingMessageAfter = await EventMessageEntity.findOne({ where: { id: pendingMessage.id } });
    expect(pendingMessageAfter).toBeDefined();
    expect(pendingMessageAfter.status).toBe(EventMessageStatus.PENDING);

    delete process.env.EVENT_MESSAGE_RETENTION_HOURS;
  })

  it("should respect custom retention period (12 hours)", async () => {
    process.env.EVENT_MESSAGE_RETENTION_HOURS = '12'; // 12 hours

    const event = await EventEntity.create({
      service_name: "test-service",
      name: "TestEvent()",
      routing_key: "eventop.events.test.event",
      abi: JSON.stringify({ "inputs": [], "name": "TestEvent", "type": "event" }),
      event_topic: "0xtest123",
      chain_id: 1,
    }).save();

    // Create message 18 hours old (should be deleted with 12h retention)
    const oldMessage = await EventMessageEntity.create({
      payload: `{"test": "old"}`,
      tx_id: "0xold18h",
      event_id: event.id,
      block_no: 100,
      status: EventMessageStatus.DELIVERED,
      contract_address: "0xold",
      log_index: 0
    }).save();
    await EventMessageEntity.update(
      { id: oldMessage.id },
      { updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000) } // 18 hours ago
    );

    // Create message 6 hours old (should NOT be deleted with 12h retention)
    const recentMessage = await EventMessageEntity.create({
      payload: `{"test": "recent"}`,
      tx_id: "0xrecent6h",
      event_id: event.id,
      block_no: 200,
      status: EventMessageStatus.DELIVERED,
      contract_address: "0xrecent",
      log_index: 0
    }).save();
    await EventMessageEntity.update(
      { id: recentMessage.id },
      { updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000) } // 6 hours ago
    );

    await service.deleteDeliveredMessage();

    // 18h old message should be deleted
    const oldMessageAfter = await EventMessageEntity.findOne({ where: { id: oldMessage.id } });
    expect(oldMessageAfter).toBeNull();

    // 6h old message should still exist
    const recentMessageAfter = await EventMessageEntity.findOne({ where: { id: recentMessage.id } });
    expect(recentMessageAfter).toBeDefined();

    delete process.env.EVENT_MESSAGE_RETENTION_HOURS;
  })
});
