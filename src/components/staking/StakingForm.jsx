import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Info } from 'lucide-react';

const StakingForm = ({ onStake, loading, maxAmount, currentChain, isConnected }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  // Validate input amount
  useEffect(() => {
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

    // Gas fee warning for Ethereum
    if (currentChain === 'ethereum' && numAmount > 0) {
      setWarning('Ethereum gas fees apply. Ensure you have ~0.05-0.1 ETH for transactions.');
    }
  }, [amount, maxAmount, currentChain]);

  const handleMaxClick = () => {
    const maxAmountNum = parseFloat(maxAmount);
    if (maxAmountNum > 0) {
      // Leave a small buffer to account for potential gas fees
      const bufferAmount = currentChain === 'ethereum' ? 0.001 : 0;
      const adjustedMax = Math.max(0, maxAmountNum - bufferAmount);
      setAmount(adjustedMax.toFixed(6));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (error || !amount || parseFloat(amount) <= 0) {
      return;
    }

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

      {/* Network requirement notice */}
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
          <AlertTriangle size={20} color="#ef4444" />
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              MAX
            </button>
          </div>

          {/* Available balance */}
          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.6, 
            marginTop: '0.5rem' 
          }}>
            Available: {parseFloat(maxAmount).toFixed(6)} POL
          </div>
        </div>

        {/* Error message */}
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

        {/* Warning message */}
        {warning && !error && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Info size={16} />
            {warning}
          </div>
        )}

        {/* Staking info */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>APY:</span>
            <span style={{ color: '#34d399' }}>~4.1%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Validator:</span>
            <span>Everstake (0% fee)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Unbonding Period:</span>
            <span>3-4 days</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Minimum Stake:</span>
            <span>1 POL</span>
          </div>
        </div>

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
              <Zap size={20} />
              Stake POL
            </>
          )}
        </button>
      </form>

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
        `}
      </style>
    </div>
  );
};

export default StakingForm;