import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import '../../../styles/Sales/Create_Order/Create_Order.css';
import searchIcon from '../../../assets/Icons/MagnifyingGlass.png';
import { apiService } from '../../../services/apiservice';
import apiConfigManager from '../../../services/apiConfig';

const Create_Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedShipTo, setSelectedShipTo] = useState(null);
  const [showShipToDropdown, setShowShipToDropdown] = useState(false);

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

  // Handle customer selection - fetch complete details from both APIs
  const handleCustomerSelect = async (customer) => {
    try {
      console.log('🔍 Fetching details for customer:', customer.customer_code);
      
      // First, set the basic customer data
      setSelectedCustomer(customer);
      setShowCustomerDetail(true);
      
      // Fetch complete customer details from view-customer API
      const viewCustomerResponse = await apiService.get(`/profile/view-customer/${customer.customer_code}`);
      console.log('📋 View Customer Response:', viewCustomerResponse);
      
      if (viewCustomerResponse.success && viewCustomerResponse.user_detail) {
        const viewCustomerData = viewCustomerResponse.user_detail;
        console.log('✅ View Customer Data:', viewCustomerData);
        
        // Store unit_code and API config from customer data
        apiConfigManager.updateFromCustomer(viewCustomerResponse);
        console.log('✅ API config updated, unit_code:', apiConfigManager.getUnitCode());
        
        // Now fetch financial details using account number
        let customerDetailsData = null;
        if (viewCustomerData.account_number) {
          console.log('🔢 Account Number:', viewCustomerData.account_number);
          
          const { customerDetails: customerDetailsAPI } = await import('../../../services/api');
          const detailsResponse = await customerDetailsAPI({ 
            accountNumber: viewCustomerData.account_number.toString() 
          });
          
          console.log('💰 Customer Details Response:', detailsResponse);
          
          if (detailsResponse) {
            customerDetailsData = detailsResponse;
            console.log('✅ Customer Details Data:', customerDetailsData);
          }
        }
        
        // Merge all data into selectedCustomer
        const completeCustomerData = {
          ...customer,
          ...viewCustomerData,
          // Financial data from customer details API
          creditBalance: customerDetailsData?.availablecreditlimit 
            ? customerDetailsData.availablecreditlimit.toFixed(2) 
            : '0.00',
          creditLimit: customerDetailsData?.creditLimit 
            ? customerDetailsData.creditLimit.toString()
            : (viewCustomerData.credit_limit || '0.00'),
          overDueInvoice: customerDetailsData?.noofoverdueinvoices?.toString() || '0',
          overDueAmount: customerDetailsData?.overdueamount 
            ? customerDetailsData.overdueamount.toFixed(2) 
            : '0.00',
          totalOutstanding: customerDetailsData?.outstandingamount 
            ? customerDetailsData.outstandingamount.toFixed(2) 
            : '0.00',
          // Format address
          fullAddress: [
            viewCustomerData.address1,
            viewCustomerData.address2,
            viewCustomerData.address3,
            viewCustomerData.city,
            viewCustomerData.state,
            viewCustomerData.post_code
          ].filter(Boolean).join(', '),
          // Ship to options (can be multiple in future)
          shipToOptions: [{
            code: viewCustomerData.site_number || 'N/A',
            name: viewCustomerData.site_code || customer.customer_name,
            address: [
              viewCustomerData.address1,
              viewCustomerData.address2,
              viewCustomerData.city,
              viewCustomerData.state,
              viewCustomerData.post_code
            ].filter(Boolean).join(', ')
          }]
        };
        
        // Set default ship-to to null (user must select)
        setSelectedShipTo(null);
        
        setSelectedCustomer(completeCustomerData);
        console.log('✅ Complete Customer Data:', completeCustomerData);
      }
    } catch (error) {
      console.error('❌ Error fetching customer details:', error);
      // Still show the basic customer data even if API fails
      setSelectedCustomer(customer);
      setShowCustomerDetail(true);
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setShowCustomerDetail(false);
    setSelectedCustomer(null);
  };

  // Handle continue to brands page
  const handleContinueToBrands = () => {
    navigate('/brands', {
      state: {
        customerCode: selectedCustomer?.customer_code,
        customerName: selectedCustomer?.customer_name,
        shipTo: selectedShipTo,
      }
    });
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
                  <p className="customer-detail-code">{selectedCustomer?.customer_code} / {selectedCustomer?.city || 'KMS'}</p>
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
                    <span className="detail-label">Customer Email</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.email_address || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Credit Balance</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.creditBalance || '0.00'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Credit Limit</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.creditLimit || '0.00'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Over Due Invoice</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.overDueInvoice || '0'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Over Due Amount</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.overDueAmount || '0.00'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Total Outstanding Amount</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.totalOutstanding || '0.00'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Customer Address</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.fullAddress || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width" style={{ position: 'relative' }}>
                    <span className="detail-label">Ship To</span>
                    <span className="detail-colon">:</span>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div 
                        className="ship-to-dropdown-trigger"
                        onClick={() => setShowShipToDropdown(!showShipToDropdown)}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#fff',
                          minHeight: '40px'
                        }}
                      >
                        <span style={{ color: selectedShipTo ? '#333' : '#999' }}>
                          {selectedShipTo ? `${selectedShipTo.code} / ${selectedShipTo.name}` : 'Select Ship To Address'}
                        </span>
                        <span style={{ fontSize: '12px', transform: showShipToDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </div>
                      
                      {showShipToDropdown && (
                        <div 
                          className="ship-to-dropdown-menu"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            marginTop: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            maxHeight: '250px',
                            overflowY: 'auto'
                          }}
                        >
                          {selectedCustomer?.shipToOptions?.map((option, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedShipTo(option);
                                setShowShipToDropdown(false);
                              }}
                              style={{
                                padding: '14px 16px',
                                cursor: 'pointer',
                                borderBottom: index < selectedCustomer.shipToOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                                backgroundColor: selectedShipTo?.code === option.code ? '#f0f7ff' : '#fff',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedShipTo?.code === option.code ? '#f0f7ff' : '#fff'}
                            >
                              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#20409A', fontSize: '14px' }}>
                                {option.code} / {option.name}
                              </div>
                              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                                {option.address}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedShipTo && !showShipToDropdown && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-label"></span>
                      <span className="detail-colon"></span>
                      <span className="detail-value" style={{ color: '#666', fontSize: '14px' }}>
                        {selectedShipTo.address}
                      </span>
                    </div>
                  </div>
                )}
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