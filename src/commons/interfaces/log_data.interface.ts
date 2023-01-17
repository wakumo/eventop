export interface LogData {
  address?: string;
  topics?: string[];
  data?: string;
  blockNumber?: bigint;
  transactionHash?: string;
  transactionIndex?: bigint;
  blockHash?: string;
  logIndex?: bigint;
  removed?: boolean;
  id?: string;
}
