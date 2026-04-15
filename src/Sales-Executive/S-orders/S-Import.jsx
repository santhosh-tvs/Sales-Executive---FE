import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
          qty: row.qty || row.quantity || '',
          validity_date: row.validity_date || '',
          site_number: row.site_number || '',
          reference_number: row.reference_number || '',
          scheduled_date: row.scheduled_date || '',
          warehouse: row.warehouse || '',
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
        <div className={`imp-alert${alertError ? ' imp-alert--error' : ''}`}>
          <span className="imp-alert__text">{alertMessage}</span>
          <button className="imp-alert__close" onClick={() => setShowAlert(false)}>×</button>
        </div>
      )}

      <div className="imp-content">

        {/* Top bar: title + actions */}
        <div className="imp-topbar">
          <div>
            <h1 className="imp-title">Import Orders</h1>
            <p className="imp-subtitle">Upload an Excel file to import orders in bulk</p>
          </div>
          <div className="imp-topbar__actions">
            <button className="imp-btn imp-btn--outline" onClick={handleDownloadTemplate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0-4-4m4 4 4-4"/></svg>
              Download Template
            </button>
            <button className="imp-btn imp-btn--status" onClick={() => navigate('/s-import-status')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Import Status
            </button>
          </div>
        </div>

        {/* Upload card */}
        <div className="imp-upload-card">
          <input id="file-input" type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />

          {!selectedFile ? (
            <div
              className={`imp-dropzone${dragActive ? ' imp-dropzone--active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <svg className="imp-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v5" />
              </svg>
              <p className="imp-dropzone__text">Drag & drop your Excel file here</p>
              <p className="imp-dropzone__hint">or click to browse · .xlsx / .xls only</p>
            </div>
          ) : (
            <div className="imp-file-bar">
              <svg className="imp-file-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6h6v6M9 11V7l3-3 3 3v4" />
                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="imp-file-bar__name">{selectedFile.name}</span>
              <div className="imp-file-bar__actions">
                <button className="imp-btn imp-btn--ghost" onClick={() => { setSelectedFile(null); setPreviewData([]); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  Remove
                </button>
                <button
                  className={`imp-btn imp-btn--primary${isUploading ? ' imp-btn--loading' : ''}`}
                  disabled={isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? <><Spinner inline size="sm" /> Uploading…</> : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12-4 4m4-4 4 4"/></svg>
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview table */}
        <div className="imp-preview-card">
          <div className="imp-preview-card__header">
            <span className="imp-preview-card__title">
              Preview {previewData.length > 0 && <span className="imp-badge">{previewData.length} rows</span>}
            </span>
          </div>
          <div className="imp-table-wrap">
            <table className="imp-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>customer_code</th>
                  <th>part_no</th>
                  <th>qty</th>
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
                    <td colSpan="9" className="imp-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="36" height="36">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M4 6h16M4 18h16M4 12h.01M20 12h.01"/>
                      </svg>
                      <p>No data yet — upload an Excel file to preview</p>
                    </td>
                  </tr>
                ) : previewData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.sno}</td>
                    <td>{row.customer_code}</td>
                    <td>{row.part_no}</td>
                    <td>{row.qty}</td>
                    <td>{row.validity_date}</td>
                    <td>{row.site_number}</td>
                    <td>{row.reference_number}</td>
                    <td>{row.scheduled_date}</td>
                    <td>{row.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Import;
