import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./VisitReport.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const PAGE_SIZE = 10;

const CheckInOutReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/beat-plan/visited-beat-plan-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
        setCurrentPage(1);
      } else {
        setError(json.message || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filtered = data.filter((row) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      (row.employee_name || "").toLowerCase().includes(q) ||
      (row.employee_code || "").toLowerCase().includes(q) ||
      (row.garage_name || "").toLowerCase().includes(q) ||
      (row.garage_code || "").toLowerCase().includes(q) ||
      (row.garage_location || "").toLowerCase().includes(q)
    );
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
      "Deviation (km)": row.deviation_in_km != null ? row.deviation_in_km : "-",
      "Check Out Date & Time": formatDateTime(row.check_out),
      "Total Duration": row.total_duration || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CheckIn-Out Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `CheckInOut_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <>
      <Header />
      <div className="vr-container">
        <div className="vr-content">
          <div className="vr-top-bar">
            <Breadcrumb currentPage="Check In & Check Out Report" />
            <div className="vr-actions">
              <input
                type="text"
                className="vr-search-input"
                placeholder="Search by employee, customer..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
              />
              <button className="vr-search-btn" onClick={() => setCurrentPage(1)} disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </button>
              <button className="vr-export-btn" onClick={handleExport} disabled={filtered.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                ) : (
                  currentData.map((row, idx) => (
                    <tr key={row.beat_plan_id}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{row.employee_name || "-"}</td>
                      <td>{row.employee_code || "-"}</td>
                      <td>{row.garage_name || "-"}</td>
                      <td>{row.garage_code || "-"}</td>
                      <td>{row.garage_location || "-"}</td>
                      <td>{row.garage_location || "-"}</td>
                      <td>{formatDateTime(row.check_in)}</td>
                      <td>{row.checkin_lat_long || "-"}</td>
                      <td>{row.deviation_in_km != null ? row.deviation_in_km : "-"}</td>
                      <td>{formatDateTime(row.check_out)}</td>
                      <td>{row.total_duration || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="vr-pagination">
              <div className="vr-pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </div>
              <div className="vr-pagination-controls">
                <button className="vr-page-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`vr-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="vr-page-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
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

export default CheckInOutReport;
