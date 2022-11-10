import { DataSource, DataSourceOptions } from 'typeorm';
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
  }),
];
