import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { getOrderListAPI } from '../../../services/api';
import './OrderHistory.css';

const PAGE_SIZE = 10;

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d) ? '-' : d.toLocaleDateString('en-IN');
};

const getEmployeeCode = () =>
  localStorage.getItem('sales_executive_code') ||
  (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').sales_executive_code || ''; } catch { return ''; } })();

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
};

const HoldOrderHistory = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async (isSync = false) => {
    if (isSync) setSyncing(true);
    else setLoading(true);
    setError('');
    try {
      const empCode = getEmployeeCode();
      const payload = {
        customer_code: empCode,
        employee_code: empCode,
        from_date: fromDate,
        to_date: toDate,
      };
      const res = await getOrderListAPI(payload);
      if (res && res.success && res.data) {
        // Hold orders: status = cancelled AND order_type = back-order
        const holdOrders = res.data.filter(
          o => o.order_type === 'back-order' && o.status === 'cancelled'
        );
        setOrders(holdOrders);
      } else {
        setOrders([]);
      }
      setPage(1);
    } catch {
      setError('Failed to fetch hold orders. Please try again.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const handleExportAll = () => {
    if (!orders.length) return;
    const exportData = orders.map((o, i) => ({
      'S.No': i + 1,
      'Customer Code': o.customer_code || '-',
      'Employee Code': o.employee_code || '-',
      'Temp Order Number': o.order_no || '-',
      'Mcollect Order Number': o.mcollect_order_no || o.order_no || '-',
      'Part Number': o.part_no || '-',
      'Qty': o.quantity || '-',
      'Total Price': o.total_price || '-',
      'Order Type': o.order_type || '-',
      'Status': o.status || '-',
      'Created At': formatDate(o.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hold Orders');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Hold_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paged = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="oh-container">
        <div className="oh-content">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'History', path: '/history/hold-order' },
            { label: 'Hold Order' },
          ]} />

          <div className="oh-filters">
            <div className="oh-filter-group">
              <label>From Date</label>
              <input type="date" className="oh-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="oh-filter-group">
              <label>To Date</label>
              <input type="date" className="oh-input" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="oh-filter-actions">
              <button className="oh-view-btn" onClick={() => fetchOrders()} disabled={loading || syncing}>
                {loading ? <><span className="oh-spinner" style={{width:14,height:14,borderWidth:2}} /> Loading...</> : 'View'}
              </button>
              <button className="oh-sync-btn" onClick={() => fetchOrders(true)} disabled={loading || syncing} title="Sync">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={syncing ? 'oh-spin' : ''}>
                  <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              <button className="oh-export-btn" onClick={handleExportAll} disabled={!orders.length}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          {error && <div className="oh-error">{error}</div>}

          <div className="oh-table-wrapper">
            <table className="oh-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Customer Code</th>
                  <th>Employee Code</th>
                  <th>Temp Order Number</th>
                  <th>Mcollect Order Number</th>
                  <th>Part Number</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                  <th>Order Type</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={12} className="oh-empty"><div className="oh-spinner" style={{margin:'0 auto'}} /></td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={12} className="oh-empty">No hold orders found</td></tr>
                ) : paged.map((o, idx) => (
                  <tr key={o.order_no || idx}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>{o.customer_code || '-'}</td>
                    <td>{o.employee_code || '-'}</td>
                    <td>{o.order_no || '-'}</td>
                    <td>{o.mcollect_order_no || o.order_no || '-'}</td>
                    <td>{o.part_no || '-'}</td>
                    <td>{o.quantity || '-'}</td>
                    <td>{o.total_price || '-'}</td>
                    <td>
                      <span className="oh-badge oh-badge-back-order">{o.order_type || '-'}</span>
                    </td>
                    <td>
                      <span className="oh-badge oh-badge-cancelled">{o.status || '-'}</span>
                    </td>
                    <td>{formatDate(o.created_at)}</td>
                    <td>
                      <div className="oh-action-btns">
                        <button
                          className="oh-btn oh-btn-download"
                          title="Export Row"
                          onClick={() => {
                            const ws = XLSX.utils.json_to_sheet([{
                              'Customer Code': o.customer_code || '-',
                              'Employee Code': o.employee_code || '-',
                              'Temp Order Number': o.order_no || '-',
                              'Mcollect Order Number': o.mcollect_order_no || o.order_no || '-',
                              'Part Number': o.part_no || '-',
                              'Qty': o.quantity || '-',
                              'Total Price': o.total_price || '-',
                              'Order Type': o.order_type || '-',
                              'Status': o.status || '-',
                              'Created At': formatDate(o.created_at),
                            }]);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, 'Hold Order');
                            const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            saveAs(new Blob([buf], { type: 'application/octet-stream' }), `HoldOrder_${o.order_no}.xlsx`);
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length > PAGE_SIZE && (
              <div className="oh-pagination">
                <span className="oh-pag-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} of {orders.length}
                </span>
                <div className="oh-pag-btns">
                  <button className="oh-page-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={`oh-page-btn${page === i + 1 ? ' active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="oh-page-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HoldOrderHistory;
