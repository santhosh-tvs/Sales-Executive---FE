import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "../../styles/S-orders/import.css";

const Import = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map the data to our expected format
        const mappedData = jsonData.map((row, index) => ({
          sno: index + 1,
          customer_code: row.customer_code || '',
          part_no: row.part_no || '',
          quantity: row.quantity || '',
          validity_date: row.validity_date || '',
          site_number: row.site_number || '',
          reference_number: row.reference_number || '',
          scheduled_date: row.scheduled_date || '',
          warehouse: row.warehouse || ''
        }));
        
        setPreviewData(mappedData);
        setShowPreview(true);
        setIsUploading(false);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the file format.');
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/vnd.ms-excel") {
        processFile(file);
      } else {
        alert('Please upload only Excel files (.xlsx, .xls)');
      }
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('file-input').click();
  };
  const handleDownloadTemplate = () => {
    // Create a template Excel file
    const templateData = [
      {
        customer_code: 'CUST001',
        part_no: 'PART001',
        quantity: 10,
        validity_date: '2024-12-31',
        site_number: 'SITE001',
        reference_number: 'REF001',
        scheduled_date: '2024-01-15',
        warehouse: 'WH001'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Download the file
    XLSX.writeFile(wb, 'import_template.xlsx');
  };

  const handleUpload = () => {
    if (!selectedFile || previewData.length === 0) {
      alert('Please select a file with valid data first.');
      return;
    }
    
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setShowAlert(true);
      
      // Reset the form after successful upload
      setSelectedFile(null);
      setPreviewData([]);
      setShowPreview(false);
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }, 2000);
  };

  const handleViewClick = () => {
    // Handle view button click - navigate to Import Status page
    console.log("View button clicked");
    navigate("/s-import-status");
    setShowAlert(false);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <div className="import-page">
      <Header />
      <Breadcrumb currentPage="Import Orders" />
      
      {/* Alert Message */}
      {showAlert && (
        <div className="alert-message">
          <span className="alert-text">Order Uploaded Successfully</span>
          <button className="alert-view-button" onClick={handleViewClick}>View</button>
          <button className="alert-close-button" onClick={handleAlertClose}>×</button>
        </div>
      )}
      
      <div className="import-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Import Orders</h1>
            <p>Import orders in bulk using Excel files</p>
          </div>
          
          <div className="header-right">
            <div className="file-upload-section">
              <div className="file-display">
                {selectedFile ? (
                  <div className="selected-file-info">
                    <span className="file-icon">📊</span>
                    <span className="file-name">{selectedFile.name}</span>
                    <button className="remove-file-btn" onClick={() => {
                      setSelectedFile(null);
                      setPreviewData([]);
                    }}>×</button>
                  </div>
                ) : (
                  <span className="no-file-text">No file selected</span>
                )}
              </div>
              
              <div className="upload-controls">
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {selectedFile ? (
                  <button 
                    className={`upload-btn ${isUploading ? 'uploading' : ''}`}
                    disabled={isUploading}
                    onClick={handleUpload}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                ) : (
                  <button className="browse-btn" onClick={handleBrowseClick}>
                    Browse
                  </button>
                )}
                
                <button className="download-template-btn" onClick={handleDownloadTemplate}>
                  Download Template
                </button>
                
                <button className="order-history-btn" onClick={() => navigate('/order-history')}>
                  Order History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section - Always Visible */}
        <div className="preview-section">
          <div className="preview-header">
            <h3 className="preview-title">Preview</h3>
          </div>
          
          <div className="table-wrapper">
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>customer_code</th>
                    <th>part_no</th>
                    <th>Quantity</th>
                    <th>validity_date</th>
                    <th>site_number</th>
                    <th>reference_number</th>
                    <th>scheduled_date</th>
                    <th>warehouse</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        <div className="no-data-content">
                          <p>No data to display</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    previewData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.sno}</td>
                        <td>{row.customer_code}</td>
                        <td>{row.part_no}</td>
                        <td>{row.quantity}</td>
                        <td>{row.validity_date}</td>
                        <td>{row.site_number}</td>
                        <td>{row.reference_number}</td>
                        <td>{row.scheduled_date}</td>
                        <td>{row.warehouse}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import;
