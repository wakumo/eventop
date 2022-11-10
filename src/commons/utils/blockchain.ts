import Web3 from 'web3';

export function getTopicFromEvent(event: string) {
  return Web3.utils.sha3(event.replace(/\s/g, ''));
}
