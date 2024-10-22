import { BaseEntity, DataSource, DataSourceOptions, QueryRunner } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../src/config/config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseTestConfigService } from '../src/config/database_test.config.js';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheManagerModule } from '../src/commons/cache-manager/cache-manager.module.js';
import { RedisTestConfigService } from '../src/config/redis-test.config.js';
import * as entitiesIndex from '../src/entities/index.js';

const entities = Object.values(entitiesIndex).filter((entity: any) => BaseEntity.isPrototypeOf(entity));

export async function getSynchronizeConnection() {
  const dataSource = new DataSource({
    name: 'default',
    type: 'postgres' as const,
    database: process.env.DB_NAME_TEST,
    entities: entities as any,
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
  ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseTestConfigService,
  }),
  RedisModule.forRootAsync({
    imports: [ConfigModule],
    useClass: RedisTestConfigService,
  }),
  CacheManagerModule,
];