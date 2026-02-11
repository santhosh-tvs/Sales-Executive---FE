import React, { useState } from 'react';
import Header from '../../header/Header';
import './receipt.css';
import ChequeImg from '../Assets/cheque.jpg';
import ChallanImg from '../Assets/challan.jpg';
import MoneyImg from '../Assets/money.png';
import UpiImg from '../Assets/upi.png';
import Demand from '../Assets/dd.png';

const ReceiptPage = () => {
  const [view, setView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payDate, setPayDate] = useState('2025-08-27');
  const [selectedMethod, setSelectedMethod] = useState('Cash');

  const customers = [
    { name: "BHALLA MOTORS", code: "PSW_000396" },
    { name: "SK AUTO PARTS", code: "EOTN000182 / KMS" }
  ];

  // Payment Methods Array with Images
  const paymentMethods = [
    { name: 'Cash', img: MoneyImg },
    { name: 'Cheque', img: ChequeImg },
    { name: 'DD', img: Demand },
    { name: 'Challan', img: ChallanImg },
    { name: 'UPI Payment', img: UpiImg }
  ];

  const PaymentView = () => {
    const showExtraDetails = ['Cheque', 'DD', 'Challan'].includes(selectedMethod);
    const isCash = selectedMethod === 'Cash';
    const isUPI = selectedMethod === 'UPI Payment';
    const excessAmount = "1234.00";

    return (
      <div className="view-container">
        <div className="payment-section">
          <h3 className="payment-heading">Enter Amount to Pay</h3>
          <input type="text" placeholder="Enter Amount" className="pay-field" />
          
          <h3 className="payment-heading">Select Payment Method</h3>
          <div className="payment-methods-row">
            {paymentMethods.map(m => (
              <div 
                key={m.name} 
                className={`method-item ${selectedMethod === m.name ? 'active-method' : ''}`}
                onClick={() => setSelectedMethod(m.name)}
              >
                <div className="method-icon-box">
                  <img src={m.img} alt={m.name} className="method-img-ui" />
                </div>
                <span className="method-name">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {isCash && (
          <div className="excess-amt-card">
            <p className="msg-text">Kindly check your amount</p>
            <h2 className="amt-display">₹{excessAmount}</h2>
          </div>
        )}

        {isUPI && (
          <div className="development-msg">
            <p>UPI Payment integration will be available soon</p>
          </div>
        )}

        {showExtraDetails && (
          <div className="cheque-details-flat">
            <h4 className="section-title">{selectedMethod} Payment Mode</h4>
            <div className="cheque-form-grid">
              <div className="form-inputs">
                <div className="input-row">
                  <label>{selectedMethod} Number</label>
                  <input type="text" className="underlined-input" placeholder={`Enter ${selectedMethod} Number`} />
                </div>
                <div className="input-row">
                  <label>Bank Name</label>
                  <input type="text" className="underlined-input" placeholder="Enter Bank Name" />
                </div>
                {selectedMethod !== 'Challan' && (
                  <div className="input-row">
                    <label>Place</label>
                    <input type="text" className="underlined-input" placeholder="Enter Place" />
                  </div>
                )}
              </div>
              <div className="form-extras">
                <div className="date-group">
                  <label>Date</label>
                  <input type="date" className="calendar-picker" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
                <div className="attachment-group">
                  <label>Attachment</label>
                  <div className="upload-zone-flat">
                    <span>Choose image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="footer-actions">
          <button className="btn-close" onClick={() => setView('orders')}>Close</button>
          <button className="btn-continue">
            {(showExtraDetails || isCash || isUPI) ? 'Done' : 'Continue'}
          </button>
        </div>
      </div>
    );
  };

  // ... rest of the ListView and OrdersView components stay same
  return (
    <>
      <Header />
      <div className="receipt-page-container">
        <div className="receipt-content">
          <div className="breadcrumb-nav">
            <span onClick={() => setView('list')}>Home</span> | <span className="active">Receipt</span>
          </div>
          {view === 'list' && <ListView customers={customers} setView={setView} setSelectedCustomer={setSelectedCustomer} />}
          {view === 'orders' && <OrdersView selectedCustomer={selectedCustomer} setView={setView} />}
          {view === 'payment' && <PaymentView />}
        </div>
      </div>
    </>
  );
};

// Simplified Sub-components for brevity
const ListView = ({ customers, setView, setSelectedCustomer }) => (
  <div className="view-container">
    <div className="search-section">
      <input type="text" placeholder="Enter Customer Name / Code" className="search-bar" />
      <button className="btn-submit">Submit</button>
    </div>
    <div className="list-wrapper">
      {customers.map((c, i) => (
        <div key={i} className="customer-card" onClick={() => { setSelectedCustomer(c); setView('orders'); }}>
          <h3>{c.name}</h3><p>{c.code}</p>
        </div>
      ))}
    </div>
  </div>
);

const OrdersView = ({ selectedCustomer, setView }) => (
  <div className="view-container">
    {/* Customer Header Section */}
    <div className="customer-header-main">
      <h2 className="cust-title-text">{selectedCustomer?.name}</h2>
      <p className="cust-subtitle-text">{selectedCustomer?.code}</p>
    </div>

    {/* Orders White Container */}
    <div className="orders-flat-container">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="order-row-item" onClick={() => setView('payment')}>
          
          {/* TOP PART: Status and Date */}
          <div className="order-row-flex">
            <div className="status-flex-group">
              <div className="purple-info-circle">i</div>
              <span className="status-label-purple">Orders Created</span>
            </div>
            <span className="order-date-label">13/11/2025</span>
          </div>
          
          {/* BOTTOM PART: ID and Price */}
          <div className="order-row-flex margin-top-data">
            <div className="id-data-stack">
              <span className="data-value-bold">IOF25190045361</span>
              <span className="data-label-grey">Order ID</span>
            </div>
            <div className="price-data-stack text-right">
              <span className="data-value-bold">₹ 1598</span>
              <span className="data-label-grey">Total Price</span>
            </div>
          </div>

        </div>
      ))}
    </div>
  </div>
);

export default ReceiptPage;