import React, { useState } from "react";
import Header from "../header/Header";
import "../../styles/S-orders/importStatus.css";

const ImportStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Sample data matching the screenshot - Extended to 11 records
  const importData = [
    {
      id: 1,
      action: "✅ ❌", // Green check and red X icons
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Error",
      errorDetails: "Error:SQLSTATE[HY000...",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 2,
      action: "✅ ❌",
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Completed",
      errorDetails: "",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 3,
      action: "✅ ❌",
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Pending",
      errorDetails: "",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 4,
      action: "✅ ❌",
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Error",
      errorDetails: "Error:SQLSTATE[HY000...",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 5,
      action: "✅ ❌",
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Error",
      errorDetails: "Error:SQLSTATE[HY000...",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 6,
      action: "✅ ❌",
      createdOn: "12/03/2025 07:15 AM",
      type: "Schemes",
      status: "Error",
      errorDetails: "Error:SQLSTATE[HY000...",
      entity: "0",
      totalRecords: "29",
      processedRecords: "0",
      pendingRecords: 29,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "01:56:02 AM",
      endTime: "01:57:41 AM",
      duration: "00:01:39",
      createdBy: "KMS-ADMIN"
    },
    {
      id: 7,
      action: "✅ ❌",
      createdOn: "13/03/2025 08:20 AM",
      type: "Products",
      status: "Completed",
      errorDetails: "",
      entity: "0",
      totalRecords: "15",
      processedRecords: "15",
      pendingRecords: 0,
      new: 15,
      updated: 0,
      errorCount: 0,
      startTime: "08:20:15 AM",
      endTime: "08:21:30 AM",
      duration: "00:01:15",
      createdBy: "ADMIN-USER"
    },
    {
      id: 8,
      action: "✅ ❌",
      createdOn: "13/03/2025 09:45 AM",
      type: "Categories",
      status: "Pending",
      errorDetails: "",
      entity: "0",
      totalRecords: "42",
      processedRecords: "0",
      pendingRecords: 42,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "09:45:00 AM",
      endTime: "09:45:00 AM",
      duration: "00:00:00",
      createdBy: "DATA-ADMIN"
    },
    {
      id: 9,
      action: "✅ ❌",
      createdOn: "13/03/2025 10:15 AM",
      type: "Users",
      status: "Error",
      errorDetails: "Error:CONSTRAINT_VIOLATION...",
      entity: "0",
      totalRecords: "8",
      processedRecords: "0",
      pendingRecords: 8,
      new: 0,
      updated: 0,
      errorCount: 8,
      startTime: "10:15:30 AM",
      endTime: "10:16:45 AM",
      duration: "00:01:15",
      createdBy: "USER-ADMIN"
    },
    {
      id: 10,
      action: "✅ ❌",
      createdOn: "13/03/2025 11:30 AM",
      type: "Inventory",
      status: "Completed",
      errorDetails: "",
      entity: "0",
      totalRecords: "156",
      processedRecords: "156",
      pendingRecords: 0,
      new: 120,
      updated: 36,
      errorCount: 0,
      startTime: "11:30:00 AM",
      endTime: "11:33:45 AM",
      duration: "00:03:45",
      createdBy: "INV-ADMIN"
    },
    {
      id: 11,
      action: "✅ ❌",
      createdOn: "13/03/2025 12:00 PM",
      type: "Orders",
      status: "Pending",
      errorDetails: "",
      entity: "0",
      totalRecords: "67",
      processedRecords: "0",
      pendingRecords: 67,
      new: 0,
      updated: 0,
      errorCount: 0,
      startTime: "12:00:00 PM",
      endTime: "12:00:00 PM",
      duration: "00:00:00",
      createdBy: "ORDER-ADMIN"
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(importData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = importData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Add export functionality here
  };

  return (
    <div className="import-status-page">
      <Header />
      
      <div className="import-status-content">
        <div className="import-status-header">
          <h1 className="import-status-title">Import Status</h1>
          
          <div className="header-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-importStatus"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <button className="export-button" onClick={handleExport}>
              📊 Export
            </button>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="import-status-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Created On</th>
                <th>Type</th>
                <th>Status</th>
                <th>Error details</th>
                <th>Entity</th>
                <th>Total Records</th>
                <th>Processed Records</th>
                <th>Pending Records</th>
                <th>New</th>
                <th>Updated</th>
                <th>Error Count</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Created by</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((row) => (
                <tr key={row.id}>
                  <td className="action-column">{row.action}</td>
                  <td>{row.createdOn}</td>
                  <td>{row.type}</td>
                  <td>
                    <span className={`status-badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="error-details">{row.errorDetails}</td>
                  <td>{row.entity}</td>
                  <td>{row.totalRecords}</td>
                  <td>{row.processedRecords}</td>
                  <td>{row.pendingRecords}</td>
                  <td>{row.new}</td>
                  <td>{row.updated}</td>
                  <td>{row.errorCount}</td>
                  <td>{row.startTime}</td>
                  <td>{row.endTime}</td>
                  <td>{row.duration}</td>
                  <td>{row.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="pagination">
        {currentPage > 1 && (
          <span className="page-prev" onClick={handlePrevPage}>
            Previous
          </span>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <span
            key={page}
            className={`page-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </span>
        ))}
        {currentPage < totalPages && (
          <span className="page-next" onClick={handleNextPage}>
            Next
          </span>
        )}
      </div>
    </div>
  );
};

export default ImportStatus;
