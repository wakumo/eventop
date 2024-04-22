import * as dotenv from 'dotenv'
dotenv.config();

import { ColumnOptions } from "typeorm";

export const SECONDS = 1;
export const MILLISECONDS_TO_SECONDS = 1e-3;
export const SECONDS_TO_MILLISECONDS = 1000;

export const MINUTES = 60 * SECONDS;
export const MINUTES_MS = MINUTES * SECONDS_TO_MILLISECONDS;

export const HOURS = 60 * MINUTES;
export const HOURS_MS = HOURS * SECONDS_TO_MILLISECONDS;

export const DAYS = 24 * HOURS;
export const DAYS_MS = DAYS * SECONDS_TO_MILLISECONDS;

export const TOKEN_EXPIRE_TIME = 7 * DAYS;
export const RABBIT_MQ_TIMEOUT = 1 * MINUTES_MS;
export const RABBIT_MQ_MAX_BACKOFF = 1 * MINUTES_MS;
export const TRANSFERED_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const BLOCKS_RECOVER_ORPHAN = 128;
export const COIN_TRANSFER_EVENT = 'coin_transfer';

export function DECIMAL(precision: number, scale: number): ColumnOptions {
  return {
    precision, scale,
    type: 'decimal',
    default: 0.0
  }
};
