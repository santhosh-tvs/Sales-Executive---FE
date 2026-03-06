import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiservice';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './ImportBeat.css';

const ImportBeat = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Upload file immediately
      try {
        Swal.fire({
          title: 'Uploading...',
          text: 'Please wait while we upload your file',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const formData = new FormData();
        formData.append('file', file);

        const response = await apiService.post('/beat-plan/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.success) {
          setUploadedFilename(response.data.filename);
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'File Uploaded!',
            text: 'File uploaded successfully. Click Submit to import.',
            confirmButtonColor: '#20409A',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to upload file. Please try again.',
          confirmButtonColor: '#20409A'
        });
        setSelectedFile(null);
      }
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

  const handleSubmit = async () => {
    if (!selectedFile || !uploadedFilename) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please select a file to upload',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Importing...',
        text: 'Please wait while we process your file',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await apiService.post('/beat-plan/import-beat-plan-excel', {
        filename: uploadedFilename
      });

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Beat Imported Successfully!',
          html: `
            <div style="text-align: left;">
              <p><strong>File:</strong> ${selectedFile.name}</p>
              <p><strong>Records Imported:</strong> ${response.data.imported}</p>
              <p style="margin-top: 12px; color: #28a745; font-weight: 600;">✓ Beat records added to View Plan table</p>
            </div>
          `,
          confirmButtonColor: '#20409A',
        }).then(() => {
          navigate('/beatplan');
        });
      }
    } catch (error) {
      console.error('Error importing beat plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: error.response?.data?.message || 'Failed to import beat plan',
        confirmButtonColor: '#20409A'
      });
    }
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
