import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { getOrderListAPI, getOrderDetailsAPI } from '../../../services/api';
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

const SalesOrderHistory = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const fetchOrders = useCallback(async (isSync = false) => {
    if (isSync) setSyncing(true);
    else setLoading(true);
    setError('');
    try {
      const empCode = getEmployeeCode();
      const payload = {
        customer_code: empCode,   // external API uses employee code as customer_code
        employee_code: empCode,
        from_date: fromDate,
        to_date: toDate,
      };
      const res = await getOrderListAPI(payload);
      if (res && res.success && res.data) {
        // Filter only sales orders (not back-order / hold)
        const salesOrders = res.data.filter(
          o => o.order_type !== 'back-order'
        );
        setOrders(salesOrders);
      } else {
        setOrders([]);
      }
      setPage(1);
    } catch {
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const handleView = async (order) => {
    setShowModal(true);
    setModalLoading(true);
    setSelectedOrder(order);
    setOrderItems([]);
    try {
      const res = await getOrderDetailsAPI({ order_no: order.order_no });
      if (res && res.success && res.data?.item_details) {
        setOrderItems(res.data.item_details);
      }
    } catch {
      setOrderItems([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownload = async (order) => {
    try {
      const res = await getOrderDetailsAPI({ order_no: order.order_no });
      const items = res?.data?.item_details || [];
      const exportData = items.map((item, i) => ({
        'S.No': i + 1,
        'Part Number': item.part_no || '-',
        'Part Name': item.part_name || '-',
        'Quantity': item.quantity || '-',
        'MRP': item.mrp || '-',
        'Item Price': item.item_price || '-',
        'Tax Price': item.tax_price || '-',
        'Total Price': item.total_price || '-',
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Order Items');
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Order_${order.order_no}.xlsx`);
    } catch {
      alert('Failed to download order details.');
    }
  };

  const handleExportAll = () => {
    if (!orders.length) return;
    const exportData = orders.map((o, i) => ({
      'S.No': i + 1,
      'Customer Code': o.customer_code || '-',
      'Employee Code': o.employee_code || '-',
      'Order Number': o.order_no || '-',
      'Permanent Order No': o.primary_erp_order_no || '-',
      'GPO Order No': o.secondary_erp_order_no || '-',
      'Warehouse': o.warehouse || '-',
      'Created At': formatDate(o.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Orders');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Sales_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            { label: 'History', path: '/history/sales-order' },
            { label: 'Sales Order' },
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
                  <th>Order Number</th>
                  <th>Permanent Order No</th>
                  <th>GPO Order No</th>
                  <th>Warehouse</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="oh-empty"><div className="oh-spinner" style={{margin:'0 auto'}} /></td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={9} className="oh-empty">No sales orders found</td></tr>
                ) : paged.map((o, idx) => (
                  <tr key={o.order_no || idx}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>{o.customer_code || '-'}</td>
                    <td>{o.employee_code || '-'}</td>
                    <td>{o.order_no || '-'}</td>
                    <td>{o.primary_erp_order_no || '-'}</td>
                    <td>{o.secondary_erp_order_no || '-'}</td>
                    <td>{o.warehouse || '-'}</td>
                    <td>{formatDate(o.created_at)}</td>
                    <td>
                      <div className="oh-action-btns">
                        <button className="oh-btn oh-btn-view" onClick={() => handleView(o)} title="View Items">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button className="oh-btn oh-btn-download" onClick={() => handleDownload(o)} title="Download">
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

      {/* Order Items Modal */}
      {showModal && (
        <div className="oh-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="oh-modal" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Order Items — {selectedOrder?.order_no}</h3>
              <button className="oh-modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="oh-modal-body">
              {selectedOrder && (
                <div className="oh-modal-info">
                  <div className="oh-modal-info-item"><span>Customer Code</span><span>{selectedOrder.customer_code || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Warehouse</span><span>{selectedOrder.warehouse || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Permanent Order No</span><span>{selectedOrder.primary_erp_order_no || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>GPO Order No</span><span>{selectedOrder.secondary_erp_order_no || '-'}</span></div>
                </div>
              )}
              {modalLoading ? (
                <div className="oh-modal-loading"><div className="oh-spinner" /><span>Loading items...</span></div>
              ) : (
                <>
                  <p className="oh-modal-table-title">
                    Product List <span className="oh-count-badge">{orderItems.length} items</span>
                  </p>
                  <div className="oh-table-wrapper">
                    <table className="oh-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Part Number</th>
                          <th>Part Name</th>
                          <th>Quantity</th>
                          <th>MRP</th>
                          <th>Item Price</th>
                          <th>Tax Price</th>
                          <th>Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.length === 0 ? (
                          <tr><td colSpan={8} className="oh-empty">No items found</td></tr>
                        ) : orderItems.map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.part_no || '-'}</td>
                            <td>{item.part_name || '-'}</td>
                            <td>{item.quantity || '-'}</td>
                            <td>{item.mrp || '-'}</td>
                            <td>{item.item_price || '-'}</td>
                            <td>{item.tax_price || '-'}</td>
                            <td>{item.total_price || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="oh-modal-footer">
              <button className="oh-export-btn" onClick={() => {
                const exportData = orderItems.map((item, i) => ({
                  'S.No': i + 1,
                  'Part Number': item.part_no || '-',
                  'Part Name': item.part_name || '-',
                  'Quantity': item.quantity || '-',
                  'MRP': item.mrp || '-',
                  'Item Price': item.item_price || '-',
                  'Tax Price': item.tax_price || '-',
                  'Total Price': item.total_price || '-',
                }));
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Items');
                const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Order_${selectedOrder?.order_no}_Items.xlsx`);
              }} disabled={!orderItems.length}>
                Export Items
              </button>
              <button className="oh-view-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesOrderHistory;
