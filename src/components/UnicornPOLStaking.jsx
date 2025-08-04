import React, { useState } from 'react';
import { AutoConnect, useActiveWallet } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains"; // Back to mainnet for POL staking
import { Wallet, TrendingUp, Zap, AlertCircle, RefreshCw, ArrowUpRight, DollarSign, ArrowLeftRight } from 'lucide-react';
import { useEverstakeStaking } from '../hooks/useEverstakeStaking.jsx';
import { useNetworkDetection } from '../hooks/useNetworkDetection.js';
import NetworkSwitcher from './ui/NetworkSwitcher.jsx';

const UnicornPOLStaking = ({ client }) => {
  const wallet = useActiveWallet();
  const { currentChain, isLoading: networkLoading, refreshNetwork } = useNetworkDetection(wallet);
  const { balances, isLoading, error, stakePOL, claimRewards, refreshBalances } = useEverstakeStaking(wallet, client, currentChain);
  const [stakeAmount, setStakeAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Debug logging
  console.log('=== MAIN COMPONENT DEBUG ===');
  console.log('currentChain:', currentChain);
  console.log('wallet connected:', !!wallet);
  console.log('balances:', balances);
  console.log('isLoading:', isLoading);
  console.log('stakePOL function available:', typeof stakePOL);
  console.log('claimRewards function available:', typeof claimRewards);

  // Configure Unicorn smart account wallets - DEFAULT TO MAINNET for POL staking
  const wallets = [
    inAppWallet({
      smartAccount: {
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
        chain: mainnet, // Back to mainnet for staking
        gasless: true,
      }
    })
  ];

  const handleStake = async () => {
    console.log('🎯 === HANDLE STAKE CALLED ===');
    console.log('Stake amount:', stakeAmount);
    console.log('Current chain:', currentChain);
    console.log('Is loading:', isLoading);
    console.log('Wallet connected:', !!wallet);
    
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      console.log('❌ Invalid stake amount');
      setStatusMessage('Please enter a valid staking amount');
      return;
    }

    if (currentChain !== 'ethereum') {
      console.log('❌ Not on Ethereum mainnet');
      setStatusMessage('Please switch to Ethereum mainnet to stake POL with Everstake');
      return;
    }

    console.log('✅ Pre-checks passed, calling stakePOL...');
    setStatusMessage('Initiating staking transaction...');
    
    try {
      const result = await stakePOL(stakeAmount);
      console.log('📋 stakePOL result:', result);
      
      if (result && result.message) {
        setStatusMessage(result.message);
      } else {
        setStatusMessage('Staking completed, but no response message received');
      }
      
      if (result && result.success) {
        console.log('✅ Staking successful, clearing amount');
        setStakeAmount('');
      }
    } catch (error) {
      console.error('❌ Error in handleStake:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
    
    // Clear message after 7 seconds
    setTimeout(() => {
      console.log('🧹 Clearing status message');
      setStatusMessage('');
    }, 7000);
    
    console.log('🏁 === HANDLE STAKE COMPLETED ===');
  };

  const handleClaimRewards = async () => {
    if (currentChain !== 'ethereum') {
      setStatusMessage('Please switch to Ethereum mainnet to claim rewards');
      return;
    }

    const result = await claimRewards();
    setStatusMessage(result.message);
    
    // Clear message after 7 seconds
    setTimeout(() => setStatusMessage(''), 7000);
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
              Stake POL with Everstake's 0% fee validator on Ethereum
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', marginBottom: '1rem' }}>
              <Zap size={20} color="#a78bfa" />
              <span>Powered by Everstake validator</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              <ArrowLeftRight size={20} color="#f59e0b" />
              <span>Auto-detect POL on both networks</span>
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
              POL staking with Everstake • Bridge POL from Polygon if needed
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
                onClick={() => {
                  refreshBalances();
                  refreshNetwork(); // Also refresh network detection
                }}
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
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: statusMessage.includes('Successfully') 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: statusMessage.includes('Successfully') ? '#a7f3d0' : '#fca5a5'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* POL Balance Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'white' }}>POL Balance</h3>
              <Wallet size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : balances.pol} POL
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              On {currentChain === 'ethereum' ? 'Ethereum' : 'Polygon'} • 
              {currentChain === 'polygon' && (
                <span style={{ color: '#f59e0b' }}> Bridge to Ethereum for staking</span>
              )}
              {currentChain === 'ethereum' && (
                <span style={{ color: '#10b981' }}> Ready for staking</span>
              )}
            </div>
          </div>

          {/* Staked Balance Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Staked POL</h3>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : balances.staked} POL
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Earning ~4.1% APY with Everstake
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Pending Rewards</h3>
              <DollarSign size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isLoading ? '...' : balances.rewards} POL
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {parseFloat(balances.rewards) >= 2 ? 'Ready to claim' : 'Minimum 2 POL required'}
            </div>
          </div>
        </div>

        {/* Staking Interface */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>Stake POL Tokens</h3>
          
          {currentChain !== 'ethereum' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: '8px'
            }}>
              <AlertCircle size={16} color="#f97316" />
              <span style={{ color: '#fed7aa', fontSize: '0.9rem' }}>
                Switch to Ethereum mainnet to stake POL with Everstake
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.9rem' }}>
                Amount to Stake
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter POL amount"
                disabled={isLoading || currentChain !== 'ethereum'}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                Available: {balances.pol} POL
              </div>
            </div>
            
            <button
              onClick={handleStake}
              disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0 || currentChain !== 'ethereum'}
              style={{
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                background: currentChain === 'ethereum' 
                  ? (isLoading ? 'rgba(99, 102, 241, 0.6)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
                  : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: currentChain === 'ethereum' && !isLoading ? 'pointer' : 'not-allowed',
                opacity: currentChain === 'ethereum' && !isLoading ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowUpRight size={16} />}
              {isLoading ? 'Processing...' : 'Stake POL'}
            </button>
          </div>
        </div>

        {/* Rewards Interface */}
        {parseFloat(balances.rewards) >= 2 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>Claim Rewards</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {balances.rewards} POL Available
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Rewards accumulated from staking
                </div>
              </div>
              
              <button
                onClick={handleClaimRewards}
                disabled={isLoading || currentChain !== 'ethereum'}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentChain === 'ethereum' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: currentChain === 'ethereum' && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: currentChain === 'ethereum' && !isLoading ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <DollarSign size={16} />}
                {isLoading ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnicornPOLStaking;