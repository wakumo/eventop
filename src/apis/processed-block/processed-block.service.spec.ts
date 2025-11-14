import './mock-web3-spec.processed-block.js';
import './mock-rabbitmq-spec.event-message';
import '../../../test/utils/mock-eventmq.module';
import '../../commons/utils/bigint-monkey-patching.js';

import { when } from 'jest-when';
import { DataSource } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';

import {
  airdropCreatedPayload,
  coinTransferPayload,
  communityCreatedPayload,
  traceBlock_97_400000
} from '../../../test/fixtures/index.js';
import { clearDB, getSynchronizeConnection, IMPORT_MODULES } from '../../../test/utils.js';
import { EventMessageEntity } from '../../entities/event-message.entity.js';
import { EventEntity } from '../../entities/event.entity.js';
import { NetworkEntity } from '../../entities/network.entity.js';
import { ProcessedBlockEntity } from '../../entities/processed-block.entity.js';
import { EventMessageService } from '../event-message/event-message.service.js';
import { EventsService } from '../events/events.service.js';
import { NetworkService } from '../network/network.service.js';
import { ProcessedBlockService } from './processed-block.service.js';
import { EventMqMockModule } from '../../../test/utils/mock-eventmq.module.js';
import { _getTraceBlockRequestPayload, fnGetBlock, fnGetBlockNumber, fnGetPastLogs, mockFetch } from './mock-web3-spec.processed-block.js';
import { JsonRpcClient } from '../../commons/utils/json-rpc-client.js';

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

    await NetworkEntity.create({ chain_id: 97, http_url: 'https://data-seed-prebsc-1-s3.bnbchain.org:8545' }).save();
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
    jest.spyOn(JsonRpcClient.prototype, 'getCurrentBlock').mockImplementation(async () => {
      return 24639471;
    });
    await service.scanBlockEvents({ chain_id: 97 });
    const messages = await EventMessageEntity.find();
    const processedBlock = await ProcessedBlockEntity.createQueryBuilder(
      'processed_block',
    )
      .where('processed_block.chain_id = :chainId', { chainId: 97 })
      .orderBy('processed_block.block_no', 'DESC')
      .getOne();

    // With chunk size 5: 101 blocks ÷ 5 = 21 chunks
    // Mock returns 1 log per chunk (first block only) = 21 logs
    // But last chunk (24639471) returns empty array, so we get 20 messages
    expect(messages.length).toEqual(20);
    expect(processedBlock.block_no).toEqual(24639471);
  });

  describe('Orphan block', () => {
    beforeEach(async () => {
      jest.spyOn(JsonRpcClient.prototype, 'getCurrentBlock').mockImplementation(async () => {
        return 24639471;
      });
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
      jest.spyOn(JsonRpcClient.prototype, 'getCurrentBlock').mockImplementation(async () => {
        return 400000;
      });
      mockFetch.mockImplementation((url, options) => {
        if (url === 'https://data-seed-prebsc-1-s3.bnbchain.org:8545' && options?.method === 'POST') {
          const body = typeof options.body === 'string' ? options.body : '';
          if (body.includes('trace_block') && body.includes('"id":400000')) {
            return Promise.resolve({
              json: () => Promise.resolve(traceBlock_97_400000),
            });
          }
          if (body.includes('trace_block') && /"id":(40000[1-9]|4000[1-4][0-9]|400049)/.test(body)) {
            return Promise.resolve({
              json: () => Promise.resolve({ result: [] }),
            });
          }
        }
        return Promise.resolve({
          json: () => Promise.resolve({ result: [] }),
        });
      });
      when(fnGetBlock).calledWith(expect.any(Number)).mockImplementation((blockNo) => {
        return { number: blockNo, timestamp: 1703134791 }
      });
      for (let block = 400000; block <= 400049; block += 5) {
        const toBlock = Math.min(block + 4, 400049);
        const fromBlockHex = '0x' + block.toString(16);
        const toBlockHex = '0x' + toBlock.toString(16);
        when(fnGetPastLogs)
          .calledWith({
            fromBlock: fromBlockHex,
            toBlock: toBlockHex,
            topics: expect.anything(),
          })
          .mockReturnValue([]);
      }
    });

    afterEach(() => {
      mockFetch.mockReset();
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
