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
      "routing_key": "avacuscc.events.ctn.campaign.created",
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
    const event = await EventEntity.findOne({ where: { routing_key: 'avacuscc.events.ctn.campaign.created' } });
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
      "avacuscc-event-mq",
      "avacuscc.events.ctn.campaign.created",
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
});
