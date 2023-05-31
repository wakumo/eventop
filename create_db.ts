import { client, dbName, dbNameTest } from "./pg_client.js";
client.connect();

(async function () {
  const table_query = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
  const test_table_query = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbNameTest}'`);
  if (!table_query.rowCount) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }
  if (!test_table_query.rowCount) {
    await client.query(`CREATE DATABASE "${dbNameTest}"`); // setup test db
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }
})()
  .then(() => {
    console.log("ok")
    client.end();
    process.exit(0);
  })
  .catch((ex) => {
    console.log(ex);
    client.end();
    process.exit(0);
  });
