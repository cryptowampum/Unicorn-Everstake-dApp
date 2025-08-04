import React from 'react';
import { AlertCircle } from 'lucide-react';

const ChainSwitchNotification = () => {
  return (
    <div style={{
      background: 'rgba(249, 115, 22, 0.1)',
      border: '1px solid rgba(249, 115, 22, 0.3)',
      borderRadius: '12px',
      padding: '1rem',
      margin: '1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <AlertCircle size={20} color="#f97316" />
      <div>
        <p style={{ margin: '0 0 0.25rem 0', color: '#fed7aa', fontSize: '0.9rem', fontWeight: '500' }}>
          Chain Switch Required
        </p>
        <p style={{ margin: 0, color: '#fdba74', fontSize: '0.8rem' }}>
          POL staking occurs on Ethereum mainnet. You'll be prompted to switch networks and approve the transaction.
        </p>
      </div>
    </div>
  );
};

export default ChainSwitchNotification;