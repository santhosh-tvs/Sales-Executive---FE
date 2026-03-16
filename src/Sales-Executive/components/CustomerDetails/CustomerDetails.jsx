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
    if (customer?.customer_code || customer?.code) {
      fetchCustomerDetails(customer.customer_code || customer.code);
    }
  }, [customer]);

  const fetchCustomerDetails = async (customerCode) => {
    try {
      setLoadingDetails(true);
      const response = await apiService.get(`/profile/view-customer/${customerCode}`);
      
      if (response.success && response.user_detail) {
        const viewCustomerData = response.user_detail;
        
        // Fetch financial details if account number exists
        let financialData = null;
        if (viewCustomerData.account_number) {
          try {
            const { customerDetails: customerDetailsAPI } = await import('../../../services/api');
            const detailsResponse = await customerDetailsAPI({ 
              accountNumber: viewCustomerData.account_number.toString() 
            });
            if (detailsResponse) {
              financialData = detailsResponse;
            }
          } catch (err) {
            console.error('Error fetching financial details:', err);
          }
        }
        
        // Merge all data
        const completeData = {
          ...viewCustomerData,
          creditBalance: financialData?.availablecreditlimit?.toFixed(2) || '0.00',
          creditLimit: financialData?.creditLimit?.toString() || viewCustomerData.credit_limit || '0.25',
          overDueInvoice: financialData?.noofoverdueinvoices?.toString() || '0',
          overDueAmount: financialData?.overdueamount?.toFixed(2) || '0.00',
          totalOutstanding: financialData?.outstandingamount?.toFixed(2) || '0.00',
          fullAddress: [
            viewCustomerData.address1,
            viewCustomerData.address2,
            viewCustomerData.address3,
            viewCustomerData.city,
            viewCustomerData.state,
            viewCustomerData.post_code
          ].filter(Boolean).join(', '),
          shipToOptions: [{
            code: viewCustomerData.site_number || 'N/A',
            name: viewCustomerData.site_code || viewCustomerData.customer_name,
            address: [
              viewCustomerData.address1,
              viewCustomerData.address2,
              viewCustomerData.city,
              viewCustomerData.state,
              viewCustomerData.post_code
            ].filter(Boolean).join(', ')
          }]
        };
        
        setCustomerDetails(completeData);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(customerDetails, selectedShipTo);
    }
  };

  if (loadingDetails) {
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
                          setSelectedShipTo(option);
                          setShowShipToDropdown(false);
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
        <button className="customer-details-continue-btn" onClick={handleContinue}>
          {continueButtonText}
        </button>
      </div>
    </div>
  );
};

export default CustomerDetails;
