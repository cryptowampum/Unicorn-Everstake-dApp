// Application constants
export const CHAINS = {
  POLYGON: {
    id: 137,
    name: 'Polygon',
    rpcUrl: process.env.REACT_APP_POLYGON_RPC_URL || 'https://polygon-rpc.com'
  },
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL
  }
};

export const UNICORN_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_THIRDWEB_CLIENT_ID || '4e8c81182c3709ee441e30d776223354',
  FACTORY_ADDRESS: process.env.REACT_APP_UNICORN_FACTORY_ADDRESS || '0xD771615c873ba5a2149D5312448cE01D677Ee48A'
};

export const EVERSTAKE_CONFIG = {
  VALIDATOR_NAME: 'everstake',
  MINIMUM_CLAIM_AMOUNT: '2', // 2 POL
  REWARD_FREQUENCY_MINUTES: 34
};

export const UI_CONSTANTS = {
  LOADING_TIMEOUT: 30000, // 30 seconds
  STATUS_MESSAGE_DURATION: 5000 // 5 seconds
};
