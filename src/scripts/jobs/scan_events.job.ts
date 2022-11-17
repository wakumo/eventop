import { Command, CommandRunner, Option } from 'nest-commander';
import { sleep } from '../../commons/utils/index.js';
import { ProcessedBlockService } from '../../apis/processed-block/processed-block.service.js';

interface ScanOptions {
  chain_id: number;
}

@Command({
  name: 'job:scan_events',
  description: 'Scan contract events by chain id',
})
export class ScanEvents extends CommandRunner {
  constructor(private readonly blockService: ProcessedBlockService) {
    super();
  }

  async run(_: string[], { chain_id: chainId }: ScanOptions): Promise<void> {
    while (true) {
      await this.blockService.scanBlockEvents(chainId);
      await sleep(5000);
    }
  }

  @Option({
    flags: '-c, --chain_id [number]',
    description: 'network chain id',
    required: true,
  })
  parseReceiver(val: number): number {
    return Number(val);
  }
}
