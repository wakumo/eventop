import { Web3RateLimitExceededException } from "../exceptions/web3-rate-limit-exceeded.exception.js";
import { sleep } from "./index.js";

export interface Web3ClientOptions {
  maxBatchCallSize?: number
  capacity?: number
  requestTimeout?: number
  rateLimit?: number
  retryAttempts?: number
  retrySchedule?: number[]
}

export class RetryManager {
  private retrySchedule: number[];

  constructor(options: Web3ClientOptions) {
    this.retrySchedule = options.retrySchedule ?? [100, 500, 2000, 10000, 20000];
  }

  async call<T>(
    promiseFunc: any,
    retries = 0,
  ) {
    try {
      const result : T = await promiseFunc;
      return result;
    } catch (ex) {
      console.error(ex);
      if (retries >= this.retrySchedule.length) {
        throw ex;
      }
      await sleep(this.retrySchedule[retries]);
      return this.call(promiseFunc, retries+1);
    }
  }
}
