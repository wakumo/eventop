// Global Web3 mock setup
const { keccak256 } = require('web3-utils');

const _fnGetBlockNumber = jest.fn();
const _fnGetPastLogs = jest.fn();
const _fnGetBlock = jest.fn();
const _fnDecodeLog = jest.fn();
const MockHttpProvider = jest.fn();

class MockWeb3 {
  eth: any;
  currentProvider: any;

  constructor(provider?: any) {
    this.currentProvider = provider;
    this.eth = {
      getPastLogs: _fnGetPastLogs,
      getBlockNumber: _fnGetBlockNumber,
      getBlock: _fnGetBlock,
      abi: {
        decodeLog: _fnDecodeLog,
      },
    };
  }

  static providers = {
    HttpProvider: MockHttpProvider,
  };

  static utils = {
    sha3: keccak256,
  };
}

jest.mock('web3', () => ({
  __esModule: true,
  default: MockWeb3,
  providers: {
    HttpProvider: MockHttpProvider,
  },
  utils: {
    sha3: keccak256,
  },
}));

// Mock blockchain utils
jest.mock('../src/commons/utils/blockchain.js', () => ({
  getTopicFromEvent: (event: string) => {
    if (!event) return undefined;
    return keccak256(event.replace(/\s/g, ''));
  },
  getABIInputsHash: (abi: string) => {
    if (!abi) return undefined;
    let inputs = JSON.parse(abi).inputs;
    inputs = inputs.map((input: any) => {
      const { name, internalType, ...rest } = input;
      return rest;
    });
    return keccak256(JSON.stringify(inputs));
  },
  initClient: jest.fn(() => new MockWeb3()),
  ethGetBlockReceipts: jest.fn(),
}));

// Setup default implementation for decodeLog
_fnDecodeLog.mockImplementation((inputs, data, topics) => {
  return { decoded: true, data, topics };
});

export { _fnGetBlockNumber, _fnGetPastLogs, _fnGetBlock };
