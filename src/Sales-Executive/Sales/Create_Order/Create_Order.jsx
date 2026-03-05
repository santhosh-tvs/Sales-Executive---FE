import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import '../../../styles/Sales/Create_Order/Create_Order.css';
import searchIcon from '../../../assets/Icons/MagnifyingGlass.png';
import { apiService } from '../../../services/apiservice';

const Create_Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = "") => {
    setLoadingCustomers(true);
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token found");
        setCustomers([]);
        return;
      }

      // Build params object with search parameter if provided
      const params = searchQuery ? { search: searchQuery } : {};

      const data = await apiService.get("/profile/sales-executive-customers", params);

      if (data.success) {
        setCustomers(data.data || []);
      } else {
        console.error("Failed to fetch customers:", data.message);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Check if customer data was passed from My Customers page
  useEffect(() => {
    if (location.state?.selectedCustomer) {
      const customerFromMyCustomers = location.state.selectedCustomer;
      // Find matching customer in our data
      const matchingCustomer = customers.find(c => 
        c.customer_code === customerFromMyCustomers.customerCode
      );
      
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
        setShowCustomerDetail(true);
      }
    }
  }, [location.state, customers]);

  // Filter customers based on search term - prioritize Customer Code and Name
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.customer_code.toLowerCase().includes(searchLower) ||
      customer.customer_name.toLowerCase().includes(searchLower)
    );
  });

  // Fetch customers when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        fetchCustomers(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle customer selection - directly navigate to customer detail
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setShowCustomerDetail(false);
    setSelectedCustomer(null);
  };

  // Handle continue to brands page
  const handleContinueToBrands = () => {
    // Navigate to brands page
    navigate('/brands');
  };

  return (
    <div className="create-order-container">
      <Header />
      <Breadcrumb currentPage="Create Orders" />
      
      {/* Main Content */}
      <div className="create-order-content">
        {!showCustomerDetail ? (
          <>
            {/* Header Section */}
            <div className="page-header">
              <div className="header-left">
                <h1 className="page-title">Create Orders</h1>
                <p>Manually create orders for selected customers</p>
              </div>
              
              <div className="header-right">
                <div className="search-section">
                  <div className="search-input-group">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search Customer Name / Code"
                      className="search-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers Section */}
            <div className="top-customers-section">
              <h2 className="section-title">
                {searchTerm ? 'Recent Search' : 'Top Customers'}
                {filteredCustomers.length > 0 && (
                  <span className="click-hint">Click on a customer to select</span>
                )}
              </h2>
              
              <div className="customers-table-container">
                <div className="customers-table-wrapper">
                  {loadingCustomers ? (
                    <div className="loading-message">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="no-customers-message">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers available. Try searching with a customer code or name.'}
                    </div>
                  ) : (
                    <table className="customers-table">
                      <tbody>
                        {filteredCustomers.map((customer, index) => (
                          <tr 
                            key={customer.customer_id} 
                            className="customer-row clickable-row"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <td className="customer-number">{index + 1}</td>
                            <td className="customer-info">
                              <div className="customer-code-section">
                                <span className="customer-code-label">Customer Code</span>
                                <span className="customer-code-value">{customer.customer_code}</span>
                              </div>
                              <div className="customer-name-section">
                                <span className="customer-name">{customer.customer_name}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Customer Detail View */}
            <div className="customer-detail-card">
              <div className="customer-detail-header-info">
                <div className="customer-detail-header-content">
                  <h2 className="customer-detail-title">{selectedCustomer?.customer_name}</h2>
                  <p className="customer-detail-code">{selectedCustomer?.customer_code}</p>
                </div>
              </div>
              
              <div className="customer-detail-content">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Customer ID</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customer_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer Code</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customer_code}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Customer Name</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customer_name}</span>
                  </div>
                </div>
              </div>

              <div className="customer-detail-footer">
                <div className="continue-button-container">
                  <button 
                    className="continue-button"
                    onClick={handleContinueToBrands}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Create_Order;