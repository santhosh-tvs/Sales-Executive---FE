import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./BeatPlanReport.css";
import "./ConsolidateReport.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const PAGE_SIZE = 10;

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
};

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDateTime = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const ConsolidateReport = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [visitedPlans, setVisitedPlans] = useState([]);
  const [newPlans, setNewPlans] = useState([]);
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetch(`${API_BASE}/profile/sales-executive-customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (j.success) setCustomers(j.data || []); })
      .catch(() => {});
  }, [token]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [vRes, nRes] = await Promise.all([
        fetch(`${API_BASE}/beat-plan/visited-beat-plan-list`, { headers }),
        fetch(`${API_BASE}/beat-plan/new-beat-plan-list`, { headers }),
      ]);
      const [vJson, nJson] = await Promise.all([vRes.json(), nRes.json()]);
      setVisitedPlans(vJson.success ? vJson.data || [] : []);
      setNewPlans(nJson.success ? nJson.data || [] : []);
      setPage(1);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  // Build a date → count map across ALL rows (before customer filter) for Day Plan
  const allRows = [...visitedPlans, ...newPlans];
  const datePlanCount = {};
  allRows.forEach(r => {
    const d = (r.plan_date || "").slice(0, 10);
    if (d) datePlanCount[d] = (datePlanCount[d] || 0) + 1;
  });

  const filtered = allRows.filter(r => {
    const d = (r.plan_date || "").slice(0, 10);
    if (d < fromDate || d > toDate) return false;
    if (customerFilter !== "all" &&
        String(r.customer_id) !== customerFilter &&
        String(r.garage_code) !== customerFilter &&
        String(r.customer_code) !== customerFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const handleExport = () => {
    const exportData = filtered.map((r, i) => ({
      "S.No": i + 1,
      "Employee Name": r.employee_name || "-",
      "Employee Code": r.employee_code || "-",
      "Plan Date": formatDate(r.plan_date),
      "Day Plan": `Beat-${datePlanCount[(r.plan_date || "").slice(0, 10)] || 1}`,
      "Customer Name": r.garage_name || "-",
      "Customer Code": r.garage_code || "-",
      "Location": r.garage_location || "-",
      "Status": r.visited_status || "-",
      "Check In": formatDateTime(r.check_in),
      "Check In Location": r.checkin_lat_long || "-",
      "Check Out": formatDateTime(r.check_out),
      "Remarks": r.plan_remarks || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consolidate Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }),
      `Consolidate_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <>
      <Header />
      <div className="cr-container">
        <div className="cr-content">
          <Breadcrumb crumbs={[
            { label: "Home", path: "/sales-home" },
            { label: "Consolidate Report" },
          ]} />

          {/* Filters */}
          <div className="cr-filters">
            <div className="cr-filter-group">
              <label>From Date</label>
              <input type="date" className="cr-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="cr-filter-group">
              <label>To Date</label>
              <input type="date" className="cr-input" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="cr-filter-group">
              <label>Customer</label>
              <select className="cr-input" value={customerFilter}
                onChange={e => { setCustomerFilter(e.target.value); setPage(1); }}>
                <option value="all">All Customers</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={String(c.customer_id)}>
                    {c.customer_name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="cr-filter-actions">
              <button className="cr-view-btn" onClick={loadData} disabled={loading}>
                {loading ? "Loading..." : "View"}
              </button>
              <button className="cr-export-btn" onClick={handleExport} disabled={filtered.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          {error && <div className="cr-error">{error}</div>}

          {/* Single consolidated table */}
          <div className="cr-section">
            <div className="cr-section-header">
              <span className="cr-section-title">Consolidate Report</span>
              <span className="cr-section-count">{filtered.length} records</span>
            </div>
            <div className="cr-table-wrapper">
              <table className="cr-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Employee Name</th>
                    <th>Employee Code</th>
                    <th>Plan Date</th>
                    <th>Beat Plan</th>
                    <th>Customer Name</th>
                    <th>Customer Code</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check In Location</th>
                    <th>Check Out</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} className="cr-empty">Loading...</td></tr>
                  ) : paged.length === 0 ? (
                    <tr><td colSpan={13} className="cr-empty">No records found</td></tr>
                  ) : paged.map((r, idx) => (
                    <tr key={r.beat_plan_id || idx}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{r.employee_name || "-"}</td>
                      <td>{r.employee_code || "-"}</td>
                      <td>{formatDate(r.plan_date)}</td>
                      <td>
                        <span className="cr-badge cr-badge-visited">
                          Beat-{datePlanCount[(r.plan_date || "").slice(0, 10)] || 1}
                        </span>
                      </td>
                      <td>{r.garage_name || "-"}</td>
                      <td>{r.garage_code || "-"}</td>
                      <td>{r.garage_location || "-"}</td>
                      <td>
                        <span className={`cr-badge cr-badge-${r.visited_status === "visited" ? "visited" : "pending"}`}>
                          {r.visited_status || "-"}
                        </span>
                      </td>
                      <td>{formatDateTime(r.check_in)}</td>
                      <td>{r.checkin_lat_long || "-"}</td>
                      <td>{formatDateTime(r.check_out)}</td>
                      <td>{r.plan_remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="cr-pagination">
                <span className="cr-pag-info">
                  Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="cr-pag-btns">
                  <button className="cr-page-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={`cr-page-btn${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="cr-page-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ConsolidateReport;
