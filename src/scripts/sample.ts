import { ethers } from 'ethers';
import { initClient } from '../commons/utils/blockchain.js';
import Web3 from 'web3';

async function main() {
  // const client = initClient('https://binance.llamarpc.com');
  // const blockData = await client.eth.getBlock(37531659);
  // console.log("🚀 ~ main ~ blockData:", blockData);

  // const blockNumber = ethers.BigNumber.from('54993829').toHexString().replace('0x0', '0x') // multi send
  // const web3 = new Web3(new Web3.providers.HttpProvider(url));
  // const rpcRequest = {
  //     jsonrpc: "2.0",
  //     method: "trace_block",
  //     params: [blockNumber],
  //     id: 1, // Request id
  // };

  // // const traceBlock = await web3.currentProvider.send(rpcRequest);
  // const traceBlock = await (web3.currentProvider as any).send(rpcRequest);
  // console.log("🚀 ~ main ~ traceBlock:", traceBlock);

  const myHeaders = new Headers({ "Content-Type": "application/json" });
  const url = "https://polygon-rpc.com/";
  const blockNumber = ethers.BigNumber.from('54993829').toHexString().replace('0x0', '0x');
  console.log("🚀 ~ main ~ blockNumber:", blockNumber);
  const blockNoInHex = blockNumber;
  const requestPayload = JSON.stringify(
    { "jsonrpc":"2.0","method":"trace_block","params":[blockNoInHex], "id": (new Date()).getTime() - 1 },
  );
  const requestOptions = { method: 'POST', headers: myHeaders, body: requestPayload, redirect: "follow" as RequestRedirect };
  const responses = await fetch(url, requestOptions);
  const responseBody = await responses.json();
  console.log("🚀 ~ main ~ responseBody:", responseBody.result[10]);

  // groupByTransaction = traceBlock.reduce((joined, action) => {
  //   if (!joined[action.transactionHash]) joined[action.transactionHash] = [];
  //   joined[action.transactionHash].push(action);
  //   return joined;
  // }, {})
  // txTracing = groupByTransaction['0xcc1e29b143f62ccaa6dee6e841684f1652437dd66bca94ed671f17f76b1f1271'] // multi send

  // BigNumber = require('bignumber.js')
  // nativeBalanceChanges = txTracing.reduce((joined, action) => {
  //   if (action.action.callType == 'delegatecall') return joined;
  //   if (!joined[action.action.from]) joined[action.action.from] = new BigNumber(0);
  //   if (!joined[action.action.to]) joined[action.action.to] = new BigNumber(0);
  //   value = new BigNumber(action.action.value)
  //   joined[action.action.from] = joined[action.action.from].minus(value);
  //   joined[action.action.to] = joined[action.action.to].plus(value)
  //   return joined
  // }, {})
}
main().catch((error) => {
  console.log(error);
});
