import { useState } from 'react';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Calendar from '../../../components/Sales/Calendar/Calendar';
import '../../../styles/Sales/History/Consolidate_Report.css';
import ExportIcon from '../../../assets/Assets/Beat/export.png';

const Consolidate_Report = () => {
  const [orderTypeFilter, setOrderTypeFilter] = useState('Consolidate');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sample consolidated data with different order types
  const [ordersData] = useState([
    {
      id: 1,
      customerCode: 'PFR_000100',
      employeeCode: 'TESTUSER1',
      tempOrderNumber: 'WOF28200001742',
      mcollectOrderNumber: '---',
      partNumber: '10100033000031',
      qty: 7.00,
      totalPrice: 7609.00,
      orderType: 'Sales Order',
      status: 'Completed',
      createdAt: '2025-05-21 18:04:05'
    },
    {
      id: 2,
      customerCode: 'PFR_000101',
      employeeCode: 'TESTUSER2',
      tempOrderNumber: 'WOF28200001743',
      mcollectOrderNumber: 'MCO123456',
      partNumber: '10100033000032',
      qty: 5.00,
      totalPrice: 5430.00,
      orderType: 'Hold Order',
      status: 'Pending',
      createdAt: '2025-05-22 10:15:30'
    },
    {
      id: 3,
      customerCode: 'PFR_000102',
      employeeCode: 'TESTUSER1',
      tempOrderNumber: 'WOF28200001744',
      mcollectOrderNumber: 'MCO123457',
      partNumber: '10100033000033',
      qty: 10.00,
      totalPrice: 10850.00,
      orderType: 'Sales Order',
      status: 'Completed',
      createdAt: '2025-05-22 14:20:45'
    },
    {
      id: 4,
      customerCode: 'PFR_000103',
      employeeCode: 'TESTUSER3',
      tempOrderNumber: 'WOF28200001745',
      mcollectOrderNumber: '---',
      partNumber: '10100033000034',
      qty: 3.00,
      totalPrice: 3260.00,
      orderType: 'Hold Order',
      status: 'Cancelled',
      createdAt: '2025-05-23 09:30:15'
    },
    // Add more sample data
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 5,
      customerCode: `PFR_0001${String(i + 4).padStart(2, '0')}`,
      employeeCode: `TESTUSER${(i % 3) + 1}`,
      tempOrderNumber: `WOF2820000${1746 + i}`,
      mcollectOrderNumber: i % 2 === 0 ? `MCO${123458 + i}` : '---',
      partNumber: `1010003300${String(35 + i).padStart(4, '0')}`,
      qty: (i % 10) + 1,
      totalPrice: ((i % 10) + 1) * 1087,
      orderType: i % 2 === 0 ? 'Sales Order' : 'Hold Order',
      status: ['Completed', 'Pending', 'Cancelled'][i % 3],
      createdAt: `2025-05-${String(23 + (i % 7)).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}`
    }))
  ]);

  // Filter data based on order type and search term
  const filteredData = ordersData.filter(order => {
    // Filter by order type
    let matchesOrderType = true;
    if (orderTypeFilter === 'Sales Order') {
      matchesOrderType = order.orderType === 'Sales Order';
    } else if (orderTypeFilter === 'Hold Order') {
      matchesOrderType = order.orderType === 'Hold Order';
    }
    // If Consolidate, show all
    
    // Filter by search term
    if (!searchTerm) return matchesOrderType;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      order.customerCode.toLowerCase().includes(searchLower) ||
      order.employeeCode.toLowerCase().includes(searchLower) ||
      order.tempOrderNumber.toLowerCase().includes(searchLower) ||
      order.mcollectOrderNumber.toLowerCase().includes(searchLower) ||
      order.partNumber.toLowerCase().includes(searchLower) ||
      order.qty.toString().toLowerCase().includes(searchLower) ||
      order.totalPrice.toString().toLowerCase().includes(searchLower) ||
      order.orderType.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.createdAt.toLowerCase().includes(searchLower)
    );
    
    return matchesOrderType && matchesSearch;
  });

  const totalOrders = filteredData.length;
  const totalPages = Math.ceil(totalOrders / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Handle search term change - reset to page 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle order type filter change - reset to page 1
  const handleOrderTypeChange = (e) => {
    setOrderTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleExport = () => {
    console.log('Exporting data...', { orderTypeFilter, filteredData });
    // Add export functionality here
  };

  // Get label for total orders based on filter
  const getTotalOrdersLabel = () => {
    if (orderTypeFilter === 'Sales Order') return 'Total Number of Sales Orders';
    if (orderTypeFilter === 'Hold Order') return 'Total Number of Hold Orders';
    return 'Total Number of Orders';
  };

  return (
    <div className="consolidate-report-container">
      <Header />
      <Breadcrumb currentPage="History" />
      
      {/* Main Content */}
      <div className="consolidate-report-content">
        {/* Header Section */}
        <div className="consolidate-report-header">
          <h1>History</h1>
          
          <div className="header-controls-group">
            <div className="report-dropdown">
              <select 
                value={orderTypeFilter} 
                onChange={handleOrderTypeChange}
                className="report-select"
              >
                <option value="Consolidate">Consolidate</option>
                <option value="Sales Order">Sales Order</option>
                <option value="Hold Order">Hold Order</option>
              </select>
            </div>
            
            <div className="date-control">
              <Calendar 
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select Date"
              />
            </div>
            
            <div className="search-control">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="search-input"
              />
            </div>
            
            <button className="export-btn" onClick={handleExport}>
              <img src={ExportIcon} className="export-icon" alt="export" />
              Export
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="consolidate-report-table">
              <thead>
                <tr>
                  <th>Customer Code</th>
                  <th>Employee Code</th>
                  <th>Temp Order Number</th>
                  <th>Mcollect Order Number</th>
                  <th>Part Number</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                  <th>Order Type</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.customerCode}</td>
                      <td>{row.employeeCode}</td>
                      <td>{row.tempOrderNumber}</td>
                      <td>{row.mcollectOrderNumber}</td>
                      <td>{row.partNumber}</td>
                      <td>{row.qty}</td>
                      <td>{row.totalPrice}</td>
                      <td>{row.orderType}</td>
                      <td>{row.status}</td>
                      <td>{row.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="pagination-container">
          <div className="pagination-left">
            <div className="rows-per-page">
              <span className="rows-label">Rows Per Page</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="rows-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="total-orders">
              <span>{getTotalOrdersLabel()}</span>
              <input 
                type="text" 
                value={totalOrders} 
                readOnly 
                className="total-input"
              />
            </div>
          </div>
          
          <div className="pagination-right">
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn prev-btn"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page < 10 ? `0${page}` : page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn next-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consolidate_Report;