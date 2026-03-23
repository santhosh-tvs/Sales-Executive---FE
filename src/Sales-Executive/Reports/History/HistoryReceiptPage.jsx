import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Header from '../../header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import apiService from '../../../services/apiservice';
import './OrderHistory.css';

const PAGE_SIZE = 10;

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d) ? '-' : d.toLocaleDateString('en-IN');
};

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
};

const HistoryReceiptPage = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [searchTerm, setSearchTerm] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: 1, limit: 1000 };
      if (fromDate && toDate) {
        params.from_date = fromDate;
        params.to_date = toDate;
      }
      if (searchTerm) params.search = searchTerm;

      const res = await apiService.get('/receipt/receipt-list', params);
      if (res && res.success && res.data) {
        const flat = [];
        res.data.forEach(group => {
          if (group.list) group.list.forEach(r => flat.push(r));
        });
        setReceipts(flat);
      } else {
        setReceipts([]);
      }
      setPage(1);
    } catch {
      setError('Failed to fetch receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, []); // eslint-disable-line

  const handleView = async (receipt) => {
    setShowModal(true);
    setModalLoading(true);
    setSelectedReceipt(null);
    try {
      const res = await apiService.get(`/receipt/view-receipt/${receipt.customer_receipt_id}`);
      if (res && res.success && res.data) {
        setSelectedReceipt(res.data);
      }
    } catch {
      setSelectedReceipt(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleExportAll = () => {
    if (!receipts.length) return;
    const exportData = receipts.map((r, i) => ({
      'S.No': i + 1,
      'Transaction ID / Receipt No': r.receipt_ref_number || '-',
      'Date': formatDate(r.created_at),
      'Customer Code / Name': `${r.customer_number || '-'} / ${r.customer_name || '-'}`,
      'Amount (₹)': r.receipt_amount || '-',
      'Payment Mode': r.receipt_mode || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receipt History');
    const colWidths = Object.keys(exportData[0] || {}).map(k => ({
      wch: Math.max(k.length, ...exportData.map(row => String(row[k] || '').length)) + 2,
    }));
    ws['!cols'] = colWidths;
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }),
      `Receipt_History_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.ceil(receipts.length / PAGE_SIZE);
  const paged = receipts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="oh-container">
        <div className="oh-content">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'History', path: '/history/receipt' },
            { label: 'Receipt' },
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
              <label>Search</label>
              <input
                type="text"
                className="oh-input"
                placeholder="Receipt No / Customer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchReceipts()}
              />
            </div>
            <div className="oh-filter-actions">
              <button className="oh-view-btn" onClick={fetchReceipts} disabled={loading}>
                {loading
                  ? <><span className="oh-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Loading...</>
                  : 'View'}
              </button>
              <button className="oh-export-btn" onClick={handleExportAll} disabled={!receipts.length}>
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
                  <th>Transaction ID / Receipt No</th>
                  <th>Date</th>
                  <th>Employee Code / Name</th>
                  <th>Customer Code / Name</th>
                  <th>Payment For</th>
                  <th>Payment Mode</th>
                  <th>Amount (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="oh-empty"><div className="oh-spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={9} className="oh-empty">No receipts found</td></tr>
                ) : paged.map((r, idx) => (
                  <tr key={r.customer_receipt_id || idx}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td style={{ color: '#2563eb', fontWeight: 500 }}>{r.receipt_ref_number || '-'}</td>
                    <td>{formatDate(r.created_at)}</td>
                    <td>{r.created_by || '-'}</td>
                    <td>{r.customer_number || '-'} / {r.customer_name || '-'}</td>
                    <td>FIFO</td>
                    <td>
                      <span className={`oh-badge ${r.receipt_mode === 'Challan' ? 'oh-badge-back-order' : 'oh-badge-mobile-order'}`}>
                        {r.receipt_mode || '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.receipt_amount || '-'}</td>
                    <td>
                      <div className="oh-action-btns">
                        <button className="oh-btn oh-btn-view" onClick={() => handleView(r)} title="View">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className="oh-btn oh-btn-download"
                          title="Download"
                          onClick={() => {
                            const exportData = [{
                              'Receipt No': r.receipt_ref_number || '-',
                              'Date': formatDate(r.created_at),
                              'Customer Code': r.customer_number || '-',
                              'Customer Name': r.customer_name || '-',
                              'Amount': r.receipt_amount || '-',
                              'Payment Mode': r.receipt_mode || '-',
                            }];
                            const ws = XLSX.utils.json_to_sheet(exportData);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, 'Receipt');
                            const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Receipt_${r.receipt_ref_number || r.customer_receipt_id}.xlsx`);
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

            {receipts.length > PAGE_SIZE && (
              <div className="oh-pagination">
                <span className="oh-pag-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, receipts.length)} of {receipts.length}
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

      {/* Receipt Detail Modal */}
      {showModal && (
        <div className="oh-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="oh-modal" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Receipt Details — {selectedReceipt?.receipt_ref_number || '...'}</h3>
              <button className="oh-modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="oh-modal-body">
              {modalLoading ? (
                <div className="oh-modal-loading"><div className="oh-spinner" /><span>Loading...</span></div>
              ) : selectedReceipt ? (
                <div className="oh-modal-info" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="oh-modal-info-item"><span>Receipt No</span><span>{selectedReceipt.receipt_ref_number || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Customer</span><span>{selectedReceipt.customer_name || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Customer Code</span><span>{selectedReceipt.customer_number || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Amount</span><span style={{ fontWeight: 700, color: '#16a34a' }}>₹{selectedReceipt.receipt_amount || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Payment Mode</span><span>{selectedReceipt.receipt_mode || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Receipt Date</span><span>{formatDate(selectedReceipt.receipt_date)}</span></div>
                  <div className="oh-modal-info-item"><span>Business Unit</span><span>{selectedReceipt.business_unit || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Source</span><span>{selectedReceipt.source || '-'}</span></div>
                  <div className="oh-modal-info-item"><span>Status</span>
                    <span className={`oh-badge ${selectedReceipt.process_flag === 'completed' ? 'oh-badge-completed' : 'oh-badge-pending'}`}>
                      {selectedReceipt.process_flag || 'pending'}
                    </span>
                  </div>
                  {selectedReceipt.cheque_no && <div className="oh-modal-info-item"><span>Cheque No</span><span>{selectedReceipt.cheque_no}</span></div>}
                  {selectedReceipt.drawee_bank && <div className="oh-modal-info-item"><span>Bank</span><span>{selectedReceipt.drawee_bank}</span></div>}
                  {selectedReceipt.place && <div className="oh-modal-info-item"><span>Place</span><span>{selectedReceipt.place}</span></div>}
                  {selectedReceipt.receipt_remarks && <div className="oh-modal-info-item" style={{ gridColumn: '1/-1' }}><span>Remarks</span><span>{selectedReceipt.receipt_remarks}</span></div>}
                </div>
              ) : (
                <div className="oh-empty">Failed to load receipt details</div>
              )}
            </div>
            <div className="oh-modal-footer">
              <button className="oh-view-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryReceiptPage;
