import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../header/Header';
import '../../../styles/Sales/Beat/Apply_Leave.css';

const Apply_Leave = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeMobileNumber, setEmployeeMobileNumber] = useState('');
  const [reason, setReason] = useState('');
  
  // Get current date for default month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear().toString();
  
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

  // Function to validate and auto-fill employee data
  const validateAndFillEmployeeData = () => {
    if (date && employeeCode) {
      const selectedEmployee = employees.find(emp => emp.code === employeeCode);
      if (selectedEmployee) {
        setEmployeeName(selectedEmployee.name);
        setEmployeeMobileNumber(selectedEmployee.mobile);
        return true;
      }
    }
    return false;
  };

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

  const handleReasonChange = (e) => {
    setReason(e.target.value);
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

    if (!reason.trim()) {
      alert('Please enter a reason for leave');
      return;
    }
    
    // Success - process the form data
    const leaveData = {
      date,
      employeeCode,
      employeeName,
      employeeMobileNumber,
      reason: reason.trim()
    };
    
    console.log('Leave application submitted successfully:', leaveData);
    
    // Navigate back to ViewPlan1 with the leave data
    navigate('/view-plan', { 
      state: { 
        appliedLeave: leaveData,
        returnFromLeave: true 
      } 
    });
  };

  const handleCreatePlan = () => {
    // Navigate to ViewPlan1
    navigate('/view-plan');
  };

  const handleApplyLeave = () => {
    // Already on Apply Leave page - refresh or do nothing
    console.log('Already on Apply Leave page');
  };

  const handleImport = () => {
    // Navigate to Sales Import page
    navigate('/sales-import');
  };

  const handleImportTemplate = () => {
    // Create Excel template data
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

    // Create CSV content
    const headers = [
      'customer_code',
      'part_no', 
      'quantity',
      'validity_date',
      'site_number',
      'reference_number',
      'scheduled_date',
      'warehouse'
    ];

    // Create CSV string
    let csvContent = headers.join(',') + '\n';
    templateData.forEach(row => {
      const values = headers.map(header => row[header] || '');
      csvContent += values.join(',') + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'Import_Template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert('Import template downloaded successfully!\n\nFile: Import_Template.csv');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="apply-leave-container">
      <Header />
      
      <div className="apply-leave-content">
        <div className="apply-leave-header">
          <h2 className="page-title">Apply Leave</h2>
          
          <div className="header-buttons">
            <button onClick={handleCreatePlan} className="header-btn create-plan">
              Create Plan
            </button>
            <button onClick={handleApplyLeave} className="header-btn apply-leave active">
              Apply Leave
            </button>
            <button onClick={handleImport} className="header-btn import">
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
            </div>
          </div>
        </div>

        {/* Reason Section - Replaces Calendar */}
        <div className="reason-section">
          <div className="reason-controls">
            <div className="reason-row">
              <div className="reason-item">
                <label className="reason-label">Reason<span className="required">*</span></label>
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  className="reason-textarea"
                  placeholder="Type Here..."
                  rows="6"
                />
              </div>
              
              <div className="reason-submit-item">
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
      </div>
    </div>
  );
};

export default Apply_Leave;