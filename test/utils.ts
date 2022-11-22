import { DataSource, DataSourceOptions, QueryRunner } from 'typeorm';
// import * as path from 'path';
import {
  EventEntity,
  EventMessageEntity,
  NetworkEntity,
  ProcessedBlockEntity,
} from '../src/entities/index.js';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../src/config/config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseTestConfigService } from '../src/config/database_test.config.js';
import { contractEvents } from "../src/scripts/seeds/events/events.js";
import { getTopicFromEvent } from "../src/commons/utils/blockchain.js";

export async function getSynchronizeConnection() {
  const dataSource = new DataSource({
    name: 'default',
    type: 'postgres' as const,
    database: process.env.DB_NAME_TEST,
    entities: [
      EventEntity,
      EventMessageEntity,
      NetworkEntity,
      ProcessedBlockEntity,
    ],
    synchronize: true,
  } as DataSourceOptions);
  await dataSource
    .initialize()
    .then(async (_) => await dataSource.synchronize(true));
  return dataSource;
}

export async function clearDB(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
}

export const IMPORT_MODULES = [
  ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseTestConfigService,
  })
];

export async function seedTestEvents(queryRunner: QueryRunner) {
  for (const event of contractEvents) {
    for (const chainId of event.chain_ids) {
      console.log(`Registering event: ${event.name}, chain id: ${chainId}`);
      const eventTopic = getTopicFromEvent(event.name);
      await queryRunner.manager.save(EventEntity, {
        event_topic: eventTopic,
        chain_id: chainId,
        name: event.name,
        abi: event.abi,
        service_name: event.service_name,
      });
    }
  }
}