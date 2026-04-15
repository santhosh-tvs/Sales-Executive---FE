import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Spinner from "../components/Spinner/Spinner";
import { importOrderStatusAPI } from "../../services/api";
import "../../styles/S-orders/importStatus.css";

const today = () => new Date().toISOString().split("T")[0];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const STATUS_COLORS = {
  Pending:     { bg: "#fef9c3", color: "#ca8a04" },
  Processing:  { bg: "#eff6ff", color: "#3b82f6" },
  Completed:   { bg: "#dcfce7", color: "#16a34a" },
  Failed:      { bg: "#fef2f2", color: "#dc2626" },
};

const StatusBadge = ({ name }) => {
  const style = STATUS_COLORS[name] || { bg: "#f1f5f9", color: "#6b7280" };
  return (
    <span className="is-badge" style={{ background: style.bg, color: style.color }}>
      {name || "—"}
    </span>
  );
};

const LIMIT = 10;

const ImportStatus = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(daysAgo(7));
  const [toDate, setToDate]     = useState(today());
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [offset, setOffset]     = useState(0);
  const [hasMore, setHasMore]   = useState(true);

  const fetchStatus = useCallback(async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await importOrderStatusAPI({
        from_date: fromDate,
        to_date: toDate,
        limit: LIMIT,
        offset: newOffset,
      });
      if (res?.success) {
        const rows = res.data || [];
        setData(newOffset === 0 ? rows : (prev) => [...prev, ...rows]);
        setHasMore(rows.length === LIMIT);
        setOffset(newOffset);
      } else {
        setError(res?.message || "Failed to fetch import status.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchStatus(0); }, []);

  const handleSearch = () => fetchStatus(0);
  const handleLoadMore = () => fetchStatus(offset + LIMIT);

  const fmt = (val) => val ? new Date(val).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="is-page">
      <Header />
      <Breadcrumb crumbs={[
        { label: "Home", path: "/sales-home" },
        { label: "Orders", path: "/s-bulk" },
        { label: "Import Orders", path: "/s-import" },
        { label: "Import Status" },
      ]} />

      <div className="is-content">
        {/* Top bar */}
        <div className="is-topbar">
          <div>
            <h1 className="is-title">Import Status</h1>
            <p className="is-subtitle">Track the status of your bulk import jobs</p>
          </div>
          <button className="is-btn is-btn--ghost" onClick={() => navigate("/s-import")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Import
          </button>
        </div>

        {/* Filters */}
        <div className="is-filter-card">
          <div className="is-filter-row">
            <div className="is-field">
              <label className="is-label">From Date</label>
              <input type="date" className="is-input" value={fromDate} max={toDate}
                onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="is-field">
              <label className="is-label">To Date</label>
              <input type="date" className="is-input" value={toDate} min={fromDate} max={today()}
                onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button className="is-btn is-btn--primary" onClick={handleSearch} disabled={loading}>
              {loading && offset === 0 ? <Spinner inline size="sm" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                </svg>
              )}
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="is-table-card">
          {error && <div className="is-error">{error}</div>}
          <div className="is-table-wrap">
            <table className="is-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Total</th>
                  <th>Processed</th>
                  <th>New</th>
                  <th>Updated</th>
                  <th>Errors</th>
                  <th>Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="10" className="is-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="36" height="36">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M4 6h16M4 18h16"/>
                      </svg>
                      <p>No import jobs found for the selected date range</p>
                    </td>
                  </tr>
                ) : data.map((row) => (
                  <tr key={row.id}>
                    <td><span className="is-id">#{row.id}</span></td>
                    <td>{row.total_record_count ?? "—"}</td>
                    <td>{row.processed_count ?? "—"}</td>
                    <td>{row.new_count ?? "—"}</td>
                    <td>{row.updated_count ?? "—"}</td>
                    <td>
                      {row.error_count > 0
                        ? <span className="is-error-count">{row.error_count}</span>
                        : row.error_count ?? "—"}
                    </td>
                    <td><StatusBadge name={row.config?.name} /></td>
                    <td>{fmt(row.start_time)}</td>
                    <td>{fmt(row.end_time)}</td>
                    <td>{fmt(row.created_at)}</td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan="10" className="is-loading-row">
                      <Spinner inline size="sm" /> Loading…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasMore && !loading && data.length > 0 && (
            <div className="is-load-more">
              <button className="is-btn is-btn--outline" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportStatus;
