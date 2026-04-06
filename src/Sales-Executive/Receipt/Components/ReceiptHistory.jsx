import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Spinner from '../../components/Spinner/Spinner';
import apiService from '../../../services/apiservice';
import './ReceiptHistory.css';
import myTVSLogo from '../../../assets/login/myTVS_Partart_logo.png';

const ReceiptHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptHistoryData, setReceiptHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch receipt history on component mount
  useEffect(() => {
    fetchReceiptHistory();
  }, []);

  const fetchReceiptHistory = async (search = '') => {
    try {
      setLoading(true);
      
      const params = {
        page: 1,
        limit: 1000
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await apiService.get('/receipt/receipt-list', params);
      
      if (response.success && response.data) {
        const transformedData = [];
        
        response.data.forEach(dateGroup => {
          if (dateGroup.list && Array.isArray(dateGroup.list)) {
            dateGroup.list.forEach(receipt => {
              transformedData.push({
                id: receipt.customer_receipt_id,
                receiptNo: receipt.receipt_ref_number || 'N/A',
                customerName: receipt.customer_name || 'N/A',
                customerCode: receipt.customer_number || 'N/A',
                orderId: receipt.order_number || 'N/A',
                amount: parseFloat(receipt.receipt_amount) || 0,
                paymentMethod: receipt.receipt_mode || receipt.receipt_method || 'N/A',
                receiptDate: receipt.receipt_date || receipt.created_at,
                createdBy: receipt.created_by || 'N/A',
                status: receipt.process_flag === 'completed' ? 'Completed' : 'Pending',
                rawData: receipt
              });
            });
          }
        });
        
        setReceiptHistoryData(transformedData);
      } else {
        setReceiptHistoryData([]);
      }
    } catch (err) {
      console.error('Error fetching receipt history:', err);
      setReceiptHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchReceiptHistory(searchTerm);
  };

  const handleViewDetails = async (receipt) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const response = await apiService.get(`/receipt/view-receipt/${receipt.id}`);
      
      if (response.success && response.data) {
        setSelectedReceipt(response.data);
      } else {
        alert('Failed to fetch receipt details');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error fetching receipt details:', error);
      alert('Failed to fetch receipt details');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReceipt(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      'S.No': index + 1,
      'Receipt No': item.receiptNo,
      'Customer Name': item.customerName,
      'Customer Code': item.customerCode,
      'Amount (₹)': item.amount.toFixed(2),
      'Payment Method': item.paymentMethod,
      'Receipt Date': item.receiptDate ? new Date(item.receiptDate).toLocaleDateString('en-IN') : 'N/A',
      'Created By': item.createdBy,
      'Status': item.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receipt History');

    // Auto column widths
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Receipt_History_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Converts an image URL to a base64 data URI for embedding in print windows
  const toBase64 = (url) =>
    fetch(url)
      .then(r => r.blob())
      .then(blob => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }))
      .catch(() => '');

  const handlePrintReceipt = async (receipt) => {
    try {
      // If called from table row, fetch full details first
      // If called from modal, selectedReceipt already has full data
      let data = receipt;

      const isFullData = receipt.receipt_ref_number !== undefined && receipt.customer_number !== undefined;

      if (!isFullData) {
        const receiptId = receipt.id || receipt.customer_receipt_id;
        const response = await apiService.get(`/receipt/view-receipt/${receiptId}`);
        if (!response.success || !response.data) {
          alert('Failed to fetch receipt details for printing');
          return;
        }
        data = response.data;
      }

      // Convert logo to base64 so it works in the standalone print window
      const logoBase64 = await toBase64(myTVSLogo);

      // Fetch user/company info from localStorage (cached)
      let companyName = 'MyTVS';
      let companyAddress = '';
      let salesExecName = '';
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        salesExecName = userData.name || '';
        companyName = userData.company_name || 'MyTVS';
        companyAddress = userData.address || '';
      } catch (_) {}

      const receiptDate = data.receipt_date
        ? new Date(data.receipt_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

      const createdAt = data.created_at
        ? new Date(data.created_at).toLocaleString('en-IN')
        : 'N/A';

      const amount = parseFloat(data.receipt_amount || 0);
      const amountInWords = numberToWords(amount);

      const paymentMode = data.receipt_mode || data.receipt_method || 'N/A';
      const isChequeDDChallan = ['Cheque', 'DD', 'Challan'].includes(paymentMode);

      const chequeSection = isChequeDDChallan ? `
        <tr>
          <td class="label">${paymentMode} Number</td>
          <td class="value">${data.challan_dd_cheque_number || data.cheque_no || 'N/A'}</td>
          <td class="label">Bank</td>
          <td class="value">${data.bank || data.drawee_bank || 'N/A'}</td>
        </tr>
        <tr>
          <td class="label">${paymentMode} Date</td>
          <td class="value">${data.challan_dd_cheque_date ? new Date(data.challan_dd_cheque_date).toLocaleDateString('en-IN') : 'N/A'}</td>
          <td class="label">Place</td>
          <td class="value">${data.place || 'N/A'}</td>
        </tr>
      ` : '';

      const utrSection = data.utr_number ? `
        <tr>
          <td class="label">UTR Number</td>
          <td class="value" colspan="3">${data.utr_number}</td>
        </tr>
      ` : '';

      const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt - ${data.receipt_ref_number || 'N/A'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
    .page { width: 210mm; min-height: 148mm; margin: 0 auto; padding: 10mm 12mm; }

    /* Header */
    .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #20409A; padding-bottom: 8px; margin-bottom: 10px; }
    .company-block { display: flex; flex-direction: column; gap: 3px; }
    .company-block img { height: 38px; width: auto; object-fit: contain; display: block; }
    .company-block p { font-size: 10px; color: #555; margin-top: 2px; }
    .receipt-title-block { text-align: right; }
    .receipt-title-block h2 { font-size: 16px; font-weight: 700; color: #20409A; text-transform: uppercase; letter-spacing: 1px; }
    .receipt-title-block .ref-no { font-size: 11px; font-weight: 700; color: #374151; margin-top: 4px; }
    .receipt-title-block .status-badge { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-completed { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }

    /* Amount Banner */
    .amount-banner { background: linear-gradient(135deg, #20409A, #1a3580); color: #fff; border-radius: 6px; padding: 10px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .amount-banner .label { font-size: 10px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-banner .amount-value { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .amount-banner .amount-words { font-size: 9px; opacity: 0.8; margin-top: 2px; font-style: italic; }
    .amount-banner .payment-mode-badge { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; text-align: center; }

    /* Info Table */
    .info-section { margin-bottom: 8px; }
    .section-heading { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #20409A; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 5px; }
    table.info-table { width: 100%; border-collapse: collapse; }
    table.info-table td { padding: 4px 6px; font-size: 11px; vertical-align: top; }
    table.info-table td.label { font-weight: 700; color: #6b7280; width: 22%; white-space: nowrap; }
    table.info-table td.value { color: #111827; font-weight: 500; width: 28%; }

    /* Two column layout */
    .two-col { display: flex; gap: 10px; margin-bottom: 8px; }
    .two-col .col { flex: 1; }

    /* Footer */
    .receipt-footer { border-top: 1.5px solid #e5e7eb; margin-top: 12px; padding-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-note { font-size: 9px; color: #9ca3af; }
    .signature-block { text-align: center; }
    .signature-line { width: 120px; border-top: 1px solid #374151; margin: 0 auto; }
    .signature-label { font-size: 9px; color: #6b7280; margin-top: 3px; }

    /* Watermark for pending */
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 72px; font-weight: 900; color: rgba(255, 107, 53, 0.08); pointer-events: none; z-index: 0; text-transform: uppercase; letter-spacing: 8px; white-space: nowrap; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 8mm 10mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${data.process_flag !== 'completed' ? '<div class="watermark">Pending</div>' : ''}
  <div class="page">

    <!-- Header -->
    <div class="receipt-header">
      <div class="company-block">
        ${logoBase64 ? `<img src="${logoBase64}" alt="MyTVS" />` : `<h1>${companyName}</h1>`}
        ${companyAddress ? `<p>${companyAddress}</p>` : ''}
        <p>Business Unit: ${data.business_unit || 'N/A'}</p>
      </div>
      <div class="receipt-title-block">
        <h2>Payment Receipt</h2>
        <div class="ref-no">${data.receipt_ref_number || 'N/A'}</div>
        <span class="status-badge ${data.process_flag === 'completed' ? 'status-completed' : 'status-pending'}">
          ${data.process_flag === 'completed' ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>

    <!-- Amount Banner -->
    <div class="amount-banner">
      <div>
        <div class="label">Amount Received</div>
        <div class="amount-value">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="amount-words">${amountInWords}</div>
      </div>
      <div class="payment-mode-badge">
        ${paymentMode}
      </div>
    </div>

    <!-- Customer & Receipt Info -->
    <div class="two-col">
      <div class="col">
        <div class="info-section">
          <div class="section-heading">Customer Details</div>
          <table class="info-table">
            <tr>
              <td class="label">Name</td>
              <td class="value" colspan="3">${data.customer_name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Code</td>
              <td class="value">${data.customer_number || 'N/A'}</td>
            </tr>
            ${data.customer_site_code ? `<tr><td class="label">Site Code</td><td class="value">${data.customer_site_code}</td></tr>` : ''}
          </table>
        </div>
      </div>
      <div class="col">
        <div class="info-section">
          <div class="section-heading">Receipt Details</div>
          <table class="info-table">
            <tr>
              <td class="label">Date</td>
              <td class="value">${receiptDate}</td>
            </tr>
            <tr>
              <td class="label">Source</td>
              <td class="value">${data.source || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Created By</td>
              <td class="value">${data.created_by || salesExecName || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Created At</td>
              <td class="value">${createdAt}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Payment Details -->
    ${isChequeDDChallan || data.utr_number ? `
    <div class="info-section">
      <div class="section-heading">Payment Details</div>
      <table class="info-table">
        ${chequeSection}
        ${utrSection}
      </table>
    </div>
    ` : ''}

    <!-- Application Details -->
    ${data.order_number || data.application_type ? `
    <div class="info-section">
      <div class="section-heading">Application Details</div>
      <table class="info-table">
        <tr>
          ${data.order_number ? `<td class="label">Order No.</td><td class="value">${data.order_number}</td>` : '<td></td><td></td>'}
          ${data.application_type ? `<td class="label">App. Type</td><td class="value">${data.application_type}</td>` : '<td></td><td></td>'}
        </tr>
        ${data.applied_amount ? `<tr><td class="label">Applied Amt.</td><td class="value">₹${parseFloat(data.applied_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td></td><td></td></tr>` : ''}
      </table>
    </div>
    ` : ''}

    ${data.receipt_remarks ? `
    <div class="info-section">
      <div class="section-heading">Remarks</div>
      <p style="font-size:11px; color:#374151; padding: 4px 6px; background:#fffbeb; border-radius:4px; border:1px solid #fde68a;">${data.receipt_remarks}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="receipt-footer">
      <div class="footer-note">
        <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        <p>This is a computer-generated receipt.</p>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Authorised Signatory</div>
      </div>
    </div>

  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        alert('Please allow popups to print the receipt.');
        return;
      }
      printWindow.document.write(printHTML);
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print receipt. Please try again.');
    }
  };

  // Converts a number to Indian English words (e.g. 1250.50 → "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only")
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const toWords = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + toWords(n % 100);
      if (n < 100000) return toWords(Math.floor(n / 1000)) + 'Thousand ' + toWords(n % 1000);
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + 'Lakh ' + toWords(n % 100000);
      return toWords(Math.floor(n / 10000000)) + 'Crore ' + toWords(n % 10000000);
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = 'Rupees ' + toWords(rupees).trim();
    if (paise > 0) result += ` and ${toWords(paise).trim()} Paise`;
    return result + ' Only';
  };

  const filteredData = receiptHistoryData.filter(item => {
    const matchesSearch = item.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <>
      <Header />
      <div className="receipt-history-container">
        <div className="receipt-history-content">
          {/* Header Section */}
          <div className="receipt-history-header">
            <Breadcrumb crumbs={[
              { label: 'Home', path: '/sales-home' },
              { label: 'Receipt', path: '/receipt' },
              { label: 'Receipt History' },
            ]} />
            <div className="header-actions">
              <input
                type="text"
                placeholder="Search by Receipt No, Customer..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch} disabled={loading}>
                {loading ? <><Spinner inline size="sm" /> Searching</> : 'Search'}
              </button>
              <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <button className="export-btn" onClick={handleExportExcel} disabled={filteredData.length === 0} title="Export to Excel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-container">
            <table className="receipt-history-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Receipt No</th>
                  <th>Customer Name</th>
                  <th>Customer Code</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Receipt Date</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{startIndex + index + 1}</td>
                      <td className="receipt-no">{item.receiptNo}</td>
                      <td>{item.customerName}</td>
                      <td>{item.customerCode}</td>
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
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewDetails(item)}
                            title="View Details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            className="action-btn print-btn"
                            onClick={() => handlePrintReceipt(item)}
                            title="Print Receipt"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6,18H4a2,2 0,0 1,-2-2V11a2,2 0,0 1,2-2H20a2,2 0,0 1,2,2v5a2,2 0,0 1,-2,2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      <div className="no-data-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2"/>
                          <line x1="12" y1="8" x2="12" y2="12" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="16" r="1" fill="#ccc"/>
                        </svg>
                        <p>No receipt history found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Receipt Details Modal */}
        {showModal && (
          <div className="receipt-modal-overlay" onClick={handleCloseModal}>
            <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="receipt-modal-header">
                <h2>Receipt Details</h2>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {modalLoading ? (
                <div className="modal-loading">
                  <div className="rh-spinner"></div>
                  <p>Loading receipt details...</p>
                </div>
              ) : selectedReceipt ? (
                <div className="receipt-modal-body">
                  {/* Receipt Header */}
                  <div className="receipt-detail-section receipt-header-section">
                    <div className="receipt-number-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{selectedReceipt.receipt_ref_number || 'N/A'}</span>
                    </div>
                    <div className={`receipt-status-badge ${selectedReceipt.process_flag === 'completed' ? 'completed' : 'pending'}`}>
                      {selectedReceipt.process_flag === 'completed' ? 'Completed' : selectedReceipt.process_flag || 'Pending'}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="receipt-detail-section">
                    <h3 className="section-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Customer Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Customer Name</span>
                        <span className="detail-value">{selectedReceipt.customer_name || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer Code</span>
                        <span className="detail-value">{selectedReceipt.customer_number || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer Site Code</span>
                        <span className="detail-value">{selectedReceipt.customer_site_code || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer Site ID</span>
                        <span className="detail-value">{selectedReceipt.customer_site_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Information */}
                  <div className="receipt-detail-section">
                    <h3 className="section-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Receipt Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Receipt Date</span>
                        <span className="detail-value">
                          {selectedReceipt.receipt_date 
                            ? new Date(selectedReceipt.receipt_date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Source</span>
                        <span className="detail-value">{selectedReceipt.source || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Unique ID</span>
                        <span className="detail-value">{selectedReceipt.unique_id || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Legal Entity</span>
                        <span className="detail-value">{selectedReceipt.legal_entity || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Business Unit</span>
                        <span className="detail-value">{selectedReceipt.business_unit || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Receipt Mode</span>
                        <span className="detail-value">{selectedReceipt.receipt_mode || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created By</span>
                        <span className="detail-value">{selectedReceipt.created_by || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created At</span>
                        <span className="detail-value">
                          {selectedReceipt.created_at 
                            ? new Date(selectedReceipt.created_at).toLocaleString('en-IN')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="receipt-detail-section">
                    <h3 className="section-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Payment Details
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Receipt Amount</span>
                        <span className="detail-value amount-highlight">
                          ₹{parseFloat(selectedReceipt.receipt_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Receipt Currency</span>
                        <span className="detail-value">{selectedReceipt.receipt_currency || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Method</span>
                        <span className="detail-value payment-method-badge">
                          {selectedReceipt.receipt_method || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">UTR Number</span>
                        <span className="detail-value">{selectedReceipt.utr_number || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Bank</span>
                        <span className="detail-value">{selectedReceipt.bank || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Drawee Bank</span>
                        <span className="detail-value">{selectedReceipt.drawee_bank || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cheque Number</span>
                        <span className="detail-value">{selectedReceipt.cheque_no || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Challan/DD/Cheque Number</span>
                        <span className="detail-value">{selectedReceipt.challan_dd_cheque_number || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Challan/DD/Cheque Date</span>
                        <span className="detail-value">
                          {selectedReceipt.challan_dd_cheque_date 
                            ? new Date(selectedReceipt.challan_dd_cheque_date).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Place</span>
                        <span className="detail-value">{selectedReceipt.place || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deduction</span>
                        <span className="detail-value">{selectedReceipt.deduction || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Virtual Account Number</span>
                        <span className="detail-value">{selectedReceipt.virtual_account_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  {(selectedReceipt.order_number || selectedReceipt.application_type || selectedReceipt.applied_amount) && (
                    <div className="receipt-detail-section">
                      <h3 className="section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Application Details
                      </h3>
                      <div className="detail-grid">
                        {selectedReceipt.order_number && (
                          <div className="detail-item">
                            <span className="detail-label">Order Number</span>
                            <span className="detail-value">{selectedReceipt.order_number}</span>
                          </div>
                        )}
                        {selectedReceipt.application_type && (
                          <div className="detail-item">
                            <span className="detail-label">Application Type</span>
                            <span className="detail-value">{selectedReceipt.application_type}</span>
                          </div>
                        )}
                        {selectedReceipt.applied_invoice_id && (
                          <div className="detail-item">
                            <span className="detail-label">Applied Invoice ID</span>
                            <span className="detail-value">{selectedReceipt.applied_invoice_id}</span>
                          </div>
                        )}
                        {selectedReceipt.applied_amount && (
                          <div className="detail-item">
                            <span className="detail-label">Applied Amount</span>
                            <span className="detail-value">₹{parseFloat(selectedReceipt.applied_amount || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {selectedReceipt.payment_for && (
                          <div className="detail-item">
                            <span className="detail-label">Payment For</span>
                            <span className="detail-value">{selectedReceipt.payment_for}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Exchange Rate Details */}
                  {(selectedReceipt.exchange_rate_type || selectedReceipt.exchange_rate || selectedReceipt.exchange_date) && (
                    <div className="receipt-detail-section">
                      <h3 className="section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Exchange Rate Details
                      </h3>
                      <div className="detail-grid">
                        {selectedReceipt.exchange_rate_type && (
                          <div className="detail-item">
                            <span className="detail-label">Exchange Rate Type</span>
                            <span className="detail-value">{selectedReceipt.exchange_rate_type}</span>
                          </div>
                        )}
                        {selectedReceipt.exchange_rate && (
                          <div className="detail-item">
                            <span className="detail-label">Exchange Rate</span>
                            <span className="detail-value">{selectedReceipt.exchange_rate}</span>
                          </div>
                        )}
                        {selectedReceipt.exchange_date && (
                          <div className="detail-item">
                            <span className="detail-label">Exchange Date</span>
                            <span className="detail-value">
                              {new Date(selectedReceipt.exchange_date).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remarks & Attachment */}
                  {(selectedReceipt.receipt_remarks || selectedReceipt.attachment) && (
                    <div className="receipt-detail-section">
                      <h3 className="section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                          <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Additional Information
                      </h3>
                      {selectedReceipt.receipt_remarks && (
                        <div className="remarks-box">
                          <p><strong>Remarks:</strong> {selectedReceipt.receipt_remarks}</p>
                        </div>
                      )}
                      {selectedReceipt.attachment && (
                        <div className="detail-grid" style={{ marginTop: '15px' }}>
                          <div className="detail-item">
                            <span className="detail-label">Attachment</span>
                            <span className="detail-value">{selectedReceipt.attachment}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Process Information */}
                  {selectedReceipt.process_message && (
                    <div className="receipt-detail-section">
                      <h3 className="section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                          <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Process Information
                      </h3>
                      <div className="remarks-box">
                        <p>{selectedReceipt.process_message}</p>
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="receipt-modal-actions">
                    <button className="modal-action-btn print-btn" onClick={() => handlePrintReceipt(selectedReceipt)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6,18H4a2,2 0,0 1,-2-2V11a2,2 0,0 1,2-2H20a2,2 0,0 1,2,2v5a2,2 0,0 1,-2,2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Print Receipt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="modal-error">
                  <p>No receipt details available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReceiptHistory;
