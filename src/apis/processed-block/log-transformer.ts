import { LogData } from '../../commons/interfaces/index.js';
import { EthGetBlockReceiptsResult } from '../../commons/interfaces/index.js';

export function extractLogsFromReceipts(
  receipts: EthGetBlockReceiptsResult[],
  topics: string[]
): LogData[] {
  const logs: LogData[] = [];

  for (const receipt of receipts) {
    if (!receipt.logs?.length) continue;

    const matchingLogs = receipt.logs.filter(log =>
      log.topics?.length > 0 && topics.includes(log.topics[0])
    );

    const formattedLogs: LogData[] = matchingLogs.map(log => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: parseInt(log.blockNumber, 16) as any,
      transactionHash: log.transactionHash,
      transactionIndex: parseInt(log.transactionIndex, 16) as any,
      blockHash: log.blockHash,
      logIndex: parseInt(log.logIndex, 16) as any,
      removed: log.removed,
    }));

    logs.push(...formattedLogs);
  }

  return logs;
}
