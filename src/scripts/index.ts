import { SampleJob } from './jobs/sample.job.js';
import { ScanEvents } from './jobs/scan_events.job.js';
import { NetworkSeed } from './seeds/networks.script.js';

export const SCRIPTS = [SampleJob, ScanEvents, NetworkSeed];
