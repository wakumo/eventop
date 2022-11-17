import * as dotenv from 'dotenv'
dotenv.config();

import { DataSource } from "typeorm";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeConnection() {
  const dataSource = new DataSource({
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
  });

  await dataSource.initialize();
  return dataSource;
}

export async function getQueryRunner(connection?: DataSource) {
  let _connection = connection;
  if (!_connection) {
    _connection = await initializeConnection();
  }

  const queryRunner = _connection.createQueryRunner();
  await queryRunner.connect();
  return queryRunner;
}
