import React, { useState } from "react";

const Payment = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="action-card">
      <div
        className="card-top"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer" }}
      >
        <div>
          <h3>Payment</h3>
          <p className="subtitle">
            You have 3 pending payments scheduled for today
          </p>
        </div>
        <span className={`expand-icon ${isOpen ? "open" : ""}`}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="card-content">
          <div className="sub-header">
            <span>Due Today</span>
            <span>24/10/2024</span>
          </div>
          
          {/* Note: Inga 'i' kku badhila 'index' use pannuna error varadhu */}
          {[1, 2].map((_, index) => (
            <div key={index} className="list-item border-bottom">
              <div className="item-details">
                <h4>DBV Repair Kit (300006006)</h4>
                <p className="id-text">045MSP66</p>
                <p className="meta-text">Order Date : 27/01/2025</p>
                <p className="meta-text">Due Date : 24/10/2024</p>
              </div>
              <div className="item-action-group">
                <p className="price-label">Total Price</p>
                <p className="price-value">₹ 1178.66</p>
                
                {/* Fixed: index error and class name */}
                <button className="dark-btn">
                  Make Payment
                  <span className="btn-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

export default Payment;