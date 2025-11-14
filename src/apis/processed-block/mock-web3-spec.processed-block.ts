import Web3 from 'web3';
import { when } from 'jest-when';
import {
  pastLogs24639421_24639470,
  getPastLogsResponse,
} from '../../../test/fixtures/index.js';
import { chunkArrayReturnHex } from '../../commons/utils/index.js';


export const fnGetBlockNumber = jest.fn();
export const fnGetPastLogs = jest.fn();
export const fnGetBlock = jest.fn();

// Mock fetch
export const mockFetch = jest.fn();
global.fetch = mockFetch;

// Default mock for trace_block requests - returns empty array
// This will be overridden by specific mocks in test cases
// Note: jest-when matches more specific mocks first, so specific mocks in test cases will take precedence
when(mockFetch).calledWith(
  'https://data-seed-prebsc-1-s3.bnbchain.org:8545',
  expect.objectContaining({
    method: 'POST',
    body: expect.stringContaining('trace_block')
  })
).mockResolvedValue({
  json: () => Promise.resolve({ result: [] }),
});

when(fnGetBlockNumber).mockReturnValue(24639471);

// Update chunk size from 2 to 5 to match the new implementation
// Note: Mock returns 1 log per chunk (for the first block of each chunk only)
// With chunk size 5: 101 blocks ÷ 5 = 21 chunks → 21 logs → 21 messages
// But the last chunk (24639471) returns empty array, so we get 20 messages
const chunks = chunkArrayReturnHex(24639371, 24639471, 5);

for (let i = 0; i < chunks.length; i++) {
  when(fnGetPastLogs)
    .calledWith({
      fromBlock: chunks[i][0],
      toBlock: chunks[i][1],
      topics: [
        [
          '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1', // CommunityCreated(address,string,address,address)
          '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb', // AirDropCreated(bytes16,address,address,address,uint8)
        ],
      ],
    })
    .mockReturnValue(getPastLogsResponse(chunks[i][0]));
}

when(fnGetPastLogs)
  .calledWith({
    fromBlock: '0x177f7bd',
    toBlock: '0x177f7ee',
    topics: [
      [
        '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1', // CommunityCreated(address,string,address,address)
        '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb', // AirDropCreated(bytes16,address,address,address,uint8)
      ],
    ],
  })
  .mockReturnValue(pastLogs24639421_24639470);

// Mock for chunk 24639471-24639471 (last chunk with chunk size 5)
// Returns empty array, so this chunk doesn't contribute to message count
when(fnGetPastLogs)
  .calledWith({
    fromBlock: '0x177f7ef',
    toBlock: '0x177f7ef',
    topics: [
      [
        '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1', // CommunityCreated(address,string,address,address)
        '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb', // AirDropCreated(bytes16,address,address,address,uint8)
      ],
    ],
  })
  .mockReturnValue([]);

const whenAny = when(arg => true)
when(fnGetBlock).calledWith(expect.any(Number), whenAny).mockImplementation((blockNo) => {
  return { number: blockNo, timestamp: 1703134791 }
});

jest.spyOn(Web3.providers, 'HttpProvider').mockImplementation(() => null);
jest.mock('web3-eth', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getPastLogs: fnGetPastLogs,
      getBlockNumber: fnGetBlockNumber,
      getBlock: fnGetBlock,
    };
  });
});

export function _getTraceBlockRequestPayload(blockNumber?: number) {
  const blockNoInHex = blockNumber ? `0x${blockNumber.toString(16)}` : null;
  const body = blockNoInHex ? `{"jsonrpc":"2.0","method":"trace_block","params":["${blockNoInHex}"],"id":${blockNumber}}` : expect.anything();
  return {
    method: 'POST',
    headers: expect.anything(),
    body: body,
    redirect: 'follow',
  }
}


export default {};
