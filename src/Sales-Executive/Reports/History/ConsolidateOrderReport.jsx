import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Spinner from '../../components/Spinner/Spinner';
import { getOrderListAPI, getOrderDetailsAPI } from '../../../services/api';
import { resolveOrderStatus, isExpired, StatusBadge, classifyOrder, SALE_STATUSES, HOLD_STATUSES } from './orderStatusUtils';
import './OrderHistory.css';

const PAGE_SIZE = 10;

const ORDER_TYPES = [
  { value: 'sales-order',      label: 'Sales Order' },
  { value: 'hold-order',       label: 'Hold Order (Back Order)' },
  { value: 'consolidate-order', label: 'Consolidate Order (All)' },
];

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
  return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
};

const ConsolidateOrderReport = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate]   = useState(defaults.from);
  const [toDate, setToDate]       = useState(defaults.to);
  const [orderType, setOrderType] = useState('sales-order');
  const [rows, setRows]           = useState([]);   // filtered by orderType
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [page, setPage]           = useState(1);

  // Modal
  const [showModal, setShowModal]       = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems]     = useState([]);

  const fetchData = useCallback(async (type = orderType) => {
    setLoading(true);
    setError('');
    setRows([]);
    try {
      const empCode = getEmployeeCode();
      const res = await getOrderListAPI({
        customer_code: null,
        employee_code: empCode,
        from_date: fromDate,
        to_date: toDate,
      });

      if (!res?.success || !res.data?.length) {
        setRows([]);
        setPage(1);
        return;
      }

      // Fetch all order details in parallel to classify each order
      const detailResults = await Promise.all(
        res.data.map(o => getOrderDetailsAPI({ order_no: o.order_no }).catch(() => null))
      );

      const enriched = res.data.map((o, i) => {
        const itemDetails = detailResults[i]?.data?.item_details || [];
        return { ...o, item_details: itemDetails };
      });

      // Filter based on selected order type
      let filtered;
      if (type === 'sales-order') {
        filtered = enriched.filter(o => classifyOrder(o).isSale);
      } else if (type === 'hold-order') {
        filtered = enriched.filter(o => classifyOrder(o).isHold);
      } else {
        // consolidate — show all
        filtered = enriched;
      }

      setRows(filtered);
      setPage(1);
    } catch {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, orderType]);

  const handleOrderTypeChange = (val) => {
    setOrderType(val);
    setRows([]);
    setPage(1);
  };

  const handleView = async (order) => {
    setShowModal(true);
    setModalLoading(true);
    setSelectedOrder(order);
    setOrderItems([]);
    try {
      // Use already-fetched item_details if available
      let items = order.item_details;
      if (!items || items.length === 0) {
        const res = await getOrderDetailsAPI({ order_no: order.order_no });
        items = res?.data?.item_details || [];
      }

      // Filter items based on current order type view
      if (orderType === 'sales-order') {
        items = items.filter(i => SALE_STATUSES.has((i.status || 'pending').toLowerCase()));
      } else if (orderType === 'hold-order') {
        items = items.filter(i => HOLD_STATUSES.has((i.status || '').toLowerCase()));
      }
      // consolidate shows all items

      setOrderItems(items);
    } catch {
      setOrderItems([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleExport = () => {
    if (!rows.length) return;

    const exportRows = [];
    rows.forEach((o, i) => {
      const items = o.item_details || [];

      // Filter items per type
      let relevantItems = items;
      if (orderType === 'sales-order') {
        relevantItems = items.filter(it => SALE_STATUSES.has((it.status || 'pending').toLowerCase()));
      } else if (orderType === 'hold-order') {
        relevantItems = items.filter(it => HOLD_STATUSES.has((it.status || '').toLowerCase()));
      }

      if (relevantItems.length === 0) {
        exportRows.push({
          'S.No': i + 1,
          'Order No': o.order_no || '-',
          'Customer Code': o.customer_code || '-',
          'Customer Name': o.customer_name || '-',
          'Employee Code': o.employee_code || '-',
          'Warehouse': o.warehouse || '-',
          'Validity Date': formatDate(o.validity_date),
          'Order Status': resolveOrderStatus(o),
          'Created At': formatDate(o.created_at),
          'Part No': '-', 'Part Name': '-', 'Qty': '-',
          'Item Price': '-', 'Tax Price': '-', 'Total Price': '-',
          'Item Status': '-', 'Invoice No': '-',
        });
      } else {
        relevantItems.forEach((it, pi) => {
          exportRows.push({
            'S.No': pi === 0 ? i + 1 : '',
            'Order No': pi === 0 ? (o.order_no || '-') : '',
            'Customer Code': pi === 0 ? (o.customer_code || '-') : '',
            'Customer Name': pi === 0 ? (o.customer_name || '-') : '',
            'Employee Code': pi === 0 ? (o.employee_code || '-') : '',
            'Warehouse': it.warehouse || o.warehouse || '-',
            'Validity Date': pi === 0 ? formatDate(o.validity_date) : '',
            'Order Status': pi === 0 ? resolveOrderStatus(o) : '',
            'Created At': pi === 0 ? formatDate(o.created_at) : '',
            'Part No': it.part_no || '-',
            'Part Name': it.part_name || '-',
            'Qty': it.quantity || '-',
            'Item Price': it.item_price || '-',
            'Tax Price': it.tax_price || '-',
            'Total Price': it.total_price || '-',
            'Item Status': it.status || '-',
            'Invoice No': it.invoice_number || '-',
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Consolidate Report');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }),
      `Consolidate_${orderType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal title based on type
  const modalTitle = orderType === 'sales-order' ? 'Sale Items'
    : orderType === 'hold-order' ? 'Back Order Items'
    : 'All Items';

  return (
    <>
      <Header />
      <div className="oh-container">
        <div className="oh-content">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Consolidate Order Report' },
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
            <div className="oh-filter-group">
              <label>Order Type</label>
              <select className="oh-input" value={orderType} onChange={e => handleOrderTypeChange(e.target.value)}>
                {ORDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="oh-filter-actions">
              <button className="oh-view-btn" onClick={() => fetchData(orderType)} disabled={loading}>
                {loading ? <><Spinner inline size="sm" /> Loading</> : 'View'}
              </button>
              <button className="oh-export-btn" onClick={handleExport} disabled={!rows.length || loading}>
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
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Employee</th>
                  <th>Order Type</th>
                  <th>Warehouse</th>
                  <th>Validity Date</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="oh-empty"><div className="oh-spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={10} className="oh-empty">No records found. Click View to load data.</td></tr>
                ) : paged.map((o, idx) => {
                  const sno = (page - 1) * PAGE_SIZE + idx + 1;
                  const expired = isExpired(o.validity_date);
                  const status = resolveOrderStatus(o);
                  return (
                    <tr key={o.order_no || idx} className={expired ? 'oh-row-expired' : ''}>
                      <td>{sno}</td>
                      <td><strong>{o.order_no || '-'}</strong></td>
                      <td>
                        <div>{o.customer_name || '-'}</div>
                        <div className="oh-sub">{o.customer_code || ''}</div>
                      </td>
                      <td>
                        <div>{o.employee_name || o.employee_code || '-'}</div>
                        <div className="oh-sub">{o.employee_name ? o.employee_code : ''}</div>
                      </td>
                      <td><span className="oh-badge oh-badge-mobile-order">{o.order_type || '-'}</span></td>
                      <td>{o.warehouse || '-'}</td>
                      <td className={expired ? 'oh-expired-date' : ''}>
                        {o.validity_date ? new Date(o.validity_date).toLocaleDateString('en-IN') : '-'}
                        {expired && <div className="oh-sub" style={{ color: '#dc2626' }}>Expired</div>}
                      </td>
                      <td><StatusBadge status={status} /></td>
                      <td>{formatDate(o.created_at)}</td>
                      <td>
                        <div className="oh-action-btns">
                          <button className="oh-btn oh-btn-view" onClick={() => handleView(o)} title="View Items">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          <button className="oh-btn oh-btn-download" onClick={async () => {
                            const items = (o.item_details || []);
                            let exportItems = items;
                            if (orderType === 'sales-order') exportItems = items.filter(it => SALE_STATUSES.has((it.status || 'pending').toLowerCase()));
                            else if (orderType === 'hold-order') exportItems = items.filter(it => HOLD_STATUSES.has((it.status || '').toLowerCase()));
                            const data = exportItems.map((it, i) => ({
                              'S.No': i + 1, 'Order No': o.order_no,
                              'Part No': it.part_no || '-', 'Part Name': it.part_name || '-',
                              'Qty': it.quantity || '-', 'Item Price': it.item_price || '-',
                              'Tax Price': it.tax_price || '-', 'Total Price': it.total_price || '-',
                              'Status': it.status || '-', 'Invoice No': it.invoice_number || '-',
                            }));
                            const ws = XLSX.utils.json_to_sheet(data);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, 'Items');
                            const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Order_${o.order_no}.xlsx`);
                          }} title="Download">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length > PAGE_SIZE && (
              <div className="oh-pagination">
                <span className="oh-pag-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
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

      {/* Items Modal */}
      {showModal && (
        <div className="oh-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="oh-modal" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>{modalTitle} — {selectedOrder?.order_no}</h3>
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
                  <div className="oh-modal-info-item"><span>Customer</span><span>{selectedOrder.customer_name || selectedOrder.customer_code || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Warehouse</span><span>{selectedOrder.warehouse || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Validity Date</span><span>{formatDate(selectedOrder.validity_date)}</span></div>
                  <div className="oh-modal-info-item"><span>Status</span><span><StatusBadge status={resolveOrderStatus(selectedOrder)} /></span></div>
                </div>
              )}
              {modalLoading ? (
                <div className="oh-modal-loading"><div className="oh-spinner" /><span>Loading items...</span></div>
              ) : (
                <>
                  <p className="oh-modal-table-title">
                    {modalTitle} <span className="oh-count-badge">{orderItems.length} items</span>
                  </p>
                  <div className="oh-table-wrapper">
                    <table className="oh-table">
                      <thead>
                        <tr>
                          <th>S.No</th><th>Part No</th><th>Part Name</th>
                          <th>Qty</th><th>Item Price</th><th>Tax Price</th><th>Total Price</th>
                          <th>Invoice No</th><th>Status</th><th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.length === 0 ? (
                          <tr><td colSpan={10} className="oh-empty">No items found</td></tr>
                        ) : orderItems.map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td><strong>{item.part_no || '-'}</strong></td>
                            <td>{item.part_name || '-'}</td>
                            <td>{item.quantity || '-'}</td>
                            <td>₹{item.item_price || '-'}</td>
                            <td>₹{item.tax_price || '-'}</td>
                            <td><strong>₹{item.total_price || '-'}</strong></td>
                            <td>{item.invoice_number || '-'}</td>
                            <td><StatusBadge status={item.status || 'pending'} /></td>
                            <td>{item.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="oh-modal-footer">
              <button className="oh-export-btn" disabled={!orderItems.length} onClick={() => {
                const data = orderItems.map((it, i) => ({
                  'S.No': i + 1, 'Part No': it.part_no || '-', 'Part Name': it.part_name || '-',
                  'Qty': it.quantity || '-', 'Item Price': it.item_price || '-',
                  'Tax Price': it.tax_price || '-', 'Total Price': it.total_price || '-',
                  'Invoice No': it.invoice_number || '-', 'Status': it.status || '-', 'Remarks': it.remarks || '-',
                }));
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Items');
                const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Order_${selectedOrder?.order_no}_Items.xlsx`);
              }}>Export Items</button>
              <button className="oh-view-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsolidateOrderReport;
