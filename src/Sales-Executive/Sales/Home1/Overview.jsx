import React, { useState } from 'react';
import Header from '../../header/Header';
import '../../../styles/Sales/Home1/Overview.css';

const Overview = () => {
  const [selectedMonth, setSelectedMonth] = useState('JUNE');

  // Sample data based on the image
  const overviewData = {
    totalAmount: 10000000.87,
    growthPercentage: 2.5,
    comparedMonth: 'May',
    compareamount: 4000000.00,
    lastMonthAmount: 7000000.00,
    orders: {
      count: 3,
      amount: 6000000.87,
      growth: 2.5
    },
    receipts: {
      count: 4,
      amount: 4000000.00,
      growth: 2.5
    },
    customers: {
      total: 0,
      beatBase: 0,
      nonBeatBase: 0
    },
    claims: {
      inProgress: 0,
      initiated: 0,
      closed: 0
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="overview-container">
      <Header />
      
      <div className="overview-content">
        <div className="overview-dashboard">
          {/* Main Overview Card */}
          <div className="overview-main-card">
            <div className="overview-header">
              <h2>Overview</h2>
              <select 
                value={selectedMonth} 
                onChange={handleMonthChange}
                className="month-selector"
              >
                <option value="JANUARY">JANUARY</option>
                <option value="FEBRUARY">FEBRUARY</option>
                <option value="MARCH">MARCH</option>
                <option value="APRIL">APRIL</option>
                <option value="MAY">MAY</option>
                <option value="JUNE">JUNE</option>
                <option value="JULY">JULY</option>
                <option value="AUGUST">AUGUST</option>
                <option value="SEPTEMBER">SEPTEMBER</option>
                <option value="OCTOBER">OCTOBER</option>
                <option value="NOVEMBER">NOVEMBER</option>
                <option value="DECEMBER">DECEMBER</option>
              </select>
            </div>
            
            <div className="overview-amount">
              <span className="currency">₹</span>
              <span className="amount">{overviewData.totalAmount.toFixed(2)}</span>
              <span className="growth positive">
                ↗ {overviewData.growthPercentage}%
              </span>
            </div>
            
            <div className="overview-comparison">
              <span>Compared to {overviewData.comparedMonth} month ₹ {overviewData.compareamount.toFixed(2)} </span>
            </div>
            
            <div className="overview-last-month">
              <span className="label">Last Month</span>
              <span className="value">₹{overviewData.lastMonthAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Orders Section */}
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Orders</span>
              </div>
              <div className="stat-main">
                <span className="stat-number">{overviewData.orders.count.toString().padStart(2, '0')}</span>
                <div className="stat-details">
                  <span className="stat-amount">₹ {overviewData.orders.amount.toLocaleString()}</span>
                  <span className="stat-growth positive">↗ {overviewData.orders.growth}%</span>
                </div>
              </div>
            </div>

            {/* Receipts Section */}
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Receipts</span>
              </div>
              <div className="stat-main">
          
                <span className="stat-number">{overviewData.receipts.count.toString().padStart(2, '0')}</span>
                <div className="stat-details">
          
                  <span className="stat-amount">₹{overviewData.receipts.amount.toFixed(2)}</span>
                  <span className="stat-growth positive">↗ {overviewData.receipts.growth}%</span>
                </div>
              </div>
            </div>

            {/* Customer Metrics */}
            <div className="customer-metrics">
              <div className="customer-stat">
                <span className="customer-label">No of Customer met</span>
                <div className="customer-value">
                  <span className="customer-number">{overviewData.customers.total}</span>
                  <span className="customer-badge beat">Beat</span>
                </div>
              </div>
              
              <div className="customer-stat">
                <span className="customer-label">Beat Base met</span>
                <div className="customer-value">
                  <span className="customer-number">{overviewData.customers.beatBase}</span>
                  <span className="customer-badge beat">Beat</span>
                </div>
              </div>
              
              <div className="customer-stat">
                <span className="customer-label">Non Beat Base met</span>
                <div className="customer-value">
                  <span className="customer-number">{overviewData.customers.nonBeatBase}</span>
                  <span className="customer-badge beat">Beat</span>
                </div>
              </div>
            </div>

            {/* Claims Section */}
            <div className="claims-section">
              <div className="claim-stat">
                <span className="claim-label">In-Progress</span>
                <div className="claim-value">
                  <span className="claim-number">{overviewData.claims.inProgress}</span>
                  <span className="claim-badge">Claim</span>
                </div>
              </div>
              
              <div className="claim-stat">
                <span className="claim-label">Initiated</span>
                <div className="claim-value">
                  <span className="claim-number">{overviewData.claims.initiated}</span>
                  <span className="claim-badge">Claim</span>
                </div>
              </div>
              
              <div className="claim-stat">
                <span className="claim-label">Closed</span>
                <div className="claim-value">
                  <span className="claim-number">{overviewData.claims.closed}</span>
                  <span className="claim-badge">Claim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;