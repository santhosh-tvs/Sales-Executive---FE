import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiservice';
import * as XLSX from 'xlsx';
import './beatplan.css';

// Asset Imports
import DeleteIcon from "../../assets/Assets/Beat/delete.png";
import ExportIcon from "../../assets/Assets/Beat/export.png";
import ArrowIcon from "../../assets/Assets/Beat/arrow-down.png";
import EyeIcon from "../../assets/Assets/Beat/eye.png"; 

const BeatPlan = forwardRef(({ onCreateBeat, onApplyLeave, onImportBeat }, ref) => {
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch beat plans on component mount
  useEffect(() => {
    fetchBeatPlans();
  }, []);

  const fetchBeatPlans = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/beat-plan/new-beat-plan-list');
      
      if (response.success && response.data) {
        // Map API data to table format
        const formattedData = response.data.map(plan => {
          // Determine status based on check_in, check_out, and visited_status
          let status = 'New';
          if (plan.visited_status === 'visited') {
            status = 'Visited';
          } else if (plan.check_in && !plan.check_out) {
            status = 'Check in';
          } else if (plan.check_in && plan.check_out) {
            status = 'Visited';
          }

          // Format dates
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            });
          };

          const formatDateTime = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const dateFormatted = date.toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            });
            const timeFormatted = date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
            return `${dateFormatted} & ${timeFormatted}`;
          };

          return {
            id: plan.beat_plan_id,
            planNo: plan.plan_code,
            customer: plan.garage_name,
            customerCode: plan.garage_code,
            customerId: plan.customer_id,
            location: plan.garage_location,
            createdDate: formatDate(plan.created_at),
            planDate: plan.plan_date ? plan.plan_date.replace(' ', ':').substring(0, 16) : '',
            status: status,
            flag: 'Beat',
            isChecked: false,
            checkInTime: plan.check_in ? formatDateTime(plan.check_in) : null,
            checkOutTime: plan.check_out ? formatDateTime(plan.check_out) : null,
            purpose: 'Collection' // Default purpose
          };
        });

        setTableData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching beat plans:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load beat plans',
        confirmButtonColor: '#20409A'
      });
    } finally {
      setLoading(false);
    }
  };

  // Employee data
  const employeeData = [
    { code: 'EMP001', name: 'John Doe', mobile: '9876543210' },
    { code: 'EMP002', name: 'Jane Smith', mobile: '9876543211' },
    { code: 'EMP003', name: 'Mike Johnson', mobile: '9876543212' },
  ];

  // Function to delete a single row
  const handleDeleteRow = (id) => {
    Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setTableData(tableData.filter(item => item.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Record has been deleted.',
          confirmButtonColor: '#20409A',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
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

  // Export selected records to Excel
  const handleExport = () => {
    const selectedData = tableData.filter(item => item.isChecked);
    
    if (selectedData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Records Selected',
        text: 'Please select at least one record to export',
        confirmButtonColor: '#20409A'
      });
      return;
    }

    // Prepare data for Excel
    const exportData = selectedData.map(item => ({
      'Plan Number': item.planNo,
      'Customer Name': item.customer,
      'Customer Code': item.customerCode || '',
      'Location': item.location,
      'Created Date': item.createdDate,
      'Plan Date': item.planDate,
      'Status': item.status,
      'Flag': item.flag,
      'Check In Time': item.checkInTime || 'N/A',
      'Check Out Time': item.checkOutTime || 'N/A'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Plan Number
      { wch: 30 }, // Customer Name
      { wch: 15 }, // Customer Code
      { wch: 30 }, // Location
      { wch: 15 }, // Created Date
      { wch: 20 }, // Plan Date
      { wch: 12 }, // Status
      { wch: 10 }, // Flag
      { wch: 25 }, // Check In Time
      { wch: 25 }  // Check Out Time
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beat Plans');

    // Generate filename with current date
    const date = new Date();
    const filename = `Beat_Plans_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, filename);

    Swal.fire({
      icon: 'success',
      title: 'Exported Successfully!',
      text: `${selectedData.length} record(s) exported to ${filename}`,
      confirmButtonColor: '#20409A',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Expose handleExport to parent component
  useImperativeHandle(ref, () => ({
    handleExport
  }));

  // Filter and Search Logic
  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.planNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="beat-container">
      {/* VIEW PLAN */}
      <div className="white-card mt-25">
        <div className="table-responsive">
          <table className="beat-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} /></th>
                <th>Plan Number <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Customer Name <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Location <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Created Date <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Plan Date <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Plan Status <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th>Flag <img src={ArrowIcon} className="table-arrow-img" alt="sort" /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{textAlign:'center', padding:'40px'}}>
                    Loading beat plans...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? filteredData.map((data) => (
                <tr key={data.id}>
                  <td><input type="checkbox" checked={data.isChecked || false} onChange={() => toggleCheck(data.id)} /></td>
                  <td className="plan-id">{data.planNo}</td>
                  <td>{data.customer}</td>
                  <td>{data.location}</td>
                  <td>{data.createdDate}</td>
                  <td>{data.planDate}</td>
                  <td><span className={`dot-status ${data.status.toLowerCase()}`}>{data.status}</span></td>
                  <td><span className={`flag-badge ${data.flag.toLowerCase()}`}>{data.flag}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={EyeIcon} 
                        className="table-eye-img" 
                        alt="view" 
                        onClick={() => handleViewDetails(data)}
                        style={{ cursor: 'pointer' }}
                      />
                      <img 
                        src={DeleteIcon} 
                        className="table-delete-img" 
                        alt="delete" 
                        onClick={() => handleDeleteRow(data.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default BeatPlan;