import './mock-web3-spec.processed-block.js';
import './mock-rabbitmq-spec.event-message';
import '../../../test/utils/mock-eventmq.module';
import '../../commons/utils/bigint-monkey-patching.js';

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProcessedBlockService } from './processed-block.service.js';
import {
  getSynchronizeConnection,
  clearDB,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { EventsService } from '../events/events.service.js';
import { EventEntity } from '../../entities/event.entity.js';
import {
  airdropCreatedPayload,
  communityCreatedPayload,
} from '../../../test/fixtures/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { ProcessedBlockEntity } from '../../entities/processed-block.entity.js';
import { NetworkEntity } from '../../entities/network.entity.js';
import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { EventMqMockModule } from '../../../test/utils/mock-eventmq.module';

describe('ProcessedBlockService', () => {
  let service: ProcessedBlockService;
  let connection: DataSource;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, EventMqMockModule],
      providers: [ProcessedBlockService, EventsService, EventMessageService],
    }).compile();

    service = module.get<ProcessedBlockService>(ProcessedBlockService);
    await EventEntity.create({ ...communityCreatedPayload }).save();
    await EventEntity.create({ ...airdropCreatedPayload }).save();
    await NetworkEntity.create({ chain_id: 97 }).save();
    await ProcessedBlockEntity.create({
      chain_id: 97,
      block_no: 24639370,
    }).save();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(async () => {
    await clearDB(connection);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should be scan CommunityCreated and AirdropCreated events', async () => {
    await service.scanBlockEvents(97);
    await service.scanBlockEvents(97); // recheck
    const messages = await EventMessageEntity.find();
    const processedBlock = await ProcessedBlockEntity.createQueryBuilder(
      'processed_block',
    )
    .where('processed_block.chain_id = :chainId', { chainId: 97 })
    .orderBy('processed_block.block_no', 'DESC')
    .getOne();
    expect(messages.length).toEqual(2);
    expect(processedBlock.block_no).toEqual(24639471);
  });
});
