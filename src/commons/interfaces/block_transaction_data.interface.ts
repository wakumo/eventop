interface TransactionDetail {
  from: string;
  to: string;
}

export interface TransactionsByHash{
  [key: string]: TransactionDetail;
}
export interface BlockTransactionData {
  number: bigint;
  timestamp: bigint;
  hash?: string; // block hash
  parentHash?: string; // parent block hash
  transactionsByHash: TransactionsByHash;
}
