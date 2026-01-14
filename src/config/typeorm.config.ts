import 'dotenv/config';

import fs from 'node:fs';
import { DataSource } from 'typeorm';

const isEntitiesBuilt = fs.existsSync('./dist/src/entities');
const isMigrationsBuilt = fs.existsSync('./dist/src/migrations');

const entitiesPath = isEntitiesBuilt
  ? 'dist/src/entities/**/*.entity.js'
  : 'src/entities/**/*.entity.ts';

const migrationsPath = isMigrationsBuilt
  ? 'dist/src/migrations/*.js'
  : 'src/migrations/*.ts';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: true,
  entities: [entitiesPath],
  migrations: [migrationsPath],
});