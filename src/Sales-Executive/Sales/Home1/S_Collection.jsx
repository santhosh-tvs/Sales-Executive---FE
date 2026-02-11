import React from 'react';
import '../../../styles/Sales/Home1/S_Collection.css';

const S_Collection = () => {
  return (
    <div className="s-collection-container">
      <div className="s-collection-content">
        <div className="collection-header">
          <h1 className="collection-title">Collection</h1>
        </div>
        
        <div className="collection-cards-grid">
          {/* Today's Payment Card */}
          <div className="collection-card">
            <div className="card-header">
              <h3 className="card-title">Today's Payment</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* MTD Payment Card */}
          <div className="collection-card">
            <div className="card-header">
              <h3 className="card-title">MTD Payment</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* YTD Payment Card */}
          <div className="collection-card">
            <div className="card-header">
              <h3 className="card-title">YTD Payment</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Collection;