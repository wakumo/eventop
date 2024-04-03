export interface BlockTransactionData {
  number: bigint;
  timestamp: bigint;
  hash?: string; // block hash
  parentHash?: string; // parent block hash
}
