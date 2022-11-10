import { getTopicFromEvent } from '../../src/commons/utils/blockchain.js';

export const communityEvent = 'CommunityCreated(address,string,address,address)';
export const eventPayload = {
  name: communityEvent,
  event_topic: getTopicFromEvent(communityEvent),
  abi: '{}',
  service_name: 'sns',
  chain_id: 97
};
