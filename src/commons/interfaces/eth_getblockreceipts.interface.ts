import { TransactionLog } from "./index.js";

// https://www.quicknode.com/docs/ethereum/eth_getBlockReceipts

export interface EthGetBlockReceiptsResult {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: TransactionLog[];
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

export interface EthGetBlockReceiptsResponse {
  jsonrpc: string;
  id: number;
  result?: EthGetBlockReceiptsResult[];
  error?: any;
}
