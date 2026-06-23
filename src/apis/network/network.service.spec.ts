import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { _fnGetPastLogs } from '../../../test/setup-web3-mock.js';
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
} from '../../../test/utils.js';
import { NetworkEntity } from '../../entities/network.entity.js';
import { NetworkService } from './network.service.js';

describe('NetworkService', () => {
  let service: NetworkService;
  let connection: DataSource;

  beforeEach(async () => {
    connection = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES],
      providers: [NetworkService],
    }).compile();

    service = module.get<NetworkService>(NetworkService);
    _fnGetPastLogs.mockResolvedValue([]);
  });

  afterEach(async () => {
    _fnGetPastLogs.mockReset();
    await clearDB(connection);
    await connection.destroy();
  });

  it('updates only http_url when switching nodes so a stale entity does not overwrite is_stop_scan', async () => {
    const network = await NetworkEntity.create({
      chain_id: 97,
      http_url: 'https://old-node.example',
      node_urls: ['https://old-node.example', 'https://new-node.example'],
      is_stop_scan: false,
    }).save();

    await NetworkEntity.update(network.id, { is_stop_scan: true });

    await service.pickAndUpdateAvailableNode(network, ['https://old-node.example']);

    const updatedNetwork = await NetworkEntity.findOneByOrFail({ id: network.id });
    expect(updatedNetwork.http_url).toBe('https://new-node.example');
    expect(updatedNetwork.is_stop_scan).toBe(true);
  });
});
