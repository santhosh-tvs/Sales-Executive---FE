import React, { useState } from 'react';
import Header from '../../header/Header';
import '../../../styles/Sales/Beat/Locate.css';

const Locate = () => {
  const [date, setDate] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeMobileNumber, setEmployeeMobileNumber] = useState('');

  // Sample employee data with mobile numbers
  const employees = [
    { code: 'YAMUNARAM-AL-00257', name: 'YAMUNARAM AL', mobile: '9898542396' },
    { code: 'EMP001', name: 'John Doe', mobile: '9876543210' },
    { code: 'EMP002', name: 'Jane Smith', mobile: '9123456789' },
    { code: 'EMP003', name: 'Mike Johnson', mobile: '9988776655' },
    { code: 'TESTUSER1', name: 'Test User One', mobile: '9111222333' },
    { code: 'SANOOP-TK-00123', name: 'SANOOP THEKKIYIL', mobile: '9444555666' }
  ];

  const handleEmployeeCodeChange = (e) => {
    const selectedCode = e.target.value;
    setEmployeeCode(selectedCode);
    
    // Find the corresponding employee and auto-fill name and mobile
    const selectedEmployee = employees.find(emp => emp.code === selectedCode);
    if (selectedEmployee) {
      setEmployeeName(selectedEmployee.name);
      setEmployeeMobileNumber(selectedEmployee.mobile);
    } else {
      setEmployeeName('');
      setEmployeeMobileNumber('');
    }
  };

  const handleSubmit = () => {
    console.log('Submit clicked', {
      date,
      employeeCode,
      employeeName,
      employeeMobileNumber
    });
    // Add submit logic here
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      // Convert from YYYY-MM-DD to DD-MM-YYYY format
      const [year, month, day] = inputDate.split('-');
      const formattedDate = `${day}-${month}-${year}`;
      setDate(formattedDate);
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

  return (
    <div className="locate-container">
      <Header />
      
      <div className="locate-content">
        <div className="locate-form">
          <h2 className="section-title">Customer</h2>
          
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
                  <option value="">Select Employee Code</option>
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
                  placeholder="YAMUNARAM AL"
                />
              </div>
              
              <div className="control-item">
                <label className="control-label">Employee Mobile Number</label>
                <input
                  type="tel"
                  value={employeeMobileNumber}
                  readOnly
                  className="mobile-input readonly"
                  placeholder="9898542396"
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
      </div>
    </div>
  );
};

export default Locate;