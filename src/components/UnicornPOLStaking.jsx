import React, { useState } from 'react';
import { AutoConnect, useActiveWallet } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains"; // Changed from polygon to mainnet
import { Wallet, TrendingUp, Zap, AlertCircle, RefreshCw } from 'lucide-react';
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
        chain: mainnet, // Changed from polygon to mainnet
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

        {/* Rest of your existing component... Balance Cards, Staking Interface, etc. */}
        {/* ... (keep all the existing balance cards and staking interface code) ... */}

      </div>
    </div>
  );
};

export default UnicornPOLStaking;