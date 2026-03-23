import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./VisitReport.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const PAGE_SIZE = 10;

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
};

const formatDateTime = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

const CheckInOutReport = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetch(`${API_BASE}/profile/sales-executive-customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (j.success) setCustomers(j.data || []); })
      .catch(() => {});
  }, [token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/beat-plan/visited-beat-plan-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) { setData(json.data || []); setCurrentPage(1); }
      else setError(json.message || "Failed to fetch data");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const filtered = data.filter(row => {
    const d = (row.plan_date || "").slice(0, 10);
    if (d < fromDate || d > toDate) return false;
    if (customerFilter !== "all" &&
        String(row.customer_id) !== customerFilter &&
        String(row.garage_code) !== customerFilter &&
        String(row.customer_code) !== customerFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const handleExport = () => {
    const exportData = filtered.map((row, idx) => ({
      "S.No": idx + 1,
      "Employee Name": row.employee_name || "-",
      "Employee Code": row.employee_code || "-",
      "Customer Name": row.garage_name || "-",
      "Customer Code": row.garage_code || "-",
      "Customer Location": row.garage_location || "-",
      "Geo Address": row.garage_location || "-",
      "Check In Date & Time": formatDateTime(row.check_in),
      "Check In Location": row.checkin_lat_long || "-",
      "Deviation (km)": row.deviation_in_km ?? "-",
      "Check Out Date & Time": formatDateTime(row.check_out),
      "Total Duration": row.total_duration || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CheckIn-Out Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }),
      `CheckInOut_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <>
      <Header />
      <div className="vr-container">
        <div className="vr-content">
          <Breadcrumb crumbs={[
            { label: "Home", path: "/sales-home" },
            { label: "Reports", path: "/consolidate-report" },
            { label: "Check In & Out Report" },
          ]} />

          {/* Filters */}
          <div className="vr-filters">
            <div className="vr-filter-group">
              <label>From Date</label>
              <input type="date" className="vr-filter-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="vr-filter-group">
              <label>To Date</label>
              <input type="date" className="vr-filter-input" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="vr-filter-group">
              <label>Customer</label>
              <select className="vr-filter-input" value={customerFilter}
                onChange={e => { setCustomerFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Customers</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={String(c.customer_id)}>
                    {c.customer_name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="vr-filter-actions">
              <button className="vr-search-btn" onClick={fetchData} disabled={loading}>
                {loading ? "Loading..." : "View"}
              </button>
              <button className="vr-export-btn" onClick={handleExport} disabled={filtered.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          {error && <div className="vr-error">{error}</div>}

          <div className="vr-table-wrapper">
            <table className="vr-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee Name</th>
                  <th>Employee Code</th>
                  <th>Customer Name</th>
                  <th>Customer Code</th>
                  <th>Customer Location</th>
                  <th>Geo Address</th>
                  <th>Check In Date &amp; Time</th>
                  <th>Check In Location</th>
                  <th>Deviation (km)</th>
                  <th>Check Out Date &amp; Time</th>
                  <th>Total Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={12} className="vr-empty">Loading...</td></tr>
                ) : currentData.length === 0 ? (
                  <tr><td colSpan={12} className="vr-empty">No records found</td></tr>
                ) : currentData.map((row, idx) => (
                  <tr key={row.beat_plan_id || idx}>
                    <td>{startIndex + idx + 1}</td>
                    <td>{row.employee_name || "-"}</td>
                    <td>{row.employee_code || "-"}</td>
                    <td>{row.garage_name || "-"}</td>
                    <td>{row.garage_code || "-"}</td>
                    <td>{row.garage_location || "-"}</td>
                    <td>{row.garage_location || "-"}</td>
                    <td>{formatDateTime(row.check_in)}</td>
                    <td>{row.checkin_lat_long || "-"}</td>
                    <td>{row.deviation_in_km ?? "-"}</td>
                    <td>{formatDateTime(row.check_out)}</td>
                    <td>{row.total_duration || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="vr-pagination">
              <div className="vr-pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </div>
              <div className="vr-pagination-controls">
                <button className="vr-page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} className={`vr-page-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="vr-page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckInOutReport;
