import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import './CreateBeat.css';

const CreateBeat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const beatData = location.state || {};

  // Sample customer data
  const [customers, setCustomers] = useState([
    { id: 1, code: 'CUST001', name: 'Sam Auto Parts', contact: '9876543210', target: '', unit: 'Rs', isChecked: false },
    { id: 2, code: 'CUST002', name: 'K R Parts', contact: '9876543211', target: '', unit: 'Rs', isChecked: false },
    { id: 3, code: 'CUST003', name: 'Vijay Spare Parts', contact: '9876543212', target: '', unit: 'Rs', isChecked: false },
    { id: 4, code: 'CUST004', name: 'M J Autos', contact: '9876543213', target: '', unit: 'Rs', isChecked: false },
    { id: 5, code: 'CUST005', name: 'AK Auto Parts', contact: '9876543214', target: '', unit: 'Rs', isChecked: false },
  ]);

  // Editable beat info
  const [beatInfo, setBeatInfo] = useState({
    date: beatData.date || '',
    employee: beatData.employee || '',
    employeeName: beatData.employeeName || '',
    mobile: beatData.mobile || '',
    planType: beatData.planType || '',
    location: beatData.location || ''
  });

  // Employee data for the edit popup
  const employeeData = [
    { code: 'EMP001', name: 'John Doe', mobile: '9876543210' },
    { code: 'EMP002', name: 'Jane Smith', mobile: '9876543211' },
    { code: 'EMP003', name: 'Mike Johnson', mobile: '9876543212' },
  ];

  const handleBeatInfoChange = (field, value) => {
    setBeatInfo({ ...beatInfo, [field]: value });
  };

  // Handle Edit button - opens popup to edit beat information
  const handleEditBeatInfo = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Edit Beat Information</span></div>',
      html: `
        <div style="text-align: left; padding: 15px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Date
              </label>
              <input type="date" id="beat-date" value="${beatInfo.date}" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Employee
              </label>
              <select id="beat-employee" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Employee</option>
                ${employeeData.map(emp => `<option value="${emp.code}" data-name="${emp.name}" data-mobile="${emp.mobile}" ${emp.code === beatInfo.employee ? 'selected' : ''}>${emp.name}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Employee Name
              </label>
              <input type="text" id="beat-employee-name" readonly value="${beatInfo.employeeName}" placeholder="Auto-filled" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Mobile Number
              </label>
              <input type="text" id="beat-mobile" readonly value="${beatInfo.mobile}" placeholder="Auto-filled" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Plan Type
              </label>
              <select id="beat-plan-type" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Plan Type</option>
                <option value="Beat" ${beatInfo.planType === 'Beat' ? 'selected' : ''}>Beat</option>
                <option value="Display Campaign" ${beatInfo.planType === 'Display Campaign' ? 'selected' : ''}>Display Campaign</option>
                <option value="Office Work" ${beatInfo.planType === 'Office Work' ? 'selected' : ''}>Office Work</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Location
              </label>
              <select id="beat-location" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Location</option>
                <option value="Chennai" ${beatInfo.location === 'Chennai' ? 'selected' : ''}>Chennai</option>
                <option value="Madurai" ${beatInfo.location === 'Madurai' ? 'selected' : ''}>Madurai</option>
                <option value="Coimbatore" ${beatInfo.location === 'Coimbatore' ? 'selected' : ''}>Coimbatore</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Update',
      confirmButtonColor: '#2196F3',
      width: '700px',
      padding: '25px 35px',
      background: '#ffffff',
      customClass: {
        popup: 'clean-popup',
        title: 'clean-popup-title',
        htmlContainer: 'clean-popup-content',
        confirmButton: 'beat-popup-btn',
        closeButton: 'clean-close-btn'
      },
      didOpen: () => {
        const employeeSelect = document.getElementById('beat-employee');
        const employeeNameInput = document.getElementById('beat-employee-name');
        const mobileInput = document.getElementById('beat-mobile');
        
        employeeSelect.addEventListener('change', (e) => {
          const selectedOption = e.target.options[e.target.selectedIndex];
          employeeNameInput.value = selectedOption.dataset.name || '';
          mobileInput.value = selectedOption.dataset.mobile || '';
        });
      },
      preConfirm: () => {
        const date = document.getElementById('beat-date').value;
        const employee = document.getElementById('beat-employee').value;
        const employeeName = document.getElementById('beat-employee-name').value;
        const mobile = document.getElementById('beat-mobile').value;
        const planType = document.getElementById('beat-plan-type').value;
        const location = document.getElementById('beat-location').value;

        if (!date || !employee || !planType || !location) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        return { date, employee, employeeName, mobile, planType, location };
      }
    });

    if (formValues) {
      setBeatInfo(formValues);
      Swal.fire({
        icon: 'success',
        title: 'Beat Information Updated!',
        confirmButtonColor: '#20409A',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleCustomerCheck = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, isChecked: !c.isChecked } : c));
  };

  const handleTargetChange = (id, value) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, target: value } : c));
  };

  const handleUnitChange = (id, value) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, unit: value } : c));
  };

  const handleSubmit = () => {
    const selectedCustomers = customers.filter(c => c.isChecked);
    
    if (selectedCustomers.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Customers Selected',
        text: 'Please select at least one customer',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Check if all selected customers have targets
    const missingTargets = selectedCustomers.filter(c => !c.target);
    if (missingTargets.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Targets',
        text: 'Please enter target for all selected customers',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Beat Created!',
      html: `
        <div style="text-align: left;">
          <p><strong>Date:</strong> ${beatInfo.date}</p>
          <p><strong>Employee:</strong> ${beatInfo.employeeName}</p>
          <p><strong>Plan Type:</strong> ${beatInfo.planType}</p>
          <p><strong>Location:</strong> ${beatInfo.location}</p>
          <p><strong>Customers:</strong> ${selectedCustomers.length}</p>
        </div>
      `,
      confirmButtonColor: '#20409A',
    }).then(() => {
      navigate('/beatplan');
    });
  };

  return (
    <div className="create-beat-container">
      <Header />
      <Breadcrumb currentPage="Create Beat" />
      
      <div className="create-beat-content">
        <div className="create-beat-header">
          <h1>Create Beat</h1>
          <button className="back-btn" onClick={() => navigate('/beatplan')}>
            Back to Beat Plan
          </button>
        </div>

      {/* Beat Information Display with Edit Button */}
      <div className="beat-info-card">
        <div className="beat-info-header">
          <h2>Beat Information</h2>
          <button className="edit-btn" onClick={handleEditBeatInfo}>
            Edit
          </button>
        </div>
        <div className="beat-info-display">
          <div className="info-display-item">
            <label>Date</label>
            <div className="info-value">{beatInfo.date || '-'}</div>
          </div>
          <div className="info-display-item">
            <label>Employee Code</label>
            <div className="info-value">{beatInfo.employee || '-'}</div>
          </div>
          <div className="info-display-item">
            <label>Employee Name</label>
            <div className="info-value">{beatInfo.employeeName || '-'}</div>
          </div>
          <div className="info-display-item">
            <label>Mobile Number</label>
            <div className="info-value">{beatInfo.mobile || '-'}</div>
          </div>
          <div className="info-display-item">
            <label>Plan Type</label>
            <div className="info-value">{beatInfo.planType || '-'}</div>
          </div>
          <div className="info-display-item">
            <label>Location</label>
            <div className="info-value">{beatInfo.location || '-'}</div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customers-card">
        <h2>Select Customers & Set Targets</h2>
        <div className="table-responsive">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th>Contact Number</th>
                <th>Target</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className={customer.isChecked ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={customer.isChecked} 
                      onChange={() => handleCustomerCheck(customer.id)}
                    />
                  </td>
                  <td>{customer.code}</td>
                  <td>{customer.name}</td>
                  <td>{customer.contact}</td>
                  <td>
                    <input 
                      type="number" 
                      value={customer.target} 
                      onChange={(e) => handleTargetChange(customer.id, e.target.value)}
                      placeholder="Enter target"
                      className="target-input"
                      disabled={!customer.isChecked}
                    />
                  </td>
                  <td>
                    <select 
                      value={customer.unit} 
                      onChange={(e) => handleUnitChange(customer.id, e.target.value)}
                      className="unit-select"
                      disabled={!customer.isChecked}
                    >
                      <option value="Rs">Rs</option>
                      <option value="Liter">Liter</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="submit-section">
          <button className="submit-beat-btn" onClick={handleSubmit}>
            Submit Beat
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateBeat;
