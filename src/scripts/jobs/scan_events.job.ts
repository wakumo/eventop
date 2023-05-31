import { Command, CommandRunner, Option } from 'nest-commander';
import { sleep } from '../../commons/utils/index.js';
import { ProcessedBlockService } from '../../apis/processed-block/processed-block.service.js';
import { SECONDS_TO_MILLISECONDS } from "../../config/constants.js";

interface ScanOptions {
  chain_id: number;
  from_block?: number;
  to_block?: number;
}

@Command({
  name: 'job:scan_events',
  description: 'Scan contract events by chain id',
})
export class ScanEvents extends CommandRunner {
  constructor(private readonly blockService: ProcessedBlockService) {
    super();
  }

  async run(
    _: string[],
    {
      chain_id: chainId,
      from_block: fromBlock,
      to_block: toBlock
    }: ScanOptions
  ): Promise<void> {
    if (!!fromBlock === true || !!toBlock === true) {
      await this.blockService.scanBlockEvents(chainId, fromBlock, toBlock, true);
    } else {
      while (true) {
        await this.blockService.scanBlockEvents(chainId);
        await sleep(3 * SECONDS_TO_MILLISECONDS);
      }
    }
  }

  @Option({
    flags: '-c, --chain_id [number]',
    description: 'network chain id',
    required: true,
  })
  parseChainId(val: number): number {
    return Number(val);
  }

  @Option({
    flags: '-f, --from_block [number]',
    description: 'Scan from block',
    required: false,
  })
  parseFromBlock(val: number): number {
    return Number(val);
  }

  @Option({
    flags: '-t, --to_block [number]',
    description: 'Scan up to block',
    required: false,
  })
  parseToBlock(val: number): number {
    return Number(val);
  }
}
