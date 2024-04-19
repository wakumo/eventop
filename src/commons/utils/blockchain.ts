import Web3 from 'web3';

export function getTopicFromEvent(event: string) {
  if (!event) { return; }

  return Web3.utils.sha3(event.replace(/\s/g, ''));
}

export function getABIInputsHash(abi: string) {
  if (!abi) { return; }

  let inputs = JSON.parse(abi).inputs;
  inputs.map((input) => {
    delete input.name;
    delete input.internalType;
  });

  return Web3.utils.sha3(JSON.stringify(inputs));
}

export function initClient(httpUrl: string) {
  return new Web3(new Web3.providers.HttpProvider(httpUrl));
}
