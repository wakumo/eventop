import './commons/utils/bigint-monkey-patching.js';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventMessageModule } from './apis/event-message/event-message.module.js';
import { EventsModule } from './apis/events/events.module.js';
import { NetworkModule } from './apis/network/network.module.js';
import { ProcessedBlockModule } from './apis/processed-block/processed-block.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
// import { BullConfigService } from './config/bull.config.js';
import { configuration } from './config/config.js';
import { DatabaseConfigService } from './config/database.config.js';
import { EventMqAppModule } from './rabbitmq/eventmq-app.module.js';
// import { RedisConfigService } from './config/redis.config.js';
import { SCRIPTS } from './scripts/index.js';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisConfigService } from './config/redis.config.js';
import { CacheManagerModule } from './commons/cache-manager/cache-manager.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
    }),
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useClass: BullConfigService,
    //   inject: [ConfigService],
    // }),
    TerminusModule,
    EventsModule,
    ProcessedBlockModule,
    EventMessageModule,
    EventMqAppModule,
    NetworkModule,
    CacheManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...SCRIPTS],
})
export class AppModule  {
}
