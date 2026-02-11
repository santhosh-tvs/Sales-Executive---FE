import React, { useState } from 'react';

const Orders = () => {
  const [isOpen, setIsOpen] = useState(false);

  const orderData = [
    { name: 'Balaji Auto part store', id: '1234567590', address: '1/38, Ponmeni, Bypass Road, Madurai- 625 016' },
    { name: 'Balaji Auto part store', id: '1234567590', address: '1/38, Ponmeni, Bypass Road, Madurai- 625 016' },
    { name: 'Balaji Auto part store', id: '1234567590', address: '1/38, Ponmeni, Bypass Road, Madurai- 625 016' }
  ];

  return (
    <section className="action-card">
      <div className="card-top" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div>
          <h3>Orders</h3>
          <p className="subtitle">You have {orderData.length} undelivered orders scheduled for today</p>
        </div>
        <span className={`expand-icon ${isOpen ? 'open' : ''}`}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
           </svg>
        </span>
      </div>

      {isOpen && (
        <div className="card-content">
          {orderData.map((order, i) => (
            <div key={i} className="list-item border-bottom simple-list">
              <div className="item-details">
                <h4>{order.name}</h4>
                <p className="id-text">{order.id}</p>
                <p className="address-text">{order.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Orders;