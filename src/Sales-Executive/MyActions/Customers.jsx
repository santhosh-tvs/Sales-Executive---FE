import React, { useState } from "react";

const Customers = () => {
  const [isOpen, setIsOpen] = useState(false);

  const customerData = [
    {
      name: "Balaji Auto part store",
      id: "1234567890",
      address: "1/38, Ponmeni, Bypass Road, Madurai- 625 016",
    },
    {
      name: "Balaji Auto part store",
      id: "1234567890",
      address: "1/38, Ponmeni, Bypass Road, Madurai- 625 016",
    },
  ];

  return (
    <section className="action-card">
      <div
        className="card-top"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer" }}
      >
        <div>
          <h3>Customers</h3>
          <p className="subtitle">
            Your last month's customers haven't placed any orders this month.
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
          {customerData.map((customer, index) => (
            <div key={index} className="list-item border-bottom">
              <div className="item-details">
                <h4>{customer.name}</h4>
                <p className="id-text">{customer.id}</p>
                <p className="address-text">{customer.address}</p>
              </div>
              <div className="item-action-group">
                <button className={index === 0 ? "primary-btn" : "dark-btn"}>
                  {/* Button text (e.g., Visits or Make Payment) */}
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

export default Customers;
