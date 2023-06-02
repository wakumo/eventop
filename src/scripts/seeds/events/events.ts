export const contractEvents = [
  {
    "service_name": "balance",
    "routing_key": "eventop.events.balance.transfer_erc20",
    "name": "Transfer(address,address,uint256)",
    "abi": '{ "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address"},{ "indexed": true, "internalType": "address", "name": "to", "type": "address"},{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}',
    "chain_ids": [1, 137, 56],
    "contract_addresses": [],
  },
]