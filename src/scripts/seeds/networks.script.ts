import { Command, CommandRunner } from 'nest-commander';
import { NetworkEntity } from '../../entities/index.js';
import { QueryRunner } from 'typeorm';
import { initializeConnection } from '../../../connection.js';

interface Network {
  chain_id: number;
  http_url: string;
}

const networks: Network[] = [
  {
    chain_id: 1,
    http_url: 'https://cloudflare-eth.com',
  },
  {
    chain_id: 10,
    http_url: 'https://mainnet.optimism.io',
  },
  {
    chain_id: 56,
    http_url: 'https://bsc-dataseed.binance.org',
  },
  {
    chain_id: 97,
    http_url: 'https://bsctestapi.terminet.io/rpc',
  },
  {
    chain_id: 137,
    http_url: 'https://polygon-rpc.com',
  },
  {
    chain_id: 42161,
    http_url: 'https://arb1.arbitrum.io/rpc',
  },
  {
    chain_id: 80001,
    http_url: 'https://rpc.ankr.com/polygon_mumbai',
  },
  {
    chain_id: 5,
    http_url: 'https://rpc.ankr.com/eth_goerli',
  },
];

async function createNetwork(queryRunner: QueryRunner, networkBody: Network) {
  let network = await NetworkEntity.findOne({
    where: {
      chain_id: networkBody.chain_id,
    },
  });

  if (!network) {
    network = NetworkEntity.create({
      ...networkBody,
    });
    await queryRunner.manager.save(network);
  } else {
    await queryRunner.manager.update(NetworkEntity, network.id, {
      ...networkBody,
    });
  }
}

@Command({ name: 'seed:networks', description: 'Seed blockchain networks' })
export class NetworkSeed extends CommandRunner {
  constructor() {
    super();
  }

  async run(): Promise<void> {
    const connection = await initializeConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const networkBody of networks) {
        await createNetwork(queryRunner, networkBody);
      }
      await queryRunner.commitTransaction();
    } catch (ex) {
      await queryRunner.rollbackTransaction();
      console.log(ex);
      throw ex;
    } finally {
      await queryRunner.release();
    }
  }
}
