import Web3 from 'web3';

async function main() {
  const log = {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x0000000000000000000000009b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7',
      '0x0000000000000000000000007445de16041026093421a1dc70a19f8a71b22226'
    ],
    data: '0x000000000000000000000000000000000000000000000000000000004f60e768',
    blockNumber: 38147130,
    transactionHash: '0x545e88a896dd3190436ecb13e85e082a9bf98345863cd68835c03a61cba406f1',
    transactionIndex: 0,
    blockHash: '0xb90685d01cf70c02b9071a69927a292eb2394f68762a3bee4cecf64e260497f9',
    logIndex: 0,
    removed: false,
    id: 'log_b4dc3ba4'
  };

  const eventABI = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  };
  const web3 = new Web3();
  const payload = web3.eth.abi.decodeLog(
       eventABI.inputs,
       log.data,
       log.topics,
  );
  console.log(payload);
}
main().catch((error) => {
  console.log(error);
});