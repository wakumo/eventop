import { initClient } from '../commons/utils/blockchain.js';

async function main() {
  const client = initClient('https://rpc.ankr.com/bsc');
  const blockData = await client.eth.getBlock(37531659);
  console.log("🚀 ~ main ~ blockData:", blockData);
}
main().catch((error) => {
  console.log(error);
});
