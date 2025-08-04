import React from 'react';
import { Gift, Clock, AlertTriangle, Zap } from 'lucide-react';

const RewardsPanel = ({ rewards, onClaim, loading, currentChain, isConnected }) => {
  const rewardsAmount = parseFloat(rewards);
  const canClaim = rewardsAmount >= 2;
  const isOnEthereum = currentChain === 'ethereum';
  
  const formatRewards = (amount) => {
    return parseFloat(amount).toFixed(6);
  };

  const formatCurrency = (amount) => {
    // Approximate POL price - in production, fetch from an API
    const polPrice = 0.45; // USD
    const usdValue = parseFloat(amount) * polPrice;
    return usdValue.toFixed(2);
  };

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

  const getDaysToNextReward = () => {
    // Rewards are distributed roughly every epoch (checkpoint)
    // This is an approximation - in production you'd get this from the API
    return '~2-3 days';
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
        <Gift size={20} color="#a78bfa" />
        Staking Rewards
      </h3>

      {/* Network requirement notice */}
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
          <AlertTriangle size={20} color="#ef4444" />
          <span>Please switch to Ethereum mainnet to claim rewards</span>
        </div>
      )}

      {/* Rewards Amount Display */}
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

      {/* Reward Information */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} />
            Next Reward:
          </span>
          <span>{getDaysToNextReward()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Current APY:</span>
          <span style={{ color: '#34d399' }}>~4.1%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Minimum Claim:</span>
          <span>2 POL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Claim Fee:</span>
          <span style={{ color: '#34d399' }}>Gas only</span>
        </div>
      </div>

      {/* Claim Requirements */}
      {!canClaim && rewardsAmount > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={16} color="#fbbf24" />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Minimum claim threshold not met
            </div>
            <div style={{ opacity: 0.8 }}>
              You need at least 2 POL in rewards to claim. 
              Current: {formatRewards(rewards)} POL
            </div>
          </div>
        </div>
      )}

      {/* No rewards message */}
      {rewardsAmount === 0 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            No pending rewards yet
          </div>
          <div style={{ opacity: 0.8, fontSize: '0.8rem' }}>
            Rewards are distributed approximately every 2-3 days for staked POL
          </div>
        </div>
      )}

      {/* Claim Button */}
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
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Processing...
          </>
        ) : (
          <>
            {canClaim && isOnEthereum ? <Zap size={20} /> : <Gift size={20} />}
            {getClaimButtonText()}
          </>
        )}
      </button>

      {/* Gas fee notice for Ethereum */}
      {isOnEthereum && canClaim && (
        <div style={{
          fontSize: '0.8rem',
          opacity: 0.6,
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          Gas fees apply for claiming rewards on Ethereum
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RewardsPanel;