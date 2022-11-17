import { client, dbName, dbNameTest } from "./pg_client.js";
client.connect();

(async function () {
  await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  await client.query(`DROP DATABASE IF EXISTS "${dbNameTest}"`);
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
