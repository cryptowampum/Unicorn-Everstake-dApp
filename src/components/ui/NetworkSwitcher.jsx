import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { polygon, mainnet } from "thirdweb/chains";

const NetworkSwitcher = ({ wallet, currentChain, isLoading }) => {
  const [switching, setSwitching] = useState(false);

  const networks = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      chain: mainnet,
      color: '#627eea',
      icon: 'Ξ',
      purpose: 'For POL staking'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      chain: polygon,
      color: '#8247e5',
      icon: '◈',
      purpose: 'For POL balance'
    }
  ];

  const switchNetwork = async (targetChain) => {
    if (!wallet || switching) return;
    
    setSwitching(true);
    try {
      console.log(`🔄 Switching to ${targetChain.name}...`);
      await wallet.switchChain(targetChain);
      console.log(`✅ Successfully switched to ${targetChain.name}`);
    } catch (error) {
      console.error(`❌ Failed to switch to ${targetChain.name}:`, error);
    } finally {
      setSwitching(false);
    }
  };

  const getCurrentNetwork = () => {
    return networks.find(network => network.id === currentChain) || networks[0];
  };

  const current = getCurrentNetwork();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
          Network Selection
        </h3>
        {(switching || isLoading) && (
          <RefreshCw 
            size={16} 
            color="white" 
            style={{ animation: 'spin 1s linear infinite' }} 
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {networks.map((network) => {
          const isActive = network.id === currentChain;
          const isRecommended = network.id === 'ethereum';
          
          return (
            <button
              key={network.id}
              onClick={() => switchNetwork(network.chain)}
              disabled={switching || isLoading || isActive}
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${network.color}40, ${network.color}20)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive 
                  ? `2px solid ${network.color}` 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                color: 'white',
                cursor: isActive ? 'default' : 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '8px',
                  background: '#10b981',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  FOR STAKING
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{network.icon}</span>
                <span style={{ fontWeight: '600' }}>{network.name}</span>
                {isActive && (
                  <span style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    fontSize: '0.7rem', 
                    padding: '2px 6px', 
                    borderRadius: '6px' 
                  }}>
                    ACTIVE
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {network.purpose}
              </div>
            </button>
          );
        })}
      </div>

      {currentChain === 'polygon' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '8px'
        }}>
          <AlertCircle size={16} color="#f97316" />
          <span style={{ color: '#fed7aa', fontSize: '0.8rem' }}>
            Switch to Ethereum to stake POL with Everstake
          </span>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;