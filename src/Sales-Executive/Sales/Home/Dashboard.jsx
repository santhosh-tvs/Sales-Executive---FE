import React from 'react';
import '../../../styles/DashBoard/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      
      {/* Top Row - 5 Cards */}
      <div className="dashboard-row">
        <div className="dashboard-card">
          <div className="card-header">Today's Order</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="card-target">
              <span className="target-label">Target</span>
              <span className="target-value">30</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">Today's Receipt</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">MTD Order</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">YTD Order</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>

        <div className="dashboard-card claim-card">
          <div className="card-header">Today's Claim</div>
          <div className="card-main">
            <div className="card-value claim-value">10,334</div>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="section-header">
        <h3 className="section-title">Total</h3>
      </div>
      
      <div className="dashboard-row total-row">
        <div className="total-card">
          <div className="total-header">Beat Plan Created</div>
          <div className="total-value">100</div>
        </div>

        <div className="total-card">
          <div className="total-header">Visits created</div>
          <div className="total-value">100</div>
        </div>

        <div className="total-card">
          <div className="total-header">Time Spent with Customer</div>
          <div className="total-value">100</div>
        </div>

        <div className="total-card">
          <div className="total-header">Check In & Check Out Qty</div>
          <div className="total-value">100</div>
        </div>
      </div>

      {/* Collection Section */}
      <div className="section-header">
        <h3 className="section-title">Collection</h3>
      </div>
      
      <div className="dashboard-row collection-row">
        <div className="dashboard-card collection-card">
          <div className="card-header">Today's Payment</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>

        <div className="dashboard-card collection-card">
          <div className="card-header">MTD Payment</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>

        <div className="dashboard-card collection-card">
          <div className="card-header">YTD Payment</div>
          <div className="card-main">
            <div className="card-value">28</div>
            <div className="target-value-right">30</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
