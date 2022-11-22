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
import { EventMessageEntity } from "../../entities";
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
    const eventMessage = await EventMessageEntity.create({
      payload: `{"message": "test_message"}`,
      tx_id: "0x25ec682fb51dd5d753defd0cc001b9d209da4899512a5340e806d2a790e34ec9",
      event_id: 1,
      block_no: 10_000_000,
      status: EventMessageStatus.PENDING,
      contract_address: "0x0E1eF4b2a2f3D7eC00521648B690dC6D4f5d83ea",
      log_index: 1
    }).save();

    const eventMqRequest = jest.spyOn(amqpConnection, "request");
    await service.sendPendingMessages();

    const eventMsgAfterSend = await EventMessageEntity.findOne({ where: { id: eventMessage.id } });

    // expect rabbitmq message request was called with correct routing key and body
    // and returned with true (other service has received and accepted message)
    expect(eventMqRequest).toHaveBeenCalledWith({
      exchange: "avacuscc-event-mq",
      routingKey: "avacuscc.events.ctn.0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb",
      payload: {
        payload: '{"message": "test_message"}',
        serviceName: 'ctn',
        eventName: 'AirDropCreated(bytes16,address,address,address,uint8)',
        eventTopic: '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb',
        chainId: 97,
        txId: '0x25ec682fb51dd5d753defd0cc001b9d209da4899512a5340e806d2a790e34ec9',
        logIndex: 1,
        blockNo: '10000000',
        contractAddress: '0x0E1eF4b2a2f3D7eC00521648B690dC6D4f5d83ea'
      },
      timeout: 60000
    });
    expect(eventMqRequest).toHaveReturnedWith(true);
    // and then event status to be changed to delivered
    expect(eventMsgAfterSend.status).toBe(EventMessageStatus.DELIVERED);
  })
});
