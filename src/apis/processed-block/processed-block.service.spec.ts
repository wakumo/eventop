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
  coinTransferPayload,
  communityCreatedPayload,
  traceBlock_97_400000,
} from '../../../test/fixtures/index.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { ProcessedBlockEntity } from '../../entities/processed-block.entity.js';
import { NetworkEntity } from '../../entities/network.entity.js';
import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { EventMqMockModule } from '../../../test/utils/mock-eventmq.module';
import { NetworkService } from '../network/network.service.js';
import { when } from 'jest-when';
import { _getTraceBlockRequestPayload, fnGetBlock, fnGetBlockNumber, mockFetch } from './mock-web3-spec.processed-block.js';

describe('ProcessedBlockService', () => {
  let service: ProcessedBlockService;
  let connection: DataSource;
  let proccessedBlock: ProcessedBlockEntity;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, EventMqMockModule],
      providers: [
        ProcessedBlockService,
        EventsService,
        EventMessageService,
        NetworkService,
      ],
    }).compile();

    service = module.get<ProcessedBlockService>(ProcessedBlockService);

    await EventEntity.create({ ...communityCreatedPayload }).save();
    await EventEntity.create({ ...airdropCreatedPayload }).save();
    await EventEntity.create({ ...coinTransferPayload }).save();

    await NetworkEntity.create({ chain_id: 97, http_url: 'https://rpc.ankr.com/bsc_testnet_chapel' }).save();
    proccessedBlock = await ProcessedBlockEntity.create({
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
    await service.scanBlockEvents({ chain_id: 97 });
    const messages = await EventMessageEntity.find();
    const processedBlock = await ProcessedBlockEntity.createQueryBuilder(
      'processed_block',
    )
      .where('processed_block.chain_id = :chainId', { chainId: 97 })
      .orderBy('processed_block.block_no', 'DESC')
      .getOne();

    expect(messages.length).toEqual(50);
    expect(processedBlock.block_no).toEqual(24639471);
  });

  describe('Orphan block', () => {
    beforeEach(async () => {
      when(fnGetBlock).calledWith(expect.any(Number)).mockImplementation((blockNo) => {
        return { number: blockNo, timestamp: 1703134791, parentHash: '0x2222' }
      });
      proccessedBlock.block_hash = '0x1111';
      await proccessedBlock.save();
    });

    it('should raise error and rescan 128 blocks', async () => {
      await service.scanBlockEvents({ chain_id: 97 });
      const messages = await EventMessageEntity.find();
      const processedBlock = await ProcessedBlockEntity.createQueryBuilder(
        'processed_block',
      )
        .where('processed_block.chain_id = :chainId', { chainId: 97 })
        .orderBy('processed_block.block_no', 'DESC')
        .getOne();

      expect(messages.length).toEqual(0);
      expect(processedBlock.block_no).toEqual(24639370 - 128);
    });
  });

  describe('Detect coin transfer in contract interaction', () => {
    beforeEach(async () => {
      await ProcessedBlockEntity.update(proccessedBlock.id, { block_no: 399999 });
      when(fnGetBlockNumber).mockReturnValue(400000);
      when(mockFetch).calledWith('https://rpc.ankr.com/bsc_testnet_chapel', _getTraceBlockRequestPayload(400000)).mockResolvedValue({
        json: () => Promise.resolve(traceBlock_97_400000),
      });
      when(fnGetBlock).calledWith(expect.any(Number)).mockImplementation((blockNo) => {
        return { number: blockNo, timestamp: 1703134791 }
      });
    });

    it('should create 2 messages', async () => {
      await service.scanBlockEvents({ chain_id: 97 });
      const messages = await EventMessageEntity.find();

      expect(messages.length).toEqual(2);
      expect(messages.find((m) => m.tx_id === '0x2c6bad278d82dd3600b960bd07f9052f4f24bb26cbac84bf85ba38a093f37d36')).toEqual(expect.objectContaining({
        block_no: "400000",
        payload: "{\"block_number\":400000,\"addresses\":[\"0xf5e8a439c599205c1ab06b535de46681aed1007a\",\"0xc0eb57bf242f8dd78a1aaa0684b15fada79b6f85\"],\"txid\":\"0x2c6bad278d82dd3600b960bd07f9052f4f24bb26cbac84bf85ba38a093f37d36\"}",
        tx_id: "0x2c6bad278d82dd3600b960bd07f9052f4f24bb26cbac84bf85ba38a093f37d36",
      }));
      expect(messages.find((m) => m.tx_id === '0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35')).toEqual(expect.objectContaining({
        block_no: "400000",
        payload: "{\"block_number\":400000,\"addresses\":[\"0x40d3256eb0babe89f0ea54edaa398513136612f5\",\"0x0000000000000000000000000000000000001000\",\"0x0000000000000000000000000000000000001002\",\"0x000000000000000000000000000000000000dead\"],\"txid\":\"0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35\"}",
        tx_id: "0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35",
      }));
    });
  });
});
