import { client, dbName, dbNameTest } from './pg_client.js';
client.connect();

(async function () {
  if (process.env.NODE_ENV === "test") {
    await client.query(`DROP DATABASE IF EXISTS "${dbNameTest}"`);
    console.info(`DROPPED TEST DB ${dbNameTest}`);
  } else {
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.info(`DROPPED DB ${dbName}`);
  }
})()
  .then(() => {
    console.log('ok');
    client.end();
    process.exit(0);
  })
  .catch((ex) => {
    console.log(ex);
    client.end();
    process.exit(0);
  });
