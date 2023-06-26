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
    "name": "CampaignClaimed(bytes32,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "CampaignClaimed", "type": "event" }',
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
  },
  {
    "service_name": "balance",
    "name": "Transfer(address,address,uint256)", // ERC20 transfer
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}',
    "chain_ids": [1, 137, 56]
  },
  {
    "service_name": "sns",
    "name": "Followed(address,address)",
    "abi": '{ "anonymous": false, "inputs": [ {"indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "Followed", "type":"event" }',
    "chain_ids": [1, 137, 56, 97, 80001]
  },
  {
    "service_name": "sns",
    "name": "UnFollowed(address,address)",
    "abi": '{ "anonymous": false, "inputs": [ {"indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "UnFollowed", "type":"event" }',
    "chain_ids": [1, 137, 56, 97, 80001]
  },
  {
    "service_name": "sns",
    "name": "Transfer(address,address,uint256)", // ERC721 transfer
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Transfer", "type": "event"}',
    "chain_ids": [1, 137, 56, 97, 80001]
  },
  {
    "service_name": "sns",
    "name": "TransferSingle(address,address,address,uint256,uint256)", // ERC1155 transfer
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "TransferSingle", "type": "event" }',
    "chain_ids": [1, 137, 56, 97, 80001]
  },
  {
    "service_name": "sowaka_governance",
    "name": "Transfer(address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}',
    "chain_ids": [80001, 97],
    "contract_addresses": [
      "0xeC84c83b8911233fA287d204690dA34F54369456", // SWK mumbai
      "0x1Cc89a060b8378f5fe56795D48822Dc142E8083B", // SWK bsc testnet
      "0x946b58AC26bbdcb817DCA3A06F312452f6485B3D", // veSWK mumbai
      "0x0e3447bc457155d0a75373916c26bC2f42Cfb350", // veSWK bsc testnet
    ],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKStaked(address user, uint256 swkAmount, uint256 veSWKAmount, uint256 stakingPeriod, uint256 stakedAt, uint256 index, uint256 apy);
    "name": "SWKStaked(address,uint256,uint256,uint256,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "swkAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakingPeriod", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "apy", "type": "uint256" } ], "name": "SWKStaked", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKUnstaked(address user, uint256 veSWKAmount, uint256 unstakedAt, uint256 index);
    "name": "SWKUnstaked(address,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "unstakedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "SWKUnstaked", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKClaimedMiningReward(address user, uint256 totalReward, uint256 claimedAt);
    "name": "SWKClaimedMiningReward(address,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "totalReward", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "claimedAt", "type": "uint256" } ], "name": "SWKClaimedMiningReward", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sowaka_governance",
    // event VeSWKAdminDistributed(address user, uint256 veSWKAmount, uint256 stakingPeriod, uint256 distributedAt, uint256 stakedIndex);
    "name": "VeSWKAdminDistributed(address,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakingPeriod", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "distributedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakedIndex", "type": "uint256" } ], "name": "VeSWKAdminDistributed", "type": "event" }',
    "chain_ids": [80001, 97],
  },
]
