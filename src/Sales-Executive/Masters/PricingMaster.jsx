import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Masters.css';

const PricingMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample data for Pricing Master
  const pricingData = [
    { id: 1, priceCode: 'PRC001', itemCode: 'ITM001', itemName: 'Engine Oil 5W-30', basePrice: 450.00, discount: 10, finalPrice: 405.00, effectiveDate: '2025-01-01', status: 'Active' },
    { id: 2, priceCode: 'PRC002', itemCode: 'ITM002', itemName: 'Brake Pad Set', basePrice: 1200.00, discount: 15, finalPrice: 1020.00, effectiveDate: '2025-01-01', status: 'Active' },
    { id: 3, priceCode: 'PRC003', itemCode: 'ITM003', itemName: 'Air Filter', basePrice: 350.00, discount: 5, finalPrice: 332.50, effectiveDate: '2025-01-05', status: 'Active' },
    { id: 4, priceCode: 'PRC004', itemCode: 'ITM004', itemName: 'Spark Plug Set', basePrice: 800.00, discount: 20, finalPrice: 640.00, effectiveDate: '2024-12-15', status: 'Inactive' },
  ];

  const columns = [
    { key: 'priceCode', label: 'Price Code' },
    { key: 'itemCode', label: 'Item Code' },
    { key: 'itemName', label: 'Item Name' },
    { key: 'basePrice', label: 'Base Price (₹)' },
    { key: 'discount', label: 'Discount (%)' },
    { key: 'finalPrice', label: 'Final Price (₹)' },
    { key: 'effectiveDate', label: 'Effective Date' },
    { key: 'status', label: 'Status' },
  ];

  // Filter data based on search
  const filteredData = pricingData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleView = (item) => {
    navigate('/masters/view', { state: { data: item, masterType: 'Pricing Master' } });
  };

  const handleEdit = (item) => {
    navigate('/masters/edit', { state: { data: item, masterType: 'Pricing Master' } });
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
            { label: 'Pricing Master' },
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
                          ) : col.key === 'basePrice' || col.key === 'finalPrice' ? (
                            <span className="price-value">₹{item[col.key].toFixed(2)}</span>
                          ) : col.key === 'discount' ? (
                            <span className="discount-value">{item[col.key]}%</span>
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

export default PricingMaster;
