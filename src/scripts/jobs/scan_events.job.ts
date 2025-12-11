import { Command, CommandRunner, Option } from 'nest-commander';

import {
  ProcessedBlockService,
  ScanResult
} from '../../apis/processed-block/processed-block.service.js';
import { ScanOption } from '../../commons/interfaces/index.js';
import { sleep } from '../../commons/utils/index.js';
import { SECONDS_TO_MILLISECONDS } from '../../config/constants.js';

const SHORT_SLEEP = Number(process.env.SHORT_SLEEP || 1) * SECONDS_TO_MILLISECONDS;
const LONG_SLEEP = Number(process.env.LONG_SLEEP || 5) * SECONDS_TO_MILLISECONDS; // default 15 seconds in milliseconds

@Command({
  name: 'job:scan_events',
  description: 'Scan contract events by chain id',
})
export class ScanEvents extends CommandRunner {
  constructor(private readonly blockService: ProcessedBlockService) {
    super();
  }

  async run(_: string[], options: ScanOption): Promise<void> {
    let latestScanResult: ScanResult = { longSleep: false };

    while (true) {
      console.info(`${new Date()} - Start scanning block events`);

      latestScanResult = await this.blockService.scanBlockEvents(options, latestScanResult);
      const sleepTime = latestScanResult.longSleep ? LONG_SLEEP : SHORT_SLEEP;
      console.info(`${new Date()} - Scan complete, sleep for ${sleepTime / 1000} seconds`);
      await sleep(sleepTime);
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
