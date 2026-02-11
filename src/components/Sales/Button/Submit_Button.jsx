import React from 'react';
import './Submit_Button.css';

const Submit_Button = ({ onClick, disabled = false, children = "Submit", className = "" }) => {
  return (
    <button 
      className={`submit-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  );
};

export default Submit_Button;