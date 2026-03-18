import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CustomerDetails from '../../components/CustomerDetails/CustomerDetails';
import './receipt.css';
import ChequeImg from '../Assets/cheque.jpg';
import ChallanImg from '../Assets/challan.jpg';
import MoneyImg from '../Assets/money.png';
import UpiImg from '../Assets/upi.png';
import Demand from '../Assets/dd.png';
import apiService from '../../../services/apiservice';

const ReceiptPage = () => {
  const [view, setView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    receiptAmount: '',
    receiptDate: new Date().toISOString().split('T')[0],
    chequeNumber: '',
    bankName: '',
    place: '',
    challanDdChequeDate: new Date().toISOString().split('T')[0],
    attachment: null,
    utrNumber: '',
    receiptRemarks: ''
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = search ? { search } : {};
      const response = await apiService.get('/profile/sales-executive-customers', params);
      if (response.success && response.data) {
        setCustomers(response.data.map(customer => ({
          id: customer.customer_id,
          name: customer.customer_name,
          code: customer.customer_code,
          address: `${customer.address1 || ''} ${customer.address2 || ''}, ${customer.city || ''}, ${customer.state || ''} ${customer.post_code || ''}`.trim(),
          gst: customer.gst_number || 'N/A',
          mobile: customer.mobile || 'N/A',
          email: customer.email || 'N/A',
          creditLimit: customer.credit_limit || 'N/A',
          outstandingAmount: customer.outstanding_amount || '₹0'
        })));
      } else {
        setCustomers([]);
        if (search) setError('No customers found');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    fetchCustomers(searchQuery);
  };

  const handleCustomerSelect = async (customer) => {
    try {
      setLoading(true);
      // Fetch complete customer details
      const response = await apiService.get(`/profile/view-customer/${customer.code}`);
      
      if (response.success && response.user_detail) {
        const customerData = response.user_detail;
        console.log('Raw customer data from API:', customerData);
        
        const completeCustomer = {
          ...customer,
          // Customer IDs - try all possible field names
          customer_id: customerData.customer_id,
          customer_site_id: customerData.customer_site_id || customerData.site_id || customerData.site_number,
          site_id: customerData.site_id || customerData.site_number,
          site_number: customerData.site_number,
          customer_site_code: customerData.site_code,
          site_code: customerData.site_code,
          customer_code: customerData.customer_code,
          customer_number: customerData.customer_number,
          
          // Company details
          company_name: customerData.company_detail?.company_name || customerData.company_name,
          company_code: customerData.company_detail?.company_code || customerData.company_code,
          company_id: customerData.company_detail?.company_id || customerData.company_id,
          company_detail: customerData.company_detail,
          
          // Business unit
          unit_code: customerData.unit_code,
          unit_name: customerData.unit_name,
          business_unit_id: customerData.business_unit_id,
          business_unit: customerData.unit_code,
          
          // Contact details
          gst_number: customerData.gst_number || customer.gst,
          phone_number: customerData.phone_number || customer.mobile,
          email_address: customerData.email_address || customer.email,
          
          // Address
          address1: customerData.address1,
          address2: customerData.address2,
          address3: customerData.address3,
          city: customerData.city,
          state: customerData.state,
          post_code: customerData.post_code,
          
          // Financial
          credit_limit: customerData.credit_limit,
          outstanding_amount: customerData.outstanding_amount || customer.outstandingAmount,
          
          // ERP
          erp_id: customerData.erp?.erp_id,
          erp_name: customerData.erp?.erp_name,
          
          // Warehouse
          warehouse_id: customerData.warehouse?.warehouse_id,
          warehouse_name: customerData.warehouse?.warehouse_name,
          
          // Keep original fields for backward compatibility
          gst: customerData.gst_number || customer.gst,
          mobile: customerData.phone_number || customer.mobile,
          email: customerData.email_address || customer.email,
          outstandingAmount: customerData.outstanding_amount || customer.outstandingAmount
        };
        
        console.log('Mapped customer data:', completeCustomer);
        setSelectedCustomer(completeCustomer);
      } else {
        console.warn('Failed to fetch customer details, using basic data');
        setSelectedCustomer(customer);
      }
      setView('orders');
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setSelectedCustomer(customer);
      setView('orders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateExcessAmount = () => {
    const amount = parseFloat(formData.receiptAmount) || 0;
    // This would be calculated based on actual invoice amount
    // For now, returning a sample calculation
    return amount > 0 ? (amount * 0.1).toFixed(2) : '0.00';
  };

  const handleSubmitReceipt = async () => {
    try {
      // Validation
      if (!formData.receiptAmount || parseFloat(formData.receiptAmount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      // Validate mandatory fields
      if (!selectedCustomer?.customer_id) {
        alert('Customer ID is missing. Please select customer again.');
        return;
      }

      // Additional validation for specific payment methods
      if (['Cheque', 'DD', 'Challan'].includes(selectedMethod)) {
        if (!formData.chequeNumber) {
          alert(`Please enter ${selectedMethod} number`);
          return;
        }
        if (!formData.bankName) {
          alert('Please enter bank name');
          return;
        }
        if (selectedMethod !== 'Challan' && !formData.place) {
          alert('Please enter place');
          return;
        }
      }

      setSubmitting(true);

      // Get company name from customer details or use default
      const companyName = selectedCustomer?.company_name || selectedCustomer?.company_detail?.company_name || 'Tvs Automobile solutions';
      
      // Get customer site ID - try multiple possible field names
      const customerSiteId = selectedCustomer?.customer_site_id || selectedCustomer?.site_id ||
                            selectedCustomer?.site_number ||
                            selectedCustomer?.customer_id; // Fallback to customer_id if site_id not available

      // Prepare API payload matching the working example
      const receiptData = {
        Source: 'MCollect',
        UniqueId: Math.floor(Math.random() * 2147483647), // Generate unique ID within INT range
        LegalEntity: companyName,
        BusinessUnit: selectedCustomer?.unit_code || selectedCustomer?.business_unit || 'DEFAULT',
        CustomerId: selectedCustomer?.customer_id,
        CustomerNumber: selectedCustomer?.code || selectedCustomer?.customer_code || selectedCustomer?.customer_number,
        CustomerSiteId: customerSiteId,
        CustomerSiteCode: selectedCustomer?.customer_site_code || selectedCustomer?.site_code || selectedCustomer?.name,
        CustomerName: selectedCustomer?.name || selectedCustomer?.customer_name,
        ReceiptMethod: selectedMethod,
        UTRNumber: formData.chequeNumber || null,
        ReceiptRefNum: `MC${Date.now()}`, // Generate receipt reference number
        ReceiptDate: formData.receiptDate,
        ReceiptAmount: parseFloat(formData.receiptAmount),
        ReceiptCurrency: 'INR',
        OrderNumber: '',
        Bank: formData.bankName || null,
        ReceiptMode: selectedMethod,
        ReceiptRemarks: '',
        Deduction: '',
        ExchangeRateType: '',
        ExchangeRate: '',
        ExchangeDate: formData.receiptDate,
        ApplicationType: 'On Account',
        AppliedInvoiceId: '',
        appliedInvoiceNumber: '',
        AppliedAmount: 0,
        ApplicationDate: formData.receiptDate,
        VirtualAccountNumber: '',
        ProcessFlag: '',
        ProcessMessage: '',
        ChequeNo: formData.chequeNumber || null,
        DraweeBank: formData.bankName || null,
        PaymentFor: '',
        ChallanDdChequeNumber: formData.chequeNumber || null,
        ChallanDdChequeDate: formData.challanDdChequeDate || null,
        Place: formData.place || null,
        Attachment: formData.attachment || null
      };

      console.log('Creating receipt with data:', receiptData);
      console.log('Selected customer data:', selectedCustomer);

      const response = await apiService.post('/receipt/create-receipt', receiptData);

      if (response.success) {
        alert('Receipt created successfully!');
        // Reset form and go back to list
        setFormData({
          receiptAmount: '',
          receiptDate: new Date().toISOString().split('T')[0],
          chequeNumber: '',
          bankName: '',
          place: '',
          challanDdChequeDate: new Date().toISOString().split('T')[0],
          attachment: null,
          utrNumber: '',
          receiptRemarks: ''
        });
        setSelectedMethod('Cash');
        setView('list');
        setSelectedCustomer(null);
        fetchCustomers(); // Refresh customer list
      } else {
        alert(response.message || 'Failed to create receipt');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create receipt. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportReceipts = async () => {
    try {
      // Fetch employee/company info from profile
      let employeeCode = '-';
      let employeeName = '-';
      let companyName = '-';
      try {
        const profileRes = await apiService.get('/profile/user-details');
        if (profileRes.success && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          employeeCode = p.sales_executive_code || '-';
          employeeName = p.name || '-';
          companyName = p.company_name || '-';
        }
      } catch {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        employeeName = userData.name || '-';
      }

      // Fetch all receipts
      const listRes = await apiService.get('/receipt/receipt-list', { page: 1, limit: 1000 });
      if (!listRes.success || !listRes.data) {
        alert('No receipts found to export');
        return;
      }

      const flat = [];
      listRes.data.forEach(group => {
        if (group.list) group.list.forEach(r => flat.push(r));
      });

      if (flat.length === 0) {
        alert('No receipts found to export');
        return;
      }

      // Fetch full details for each receipt
      const fullReceipts = await Promise.all(
        flat.map(async (r) => {
          try {
            const res = await apiService.get(`/receipt/view-receipt/${r.customer_receipt_id}`);
            return res.success && res.data ? res.data : r;
          } catch {
            return r;
          }
        })
      );

      const exportData = fullReceipts.map(r => ({
        'COMPANY NAME': companyName,
        'CUSTOMER CODE': r.customer_number || '-',
        'CUSTOMER NAME': r.customer_name || '-',
        'EMPLOYEE CODE': employeeCode,
        'EMPLOYEE NAME': employeeName,
        'RECEIPT NUMBER': r.receipt_ref_number || '-',
        'PAYMENT FOR': 'FIFO',
        'PAYMENT MODE': r.receipt_mode || r.receipt_method || '-',
        'TOTAL AMOUNT': '-',
        'PAID AMOUNT': '-',
        'CHEQUE DD NUMBER': r.challan_dd_cheque_number || r.cheque_no || '-',
        'CHEQUE DD DATE': r.challan_dd_cheque_date
          ? new Date(r.challan_dd_cheque_date).toLocaleDateString('en-IN')
          : '-',
        'BANK NAME': r.bank || r.drawee_bank || '-',
        'PLACE': r.place || '-',
        'CREATED AT': r.created_at
          ? new Date(r.created_at).toLocaleString('en-IN')
          : '-',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receipts');

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key] || '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `Receipt_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export receipts. Please try again.');
    }
  };

  // Payment Methods Array with Images
  const paymentMethods = [
    { name: 'Cash', img: MoneyImg },
    { name: 'Cheque', img: ChequeImg },
    { name: 'DD', img: Demand },
    { name: 'Challan', img: ChallanImg },
    { name: 'UPI Payment', img: UpiImg }
  ];


  // ... rest of the ListView and OrdersView components stay same
  return (
    <>
      <Header />
      <div className="receipt-page-container">
        <div className="receipt-content">
          <div className="receipt-header">
            <Breadcrumb currentPage="Receipt" />
            {view === 'list' && (
              <div className="header-controls">
                <input 
                  type="text" 
                  placeholder="Enter Customer Name / Code" 
                  className="header-search-bar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="header-btn-submit" onClick={handleSearch}>
                  Submit
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Navigation Buttons */}
          {view === 'list' && (
            <div className="quick-nav-section">
              <button className="quick-nav-btn" onClick={() => window.location.href = '/receipt-history'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Receipt History
              </button>
              <button className="quick-nav-btn" onClick={handleExportReceipts}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export Report
              </button>
            </div>
          )}
          
          {view === 'list' && <ListView customers={customers} handleCustomerSelect={handleCustomerSelect} loading={loading} error={error} />}
          {view === 'orders' && <OrdersView selectedCustomer={selectedCustomer} setView={setView} />}
          {view === 'payment' && <PaymentView 
            formData={formData}
            handleInputChange={handleInputChange}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            paymentMethods={paymentMethods}
            calculateExcessAmount={calculateExcessAmount}
            setView={setView}
            handleSubmitReceipt={handleSubmitReceipt}
            submitting={submitting}
          />}
        </div>
      </div>
    </>
  );
};

// Simplified Sub-components for brevity
const ListView = ({ customers, handleCustomerSelect, loading, error }) => (
  <div className="view-container">
    {loading ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>
    ) : error ? (
      <div className="error-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#dc3545" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#dc3545"/>
        </svg>
        <p className="error-message">{error}</p>
      </div>
    ) : customers.length === 0 ? (
      <div className="empty-container">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="empty-message">No customers found</p>
        <p className="empty-submessage">Try adjusting your search criteria</p>
      </div>
    ) : (
      <div className="list-wrapper">
        {customers.map((c, i) => (
          <div key={c.customer_id || i} className="customer-card" onClick={() => handleCustomerSelect(c)}>
            <div className="card-content">
              <div className="customer-info">
                <h3>{c.name}</h3>
                <p>{c.code}</p>
              </div>
              <div className="receipt-icon-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="receipt-icon">
                  <path d="M4 2V22L6 20L8 22L10 20L12 22L14 20L16 22L18 20L20 22V2H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const OrdersView = ({ selectedCustomer, setView }) => {
  const handleContinue = () => {
    setView('payment');
  };

  return (
    <div className="view-container">
      <CustomerDetails 
        customer={selectedCustomer}
        onContinue={handleContinue}
        continueButtonText="Continue to Create Receipt"
        showShipTo={false}
      />
    </div>
  );
};

export default ReceiptPage;


// Payment View Component - Moved outside to prevent re-creation on each render
const PaymentView = ({ 
  formData, 
  handleInputChange, 
  selectedMethod, 
  setSelectedMethod, 
  paymentMethods,
  calculateExcessAmount,
  setView,
  handleSubmitReceipt,
  submitting
}) => {
  const showExtraDetails = ['Cheque', 'DD', 'Challan'].includes(selectedMethod);
  const isCash = selectedMethod === 'Cash';
  const isUPI = selectedMethod === 'UPI Payment';
  const excessAmount = calculateExcessAmount();

  return (
    <div className="view-container">
      {/* Enhanced Payment Section */}
      <div className="payment-section-enhanced">
        <div className="payment-amount-section-enhanced">
          <div className="section-header-enhanced">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="payment-heading-enhanced">Enter Amount to Pay</h3>
              <p className="payment-subheading">Enter the payment amount for this receipt</p>
            </div>
          </div>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input 
              type="number" 
              placeholder="0.00" 
              className="pay-field-enhanced" 
              step="0.01"
              min="0"
              value={formData.receiptAmount}
              onChange={(e) => handleInputChange('receiptAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="payment-method-section-enhanced">
          <div className="section-header-enhanced">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="payment-heading-enhanced">Select Payment Method</h3>
              <p className="payment-subheading">Choose your preferred payment option</p>
            </div>
          </div>
          <div className="payment-methods-row-enhanced">
            {paymentMethods.map(m => (
              <div 
                key={m.name} 
                className={`method-item-enhanced ${selectedMethod === m.name ? 'active-method-enhanced' : ''}`}
                onClick={() => setSelectedMethod(m.name)}
              >
                <div className="method-icon-box-enhanced">
                  <img src={m.img} alt={m.name} className="method-img-ui-enhanced" />
                </div>
                <span className="method-name-enhanced">{m.name}</span>
                {selectedMethod === m.name && (
                  <div className="selected-indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isCash && formData.receiptAmount && (
        <div className="excess-amt-card-enhanced">
          <div className="info-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="excess-content">
            <p className="msg-text-enhanced">Change to Return</p>
            <h2 className="amt-display-enhanced">₹{excessAmount}</h2>
            <p className="msg-subtext">Please verify the amount before proceeding</p>
          </div>
        </div>
      )}

      {isUPI && (
        <div className="development-msg-enhanced">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#20409A" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="#20409A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="development-title">UPI Payment Coming Soon</p>
          <p className="development-subtitle">We're working on integrating UPI payment gateway</p>
        </div>
      )}

      {showExtraDetails && (
        <div className="cheque-details-enhanced">
          <div className="details-header">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h4 className="section-title-enhanced">{selectedMethod} Payment Details</h4>
              <p className="section-subtitle">Please provide the following information</p>
            </div>
          </div>
          <div className="cheque-form-grid-enhanced">
            <div className="form-inputs-enhanced">
              <div className="input-group-enhanced">
                <label className="input-label-enhanced">
                  {selectedMethod} Number <span className="required-star">*</span>
                </label>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder={`Enter ${selectedMethod} Number`}
                  value={formData.chequeNumber}
                  onChange={(e) => handleInputChange('chequeNumber', e.target.value)}
                />
              </div>
              <div className="input-group-enhanced">
                <label className="input-label-enhanced">
                  Bank Name <span className="required-star">*</span>
                </label>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Enter Bank Name"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                />
              </div>
              {selectedMethod !== 'Challan' && (
                <div className="input-group-enhanced">
                  <label className="input-label-enhanced">
                    Place <span className="required-star">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="Enter Place"
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="form-extras-enhanced">
              <div className="input-group-enhanced">
                <label className="input-label-enhanced">
                  Date <span className="required-star">*</span>
                </label>
                <div className="date-input-wrapper">
                  <input 
                    type="date" 
                    className="modern-input date-input" 
                    value={formData.challanDdChequeDate} 
                    onChange={(e) => handleInputChange('challanDdChequeDate', e.target.value)}
                  />
                  <svg className="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="input-group-enhanced">
                <label className="input-label-enhanced">
                  Attachment <span className="optional-text">(Optional)</span>
                </label>
                <div className="upload-zone-enhanced">
                  <input 
                    type="file" 
                    id="attachment-upload"
                    style={{ display: 'none' }}
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleInputChange('attachment', file.name);
                      }
                    }}
                  />
                  <label htmlFor="attachment-upload" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="upload-text">Click to upload or drag and drop</span>
                    <span className="upload-subtext">PNG, JPG, PDF (Max 10MB)</span>
                    {formData.attachment && (
                      <span className="upload-filename">{formData.attachment}</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="footer-actions-enhanced">
        <button 
          className="btn-close-enhanced" 
          onClick={() => setView('orders')} 
          disabled={submitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cancel
        </button>
        <button 
          className="btn-continue-enhanced" 
          onClick={handleSubmitReceipt}
          disabled={submitting || !formData.receiptAmount}
        >
          {submitting ? (
            <>
              <div className="button-spinner"></div>
              Processing...
            </>
          ) : (showExtraDetails || isCash) ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Complete Payment
            </>
          ) : (
            <>
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 5 19 12 12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
