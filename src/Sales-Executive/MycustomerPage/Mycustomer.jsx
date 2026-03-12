import React from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { viewCustomerAPI } from '../../services/api';
import apiConfigManager from '../../services/apiConfig';
import "./Mycustomer.css";

const MyCustomer = () => {
  const navigate = useNavigate();

  // Fetch customer details and update API configuration
  const fetchAndSetCustomerConfig = async (customerCode) => {
    try {
      console.log('🔄 Fetching customer details for:', customerCode);
      
      const response = await viewCustomerAPI(customerCode);
      
      if (response && response.success) {
        console.log('✅ Customer details fetched:', response.user_detail);
        
        // Update API configuration with customer-specific API list
        // This also stores customer details in localStorage
        const updated = apiConfigManager.updateFromCustomer(response);
        
        if (updated) {
          console.log('✅ API configuration updated for customer:', customerCode);
        } else {
          console.warn('⚠️ Could not update API configuration for customer:', customerCode);
        }
        
        return response.user_detail;
      } else {
        console.error('❌ Failed to fetch customer details:', response?.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching customer details:', error);
      return null;
    }
  };

  // Navigation functions
  const handleOrderClick = async (customer) => {
    // Fetch customer details and update API config before navigating
    const customerDetails = await fetchAndSetCustomerConfig(customer.code);
    
    // Navigate to create order page with customer data
    navigate('/create-order', { 
      state: { 
        selectedCustomer: {
          id: customer.code,
          customerCode: customer.code,
          customerName: customer.name,
          customerDetails: customerDetails,
        }
      }
    });
  };

  const handleCollectionsClick = async (customer) => {
    // Fetch customer details and update API config
    await fetchAndSetCustomerConfig(customer.code);
    
    // Navigate to my collections page
    navigate('/my-collections');
  };

  const handleVisitClick = async (customer) => {
    // Fetch customer details and update API config
    await fetchAndSetCustomerConfig(customer.code);
    
    // Navigate to view plan page for visits
    navigate('/view-plan');
  };

  const handleDetailsClick = async (customer) => {
    // Fetch customer details and update API config
    const customerDetails = await fetchAndSetCustomerConfig(customer.code);
    
    // Navigate to customer summary page
    navigate('/customer-summary', {
      state: {
        customer: customer,
        customerDetails: customerDetails
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
