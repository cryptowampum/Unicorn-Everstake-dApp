# API Documentation

## Everstake Wallet SDK

### Installation
```bash
npm install @everstake/wallet-sdk-polygon
```

### Usage
```javascript
import { Polygon } from '@everstake/wallet-sdk-polygon';
const polygonSDK = new Polygon();
```

### Methods

#### delegate(address, amount, validator)
Delegate POL tokens to validator

#### undelegate(address, amount)
Undelegate POL tokens

#### claimRewards(address)
Claim accumulated rewards

#### getStakedBalance(address)
Get current staked amount

## REST API Alternative

Base URL: `https://wallet-sdk-api.everstake.one`

### POST /polygon/delegate
Delegate POL tokens

### GET /polygon/balance/{address}
Get staking balance

### POST /polygon/claim
Claim rewards

## Thirdweb Integration

### AutoConnect Configuration
```javascript
const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: ethereum,
      gasless: true,
    }
  })
];
```
