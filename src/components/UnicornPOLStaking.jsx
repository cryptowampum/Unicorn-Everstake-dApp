import React, { useState } from 'react';
import { AutoConnect, useActiveWallet } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains";
import { Wallet, TrendingUp, Zap, AlertCircle, RefreshCw, Send, Gift, DollarSign } from 'lucide-react';
import { useEverstakeStaking } from '../hooks/useEverstakeStaking.jsx';
import { useNetworkDetection } from '../hooks/useNetworkDetection.js';
import ChainSwitchNotification from './ui/ChainSwitchNotification.jsx';
import NetworkSwitcher from './ui/NetworkSwitcher.jsx';

const UnicornPOLStaking = ({ client }) => {
  const wallet = useActiveWallet();
  const { currentChain, isLoading: networkLoading } = useNetworkDetection(wallet);
  const { balances, isLoading, error, stakePOL, claimRewards, refreshBalances } = useEverstakeStaking(wallet, client, currentChain);
  const [stakeAmount, setStakeAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Configure Unicorn smart account wallets - DEFAULT TO MAINNET
  const wallets = [
    inAppWallet({
      smartAccount: {
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
        chain: mainnet,
        gasless: true,
      }
    })
  ];

  const handleStake = async () => {
    console.log('🎯 handleStake called with amount:', stakeAmount);
    
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      console.log('❌ Invalid stake amount');
      setStatusMessage('Please enter a valid staking amount');
      return;
    }

    if (currentChain !== 'ethereum') {
      setStatusMessage('Please switch to Ethereum mainnet to stake POL');
      return;
    }

    console.log('✅ Calling stakePOL...');
    const result = await stakePOL(stakeAmount);
    console.log('📋 stakePOL result:', result);
    
    setStatusMessage(result.message);
    
    if (result.success) {
      setStakeAmount('');
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleClaimRewards = async () => {
    if (currentChain !== 'ethereum') {
      setStatusMessage('Please switch to Ethereum mainnet to claim rewards');
      return;
    }

    const result = await claimRewards();
    setStatusMessage(result.message);
    
    // Clear message after 5 seconds
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleMaxAmount = () => {
    const maxStakeAmount = Math.max(0, parseFloat(balances.pol) - 0.01); // Leave small buffer
    setStakeAmount(maxStakeAmount.toFixed(6));
  };

  // Connection screen (when wallet not connected)
  if (!wallet) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
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
          <AutoConnect
            client={client}
            wallets={wallets}
            onConnect={(connectedWallet) => console.log("Connected:", connectedWallet)}
            onError={(error) => console.error("Connection failed:", error)}
          />
          
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

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.9rem' }}>
              🌐 <strong>Connects to Ethereum Mainnet</strong><br/>
              Ready for POL staking with Everstake
            </p>
          </div>

          <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            Click anywhere to connect your Unicorn wallet
          </p>
        </div>
      </div>
    );
  }

  // Main staking interface (when wallet connected)
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '1rem',
      color: 'white'
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
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                fontSize: '0.9rem'
              }}>
                <div style={{ opacity: 0.6, fontSize: '0.7rem', marginBottom: '2px' }}>
                  Wallet Address
                </div>
                <div style={{ 
                  fontFamily: 'monospace',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}>
                  {wallet.getAccount()?.address || 'Loading...'}
                </div>
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

        {/* Network Switcher */}
        <NetworkSwitcher 
          wallet={wallet} 
          currentChain={currentChain} 
          isLoading={networkLoading || isLoading} 
        />

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
            color: statusMessage.includes('Successfully') ? '#86efac' : '#fca5a5'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Balance Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* POL Balance Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>POL Balance</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                  Available to stake
                </p>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : `${parseFloat(balances.pol).toFixed(4)} POL`}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              On {currentChain === 'ethereum' ? 'Ethereum' : 'Polygon'}
            </div>
          </div>

          {/* Staked Amount Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Staked POL</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                  Earning ~4.1% APY
                </p>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : `${parseFloat(balances.staked).toFixed(4)} POL`}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              With Everstake validator
            </div>
          </div>

          {/* Rewards Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gift size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Pending Rewards</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                  Ready to claim
                </p>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : `${parseFloat(balances.rewards).toFixed(4)} POL`}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Updated every ~34 min
            </div>
          </div>
        </div>

        {/* Staking Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Stake POL Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Send size={24} color="#667eea" />
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Stake POL</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontSize: '0.9rem', 
                opacity: 0.8 
              }}>
                Amount to stake
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={handleMaxAmount}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  MAX
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>
                Available: {parseFloat(balances.pol).toFixed(6)} POL
              </div>
            </div>

            {currentChain !== 'ethereum' && <ChainSwitchNotification />}

            <button
              onClick={handleStake}
              disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0 || currentChain !== 'ethereum'}
              style={{
                width: '100%',
                background: isLoading || currentChain !== 'ethereum'
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading || currentChain !== 'ethereum' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={20} />
              )}
              {isLoading ? 'Staking...' : 'Stake POL'}
            </button>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Benefits:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                <li>Earn ~4.1% APY in POL rewards</li>
                <li>0% validator commission with Everstake</li>
                <li>Rewards distributed every ~34 minutes</li>
                <li>Gasless transactions with Unicorn</li>
              </ul>
            </div>
          </div>

          {/* Claim Rewards Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Gift size={24} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Claim Rewards</h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: '#fbbf24'
              }}>
                {parseFloat(balances.rewards).toFixed(6)} POL
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                Pending rewards available to claim
              </div>
            </div>

            {currentChain !== 'ethereum' && <ChainSwitchNotification />}

            <button
              onClick={handleClaimRewards}
              disabled={isLoading || parseFloat(balances.rewards) < 2 || currentChain !== 'ethereum'}
              style={{
                width: '100%',
                background: isLoading || parseFloat(balances.rewards) < 2 || currentChain !== 'ethereum'
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading || parseFloat(balances.rewards) < 2 || currentChain !== 'ethereum' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Gift size={20} />
              )}
              {isLoading ? 'Claiming...' : 'Claim Rewards'}
            </button>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(249, 115, 22, 0.1)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Requirements:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                <li>Minimum 2 POL to claim rewards</li>
                <li>Must be on Ethereum mainnet</li>
                <li>Rewards compound automatically when staking</li>
                <li>Gas fees covered by Unicorn smart account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
            🌟 About POL Staking with Everstake
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            <div>
              <strong>Validator:</strong><br/>
              Everstake (0% commission)<br/>
              Address: 0xe483c7f156b25da9be6220049e5111bb41c4c535
            </div>
            <div>
              <strong>APY:</strong><br/>
              ~4.1% annual percentage yield<br/>
              Rewards distributed every ~34 minutes
            </div>
            <div>
              <strong>Network:</strong><br/>
              Ethereum Mainnet for staking<br/>
              Polygon for balance checking
            </div>
            <div>
              <strong>Wallet:</strong><br/>
              Unicorn smart account<br/>
              Gasless transactions enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnicornPOLStaking;