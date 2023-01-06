export const contractEvents = [
  {
    "service_name": "ctn",
    "name": "CampaignCreated(bytes32,bytes16,address,address,address,uint8)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes16", "name": "salt", "type": "bytes16" }, { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "campaign", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "enum CampaignCTNStorage.TOKEN_TYPE", "name": "tokenType", "type": "uint8" } ], "name": "CampaignCreated", "type": "event" }',
    "chain_ids": [97, 80001, 5, 137]
  },
  {
    "service_name": "ctn",
    "name": "CampaignRan(bytes32,uint256,uint256,uint256,address)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFee", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerOwnerFee", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" } ], "name": "CampaignRan", "type": "event" }',
    "chain_ids": [97, 80001, 5, 137]
  },
  {
    "service_name": "ctn",
    "name": "CampaignClaimed(bytes32,address)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" } ], "name": "CampaignClaimed", "type": "event" }',
    "chain_ids": [97, 80001, 5, 137]
  },
  {
    "service_name": "ctn",
    "name": "CampaignWithdrew(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "CampaignWithdrew", "type": "event" }',
    "chain_ids": [97, 80001, 5, 137]
  },
  {
    "service_name": "ctn",
    "name": "FeeClaimed(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "tokenFee", "type": "address" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "FeeClaimed", "type": "event" }',
    "chain_ids": [97, 80001, 5, 137]
  }
]
