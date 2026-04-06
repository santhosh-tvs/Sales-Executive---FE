import React, { useState, useEffect } from "react";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { apiService } from "../../services/apiservice";
import { outstandingInvoiceAPI } from "../../services/api";
import "./Mycollection.css";

const MyCollection = () => {
  const [activeTab, setActiveTab] = useState('due');
  const [totalCount, setTotalCount] = useState(null);
  const [totalValue, setTotalValue] = useState(null);
  const [dueToday, setDueToday] = useState([]);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.get('/receipt/receipt-list', { limit: 1000 });
        if (res?.success && res.data) {
          setTotalCount(res.count ?? res.data.reduce((acc, g) => acc + (g.list?.length || 0), 0));
          const sum = res.data.reduce((acc, g) => {
            return acc + (g.list || []).reduce((s, r) => s + Number(r.receipt_amount || 0), 0);
          }, 0);
          setTotalValue(sum);
        }
      } catch (e) {
        console.error('MyCollection stats fetch error:', e);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get customer account_number from localStorage
        const stored = localStorage.getItem('selected_customer');
        const customer = stored ? JSON.parse(stored) : null;
        const accountNumber = customer?.account_number || '';

        const res = await outstandingInvoiceAPI({
          Customer_Acct_Num: accountNumber,
        });

        const invoices = res?.data || [];

        // Today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayList = [];
        const upcomingList = [];

        invoices.forEach((inv) => {
          const dueDate = new Date(inv.invoiceDueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate.getTime() === today.getTime()) {
            todayList.push(inv);
          } else if (dueDate > today) {
            upcomingList.push(inv);
          }
        });

        setDueToday(todayList);
        setUpcomingDues(upcomingList);
      } catch (e) {
        console.error('Outstanding invoices fetch error:', e);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentList = activeTab === 'due' ? dueToday : upcomingDues;

  return (
    <div className="collections-container">
      <Header />
      <Breadcrumb crumbs={[
        { label: 'Home', path: '/sales-home' },
        { label: 'My Collections' },
      ]} />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#f1f5f9' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/1052/1052856.png" alt="count" width="30" />
          </div>
          <div className="stat-info">
            <h2 className="stat-value">{totalCount === null ? '—' : totalCount}</h2>
            <p className="stat-label">Total Collections Count</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#fff7ed' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png" alt="value" width="30" />
          </div>
          <div className="stat-info">
            <h2 className="stat-value">
              {totalValue === null ? '—' : formatAmount(totalValue)}
            </h2>
            <p className="stat-label">Total Collections Values</p>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'due' ? 'active' : ''}`}
          onClick={() => setActiveTab('due')}
        >
          Due Today {dueToday.length > 0 && <span className="tab-badge">{dueToday.length}</span>}
        </button>
        <button
          className={`tab-item ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Dues {upcomingDues.length > 0 && <span className="tab-badge">{upcomingDues.length}</span>}
        </button>
      </div>

      <div className="list-container" style={{ minHeight: '120px' }}>
        {loading && (
          <div className="empty-state">Loading invoices...</div>
        )}
        {!loading && error && (
          <div className="empty-state" style={{ color: '#e53e3e' }}>{error}</div>
        )}
        {!loading && !error && currentList.length === 0 && (
          <div className="empty-state-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            <p className="empty-state-title">
              {activeTab === 'due' ? 'No dues for today' : 'No upcoming dues'}
            </p>
            <p className="empty-state-sub">
              {activeTab === 'due'
                ? 'You have no payments due today. Check upcoming dues.'
                : 'No upcoming invoices found at this time.'}
            </p>
          </div>
        )}
        {!loading && !error && currentList.map((item, index) => (
          <div key={item.invoiceId || index} className="payment-item">
            <div className="payment-details">
              <h4>{item.customerName}</h4>
              <p className="item-id">{item.invoiceNumber}</p>
              <p className="meta-text">Invoice Type : {item.invoiceType}</p>
              <p className="meta-text">GL Date : {formatDate(item.glDate)}</p>
              <p className="meta-text">Due Date : {formatDate(item.invoiceDueDate)}</p>
              <p className="meta-text">Business Unit : {item.businessUnitName}</p>
            </div>
            <div className="payment-actions">
              <div className="price-info">
                <span className="price-label">Balance Amount</span>
                <h3 className="price-amount">{formatAmount(item.balanceAmount)}</h3>
              </div>
              <button className="make-payment-btn">
                Make Payment
                <span className="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7"></path>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCollection;
