import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CustomerDetails from '../../components/CustomerDetails/CustomerDetails';
import '../../../styles/Sales/Create_Order/Create_Order.css';
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
  const handleContinueToBrands = (customerDetails, selectedShipTo) => {
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
            {/* Customer Detail View - uses same component as Receipt page */}
            <CustomerDetails
              customer={selectedCustomer}
              onContinue={handleContinueToBrands}
              continueButtonText="Continue to Create Order"
              showShipTo={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Create_Order;