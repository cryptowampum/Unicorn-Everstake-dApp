import React, { useState } from 'react';
import { RefreshCw, AlertCircle, ArrowLeftRight, Zap } from 'lucide-react';
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
      purpose: 'For POL staking with Everstake',
      recommended: true,
      description: 'Stake POL and claim rewards'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      chain: polygon,
      color: '#8247e5',
      icon: '◈',
      purpose: 'Check POL balance',
      recommended: false,
      description: 'View native POL tokens'
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {networks.map((network) => {
          const isActive = network.id === currentChain;
          
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
                position: 'relative',
                textAlign: 'left'
              }}
            >
              {network.recommended && (
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
              
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                {network.purpose}
              </div>
              
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                {network.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Network-specific notifications */}
      {currentChain === 'polygon' && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={16} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ color: '#fed7aa', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Ready to stake?
            </div>
            <div style={{ color: '#fdba74', fontSize: '0.8rem' }}>
              Switch to Ethereum mainnet to stake POL with Everstake. You can view your POL balance here on Polygon.
            </div>
          </div>
        </div>
      )}

      {currentChain === 'ethereum' && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <Zap size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ color: '#a7f3d0', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Ready for staking!
            </div>
            <div style={{ color: '#6ee7b7', fontSize: '0.8rem' }}>
              You're on Ethereum mainnet. You can stake POL and claim rewards with Everstake here.
            </div>
          </div>
        </div>
      )}

      {/* Bridge Information */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px'
      }}>
        <ArrowLeftRight size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Need to bridge POL?
          </div>
          <div style={{ color: '#bfdbfe', fontSize: '0.8rem' }}>
            If you have POL on Polygon but need it on Ethereum for staking, you can use the official 
            Polygon bridge or other bridge services.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitcher;