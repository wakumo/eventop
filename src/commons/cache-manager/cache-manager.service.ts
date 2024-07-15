import { Injectable } from "@nestjs/common";
import { RedisManager } from '@liaoliaots/nestjs-redis';
import { DAYS } from "../../config/constants.js";
import Redis from 'ioredis';

@Injectable()
export class CacheManagerService {
  private readonly redis: Redis;

  constructor(
    private redisManager: RedisManager,
  ) {
    this.redis = this.redisManager.getClient();
  }

  async set(key: string, value: any, expiredIn=1 * DAYS) {
    return await this.redis.set(key, value, 'EX', expiredIn);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async delete(key: string) {
    return await this.redis.del(key);
  }

  async findOrCache(func: any, key: string, expiredTime = 1 * DAYS) {
    const cachedData = await this.get(key)
    if (cachedData) {
      return JSON.parse(cachedData)
    }

    const data = await func();
    if (data) {
      await this.set(key, JSON.stringify(data), expiredTime)
    }

    return data;
  }
}