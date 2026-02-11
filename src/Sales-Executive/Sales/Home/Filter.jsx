import React, { useState } from 'react';
import '../../../styles/DashBoard/Filter.css';

const Filter = () => {
  const [selectedDate, setSelectedDate] = useState('Jun 2025');

  return (
    <div className="filter-container">
      {/* Date Filter */}
      <div className="date-filter">
        <select className="date-selector" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
          <option value="Jun 2025">Jun 2025</option>
          <option value="May 2025">May 2025</option>
          <option value="Apr 2025">Apr 2025</option>
        </select>
        <div className="filter-dropdown-arrow">▼</div>
      </div>

      {/* Orders Section */}
      <div className="filter-section">
        <h3 className="section-title">Orders</h3>
        <div className="metric-value">3</div>
        <div className="metric-value">₹ 6,333.87</div>
      </div>

      {/* Receipts Section */}
      <div className="filter-section">
        <h3 className="section-title">Receipts</h3>
        <div className="metric-value">0</div>
        <div className="metric-value">0.00</div>
      </div>

      {/* Claims Section */}
      <div className="filter-section">
        <h3 className="section-title">Claims</h3>
        <div className="claims-metrics">
          <div className="claim-item">
            <span className="claim-value">0</span>
            <span className="claim-label">Initiated</span>
          </div>
          <div className="claim-item">
            <span className="claim-value">0</span>
            <span className="claim-label">In-Progress</span>
          </div>
          <div className="claim-item">
            <span className="claim-value">0</span>
            <span className="claim-label">Closed</span>
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="customer-metrics">
        <div className="customer-metric">
          <div className="customer-label">No of Customer met</div>
          <div className="customer-value">0</div>
        </div>
        <div className="customer-metric">
          <div className="customer-label">Beat Base met</div>
          <div className="customer-value">0</div>
        </div>
        <div className="customer-metric">
          <div className="customer-label">Non Beat Base met</div>
          <div className="customer-value">0</div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
