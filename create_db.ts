import { client, dbName, dbNameTest } from './pg_client.js';
client.connect();

(async function () {
  if (process.env.NODE_ENV === "test") {
    const table_query = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbNameTest}'`);
    if (!table_query.rowCount) {
      await client.query(`CREATE DATABASE "${dbNameTest}"`); // setup test db
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.info(`CREATED TEST DB ${dbNameTest}`);
    }
  } else {
    const table_query = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
    if (!table_query.rowCount) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.info(`CREATED DB ${dbName}`);
    }
  }
})()
  .then(() => {
    client.end();
    process.exit(0);
  })
  .catch((ex) => {
    console.log(ex);
    client.end();
    process.exit(0);
  });