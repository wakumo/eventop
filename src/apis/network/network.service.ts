import { Injectable } from '@nestjs/common';
import { NetworkEntity } from '../../entities/network.entity.js';

@Injectable()
export class NetworkService {

  async findAll() {
    const networks = await NetworkEntity.createQueryBuilder('networks')
      .leftJoinAndSelect('networks.processed_block', 'processed_block')
      .orderBy('networks.chain_id', 'DESC')
      .getMany();
    return networks;
  }
}
