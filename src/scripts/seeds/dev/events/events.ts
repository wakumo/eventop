import { COIN_TRANSFER_EVENT } from "../../../../config/constants.js";

export const contractEvents = [
  {
    "service_name": "ctn",
    "name": "CampaignCreated(bytes32,bytes16,address,address,address,uint8,uint256,uint256)",
    "routing_key": "avacuscc.events.ctn.campaign.created",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes16", "name": "salt", "type": "bytes16" }, { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "campaign", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "enum DataTypes.TOKEN_TYPE", "name": "tokenType", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFeePercent", "type": "uint256" } ], "name": "CampaignCreated", "type": "event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "ctn",
    // event CampaignRan(bytes32 campaignId, uint256 amount, uint256 adminFee, uint256 offerOwnerFee, address sender, uint256 endAt);
    "name": "CampaignRan(bytes32,uint256,uint256,uint256,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "adminFee", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "offerOwnerFee", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "endAt", "type": "uint256" } ], "name": "CampaignRan", "type": "event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "ctn",
    "name": "CampaignClaimed(bytes32,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "CampaignClaimed", "type": "event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "ctn",
    "name": "CampaignWithdrew(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "CampaignWithdrew", "type": "event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "ctn",
    "name": "FeeClaimed(bytes32,address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "campaignId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "tokenFee", "type": "address" }, { "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "FeeClaimed", "type": "event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "sns",
    "name": "Followed(address,address)",
    "abi": '{ "anonymous": false, "inputs": [ {"indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "Followed", "type":"event" }',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "sns",
    "name": "UnFollowed(address,address)",
    "abi": '{ "anonymous": false, "inputs": [ {"indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "UnFollowed", "type":"event" }',
    "chain_ids": [97, 80001]
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
    "name": "VeSWKAdminDistributed(address,uint256,uint256,uint256,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "veSWKAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakingPeriod", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "distributedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "stakedIndex", "type": "uint256" } ], "name": "VeSWKAdminDistributed", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_created",
    // event SnsCommunityCreated(address creator, address community, address communityBadge, bytes32 communityId, bytes16 salt, bytes conditions);
    "name": "SnsCommunityCreated(address,address,address,bytes32,bytes16,bytes)",
    "abi": '{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"address","name":"community","type":"address"},{"indexed":false,"internalType":"address","name":"communityBadge","type":"address"},{"indexed":false,"internalType":"bytes32","name":"communityId","type":"bytes32"},{"indexed":false,"internalType":"bytes16","name":"salt","type":"bytes16"},{"indexed":false,"internalType":"bytes","name":"conditions","type":"bytes"}],"name":"SnsCommunityCreated","type":"event"}',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_condition_updated",
    // event SnsCommunityConditionUpdated(DataTypes.ConditionTypes[] conditionType, Condition[] conditions);
    "name": "SnsCommunityConditionUpdated(uint8[],(uint8,address,uint256,uint256)[])",
    "abi": '{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum DataTypes.ConditionTypes[]","name":"conditionTypes","type":"uint8[]"},{"components":[{"internalType":"enum DataTypes.TokenType","name":"tokenType","type":"uint8"},{"internalType":"address","name":"contractAddr","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"indexed":false,"internalType":"struct DataTypes.Condition[]","name":"conditions","type":"tuple[]"}],"name":"SnsCommunityConditionUpdated","type":"event"}',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_joined",
    "name": "SnsCommunityJoined(address,uint256)", // event SnsCommunityJoined(address user, uint256 joinedAt);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "joinedAt", "type": "uint256" } ], "name": "SnsCommunityJoined", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.community_badge_ownership_transferred",
    "name": "SnsCommunityBadgeOwnershipTransferred(address,address)", // event SnsCommunityBadgeOwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "SnsCommunityBadgeOwnershipTransferred", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badge_set",
    "name": "SnsCommunityBadgeSet(address,uint256,uint256)", // event SnsCommunityBadgeSet(address user, uint256 badgeId, uint256 amount);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "SnsCommunityBadgeSet", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badges_set",
    "name": "SnsCommunityBadgesSet(address[],uint256[])", // event SnsCommunityBadgesSet(address[] users, uint256[] badgeIds);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address[]", "name": "users", "type": "address[]" }, { "indexed": false, "internalType": "uint256[]", "name": "badgeIds", "type": "uint256[]" }], "name": "SnsCommunityBadgeSet", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badge_removed",
    "name": "SnsCommunityBadgeRemoved(address,uint256,uint256)", // event SnsCommunityBadgeRemoved(address user, uint256 badgeId, uint256 amount);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "SnsCommunityBadgeRemoved", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badges_removed",
    "name": "SnsCommunityBadgesRemoved(address[],uint256[])", // event SnsCommunityBadgesRemoved(address[] users, uint256[] badgeIds);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address[]", "name": "users", "type": "address[]" }, { "indexed": false, "internalType": "uint256[]", "name": "badgeIds", "type": "uint256[]" }], "name": "SnsCommunityBadgeRemoved", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_badge_users_banned",
    "name": "SnsCommunityBadgeUsersBanned(address[],uint256)", // event SnsCommunityBadgeUsersBanned(address[] users, uint256 bannedAt);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address[]", "name": "users", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "bannedAt", "type": "uint256" }], "name": "SnsCommunityBadgeUsersBanned", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "ctn",
    "routing_key": "avacuscc.events.ctn.avacuscc_nft_deployed",
    // event AvacusccNFTDeployed(address indexed owner, address nft, string name, string symbol, string uri, bool isTransferable, NftType nftType, bytes32 salt);
    "name": "AvacusccNFTDeployed(address,address,string,string,string,bool,uint8,bytes32)",
    "abi": '{ "anonymous": false, "inputs": [{"indexed": true,"internalType": "address","name": "owner","type": "address"},{"indexed": false,"internalType": "address","name": "nft","type": "address"},{"indexed": false,"internalType": "string","name": "name","type": "string"},{"indexed": false,"internalType": "string","name": "symbol","type": "string"},{"indexed": false,"internalType": "string","name": "uri","type": "string"},{ "indexed": false, "internalType": "bool", "name": "isTransferable", "type": "bool"},{ "indexed": false, "internalType": "enum AvacusccNFTIssue.NftType", "name": "nftType", "type": "uint8"},{ "indexed": false, "internalType": "bytes32", "name": "salt", "type": "bytes32"}],"name": "AvacusccNFTDeployed","type": "event"}',
    "chain_ids": [97, 80001]
  },
  {
    "service_name": "balance",
    "name": COIN_TRANSFER_EVENT,
    "routing_key": "avacuscc.events.balance.coin_transfer",
    "chain_ids": [97, 56]
  },
]
