import Web3 from 'web3';
import {
  airdropCreatedPayload,
  communityCreatedPayload,
} from '../../test/fixtures/index.js';
import Web3EthAbi from 'web3-eth-abi';
import { LogData } from '../commons/interfaces/index.js';
import { EventEntity } from '../entities/index.js';
import { getSynchronizeConnection } from '../../test/utils.js';
import { initializeConnection } from '../../connection.js';

async function main() {
  await initializeConnection();
  await EventEntity.create({ ...communityCreatedPayload }).save();
  await EventEntity.create({ ...airdropCreatedPayload }).save();

  const events = await EventEntity.find();
  console.log(events);
  // console.log(airdropCreatedPayload);
  // var web3 = new Web3(
  //   new Web3.providers.HttpProvider(
  //     'https://data-seed-prebsc-2-s1.binance.org:8545/',
  //   ),
  // );
  // // console.log(web3)
  // const events = await web3.eth.getPastLogs({
  //   fromBlock: 24489554,
  //   toBlock: 24489557,
  //   topics: [
  //     [
  //       // '0x627059660ea01c4733a328effb2294d2f86905bf806da763a89cee254de8bee5',
  //       // airdropCreatedPayload.event_topic,
  //     ],
  //   ],
  // });
  // console.log(events);
  // let event: LogData = events[0];
  // console.log(event.constructor.name)
  // let decodedData = Web3EthAbi.decodeLog(
  //   JSON.parse(airdropCreatedPayload.abi).inputs,
  //   event.data,
  //   event.topics,
  // );
  // console.log(decodedData)
}
main().catch((error) => {
  console.log(error);
});
