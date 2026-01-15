import { Injectable, Logger } from '@nestjs/common';
import { NetworkEntity } from '../../entities/network.entity.js';
import { initClient } from '../../commons/utils/blockchain.js';
import { maskApiKey } from '../../commons/utils/index.js';
import { NoAvailableNodeException } from '../../commons/exceptions/not_available_node.exception.js';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  constructor() {}

  // @dev: To check if the node is available
  // getBlockNumber is not guaranteed to make sure the node is available
  // So we use getPastLogs to check if the node is available
  // @param: url: string
  private async isAvailableNode(url: string) {
    try {
      let client = initClient(url);
      await client.eth.getPastLogs({
        fromBlock: 'latest',
        toBlock: 'latest',
        topics: [['0x6178e95c138f06036cdc07a49ed6a3d23008969fa143baeceb037ebae22e8d14']], // any topic is ok
      });

      return { url: url, isAvailable: true };
    } catch (ex) {
      console.error(ex);
    }

    return { url: url, isAvailable: false };
  }

  async pickAndUpdateAvailableNode(network: NetworkEntity, excludedUrls?: string[]): Promise<NetworkEntity> {
    // Update new available node url if current main node is not available
    let nodeCheckPromises = [];
    // Filter out excluded URLs from node URLs if they exist
    let nodeUrls = excludedUrls ? network.node_urls.filter(url => !excludedUrls.includes(url)) : network.node_urls;

    console.info(`${new Date()} - Checking ${nodeUrls.length} nodes for chain ${network.chain_id}`);

    for (let nodeUrl of nodeUrls) {
      nodeCheckPromises.push(this.isAvailableNode(nodeUrl));
    }
    const nodeStatuses = await Promise.all(nodeCheckPromises);
    const availableNodes = nodeStatuses.filter((node) => node.isAvailable);

    if (availableNodes.length > 0) {
      const randomNodeIndex = Math.floor(Math.random() * availableNodes.length);
      network.http_url = availableNodes[randomNodeIndex].url;
      network = await NetworkEntity.save(network);

      console.info(`${new Date()} - Switched to: ${maskApiKey(network.http_url)} (${availableNodes.length}/${nodeUrls.length} available)`);

      return network;
    } else {
      console.error(`${new Date()} - No available nodes found out of ${nodeUrls.length} nodes`);
      throw new NoAvailableNodeException();
    }
  }

  async findAll() {
    const networks = await NetworkEntity.createQueryBuilder('networks')
      .leftJoinAndSelect('networks.processed_block', 'processed_block')
      .orderBy('networks.chain_id', 'DESC')
      .getMany();
    return networks;
  }

  /**
   * Updates the is_stop_scan flag for all networks.
   *
   * @param shouldStop true to stop scanning, false to enable scanning
   * @returns The number of affected networks
   */
  async updateAllNetworksStopScan(shouldStop: boolean): Promise<number> {
    const result = await NetworkEntity.createQueryBuilder()
      .update(NetworkEntity)
      .set({ is_stop_scan: shouldStop })
      .execute();

    const affectedCount = result.affected || 0;
    this.logger.log(
      `Updated is_stop_scan=${shouldStop} for ${affectedCount} network(s)`
    );

    return affectedCount;
  }
}
