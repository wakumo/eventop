import { Command, CommandRunner, Option } from 'nest-commander';
import { sleep } from '../../commons/utils/index.js';
import { ProcessedBlockService, ScanResult } from '../../apis/processed-block/processed-block.service.js';
import { SECONDS_TO_MILLISECONDS } from "../../config/constants.js";
import { ScanOption } from '../../commons/interfaces/index.js';

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
    options: ScanOption
  ): Promise<void> {
    let latestScanResult: ScanResult = { longSleep: false };
    while (true) {
      console.info(`${new Date().toISOString()} - Start scanning block events`);
      const scanResult = await this.blockService.scanBlockEvents(options, latestScanResult);
      latestScanResult = scanResult;
      const sleepTime = (scanResult.longSleep) ? 30 : 1;
      console.info(`${new Date().toISOString()} - Scan complete, sleep for ${sleepTime} seconds`);
      await sleep(sleepTime * SECONDS_TO_MILLISECONDS);
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
