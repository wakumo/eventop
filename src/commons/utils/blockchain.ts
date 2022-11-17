import Web3 from 'web3';

export function getTopicFromEvent(event: string) {
  return Web3.utils.sha3(event.replace(/\s/g, ''));
}

export function initClient(httpUrl: string) {
  return new Web3(new Web3.providers.HttpProvider(httpUrl));
}
