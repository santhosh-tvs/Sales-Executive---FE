import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './beatplan.css';

// Asset Imports
import DeleteIcon from "../../assets/Assets/Beat/delete.png";
import FilterIcon from "../../assets/Assets/Beat/filter-lines.png";
import ExportIcon from "../../assets/Assets/Beat/export.png";
import ArrowIcon from "../../assets/Assets/Beat/arrow-down.png";
import EyeIcon from "../../assets/Assets/Beat/eye.png"; 

const BeatPlan = () => {
  const [tableData, setTableData] = useState([
    { id: 1, planNo: 'P#0011', customer: 'Sam auto part', location: 'Chennai', createdDate: '11-12-2025', planDate: '12-12-2025:10:00', status: 'New', isChecked: false },
    { id: 2, planNo: 'P#0012', customer: 'K R Parts', location: 'Madurai', createdDate: '10-12-2025', planDate: '11-12-2025:11:00', status: 'Check in', isChecked: false, purpose: 'Collection', checkInTime: '26-02-2025 & 03:40:02 AM', checkOutTime: '26-02-2025 & 03:40:02 AM' },
    { id: 3, planNo: 'P#0013', customer: 'Sam auto part', location: 'Chennai', createdDate: '10-12-2025', planDate: '11-12-2025:12:00', status: 'Visited', isChecked: false },
    { id: 4, planNo: 'P#0014', customer: 'Vijay Spare Parts', location: 'Chennai', createdDate: '09-12-2025', planDate: '10-12-2025:10:00', status: 'Visited', isChecked: false },
    { id: 5, planNo: 'P#0015', customer: 'M J Autos', location: 'Madurai', createdDate: '07-12-2025', planDate: '08-12-2025:10:00', status: 'Visited', isChecked: false },
  { id: 6, planNo: 'P#0016', customer: 'Sam auto part', location: 'Chennai', createdDate: '07-12-2025', planDate: '08-12-2025:02:00', status: 'Visited', isChecked: false },
]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  
  // Form states
  const [planType, setPlanType] = useState('New Plan');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [remark, setRemark] = useState('');

  // Function to delete selected rows
  const handleDelete = () => {
    const remainingData = tableData.filter(item => !item.isChecked);
    setTableData(remainingData);
  };

  // Helper function to generate customer details HTML
  const generateCustomerDetailsHTML = (customerDetails) => {
    return `
      <div style="background: linear-gradient(135deg, #20409A 0%, #1a3580 100%); padding: 24px 28px; margin: -30px -20px 0 -20px; border-radius: 16px 16px 0 0;">
        <h2 style="font-size: 22px; font-weight: 700; color: white; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          ${customerDetails.name}
        </h2>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 13px; color: white; font-weight: 600;">
            ${customerDetails.code}
          </span>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 13px; color: white; font-weight: 600;">
            ${customerDetails.location}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 12px;">
          <p style="font-size: 14px; color: rgba(255,255,255,0.95); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📞</span> ${customerDetails.phone}
          </p>
          <p style="font-size: 14px; color: rgba(255,255,255,0.95); margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">✉️</span> ${customerDetails.email}
          </p>
        </div>
      </div>
      
      <div style="padding: 24px 28px;">
        <div style="background: #f8f9fb; padding: 16px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #20409A;">
          <p style="font-size: 13px; color: #666; line-height: 1.7; margin: 0; display: flex; align-items: start; gap: 8px;">
            <span style="font-size: 16px; margin-top: 2px;">📍</span>
            <span>${customerDetails.address}</span>
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 16px; border-radius: 10px; border: 1px solid #a5d6a7;">
            <p style="font-size: 12px; color: #2e7d32; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Credit Balance</p>
            <p style="font-size: 20px; color: #1b5e20; margin: 0; font-weight: 700;">₹${customerDetails.creditBalance}</p>
          </div>
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 16px; border-radius: 10px; border: 1px solid #90caf9;">
            <p style="font-size: 12px; color: #1565c0; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Credit Limit</p>
            <p style="font-size: 20px; color: #0d47a1; margin: 0; font-weight: 700;">₹${customerDetails.creditLimit}</p>
          </div>
          <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 16px; border-radius: 10px; border: 1px solid #ef9a9a;">
            <p style="font-size: 12px; color: #c62828; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">OverDue Invoice</p>
            <p style="font-size: 20px; color: #b71c1c; margin: 0; font-weight: 700;">${customerDetails.overDueInvoice}</p>
          </div>
          <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 16px; border-radius: 10px; border: 1px solid #ffcc80;">
            <p style="font-size: 12px; color: #e65100; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">OverDue Amount</p>
            <p style="font-size: 20px; color: #bf360c; margin: 0; font-weight: 700;">₹${customerDetails.overDueAmount}</p>
          </div>
        </div>
        
        <div style="background: #f8f9fb; padding: 18px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <p style="font-size: 13px; color: #666; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            💰 Total Outstanding Amount
          </p>
          <p style="font-size: 24px; color: #20409A; margin: 0; font-weight: 700;">₹${customerDetails.totalOutstanding}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%); padding: 18px; border-radius: 10px; border: 1px solid #e0e0e0;">
          <p style="font-size: 13px; color: #666; margin: 0 0 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🚚</span> Ship To
          </p>
          <p style="font-size: 15px; color: #20409A; margin: 0 0 8px 0; font-weight: 700;">
            ${customerDetails.shipToCode} | ${customerDetails.shipToName}
          </p>
          <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
            ${customerDetails.shipToAddress}
          </p>
        </div>
      </div>
    `;
  };

  // Helper function to generate check-in details HTML
  const generateCheckInDetailsHTML = (planData) => {
    return `
      <div style="background: linear-gradient(135deg, #fff8f0 0%, #ffe8d6 100%); padding: 20px; border-radius: 12px; border: 3px solid #ff6b35; margin: 0 28px 24px 28px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div style="background: white; padding: 14px; border-radius: 8px; border-left: 4px solid #ff6b35;">
            <p style="font-size: 12px; color: #ff6b35; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              Purpose
            </p>
            <p style="font-size: 16px; color: #4A4A4A; margin: 0; font-weight: 600;">
              ${planData.purpose || 'Collection'}
            </p>
          </div>
          <div style="background: white; padding: 14px; border-radius: 8px; border-left: 4px solid #ff6b35;">
            <p style="font-size: 12px; color: #ff6b35; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              Created Date
            </p>
            <p style="font-size: 16px; color: #4A4A4A; margin: 0; font-weight: 600;">
              ${planData.createdDate}
            </p>
          </div>
          <div style="background: white; padding: 14px; border-radius: 8px; border-left: 4px solid #28a745;">
            <p style="font-size: 12px; color: #28a745; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ✓ Check in time
            </p>
            <p style="font-size: 16px; color: #4A4A4A; margin: 0; font-weight: 600;">
              ${planData.checkInTime || 'N/A'}
            </p>
          </div>
          <div style="background: white; padding: 14px; border-radius: 8px; border-left: 4px solid ${planData.checkOutTime ? '#28a745' : '#999'};">
            <p style="font-size: 12px; color: ${planData.checkOutTime ? '#28a745' : '#999'}; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${planData.checkOutTime ? '✓' : '○'} Check Out time
            </p>
            <p style="font-size: 16px; color: #4A4A4A; margin: 0; font-weight: 600;">
              ${planData.checkOutTime || 'Pending'}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Function to handle eye icon click - show customer details
  const handleViewDetails = (planData) => {
    // Sample customer details - replace with actual data
    const customerDetails = {
      name: planData.customer,
      code: 'EOTN000182',
      location: 'KMS',
      phone: '2790949169',
      email: 'EOTN000182@gmail.com',
      address: 'D.NO.5800 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI KURUMBAPATTI Madurai, TAMIL NADU, 624002.',
      creditBalance: '34624.52',
      creditLimit: '200000.00',
      overDueInvoice: '9',
      overDueAmount: '403876.98',
      totalOutstanding: '403876.98',
      shipToCode: '98734897/KMS_EWH',
      shipToName: 'SK AUTO PARTS',
      shipToAddress: 'D.NO.5800 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST MEENAKSHINAYAKENPATTI KURUMBAPATTI DINDIGUL, TAMIL NADU, 624002.'
    };

    // Check if status is "New" - show check in button
    if (planData.status === 'New') {
      Swal.fire({
        html: `
          <div style="text-align: left; padding: 20px; color: #4A4A4A;">
            <h2 style="font-size: 20px; font-weight: 700; color: #20409A; margin: 0 0 8px 0; text-transform: uppercase;">
              ${customerDetails.name}
            </h2>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0; font-weight: 500;">
              ${customerDetails.code} / ${customerDetails.location}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0;">
              ${customerDetails.phone}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 16px 0;">
              ${customerDetails.email}
            </p>
            <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              ${customerDetails.address}
            </p>
            
            <div style="margin-bottom: 20px;">
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Balance:</strong> <span style="color: #28a745; font-weight: 600;">${customerDetails.creditBalance}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Limit:</strong> ${customerDetails.creditLimit}
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Invoice:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueInvoice}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Amount:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueAmount}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 20px 0;">
                <strong>Total Outstanding Amount:</strong> <span style="font-weight: 600;">${customerDetails.totalOutstanding}</span>
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 16px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 12px 0; font-weight: 600;">
                Ship To:
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 4px 0; font-weight: 600;">
                ${customerDetails.shipToCode} | ${customerDetails.shipToName}
              </p>
              <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
                ${customerDetails.shipToAddress}
              </p>
            </div>
          </div>
        `,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: 'Continue to check in',
        confirmButtonColor: '#20409A',
        width: '650px',
        padding: '30px 20px',
        background: '#fff',
        customClass: {
          popup: 'customer-details-popup',
          htmlContainer: 'customer-details-content',
          confirmButton: 'customer-details-confirm-btn'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Get current date and time
          const now = new Date();
          const checkInTime = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} & ${now.toLocaleTimeString('en-US', { hour12: true })}`;
          
          // Update plan status to "Check in"
          setTableData(tableData.map(item => 
            item.id === planData.id ? { 
              ...item, 
              status: 'Check in',
              purpose: 'Collection',
              checkInTime: checkInTime,
              checkOutTime: ''
            } : item
          ));
          
          Swal.fire({
            icon: 'success',
            title: 'Checked In!',
            text: `Successfully checked in to ${customerDetails.name}`,
            confirmButtonColor: '#20409A',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    }
    // Check if status is "Check in" - show additional details and check out button
    else if (planData.status === 'Check in') {
      Swal.fire({
        html: `
          <div style="text-align: left; padding: 20px; color: #4A4A4A;">
            <h2 style="font-size: 20px; font-weight: 700; color: #20409A; margin: 0 0 8px 0; text-transform: uppercase;">
              ${customerDetails.name}
            </h2>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0; font-weight: 500;">
              ${customerDetails.code} / ${customerDetails.location}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0;">
              ${customerDetails.phone}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 16px 0;">
              ${customerDetails.email}
            </p>
            <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              ${customerDetails.address}
            </p>
            
            <div style="margin-bottom: 20px;">
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Balance:</strong> <span style="color: #28a745; font-weight: 600;">${customerDetails.creditBalance}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Limit:</strong> ${customerDetails.creditLimit}
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Invoice:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueInvoice}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Amount:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueAmount}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 20px 0;">
                <strong>Total Outstanding Amount:</strong> <span style="font-weight: 600;">${customerDetails.totalOutstanding}</span>
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 16px; margin-bottom: 20px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 12px 0; font-weight: 600;">
                Ship To:
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 4px 0; font-weight: 600;">
                ${customerDetails.shipToCode} | ${customerDetails.shipToName}
              </p>
              <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
                ${customerDetails.shipToAddress}
              </p>
            </div>
            
            <div style="background: #fff8f0; padding: 16px; border-radius: 8px; border-left: 4px solid #ff6b35;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <p style="font-size: 14px; color: #ff6b35; margin: 0; font-weight: 600;">
                  Purpose: <span style="color: #4A4A4A; font-weight: 500;">${planData.purpose || 'Collection'}</span>
                </p>
                <p style="font-size: 14px; color: #ff6b35; margin: 0; font-weight: 600;">
                  Created Date: <span style="color: #4A4A4A; font-weight: 500;">${planData.createdDate} & ${planData.planDate.split(':')[1]}:${planData.planDate.split(':')[2]}</span>
                </p>
                <p style="font-size: 14px; color: #ff6b35; margin: 0; font-weight: 600;">
                  Check in time: <span style="color: #4A4A4A; font-weight: 500;">${planData.checkInTime || 'N/A'}</span>
                </p>
                <p style="font-size: 14px; color: #ff6b35; margin: 0; font-weight: 600;">
                  Check Out time: <span style="color: #4A4A4A; font-weight: 500;">${planData.checkOutTime || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>
        `,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: 'Continue to check out',
        confirmButtonColor: '#20409A',
        width: '650px',
        padding: '30px 20px',
        background: '#fff',
        customClass: {
          popup: 'customer-details-popup',
          htmlContainer: 'customer-details-content',
          confirmButton: 'customer-details-confirm-btn'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Get current date and time for checkout
          const now = new Date();
          const checkOutTime = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} & ${now.toLocaleTimeString('en-US', { hour12: true })}`;
          
          // Update plan status to "Visited"
          setTableData(tableData.map(item => 
            item.id === planData.id ? { 
              ...item, 
              status: 'Visited',
              checkOutTime: checkOutTime
            } : item
          ));
          
          Swal.fire({
            icon: 'success',
            title: 'Checked Out!',
            text: `Successfully checked out from ${customerDetails.name}`,
            confirmButtonColor: '#20409A',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    }
    // If status is "Visited" - show details only (no button)
    else if (planData.status === 'Visited') {
      Swal.fire({
        html: `
          <div style="text-align: left; padding: 20px; color: #4A4A4A;">
            <h2 style="font-size: 20px; font-weight: 700; color: #20409A; margin: 0 0 8px 0; text-transform: uppercase;">
              ${customerDetails.name}
            </h2>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0; font-weight: 500;">
              ${customerDetails.code} / ${customerDetails.location}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 4px 0;">
              ${customerDetails.phone}
            </p>
            <p style="font-size: 14px; color: #666; margin: 0 0 16px 0;">
              ${customerDetails.email}
            </p>
            <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              ${customerDetails.address}
            </p>
            
            <div style="margin-bottom: 20px;">
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Balance:</strong> <span style="color: #28a745; font-weight: 600;">${customerDetails.creditBalance}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>Credit Limit:</strong> ${customerDetails.creditLimit}
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Invoice:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueInvoice}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 8px 0;">
                <strong>OverDue Amount:</strong> <span style="color: #dc3545; font-weight: 600;">${customerDetails.overDueAmount}</span>
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 20px 0;">
                <strong>Total Outstanding Amount:</strong> <span style="font-weight: 600;">${customerDetails.totalOutstanding}</span>
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 16px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 12px 0; font-weight: 600;">
                Ship To:
              </p>
              <p style="font-size: 14px; color: #4A4A4A; margin: 0 0 4px 0; font-weight: 600;">
                ${customerDetails.shipToCode} | ${customerDetails.shipToName}
              </p>
              <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
                ${customerDetails.shipToAddress}
              </p>
            </div>
          </div>
        `,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#6c757d',
        width: '650px',
        padding: '30px 20px',
        background: '#fff',
        customClass: {
          popup: 'customer-details-popup',
          htmlContainer: 'customer-details-content',
          confirmButton: 'customer-details-confirm-btn'
        }
      });
    }
  };

  // Function to toggle checkbox
  const toggleCheck = (id) => {
    setTableData(tableData.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  // Master checkbox toggle
  const toggleAll = (checked) => {
    setTableData(tableData.map(item => ({ ...item, isChecked: checked })));
  };

  // Filter and Search Logic
  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.planNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle Submit with Repeat Popup
  const handleSubmit = async () => {
    // Validate form fields
    if (!dateTime || !location || !customerName) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill all required fields',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Show repeat options popup
    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #20409A; font-size: 20px; font-weight: 600;">Repeat Plan</span>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #4A4A4A; margin-bottom: 10px;">
              Repeat Type
            </label>
            <select id="repeat-type" style="width: 100%; padding: 12px 14px; font-size: 14px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9; color: #4A4A4A; outline: none; cursor: pointer; transition: all 0.3s ease;">
              <option value="custom">Custom Date</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div id="custom-date-section" style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #4A4A4A; margin-bottom: 10px;">
              Select Date
            </label>
            <input type="date" id="custom-date" style="width: 100%; padding: 12px 14px; font-size: 14px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9; color: #4A4A4A; outline: none; transition: all 0.3s ease;" />
          </div>
          
          <div id="weekly-section" style="display: none; margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #4A4A4A; margin-bottom: 14px;">
              Select Days
            </label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
              <button type="button" class="day-btn" data-day="Monday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Monday</button>
              <button type="button" class="day-btn" data-day="Tuesday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Tuesday</button>
              <button type="button" class="day-btn" data-day="Wednesday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Wednesday</button>
              <button type="button" class="day-btn" data-day="Thursday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Thursday</button>
              <button type="button" class="day-btn" data-day="Friday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Friday</button>
              <button type="button" class="day-btn" data-day="Saturday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Saturday</button>
              <button type="button" class="day-btn" data-day="Sunday" style="padding: 12px 8px; border: 2px solid #ddd; border-radius: 8px; background: white; color: #4A4A4A; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-align: center;">Sunday</button>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#20409A',
      cancelButtonColor: '#6c757d',
      width: '550px',
      padding: '30px',
      background: '#fff',
      customClass: {
        popup: 'repeat-popup',
        title: 'repeat-popup-title',
        htmlContainer: 'repeat-popup-content',
        confirmButton: 'repeat-confirm-btn',
        cancelButton: 'repeat-cancel-btn'
      },
      didOpen: () => {
        const repeatType = document.getElementById('repeat-type');
        const customSection = document.getElementById('custom-date-section');
        const weeklySection = document.getElementById('weekly-section');
        const dayButtons = document.querySelectorAll('.day-btn');
        const customDateInput = document.getElementById('custom-date');

        // Add focus styles
        repeatType.addEventListener('focus', () => {
          repeatType.style.borderColor = '#20409A';
          repeatType.style.boxShadow = '0 0 0 3px rgba(32, 64, 154, 0.1)';
        });
        repeatType.addEventListener('blur', () => {
          repeatType.style.borderColor = '#ddd';
          repeatType.style.boxShadow = 'none';
        });

        customDateInput.addEventListener('focus', () => {
          customDateInput.style.borderColor = '#20409A';
          customDateInput.style.boxShadow = '0 0 0 3px rgba(32, 64, 154, 0.1)';
        });
        customDateInput.addEventListener('blur', () => {
          customDateInput.style.borderColor = '#ddd';
          customDateInput.style.boxShadow = 'none';
        });

        // Toggle sections based on repeat type
        repeatType.addEventListener('change', (e) => {
          if (e.target.value === 'custom') {
            customSection.style.display = 'block';
            weeklySection.style.display = 'none';
          } else {
            customSection.style.display = 'none';
            weeklySection.style.display = 'block';
          }
        });

        // Handle day button clicks with enhanced styling
        dayButtons.forEach(btn => {
          btn.addEventListener('mouseenter', (e) => {
            if (!e.currentTarget.classList.contains('selected')) {
              e.currentTarget.style.borderColor = '#20409A';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(32, 64, 154, 0.15)';
            }
          });

          btn.addEventListener('mouseleave', (e) => {
            if (!e.currentTarget.classList.contains('selected')) {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          });

          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const button = e.currentTarget;
            if (button.classList.contains('selected')) {
              button.classList.remove('selected');
              button.style.background = 'white';
              button.style.color = '#4A4A4A';
              button.style.borderColor = '#ddd';
              button.style.transform = 'translateY(0)';
              button.style.boxShadow = 'none';
            } else {
              button.classList.add('selected');
              button.style.background = '#20409A';
              button.style.color = 'white';
              button.style.borderColor = '#20409A';
              button.style.transform = 'translateY(-2px)';
              button.style.boxShadow = '0 4px 12px rgba(32, 64, 154, 0.3)';
            }
          });
        });
      },
      preConfirm: () => {
        const repeatType = document.getElementById('repeat-type').value;
        const customDate = document.getElementById('custom-date').value;
        const selectedDays = Array.from(document.querySelectorAll('.day-btn.selected')).map(btn => btn.dataset.day);

        if (repeatType === 'custom' && !customDate) {
          Swal.showValidationMessage('Please select a date');
          return false;
        }

        if (repeatType === 'weekly' && selectedDays.length === 0) {
          Swal.showValidationMessage('Please select at least one day');
          return false;
        }

        return {
          repeatType,
          customDate,
          selectedDays
        };
      }
    });

    if (formValues) {
      // Get current date for created date
      const now = new Date();
      const createdDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
      
      // Generate new plan number
      const newPlanNo = `P#${String(tableData.length + 11).padStart(4, '0')}`;
      
      // Create new plan object
      const newPlan = {
        id: tableData.length + 1,
        planNo: newPlanNo,
        customer: customerName,
        location: location,
        createdDate: createdDate,
        planDate: dateTime.replace('T', ':'),
        status: 'New',
        isChecked: false,
        repeat: formValues
      };
      
      // Add new plan to table
      setTableData([newPlan, ...tableData]);

      // Show success message
      let repeatMessage = '';
      if (formValues.repeatType === 'custom') {
        repeatMessage = `Custom Date: ${formValues.customDate}`;
      } else {
        repeatMessage = `Weekly on: ${formValues.selectedDays.join(', ')}`;
      }

      Swal.fire({
        icon: 'success',
        title: 'Plan Created!',
        html: `
          <div style="text-align: left;">
            <p><strong>Plan Number:</strong> ${newPlanNo}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Date & Time:</strong> ${dateTime}</p>
            <p><strong>Repeat:</strong> ${repeatMessage}</p>
            <p style="margin-top: 12px; color: #28a745; font-weight: 600;">✓ Plan added to View Plan table with status "New"</p>
          </div>
        `,
        confirmButtonColor: '#20409A',
      });

      // Reset form
      setPlanType('New Plan');
      setDateTime('');
      setLocation('');
      setCustomerName('');
      setRemark('');
    }
  };

  return (
    <div className="beat-container">
      

      {/* CREATE PLAN */}
      <div className="white-card">
        <h2 className="section-title">Create Plan</h2>
        <div className="form-grid">
          <div className="input-field">
            <label>New Plan</label>
            <select className="input-box" value={planType} onChange={(e) => setPlanType(e.target.value)}>
              <option>New Plan</option>
              <option>Follow-up</option>
            </select>
          </div>
          <div className="input-field">
            <label>Date and Time</label>
            <input type="datetime-local" className="input-box" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          {/* LOCATION DROPDOWN FIX */}
          <div className="input-field">
            <label>Location</label>
            <select className="input-box" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select Location</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Coimbatore">Coimbatore</option>
            </select>
          </div>
          <div className="input-field">
            <label>Customer Name</label>
            <select className="input-box" value={customerName} onChange={(e) => setCustomerName(e.target.value)}>
              <option value="">Select Customer</option>
              <option value="Sam auto part">Sam auto part</option>
              <option value="K R Parts">K R Parts</option>
            </select>
          </div>
        </div>
        <div className="remark-container">
          <div className="input-field">
            <label>Remark (optional)</label>
            <input type="text" placeholder="Enter Remark" className="input-box" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
          <div className="submit-container">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>

      {/* VIEW PLAN */}
      <div className="white-card mt-25">
        <div className="table-header">
          <h2 className="section-title">View Plan</h2>
          <div className="action-bar">
            {/* SEARCH BOX WITH ICON INSIDE FIX */}
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search Customer Name / Code" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* DELETE BUTTON FUNCTION */}
            <button className="text-action delete" onClick={handleDelete}>
              <img src={DeleteIcon} className="header-icon-btn" alt="delete" /> Delete
            </button>
            
            {/* FILTER DROPDOWN FUNCTION */}
            <div className="filter-dropdown-container">
              <button className="text-action" onClick={() => setShowFilterPopup(!showFilterPopup)}>
                <img src={FilterIcon} className="header-icon-btn" alt="filter" /> Filters {activeFilter !== 'All' && `(${activeFilter})`}
              </button>
              {showFilterPopup && (
                <div className="filter-popup">
                  <div onClick={() => {setActiveFilter('All'); setShowFilterPopup(false)}}>All Status</div>
                  <div onClick={() => {setActiveFilter('New'); setShowFilterPopup(false)}}>New</div>
                  <div onClick={() => {setActiveFilter('Visited'); setShowFilterPopup(false)}}>Visited</div>
                </div>
              )}
            </div>

            <button className="export-bordered">
              <img src={ExportIcon} className="header-icon-btn" alt="export" /> Export
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="beat-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} /></th>
                <th>Plan Number <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Customer Number <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Location <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Created Date <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Plan Date <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Plan Status <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((data) => (
                <tr key={data.id}>
                  <td><input type="checkbox" checked={data.isChecked || false} onChange={() => toggleCheck(data.id)} /></td>
                  <td className="plan-id">{data.planNo}</td>
                  <td>{data.customer}</td>
                  <td>{data.location}</td>
                  <td>{data.createdDate}</td>
                  <td>{data.planDate}</td>
                  <td><span className={`dot-status ${data.status.toLowerCase()}`}>{data.status}</span></td>
                  <td>
                    <img 
                      src={EyeIcon} 
                      className="table-eye-img" 
                      alt="view" 
                      onClick={() => handleViewDetails(data)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BeatPlan;