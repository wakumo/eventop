import { Command, CommandRunner } from 'nest-commander';
import { NetworkService } from '../../apis/network/network.service.js';
import { ProcessedBlockService } from '../../apis/processed-block/processed-block.service.js';
import { parseSchedulePattern } from '../../commons/utils/schedule-pattern-parser.js';
import { isScanEnabled } from '../../commons/utils/schedule-evaluator.js';
import { NetworkEntity } from '../../entities/network.entity.js';

@Command({
  name: 'job:schedule_scan_control',
  description: 'Automatically enable/disable blockchain event scanning based on schedule pattern',
})
export class ScheduleScanControlJob extends CommandRunner {
  constructor(
    private readonly networkService: NetworkService,
    private readonly processedBlockService: ProcessedBlockService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      console.info(`${new Date()} - Schedule scan control job skipped in production environment`);
      return;
    }

    const pattern = process.env.SCAN_SCHEDULE_PATTERN;
    if (!pattern) {
      console.info(`${new Date()} - SCAN_SCHEDULE_PATTERN not configured, defaulting to 24/7 scanning`);
    }

    let schedule;
    try {
      schedule = parseSchedulePattern(pattern || 'TZ=+00:00|');
      console.info(`${new Date()} - Schedule pattern parsed successfully. Timezone: ${schedule.timezone}`);
    } catch (error) {
      console.error(`${new Date()} - Failed to parse schedule pattern: ${error.message}`);
      console.error(`${new Date()} - Defaulting to 24/7 scanning (fail-safe behavior)`);
      schedule = parseSchedulePattern('TZ=+00:00|');
    }

    try {
      await this.checkAndUpdateSchedule(schedule);
    } catch (error) {
      console.error(`${new Date()} - Error in schedule check: ${error.message}`);
      throw error;
    }
  }

  private async checkAndUpdateSchedule(schedule: any): Promise<void> {
    const currentTime = new Date();
    const shouldEnableScan = isScanEnabled(currentTime, schedule);

    const sampleNetwork = await NetworkEntity.findOne({ where: {} });
    if (!sampleNetwork) {
      return;
    }

    const currentState = sampleNetwork.is_stop_scan;
    const desiredState = !shouldEnableScan;

    if (currentState === desiredState) {
      return;
    }

    if (shouldEnableScan) {
      console.info(`${new Date()} - Enabling scan (schedule indicates scan should be active)`);

      const deletedCount = await this.processedBlockService.deleteAllProcessedBlocks();
      console.info(`${new Date()} - Deleted ${deletedCount} ProcessedBlockEntity record(s) before enabling scan`);

      const updatedCount = await this.networkService.updateAllNetworksStopScan(false);
      console.info(`${new Date()} - Enabled scanning for ${updatedCount} network(s)`);
    } else {
      console.info(`${new Date()} - Disabling scan (schedule indicates scan should be paused)`);

      const updatedCount = await this.networkService.updateAllNetworksStopScan(true);
      console.info(`${new Date()} - Disabled scanning for ${updatedCount} network(s)`);
    }
  }
}
