import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiservice';
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
  const [visitCounts, setVisitCounts] = useState({ today: 0, week: 0, month: 0 });

  // Fetch beat plans on component mount
  useEffect(() => {
    fetchBeatPlans();
    fetchVisitCounts();
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    fetchBeatPlans();
  }, [activeFilter]);

  const fetchBeatPlans = async () => {
    try {
      setLoading(true);

      // Determine which API to call based on activeFilter
      let endpoint = '/beat-plan/new-beat-plan-list';
      if (activeFilter === 'Visited') {
        endpoint = '/beat-plan/visited-beat-plan-list';
      } else if (activeFilter === 'Today') {
        endpoint = '/beat-plan/plan-visits-list';
      } else if (activeFilter === 'All') {
        endpoint = '/beat-plan/new-beat-plan-list'; // For now, show new plans for "All"
      }

      const response = await apiService.get(endpoint);

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

  const fetchVisitCounts = async () => {
    try {
      const response = await apiService.get('/beat-plan/plan-visited-counts');
      if (response.success && response.data) {
        setVisitCounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching visit counts:', error);
    }
  };

  const handleCheckIn = async (planData) => {
    try {
      // Get current location
      if (!navigator.geolocation) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Geolocation is not supported by your browser',
          confirmButtonColor: '#20409A'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const latLong = `${lat},${lng}`;

            const now = new Date();
            const dateTime = now.toISOString();

            const response = await apiService.post('/beat-plan/update-visit', {
              beat_plan_id: planData.id,
              type: 'check_in',
              date_time: dateTime,
              lat_long: latLong,
              target: 0,
              target_type: 'Rs'
            });

            if (response.success) {
              // Refresh the beat plans list
              await fetchBeatPlans();
              await fetchVisitCounts();

              Swal.fire({
                icon: 'success',
                title: 'Checked In!',
                text: `Successfully checked in to ${planData.customer}`,
                confirmButtonColor: '#20409A',
                timer: 2000,
                showConfirmButton: false
              });
            }
          } catch (apiError) {
            console.error('API Error:', apiError);
            Swal.fire({
              icon: 'error',
              title: 'Check-in Failed',
              text: apiError.response?.data?.message || 'Failed to check in. Please try again.',
              confirmButtonColor: '#20409A'
            });
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Location Error',
            text: 'Unable to get your location. Please enable location services.',
            confirmButtonColor: '#20409A'
          });
        }
      );
    } catch (error) {
      console.error('Error checking in:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check in',
        confirmButtonColor: '#20409A'
      });
    }
  };

  const handleCheckOut = async (planData) => {
    try {
      const now = new Date();
      const dateTime = now.toISOString();

      const response = await apiService.post('/beat-plan/update-visit', {
        beat_plan_id: planData.id,
        type: 'check_out',
        date_time: dateTime,
        lat_long: '0,0', // Not needed for checkout
        target_achieved: 0
      });

      if (response.success) {
        // Refresh the beat plans list
        await fetchBeatPlans();
        await fetchVisitCounts();

        Swal.fire({
          icon: 'success',
          title: 'Checked Out!',
          text: `Successfully checked out from ${planData.customer}`,
          confirmButtonColor: '#20409A',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error checking out:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check out',
        confirmButtonColor: '#20409A'
      });
    }
  };

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


  // Function to handle eye icon click - show customer details
  const handleViewDetails = async (planData) => {
    try {
      // Fetch customer details using customer code
      let customerDetailsData = null;
      let viewCustomerData = null;
      
      try {
        // First get customer details from view-customer API
        console.log('🔍 Fetching customer with code:', planData.customerCode);
        console.log('🔍 Plan data:', planData);
        
        const viewCustomerResponse = await apiService.get(`/profile/view-customer/${planData.customerCode}`);
        
        console.log('📋 View Customer Response:', viewCustomerResponse);
        
        if (viewCustomerResponse.success && viewCustomerResponse.user_detail) {
          viewCustomerData = viewCustomerResponse.user_detail;
          
          console.log('✅ View Customer Data:', viewCustomerData);
          console.log('🔢 Account Number:', viewCustomerData.account_number);
          
          // Now fetch financial details using account number
          if (viewCustomerData.account_number) {
            const { customerDetails: customerDetailsAPI } = await import('../../services/api');
            const detailsResponse = await customerDetailsAPI({ 
              accountNumber: viewCustomerData.account_number.toString() 
            });
            
            console.log('💰 Customer Details Response:', detailsResponse);
            console.log('💰 Response type:', typeof detailsResponse);
            console.log('💰 Response keys:', detailsResponse ? Object.keys(detailsResponse) : 'null');
            
            if (detailsResponse) {
              customerDetailsData = detailsResponse;
              console.log('✅ Customer Details Data:', customerDetailsData);
              console.log('✅ Available Credit Limit:', customerDetailsData.availablecreditlimit);
              console.log('✅ Credit Limit:', customerDetailsData.creditLimit);
              console.log('✅ Overdue Invoices:', customerDetailsData.noofoverdueinvoices);
            } else {
              console.warn('⚠️ Customer details API returned null or undefined');
            }
          } else {
            console.warn('⚠️ No account number found in view customer data');
          }
        }
      } catch (apiError) {
        console.error('❌ Could not fetch customer details from API:', apiError);
      }
      
      // Build customer details from API data only
      const customerDetails = {
        // Basic info from view-customer API
        name: viewCustomerData?.customer_name || planData.customer,
        code: viewCustomerData?.customer_code || planData.customerCode || 'N/A',
        location: viewCustomerData?.city || planData.location,
        phone: viewCustomerData?.phone_number || 'N/A',
        email: viewCustomerData?.email_address || 'N/A',
        address: viewCustomerData ? [
          viewCustomerData.address1,
          viewCustomerData.address2,
          viewCustomerData.address3,
          viewCustomerData.city,
          viewCustomerData.state,
          viewCustomerData.post_code
        ].filter(Boolean).join(', ') : planData.location,
        
        // Financial info from customer details API
        creditBalance: customerDetailsData?.availablecreditlimit 
          ? customerDetailsData.availablecreditlimit.toFixed(2) 
          : '0.00',
        creditLimit: customerDetailsData?.creditLimit 
          ? customerDetailsData.creditLimit.toString()
          : (viewCustomerData?.credit_limit || '0.00'),
        overDueInvoice: customerDetailsData?.noofoverdueinvoices?.toString() || '0',
        overDueAmount: customerDetailsData?.overdueamount 
          ? customerDetailsData.overdueamount.toFixed(2) 
          : '0.00',
        totalOutstanding: customerDetailsData?.outstandingamount 
          ? customerDetailsData.outstandingamount.toFixed(2) 
          : '0.00',
        
        // Ship to info from view-customer API
        shipToCode: viewCustomerData?.site_number || 'N/A',
        shipToName: viewCustomerData?.site_code || planData.customer,
        shipToAddress: viewCustomerData ? [
          viewCustomerData.address1,
          viewCustomerData.address2,
          viewCustomerData.city,
          viewCustomerData.state,
          viewCustomerData.post_code
        ].filter(Boolean).join(', ') : planData.location
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
          // Call check-in API
          handleCheckIn(planData);
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
          // Call check-out API
          handleCheckOut(planData);
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
    } catch (error) {
      console.error('Error showing customer details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load customer details',
        confirmButtonColor: '#20409A'
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

  // Export selected records to Excel using backend API
  const handleExport = async () => {
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

    try {
      // Call backend export API
      const response = await apiService.get('/beat-plan/export-beat-plans-excel', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;

      const date = new Date();
      const filename = `beat-plans-report-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Exported Successfully!',
        text: `Beat plans exported to ${filename}`,
        confirmButtonColor: '#20409A',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error exporting beat plans:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export beat plans',
        confirmButtonColor: '#20409A'
      });
    }
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
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '0 20px', paddingTop: '20px' }}>
          <button
            onClick={() => setActiveFilter('All')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: activeFilter === 'All' ? '2px solid #20409A' : '2px solid #e0e0e0',
              background: activeFilter === 'All' ? '#20409A' : 'white',
              color: activeFilter === 'All' ? 'white' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All Plans
          </button>
          <button
            onClick={() => setActiveFilter('New')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: activeFilter === 'New' ? '2px solid #20409A' : '2px solid #e0e0e0',
              background: activeFilter === 'New' ? '#20409A' : 'white',
              color: activeFilter === 'New' ? 'white' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            New Plans
          </button>
          <button
            onClick={() => setActiveFilter('Visited')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: activeFilter === 'Visited' ? '2px solid #20409A' : '2px solid #e0e0e0',
              background: activeFilter === 'Visited' ? '#20409A' : 'white',
              color: activeFilter === 'Visited' ? 'white' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Visited Plans
          </button>
          <button
            onClick={() => setActiveFilter('Today')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: activeFilter === 'Today' ? '2px solid #20409A' : '2px solid #e0e0e0',
              background: activeFilter === 'Today' ? '#20409A' : 'white',
              color: activeFilter === 'Today' ? 'white' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Today's Visits
          </button>
        </div>

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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
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
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default BeatPlan;