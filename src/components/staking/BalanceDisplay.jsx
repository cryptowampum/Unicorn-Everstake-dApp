import React from 'react';
import { Wallet, TrendingUp, Gift, RefreshCw } from 'lucide-react';

const BalanceDisplay = ({ balances, loading, currentChain, onRefresh }) => {
  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return num.toFixed(6);
  };

  const formatCurrency = (balance) => {
    // Approximate POL price - in production, fetch from an API
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
            <RefreshCw size={16} className="animate-spin" />
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
            <RefreshCw size={16} className="animate-spin" />
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
          <Gift size={20} color="#a78bfa" />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pending Rewards</span>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} className="animate-spin" />
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

export default BalanceDisplay;