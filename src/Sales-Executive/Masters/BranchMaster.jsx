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
        'Sites': [
            { id: 1, Name: 'SAKINAKA', CreatedBy: 'kms-admin', Createdat: '14-01-2026', UpdatedBy: 'NA', Updatedat: 'NA', Status: 'ACTIVE' },
            { id: 2, Name: 'BHAYANDARPADA', CreatedBy: 'kms-admin', Createdat: '14-01-2026', UpdatedBy: 'NA', Updatedat: 'NA', Status: 'ACTIVE' },
            { id: 3, Name: 'Ambegaon Pune', CreatedBy: 'kms-admin', Createdat: '14-01-2026', UpdatedBy: 'NA', Updatedat: 'NA', Status: 'ACTIVE' },
            { id: 4, Name: 'LB NAGAR', CreatedBy: 'kms-admin', Createdat: '14-01-2026', UpdatedBy: 'NA', Updatedat: 'NA', Status: 'ACTIVE' },
            { id: 5, Name: 'IBRAHIMPATNAM', CreatedBy: 'kms-admin', Createdat: '14-01-2026', UpdatedBy: 'NA', Updatedat: 'NA', Status: 'ACTIVE' },
        ],

        'Master': [
            { id: 6, BranchCode: 'RR NAGAR', BranchName: 'RR NAGAR', BranchType: 'Warehouse', City: 'BENGALURU URBAN', State: 'KARNATAKA', Status: 'Active' },
            { id: 7, BranchCode: 'PUDUR-MADURAI', BranchName: 'PUDUR-MADURAI', BranchType: 'Warehouse', City: 'MADURAI', State: 'TAMIL NADU', Status: 'Active' },
            { id: 8, BranchCode: 'IBRAHIMPATNAM', BranchName: 'IBRAHIMPATNAM', BranchType: 'Warehouse', City: 'HYDERABAD', State: 'TELANGANA', Status: 'Active' },
            { id: 9, BranchCode: 'LB NAGAR', BranchName: 'LB NAGAR', BranchType: 'Warehouse', City: 'COIMBATORE', State: 'TAMIL NADU', Status: 'Active' },
            { id: 6, BranchCode: 'SAHIBABAD', BranchName: 'SAHIBABAD', BranchType: 'Warehouse', City: 'SAHIBABAD', State: 'UTTAR PRADESH', Status: 'Active' },
        ],
    };

    const tabs = ['Sites', 'Master'];

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
            case 'Sites':
                return (
                    <tr>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Created at</th>
                        <th>Updated By</th>
                        <th>Updated at</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'Master':
                return (
                    <tr>
                        <th>Branch Code</th>
                        <th>Branch Name</th>
                        <th>Branch Type</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            default: return null;
        }
    };

    const renderTableRows = () => {
        return paginatedData.map((item, index) => {
            switch (activeTab) {
                case 'Sites':
                    return (
                        <tr key={index}>
                            <td>{item.Name}</td>
                            <td>{item.CreatedBy}</td>
                            <td>{item.Createdat}</td>
                            <td>{item.UpdatedBy}</td>
                            <td>{item.Updatedat}</td>
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
                case 'Master':
                    return (
                        <tr key={index}>
                            <td>{item.BranchCode}</td>
                            <td>{item.BranchName}</td>
                            <td>{item.BranchType}</td>
                            <td>{item.City}</td>
                            <td>{item.State}</td>
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