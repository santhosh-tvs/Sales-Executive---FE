import React, { useState } from 'react';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ExportReport.css';

const ExportReport = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerName: '',
    paymentMethod: 'all',
    status: 'all'
  });

  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Sample data for preview
  const sampleReceiptData = [
    {
      id: 1,
      receiptNo: 'RCP001234',
      customerName: 'BHALLA MOTORS',
      customerCode: 'PSW_000396',
      orderId: 'IOF25190045358',
      amount: 3200.00,
      paymentMethod: 'Cash',
      receiptDate: '2025-01-10',
      createdBy: 'Sales Executive 1',
      status: 'Completed'
    },
    {
      id: 2,
      receiptNo: 'RCP001235',
      customerName: 'SK AUTO PARTS',
      customerCode: 'EOTN000182',
      orderId: 'IOF25190045359',
      amount: 1750.00,
      paymentMethod: 'Cheque',
      receiptDate: '2025-01-11',
      createdBy: 'Sales Executive 1',
      status: 'Completed'
    },
    {
      id: 3,
      receiptNo: 'RCP001236',
      customerName: 'KUMAR AUTOMOBILES',
      customerCode: 'PSW_000412',
      orderId: 'IOF25190045360',
      amount: 4100.00,
      paymentMethod: 'UPI Payment',
      receiptDate: '2025-01-12',
      createdBy: 'Sales Executive 2',
      status: 'Completed'
    },
    {
      id: 4,
      receiptNo: 'RCP001237',
      customerName: 'RAJA MOTORS',
      customerCode: 'PSW_000425',
      orderId: 'IOF25190045361',
      amount: 2890.00,
      paymentMethod: 'DD',
      receiptDate: '2025-01-13',
      createdBy: 'Sales Executive 1',
      status: 'Completed'
    },
    {
      id: 5,
      receiptNo: 'RCP001238',
      customerName: 'VIJAY AUTO SPARES',
      customerCode: 'EOTN000195',
      orderId: 'IOF25190045362',
      amount: 5600.00,
      paymentMethod: 'Challan',
      receiptDate: '2025-01-14',
      createdBy: 'Sales Executive 3',
      status: 'Completed'
    }
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePreview = () => {
    // Filter data based on filters
    let filtered = [...sampleReceiptData];

    if (filters.startDate) {
      filtered = filtered.filter(item => new Date(item.receiptDate) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(item => new Date(item.receiptDate) <= new Date(filters.endDate));
    }

    if (filters.customerName) {
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(item => 
        item.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase()
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => 
        item.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setPreviewData(filtered);
    setShowPreview(true);
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel...', previewData);
    alert('Excel export functionality will be integrated with backend API');
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...', previewData);
    alert('PDF export functionality will be integrated with backend API');
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      customerName: '',
      paymentMethod: 'all',
      status: 'all'
    });
    setShowPreview(false);
    setPreviewData([]);
  };

  const calculateTotalAmount = () => {
    return previewData.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <>
      <Header />
      <div className="export-report-container">
        <div className="export-report-content">
          {/* Header Section */}
          <div className="export-report-header">
            <Breadcrumb currentPage="Export Report" />
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <h3 className="filter-title">Report Filters</h3>
            <div className="filter-grid">
              <div className="filter-group">
                <label className="filter-label">Start Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">End Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Customer Name</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter customer name"
                  value={filters.customerName}
                  onChange={(e) => handleFilterChange('customerName', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Payment Method</label>
                <select
                  className="filter-input"
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="dd">DD</option>
                  <option value="challan">Challan</option>
                  <option value="upi payment">UPI Payment</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  className="filter-input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-reset" onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reset
              </button>
              <button className="btn-preview" onClick={handleGeneratePreview}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Generate Preview
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="preview-section">
              <div className="preview-header">
                <div className="preview-title-section">
                  <h3 className="preview-title">Report Preview</h3>
                  <span className="preview-count">{previewData.length} Records</span>
                </div>
                <div className="export-buttons">
                  <button className="btn-export excel" onClick={handleExportExcel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Export Excel
                  </button>
                  <button className="btn-export pdf" onClick={handleExportPDF}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Export PDF
                  </button>
                </div>
              </div>

              {previewData.length > 0 ? (
                <>
                  <div className="preview-table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Receipt No</th>
                          <th>Customer Name</th>
                          <th>Customer Code</th>
                          <th>Order ID</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Receipt Date</th>
                          <th>Created By</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td className="receipt-no">{item.receiptNo}</td>
                            <td>{item.customerName}</td>
                            <td>{item.customerCode}</td>
                            <td>{item.orderId}</td>
                            <td className="amount">₹{item.amount.toFixed(2)}</td>
                            <td>
                              <span className={`payment-badge ${item.paymentMethod.toLowerCase().replace(' ', '-')}`}>
                                {item.paymentMethod}
                              </span>
                            </td>
                            <td>{new Date(item.receiptDate).toLocaleDateString('en-IN')}</td>
                            <td>{item.createdBy}</td>
                            <td>
                              <span className={`status-badge ${item.status.toLowerCase()}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="5" className="total-label">Total Amount:</td>
                          <td className="total-amount" colSpan="5">₹{calculateTotalAmount().toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="no-preview-data">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="#ccc"/>
                  </svg>
                  <p>No data found matching the selected filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExportReport;
