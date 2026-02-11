import React from 'react';
import '../../../styles/Sales/Home1/S_Dashboard.css';

const S_Dashboard = () => {
  return (
    <div className="s-dashboard-container">
      <div className="s-dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div> 
        
        <div className="dashboard-cards-grid">
          {/* Today's Receipt Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Today's Receipt</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* Today's Order Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Today's Order</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* MTD Order Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">MTD Order</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* YTD Order Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">YTD Order</h3>
            </div>
            <div className="card-content">
              <div className="main-number">28</div>
              <div className="target-section">
                <span className="target-label">Target</span>
                <span className="target-value">30</span>
              </div>
            </div>
          </div>

          {/* Today's Claim Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Today's Claim</h3>
            </div>
            <div className="card-content">
              <div className="main-number claim-number">10,334</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Dashboard;