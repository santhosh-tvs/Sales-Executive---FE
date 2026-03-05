import React, { useState } from 'react';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './Locationmaster.css';

const Masters = () => {
  // 1. Initial state-ah 'Countries' nu mathitaen (Unga list-la 'Master' illa, so 'Countries' thaan first tab)
  const [activeTab, setActiveTab] = useState('Countries'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleView = (item) => console.log("Viewing item:", item);
  const handleEdit = (item) => console.log("Editing item:", item);

  const mastersData = {
    'Countries': [
      { id: 1, CountryName: 'India', CountryCode: 'IN' },
    ],
    'State': [
      { id: 2, StateName: 'ANDAMAN', StateCode: 'AN', Regions: '0', Country: 'india' },
      { id: 3, StateName: 'ANDHRA PRADESH', StateCode: 'AR', Regions: '0', Country: 'india' },
      { id: 4, StateName: 'ARUNACHAL PRADESH', StateCode: 'AP', Regions: '0', Country: 'india' },
      { id: 5, StateName: 'ASSAM', StateCode: 'AS', Regions: '0', Country: 'india' },
      { id: 6, StateName: 'BIHAR', StateCode: 'BR', Regions: '0', Country: 'india' },
    ],
    'City': [
      { id: 7, StateName: 'ANDAMAN', CityName: 'PORT BLAIR' },
      { id: 8, StateName: 'ANDHRA PRADESH', CityName: 'NELLORE' },
      { id: 9, StateName: 'ANDHRA PRADESH', CityName: 'CHITTOOR' },
      { id: 10, StateName: 'ANDHRA PRADESH', CityName: 'VISAKHAPATNAM' },
      { id: 11, StateName: 'ANDHRA PRADESH', CityName: 'KURNOOL' },
    ]
  };

  const tabs = ['Countries', 'State', 'City'];

  const currentData = mastersData[activeTab] || [];

  const filteredData = currentData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  
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
      case 'Countries':
        return <tr><th>Country Name</th><th>Country Code</th><th>Actions</th></tr>;
      case 'State':
        return <tr><th>State Name</th><th>State Code</th><th>Regions</th><th>Country</th><th>Actions</th></tr>;
      case 'City':
        return <tr><th>State Name</th><th>City Name</th><th>Actions</th></tr>;
      default: return null;
    }
  };

  const renderTableRows = () => {
    return paginatedData.map((item, index) => (
      // FIX: key-la activeTab sethutaen. Ippo tab click panna data kandippa refresh aagum.
      <tr key={`${activeTab}-${item.id || index}`}>
        {activeTab === 'Countries' && (
          <>
            <td>{item.CountryName}</td>
            <td>{item.CountryCode}</td>
          </>
        )}
        {activeTab === 'State' && (
          <>
            <td>{item.StateName}</td>
            <td>{item.StateCode}</td>
            <td>{item.Regions}</td>
            <td>{item.Country}</td>
          </>
        )}
        {activeTab === 'City' && (
          <>
            <td>{item.StateName}</td>
            <td>{item.CityName}</td>
          </>
        )}
        <td>
          <div className="action-icons">
            <button className="action-btn view-btn" onClick={() => handleView(item)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="masters-container">
      <Header />
      <div className="masters-content">
        <div className="masters-header">
          <Breadcrumb currentPage="Location Masters" />
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
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No records found</td></tr>
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