import React from 'react';
import '../../../styles/Sales/Home1/S_Total.css';

const S_Total = () => {
  return (
    <div className="s-total-container">
      <div className="s-total-content">
        <div className="total-header">
          <h1 className="total-title">Total</h1>
        </div>
        
        <div className="total-cards-grid">
          {/* Beat Plan Created Card */}
          <div className="total-card">
            <div className="card-header">
              <h3 className="card-title">Beat Plan Created</h3>
            </div>
            <div className="card-content">
              <div className="total-number">100</div>
            </div>
          </div>

          {/* Visits Created Card */}
          <div className="total-card">
            <div className="card-header">
              <h3 className="card-title">Visits created</h3>
            </div>
            <div className="card-content">
              <div className="total-number">100</div>
            </div>
          </div>

          {/* Time Spent with Customer Card */}
          <div className="total-card">
            <div className="card-header">
              <h3 className="card-title">Time Spent with Customer</h3>
            </div>
            <div className="card-content">
              <div className="total-number">100</div>
            </div>
          </div>

          {/* Check In & Check Out Qty Card */}
          <div className="total-card">
            <div className="card-header">
              <h3 className="card-title">Check In & Check Out Qty</h3>
            </div>
            <div className="card-content">
              <div className="total-number">100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Total;