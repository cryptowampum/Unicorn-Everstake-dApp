// Application constants using environment variables
export const CHAINS = {
  POLYGON: {
    id: 137,
    name: 'Polygon',
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com'
  },
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL
  }
};

export const UNICORN_CONFIG = {
  CLIENT_ID: import.meta.env.REACT_APP_THIRDWEB_CLIENT_ID || '4e8c81182c3709ee441e30d776223354',
  FACTORY_ADDRESS: import.meta.env.VITE_UNICORN_FACTORY_ADDRESS || '0xD771615c873ba5a2149D5312448cE01D677Ee48A'
};


export const UI_CONSTANTS = {
  LOADING_TIMEOUT: 30000, // 30 seconds
  STATUS_MESSAGE_DURATION: 5000 // 5 seconds
};



export const THIRDWEB_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID || '4e8c81182c3709ee441e30d776223354'
};


export const EVERSTAKE_CONFIG = {
  API_URL: import.meta.env.VITE_EVERSTAKE_API_URL || 'https://wallet-sdk-api.everstake.one',
  VALIDATOR_ADDRESS: '0xe483c7f156b25da9be6220049e5111bb41c4c535',
  VALIDATOR_NAME: 'everstake',
  MINIMUM_CLAIM_AMOUNT: '2', // 2 POL
  REWARD_FREQUENCY_MINUTES: 34,
  SOURCE_ID: import.meta.env.VITE_EVERSTAKE_SOURCE_ID || '21'
};

export const TOKEN_ADDRESSES = {
  POL_ETHEREUM: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6', // POL on Ethereum
  // POL is native on Polygon, so no address needed
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Unicorn POL Staking',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Stake POL with Everstake through Unicorn smart accounts',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'Unicorn.eth'
};








