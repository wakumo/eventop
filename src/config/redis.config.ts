import { RedisModuleOptions, RedisOptionsFactory } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createRedisOptions(): RedisModuleOptions {
    return {
      closeClient: true,
      config: {
        host: this.configService.get('redis.host'),
        port: this.configService.get('redis.port'),
        keyPrefix: 'boilerplate:',
      },
    };
  }
}
