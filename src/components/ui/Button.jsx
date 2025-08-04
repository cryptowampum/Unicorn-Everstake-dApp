// Reusable button component
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'medium',
  loading = false 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
