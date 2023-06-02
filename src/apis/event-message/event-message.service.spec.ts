jest.setTimeout(60000);

import "./mock-rabbitmq-spec.event-message";
import "../../../test/utils/mock-eventmq.module";

import { Test, TestingModule } from '@nestjs/testing';
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
  seedTestEvents,
} from '../../../test/utils.js';
import { EventMessageService } from './event-message.service';
import { DataSource, QueryRunner } from "typeorm";
import { EventEntity, EventMessageEntity } from "../../entities";
import { EventMessageStatus } from "../../commons/enums";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EventMqMockModule } from "../../../test/utils/mock-eventmq.module";

describe('EventMessageService', () => {
  let service: EventMessageService;
  let connection: DataSource;
  let queryRunner: QueryRunner;
  let amqpConnection: AmqpConnection;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, EventMqMockModule],
      providers: [EventMessageService],
    }).compile();

    service = module.get<EventMessageService>(EventMessageService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
    await seedTestEvents(queryRunner);
  });

  afterEach(async () => {
    await clearDB(connection)
    await queryRunner.release();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should send rabbitmq message", async () => {
    const event = await EventEntity.findOne({ where: {
      routing_key: "eventop.events.balance.transfer_erc20",
      chain_id: 1,
    }});

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
      "eventop_exchange",
      "eventop.events.balance.transfer_erc20",
      {
        id: eventMessage.id,
        payload: { "message": "test_message" },
        serviceName: 'balance',
        eventName: 'Transfer(address,address,uint256)',
        eventTopic: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        chainId: 1,
        txId: '0x25ec682fb51dd5d753defd0cc001b9d209da4899512a5340e806d2a790e34ec9',
        logIndex: 1,
        blockNo: '10000000',
        contractAddress: '0x0E1eF4b2a2f3D7eC00521648B690dC6D4f5d83ea'
      },
      undefined
    );
    // Delete after sent
    expect(eventMsgAfterSend).toBe(null);
  })
});
