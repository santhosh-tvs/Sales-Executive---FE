import React from 'react';
import './Sync_Button.css';

const Sync_Button = ({ onClick, disabled = false }) => {
  const handleSync = () => {
    if (onClick) {
      onClick();
    } else {
      // Default sync functionality
      console.log('Syncing data...');
    }
  };

  return (
    <button 
      className="sync-button"
      onClick={handleSync}
      disabled={disabled}
    >
      <span className="sync-icon">⟲</span>
      Sync
    </button>
  );
};

export default Sync_Button;