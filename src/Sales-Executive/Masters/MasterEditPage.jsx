import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './MasterViewPage.css';

const MasterEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, masterType } = location.state || {};
  const [activeTab, setActiveTab] = useState('Item Details');
  const [formData, setFormData] = useState(data || {});

  const tabs = ['Item Details', 'Vehicle Mapping', 'Alternate Parts', 'Upsell Parts'];

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFormData(data);
  };

  const handleSubmit = () => {
    console.log('Saving data:', formData);
    // TODO: Add API call to save data
    navigate(-1);
  };

  if (!data) {
    return (
      <div className="master-view-container">
        <Header />
        <div className="master-view-content">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Masters', path: '/masters' },
            { label: 'Edit' },
          ]} />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="master-view-container">
      <Header />
      
      <div className="master-view-content">
        {/* Header with Breadcrumb and Tabs */}
        <div className="view-header-section">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Masters', path: '/masters' },
            { label: masterType || 'Master', path: -1 },
            { label: 'Edit' },
          ]} />

          {/* Tabs Section - Aligned Right */}
          <div className="view-tabs-section">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`view-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* General Information Section */}
        <div className="general-info-section">
          <h2 className="section-title">General Information</h2>

          <div className="edit-grid">
            {Object.entries(formData).map(([key, value]) => {
              if (key === 'id') return null;
              
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

              return (
                <div key={key} className="edit-field">
                  <label className="edit-label">{label}</label>
                  {key === 'status' ? (
                    <select
                      className="edit-input"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : key.toLowerCase().includes('date') ? (
                    <input
                      type="date"
                      className="edit-input"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="edit-input"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-section">
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
          <button onClick={handleSubmit} className="submit-btn">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterEditPage;
