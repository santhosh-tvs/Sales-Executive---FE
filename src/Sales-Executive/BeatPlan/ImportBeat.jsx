import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './ImportBeat.css';

const ImportBeat = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = "Customer Code,Customer Name,Contact Number,Target,Unit,Location,Date\nCUST001,Sam Auto Parts,9876543210,50000,Rs,Chennai,2025-03-01\nCUST002,K R Parts,9876543211,30000,Rs,Madurai,2025-03-01";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beat_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Template Downloaded!',
      text: 'Please fill the template and upload',
      confirmButtonColor: '#20409A',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please select a file to upload',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Simulate file upload
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we process your file',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulate processing
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Beat Imported Successfully!',
        html: `
          <div style="text-align: left;">
            <p><strong>File:</strong> ${selectedFile.name}</p>
            <p><strong>Records Imported:</strong> 5</p>
            <p style="margin-top: 12px; color: #28a745; font-weight: 600;">✓ Beat records added to View Plan table</p>
          </div>
        `,
        confirmButtonColor: '#20409A',
      }).then(() => {
        navigate('/beatplan');
      });
    }, 2000);
  };

  return (
    <div className="import-beat-container">
      <Header />
      <Breadcrumb currentPage="Import Beat" />
      
      <div className="import-beat-content">
        <div className="import-beat-header">
          <h1>Import Beat</h1>
        </div>

      

        <div className="import-actions">
          <div className="download-section">
            <button className="download-template-btn" onClick={handleDownloadTemplate}>
              Download Template
            </button>
          </div>

          <div className="upload-section">
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="file-input"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>
            {selectedFile && (
              <div className="file-info">
                <p>Selected: <strong>{selectedFile.name}</strong></p>
                <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>

          <div className="submit-section">
            <button className="submit-import-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
      </div>
  );
};

export default ImportBeat;
