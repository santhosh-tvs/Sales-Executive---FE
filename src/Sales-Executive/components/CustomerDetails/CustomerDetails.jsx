import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiservice';
import './CustomerDetails.css';

const CustomerDetails = ({ 
  customer, 
  onContinue, 
  continueButtonText = "Continue",
  showShipTo = false 
}) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedShipTo, setSelectedShipTo] = useState(null);
  const [showShipToDropdown, setShowShipToDropdown] = useState(false);

  useEffect(() => {
    if (!customer) return;

    // If the customer prop already has complete data (creditBalance, shipToOptions),
    // use it directly — no need to fetch again
    if (customer.creditBalance !== undefined || customer.shipToOptions) {
      setCustomerDetails(customer);
      return;
    }

    // Otherwise fetch (fallback for other callers)
    const code = customer.customer_code || customer.code;
    if (code) fetchCustomerDetails(code);
  }, [customer]);

  const fetchCustomerDetails = async (customerCode) => {
    try {
      setLoadingDetails(true);
      const response = await apiService.get(`/profile/view-customer/${customerCode}`);
      
      if (response.success && response.user_detail) {
        const viewCustomerData = response.user_detail;

        // Show basic data immediately — don't wait for financials
        const basicData = {
          ...viewCustomerData,
          creditBalance: '—', creditLimit: viewCustomerData.credit_limit || '—',
          overDueInvoice: '—', overDueAmount: '—', totalOutstanding: '—',
          fullAddress: [viewCustomerData.address1, viewCustomerData.address2, viewCustomerData.address3, viewCustomerData.city, viewCustomerData.state, viewCustomerData.post_code].filter(Boolean).join(', '),
          shipToOptions: [{
            code: viewCustomerData.site_number || 'N/A',
            name: viewCustomerData.site_code || viewCustomerData.customer_name,
            address: [viewCustomerData.address1, viewCustomerData.address2, viewCustomerData.city, viewCustomerData.state, viewCustomerData.post_code].filter(Boolean).join(', ')
          }]
        };
        setCustomerDetails(basicData);
        setLoadingDetails(false);

        // Load financials in background — update when ready
        if (viewCustomerData.account_number) {
          try {
            const { customerDetails: customerDetailsAPI } = await import('../../../services/api');
            const financialData = await customerDetailsAPI({ accountNumber: viewCustomerData.account_number.toString() });
            if (financialData) {
              setCustomerDetails(prev => ({
                ...prev,
                creditBalance:  financialData.availablecreditlimit?.toFixed(2)  ?? '0.00',
                creditLimit:    financialData.creditLimit?.toString()            ?? (viewCustomerData.credit_limit || '0.00'),
                overDueInvoice: financialData.noofoverdueinvoices?.toString()    ?? '0',
                overDueAmount:  financialData.overdueamount?.toFixed(2)          ?? '0.00',
                totalOutstanding: financialData.outstandingamount?.toFixed(2)    ?? '0.00',
              }));
            }
          } catch (err) {
            console.error('Error fetching financial details:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const geocodeAddress = async (address) => {
    try {
      const encoded = encodeURIComponent(address);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`);
      const data = await res.json();
      if (data?.length) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    } catch { /* ignore */ }
    return { latitude: null, longitude: null };
  };

  const handleContinue = () => {
    if (showShipTo && !selectedShipTo) return;
    if (onContinue) {
      onContinue(customerDetails, selectedShipTo);
    }
  };

  if (loadingDetails && !customerDetails && !customer) {
    return (
      <div className="customer-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading customer details...</p>
      </div>
    );
  }

  const displayData = customerDetails || customer;

  return (
    <div className="customer-details-component">
      {/* Customer Header */}
      <div className="customer-details-header">
        <h2 className="customer-details-name">
          {displayData?.customer_name || displayData?.name}
        </h2>
        <p className="customer-details-code">
          {displayData?.customer_code || displayData?.code} / {displayData?.city || 'NASHIK'}
        </p>
      </div>

      {/* Customer Details Grid */}
      <div className="customer-details-grid">
        <div className="customer-detail-row">
          <div className="customer-detail-item">
            <span className="customer-detail-label">CUSTOMER ID</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.customer_id || displayData?.id || '5'}
            </span>
          </div>
          <div className="customer-detail-item">
            <span className="customer-detail-label">CUSTOMER EMAIL</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.email_address || displayData?.email || 'N/A'}
            </span>
          </div>
        </div>

        <div className="customer-detail-row">
          <div className="customer-detail-item">
            <span className="customer-detail-label">CREDIT BALANCE</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.creditBalance || '0.00'}
            </span>
          </div>
          <div className="customer-detail-item">
            <span className="customer-detail-label">CREDIT LIMIT</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.creditLimit || displayData?.credit_limit || '0.25'}
            </span>
          </div>
        </div>

        <div className="customer-detail-row">
          <div className="customer-detail-item">
            <span className="customer-detail-label">OVER DUE INVOICE</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.overDueInvoice || '0'}
            </span>
          </div>
          <div className="customer-detail-item">
            <span className="customer-detail-label">OVER DUE AMOUNT</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.overDueAmount || displayData?.outstanding_amount || '0.00'}
            </span>
          </div>
        </div>

        <div className="customer-detail-row">
          <div className="customer-detail-item full-width">
            <span className="customer-detail-label">TOTAL OUTSTANDING AMOUNT</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.totalOutstanding || displayData?.outstanding_amount || '0.00'}
            </span>
          </div>
        </div>

        <div className="customer-detail-row">
          <div className="customer-detail-item full-width">
            <span className="customer-detail-label">CUSTOMER ADDRESS</span>
            <span className="customer-detail-colon">:</span>
            <span className="customer-detail-value">
              {displayData?.fullAddress || displayData?.address || 'N/A'}
            </span>
          </div>
        </div>

        {showShipTo && (
          <div className="customer-detail-row">
            <div className="customer-detail-item full-width">
              <span className="customer-detail-label">SHIP TO</span>
              <span className="customer-detail-colon">:</span>
              <div className="ship-to-dropdown-wrapper">
                <div 
                  className="ship-to-dropdown-trigger"
                  onClick={() => setShowShipToDropdown(!showShipToDropdown)}
                >
                  <span className={selectedShipTo ? 'selected' : 'placeholder'}>
                    {selectedShipTo 
                      ? `${selectedShipTo.code} / ${selectedShipTo.name}` 
                      : 'Select Ship To Address'}
                  </span>
                  <span className={`dropdown-arrow ${showShipToDropdown ? 'open' : ''}`}>▼</span>
                </div>
                
                {showShipToDropdown && (
                  <div className="ship-to-dropdown-menu">
                    {displayData?.shipToOptions?.map((option, index) => (
                      <div
                        key={index}
                        className={`ship-to-option ${selectedShipTo?.code === option.code ? 'selected' : ''}`}
                        onClick={() => {
                          const option_selected = option;
                          setSelectedShipTo(option_selected);
                          setShowShipToDropdown(false);
                          // Geocode address and store lat/lon for wishlist use
                          if (option_selected.address) {
                            geocodeAddress(option_selected.address).then(({ latitude, longitude }) => {
                              const enriched = { ...option_selected, latitude, longitude };
                              setSelectedShipTo(enriched);
                              // Store in localStorage for WishlistContext to read
                              try {
                                const stored = JSON.parse(localStorage.getItem('selected_customer') || '{}');
                                localStorage.setItem('selected_customer', JSON.stringify({
                                  ...stored,
                                  latitude,
                                  longitude,
                                  longtitude: longitude,
                                }));
                              } catch { /* ignore */ }
                            });
                          }
                        }}
                      >
                        <div className="ship-to-option-header">
                          {option.code} / {option.name}
                        </div>
                        <div className="ship-to-option-address">
                          {option.address}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showShipTo && selectedShipTo && !showShipToDropdown && (
          <div className="customer-detail-row">
            <div className="customer-detail-item full-width">
              <span className="customer-detail-label"></span>
              <span className="customer-detail-colon"></span>
              <span className="customer-detail-value ship-to-address">
                {selectedShipTo.address}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="customer-details-footer">
        {showShipTo && !selectedShipTo && (
          <p className="ship-to-required-msg">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Please select a Ship To address to continue
          </p>
        )}
        <button
          className="customer-details-continue-btn"
          onClick={handleContinue}
          disabled={showShipTo && !selectedShipTo}
          style={showShipTo && !selectedShipTo ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          {continueButtonText}
        </button>
      </div>
    </div>
  );
};

export default CustomerDetails;
