import Web3 from "web3";
import { Web3Context } from "web3-core";
import BigNumber from "bignumber.js";
import { JsonRpcRequest, JsonRpcResponse } from "web3-types";
import ethers from 'ethers';

async function main() {
  const url = "https://polygon-rpc.com/";
  const blockNumber = "0x" + 54993829n.toString(16);
  // Ethers
  const provider = new ethers.providers.JsonRpcProvider(url);

  const traceBlock: any[] = await provider.send("trace_block", [blockNumber]);
  console.log("🚀 ~ main ~ traceBlock:", traceBlock);
  const groupByTransaction: { string: any[] } = traceBlock.reduce((joined, action) => {
    if (!joined[action.transactionHash]) joined[action.transactionHash] = [];
    joined[action.transactionHash].push(action);
    return joined;
  }, {});
  const result = [];
  for (const txTracing of Object.values(groupByTransaction)) {
    const nativeBalanceChanges = txTracing.reduce((joined, action, index) => {
      const value = new BigNumber(action.action.value);
      if (value.isZero()) {
        if (index == 0) {
          console.log("no change");
        }
        return joined;
      }
      if (action.action.callType == "delegatecall") return joined;
      if (!joined[action.action.from]) joined[action.action.from] = new BigNumber(0);
      if (!joined[action.action.to]) joined[action.action.to] = new BigNumber(0);
      joined[action.action.from] = joined[action.action.from].minus(value);
      joined[action.action.to] = joined[action.action.to].plus(value);
      return joined;
    }, {});
    result.push(nativeBalanceChanges);
  }
  console.log("🚀 ~ main ~ result:", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });