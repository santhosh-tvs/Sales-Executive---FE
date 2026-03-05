import React, { useState } from 'react';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Employeemaster.css';

const Masters = () => {
  // 1. Initial state-ah 'Master' nu mathunga (Object key-oda match aaganum)
  const [activeTab, setActiveTab] = useState('Master'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Action functions-ah inga define pannunga (Error-ah fix panna)
  const handleView = (item) => {
    console.log("Viewing item:", item);
    // Inga view logic-ah add pannunga
  };

  const handleEdit = (item) => {
    console.log("Editing item:", item);
    // Inga edit logic-ah add pannunga
  };

  const mastersData = {
    'Master': [
      { id: 1, EmployeeCode: 'K01603', EmployeeName: 'G. Rajesh', LOB: 'DIST', SBU: 'DISTPART', Outlet: ' ', State: ' ', Email: 'rajesh.gurumoorthi@tvs.in', Mobile: '8056009635', ReportingTo: ' ', Status: 'Active' },
      { id: 2, EmployeeCode: 'EMS-PATNA', EmployeeName: 'EMS-PATNA', LOB: 'DIST', SBU: 'COFDTAX', Outlet: ' ', State: ' ', Email: 'EMS-PATNA@gmail.com', Mobile: '6756327632', ReportingTo: 'Admin ', Status: 'Active' },
      { id: 3, EmployeeCode: 'DARKSTORE ELLIS NAGAR', EmployeeName: 'DARKSTORE ELLIS NAGAR', LOB: 'DIST', SBU: 'DISTPART', Outlet: ' ', State: ' ', Email: ' ELLISNAGAR@gmail.com', Mobile: '5478625984', ReportingTo: ' Admin', Status: 'Active' },
      { id: 4, EmployeeCode: 'K02851', EmployeeName: 'Anu bhaskar P', LOB: 'DIST', SBU: 'DISTPART', Outlet: ' ', State: ' ', Email: 'anu.bhaskar@tvs.in', Mobile: '9995499559', ReportingTo: ' ', Status: 'Active' },
      { id: 5, EmployeeCode: 'DMS1 AHMEDABAD', EmployeeName: 'DMS1 AHMEDABAD', LOB: 'DIST', SBU: 'DISTPART', Outlet: ' ', State: ' ', Email: 'DMS1AHMEDABAD@gmail.com', Mobile: '4563738833', ReportingTo: ' ', Status: 'Active' },
    ],
    'Employee Hierarchy': [
      { id: 6, Employee: 'K00702', ReportingTo: ' K00824' },
      { id: 7, Employee: 'K0127777', ReportingTo: ' K00824' },
      { id: 8, Employee: 'K00619', ReportingTo: ' K00824' },
      { id: 9, Employee: 'K00862', ReportingTo: ' K00824' },
      { id: 10, Employee: 'K00671', ReportingTo: ' K00824' },
    ],
  };

  const tabs = ['Master', 'Employee Hierarchy'];

  const currentData = mastersData[activeTab] || [];

  const filteredData = currentData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalRecords = filteredData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'Master':
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        );
      case 'Employee Hierarchy':
        return (
          <tr>
            <th>Employee</th>
            <th>Reporting To</th>
            <th>Actions</th>
          </tr>
        );
      default: return null;
    }
  };

  const renderTableRows = () => {
    return paginatedData.map((item, index) => {
      switch (activeTab) {
        case 'Master':
          return (
            <tr key={index}>
              <td>{item.EmployeeCode}</td>
              <td>{item.EmployeeName}</td>
              <td>{item.LOB}</td>
              <td>{item.SBU}</td>
              <td>{item.Outlet}</td>
              <td>{item.State}</td>
              <td>{item.Email}</td>
              <td>{item.Mobile}</td>
              <td>{item.ReportingTo}</td>
              <td>{item.Status}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'Employee Hierarchy':
          return (
            <tr key={index}>
              <td>{item.Employee}</td>
              <td>{item.ReportingTo}</td>
              <td>
                <div className="action-icons">
                  <button className="action-btn view-btn" onClick={() => handleView(item)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        default: return null;
      }
    });
  };

  return (
    <div className="masters-container">
      <Header />
      <div className="masters-content">
        <div className="masters-header">
          <Breadcrumb currentPage="Masters" />
          <div className="masters-header-controls">
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
            <div className="header-search-control">
              <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." className="header-search-input" />
              <button className="export-btn">Export</button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="masters-table">
              <thead>{renderTableHeaders()}</thead>
              <tbody>
                {paginatedData.length > 0 ? renderTableRows() : (
                  <tr><td colSpan="12" style={{ textAlign: 'center' }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Masters;