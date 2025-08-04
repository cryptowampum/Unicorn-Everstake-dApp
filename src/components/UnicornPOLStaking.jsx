import React, { useState } from 'react';
import { AutoConnect, useActiveWallet } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains";
import { Wallet, TrendingUp, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { useEverstakeStaking } from '../hooks/useEverstakeStaking.jsx';
import { useNetworkDetection } from '../hooks/useNetworkDetection.js';
import ChainSwitchNotification from './ui/ChainSwitchNotification.jsx';
import NetworkSwitcher from './ui/NetworkSwitcher.jsx';

// Import the completed components (you'll need to replace the TODO versions)
const BalanceDisplay = ({ balances, loading, currentChain, onRefresh }) => {
  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return num.toFixed(6);
  };

  const formatCurrency = (balance) => {
    const polPrice = 0.45; // USD
    const usdValue = parseFloat(balance) * polPrice;
    return usdValue.toFixed(2);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Available POL Balance */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={20} color="#60a5fa" />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Available POL</span>
          </div>
          <div style={{
            padding: '0.25rem 0.75rem',
            background: currentChain === 'ethereum' 
              ? 'rgba(59, 130, 246, 0.2)' 
              : 'rgba(147, 51, 234, 0.2)',
            border: currentChain === 'ethereum' 
              ? '1px solid rgba(59, 130, 246, 0.3)' 
              : '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '12px',
            fontSize: '0.7rem'
          }}>
            {currentChain === 'ethereum' ? 'ETH' : 'POLY'}
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {formatBalance(balances.pol)}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
              ≈ ${formatCurrency(balances.pol)} USD
            </div>
          </>
        )}
      </div>

      {/* Staked POL */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <TrendingUp size={20} color="#34d399" />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Staked POL</span>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {formatBalance(balances.staked)}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
              ≈ ${formatCurrency(balances.staked)} USD
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#34d399',
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: 'rgba(52, 211, 153, 0.1)',
              borderRadius: '8px'
            }}>
              Earning ~4.1% APY
            </div>
          </>
        )}
      </div>

      {/* Pending Rewards */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Zap size={20} color="#a78bfa" />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pending Rewards</span>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {formatBalance(balances.rewards)}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
              ≈ ${formatCurrency(balances.rewards)} USD
            </div>
            {parseFloat(balances.rewards) >= 2 && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#a78bfa',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'rgba(167, 139, 250, 0.1)',
                borderRadius: '8px'
              }}>
                Ready to claim!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StakingForm = ({ onStake, loading, maxAmount, currentChain, isConnected }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  React.useEffect(() => {
    setError('');
    setWarning('');

    if (!amount) return;

    const numAmount = parseFloat(amount);
    const maxAmountNum = parseFloat(maxAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > maxAmountNum) {
      setError(`Insufficient balance. Maximum: ${maxAmountNum.toFixed(6)} POL`);
      return;
    }

    if (numAmount < 1) {
      setWarning('Minimum recommended stake is 1 POL');
    }

    if (currentChain === 'ethereum' && numAmount > 0) {
      setWarning('Ethereum gas fees apply. Ensure you have ~0.05-0.1 ETH for transactions.');
    }
  }, [amount, maxAmount, currentChain]);

  const handleMaxClick = () => {
    const maxAmountNum = parseFloat(maxAmount);
    if (maxAmountNum > 0) {
      const bufferAmount = currentChain === 'ethereum' ? 0.001 : 0;
      const adjustedMax = Math.max(0, maxAmountNum - bufferAmount);
      setAmount(adjustedMax.toFixed(6));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error || !amount || parseFloat(amount) <= 0) return;
    onStake(amount);
  };

  const isDisabled = loading || !!error || !amount || !isConnected || currentChain !== 'ethereum';

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      marginBottom: '2rem'
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        <Zap size={20} color="#60a5fa" />
        Stake POL Tokens
      </h3>

      {currentChain !== 'ethereum' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} color="#ef4444" />
          <span>Please switch to Ethereum mainnet to stake POL tokens</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            Amount to Stake (POL)
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              disabled={loading || currentChain !== 'ethereum'}
              style={{
                width: '100%',
                padding: '1rem 5rem 1rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: error ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={loading || currentChain !== 'ethereum'}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#60a5fa',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              MAX
            </button>
          </div>

          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.6, 
            marginTop: '0.5rem' 
          }}>
            Available: {parseFloat(maxAmount).toFixed(6)} POL
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {warning && !error && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#fbbf24'
          }}>
            {warning}
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          style={{
            width: '100%',
            padding: '1rem',
            background: isDisabled 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: isDisabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Processing...
            </>
          ) : (
            <>
              <Zap size={20} />
              Stake POL
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const RewardsPanel = ({ rewards, onClaim, loading, currentChain, isConnected }) => {
  const rewardsAmount = parseFloat(rewards);
  const canClaim = rewardsAmount >= 2;
  const isOnEthereum = currentChain === 'ethereum';
  
  const formatRewards = (amount) => parseFloat(amount).toFixed(6);
  const formatCurrency = (amount) => (parseFloat(amount) * 0.45).toFixed(2);

  const handleClaim = () => {
    if (canClaim && isOnEthereum && isConnected) {
      onClaim();
    }
  };

  const getClaimButtonText = () => {
    if (loading) return 'Processing...';
    if (!isConnected) return 'Connect Wallet';
    if (!isOnEthereum) return 'Switch to Ethereum';
    if (!canClaim) return `Minimum 2 POL Required`;
    return 'Claim Rewards';
  };

  const getClaimButtonDisabled = () => {
    return loading || !isConnected || !isOnEthereum || !canClaim;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white'
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        <Zap size={20} color="#a78bfa" />
        Staking Rewards
      </h3>

      {!isOnEthereum && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} color="#ef4444" />
          <span>Please switch to Ethereum mainnet to claim rewards</span>
        </div>
      )}

      <div style={{
        background: 'rgba(167, 139, 250, 0.1)',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
          Pending Rewards
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {formatRewards(rewards)} POL
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
          ≈ ${formatCurrency(rewards)} USD
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={getClaimButtonDisabled()}
        style={{
          width: '100%',
          padding: '1rem',
          background: getClaimButtonDisabled() 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '12px',
          color: getClaimButtonDisabled() ? 'rgba(255, 255, 255, 0.5)' : 'white',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: getClaimButtonDisabled() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          <>
            <Zap size={20} />
            {getClaimButtonText()}
          </>
        )}
      </button>
    </div>
  );
};

const UnicornPOLStaking = ({ client }) => {
  const wallet = useActiveWallet();
  const { currentChain, isLoading: networkLoading } = useNetworkDetection(wallet);
  const { balances, isLoading, error, stakePOL, claimRewards, refreshBalances } = useEverstakeStaking(wallet, client, currentChain);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageTimeout, setMessageTimeout] = useState(null);

  // Configure Unicorn smart account wallets
  const wallets = [
    inAppWallet({
      smartAccount: {
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
        chain: mainnet,
        gasless: true,
      }
    })
  ];

  // Clear any existing timeout when setting new message
  const setStatusWithTimeout = (message, duration = 10000) => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    setStatusMessage(message);
    
    const timeout = setTimeout(() => {
      setStatusMessage('');
      setMessageTimeout(null);
    }, duration);
    
    setMessageTimeout(timeout);
  };

  const handleStake = async (amount) => {
    if (currentChain !== 'ethereum') {
      setStatusWithTimeout('Please switch to Ethereum mainnet to stake POL');
      return;
    }

    const result = await stakePOL(amount);
    setStatusWithTimeout(result.message, result.success ? 12000 : 8000); // Longer timeout for success messages
  };

  const handleClaimRewards = async () => {
    if (currentChain !== 'ethereum') {
      setStatusWithTimeout('Please switch to Ethereum mainnet to claim rewards');
      return;
    }

    const result = await claimRewards();
    setStatusWithTimeout(result.message, result.success ? 12000 : 8000);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  // Connection screen
  if (!wallet) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Zap size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>
              🦄 Unicorn POL Staking
            </h1>
            <p style={{ opacity: 0.8, margin: '0 0 2rem 0' }}>
              Stake POL with Everstake's 0% fee validator
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '1rem' }}>
              <Wallet size={20} color="#60a5fa" />
              <span>Connect with Unicorn smart account</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#34d399" />
              <span>Earn ~4.1% APY with gasless transactions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <Zap size={20} color="#a78bfa" />
              <span>Powered by Everstake validator</span>
            </div>
          </div>

          <AutoConnect
            client={client}
            wallets={wallets}
            onConnect={(connectedWallet) => console.log("Connected:", connectedWallet)}
            onError={(error) => console.error("Connection failed:", error)}
          />

          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '1rem' }}>
            Click above to connect your Unicorn wallet
          </p>
        </div>
      </div>
    );
  }

  // Main interface
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '1rem',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem' }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>🦄 POL Staking Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.5rem 1rem',
                background: currentChain === 'ethereum' 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(147, 51, 234, 0.2)',
                border: currentChain === 'ethereum' 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '20px',
                fontSize: '0.8rem'
              }}>
                {currentChain === 'ethereum' ? 'Ethereum' : 'Polygon'}
              </div>
              <div style={{ 
                fontFamily: 'monospace',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}>
                {wallet.getAccount()?.address?.slice(0, 6)}...{wallet.getAccount()?.address?.slice(-4)}
              </div>
              <button 
                onClick={refreshBalances}
                disabled={isLoading}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div style={{
            background: statusMessage.includes('Successfully') 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: statusMessage.includes('Successfully') 
              ? '1px solid rgba(34, 197, 94, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} color={statusMessage.includes('Successfully') ? '#22c55e' : '#ef4444'} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Network Switcher - Using your existing component */}
        <NetworkSwitcher 
          wallet={wallet} 
          currentChain={currentChain} 
          isLoading={networkLoading || isLoading} 
        />

        {/* Balance Display */}
        <BalanceDisplay 
          balances={balances}
          loading={isLoading}
          currentChain={currentChain}
          onRefresh={refreshBalances}
        />

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Staking Form */}
          <StakingForm
            onStake={handleStake}
            loading={isLoading}
            maxAmount={balances.pol}
            currentChain={currentChain}
            isConnected={!!wallet}
          />

          {/* Rewards Panel */}
          <RewardsPanel
            rewards={balances.rewards}
            onClaim={handleClaimRewards}
            loading={isLoading}
            currentChain={currentChain}
            isConnected={!!wallet}
          />
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>
            Powered by Everstake validator with 0% commission
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>APY:</strong> ~4.1%
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Validator Fee:</strong> 0%
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Unbonding:</strong> 3-4 days
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          input[type="number"] {
            -moz-appearance: textfield;
          }
          
          @media (max-width: 768px) {
            .main-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default UnicornPOLStaking;