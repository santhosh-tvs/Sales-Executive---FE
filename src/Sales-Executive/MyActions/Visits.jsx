import React, { useState } from 'react';

const Visits = () => {
  const [isOpen, setIsOpen] = useState(false);
  const visitData = [
    { time: '11 am- 12 pm', name: 'Balaji Auto part store', id: '1234567890', address: '1/38, Ponmeni, Bypass Road, Madurai- 625 016' },
    { time: '11 am- 12 pm', name: 'Balaji Auto part store', id: '1234567890', address: '1/38, Ponmeni, Bypass Road, Madurai- 625 016' }
  ];

  return (
    <section className="action-card">
      <div className="card-top" onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer" }}>
        <div>
          <h3>Visits</h3>
          <p className="subtitle">You have {visitData.length} pending customer visits scheduled for today.</p>
        </div>
        <span className={`expand-icon ${isOpen ? 'open' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
      
      {isOpen && (
        <div className="card-content">
          {visitData.map((item, index) => (
            <div key={index} className="list-item border-bottom">
              <div className="item-details">
                <span className="time-tag">{item.time}</span>
                <h4>{item.name}</h4>
                <p className="id-text">{item.id}</p>
                <p className="address-text">{item.address}</p>
              </div>
              
              <div className="item-action-group">
                {/* Image-la irukkura andha blue Today tag */}
                <span className="today-badge">Today</span>
                <button className="primary-btn">
                  Visits 
                  <span className="btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7"></path>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Visits;