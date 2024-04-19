import { getTopicFromEvent } from '../../src/commons/utils/blockchain.js';

export const communityEvent = 'CommunityCreated(address,string,address,address)';
export const eventPayload = {
  name: communityEvent,
  event_topic: getTopicFromEvent(communityEvent),
  abi: '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes16", "name": "salt", "type": "bytes16" }, { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "campaign", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "enum CampaignCTNStorage.TOKEN_TYPE", "name": "tokenType", "type": "uint8" } ], "name": "CampaignCreated", "type": "event" }',
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

export const coinTransferPayload = {
  name: 'coin_transfer',
  service_name: 'balance',
  routing_key: "avacuscc.events.balance.coin_transfer",
  chain_id: 97,
};

export function getPastLogsResponse(blockNoInHex: number) {
  return [
    {
      address: '0xE8bc3596533c3Fc908B43e1F1dE33Cc116AaEd13',
      topics: [
        '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1'
      ],
      data: '0x0000000000000000000000003a0430580303f4de9c5320ac013f14cd92192bfa0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000c6f96f50dae2867de4d4e6654f6fb5ae9228f2db000000000000000000000000ed76b09b6e751573a82031e59e10e6a01a34969c000000000000000000000000000000000000000000000000000000000000000c436f6d6d756e6974792023300000000000000000000000000000000000000000',
      blockNumber: parseInt(blockNoInHex.toString()),
      transactionHash: '0x9f74eba0c685f6d3f2d371ba9462e35a78df36e1b2b33b9b66b4bd61cab23559',
      transactionIndex: 8,
      blockHash: '0xc37734c7e825bb2821eb4e21004d9a2d4e2dbd5f72fc72682ac7b9a9083db471',
      logIndex: 20,
      removed: false,
      id: 'log_38ff7fdb'
    }
  ]
}

export const pastLogs24639421_24639470 = [
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

export const traceBlock_97_400000 = {
  result:  [
    {
      "action": {
        "from": "0xf5e8a439c599205c1ab06b535de46681aed1007a",
        "callType": "call",
        "gas": "0x2693d0",
        "input": "0x252f7b0100000000000000000000000000000000000000000000000000000000000027f70000000000000000000000001eefcdfa0bf820a975d4b6dbca4c9469101c9b6e00000000000000000000000000000000000000000000000000000000000927c0100b965e50d1282459544c8317bd7e8b15cc8647f3e9cf4f06aaa5d725419d25100b965e50d1282459544c8317bd7e8b15cc8647f3e9cf4f06aaa5d725419d2500000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000017400000000000000000000000088866e5a296fffa511ef8011cb1bbd4d01cd094f0000000000020ade27f7875bd31e6ddb05d93d5593fb605f58e1536a240e27761eefcdfa0bf820a975d4b6dbca4c9469101c9b6e000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000e073424e420000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009672d3aea03800073415641580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008f92dfa98afd9edd0000000000000000000000000000000000000000000000000ad63c523c9131150000000000000000000000000000000000000000000000000000000000000014fb59dc7726b90ed18420ce935b33098830700837000000000000000000000000000000000000000000000000",
        "to": "0xc0eb57bf242f8dd78a1aaa0684b15fada79b6f85",
        "value": "0x0111"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0x25dad",
        "output": "0x"
      },
      "subtraces": 1,
      "traceAddress": [],
      "transactionHash": "0x2c6bad278d82dd3600b960bd07f9052f4f24bb26cbac84bf85ba38a093f37d36",
      "transactionPosition": 0,
      "type": "call"
    },
    {
      "action": {
        "from": "0xe4b8fb0108fb79d523455638149691cd078b0886",
        "callType": "delegatecall",
        "gas": "0x1c3bc",
        "input": "0xd8d3ae65000000000000000000000000e130f543bb1c4f0802d511486eafec467e9decbf0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003",
        "to": "0x672412bd9de842ec36862753b9dcdd92fb381369",
        "value": "0x0"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0x29c4",
        "output": "0x"
      },
      "subtraces": 0,
      "traceAddress": [
        0,
        7,
        0
      ],
      "transactionHash": "0xa9331ea8fef486379bbbfc210b4feea3825f39dcc1456240f630b5b976a7e6cc",
      "transactionPosition": 2,
      "type": "call"
    },
    {
      "action": {
        "from": "0x6a5cba6a1462351300524c08317c51adf7f3c0ba",
        "callType": "call",
        "gas": "0x5739",
        "input": "0x23b872dd000000000000000000000000eddfe6baa0a2fda4ffe9222d631332b866dfd32c0000000000000000000000008a2adf6870cc0ac07ab80ac4258c1b436c66cabd0000000000000000000000000000000000000000000000000000000000016345",
        "to": "0xbea6c68006bdb24d44d7fbed9e6553a4b0a358e3",
        "value": "0x0"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0x2952",
        "output": "0x0000000000000000000000000000000000000000000000000000000000000001"
      },
      "subtraces": 0,
      "traceAddress": [
        2
      ],
      "transactionHash": "0x8a9b0b7b5418447d047419ae8877cc4d1424b74d06f656e94028fffec27414b9",
      "transactionPosition": 3,
      "type": "call"
    },
    {
      "action": {
        "from": "0x40d3256eb0babe89f0ea54edaa398513136612f5",
        "callType": "call",
        "gas": "0x1dcd1148",
        "input": "0xf340fa0100000000000000000000000040d3256eb0babe89f0ea54edaa398513136612f5",
        "to": "0x0000000000000000000000000000000000001000",
        "value": "0x1aa0fefe4be0c0"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0xc740",
        "output": "0x"
      },
      "subtraces": 2,
      "traceAddress": [],
      "transactionHash": "0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35",
      "transactionPosition": 4,
      "type": "call"
    },
    {
      "action": {
        "from": "0x0000000000000000000000000000000000001000",
        "callType": "call",
        "gas": "0x8fc",
        "input": "0x",
        "to": "0x0000000000000000000000000000000000001002",
        "value": "0x1aa0fefe4be0c"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0x5ec",
        "output": "0x"
      },
      "subtraces": 0,
      "traceAddress": [
        0
      ],
      "transactionHash": "0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35",
      "transactionPosition": 4,
      "type": "call"
    },
    {
      "action": {
        "from": "0x0000000000000000000000000000000000001000",
        "callType": "call",
        "gas": "0x8fc",
        "input": "0x",
        "to": "0x000000000000000000000000000000000000dead",
        "value": "0x2a9b3196dfce0"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": {
        "gasUsed": "0x0",
        "output": "0x"
      },
      "subtraces": 0,
      "traceAddress": [
        1
      ],
      "transactionHash": "0xd299e512cdb8577d519e6d243b78e9dab04e5aa99e3e75e80fac2c829ffd3b35",
      "transactionPosition": 4,
      "type": "call"
    },
    {
      "action": {
        "author": "0x40d3256eb0babe89f0ea54edaa398513136612f5",
        "rewardType": "block",
        "value": "0x1bc16d674ec80000"
      },
      "blockHash": "0x7a877c66ed0259c605c4e36a2fc3e07904f933aa8f346cc254e27e069d8feee4",
      "blockNumber": 400000,
      "result": null,
      "subtraces": 0,
      "traceAddress": [],
      "type": "reward"
    }
  ]
}