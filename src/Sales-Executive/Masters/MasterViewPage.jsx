import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './MasterViewPage.css';

const MasterViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, masterType } = location.state || {};
  const [activeTab, setActiveTab] = useState('Item Information');

  const tabs = ['Item Information', 'Alternative Parts', 'Upsell parts'];

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate('/masters/edit', { state: { data, masterType } });
  };

  if (!data) {
    return (
      <div className="master-view-container">
        <Header />
        <div className="master-view-content">
          <Breadcrumb currentPage="Masters" />
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
          <Breadcrumb currentPage={`Masters / ${masterType} / View`} />

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

          <div className="info-grid">
            {Object.entries(data).map(([key, value]) => {
              if (key === 'id') return null;
              
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

              return (
                <div key={key} className="info-field">
                  <label className="info-label">{label}</label>
                  <div className="info-value">{value || '-'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Button */}
        <div className="action-buttons-section">
          <button onClick={handleEdit} className="edit-page-btn">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterViewPage;
