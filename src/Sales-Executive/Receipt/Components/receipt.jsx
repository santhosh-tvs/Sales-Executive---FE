import React, { useState } from 'react';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
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
    { 
      name: "BHALLA MOTORS", 
      code: "PSW_000396",
      gst: "29ABCDE1234F1Z5",
      mobile: "+91 9876543210",
      email: "bhalla.motors@gmail.com",
      address: "123 Main Street, Chennai, Tamil Nadu",
      creditLimit: "₹50,000",
      outstandingAmount: "₹12,500"
    },
    { 
      name: "SK AUTO PARTS", 
      code: "EOTN000182 / KMS",
      gst: "33FGHIJ5678K2Z9",
      mobile: "+91 9876543211",
      email: "sk.autoparts@gmail.com",
      address: "456 Industrial Area, Coimbatore, Tamil Nadu",
      creditLimit: "₹75,000",
      outstandingAmount: "₹8,750"
    }
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
          <div className="payment-amount-section">
            <h3 className="payment-heading">Enter Amount to Pay</h3>
            <input type="text" placeholder="Enter Amount" className="pay-field" />
          </div>
          
          <div className="payment-method-section">
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
          <div className="receipt-header">
            <Breadcrumb currentPage="Receipt" />
            {view === 'list' && (
              <div className="header-controls">
                <input type="text" placeholder="Enter Customer Name / Code" className="header-search-bar" />
                <button className="header-btn-submit">Submit</button>
              </div>
            )}
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
    <div className="list-wrapper">
      {customers.map((c, i) => (
        <div key={i} className="customer-card" onClick={() => { setSelectedCustomer(c); setView('orders'); }}>
          <div className="card-content">
            <div className="customer-info">
              <h3>{c.name}</h3>
              <p>{c.code}</p>
            </div>
            <div className="receipt-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="receipt-icon">
                <path d="M4 2V22L6 20L8 22L10 20L12 22L14 20L16 22L18 20L20 22V2H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrdersView = ({ selectedCustomer, setView }) => {
  // Sample data for pending and completed receipts
  const pendingReceipts = [
    { id: 1, orderId: "IOF25190045361", amount: "₹ 1598", date: "13/11/2025", status: "Orders Created" },
    { id: 2, orderId: "IOF25190045362", amount: "₹ 2450", date: "14/11/2025", status: "Orders Created" },
    { id: 3, orderId: "IOF25190045363", amount: "₹ 890", date: "15/11/2025", status: "Orders Created" }
  ];

  const completedReceipts = [
    { id: 4, orderId: "IOF25190045358", amount: "₹ 3200", date: "10/11/2025", status: "Receipt Completed", receiptNo: "RCP001234" },
    { id: 5, orderId: "IOF25190045359", amount: "₹ 1750", date: "11/11/2025", status: "Receipt Completed", receiptNo: "RCP001235" },
    { id: 6, orderId: "IOF25190045360", amount: "₹ 4100", date: "12/11/2025", status: "Receipt Completed", receiptNo: "RCP001236" }
  ];

  const handlePrintInvoice = (receipt) => {
    console.log('Printing invoice for:', receipt);
    // Add print functionality here
  };

  return (
    <div className="view-container">
      {/* Customer Header Section */}
      <div className="customer-header-main">
        <div className="customer-header-content">
          <div className="customer-basic-info">
            <h2 className="cust-title-text">{selectedCustomer?.name}</h2>
            <p className="cust-subtitle-text">{selectedCustomer?.code}</p>
          </div>
          <div className="customer-header-details">
            <div className="header-detail-item">
              <span className="header-detail-label">GST:</span>
              <span className="header-detail-value">{selectedCustomer?.gst}</span>
            </div>
            <div className="header-detail-item">
              <span className="header-detail-label">Outstanding:</span>
              <span className="header-detail-value outstanding">{selectedCustomer?.outstandingAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Orders Container */}
      <div className="split-orders-container">
        {/* Pending Receipts - Left Side */}
        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Pending Receipts</h3>
            <span className="section-count">{pendingReceipts.length}</span>
          </div>
          <div className="orders-flat-container">
            {pendingReceipts.map((item) => (
              <div key={item.id} className="order-row-item" onClick={() => setView('payment')}>
                <div className="order-content-wrapper">
                  <div className="order-main-content">
                    {/* TOP PART: Status and Date */}
                    <div className="order-row-flex">
                      <div className="status-flex-group">
                        <div className="purple-info-circle">i</div>
                        <span className="status-label-purple">{item.status}</span>
                      </div>
                      <span className="order-date-label">{item.date}</span>
                    </div>
                    
                    {/* BOTTOM PART: ID and Price */}
                    <div className="order-row-flex margin-top-data">
                      <div className="id-data-stack">
                        <span className="data-value-bold">{item.orderId}</span>
                        <span className="data-label-grey">Order ID</span>
                      </div>
                      <div className="price-data-stack text-right">
                        <span className="data-value-bold">{item.amount}</span>
                        <span className="data-label-grey">Total Price</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-receipt-icon-container">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="order-receipt-icon">
                      <path d="M4 2V22L6 20L8 22L10 20L12 22L14 20L16 22L18 20L20 22V2H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Receipts - Right Side */}
        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Completed Receipts</h3>
            <span className="section-count">{completedReceipts.length}</span>
          </div>
          <div className="orders-flat-container">
            {completedReceipts.map((item) => (
              <div key={item.id} className="order-row-item completed-receipt">
                <div className="order-content-wrapper">
                  <div className="order-main-content">
                    {/* TOP PART: Status and Date */}
                    <div className="order-row-flex">
                      <div className="status-flex-group">
                        <div className="green-check-circle">✓</div>
                        <span className="status-label-green">{item.status}</span>
                      </div>
                      <span className="order-date-label">{item.date}</span>
                    </div>
                    
                    {/* MIDDLE PART: Receipt Number */}
                    <div className="order-row-flex margin-top-small">
                      <div className="receipt-data-stack">
                        <span className="data-value-bold">{item.receiptNo}</span>
                        <span className="data-label-grey">Receipt No</span>
                      </div>
                    </div>
                    
                    {/* BOTTOM PART: ID and Price */}
                    <div className="order-row-flex margin-top-data">
                      <div className="id-data-stack">
                        <span className="data-value-bold">{item.orderId}</span>
                        <span className="data-label-grey">Order ID</span>
                      </div>
                      <div className="price-data-stack text-right">
                        <span className="data-value-bold">{item.amount}</span>
                        <span className="data-label-grey">Total Price</span>
                        <button 
                          className="print-receipt-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(item);
                          }}
                          title="Print Receipt"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6,18H4a2,2 0,0 1,-2-2V11a2,2 0,0 1,2-2H20a2,2 0,0 1,2,2v5a2,2 0,0 1,-2,2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;