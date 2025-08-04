// Component for displaying status messages and notifications
import React from 'react';

const StatusMessage = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`status-message ${type}`}>
      {/* TODO: Implement status message component */}
      {message}
    </div>
  );
};

export default StatusMessage;
