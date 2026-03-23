import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./BeatPlanReport.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const PAGE_SIZE = 10;

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
};

const BeatPlanReport = () => {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);

  const [allPlans, setAllPlans] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("authToken");

  // Fetch SE-based customers for the dropdown (loaded once on mount)
  const fetchCustomers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/profile/sales-executive-customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return json.success ? json.data || [] : [];
  }, [token]);

  // Fetch all plans: merge visited + not_visited (both have employee join)
  const fetchAllPlans = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [visitedRes, newRes] = await Promise.all([
      fetch(`${API_BASE}/beat-plan/visited-beat-plan-list`, { headers }),
      fetch(`${API_BASE}/beat-plan/new-beat-plan-list`, { headers }),
    ]);
    const [visitedJson, newJson] = await Promise.all([visitedRes.json(), newRes.json()]);
    const visited = visitedJson.success ? visitedJson.data || [] : [];
    const notVisited = newJson.success ? newJson.data || [] : [];
    return [...visited, ...notVisited];
  }, [token]);

  // Fetch receipts for date range — flatten grouped response
  const fetchReceipts = useCallback(async (from, to) => {
    const params = new URLSearchParams({ from_date: from, to_date: to, limit: 9999 });
    const res = await fetch(`${API_BASE}/receipt/receipt-list?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success) return [];
    const flat = [];
    (json.data || []).forEach((group) => group.list.forEach((r) => flat.push(r)));
    return flat;
  }, [token]);

  // Load customers once on mount
  useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers(data);
    });
  }, [fetchCustomers]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plans, recs] = await Promise.all([
        fetchAllPlans(),
        fetchReceipts(fromDate, toDate),
      ]);
      setAllPlans(plans);
      setReceipts(recs);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchAllPlans, fetchReceipts, fromDate, toDate]);

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  // ── Filter plans by date range + customer ─────────────────────────────────
  const filteredPlans = allPlans.filter((p) => {
    const d = p.plan_date ? p.plan_date.slice(0, 10) : "";
    if (d < fromDate || d > toDate) return false;
    if (customerFilter !== "all" && String(p.customer_id) !== customerFilter) return false;
    return true;
  });

  // ── Group by plan_date ────────────────────────────────────────────────────
  const groupedByDate = {};
  filteredPlans.forEach((p) => {
    const d = p.plan_date ? p.plan_date.slice(0, 10) : "unknown";
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(p);
  });

  // ── Receipt count lookup by customer_name ─────────────────────────────────
  const receiptCountByCustomer = {};
  receipts.forEach((r) => {
    const name = (r.customer_name || "").trim();
    receiptCountByCustomer[name] = (receiptCountByCustomer[name] || 0) + 1;
  });

  // ── Build report rows (one row per date) ──────────────────────────────────
  const reportRows = Object.keys(groupedByDate)
    .sort()
    .map((date) => {
      const plans = groupedByDate[date];
      const first = plans[0];

      // Planned Customers = number of customers planned for this date
      const plannedCount = plans.length;
      const visitedPlans = plans.filter((p) => p.visited_status === "visited");
      const visitedCount = visitedPlans.length;

      // Day Plan: Beat-<plannedCount>
      // Each date group represents one beat. The number reflects how many
      // customers are in that beat (single = Beat-1, import with 3 = Beat-3)
      const dayPlanLabel = `Beat-${plannedCount}`;

      // Target with Unit: target is set at check-in (updateVisit).
      // visitedBeatPlanList returns `target` field (target_type not in response).
      // Collect unique target values from all plans in this day.
      const targetEntries = plans
        .filter((p) => p.target != null && p.target !== "")
        .map((p) => String(p.target))
        .filter((v, i, arr) => arr.indexOf(v) === i);
      const targetWithUnit = targetEntries.length > 0 ? targetEntries.join(", ") : "-";

      // Total Receipts: count receipts for customers in this date group
      const customerNames = [...new Set(plans.map((p) => (p.garage_name || "").trim()))];
      const totalReceipts = customerNames.reduce(
        (sum, name) => sum + (receiptCountByCustomer[name] || 0),
        0
      );

      // Total Visit Notes: count of VISITED plans that have plan_remarks
      // (plan_remarks is only meaningful after a visit — from visitedBeatPlanList)
      const totalVisitNotes = visitedPlans.filter(
        (p) => p.plan_remarks && p.plan_remarks.trim()
      ).length;

      // Elapsed Times: sum all visited plans' (check_out - check_in) for the day,
      // show as a single total HH:MM:SS
      const totalElapsedMs = visitedPlans.reduce((sum, p) => {
        if (!p.check_in || !p.check_out) return sum;
        const diff = new Date(p.check_out) - new Date(p.check_in);
        return sum + (diff > 0 ? diff : 0);
      }, 0);
      let elapsedTimes = "-";
      if (totalElapsedMs > 0) {
        const totalSecs = Math.floor(totalElapsedMs / 1000);
        const hh = Math.floor(totalSecs / 3600);
        const mm = Math.floor((totalSecs % 3600) / 60);
        const ss = totalSecs % 60;
        elapsedTimes = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
      }

      // KM Travelled: sum deviation_in_km across visited plans
      const kmTravelled = visitedPlans.reduce((sum, p) => {
        const km = parseFloat(p.deviation_in_km);
        return sum + (isNaN(km) ? 0 : km);
      }, 0);

      return {
        date,
        employeeName: first.employee_name || "-",
        employeeCode: first.employee_code || "-",
        dayPlanLabel,
        plannedCount,
        targetWithUnit,
        visitedCount,
        totalReceipts,
        totalVisitNotes,
        elapsedTimes,
        kmTravelled: kmTravelled > 0 ? kmTravelled.toFixed(2) : "NA",
      };
    });

  const totalPages = Math.ceil(reportRows.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentData = reportRows.slice(startIndex, startIndex + PAGE_SIZE);

  const handleExport = () => {
    const exportData = reportRows.map((row, idx) => ({
      "S.No": idx + 1,
      "Employee Name": row.employeeName,
      "Employee Code": row.employeeCode,
      Date: formatDate(row.date),
      "Day Plan": row.dayPlanLabel,
      "Planned Customers": row.plannedCount,
      "Target with Unit": row.targetWithUnit,
      "Visited Customers": row.visitedCount,
      "Total Receipts": row.totalReceipts,
      "Total Visit Notes": row.totalVisitNotes,
      "Elapsed Times": row.elapsedTimes,
      "KM Travelled": row.kmTravelled,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beat Plan Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `BeatPlan_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <>
      <Header />
      <div className="bpr-container">
        <div className="bpr-content">
          <Breadcrumb
            crumbs={[
              { label: "Home", path: "/sales-home" },
              { label: "Reports", path: "/consolidate-report" },
              { label: "Beat Plan Report" },
            ]}
          />

          {/* Filters */}
          <div className="bpr-filters">
            <div className="bpr-filter-group">
              <label>From Date</label>
              <input
                type="date"
                className="bpr-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="bpr-filter-group">
              <label>To Date</label>
              <input
                type="date"
                className="bpr-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="bpr-filter-group">
              <label>Customer</label>
              <select
                className="bpr-input"
                value={customerFilter}
                onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Customers</option>
                {customers.map((c) => (
                  <option key={c.customer_id} value={String(c.customer_id)}>
                    {c.customer_name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="bpr-filter-actions">
              <button className="bpr-view-btn" onClick={loadData} disabled={loading}>
                {loading ? "Loading..." : "View"}
              </button>
              <button className="bpr-export-btn" onClick={handleExport} disabled={reportRows.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          {error && <div className="bpr-error">{error}</div>}

          {/* Table */}
          <div className="bpr-table-wrapper">
            <table className="bpr-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee Name</th>
                  <th>Employee Code</th>
                  <th>Date</th>
                  <th>Day Plan</th>
                  <th>Planned Customers</th>
                  <th>Target with Unit</th>
                  <th>Visited Customers</th>
                  <th>Total Receipts</th>
                  <th>Total Visit Notes</th>
                  <th>Elapsed Times</th>
                  <th>KM Travelled</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={12} className="bpr-empty">Loading...</td></tr>
                ) : currentData.length === 0 ? (
                  <tr><td colSpan={12} className="bpr-empty">No records found</td></tr>
                ) : (
                  currentData.map((row, idx) => (
                    <tr key={row.date}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{row.employeeName}</td>
                      <td>{row.employeeCode}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>
                        <span className="bpr-badge">{row.dayPlanLabel}</span>
                      </td>
                      <td>{row.plannedCount}</td>
                      <td>{row.targetWithUnit}</td>
                      <td>{row.visitedCount}</td>
                      <td>{row.totalReceipts}</td>
                      <td>{row.totalVisitNotes}</td>
                      <td>{row.elapsedTimes}</td>
                      <td>{row.kmTravelled}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {reportRows.length > 0 && (
            <div className="bpr-pagination">
              <div className="bpr-pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, reportRows.length)} of {reportRows.length} entries
              </div>
              <div className="bpr-pagination-controls">
                <button className="bpr-page-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`bpr-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="bpr-page-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BeatPlanReport;
