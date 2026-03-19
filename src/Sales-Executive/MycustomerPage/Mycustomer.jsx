import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { viewCustomerAPI } from '../../services/api';
import apiConfigManager from '../../services/apiConfig';
import { apiService } from '../../services/apiservice';
import "./Mycustomer.css";

const MyCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await apiService.get('/profile/sales-executive-customers');
      if (response.success && response.data) {
        setTotalCount(response.total_count ?? response.data.length);
        setCustomers(response.data.map(c => ({ name: c.customer_name, code: c.customer_code })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchAndSetCustomerConfig = async (customerCode) => {
    try {
      const response = await viewCustomerAPI(customerCode);
      if (response && response.success) {
        apiConfigManager.updateFromCustomer(response);
        return response.user_detail;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  };

  const handleOrderClick = async (customer) => {
    const customerDetails = await fetchAndSetCustomerConfig(customer.code);
    navigate('/create-order', {
      state: {
        selectedCustomer: {
          id: customer.code,
          customerCode: customer.code,
          customerName: customer.name,
          customerDetails,
        }
      }
    });
  };

  const handleCollectionsClick = async (customer) => {
    await fetchAndSetCustomerConfig(customer.code);
    navigate('/my-collections', { state: { customer } });
  };

  const handleVisitClick = async (customer) => {
    await fetchAndSetCustomerConfig(customer.code);
    navigate('/view-plan', { state: { customer } });
  };

  const handleDetailsClick = async (customer) => {
    const customerDetails = await fetchAndSetCustomerConfig(customer.code);
    navigate('/customer-summary', { state: { customer, customerDetails } });
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <Header />
      <Breadcrumb crumbs={[
        { label: 'Home', path: '/sales-home' },
        { label: 'My Customers' },
      ]} />

      <div className="stat-card-customer">
        <div className="stat-text">
          <h3>{totalCount}</h3>
          <p>Total Customers Count</p>
        </div>
      </div>

      <div className="search-bar-row">
        <input
          type="text"
          placeholder="Enter Customer Name / Code"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table">
        {loadingCustomers ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No customers found.</div>
        ) : filteredCustomers.map((c, i) => (
          <div key={i} className="customer-row">
            <div className="c-name-section">
              <h4>{c.name}</h4>
              <p>{c.code}</p>
            </div>
            <div className="c-actions-group">
              <div className="action-button" onClick={() => handleOrderClick(c)} title="Create Order">
                <span className="icon">⊕</span>
                <span className="label">Order</span>
              </div>
              <div className="action-button" onClick={() => handleCollectionsClick(c)} title="Collections">
                <span className="icon">⊕</span>
                <span className="label">Collections</span>
              </div>
              <div className="action-button" onClick={() => handleVisitClick(c)} title="Visit">
                <span className="icon">⊕</span>
                <span className="label">Visit</span>
              </div>
              <div className="action-button" onClick={() => handleDetailsClick(c)} title="Details">
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
