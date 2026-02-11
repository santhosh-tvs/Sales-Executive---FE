import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import '../../../styles/Sales/Create_Order/Create_Order.css';
import searchIcon from '../../../assets/Icons/MagnifyingGlass.png';

const Create_Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Check if customer data was passed from My Customers page
  useEffect(() => {
    if (location.state?.selectedCustomer) {
      const customerFromMyCustomers = location.state.selectedCustomer;
      // Find matching customer in our data or create a new one
      const matchingCustomer = customersData.find(c => 
        c.customerCode === customerFromMyCustomers.customerCode
      );
      
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
        setShowCustomerDetail(true);
      } else {
        // Create a customer object with the passed data
        const newCustomer = {
          id: Date.now(),
          customerCode: customerFromMyCustomers.customerCode,
          customerName: customerFromMyCustomers.customerName,
          phone: '9789328983',
          address: '637/4, Aadi Street, Kalaivasal, Madurai',
          email: 'customer@example.com',
          phoneNumber: '938845367',
          status: 'Active',
          customerId: customerFromMyCustomers.id,
          customerEmail: `${customerFromMyCustomers.customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          creditBalance: '25000.00',
          creditLimit: '150000.00',
          overDueInvoice: '3',
          overDueAmount: '85000.25',
          totalOutstandingAmount: '85000.25',
          customerAddress: '637/4, Aadi Street, Kalaivasal, Madurai, TAMIL NADU, 625001.',
          shipTo: `${customerFromMyCustomers.code}/KMS | ${customerFromMyCustomers.customerName}`,
          shipToAddress: '637/4, Aadi Street, Kalaivasal, Madurai, TAMIL NADU, 625001.',
          addresses: [
            {
              id: 1,
              type: 'Customer Address',
              address: '637/4, Aadi Street, Kalaivasal, Madurai, TAMIL NADU, 625001.'
            },
            {
              id: 2,
              type: 'Ship To',
              code: `${customerFromMyCustomers.code}/KMS | ${customerFromMyCustomers.customerName}`,
              address: '637/4, Aadi Street, Kalaivasal, Madurai, TAMIL NADU, 625001.'
            }
          ]
        };
        setSelectedCustomer(newCustomer);
        setShowCustomerDetail(true);
      }
    }
  }, [location.state]);

  // Sample customer data with detailed information
  const [customersData, setCustomersData] = useState([
    {
      id: 1,
      customerCode: 'HGS9273737',
      customerName: 'Sam Automobiles',
      phone: '9789328983',
      address: '637/4, Aadi Street, Kalaivasal, Madurai',
      email: 'sam.automobile.in',
      phoneNumber: '938845367',
      status: 'Active',
      // Detailed information for customer detail view
      customerId: '2790949169',
      customerEmail: 'sam.automobile@gmail.com',
      creditBalance: '34624.52',
      creditLimit: '200000.00',
      overDueInvoice: '9',
      overDueAmount: '403876.98',
      totalOutstandingAmount: '403876.98',
      customerAddress: 'D.NO.6600 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI KURUMBAPATTI Madurai, TAMIL NADU, 624002.',
      shipTo: '98734897/KMS_EWH | SK AUTO PARTS',
      shipToAddress: 'D.NO.6600 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI DINDIGUL, TAMIL NADU, 624002.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'D.NO.6600 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI KURUMBAPATTI Madurai, TAMIL NADU, 624002.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734897/KMS_EWH | SK AUTO PARTS',
          address: 'D.NO.6600 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI DINDIGUL, TAMIL NADU, 624002.'
        },
        {
          id: 3,
          type: 'Billing Address',
          address: 'NO.45 BILLING STREET, MADURAI MAIN ROAD, TAMIL NADU, 625001.'
        }
      ]
    },
    {
      id: 2,
      customerCode: 'KG7836392',
      customerName: 'Vijay Spare parts',
      phone: '9789328983',
      address: '637/4, Aadi Street, Kalaivasal, Madurai',
      email: 'sam.automobile.in',
      phoneNumber: '938845367',
      status: 'Active',
      // Detailed information
      customerId: '2790949170',
      customerEmail: 'vijay.spareparts@gmail.com',
      creditBalance: '25000.00',
      creditLimit: '150000.00',
      overDueInvoice: '5',
      overDueAmount: '125000.50',
      totalOutstandingAmount: '125000.50',
      customerAddress: 'NO.45 MAIN ROAD, KALAIVASAL, MADURAI, TAMIL NADU, 625001.',
      shipTo: '98734898/KMS_VJ | VIJAY SPARE PARTS',
      shipToAddress: 'NO.45 MAIN ROAD, KALAIVASAL, MADURAI, TAMIL NADU, 625001.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'NO.45 MAIN ROAD, KALAIVASAL, MADURAI, TAMIL NADU, 625001.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734898/KMS_VJ | VIJAY SPARE PARTS',
          address: 'NO.45 MAIN ROAD, KALAIVASAL, MADURAI, TAMIL NADU, 625001.'
        }
      ]
    },
    {
      id: 3,
      customerCode: 'BA21373812',
      customerName: 'AK Auto Parts',
      phone: '9789328983',
      address: '637/4, Aadi Street, Kalaivasal, Madurai',
      email: 'sam.automobile.in',
      phoneNumber: '938845367',
      status: 'Active',
      // Detailed information
      customerId: '2790949171',
      customerEmail: 'ak.autoparts@gmail.com',
      creditBalance: '18500.75',
      creditLimit: '100000.00',
      overDueInvoice: '3',
      overDueAmount: '85000.25',
      totalOutstandingAmount: '85000.25',
      customerAddress: 'SHOP NO.12, AUTO PARTS COMPLEX, MADURAI MAIN ROAD, TAMIL NADU, 625002.',
      shipTo: '98734899/KMS_AK | AK AUTO PARTS',
      shipToAddress: 'SHOP NO.12, AUTO PARTS COMPLEX, MADURAI MAIN ROAD, TAMIL NADU, 625002.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'SHOP NO.12, AUTO PARTS COMPLEX, MADURAI MAIN ROAD, TAMIL NADU, 625002.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734899/KMS_AK | AK AUTO PARTS',
          address: 'SHOP NO.12, AUTO PARTS COMPLEX, MADURAI MAIN ROAD, TAMIL NADU, 625002.'
        }
      ]
    },
    {
      id: 4,
      customerCode: 'KOWF92777',
      customerName: 'John Automobiles',
      phone: '9789328983',
      address: '637/4, Aadi Street, Kalaivasal, Madurai',
      email: 'sam.automobile.in',
      phoneNumber: '938845367',
      status: 'Active',
      // Detailed information
      customerId: '2790949172',
      customerEmail: 'john.automobiles@gmail.com',
      creditBalance: '42000.00',
      creditLimit: '250000.00',
      overDueInvoice: '7',
      overDueAmount: '195000.80',
      totalOutstandingAmount: '195000.80',
      customerAddress: 'NO.78, AUTOMOBILE STREET, CENTRAL MADURAI, TAMIL NADU, 625003.',
      shipTo: '98734900/KMS_JA | JOHN AUTOMOBILES',
      shipToAddress: 'NO.78, AUTOMOBILE STREET, CENTRAL MADURAI, TAMIL NADU, 625003.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'NO.78, AUTOMOBILE STREET, CENTRAL MADURAI, TAMIL NADU, 625003.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734900/KMS_JA | JOHN AUTOMOBILES',
          address: 'NO.78, AUTOMOBILE STREET, CENTRAL MADURAI, TAMIL NADU, 625003.'
        }
      ]
    },
    {
      id: 5,
      customerCode: 'TYU123456',
      customerName: 'Honda Parts Center',
      phone: '9876543210',
      address: '123, Main Road, Chennai',
      email: 'honda.parts@example.in',
      phoneNumber: '987654321',
      status: 'Active',
      // Detailed information
      customerId: '2790949173',
      customerEmail: 'honda.parts@gmail.com',
      creditBalance: '15000.00',
      creditLimit: '120000.00',
      overDueInvoice: '2',
      overDueAmount: '65000.00',
      totalOutstandingAmount: '65000.00',
      customerAddress: 'NO.123, MAIN ROAD, CHENNAI, TAMIL NADU, 600001.',
      shipTo: '98734901/KMS_HP | HONDA PARTS CENTER',
      shipToAddress: 'NO.123, MAIN ROAD, CHENNAI, TAMIL NADU, 600001.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'NO.123, MAIN ROAD, CHENNAI, TAMIL NADU, 600001.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734901/KMS_HP | HONDA PARTS CENTER',
          address: 'NO.123, MAIN ROAD, CHENNAI, TAMIL NADU, 600001.'
        }
      ]
    },
    {
      id: 6,
      customerCode: 'MNB987654',
      customerName: 'Maruti Service Hub',
      phone: '8765432109',
      address: '456, Service Lane, Coimbatore',
      email: 'maruti.service@example.in',
      phoneNumber: '876543210',
      status: 'Inactive',
      // Detailed information
      customerId: '2790949174',
      customerEmail: 'maruti.service@gmail.com',
      creditBalance: '8000.00',
      creditLimit: '80000.00',
      overDueInvoice: '1',
      overDueAmount: '35000.00',
      totalOutstandingAmount: '35000.00',
      customerAddress: 'NO.456, SERVICE LANE, COIMBATORE, TAMIL NADU, 641001.',
      shipTo: '98734902/KMS_MS | MARUTI SERVICE HUB',
      shipToAddress: 'NO.456, SERVICE LANE, COIMBATORE, TAMIL NADU, 641001.',
      // Multiple addresses for dropdown
      addresses: [
        {
          id: 1,
          type: 'Customer Address',
          address: 'NO.456, SERVICE LANE, COIMBATORE, TAMIL NADU, 641001.'
        },
        {
          id: 2,
          type: 'Ship To',
          code: '98734902/KMS_MS | MARUTI SERVICE HUB',
          address: 'NO.456, SERVICE LANE, COIMBATORE, TAMIL NADU, 641001.'
        }
      ]
    }
  ]);

  // Filter customers based on search term - prioritize Customer Code and Name
  const filteredCustomers = customersData.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.customerCode.toLowerCase().includes(searchLower) ||
      customer.customerName.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      customer.address.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phoneNumber.toLowerCase().includes(searchLower) ||
      customer.status.toLowerCase().includes(searchLower)
    );
  });

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
    setSelectedAddress('');
    setShowAddressDropdown(false);
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressDropdown(false);
  };

  // Handle continue to brands page
  const handleContinueToBrands = () => {
    if (selectedAddress) {
      // Navigate to brands page - you can create this route
      navigate('/brands');
    }
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
                    <img src={searchIcon} alt="Search" className="search-icon" />
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
                  <table className="customers-table">
                    <tbody>
                      {filteredCustomers.map((customer, index) => (
                        <tr 
                          key={customer.id} 
                          className="customer-row clickable-row"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <td className="customer-number">{index + 1}</td>
                          <td className="customer-info">
                            <div className="customer-code-section">
                              <span className="customer-code-label">Customer Code</span>
                              <span className="customer-code-value">{customer.customerCode}</span>
                            </div>
                            <div className="customer-name-section">
                              <span className="customer-name">{customer.customerName}</span>
                              <span className="customer-phone">{customer.phone}</span>
                            </div>
                          </td>
                          <td className="customer-address">
                            {customer.address}
                          </td>
                          <td className="customer-contact">
                            <div className="contact-info">
                              <div className="email-info">
                                <span className="contact-label">Email:</span>
                                <span className="contact-value">{customer.email}</span>
                              </div>
                              <div className="phone-info">
                                <span className="contact-label">Ph no:</span>
                                <span className="contact-value">{customer.phoneNumber}</span>
                              </div>
                            </div>
                          </td>
                          <td className="customer-status">
                            <div className="status-info">
                              <span className="status-label">Status:</span>
                              <span className={`status-value ${customer.status.toLowerCase()}`}>
                                {customer.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <h2 className="customer-detail-title">{selectedCustomer?.customerName}</h2>
                  <p className="customer-detail-code">{selectedCustomer?.customerCode} / KMS</p>
                </div>
              </div>
              
              <div className="customer-detail-content">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Customer ID</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customerId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer Email</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customerEmail}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Credit Balance</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.creditBalance}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Credit Limit</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.creditLimit}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Over Due Invoice</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.overDueInvoice}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Over Due Amount</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.overDueAmount}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Total Outstanding Amount</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.totalOutstandingAmount}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Customer Address</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{selectedCustomer?.customerAddress}</span>
                  </div>
                </div>

                {/* Address Selection Dropdown */}
                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">Ship To</span>
                    <span className="detail-colon">:</span>
                    <div className="address-dropdown-container">
                      <div 
                        className="address-dropdown-trigger"
                        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                      >
                        <span className="selected-address">
                          {selectedAddress ? 
                            `${selectedAddress.code ? selectedAddress.code + ' | ' : ''}${selectedAddress.address}` : 
                            'Select Address'
                          }
                        </span>
                        <span className={`dropdown-arrow ${showAddressDropdown ? 'open' : ''}`}>▼</span>
                      </div>
                      
                      {showAddressDropdown && (
                        <div className="address-dropdown-menu">
                          {selectedCustomer?.addresses?.map((address) => (
                            <div 
                              key={address.id}
                              className="address-dropdown-item"
                              onClick={() => handleAddressSelect(address)}
                            >
                              <div className="address-text">{address.address}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="customer-detail-footer">
                <div className="continue-button-container">
                  <button 
                    className={`continue-button ${!selectedAddress ? 'disabled' : ''}`}
                    onClick={handleContinueToBrands}
                    disabled={!selectedAddress}
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