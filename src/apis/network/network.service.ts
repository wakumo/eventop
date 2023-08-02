import { Injectable } from '@nestjs/common';
import { NetworkEntity } from '../../entities/network.entity.js';
import { initClient } from '../../commons/utils/blockchain.js';
import { NoAvailableNodeException } from '../../commons/exceptions/not_available_node.exception.js';

@Injectable()
export class NetworkService {
  constructor() {}

  // @dev: To check if the node is available
  // getBlockNumber is not guaranteed to make sure the node is available
  // So we use getPastLogs to check if the node is available
  // @param: url: string
  private async isAvailableNode(url: string) {
    let client = initClient(url);

    try {
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

  async validateAvailableNodes(network: NetworkEntity): Promise<NetworkEntity> {
    try {
      // Return current network if main node is available
      const nodeStatus = await this.isAvailableNode(network.http_url);
      if (nodeStatus.isAvailable) { return network; }

      // Update new available node url if current main node is not available
      let nodeCheckPromises = [];
      for (let nodeUrl of network.node_urls) {
        nodeCheckPromises.push(this.isAvailableNode(nodeUrl));
      }
      const nodeStatuses = await Promise.all(nodeCheckPromises);
      const availableNodes = nodeStatuses.filter((node) => node.isAvailable);

      if (availableNodes.length > 0) {
        const randomNodeIndex = Math.floor(Math.random() * availableNodes.length);
        network.http_url = availableNodes[randomNodeIndex].url;
        network = await NetworkEntity.save(network);

        return network;
      } else {
        throw new NoAvailableNodeException();
      }
    } catch (ex) {
      console.error(ex);
    }
  }
}
