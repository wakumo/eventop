import Web3 from 'web3';
import { EthGetBlockReceiptsResponse } from '../interfaces/index.js';

export function getTopicFromEvent(event: string) {
  if (!event) { return; }

  return Web3.utils.sha3(event.replace(/\s/g, ''));
}

export function getABIInputsHash(abi: string) {
  if (!abi) { return; }

  let inputs = JSON.parse(abi).inputs;
  inputs.map((input) => {
    delete input.name;
    delete input.internalType;
  });

  return Web3.utils.sha3(JSON.stringify(inputs));
}

export function initClient(httpUrl: string) {
  return new Web3(new Web3.providers.HttpProvider(httpUrl));
}

function decimalToHex(number: number): string {
  return '0x' + Number(number).toString(16);
}

export async function ethGetBlockReceipts(
  client: Web3,
  blockNumber: number
): Promise<EthGetBlockReceiptsResponse> {
  const blockNoHex = decimalToHex(blockNumber);
  const provider = client.currentProvider as any;
  const blockData = await provider.request({
    method: "eth_getBlockReceipts",
    params: [blockNoHex],
    jsonrpc: "2.0",
    id: new Date().getTime(),
  }) as EthGetBlockReceiptsResponse;
  return blockData;
}
