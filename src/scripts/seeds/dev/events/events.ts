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
  // {
  //   "service_name": "balance",
  //   "name": "Transfer(address,address,uint256)", // ERC20 transfer
  //   "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}',
  //   "chain_ids": [1, 137, 56]
  // },
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
    // event SnsCommunityConditionUpdated(DataTypes.ConditionTypes conditionType, DataTypes.TokenType tokenType, address contractAddr, uint256 tokenId, uint256 minAmount);
    "name": "SnsCommunityConditionUpdated(uint8,uint8,address,uint256,uint256)",
    "abi": '{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum DataTypes.ConditionTypes","name":"conditionType","type":"uint8"},{"indexed":false,"internalType":"enum DataTypes.TokenType","name":"tokenType","type":"uint8"},{"indexed":false,"internalType":"address","name":"contractAddr","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minAmount","type":"uint256"}],"name":"SnsCommunityConditionUpdated","type":"event"}',
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "sns",
    "routing_key": "avacuscc.events.sns.sns_community_joined",
    "name": "SnsCommunityJoined(address,uint256)", // event SnsCommunityJoined(address user, uint256 joinedAt);
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "joinedAt", "type": "uint256" } ], "name": "SnsCommunityJoined", "type": "event" }',
    "chain_ids": [80001, 97],
  },
  // wallet activity register event
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.uniswap_swap_v3",
    "name": "Swap(address,address,int256,int256,uint160,uint128,int24)", // event Swap( address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick );
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" } ], "name": "Swap", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.erc1155_transfer_single",
    "name": "TransferSingle(address,address,address,uint256,uint256)", // event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "TransferSingle", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.erc721_transfer",
    "name": "Transfer(address,address,uint256)", // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.erc721_approval",
    "name": "Approval(address,address,uint256)", // event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.erc20_transfer",
    "name": "Transfer(address,address,uint256)", // event Transfer(address indexed from, address indexed to, uint256 value);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.erc20_approval",
    "name": "Approval(address,address,uint256)", // event Approval(address indexed owner, address indexed spender, uint256 value);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
  {
    "service_name": "wallet-activity",
    "routing_key": "avacuscc.events.wallet-activity.uniswap_v3_swap",
    "name": "Swap(address,address,int256,int256,uint160,uint128,int24)", // event Swap( address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick);
    "abi": `{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" } ], "name": "Swap", "type": "event" }`,
    "chain_ids": [80001, 97],
  },
]
