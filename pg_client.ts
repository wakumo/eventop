import 'dotenv/config';
import pg from "pg";
const { Client } = pg;

export const dbName = process.env.DB_NAME;
export const dbNameTest = process.env.DB_NAME_TEST;

export const client = new Client({
  user: process.env.DB_USER || "root",
  host: process.env.DB_HOST || "local_postgres_user",
  database: "postgres",
  password: process.env.DB_PASSWORD || ""
});
