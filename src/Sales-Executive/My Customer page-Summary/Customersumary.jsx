import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { apiService } from "../../services/apiservice";
import { getOrderListAPI, getOrderDetailsAPI } from "../../services/api";
import "./CustomerSummary.css";

// Inline SVG icons with controllable color
const TargetSVG  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20409A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const CartSVG    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F36F21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const MapPinSVG  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ReceiptSVG = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20409A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const SalesSVG   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20409A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const OpenSVG    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F36F21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const ClosedSVG  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CreditSVG  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20409A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const OutstandingSVG = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const CustomerSummary = () => {
  const { state } = useLocation();
  const customer = state?.customer || {};
  const customerDetails = state?.customerDetails || {};

  const [activeTab, setActiveTab] = useState("DashBoard");

  // Dashboard data
  const [enquiryData, setEnquiryData] = useState(null);
  const [visitData, setVisitData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Orders tab data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderNo, setExpandedOrderNo] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});   // { [order_no]: detailData }
  const [orderDetailLoading, setOrderDetailLoading] = useState({});

  // Collections tab data
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Visits tab data
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  const customerCode = customer?.code || customerDetails?.customer_code || "";
  const customerId   = customerDetails?.customer_id || null;
  const customerName = customer?.name || customerDetails?.customer_name || "Customer";
  const address = [
    customerDetails?.address1,
    customerDetails?.address2,
    customerDetails?.city,
    customerDetails?.state,
    customerDetails?.post_code,
  ].filter(Boolean).join(", ");

  // Load dashboard data on mount
  useEffect(() => {
    if (!customerCode) return;
    const fetchDashboard = async () => {
      setDashLoading(true);
      try {
        const res = await apiService.get("/dashboard/my-customer-dashboard", {
          customer_code: customerCode,
        });
        if (res?.success) {
          setEnquiryData(res.enquiry);
          setVisitData(res.visits);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setDashLoading(false);
      }
    };
    fetchDashboard();
  }, [customerCode]);

  // Load orders when Orders tab is selected
  useEffect(() => {
    if (activeTab !== "Orders" || !customerCode) return;
    let cancelled = false;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        // Date range: start of current year → end of current year
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), 0, 1);   // Jan 1 this year
        const toDate   = new Date(now.getFullYear(), 11, 31); // Dec 31 this year

        const fmtDate = (d) => d.toISOString().split('T')[0];

        const res = await getOrderListAPI({
          customer_code: customerCode,
          employee_code: null,
          from_date: fmtDate(fromDate),
          to_date: fmtDate(toDate),
        });

        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Orders fetch error:", e);
          setOrders([]);
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, [activeTab, customerCode]);

  // Load collections when Collections tab is selected
  useEffect(() => {
    if (activeTab !== "Collections" || !customerCode) return;
    const fetchCollections = async () => {
      setCollectionsLoading(true);
      try {
        const res = await apiService.get("/dashboard/my-customer-receipt-list", {
          customer_code: customerCode,
          limit: 50,
        });
        if (res?.success && res.data) {
          const flat = [];
          res.data.forEach(group => group.list?.forEach(r => flat.push(r)));
          setCollections(flat);
        }
      } catch (e) {
        console.error("Collections fetch error:", e);
      } finally {
        setCollectionsLoading(false);
      }
    };
    fetchCollections();
  }, [activeTab, customerCode]);

  // Load visits when Visits tab is selected
  useEffect(() => {
    if (activeTab !== "Visits" || !customerCode) return;
    let cancelled = false;
    const fetchVisits = async () => {
      setVisitsLoading(true);
      try {
        const res = await apiService.get("/dashboard/my-customer-visited-plan-list", {
          customer_code: customerCode,
        });
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setVisits(res.data);
        } else {
          setVisits([]);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Visits fetch error:", e);
          setVisits([]);
        }
      } finally {
        if (!cancelled) setVisitsLoading(false);
      }
    };
    fetchVisits();
    return () => { cancelled = true; };
  }, [activeTab, customerCode]);

  const handleOrderClick = async (orderNo) => {
    if (expandedOrderNo === orderNo) {
      setExpandedOrderNo(null);
      return;
    }
    setExpandedOrderNo(orderNo);
    if (orderDetails[orderNo]) return; // already fetched
    setOrderDetailLoading(prev => ({ ...prev, [orderNo]: true }));
    try {
      const res = await getOrderDetailsAPI({ order_no: orderNo });
      console.log("Order details raw response:", res);
      if (res?.success && res.data) {
        setOrderDetails(prev => ({ ...prev, [orderNo]: res.data }));
      }
    } catch (e) {
      console.error("Order details fetch error:", e);
    } finally {
      setOrderDetailLoading(prev => ({ ...prev, [orderNo]: false }));
    }
  };

  const fmt = (val) => val !== undefined && val !== null ? val.toLocaleString("en-IN") : "—";

  return (
    <div className="summary-page">
      <Header />
      <Breadcrumb
        crumbs={[
          { label: 'Home', path: '/sales-home' },
          { label: 'My Customers', path: '/my-customers' },
          { label: 'Customer Summary' },
        ]}
      />

      {/* Customer Header */}
      <div className="customer-header-box">
        <div className="header-top-row">
          <span className="cust-name">{customerName}</span>
          <span className="cust-divider">|</span>
          <span className="cust-id">{customerCode}</span>
        </div>
        {address && <p className="cust-address">{address}</p>}
        {(customerDetails?.credit_limit || customerDetails?.outstanding_amount) && (
          <div style={{ display: "flex", gap: "24px", marginTop: "8px", fontSize: "13px" }}>
            {customerDetails?.credit_limit && (
              <span style={{ color: "#555" }}>
                Credit Limit: <strong>₹{fmt(customerDetails.credit_limit)}</strong>
              </span>
            )}
            {customerDetails?.outstanding_amount && (
              <span style={{ color: "#c0392b" }}>
                Outstanding: <strong>₹{fmt(customerDetails.outstanding_amount)}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs-wrapper">
        {["DashBoard", "Insights", "Orders", "Collections", "Visits"].map((tab) => (
          <button
            key={tab}
            className={`nav-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="dashboard-sections">

        {/* DASHBOARD TAB */}
        {activeTab === "DashBoard" && (
          dashLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading...</div>
          ) : (
            <>
              {/* Enquiry */}
              <div className="data-group">
                <h3 className="group-heading">Enquiry</h3>
                <div className="cards-row-4">
                  <StatCard label="Total Enquiries" value={fmt(enquiryData?.target_count)} icon={<TargetSVG />} />
                  <StatCard label="Closed Enquiries" value={fmt(enquiryData?.actual_count)} icon={<ClosedSVG />} />
                </div>
              </div>

              {/* Visits */}
              <div className="data-group">
                <h3 className="group-heading">Visits</h3>
                <div className="cards-row-2">
                  <StatCard label="Total Planned" value={fmt(visitData?.target_count)} icon={<MapPinSVG />} />
                  <StatCard label="Total Visited" value={fmt(visitData?.actual_count)} icon={<MapPinSVG />} />
                </div>
              </div>

              {/* Collections summary */}
              <div className="data-group">
                <h3 className="group-heading">Collections</h3>
                <div className="cards-row-2">
                  <StatCard
                    label="Credit Limit"
                    value={customerDetails?.credit_limit ? `₹${fmt(customerDetails.credit_limit)}` : "—"}
                    icon={<CreditSVG />}
                  />
                  <StatCard
                    label="Outstanding Amount"
                    value={customerDetails?.outstanding_amount ? `₹${fmt(customerDetails.outstanding_amount)}` : "—"}
                    icon={<OutstandingSVG />}
                  />
                </div>
              </div>
            </>
          )
        )}

        {/* INSIGHTS TAB — static, no API */}
        {activeTab === "Insights" && (
          <div className="insights-outer-box">
            <div className="insights-list-box">
              {[
                { text: "Your visit frequency has decreased compared to last month. A plan has been created to visit this customer tomorrow.", action: "➥ Visits" },
                { text: "This month's sales are lower than last month. Please increase avg order value to achieve the target.", action: "➥ Create Orders" },
                { text: "The customer has pending invoices. A reminder has been sent.", action: "➥ Make Payment" },
              ].map((item, i) => (
                <div key={i} className="insight-row">
                  <div className="insight-left">
                    <div className="info-circle-blue">i</div>
                    <p className="insight-text">{item.text}</p>
                  </div>
                  <button className="insight-action-btn">{item.action}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "Orders" && (
          <div className="orders-section-container">
            <div className="orders-header-actions">
              <span style={{ fontSize: "13px", color: "#666" }}>
                Orders for <strong>{customerName}</strong>
              </span>
            </div>
            <div className="orders-main-list">
              {ordersLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#999" }}>No orders found.</div>
              ) : orders.map((order, i) => {
                const isExpanded = expandedOrderNo === order.order_no;
                const detail = orderDetails[order.order_no];
                const detailLoading = orderDetailLoading[order.order_no];
                const grandTotal = detail?.item_details?.reduce((s, it) => s + Number(it.total_price || 0), 0) || 0;
                return (
                  <div key={i}>
                    <div
                      className={`order-item-row order-item-clickable ${isExpanded ? "order-item-expanded" : ""}`}
                      onClick={() => handleOrderClick(order.order_no)}
                    >
                      <div className="order-item-left">
                        <div className="info-circle-blue">i</div>
                        <div className="order-info-stack">
                          <span className="text-bold-id">{order.order_no || "—"}</span>
                          <span className="text-light-grey">{order.order_type || "—"}</span>
                          <span className="text-light-grey">WH: {order.warehouse || "—"}</span>
                        </div>
                      </div>
                      <div className="order-item-right">
                        <span className="order-item-date">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("en-IN")
                            : "—"}
                        </span>
                        <div className="price-stack">
                          <span className="text-light-grey">Valid till</span>
                          <span className="text-bold-amt">
                            {order.validity_date
                              ? new Date(order.validity_date).toLocaleDateString("en-IN")
                              : "—"}
                          </span>
                        </div>
                        <span className="order-chevron">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Expand Panel */}
                    {isExpanded && (
                      <div className="order-detail-panel">
                        {detailLoading ? (
                          <div className="order-detail-loading">Loading details...</div>
                        ) : !detail ? (
                          <div className="order-detail-loading" style={{ color: "#999" }}>No details available.</div>
                        ) : (
                          <>
                            {/* Meta info row */}
                            <div className="order-detail-meta">
                              <div className="order-meta-chip">
                                <span className="meta-label">Order No</span>
                                <span className="meta-value">{detail.order_no}</span>
                              </div>
                              <div className="order-meta-chip">
                                <span className="meta-label">Type</span>
                                <span className="meta-value" style={{ textTransform: "capitalize" }}>{detail.order_type}</span>
                              </div>
                              <div className="order-meta-chip">
                                <span className="meta-label">Warehouse</span>
                                <span className="meta-value">{detail.warehouse}</span>
                              </div>
                              <div className="order-meta-chip">
                                <span className="meta-label">Created</span>
                                <span className="meta-value">
                                  {detail.created_at ? new Date(detail.created_at).toLocaleDateString("en-IN") : "—"}
                                </span>
                              </div>
                              <div className="order-meta-chip">
                                <span className="meta-label">Valid Till</span>
                                <span className="meta-value">
                                  {detail.validity_date ? new Date(detail.validity_date).toLocaleDateString("en-IN") : "—"}
                                </span>
                              </div>
                              {detail.reference_no && (
                                <div className="order-meta-chip">
                                  <span className="meta-label">Ref No</span>
                                  <span className="meta-value">{detail.reference_no}</span>
                                </div>
                              )}
                            </div>

                            {/* Items table */}
                            <div className="order-items-table-wrap">
                              <table className="order-items-table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Part No</th>
                                    <th>Part Name</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detail.item_details?.map((item, idx) => (
                                    <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td className="part-no-cell">{item.part_no}</td>
                                      <td>{item.part_name}</td>
                                      <td style={{ textAlign: "center" }}>{item.quantity ?? item.qty ?? "—"}</td>
                                      <td>₹{Number(item.item_price).toLocaleString("en-IN")}</td>
                                      <td>₹{Number(item.tax_price).toLocaleString("en-IN")}</td>
                                      <td className="total-cell">₹{Number(item.total_price).toLocaleString("en-IN")}</td>
                                      <td>
                                        <span className={`status-badge status-${item.status}`}>
                                          {item.status || "—"}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Grand total */}
                            <div className="order-grand-total">
                              <span>Grand Total</span>
                              <span className="grand-total-amt">₹{grandTotal.toLocaleString("en-IN")}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === "Collections" && (
          <div className="orders-section-container">
            <div className="orders-header-actions">
              <span style={{ fontSize: "13px", color: "#666" }}>
                Collections for <strong>{customerName}</strong>
              </span>
            </div>
            <div className="orders-main-list">
              {collectionsLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>Loading collections...</div>
              ) : collections.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#999" }}>No collections found.</div>
              ) : collections.map((r, i) => (
                <div key={i} className="order-item-row">
                  <div className="order-item-left">
                    <div className="info-circle-blue">i</div>
                    <div className="order-info-stack">
                      <span className="text-light-grey">Receipt Ref</span>
                      <span className="text-bold-id">{r.receipt_ref_number || "—"}</span>
                      <span className="text-light-grey">{r.customer_name || customerName}</span>
                    </div>
                  </div>
                  <div className="order-item-right">
                    <span className="order-item-date">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "—"}
                    </span>
                    <div className="price-stack">
                      <span className="text-light-grey">Amount</span>
                      <span className="text-bold-amt">₹{fmt(r.receipt_amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISITS TAB */}
        {activeTab === "Visits" && (
          <div className="orders-section-container">
            <div className="orders-header-actions">
              <span style={{ fontSize: "13px", color: "#666" }}>
                Visit history for <strong>{customerName}</strong>
              </span>
            </div>
            <div className="orders-main-list">
              {visitsLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>Loading visits...</div>
              ) : visits.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#999" }}>No visit history found.</div>
              ) : visits.map((v, i) => (
                <div key={i} className="order-item-row">
                  <div className="order-item-left">
                    <div className="info-circle-blue">i</div>
                    <div className="order-info-stack">
                      <span className="text-bold-id">{v.garage_name || "—"}</span>
                      <span className="text-light-grey">{v.garage_location || "—"}</span>
                      <span className="text-light-grey" style={{ textTransform: "capitalize" }}>
                        {v.visited_status || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="order-item-right">
                    <span className="order-item-date">
                      {v.plan_date
                        ? new Date(v.plan_date).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                    <div className="price-stack">
                      <span className="text-light-grey">
                        {v.check_in ? `In: ${new Date(v.check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Not checked in"}
                      </span>
                      <span className="text-light-grey">
                        {v.check_out ? `Out: ${new Date(v.check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Not checked out"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="exact-stat-card">
    <div className="card-info">
      <span className="label-text">{label}</span>
      <span className="value-text">{value}</span>
    </div>
    <div className="icon-wrapper">{icon}</div>
  </div>
);

export default CustomerSummary;
