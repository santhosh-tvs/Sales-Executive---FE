import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import '../../../styles/Sales/Beat/Import.css';

const Import = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeMobileNumber, setEmployeeMobileNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Enhanced employee data with mobile numbers
  const employees = [
    { code: 'YAMUNARAM-AL-00257', name: 'YAMUNARAM AL', mobile: '9898542396' },
    { code: 'SANOOP-TK-00123', name: 'SANOOP THEKKIYIL', mobile: '9444555666' },
    { code: 'RAJESH-BN-00456', name: 'RAJESH BANGALORE', mobile: '9876543210' },
    { code: 'PRIYA-CH-00789', name: 'PRIYA CHENNAI', mobile: '9123456789' },
    { code: 'KUMAR-HY-00321', name: 'KUMAR HYDERABAD', mobile: '9988776655' },
    { code: 'DEEPA-KL-00654', name: 'DEEPA KERALA', mobile: '9111222333' },
    { code: 'ARUN-MU-00987', name: 'ARUN MUMBAI', mobile: '9555444333' },
    { code: 'LAKSHMI-PU-00147', name: 'LAKSHMI PUNE', mobile: '9777888999' },
    { code: 'VIKRAM-DE-00258', name: 'VIKRAM DELHI', mobile: '9333222111' },
    { code: 'MEERA-KO-00369', name: 'MEERA KOLKATA', mobile: '9666555444' }
  ];

  const handleEmployeeCodeChange = (e) => {
    const selectedCode = e.target.value;
    setEmployeeCode(selectedCode);
    
    // Auto-fill both name and mobile when code is selected
    if (selectedCode) {
      const selectedEmployee = employees.find(emp => emp.code === selectedCode);
      if (selectedEmployee) {
        setEmployeeName(selectedEmployee.name);
        setEmployeeMobileNumber(selectedEmployee.mobile);
      } else {
        setEmployeeName('');
        setEmployeeMobileNumber('');
      }
    } else {
      // Clear fields when no employee is selected
      setEmployeeName('');
      setEmployeeMobileNumber('');
    }
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      // Convert from YYYY-MM-DD to DD-MM-YYYY format
      const [year, month, day] = inputDate.split('-');
      const formattedDate = `${day}-${month}-${year}`;
      setDate(formattedDate);
      
      // If employee code is already selected, refresh the employee data
      if (employeeCode) {
        const selectedEmployee = employees.find(emp => emp.code === employeeCode);
        if (selectedEmployee) {
          setEmployeeName(selectedEmployee.name);
          setEmployeeMobileNumber(selectedEmployee.mobile);
        }
      }
    } else {
      setDate('');
    }
  };

  // Convert date back to YYYY-MM-DD for input value
  const getInputDateValue = () => {
    if (date) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleBrowseClick = () => {
    document.getElementById('file-input').click();
  };

  const handleSubmit = () => {
    // Validate that all required fields are filled
    if (!date) {
      alert('Please select a date');
      return;
    }
    
    if (!employeeCode) {
      alert('Please select an employee code');
      return;
    }
    
    if (!employeeName || !employeeMobileNumber) {
      alert('Employee data not found. Please check the employee code.');
      return;
    }
    
    // Success - process the form data
    const formData = {
      date,
      employeeCode,
      employeeName,
      employeeMobileNumber
    };
    
    console.log('Form submitted successfully:', formData);
    alert(`Employee data submitted successfully!\n\nDate: ${date}\nEmployee: ${employeeName}\nMobile: ${employeeMobileNumber}`);
  };

  const handleImportFile = () => {
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }
    
    // Process the file import
    console.log('Importing file:', selectedFile.name);
    alert(`File imported successfully!\n\nFile: ${selectedFile.name}\nSize: ${(selectedFile.size / 1024).toFixed(2)} KB`);
    
    // Clear the file selection after import
    setSelectedFile(null);
    document.getElementById('file-input').value = '';
  };

  const handleCreatePlan = () => {
    // Navigate to ViewPlan1
    navigate('/view-plan');
  };

  const handleApplyLeave = () => {
    // Navigate to Apply Leave page
    navigate('/apply-leave');
  };

  const handleImport = () => {
    // Already on Import page - refresh or do nothing
    console.log('Already on Import page');
  };

  const handleImportTemplate = () => {
    console.log('Import Template clicked');
  };

  return (
    <div className="import-container">
      <Header />
      
      <div className="import-content">
        <div className="import-header">
          <h2 className="page-title">Import</h2>
          
          <div className="header-buttons">
            <button onClick={handleCreatePlan} className="header-btn create-plan">
              Create Plan
            </button>
            <button onClick={handleApplyLeave} className="header-btn apply-leave">
              Apply Leave
            </button>
            <button onClick={handleImport} className="header-btn import active">
              Import
            </button>
            <button onClick={handleImportTemplate} className="header-btn import-template">
              Import Template
            </button>
          </div>
        </div>

        {/* Form Section - Employee Information */}
        <div className="form-section">
          <div className="form-controls">
            <div className="control-row">
              <div className="control-item">
                <label className="control-label">Date</label>
                <input
                  type="date"
                  value={getInputDateValue()}
                  onChange={handleDateChange}
                  className="date-input"
                  placeholder="01-01-2025"
                />
              </div>
              
              <div className="control-item">
                <label className="control-label">Employee Code</label>
                <select
                  value={employeeCode}
                  onChange={handleEmployeeCodeChange}
                  className="employee-select"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.code} value={employee.code}>
                      {employee.code}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="control-item">
                <label className="control-label">Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  readOnly
                  className="employee-input readonly"
                  placeholder="Employee Name"
                />
              </div>
              
              <div className="control-item">
                <label className="control-label">Employee Mobile Number</label>
                <input
                  type="tel"
                  value={employeeMobileNumber}
                  readOnly
                  className="mobile-input readonly"
                  placeholder="Mobile Number"
                />
              </div>

              <div className="control-item submit-item">
                <button
                  onClick={handleSubmit}
                  className="submit-button"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Employee Section - Replaces Calendar */}
        <div className="selected-employee-section">
          <h3 className="section-title">Selected Employee</h3>
          
          <div className="file-upload-area">
            <div className="file-selection">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">
                  {selectedFile ? selectedFile.name : 'Excel-Order-Dec-2025.xlsx'}
                </span>
              </div>
              
              <div className="file-actions">
                <button
                  onClick={handleBrowseClick}
                  className="browse-button"
                >
                  Browser
                </button>
                
                <button
                  onClick={handleImportFile}
                  className="import-file-button"
                >
                  Import
                </button>
              </div>
            </div>
            
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import;