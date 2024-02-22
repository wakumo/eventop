import { Command, CommandRunner, Option } from 'nest-commander';
import { ProcessedBlockService } from '../../apis/processed-block/processed-block.service.js';
import { ScanOption } from '../../commons/interfaces/index.js';

@Command({
  name: 'job:rescan_events',
  description: 'Rescan contract events by chain id by specifying the range of blocks',
})
export class RescanEvents extends CommandRunner {
  constructor(private readonly blockService: ProcessedBlockService) {
    super();
  }

  async run(
    _: string[],
    options: ScanOption
  ): Promise<void> {
    console.info(`Rescanning block events for chain id: ${options.chain_id}`);
    const scanResult = await this.blockService.scanBlockEvents(options);
    console.info(scanResult);
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
