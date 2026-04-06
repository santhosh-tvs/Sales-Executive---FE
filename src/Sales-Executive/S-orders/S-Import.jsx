import React, { useState } from "react";
import * as XLSX from 'xlsx';
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Spinner from "../components/Spinner/Spinner";
import { importOrderAPI } from "../../services/api";
import "../../styles/S-orders/import.css";

const getEmployeeCode = () =>
  localStorage.getItem('sales_executive_code') ||
  (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').sales_executive_code || ''; } catch { return ''; } })();

const Import = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Order Uploaded Successfully');
  const [alertError, setAlertError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mappedData = jsonData.map((row, index) => ({
          sno: index + 1,
          customer_code: row.customer_code || '',
          part_no: row.part_no || '',
          quantity: row.quantity || '',
          validity_date: row.validity_date || '',
          site_number: row.site_number || '',
          reference_number: row.reference_number || '',
          scheduled_date: row.scheduled_date || '',
          warehouse: row.warehouse || '',
          order_type: row.order_type || 'sale',
        }));

        setPreviewData(mappedData);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file);
    } else {
      alert('Please upload only Excel files (.xlsx, .xls)');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      customer_code: 'CUST001',
      part_no: 'PART001',
      quantity: 10,
      validity_date: '2024-12-31',
      site_number: 'SITE001',
      reference_number: 'REF001',
      scheduled_date: '2024-01-15',
      warehouse: 'WH001',
      order_type: 'sale',  // sale or back_order
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'import_template.xlsx');
  };

  const handleUpload = async () => {
    if (!selectedFile || previewData.length === 0) {
      alert('Please select a file with valid data first.');
      return;
    }

    setIsUploading(true);
    setAlertError(false);

    try {
      const empCode = getEmployeeCode();
      const res = await importOrderAPI(selectedFile, empCode);

      if (res && res.success) {
        setAlertMessage(`Order Uploaded Successfully — Import ID: ${res.data?.id || ''}`);
        setAlertError(false);
      } else {
        setAlertMessage(res?.message || 'Upload failed. Please try again.');
        setAlertError(true);
      }
    } catch (err) {
      console.error('Import error:', err);
      setAlertMessage('Upload failed. Please try again.');
      setAlertError(true);
    } finally {
      setIsUploading(false);
      setShowAlert(true);
      setSelectedFile(null);
      setPreviewData([]);
      setTimeout(() => setShowAlert(false), 6000);
    }
  };

  return (
    <div className="import-page">
      <Header />
      <Breadcrumb crumbs={[
        { label: 'Home', path: '/sales-home' },
        { label: 'Orders', path: '/s-bulk' },
        { label: 'Import Orders' },
      ]} />

      {showAlert && (
        <div className={`alert-message${alertError ? ' alert-error' : ''}`}>
          <span className="alert-text">{alertMessage}</span>
          <button className="alert-close-button" onClick={() => setShowAlert(false)}>×</button>
        </div>
      )}

      <div className="import-content">
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
                    <button className="remove-file-btn" onClick={() => { setSelectedFile(null); setPreviewData([]); }}>×</button>
                  </div>
                ) : (
                  <span className="no-file-text">No file selected</span>
                )}
              </div>

              <div className="upload-controls">
                <input id="file-input" type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />

                <button className="browse-btn" onClick={() => document.getElementById('file-input').click()}>
                  Browse
                </button>

                <button
                  className={`upload-btn${isUploading ? ' uploading' : ''}`}
                  disabled={isUploading || !selectedFile}
                  onClick={handleUpload}
                >
                  {isUploading ? <><Spinner inline size="sm" /> Uploading</> : 'Upload'}
                </button>

                <button className="download-template-btn" onClick={handleDownloadTemplate}>
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        {!selectedFile && (
          <div
            className={`drop-zone${dragActive ? ' drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <p>Drag & drop an Excel file here, or click to browse</p>
          </div>
        )}

        {/* Preview */}
        <div className="preview-section">
          <div className="preview-header">
            <h3 className="preview-title">Preview {previewData.length > 0 && `(${previewData.length} rows)`}</h3>
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
                    <th>order_type</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="no-data">
                        <div className="no-data-content"><p>No data to display</p></div>
                      </td>
                    </tr>
                  ) : previewData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.sno}</td>
                      <td>{row.customer_code}</td>
                      <td>{row.part_no}</td>
                      <td>{row.quantity}</td>
                      <td>{row.validity_date}</td>
                      <td>{row.site_number}</td>
                      <td>{row.reference_number}</td>
                      <td>{row.scheduled_date}</td>
                      <td>{row.warehouse}</td>
                      <td>
                        <span className={`order-type-badge ${row.order_type === 'back_order' ? 'badge-backorder' : 'badge-sale'}`}>
                          {row.order_type === 'back_order' ? 'Back Order' : 'Sale'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Import result summary removed */}
      </div>
    </div>
  );
};

export default Import;
