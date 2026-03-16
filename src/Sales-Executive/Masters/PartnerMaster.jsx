import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Masters.css';

const PartnerMaster = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'master';
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample data for Partner Warranty Master
  const partnerWarrantyData = [
    { id: 1, partnerCode: 'PW001', partnerName: 'ABC Motors', warrantyType: 'Extended', duration: '2 Years', coverage: 'Full', status: 'Active' },
    { id: 2, partnerCode: 'PW002', partnerName: 'XYZ Auto Parts', warrantyType: 'Standard', duration: '1 Year', coverage: 'Partial', status: 'Active' },
    { id: 3, partnerCode: 'PW003', partnerName: 'DEF Traders', warrantyType: 'Premium', duration: '3 Years', coverage: 'Full', status: 'Active' },
  ];

  // Sample data for Partner Master
  const partnerMasterData = [
    { id: 1, partnerCode: 'PM001', partnerName: 'ABC Motors', contactPerson: 'John Doe', mobile: '+91 9876543210', email: 'john@abcmotors.com', city: 'Chennai', status: 'Active' },
    { id: 2, partnerCode: 'PM002', partnerName: 'XYZ Auto Parts', contactPerson: 'Jane Smith', mobile: '+91 9876543211', email: 'jane@xyzauto.com', city: 'Coimbatore', status: 'Active' },
    { id: 3, partnerCode: 'PM003', partnerName: 'DEF Traders', contactPerson: 'Mike Johnson', mobile: '+91 9876543212', email: 'mike@deftraders.com', city: 'Bangalore', status: 'Inactive' },
  ];

  // Get data and columns based on view
  const getViewConfig = () => {
    switch (view) {
      case 'warranty':
        return {
          title: 'Partner Warranty Master',
          data: partnerWarrantyData,
          columns: [
            { key: 'partnerCode', label: 'Partner Code' },
            { key: 'partnerName', label: 'Partner Name' },
            { key: 'warrantyType', label: 'Warranty Type' },
            { key: 'duration', label: 'Duration' },
            { key: 'coverage', label: 'Coverage' },
            { key: 'status', label: 'Status' },
          ]
        };
      case 'master':
      default:
        return {
          title: 'Partner Master',
          data: partnerMasterData,
          columns: [
            { key: 'partnerCode', label: 'Partner Code' },
            { key: 'partnerName', label: 'Partner Name' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'email', label: 'Email' },
            { key: 'city', label: 'City' },
            { key: 'status', label: 'Status' },
          ]
        };
    }
  };

  const config = getViewConfig();

  // Filter data based on search
  const filteredData = config.data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleView = (item) => {
    navigate('/masters/view', { state: { data: item, masterType: config.title } });
  };

  const handleEdit = (item) => {
    navigate('/masters/edit', { state: { data: item, masterType: config.title } });
  };

  return (
    <>
      <Header />
      <div className="masters-container">
        <div className="masters-content">
          {/* Header Section */}
          <div className="masters-header">
            <Breadcrumb currentPage={config.title} />
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
                  {config.columns.map(col => (
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
                      {config.columns.map(col => (
                        <td key={col.key}>
                          {col.key === 'status' ? (
                            <span className={`status-badge ${item[col.key].toLowerCase()}`}>
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
                    <td colSpan={config.columns.length + 2} className="no-data">
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

export default PartnerMaster;
