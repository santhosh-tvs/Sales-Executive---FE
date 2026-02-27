import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import BeatPlan from "./beatplan";
import ExcelIcon from "../../assets/Icons/excel.png";
import DateIcon from "../../assets/Icons/Date.png";
import ImportIcon from "../../assets/Icons/Import.png";
import ExportIcon from "../../assets/Assets/Beat/export.png";
import "./beatplan.css";

const BeatPlanPage = () => {
  const navigate = useNavigate();

  // Employee data
  const employeeData = [
    { code: 'EMP001', name: 'John Doe', mobile: '9876543210' },
    { code: 'EMP002', name: 'Jane Smith', mobile: '9876543211' },
    { code: 'EMP003', name: 'Mike Johnson', mobile: '9876543212' },
  ];

  // Handle Create Beat button
  const handleCreateBeat = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Create Beat</span></div>',
      html: `
        <div style="text-align: left; padding: 15px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Date
              </label>
              <input type="date" id="beat-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Employee
              </label>
              <select id="beat-employee" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Employee</option>
                ${employeeData.map(emp => `<option value="${emp.code}" data-name="${emp.name}" data-mobile="${emp.mobile}">${emp.name}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Employee Name
              </label>
              <input type="text" id="beat-employee-name" readonly placeholder="Auto-filled" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #999; outline: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Mobile Number
              </label>
              <input type="text" id="beat-mobile" readonly placeholder="Auto-filled" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #999; outline: none;" />
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Plan Type
              </label>
              <select id="beat-plan-type" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Plan Type</option>
                <option value="Beat">Beat</option>
                <option value="Display Campaign">Display Campaign</option>
                <option value="Office Work">Office Work</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Location
              </label>
              <select id="beat-location" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Location</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
                <option value="Coimbatore">Coimbatore</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Add',
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
          if (selectedOption.dataset.name) {
            employeeNameInput.style.color = '#333';
            mobileInput.style.color = '#333';
          }
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
      navigate('/create-beat', { state: formValues });
    }
  };

  // Handle Apply Leave button
  const handleApplyLeave = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Apply Leave</span></div>',
      html: `
        <div style="text-align: left; padding: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                Leave Period
              </label>
              <input type="text" id="leave-date-range" placeholder="Select from date to date" readonly style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'" />
              <input type="date" id="leave-from-date" style="display: none;" />
              <input type="date" id="leave-to-date" style="display: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                Employee Code
              </label>
              <select id="leave-employee" style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Employee</option>
                ${employeeData.map(emp => `<option value="${emp.code}" data-name="${emp.name}" data-mobile="${emp.mobile}">${emp.code}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                Employee Name
              </label>
              <input type="text" id="leave-employee-name" readonly placeholder="Auto-filled" style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #f8f9fa; color: #6c757d; outline: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                Mobile Number
              </label>
              <input type="text" id="leave-mobile" readonly placeholder="Auto-filled" style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #f8f9fa; color: #6c757d; outline: none;" />
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
              Reason
            </label>
            <textarea id="leave-reason" rows="4" placeholder="Enter reason for leave..." style="width: 100%; padding: 12px 16px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; resize: vertical; transition: all 0.2s ease; font-family: Inter, sans-serif; line-height: 1.5;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'"></textarea>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Add',
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
        const employeeSelect = document.getElementById('leave-employee');
        const employeeNameInput = document.getElementById('leave-employee-name');
        const mobileInput = document.getElementById('leave-mobile');
        const dateRangeInput = document.getElementById('leave-date-range');
        const fromDateInput = document.getElementById('leave-from-date');
        const toDateInput = document.getElementById('leave-to-date');
        
        // Employee selection handler
        employeeSelect.addEventListener('change', (e) => {
          const selectedOption = e.target.options[e.target.selectedIndex];
          employeeNameInput.value = selectedOption.dataset.name || '';
          mobileInput.value = selectedOption.dataset.mobile || '';
          if (selectedOption.dataset.name) {
            employeeNameInput.style.color = '#333';
            mobileInput.style.color = '#333';
          }
        });
        
        // Date range picker handler
        let selectingFromDate = true;
        
        dateRangeInput.addEventListener('click', () => {
          if (selectingFromDate) {
            fromDateInput.showPicker();
          } else {
            toDateInput.showPicker();
          }
        });
        
        fromDateInput.addEventListener('change', () => {
          if (fromDateInput.value) {
            toDateInput.min = fromDateInput.value;
            selectingFromDate = false;
            setTimeout(() => toDateInput.showPicker(), 100);
          }
        });
        
        toDateInput.addEventListener('change', () => {
          if (fromDateInput.value && toDateInput.value) {
            const fromDate = new Date(fromDateInput.value);
            const toDate = new Date(toDateInput.value);
            const fromFormatted = fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const toFormatted = toDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            dateRangeInput.value = `${fromFormatted} to ${toFormatted}`;
            dateRangeInput.style.color = '#333';
            selectingFromDate = true;
          }
        });
      },
      preConfirm: () => {
        const fromDate = document.getElementById('leave-from-date').value;
        const toDate = document.getElementById('leave-to-date').value;
        const employee = document.getElementById('leave-employee').value;
        const employeeName = document.getElementById('leave-employee-name').value;
        const mobile = document.getElementById('leave-mobile').value;
        const reason = document.getElementById('leave-reason').value;

        if (!fromDate || !toDate || !employee || !reason) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        return { fromDate, toDate, employee, employeeName, mobile, reason };
      }
    });

    if (formValues) {
      Swal.fire({
        icon: 'success',
        title: 'Leave Applied!',
        text: `Leave applied for ${formValues.employeeName}`,
        confirmButtonColor: '#2196F3',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Handle Import Beat button
  const handleImportBeat = async () => {
    const { value: file } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Upload file</span></div>',
      html: `
        <div style="text-align: center; padding: 10px 0;">
          <!-- Drag & Drop Area -->
          <div id="drop-zone" style="
            border: 2px dashed #20409A; 
            border-radius: 12px; 
            padding: 40px 30px; 
            background: #f8f9fb;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 10px;
          ">
            <div style="margin-bottom: 15px;">
              <img src="${ExcelIcon}" alt="Excel" style="width: 48px; height: 48px;" />
            </div>
            <p style="font-size: 15px; color: #666; margin: 0;">
              Drag&Drop file here or <span id="choose-file-link" style="color: #2196F3; text-decoration: underline; cursor: pointer; font-weight: 600;">Choose file</span>
            </p>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <p style="font-size: 12px; color: #999; margin: 0;">Supported formats: .XLS .XLSX .CSV</p>
            <p style="font-size: 12px; color: #999; margin: 0;">Maximum size: 25 MB</p>
          </div>
          
          <!-- Template Section -->
          <div style="
            border: 1px solid #e0e0e0; 
            border-radius: 12px; 
            padding: 20px; 
            background: #fff;
            text-align: left;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${ExcelIcon}" alt="Excel" style="width: 36px; height: 36px;" />
                <div>
                  <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Template</h3>
                  <p style="font-size: 13px; color: #666; margin: 0;">You can download template as starting point for your own file.</p>
                </div>
              </div>
              <button id="download-template-btn" style="
                background: white;
                border: 2px solid #20409A;
                color: #20409A;
                padding: 8px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
              " onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
                Download
              </button>
            </div>
          </div>
          
          <input type="file" id="file-input" accept=".xls,.xlsx,.csv" style="display: none;" />
          <div id="selected-file-name" style="margin-top: 10px; font-size: 13px; color: #28a745; font-weight: 600;"></div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Import',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#20409A',
      cancelButtonColor: '#6c757d',
      width: '700px',
      padding: '25px 35px',
      background: '#ffffff',
      customClass: {
        popup: 'import-popup',
        title: 'import-popup-title',
        htmlContainer: 'import-popup-content',
        confirmButton: 'beat-popup-btn',
        cancelButton: 'beat-popup-cancel-btn',
        closeButton: 'clean-close-btn'
      },
      didOpen: () => {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const chooseFileLink = document.getElementById('choose-file-link');
        const downloadBtn = document.getElementById('download-template-btn');
        const selectedFileName = document.getElementById('selected-file-name');
        
        let selectedFile = null;
        
        // Choose file link click
        chooseFileLink.addEventListener('click', () => {
          fileInput.click();
        });
        
        // Drop zone click
        dropZone.addEventListener('click', (e) => {
          if (e.target.id !== 'choose-file-link') {
            fileInput.click();
          }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            selectedFileName.textContent = '✓ Selected: ' + selectedFile.name;
            dropZone.style.borderColor = '#28a745';
            dropZone.style.background = '#f0fff4';
          }
        });
        
        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#2196F3';
          dropZone.style.background = '#e3f2fd';
        });
        
        dropZone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = '#20409A';
          dropZone.style.background = '#f8f9fb';
        });
        
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#20409A';
          dropZone.style.background = '#f8f9fb';
          
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            selectedFile = e.dataTransfer.files[0];
            selectedFileName.textContent = '✓ Selected: ' + selectedFile.name;
            dropZone.style.borderColor = '#28a745';
            dropZone.style.background = '#f0fff4';
          }
        });
        
        // Download template button
        downloadBtn.addEventListener('click', () => {
          const csvContent = "Customer Code,Customer Name,Contact Number,Target,Unit,Location,Date\\nCUST001,Sam Auto Parts,9876543210,50000,Rs,Chennai,2025-03-01\\nCUST002,K R Parts,9876543211,30000,Rs,Madurai,2025-03-01";
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'beat_import_template.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
        
        // Store selected file for return
        Swal.getConfirmButton().onclick = () => {
          if (selectedFile) {
            Swal.close();
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
            });
          } else {
            Swal.showValidationMessage('Please select a file to import');
          }
          return false;
        };
      },
      preConfirm: () => {
        return true;
      }
    });
  };

  return (
    <div className="beat-plan-page">
      <Header />
      <div className="beat-plan-content">
        <div className="breadcrumb-actions-row">
          <Breadcrumb currentPage="Beat Plan" />
          <div className="top-action-buttons">
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customer Name / Code" 
              />
            </div>
            <button className="action-btn create-beat-btn" onClick={handleCreateBeat}>
              <img src={DateIcon} alt="Create" className="btn-icon" />
              Create Beat
            </button>
            <button className="action-btn apply-leave-btn" onClick={handleApplyLeave}>
              <img src={DateIcon} alt="Leave" className="btn-icon" />
              Apply Leave
            </button>
            <button className="action-btn import-beat-btn" onClick={handleImportBeat}>
              <img src={ImportIcon} alt="Import" className="btn-icon" />
              Import
            </button>
            <button className="action-btn export-btn">
              <img src={ExportIcon} alt="Export" className="btn-icon" />
              Export
            </button>
          </div>
        </div>
        <BeatPlan 
          onCreateBeat={handleCreateBeat}
          onApplyLeave={handleApplyLeave}
          onImportBeat={handleImportBeat}
        />
      </div>
    </div>
  );
};

export default BeatPlanPage;