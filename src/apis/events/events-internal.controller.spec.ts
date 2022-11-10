import { Test, TestingModule } from '@nestjs/testing';
import { EventsInternalController } from './events-internal.controller.js';
import { EventsService } from './events.service.js';
import { DataSource } from 'typeorm';
import {
  getSynchronizeConnection,
  clearDB,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { eventPayload } from '../../../test/fixtures/index.js';

jest.setTimeout(60000);

describe('EventsInternalController', () => {
  let controller: EventsInternalController;
  let connection: DataSource;
  // let eventService: EventsService;
  let app: INestApplication;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES],
      controllers: [EventsInternalController],
      providers: [EventsService],
    }).compile();

    controller = module.get<EventsInternalController>(EventsInternalController);
    // eventService = module.get<EventsService>(EventsService);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await connection.destroy();
    await app.close();
  });

  afterEach(async () => {
    await clearDB(connection);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /internal/events', () => {
    describe('register an events to receive message', () => {
      it(`should return 201 status`, async () => {
        const res = await request(app.getHttpServer())
          .post('/internal/events')
          .send(eventPayload);

        expect(res.body.data.service_name).toEqual('sns');
        expect(res.body.data.event_topic).toEqual(
          '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1',
        );
        expect(res.body.code).toEqual(201);
      });
    });
  });
});
