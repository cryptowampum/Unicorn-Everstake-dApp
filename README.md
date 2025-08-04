# Unicorn POL Staking dApp

A decentralized application that integrates Unicorn.eth smart accounts with Everstake's POL staking service.

## Features

- 🦄 Seamless Unicorn wallet integration with gasless transactions
- 🔥 Everstake POL staking with 0% validator fees
- 📈 ~4.1% APY rewards distributed every ~34 minutes
- 🔒 Non-custodial staking - you retain full control of your funds
- ⚡ Auto-connect functionality for frictionless user experience

## Technology Stack

- React 18
- Thirdweb SDK for Unicorn integration
- Everstake Wallet SDK for POL staking
- Ethers.js for blockchain interactions
- Tailwind CSS for styling

## Installation

```bash
npm install
npm run dev
```

## Configuration

1. Set up your Unicorn community at admin.myunicornaccount.com
2. Add your dApp for testing
3. Configure environment variables
4. Deploy and submit for App Center approval

## Architecture

- **Unicorn Integration**: Thirdweb AutoConnect with smart accounts
- **Staking Layer**: Everstake Polygon SDK for delegation
- **Chain Management**: Polygon (connection) → Ethereum (staking)

## Support

- [ConnectToUs Repository](https://github.com/unicorn-eth/ConnectToUs)
- [Everstake Wallet SDK](https://wallet-sdk.everstake.one)
- Discord: discord.gg/unicorn-developers
