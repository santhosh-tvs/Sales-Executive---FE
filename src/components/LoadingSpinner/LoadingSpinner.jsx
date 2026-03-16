import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        {/* Tire/Wheel Animation */}
        <div className="tire-loader">
          {/* Outer tire ring */}
          <div className="tire-outer-ring"></div>
          
          {/* Middle tire ring */}
          <div className="tire-middle-ring"></div>
          
          {/* Inner tire with spokes */}
          <div className="tire-inner">
            <div className="tire-spoke tire-spoke-1"></div>
            <div className="tire-spoke tire-spoke-2"></div>
            <div className="tire-spoke tire-spoke-3"></div>
            <div className="tire-spoke tire-spoke-4"></div>
            <div className="tire-spoke tire-spoke-5"></div>
            <div className="tire-center"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        {message && (
          <p className="loading-spinner-text">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
