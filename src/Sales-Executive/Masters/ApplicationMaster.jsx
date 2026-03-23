import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Masters.css';

const ApplicationMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample data for Application Master
  const applicationData = [
    { id: 1, appCode: 'APP001', appName: 'Sales Executive App', version: '1.0.0', platform: 'Mobile', status: 'Active', lastUpdated: '2025-01-15' },
    { id: 2, appCode: 'APP002', appName: 'Admin Portal', version: '2.1.5', platform: 'Web', status: 'Active', lastUpdated: '2025-01-10' },
    { id: 3, appCode: 'APP003', appName: 'Inventory Manager', version: '1.5.2', platform: 'Desktop', status: 'Active', lastUpdated: '2025-01-08' },
    { id: 4, appCode: 'APP004', appName: 'Customer Portal', version: '1.2.0', platform: 'Web', status: 'Inactive', lastUpdated: '2024-12-20' },
  ];

  const columns = [
    { key: 'appCode', label: 'Application Code' },
    { key: 'appName', label: 'Application Name' },
    { key: 'version', label: 'Version' },
    { key: 'platform', label: 'Platform' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'status', label: 'Status' },
  ];

  // Filter data based on search
  const filteredData = applicationData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleView = (item) => {
    navigate('/masters/view', { state: { data: item, masterType: 'Application Master' } });
  };

  const handleEdit = (item) => {
    navigate('/masters/edit', { state: { data: item, masterType: 'Application Master' } });
  };

  return (
    <>
      <Header />
      <div className="masters-container">
        <div className="masters-content">
          {/* Header Section */}
          <div className="masters-header">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Masters', path: '/masters' },
            { label: 'Application Master' },
          ]} />
            <div className="masters-actions">
              <input
                type="text"
                placeholder="Search..."
                className="masters-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="masters-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add New
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="masters-table-container">
            <table className="masters-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      {columns.map(col => (
                        <td key={col.key}>
                          {col.key === 'status' ? (
                            <span className={`status-badge ${item[col.key].toLowerCase()}`}>
                              {item[col.key]}
                            </span>
                          ) : col.key === 'platform' ? (
                            <span className={`platform-badge ${item[col.key].toLowerCase()}`}>
                              {item[col.key]}
                            </span>
                          ) : (
                            item[col.key]
                          )}
                        </td>
                      ))}
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view-btn" onClick={() => handleView(item)} title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="no-data">
                      <div className="no-data-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2"/>
                          <line x1="12" y1="8" x2="12" y2="12" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="16" r="1" fill="#ccc"/>
                        </svg>
                        <p>No data found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationMaster;
