import React, { useState } from "react";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import "./Mycollection.css";
const MyCollection = () => {
  const [activeTab, setActiveTab] = useState('due');

  const paymentData = [
    { title: 'DBV Repair Kit (300006006)', id: '045MSP66', orderDate: '27/01/2025', dueDate: '18/02/2025', price: '1178.66' },
    { title: 'DBV Repair Kit (300006006)', id: '045MSP66', orderDate: '27/01/2025', dueDate: '18/02/2025', price: '1178.66' },
    { title: 'DBV Repair Kit (300006006)', id: '045MSP66', orderDate: '27/01/2025', dueDate: '18/02/2025', price: '1178.66' }
  ];

  return (
    <div className="collections-container">
      <Header />
      <Breadcrumb currentPage="My Collections" />
      
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-box" style={{backgroundColor: '#f1f5f9'}}>
            <img src="https://cdn-icons-png.flaticon.com/512/1052/1052856.png" alt="count" width="30" />
          </div>
          <div className="stat-info">
            <h2 className="stat-value">500</h2>
            <p className="stat-label">Total Collections Count</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{backgroundColor: '#fff7ed'}}>
            <img src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png" alt="value" width="30" />
          </div>
          <div className="stat-info">
            <h2 className="stat-value">₹ 9,54,808</h2>
            <p className="stat-label">Total Collections Values</p>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'due' ? 'active' : ''}`} onClick={() => setActiveTab('due')}>
          Due Today
        </button>
        <button className={`tab-item ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          Upcoming Dues
        </button>
      </div>

      <div className="list-container">
        {paymentData.map((item, index) => (
          <div key={index} className="payment-item">
            <div className="payment-details">
              <h4>{item.title}</h4>
              <p className="item-id">{item.id}</p>
              <p className="meta-text">Order Date : {item.orderDate}</p>
              <p className="meta-text">Due Date : {item.dueDate}</p>
            </div>
            <div className="payment-actions">
              <div className="price-info">
                <span className="price-label">Total Price</span>
                <h3 className="price-amount">₹ {item.price}</h3>
              </div>
              <button className="make-payment-btn">
                Make Payment
                <span className="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7"></path>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCollection;