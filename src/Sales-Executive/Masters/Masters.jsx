import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Masters.css';

const Masters = () => {
  const [activeTab, setActiveTab] = useState('Customer Master');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Sample data for different masters
  const mastersData = {
    'Customer Master': [
      { id: 1, division: 'South', customerCode: 'CUST001', customerName: 'Sam Auto Parts', gstNumber: '33AAAAA0000A1Z5', customerType: 'Dealer', mobile: '9876543210', emailId: 'sam@autoparts.com' },
      { id: 2, division: 'South', customerCode: 'CUST002', customerName: 'K R Parts', gstNumber: '33BBBBB0000B1Z5', customerType: 'Retailer', mobile: '9876543211', emailId: 'kr@parts.com' },
      { id: 3, division: 'North', customerCode: 'CUST003', customerName: 'Vijay Spare Parts', gstNumber: '33CCCCC0000C1Z5', customerType: 'Dealer', mobile: '9876543212', emailId: 'vijay@spare.com' },
      { id: 4, division: 'West', customerCode: 'CUST004', customerName: 'M J Autos', gstNumber: '33DDDDD0000D1Z5', customerType: 'Distributor', mobile: '9876543213', emailId: 'mj@autos.com' },
      { id: 5, division: 'East', customerCode: 'CUST005', customerName: 'AK Auto Parts', gstNumber: '33EEEEE0000E1Z5', customerType: 'Retailer', mobile: '9876543214', emailId: 'ak@autoparts.com' },
    ],
    'Employee Master': [
      { id: 1, employeeCode: 'EMP001', employeeName: 'John Doe', lob: 'Sales', sbu: 'Automotive', outlet: 'Chennai Main', state: 'Tamil Nadu', email: 'john@company.com', mobile: '9876543210', reportingTo: 'Manager A' },
      { id: 2, employeeCode: 'EMP002', employeeName: 'Jane Smith', lob: 'Marketing', sbu: 'Automotive', outlet: 'Madurai Branch', state: 'Tamil Nadu', email: 'jane@company.com', mobile: '9876543211', reportingTo: 'Manager B' },
      { id: 3, employeeCode: 'EMP003', employeeName: 'Mike Johnson', lob: 'Sales', sbu: 'Commercial', outlet: 'Coimbatore Branch', state: 'Tamil Nadu', email: 'mike@company.com', mobile: '9876543212', reportingTo: 'Manager A' },
      { id: 4, employeeCode: 'EMP004', employeeName: 'Sarah Wilson', lob: 'HR', sbu: 'Corporate', outlet: 'Head Office', state: 'Karnataka', email: 'sarah@company.com', mobile: '9876543213', reportingTo: 'Manager C' },
    ],
    'Item Master': [
      { id: 1, itemCode: 'ITEM001', itemName: 'Brake Pad Set', brand: 'Bosch', category: 'Brakes', uom: 'Set', mrp: '2500.00', costPrice: '2000.00', listPrice: '2300.00' },
      { id: 2, itemCode: 'ITEM002', itemName: 'Engine Oil 5W30', brand: 'Castrol', category: 'Lubricants', uom: 'Liter', mrp: '850.00', costPrice: '650.00', listPrice: '780.00' },
      { id: 3, itemCode: 'ITEM003', itemName: 'Air Filter', brand: 'Mann', category: 'Filters', uom: 'Piece', mrp: '450.00', costPrice: '320.00', listPrice: '400.00' },
      { id: 4, itemCode: 'ITEM004', itemName: 'Spark Plug Set', brand: 'NGK', category: 'Ignition', uom: 'Set', mrp: '1200.00', costPrice: '900.00', listPrice: '1100.00' },
      { id: 5, itemCode: 'ITEM005', itemName: 'Clutch Plate', brand: 'Exedy', category: 'Transmission', uom: 'Piece', mrp: '3500.00', costPrice: '2800.00', listPrice: '3200.00' },
    ],
    'Supplier Master': [
      { id: 1, supplierCode: 'SUP001', supplierShortName: 'Bosch India', brandName: 'Bosch', supplierCategory: 'OEM', supplierGroup: 'Tier 1', invoicingMethod: 'Direct', gstNumber: '29AAAAA0000A1Z5' },
      { id: 2, supplierCode: 'SUP002', supplierShortName: 'Castrol India', brandName: 'Castrol', supplierCategory: 'Lubricants', supplierGroup: 'Tier 1', invoicingMethod: 'Direct', gstNumber: '27BBBBB0000B1Z5' },
      { id: 3, supplierCode: 'SUP003', supplierShortName: 'Mann Filter', brandName: 'Mann', supplierCategory: 'Filters', supplierGroup: 'Tier 2', invoicingMethod: 'Through Distributor', gstNumber: '33CCCCC0000C1Z5' },
      { id: 4, supplierCode: 'SUP004', supplierShortName: 'NGK Spark', brandName: 'NGK', supplierCategory: 'Ignition', supplierGroup: 'Tier 1', invoicingMethod: 'Direct', gstNumber: '07DDDDD0000D1Z5' },
    ],
    'Branches': [
      { id: 1, branchCode: 'BR001', branchName: 'Chennai Main Branch', branchType: 'Regional Office', city: 'Chennai', state: 'Tamil Nadu' },
      { id: 2, branchCode: 'BR002', branchName: 'Madurai Branch', branchType: 'Sales Office', city: 'Madurai', state: 'Tamil Nadu' },
      { id: 3, branchCode: 'BR003', branchName: 'Coimbatore Branch', branchType: 'Sales Office', city: 'Coimbatore', state: 'Tamil Nadu' },
      { id: 4, branchCode: 'BR004', branchName: 'Salem Branch', branchType: 'Service Center', city: 'Salem', state: 'Tamil Nadu' },
      { id: 5, branchCode: 'BR005', branchName: 'Bangalore Hub', branchType: 'Distribution Center', city: 'Bangalore', state: 'Karnataka' },
    ]
  };

  const tabs = ['Customer Master', 'Employee Master', 'Item Master', 'Supplier Master', 'Branches'];

  // Get current data based on active tab
  const currentData = mastersData[activeTab] || [];

  // Filter data based on search term
  const filteredData = currentData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle edit action
  const handleEdit = (item) => {
    navigate('/masters/edit', { state: { data: item, masterType: activeTab } });
  };

  // Handle view action
  const handleView = (item) => {
    navigate('/masters/view', { state: { data: item, masterType: activeTab } });
  };

  // Render table headers based on active tab
  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'Customer Master':
        return (
          <tr>
            <th>Division</th>
            <th>Customer Code</th>
            <th>Customer Name</th>
            <th>GST Number</th>
            <th>Customer Type</th>
            <th>Mobile</th>
            <th>Email ID</th>
            <th>Actions</th>
          </tr>
        );
      case 'Employee Master':
        return (
          <tr>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>LOB</th>
            <th>SBU</th>
            <th>Outlet</th>
            <th>State</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Reporting To</th>
            <th>Actions</th>
          </tr>
        );
      case 'Item Master':
        return (
          <tr>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>UOM</th>
            <th>MRP (₹)</th>
            <th>Cost Price (₹)</th>
            <th>List Price (₹)</th>
            <th>Actions</th>
          </tr>
        );
      case 'Supplier Master':
        return (
          <tr>
            <th>Supplier Code</th>
            <th>Supplier Short Name</th>
            <th>Brand Name</th>
            <th>Supplier Category</th>
            <th>Supplier Group</th>
            <th>Invoicing Method</th>
            <th>GST Number</th>
            <th>Actions</th>
          </tr>
        );
      case 'Branches':
        return (
          <tr>
            <th>Branch Code</th>
            <th>Branch Name</th>
            <th>Branch Type</th>
            <th>City</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // Render table rows based on active tab
  const renderTableRows = () => {
    return paginatedData.map((item) => {
      switch (activeTab) {
        case 'Customer Master':
          return (
            <tr key={item.id}>
              <td>{item.division}</td>
              <td>{item.customerCode}</td>
              <td>{item.customerName}</td>
              <td>{item.gstNumber}</td>
              <td>{item.customerType}</td>
              <td>{item.mobile}</td>
              <td>{item.emailId}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'Employee Master':
          return (
            <tr key={item.id}>
              <td>{item.employeeCode}</td>
              <td>{item.employeeName}</td>
              <td>{item.lob}</td>
              <td>{item.sbu}</td>
              <td>{item.outlet}</td>
              <td>{item.state}</td>
              <td>{item.email}</td>
              <td>{item.mobile}</td>
              <td>{item.reportingTo}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'Item Master':
          return (
            <tr key={item.id}>
              <td>{item.itemCode}</td>
              <td>{item.itemName}</td>
              <td>{item.brand}</td>
              <td>{item.category}</td>
              <td>{item.uom}</td>
              <td>₹{item.mrp}</td>
              <td>₹{item.costPrice}</td>
              <td>₹{item.listPrice}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'Supplier Master':
          return (
            <tr key={item.id}>
              <td>{item.supplierCode}</td>
              <td>{item.supplierShortName}</td>
              <td>{item.brandName}</td>
              <td>{item.supplierCategory}</td>
              <td>{item.supplierGroup}</td>
              <td>{item.invoicingMethod}</td>
              <td>{item.gstNumber}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'Branches':
          return (
            <tr key={item.id}>
              <td>{item.branchCode}</td>
              <td>{item.branchName}</td>
              <td>{item.branchType}</td>
              <td>{item.city}</td>
              <td>{item.state}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="masters-container">
      <Header />
      
      <div className="masters-content">
        {/* Header Section with Navigation and Controls */}
        <div className="masters-header">
          <Breadcrumb currentPage="Masters" />
          
          <div className="masters-header-controls">
            {/* Master Tabs */}
            <div className="masters-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`master-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Search and Export Controls */}
            <div className="header-search-control">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="header-search-input"
              />
              <button className="export-btn" title="Export">
                <img 
                  src={require('../../assets/Assets/Beat/export.png')} 
                  alt="Export" 
                  className="btn-icon"
                />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="masters-table">
              <thead>
                {renderTableHeaders()}
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  renderTableRows()
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="pagination-container">
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

export default Masters;