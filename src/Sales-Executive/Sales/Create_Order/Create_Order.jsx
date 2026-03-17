import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import '../../../styles/Sales/Create_Order/Create_Order.css';
import { apiService } from '../../../services/apiservice';

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

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async (searchQuery = '') => {
    setLoadingCustomers(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setCustomers([]); return; }
      const params = searchQuery ? { search: searchQuery } : {};
      const data = await apiService.get('/profile/sales-executive-customers', params);
      setCustomers(data.success ? (data.data || []) : []);
    } catch (e) {
      console.error('Error fetching customers:', e);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (location.state?.selectedCustomer) {
      const from = location.state.selectedCustomer;
      const match = customers.find(c => c.customer_code === from.customerCode);
      if (match) { setSelectedCustomer(match); setShowCustomerDetail(true); }
    }
  }, [location.state, customers]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) fetchCustomers(searchTerm);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return c.customer_code.toLowerCase().includes(s) || c.customer_name.toLowerCase().includes(s);
  });

  const handleCustomerSelect = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setShowCustomerDetail(true);
      const res = await apiService.get(`/profile/view-customer/${customer.customer_code}`);
      if (res.success && res.user_detail) {
        const d = res.user_detail;
        const { default: apiConfigManager } = await import('../../../services/apiConfig');
        apiConfigManager.updateFromCustomer(res);
        let details = null;
        if (d.account_number) {
          const { customerDetails } = await import('../../../services/api');
          details = await customerDetails({ accountNumber: d.account_number.toString() });
        }
        setSelectedShipTo(null);
        setSelectedCustomer({
          ...customer, ...d,
          creditBalance: details?.availablecreditlimit?.toFixed(2) ?? '0.00',
          creditLimit: details?.creditLimit?.toString() ?? (d.credit_limit || '0.00'),
          overDueInvoice: details?.noofoverdueinvoices?.toString() ?? '0',
          overDueAmount: details?.overdueamount?.toFixed(2) ?? '0.00',
          totalOutstanding: details?.outstandingamount?.toFixed(2) ?? '0.00',
          fullAddress: [d.address1, d.address2, d.address3, d.city, d.state, d.post_code].filter(Boolean).join(', '),
          shipToOptions: [{
            code: d.site_number || 'N/A',
            name: d.site_code || customer.customer_name,
            address: [d.address1, d.address2, d.city, d.state, d.post_code].filter(Boolean).join(', ')
          }]
        });
      }
    } catch (e) {
      console.error('Error fetching customer details:', e);
      setSelectedCustomer(customer);
      setShowCustomerDetail(true);
    }
  };

  const handleContinue = () => {
    if (!selectedShipTo) { alert('Please select a Ship To address before continuing'); return; }
    navigate('/brands');
  };

  return (
    <div className="create-order-container">
      <Header />
      <Breadcrumb currentPage="Create Orders" />

      <div className="create-order-content">
        {!showCustomerDetail ? (
          <>
            {/* Page header */}
            <div className="co-page-header">
              <div>
                <h1>Create Orders</h1>
                <p>Select a customer to create an order</p>
              </div>
              <div className="co-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name or code"
                />
              </div>
            </div>

            {/* Customer list */}
            <div className="co-card">
              <div className="co-card-header">
                <span>{searchTerm ? 'Search Results' : 'Top Customers'}</span>
                {filteredCustomers.length > 0 && (
                  <span className="co-card-hint">Click to select</span>
                )}
              </div>

              {loadingCustomers ? (
                <div className="co-empty">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="co-empty">
                  {searchTerm ? 'No customers found.' : 'No customers available.'}
                </div>
              ) : (
                <table className="co-table">
                  <tbody>
                    {filteredCustomers.map((c, i) => (
                      <tr key={c.customer_id} onClick={() => handleCustomerSelect(c)}>
                        <td className="co-num">{i + 1}</td>
                        <td>
                          <div className="co-customer-row">
                            <span className="co-code-badge">{c.customer_code}</span>
                            <span className="co-customer-name">{c.customer_name}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* Customer detail */
          <div className="co-detail-card">
            <div className="co-detail-head">
              <h2>{selectedCustomer?.customer_name}</h2>
              <p>{selectedCustomer?.customer_code} &bull; {selectedCustomer?.city || 'N/A'}</p>
            </div>

            <div className="co-detail-body">
              <div className="co-fields-grid">
                <div className="co-field">
                  <span className="co-field-label">Customer ID</span>
                  <span className="co-field-value">{selectedCustomer?.customer_id || 'N/A'}</span>
                </div>
                <div className="co-field">
                  <span className="co-field-label">Email</span>
                  <span className="co-field-value">{selectedCustomer?.email_address || 'N/A'}</span>
                </div>
                <div className="co-field">
                  <span className="co-field-label">Credit Balance</span>
                  <span className="co-field-value">{selectedCustomer?.creditBalance || '0.00'}</span>
                </div>
                <div className="co-field">
                  <span className="co-field-label">Credit Limit</span>
                  <span className="co-field-value">{selectedCustomer?.creditLimit || '0.00'}</span>
                </div>
                <div className="co-field">
                  <span className="co-field-label">Overdue Invoices</span>
                  <span className="co-field-value">{selectedCustomer?.overDueInvoice || '0'}</span>
                </div>
                <div className="co-field">
                  <span className="co-field-label">Overdue Amount</span>
                  <span className="co-field-value">{selectedCustomer?.overDueAmount || '0.00'}</span>
                </div>
                <div className="co-field full">
                  <span className="co-field-label">Total Outstanding</span>
                  <span className="co-field-value">{selectedCustomer?.totalOutstanding || '0.00'}</span>
                </div>
                <div className="co-field full">
                  <span className="co-field-label">Address</span>
                  <span className="co-field-value">{selectedCustomer?.fullAddress || 'N/A'}</span>
                </div>
              </div>

              <hr className="co-divider" />

              {/* Ship To */}
              <div className="co-field full" style={{ position: 'relative' }}>
                <span className="co-field-label">Ship To</span>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <div
                    className={`co-shipto-trigger${selectedShipTo ? ' selected' : ''}`}
                    onClick={() => setShowShipToDropdown(v => !v)}
                  >
                    <span>
                      {selectedShipTo
                        ? `${selectedShipTo.code} / ${selectedShipTo.name}`
                        : 'Select Ship To Address'}
                    </span>
                    <span className={`co-shipto-arrow${showShipToDropdown ? ' open' : ''}`}>▼</span>
                  </div>

                  {showShipToDropdown && (
                    <div className="co-shipto-menu">
                      {selectedCustomer?.shipToOptions?.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`co-shipto-option${selectedShipTo?.code === opt.code ? ' active' : ''}`}
                          onClick={() => { setSelectedShipTo(opt); setShowShipToDropdown(false); }}
                        >
                          <div className="co-shipto-option-title">{opt.code} / {opt.name}</div>
                          <div className="co-shipto-option-addr">{opt.address}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedShipTo && !showShipToDropdown && (
                    <div className="co-shipto-selected-addr">{selectedShipTo.address}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="co-detail-footer">
              <button
                className="co-btn-continue"
                onClick={handleContinue}
                disabled={!selectedShipTo}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create_Order;
