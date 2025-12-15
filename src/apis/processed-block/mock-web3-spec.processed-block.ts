import { when } from 'jest-when';
import {
  pastLogs24639421_24639470,
  getPastLogsResponse,
  getBlockReceiptsResponse,
  getEmptyBlockReceiptsResponse,
} from '../../../test/fixtures/index.js';
import { chunkArrayReturnHex } from '../../commons/utils/index.js';

// Import mock functions from global setup
import {
  _fnGetBlockNumber as fnGetBlockNumber,
  _fnGetPastLogs as fnGetPastLogs,
  _fnGetBlock as fnGetBlock,
  _mockEthGetBlockReceipts as mockEthGetBlockReceipts,
} from '../../../test/setup-web3-mock.js';

export { fnGetBlockNumber, fnGetBlock };

// Mock fetch
export const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock eth_getBlockByNumber, eth_getBlockReceipts for any block number
when(mockFetch).calledWith('https://data-seed-prebsc-1-s3.bnbchain.org:8545', _getTraceBlockRequestPayload()).mockResolvedValue({
  json: () => Promise.resolve({ result: [] }),
});

when(fnGetBlockNumber).mockReturnValue(24639471);

const chunks = chunkArrayReturnHex(24639371, 24639471, 2);

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

// Mock ethGetBlockReceipts to return proper response
mockEthGetBlockReceipts.mockImplementation(async (client: any, blockNo: number) => {
  // Return sample receipt with log for EVEN blocks only in the range 24639371-24639470
  // This simulates ~50 blocks having events (similar to chunk-based getPastLogs behavior)
  // Range: 24639371 to 24639470 = 100 blocks, every 2nd block = 50 events
  if (blockNo >= 24639371 && blockNo <= 24639470 && blockNo % 2 === 1) {
    return getBlockReceiptsResponse(blockNo);
  }

  // Block 400000 has coin transfers but no contract events in receipts
  if (blockNo === 400000) {
    return getEmptyBlockReceiptsResponse(blockNo);
  }

  // Default: return empty receipts (including block 24639471)
  return getEmptyBlockReceiptsResponse(blockNo);
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
