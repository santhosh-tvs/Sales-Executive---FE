import React, { useState } from 'react';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ReceiptHistory.css';

const ReceiptHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample receipt history data
  const receiptHistoryData = [
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
    },
    {
      id: 6,
      receiptNo: 'RCP001239',
      customerName: 'ANAND TRADERS',
      customerCode: 'PSW_000438',
      orderId: 'IOF25190045363',
      amount: 1250.00,
      paymentMethod: 'Cash',
      receiptDate: '2025-01-15',
      createdBy: 'Sales Executive 2',
      status: 'Completed'
    },
    {
      id: 7,
      receiptNo: 'RCP001240',
      customerName: 'SHARMA AUTO PARTS',
      customerCode: 'EOTN000201',
      orderId: 'IOF25190045364',
      amount: 3450.00,
      paymentMethod: 'Cheque',
      receiptDate: '2025-01-16',
      createdBy: 'Sales Executive 1',
      status: 'Completed'
    },
    {
      id: 8,
      receiptNo: 'RCP001241',
      customerName: 'PATEL MOTORS',
      customerCode: 'PSW_000445',
      orderId: 'IOF25190045365',
      amount: 6780.00,
      paymentMethod: 'UPI Payment',
      receiptDate: '2025-01-17',
      createdBy: 'Sales Executive 3',
      status: 'Completed'
    }
  ];

  // Filter and search logic
  const filteredData = receiptHistoryData.filter(item => {
    const matchesSearch = 
      item.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handlePrintReceipt = (receipt) => {
    console.log('Printing receipt:', receipt);
    // Add print functionality here
  };

  const handleViewDetails = (receipt) => {
    console.log('Viewing details:', receipt);
    // Add view details functionality here
  };

  return (
    <>
      <Header />
      <div className="receipt-history-container">
        <div className="receipt-history-content">
          {/* Header Section */}
          <div className="receipt-history-header">
            <Breadcrumb currentPage="Receipt History" />
            <div className="header-actions">
              <input
                type="text"
                placeholder="Search by Receipt No, Customer, Order ID..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
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
                  <th>Order ID</th>
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
                    <td colSpan="11" className="no-data">
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
      </div>
    </>
  );
};

export default ReceiptHistory;
