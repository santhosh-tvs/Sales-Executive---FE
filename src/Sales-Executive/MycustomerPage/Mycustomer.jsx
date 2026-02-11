import React from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import "./Mycustomer.css";

const MyCustomer = () => {
  const navigate = useNavigate();

  // Navigation functions
  const handleOrderClick = (customer) => {
    // Navigate to create order page with customer data
    navigate('/create-order', { 
      state: { 
        selectedCustomer: {
          id: customer.code,
          customerCode: customer.code,
          customerName: customer.name,
          // Add other customer details as needed
        }
      }
    });
  };

  const handleCollectionsClick = (customer) => {
    // Navigate to my collections page
    navigate('/my-collections');
  };

  const handleVisitClick = (customer) => {
    // Navigate to view plan page for visits
    navigate('/view-plan');
  };

  const handleDetailsClick = (customer) => {
    // Navigate to customer summary page
    navigate('/customer-summary', {
      state: {
        customer: customer
      }
    });
  };
  // Sample customer data with unique information
  const customers = [
    { name: "BHALLA MOTORS", code: "PSW_000396" },
    { name: "SHARMA AUTO PARTS", code: "PSW_000397" },
    { name: "KUMAR VEHICLES", code: "PSW_000398" },
    { name: "SINGH MOTORS", code: "PSW_000399" },
    { name: "PATEL AUTO CARE", code: "PSW_000400" },
    { name: "GUPTA SPARE PARTS", code: "PSW_000401" }
  ];

  return (
    <div className="page-container">
      <Header />
      <Breadcrumb currentPage="My Customers" />
      
      {/* Customer Count Card */}
      <div className="stat-card-customer">
        <div className="stat-text">
          <h3>500</h3>
          <p>Total Customers Count</p>
        </div>
        
      </div>

      {/* Search Bar Section */}
      <div className="search-bar-row">
        <input
          type="text"
          placeholder="Enter Customer Name / Code"
          className="search-input"
        />
        <button className="submit-btn">Submit</button>
      </div>

      {/* Customer List Table */}
      <div className="customer-table">
        {customers.map((c, i) => (
          <div key={i} className="customer-row">
            <div className="c-name-section">
              <h4>{c.name}</h4>
              <p>{c.code}</p>
            </div>

            <div className="c-actions-group">
              <div 
                className="action-button"
                onClick={() => handleOrderClick(c)}
                title="Create Order for this customer"
              >
                <span className="icon">⊕</span>
                <span className="label">Order</span>
              </div>
              <div 
                className="action-button"
                onClick={() => handleCollectionsClick(c)}
                title="View Collections for this customer"
              >
                <span className="icon">⊕</span>
                <span className="label">Collections</span>
              </div>
              <div 
                className="action-button"
                onClick={() => handleVisitClick(c)}
                title="Plan Visit for this customer"
              >
                <span className="icon">⊕</span>
                <span className="label">Visit</span>
              </div>
              <div 
                className="action-button"
                onClick={() => handleDetailsClick(c)}
                title="View Customer Details"
              >
                <span className="icon">🔍</span>
                <span className="label">Details</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCustomer;
