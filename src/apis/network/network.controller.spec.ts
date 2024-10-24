import { Test, TestingModule } from '@nestjs/testing';
import { NetworkController } from './network.controller.js';
import { NetworkService } from './network.service.js';
import {
  getSynchronizeConnection,
  clearDB,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
describe('NetworkController', () => {
  let controller: NetworkController;
  let connection: DataSource;
  let app: INestApplication;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES],
      controllers: [NetworkController],
      providers: [NetworkService],
    }).compile();
    controller = module.get<NetworkController>(NetworkController);
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
});