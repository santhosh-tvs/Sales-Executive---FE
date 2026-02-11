import React from 'react';
import { AiOutlineDownload } from 'react-icons/ai'; // React Icons

import './Export_Button.css';

const Export_Button = ({ onClick, disabled = false }) => {
  const handleExport = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('Exporting data...');
    }
  };

  return (
    <button 
      className="export-button"
      onClick={handleExport}
      disabled={disabled}
    >
      <AiOutlineDownload className="export-icon" />
      Export
    </button>
  );
};

export default Export_Button;
