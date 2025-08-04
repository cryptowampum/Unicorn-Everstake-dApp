// Reusable loading spinner component
import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      {/* TODO: Implement loading spinner */}
      Loading...
    </div>
  );
};

export default LoadingSpinner;
