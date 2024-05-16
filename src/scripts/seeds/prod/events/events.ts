import { COIN_TRANSFER_EVENT } from "../../../../config/constants.js";

export const contractEvents = [
  {
    "service_name": "ctn",
    "name": "CampaignCreated(bytes32,bytes16,address,address,address,uint8,uint256,uint256)",
    "routing_key": "avacuscc.events.ctn.campaign.created",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes16", "name": "salt", "type": "bytes16" }, { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "campaign", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "enum DataTypes.TOKEN_TYPE", "name": "tokenType", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFeePercent", "type": "uint256" } ], "name": "CampaignCreated", "type": "event" }',
    "chain_ids": [137, 56, 1]
  },
  {
    "service_name": "ctn",
    // event CampaignRan(bytes32 campaignId, uint256 amount, uint256 adminFee, uint256 offerOwnerFee, address sender, uint256 endAt);
    "name": "CampaignRan(bytes32,uint256,uint256,uint256,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFee", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerOwnerFee", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "endAt", "type": "uint256" } ], "name": "CampaignRan", "type": "event" }',
    "chain_ids": [137, 56, 1]
  },
  {
    "service_name": "ctn",
    "name": "CampaignClaimed(bytes32,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "CampaignClaimed", "type": "event" }',
    "chain_ids": [5, 137, 56, 1]
  },
  {
    "service_name": "ctn",
    "name": "CampaignWithdrew(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "CampaignWithdrew", "type": "event" }',
    "chain_ids": [5, 137, 56, 1]
  },
  {
    "service_name": "ctn",
    "name": "FeeClaimed(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "tokenFee", "type": "address" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "FeeClaimed", "type": "event" }',
    "chain_ids": [137, 56, 1]
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
    "chain_ids": [1, 137, 56]
  },
  {
    "service_name": "sns",
    "name": "UnFollowed(address,address)",
    "abi": '{ "anonymous": false, "inputs": [ {"indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "UnFollowed", "type":"event" }',
    "chain_ids": [1, 137, 56]
  },
  // {
  //   "service_name": "sns",
  //   "name": "Transfer(address,address,uint256)", // ERC721 transfer
  //   "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Transfer", "type": "event"}',
  //   "chain_ids": [1, 137, 56]
  // },
  // {
  //   "service_name": "sns",
  //   "name": "TransferSingle(address,address,address,uint256,uint256)", // ERC1155 transfer
  //   "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "TransferSingle", "type": "event" }',
  //   "chain_ids": [1, 137, 56]
  // },
  {
    "service_name": "sowaka_governance",
    "name": "Transfer(address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}',
    "chain_ids": [1],
    "contract_addresses": [
      "0xdDFbE9173c90dEb428fdD494cB16125653172919", // SWK ETH
      "0x8bB3b22b723f4B660cc84c2a59F26625946A4b59", // veSWK ETH
    ],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKStaked(address user, uint256 swkAmount, uint256 veSWKAmount, uint256 stakingPeriod, uint256 stakedAt, uint256 index, uint256 apy);
    "name": "SWKStaked(address,uint256,uint256,uint256,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "swkAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakingPeriod", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "apy", "type": "uint256" } ], "name": "SWKStaked", "type": "event" }',
    "chain_ids": [1],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKUnstaked(address user, uint256 veSWKAmount, uint256 unstakedAt, uint256 index);
    "name": "SWKUnstaked(address,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "unstakedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "SWKUnstaked", "type": "event" }',
    "chain_ids": [1],
  },
  {
    "service_name": "sowaka_governance",
    // event SWKClaimedMiningReward(address user, uint256 totalReward, uint256 claimedAt);
    "name": "SWKClaimedMiningReward(address,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "totalReward", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "claimedAt", "type": "uint256" } ], "name": "SWKClaimedMiningReward", "type": "event" }',
    "chain_ids": [1],
  },
  {
    "service_name": "sowaka_governance",
    // event VeSWKAdminDistributed(address user, uint256 veSWKAmount, uint256 stakingPeriod, uint256 distributedAt, uint256 stakedIndex);
    "name": "VeSWKAdminDistributed(address,uint256,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakingPeriod", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "distributedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakedIndex", "type": "uint256" } ], "name": "VeSWKAdminDistributed", "type": "event" }',
    "chain_ids": [1],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_joined",
    "name": "SnsCommunityJoined(address,uint256)", // event SnsCommunityJoined(address user, uint256 joinedAt);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "joinedAt", "type": "uint256" } ], "name": "SnsCommunityJoined", "type": "event" }',
    "chain_ids": [1, 56, 137],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.ownership_transferred",
    "name": "OwnershipTransferred(address,address)", // event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }',
    "chain_ids": [1, 56, 137],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badge_set",
    "name": "SnsCommunityBadgeSet(address,uint256,uint256)", // event SnsCommunityBadgeSet(address user, uint256 badgeId, uint256 amount);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "SnsCommunityBadgeSet", "type": "event" }',
    "chain_ids": [1, 56, 137],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badge_removed",
    "name": "SnsCommunityBadgeRemoved(address,uint256,uint256)", // event SnsCommunityBadgeRemoved(address user, uint256 badgeId, uint256 amount);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "SnsCommunityBadgeRemoved", "type": "event" }',
    "chain_ids": [1, 56, 137],
  },
  {
    "service_name": "balance",
    "name": COIN_TRANSFER_EVENT,
    "routing_key": "avacuscc.events.balance.coin_transfer",
    "chain_ids": [1, 56, 137],
  },
  {
    "service_name": "ctn",
    "routing_key": "avacuscc.events.ctn.avacuscc_nft_deployed",
    // event AvacusccNFTDeployed(address indexed owner, address nft, string name, string symbol, string uri, bool isTransferable, NftType nftType, bytes32 salt);
    "name": "AvacusccNFTDeployed(address,address,string,string,string,bool,uint8,bytes32)",
    "abi": '{ "anonymous": false, "inputs": [{"indexed": true,"internalType": "address","name": "owner","type": "address"},{"indexed": false,"internalType": "address","name": "nft","type": "address"},{"indexed": false,"internalType": "string","name": "name","type": "string"},{"indexed": false,"internalType": "string","name": "symbol","type": "string"},{"indexed": false,"internalType": "string","name": "uri","type": "string"},{ "indexed": false, "internalType": "bool", "name": "isTransferable", "type": "bool"},{ "indexed": false, "internalType": "enum AvacusccNFTIssue.NftType", "name": "nftType", "type": "uint8"},{ "indexed": false, "internalType": "bytes32", "name": "salt", "type": "bytes32"}],"name": "AvacusccNFTDeployed","type": "event"}',
    "chain_ids": [1, 56, 137]
  },
  {
    "service_name": "ctn",
    "routing_key": "avacuscc.events.ctn.avacuscc_nft_is_transferable_updated",
    // event AvacusccNftTransferable(bool isTransferable)
    "name": "AvacusccNftTransferable(bool)",
    "abi": '{"anonymous": false,"inputs": [{"indexed": false,"internalType": "bool","name": "isTransferable","type": "bool"}],"name": "AvacusccNftTransferable","type": "event"}',
    "chain_ids": [1, 56, 137]
  },
]
