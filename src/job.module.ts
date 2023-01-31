// import { RedisModule } from '@liaoliaots/nestjs-redis';
// import { BullModule } from '@nestjs/bull';
import './commons/utils/bigint-monkey-patching.js';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
// import { BullConfigService } from './config/bull.config.js';
import { configuration } from './config/config.js';
import { DatabaseConfigService } from './config/database.config.js';
// import { RedisConfigService } from './config/redis.config.js';
import { SCRIPTS } from './scripts/index.js';
import { EventsModule } from './apis/events/events.module.js';
import { ProcessedBlockModule } from './apis/processed-block/processed-block.module.js';
import { EventMessageModule } from "./apis/event-message/event-message.module.js";
import { EventMqJobModule } from "./rabbitmq/eventmq-job.module.js";

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
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useClass: RedisConfigService,
    // }),
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useClass: BullConfigService,
    //   inject: [ConfigService],
    // }),
    TerminusModule,
    EventsModule,
    ProcessedBlockModule,
    EventMessageModule,
    EventMqJobModule
  ],
  controllers: [AppController],
  providers: [AppService, ...SCRIPTS],
})

export class JobModule {
}