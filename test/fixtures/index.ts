import { getTopicFromEvent } from '../../src/commons/utils/blockchain.js';

export const communityEvent = 'CommunityCreated(address,string,address,address)';
export const eventPayload = {
  name: communityEvent,
  event_topic: getTopicFromEvent(communityEvent),
  abi: '{}',
  service_name: 'sns',
  chain_id: 97,
};

export const airdropCreatedABI = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'bytes16',
      name: 'campaignId_',
      type: 'bytes16',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'creator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'airDrop',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'token',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'enum AirDropCTNStorage.TOKEN_TYPE',
      name: 'tokenType_',
      type: 'uint8',
    },
  ],
  name: 'AirDropCreated',
  type: 'event',
};

export const airdropCreatedName = 'AirDropCreated(bytes16,address,address,address,uint8)';
export const airdropCreatedPayload = {
  name: airdropCreatedName,
  event_topic: getTopicFromEvent(airdropCreatedName),
  abi: JSON.stringify(airdropCreatedABI),
  service_name: 'sns',
  chain_id: 97,
};

export const communityCreatedABI = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'address',
      name: 'creator',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'string',
      name: 'name',
      type: 'string',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'community',
      type: 'address',
    },
    {
      indexed: false,
      internalType: 'address',
      name: 'badge',
      type: 'address',
    },
  ],
  name: 'CommunityCreated',
  type: 'event',
};

export const cmCreatedName = 'CommunityCreated(address,string,address,address)';
export const communityCreatedPayload = {
  name: cmCreatedName,
  event_topic: getTopicFromEvent(cmCreatedName),
  abi: JSON.stringify(communityCreatedABI),
  service_name: 'sns',
  chain_id: 97,
};

export const pastLogs24639471 = [
  {
    address: '0xE8bc3596533c3Fc908B43e1F1dE33Cc116AaEd13',
    topics: [
      '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1'
    ],
    data: '0x0000000000000000000000003a0430580303f4de9c5320ac013f14cd92192bfa0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000c6f96f50dae2867de4d4e6654f6fb5ae9228f2db000000000000000000000000ed76b09b6e751573a82031e59e10e6a01a34969c000000000000000000000000000000000000000000000000000000000000000c436f6d6d756e6974792023300000000000000000000000000000000000000000',
    blockNumber: 24639379,
    transactionHash: '0x9f74eba0c685f6d3f2d371ba9462e35a78df36e1b2b33b9b66b4bd61cab23559',
    transactionIndex: 8,
    blockHash: '0xc37734c7e825bb2821eb4e21004d9a2d4e2dbd5f72fc72682ac7b9a9083db471',
    logIndex: 20,
    removed: false,
    id: 'log_38ff7fdb'
  },
  {
    address: '0x27168006F4978A545b80445da92c23892AF2218c',
    topics: [
      '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb'
    ],
    data: '0x49e02c47b53e42e5a65b21ff6c6f0c67000000000000000000000000000000000000000000000000000000003a0430580303f4de9c5320ac013f14cd92192bfa00000000000000000000000045502e52f2cc56a284897a30a78ee84085a95d05000000000000000000000000a705d74db44ace771baedfcf4ca8c864165bf8d70000000000000000000000000000000000000000000000000000000000000001',
    blockNumber: 24639451,
    transactionHash: '0x9703c31e4e2d71a90148ecff616c970043fc0e3478fcef2cf8e2a885aea087d1',
    transactionIndex: 7,
    blockHash: '0x2e2436ebdfad6a2d05b70e4dfe5ca0016df10f26bfb2c7b0b2f3511618fc128f',
    logIndex: 13,
    removed: false,
    id: 'log_72459b11'
  }
]
