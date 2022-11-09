import * as dotenv from 'dotenv'
dotenv.config();

import { ColumnOptions } from "typeorm";

export const SECONDS = 1;
export const MILLISECONDS_TO_SECONDS = 1e-3;
export const SECONDS_TO_MILLISECONDS = 1000;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;
export const TOKEN_EXPIRE_TIME = 7 * DAYS;

export function DECIMAL(precision: number, scale: number): ColumnOptions {
  return {
    precision, scale,
    type: 'decimal',
    default: 0.0
  }
};
