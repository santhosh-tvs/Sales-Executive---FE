import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiservice';
import './beatplan.css';

// Utils and Templates
import {
  formatDate,
  formatDateTime,
  determineStatus,
  getEndpoint,
  getCurrentDateTime,
  getCurrentLocation,
  saveCheckInData,
  getCheckInData
} from './utils/beatPlanUtils';
import {
  getCustomerDetailsHTML,
  getCheckInDetailsHTML,
  getCheckInFormHTML,
  getCheckOutFormHTML,
  popupConfig
} from './templates/popupTemplates';

// Asset Imports
import DeleteIcon from "../../assets/Assets/Beat/delete.png";
import ArrowIcon from "../../assets/Assets/Beat/arrow-down.png";
import EyeIcon from "../../assets/Assets/Beat/eye.png";

const BeatPlan = forwardRef(({ onCreateBeat, onApplyLeave, onImportBeat }, ref) => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visitCounts, setVisitCounts] = useState({ today: 0, week: 0, month: 0 });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Sorting states
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Action loading states
  const [deletingId, setDeletingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [checkingOutId, setCheckingOutId] = useState(null);

  useEffect(() => {
    fetchBeatPlans();
    fetchVisitCounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    fetchBeatPlans();
  }, [activeFilter, searchTerm]);
  
  useEffect(() => {
    fetchBeatPlans();
  }, [currentPage]);

  const fetchBeatPlans = async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint(activeFilter);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await apiService.get(`${endpoint}?${params.toString()}`);

      if (response.success && response.data) {
        const formattedData = response.data.map(plan => ({
          id: plan.beat_plan_id,
          planNo: plan.plan_code,
          customer: plan.garage_name,
          customerCode: plan.garage_code,
          customerId: plan.customer_id,
          location: plan.garage_location,
          createdDate: formatDate(plan.created_at),
          planDate: plan.plan_date ? plan.plan_date.replace(' ', ':').substring(0, 16) : '',
          status: determineStatus(plan),
          flag: 'Beat',
          isChecked: false,
          checkInTime: plan.check_in ? formatDateTime(plan.check_in) : null,
          checkOutTime: plan.check_out ? formatDateTime(plan.check_out) : null,
          purpose: plan.target_type || 'N/A',
          target: plan.target || '0',
          targetAchieved: plan.target_achieved || '0'
        }));
        setTableData(formattedData);
        
        // Update pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        } else {
          // If no pagination in response, calculate from count
          setTotalRecords(response.count || formattedData.length);
          setTotalPages(Math.ceil((response.count || formattedData.length) / pageSize));
        }
      }
    } catch (error) {
      console.error('Error fetching beat plans:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to load beat plans. Please try again.',
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
      setCheckingInId(planData.id);
      
      const { value: formValues } = await Swal.fire({
        title: 'Check-in Details',
        html: getCheckInFormHTML(),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#20409A',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
          const targetType = document.getElementById('swal-target-type').value;
          const target = document.getElementById('swal-target').value;
          if (!targetType) {
            Swal.showValidationMessage('Purpose is required');
            return false;
          }
          return { target_type: targetType, target: target || '0' };
        }
      });

      if (!formValues) {
        setCheckingInId(null);
        return;
      }

      const latLong = await getCurrentLocation();
      const dateTime = getCurrentDateTime();

      const response = await apiService.post('/beat-plan/update-visit', {
        beat_plan_id: planData.id,
        type: 'check_in',
        date_time: dateTime,
        lat_long: latLong,
        target: formValues.target,
        target_type: formValues.target_type
      });

      if (response.success) {
        saveCheckInData(planData.id, {
          beat_plan_id: planData.id,
          target_type: formValues.target_type,
          target: formValues.target,
          check_in_time: dateTime
        });

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
    } catch (error) {
      console.error('Error checking in:', error);
      Swal.fire({
        icon: 'error',
        title: error.message || 'Check-in Failed',
        text: error.response?.data?.message || 'Failed to check in. Please try again.',
        confirmButtonColor: '#20409A'
      });
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCheckOut = async (planData) => {
    try {
      setCheckingOutId(planData.id);
      
      const { value: targetAchieved } = await Swal.fire({
        title: 'Check-out Details',
        html: getCheckOutFormHTML(),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#20409A',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
          const achieved = document.getElementById('swal-target-achieved').value;
          if (!achieved) {
            Swal.showValidationMessage('Target achieved amount is required');
            return false;
          }
          return achieved;
        }
      });

      if (!targetAchieved) {
        setCheckingOutId(null);
        return;
      }

      const latLong = await getCurrentLocation();
      const dateTime = getCurrentDateTime();

      const response = await apiService.post('/beat-plan/update-visit', {
        beat_plan_id: planData.id,
        type: 'check_out',
        date_time: dateTime,
        lat_long: latLong,
        target_achieved: targetAchieved
      });

      if (response.success) {
        saveCheckInData(planData.id, {
          target_achieved: targetAchieved,
          check_out_time: dateTime
        });

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
        title: error.message || 'Check-out Failed',
        text: error.response?.data?.message || 'Failed to check out. Please try again.',
        confirmButtonColor: '#20409A'
      });
    } finally {
      setCheckingOutId(null);
    }
  };

  const handleDeleteRow = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        setDeletingId(id);
        
        const response = await apiService.post('/beat-plan/delete-beat-plan', {
          beat_plan_id: id
        });
        
        if (response.success) {
          await fetchBeatPlans();
          await fetchVisitCounts();
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Record has been deleted successfully.',
            confirmButtonColor: '#20409A',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error deleting beat plan:', error);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.response?.data?.message || 'Failed to delete record. Please try again.',
          confirmButtonColor: '#20409A'
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const fetchCustomerDetails = async (planData) => {
    try {
      const viewCustomerResponse = await apiService.get(`/profile/view-customer/${planData.customerCode}`);
      
      if (!viewCustomerResponse.success || !viewCustomerResponse.user_detail) {
        return null;
      }

      const viewCustomerData = viewCustomerResponse.user_detail;
      let customerDetailsData = null;

      if (viewCustomerData.account_number) {
        const { customerDetails: customerDetailsAPI } = await import('../../services/api');
        customerDetailsData = await customerDetailsAPI({ 
          accountNumber: viewCustomerData.account_number.toString() 
        });
      }

      return {
        name: viewCustomerData?.customer_name || planData.customer,
        code: viewCustomerData?.customer_code || planData.customerCode || 'N/A',
        location: viewCustomerData?.city || planData.location,
        phone: viewCustomerData?.phone_number || 'N/A',
        email: viewCustomerData?.email_address || 'N/A',
        address: [
          viewCustomerData.address1,
          viewCustomerData.address2,
          viewCustomerData.address3,
          viewCustomerData.city,
          viewCustomerData.state,
          viewCustomerData.post_code
        ].filter(Boolean).join(', '),
        creditBalance: customerDetailsData?.availablecreditlimit?.toFixed(2) || '0.00',
        creditLimit: customerDetailsData?.creditLimit?.toString() || viewCustomerData?.credit_limit || '0.00',
        overDueInvoice: customerDetailsData?.noofoverdueinvoices?.toString() || '0',
        overDueAmount: customerDetailsData?.overdueamount?.toFixed(2) || '0.00',
        totalOutstanding: customerDetailsData?.outstandingamount?.toFixed(2) || '0.00',
        shipToCode: viewCustomerData?.site_number || 'N/A',
        shipToName: viewCustomerData?.site_code || planData.customer,
        shipToAddress: [
          viewCustomerData.address1,
          viewCustomerData.address2,
          viewCustomerData.city,
          viewCustomerData.state,
          viewCustomerData.post_code
        ].filter(Boolean).join(', ')
      };
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  };

  const handleViewDetails = async (planData) => {
    try {
      const storedData = getCheckInData(planData.id);
      
      if (storedData) {
        planData.purpose = storedData.target_type || 'N/A';
        planData.target = storedData.target || '0';
        planData.targetAchieved = storedData.target_achieved || '0';
        
        if (storedData.check_out_time) {
          planData.checkOutTime = formatDateTime(storedData.check_out_time);
        }
      }

      const customerDetails = await fetchCustomerDetails(planData);
      if (!customerDetails) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load customer details',
          confirmButtonColor: '#20409A'
        });
        return;
      }

      const config = {
        ...popupConfig,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonColor: planData.status === 'Visited' ? '#6c757d' : '#20409A'
      };

      if (planData.status === 'New') {
        Swal.fire({
          ...config,
          html: getCustomerDetailsHTML(customerDetails),
          confirmButtonText: 'Continue to check in'
        }).then((result) => {
          if (result.isConfirmed) handleCheckIn(planData);
        });
      } else if (planData.status === 'Check in') {
        Swal.fire({
          ...config,
          html: getCheckInDetailsHTML(customerDetails, planData),
          confirmButtonText: 'Continue to check out'
        }).then((result) => {
          if (result.isConfirmed) handleCheckOut(planData);
        });
      } else if (planData.status === 'Visited') {
        Swal.fire({
          ...config,
          html: getCustomerDetailsHTML(customerDetails),
          confirmButtonText: 'Close'
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

  const toggleCheck = (id) => {
    setTableData(tableData.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const toggleAll = (checked) => {
    setTableData(tableData.map(item => ({ ...item, isChecked: checked })));
  };
  
  // Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Search handler with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
  };
  
  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
      const response = await apiService.get('/beat-plan/export-beat-plans-excel', {
        responseType: 'blob'
      });

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

  useImperativeHandle(ref, () => ({ handleExport }));

  // Apply sorting to data
  const getSortedData = (data) => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      // Handle different data types
      if (sortColumn === 'createdDate' || sortColumn === 'planDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.planNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });
  
  const sortedData = getSortedData(filteredData);

  const filterButtons = ['All Plans', 'New Plans', 'Visited Plans', "Today's Visits"];
  const filterValues = ['All', 'New', 'Visited', 'Today'];

  return (
    <div className="beat-container">
      <div className="white-card mt-25">
        {/* Filter Buttons and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '0 15px', paddingTop: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterButtons.map((label, index) => (
              <button
                key={filterValues[index]}
                onClick={() => setActiveFilter(filterValues[index])}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: activeFilter === filterValues[index] ? '2px solid #20409A' : '2px solid #e0e0e0',
                  background: activeFilter === filterValues[index] ? '#20409A' : 'white',
                  color: activeFilter === filterValues[index] ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by customer or plan number..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '2px solid #e0e0e0',
                fontSize: '12px',
                width: '280px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#20409A'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="beat-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} /></th>
                <th onClick={() => handleSort('planNo')} style={{ cursor: 'pointer' }}>
                  Plan Number 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'planNo' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'planNo' ? 1 : 0.5
                    }}
                  />
                </th>
                <th onClick={() => handleSort('customer')} style={{ cursor: 'pointer' }}>
                  Customer Name 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'customer' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'customer' ? 1 : 0.5
                    }}
                  />
                </th>
                <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                  Location 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'location' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'location' ? 1 : 0.5
                    }}
                  />
                </th>
                <th onClick={() => handleSort('createdDate')} style={{ cursor: 'pointer' }}>
                  Created Date 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'createdDate' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'createdDate' ? 1 : 0.5
                    }}
                  />
                </th>
                <th onClick={() => handleSort('planDate')} style={{ cursor: 'pointer' }}>
                  Plan Date 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'planDate' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'planDate' ? 1 : 0.5
                    }}
                  />
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Plan Status 
                  <img 
                    src={ArrowIcon} 
                    className="table-arrow-img" 
                    alt="sort"
                    style={{ 
                      transform: sortColumn === 'status' && sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                      opacity: sortColumn === 'status' ? 1 : 0.5
                    }}
                  />
                </th>
                <th>Flag</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #20409A',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Loading beat plans...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length > 0 ? sortedData.map((data) => (
                <tr key={data.id} style={{ opacity: deletingId === data.id ? 0.5 : 1 }}>
                  <td><input type="checkbox" checked={data.isChecked || false} onChange={() => toggleCheck(data.id)} disabled={deletingId === data.id} /></td>
                  <td className="plan-id">{data.planNo}</td>
                  <td>{data.customer}</td>
                  <td>{data.location}</td>
                  <td>{data.createdDate}</td>
                  <td>{data.planDate}</td>
                  <td><span className={`dot-status ${data.status.toLowerCase()}`}>{data.status}</span></td>
                  <td><span className={`flag-badge ${data.flag.toLowerCase()}`}>{data.flag}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={EyeIcon}
                        className="table-eye-img"
                        alt="view"
                        onClick={() => !deletingId && handleViewDetails(data)}
                        style={{ cursor: deletingId ? 'not-allowed' : 'pointer', opacity: deletingId === data.id ? 0.5 : 1 }}
                        title="View Details"
                      />
                      <img
                        src={DeleteIcon}
                        className="table-delete-img"
                        alt="delete"
                        onClick={() => !deletingId && handleDeleteRow(data.id)}
                        style={{ cursor: deletingId ? 'not-allowed' : 'pointer', opacity: deletingId === data.id ? 0.5 : 1 }}
                        title="Delete"
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
        
        {/* Pagination Controls */}
        {!loading && sortedData.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 15px',
            borderTop: '1px solid #eee'
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
            </div>
            
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: currentPage === 1 ? '#f5f5f5' : 'white',
                  color: currentPage === 1 ? '#999' : '#333',
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: currentPage === page ? '2px solid #20409A' : '1px solid #e0e0e0',
                        background: currentPage === page ? '#20409A' : 'white',
                        color: currentPage === page ? 'white' : '#333',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        minWidth: '32px'
                      }}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} style={{ padding: '0 5px', color: '#999' }}>...</span>;
                }
                return null;
              })}
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: currentPage === totalPages ? '#f5f5f5' : 'white',
                  color: currentPage === totalPages ? '#999' : '#333',
                  fontSize: '12px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default BeatPlan;
