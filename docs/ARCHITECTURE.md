# Architecture Documentation

## Overview

The Unicorn POL Staking dApp integrates:
- Unicorn.eth smart accounts for gasless transactions
- Everstake's POL staking with 0% validator fees
- Cross-chain functionality (Polygon → Ethereum)

## Components

### Wallet Layer
- UnicornPOLStaking: Main app component
- WalletConnector: Handles Unicorn wallet connection
- ChainSwitcher: Manages Polygon ↔ Ethereum switching

### Staking Layer
- StakingInterface: Core staking logic
- BalanceDisplay: Shows POL balances and staking status
- StakingForm: Input validation and staking operations
- RewardsPanel: Rewards display and claiming

### Utility Layer
- everstakeAPI: Everstake SDK integration
- formatters: Data formatting utilities
- validation: Input validation functions

## Data Flow

1. User connects Unicorn wallet (Polygon)
2. App switches to Ethereum for staking operations
3. Delegate POL to Everstake validator
4. Monitor rewards and balances
5. Claim rewards back to user wallet

## Security Considerations

- Non-custodial staking (users retain control)
- Smart contract validation
- Input sanitization and validation
- Error handling for network issues
