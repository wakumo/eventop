import { SendEventsJob } from "./jobs/send_events.job.js";
import { SampleJob } from './jobs/sample.job.js';
import { ScanEvents } from './jobs/scan_events.job.js';
import { EventSeed } from './seeds/events.script.js';
import { NetworkSeed } from './seeds/networks.script.js';
import { DeleteDeliveredMessages } from "./jobs/delete_delivered_events.job.js";
import { RescanEvents } from "./jobs/rescan_events.job.js";
import { ScheduleScanControlJob } from "./jobs/schedule_scan_control.job.js";

export const SCRIPTS = [
    SampleJob,
    ScanEvents,
    RescanEvents,
    NetworkSeed,
    EventSeed,
    SendEventsJob,
    DeleteDeliveredMessages,
    ScheduleScanControlJob
];