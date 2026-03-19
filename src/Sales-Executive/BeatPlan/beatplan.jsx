import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiService } from '../../services/apiservice';
import './beatplan.css';

import { formatDate, formatDateTime, determineStatus, getEndpoint } from './utils/beatPlanUtils';
import { getPlanDetailsHTML, popupConfig } from './templates/popupTemplates';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchVisitCounts();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filter or search changes
    // The currentPage effect below will handle the actual fetch
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    fetchBeatPlans();
  }, [currentPage, activeFilter, searchTerm]);

  const fetchBeatPlans = async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint(activeFilter);
      const params = new URLSearchParams({ page: currentPage.toString(), pageSize: pageSize.toString() });
      if (searchTerm) params.append('search', searchTerm);

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
          purpose: plan.plan_remarks || plan.remarks || 'N/A',
          target: plan.target || '0',
          targetAchieved: plan.target_achieved || '0',
        }));
        setTableData(formattedData);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.total);
        } else {
          setTotalRecords(response.count || formattedData.length);
          setTotalPages(Math.ceil((response.count || formattedData.length) / pageSize));
        }
      }
    } catch (error) {
      console.error('Error fetching beat plans:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to load beat plans.', confirmButtonColor: '#20409A' });
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitCounts = async () => {
    try {
      const response = await apiService.get('/beat-plan/plan-visited-counts');
      if (response.success && response.data) setVisitCounts(response.data);
    } catch (error) {
      console.error('Error fetching visit counts:', error);
    }
  };

  const fetchCustomerDetails = async (planData) => {
    try {
      // Fallback details built from planData in case API fails
      const fallback = {
        name: planData.customer || 'N/A',
        code: planData.customerCode || 'N/A',
        location: planData.location || 'N/A',
        phone: 'N/A',
        email: 'N/A',
        address: planData.location || 'N/A',
        creditBalance: '0.00',
        creditLimit: '0.00',
        overDueInvoice: '0',
        overDueAmount: '0.00',
        totalOutstanding: '0.00',
        shipToCode: 'N/A',
        shipToName: planData.customer || 'N/A',
        shipToAddress: planData.location || 'N/A',
      };

      if (!planData.customerCode) return fallback;

      const viewCustomerResponse = await apiService.get(`/profile/view-customer/${planData.customerCode}`);
      if (!viewCustomerResponse.success || !viewCustomerResponse.user_detail) return fallback;

      const d = viewCustomerResponse.user_detail;
      let fin = null;
      if (d.account_number) {
        const { customerDetails: customerDetailsAPI } = await import('../../services/api');
        fin = await customerDetailsAPI({ accountNumber: d.account_number.toString() });
      }

      return {
        name: d.customer_name || planData.customer,
        code: d.customer_code || planData.customerCode || 'N/A',
        location: d.city || planData.location,
        phone: d.phone_number || 'N/A',
        email: d.email_address || 'N/A',
        address: [d.address1, d.address2, d.address3, d.city, d.state, d.post_code].filter(Boolean).join(', '),
        creditBalance: fin?.availablecreditlimit?.toFixed(2) || '0.00',
        creditLimit: fin?.creditLimit?.toString() || d.credit_limit || '0.00',
        overDueInvoice: fin?.noofoverdueinvoices?.toString() || '0',
        overDueAmount: fin?.overdueamount?.toFixed(2) || '0.00',
        totalOutstanding: fin?.outstandingamount?.toFixed(2) || '0.00',
        shipToCode: d.site_number || 'N/A',
        shipToName: d.site_code || planData.customer,
        shipToAddress: [d.address1, d.address2, d.city, d.state, d.post_code].filter(Boolean).join(', '),
      };
    } catch (error) {
      console.error('Error fetching customer details:', error);
      // Return fallback so the popup still opens with plan data
      return {
        name: planData.customer || 'N/A',
        code: planData.customerCode || 'N/A',
        location: planData.location || 'N/A',
        phone: 'N/A',
        email: 'N/A',
        address: planData.location || 'N/A',
        creditBalance: '0.00',
        creditLimit: '0.00',
        overDueInvoice: '0',
        overDueAmount: '0.00',
        totalOutstanding: '0.00',
        shipToCode: 'N/A',
        shipToName: planData.customer || 'N/A',
        shipToAddress: planData.location || 'N/A',
      };
    }
  };

  const handleViewDetails = async (planData) => {
    try {
      const customerDetails = await fetchCustomerDetails(planData);
      Swal.fire({
        ...popupConfig,
        title: 'Plan Details',
        html: getPlanDetailsHTML(customerDetails, planData),
      });
    } catch (error) {
      console.error('Error showing plan details:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load plan details', confirmButtonColor: '#20409A' });
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
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        setDeletingId(id);
        const response = await apiService.post('/beat-plan/delete-beat-plan', { beat_plan_id: id });
        if (response.success) {
          await fetchBeatPlans();
          await fetchVisitCounts();
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Record deleted successfully.', confirmButtonColor: '#20409A', timer: 1500, showConfirmButton: false });
        }
      } catch (error) {
        console.error('Error deleting beat plan:', error);
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: error.response?.data?.message || 'Failed to delete record.', confirmButtonColor: '#20409A' });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const toggleCheck = (id) => setTableData(tableData.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  const toggleAll = (checked) => setTableData(tableData.map(item => ({ ...item, isChecked: checked })));

  const handleSort = (column) => {
    if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
  };

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleExport = async () => {
    const selectedData = tableData.filter(item => item.isChecked);
    if (selectedData.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Records Selected', text: 'Please select at least one record to export', confirmButtonColor: '#20409A' });
      return;
    }
    try {
      const response = await apiService.get('/beat-plan/export-beat-plans-excel', { responseType: 'blob' });
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
      Swal.fire({ icon: 'success', title: 'Exported!', text: `Exported to ${filename}`, confirmButtonColor: '#20409A', timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error('Error exporting:', error);
      Swal.fire({ icon: 'error', title: 'Export Failed', text: 'Failed to export beat plans', confirmButtonColor: '#20409A' });
    }
  };

  useImperativeHandle(ref, () => ({ handleExport }));

  const getSortedData = (data) => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      if (sortColumn === 'createdDate' || sortColumn === 'planDate') { aVal = new Date(aVal); bVal = new Date(bVal); }
      else if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Server already handles search and filter; just use tableData directly
  const filteredData = tableData;

  const sortedData = getSortedData(filteredData);
  const filterButtons = ['All Plans', 'New Plans', 'Visited Plans', "Today's Visits"];
  const filterValues = ['All', 'New', 'Visited', 'Today'];

  const SortTh = ({ column, label }) => (
    <th onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
      {label}{' '}
      <img src={ArrowIcon} className="table-arrow-img" alt="sort"
        style={{ transform: sortColumn === column && sortDirection === 'desc' ? 'rotate(180deg)' : 'none', opacity: sortColumn === column ? 1 : 0.5 }} />
    </th>
  );

  return (
    <div className="beat-container">
      <div className="white-card mt-25">
        {/* Filters + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '12px 15px 0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterButtons.map((label, index) => (
              <button key={filterValues[index]} onClick={() => setActiveFilter(filterValues[index])}
                style={{ padding: '6px 14px', borderRadius: '3px', border: activeFilter === filterValues[index] ? '2px solid #20409A' : '2px solid #e0e0e0', background: activeFilter === filterValues[index] ? '#20409A' : 'white', color: activeFilter === filterValues[index] ? 'white' : '#666', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search by customer or plan number..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '2px solid #ffffffff', fontSize: '12px', width: '280px', outline: 'none', transition: 'all 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#ffffffff'}
              onBlur={(e) => e.target.style.borderColor = '#ffffffff'} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="beat-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} /></th>
                <SortTh column="planNo" label="Plan Number" />
                <SortTh column="customer" label="Customer Name" />
                <SortTh column="location" label="Location" />
                <SortTh column="createdDate" label="Created Date" />
                <SortTh column="planDate" label="Plan Date" />
                <SortTh column="status" label="Plan Status" />
                <th>Flag</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #20409A', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
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
                      <img src={EyeIcon} className="table-eye-img" alt="view"
                        onClick={() => !deletingId && handleViewDetails(data)}
                        style={{ cursor: deletingId ? 'not-allowed' : 'pointer', opacity: deletingId === data.id ? 0.5 : 1 }}
                        title="View Details" />
                      <img src={DeleteIcon} className="table-delete-img" alt="delete"
                        onClick={() => !deletingId && handleDeleteRow(data.id)}
                        style={{ cursor: deletingId ? 'not-allowed' : 'pointer', opacity: deletingId === data.id ? 0.5 : 1 }}
                        title="Delete" />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && sortedData.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
            </div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button onClick={handlePreviousPage} disabled={currentPage === 1}
                style={{ padding: '5px 12px', borderRadius: '4px', border: '1px solid #e0e0e0', background: currentPage === 1 ? '#f5f5f5' : 'white', color: currentPage === 1 ? '#999' : '#333', fontSize: '12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button key={page} onClick={() => handlePageChange(page)}
                      style={{ padding: '5px 10px', borderRadius: '4px', border: currentPage === page ? '2px solid #20409A' : '1px solid #e0e0e0', background: currentPage === page ? '#20409A' : 'white', color: currentPage === page ? 'white' : '#333', fontSize: '12px', cursor: 'pointer', fontWeight: '600', minWidth: '32px' }}>
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} style={{ padding: '0 5px', color: '#999' }}>...</span>;
                }
                return null;
              })}
              <button onClick={handleNextPage} disabled={currentPage === totalPages}
                style={{ padding: '5px 12px', borderRadius: '4px', border: '1px solid #e0e0e0', background: currentPage === totalPages ? '#f5f5f5' : 'white', color: currentPage === totalPages ? '#999' : '#333', fontSize: '12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
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
