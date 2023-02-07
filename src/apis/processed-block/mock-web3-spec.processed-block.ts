import Web3 from 'web3';
import { when } from 'jest-when';
import { pastLogs24639371_24639420, pastLogs24639421_24639470 } from '../../../test/fixtures/index.js';

const fnGetBlockNumber = jest.fn();
const fnGetPastLogs = jest.fn();

when(fnGetBlockNumber).mockReturnValue(24639471);
when(fnGetPastLogs)
  .calledWith({
    fromBlock: '0x177f78b',
    toBlock: '0x177f7bc',
    topics: [
      [
        '0xb1d95b6bdf2983a43c17347eaf5685995f289d9fe589d492d89c1fa6f26f35f1', // CommunityCreated(address,string,address,address)
        '0xefc625945589b566f861ebde5066b543ccedbc14324af85b6b1f9917920b2bfb', // AirDropCreated(bytes16,address,address,address,uint8)
      ],
    ],
  })
  .mockReturnValue(pastLogs24639371_24639420);

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

jest.spyOn(Web3.providers, 'HttpProvider').mockImplementation(() => null);
jest.mock('web3-eth', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getPastLogs: fnGetPastLogs,
      getBlockNumber: fnGetBlockNumber,
    };
  });
});

export default {};
