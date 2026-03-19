import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { apiService } from "../../services/apiservice";
import "./CustomerSummary.css";

const CustomerSummary = () => {
  const { state } = useLocation();
  const customer = state?.customer || {};
  const customerDetails = state?.customerDetails || {};

  const [activeTab, setActiveTab] = useState("DashBoard");

  // Dashboard data
  const [salesData, setSalesData] = useState(null);
  const [enquiryData, setEnquiryData] = useState(null);
  const [visitData, setVisitData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Orders tab data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Collections tab data
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const customerCode = customer?.code || customerDetails?.customer_code || "";
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
    const fetchDashboard = async () => {
      setDashLoading(true);
      try {
        const [sales, enquiry, visits] = await Promise.allSettled([
          apiService.get("/dashboard/my-sales-counts"),
          apiService.get("/dashboard/enquiry-counts"),
          apiService.get("/dashboard/plan-visited-counts"),
        ]);
        if (sales.status === "fulfilled" && sales.value?.success) setSalesData(sales.value.data);
        if (enquiry.status === "fulfilled" && enquiry.value?.success) setEnquiryData(enquiry.value.data);
        if (visits.status === "fulfilled" && visits.value?.success) setVisitData(visits.value.data);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setDashLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Load orders when Orders tab is selected
  useEffect(() => {
    if (activeTab !== "Orders") return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await apiService.get("/receipt/receipt-list", {
          search: customerCode,
          limit: 50,
        });
        if (res?.success && res.data) {
          const flat = [];
          res.data.forEach(group => group.list?.forEach(r => flat.push(r)));
          setOrders(flat);
        }
      } catch (e) {
        console.error("Orders fetch error:", e);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, customerCode]);

  // Load collections when Collections tab is selected
  useEffect(() => {
    if (activeTab !== "Collections") return;
    const fetchCollections = async () => {
      setCollectionsLoading(true);
      try {
        const res = await apiService.get("/receipt/receipt-list", {
          search: customerCode,
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
                  <StatCard label="Today Target" value={fmt(enquiryData?.today?.target)} icon="🎯" />
                  <StatCard label="Today Actual" value={fmt(enquiryData?.today?.actual)} icon="📋" />
                  <StatCard label="Month Open" value={fmt(enquiryData?.month?.open)} icon="📂" />
                  <StatCard label="Month Closed" value={fmt(enquiryData?.month?.closed)} icon="✅" />
                </div>
              </div>

              {/* Visits */}
              <div className="data-group">
                <h3 className="group-heading">Visits</h3>
                <div className="cards-row-2">
                  <StatCard label="This Month Target" value={fmt(visitData?.month?.target)} icon="📍" />
                  <StatCard label="This Month Visited" value={fmt(visitData?.month?.visited)} icon="👤" />
                </div>
              </div>

              {/* Sales */}
              <div className="data-group">
                <h3 className="group-heading">Sales</h3>
                <div className="cards-row-4">
                  <StatCard label="Monthly Target" value={`₹${fmt(salesData?.month?.target)}`} icon="📊" />
                  <StatCard label="Monthly Actual" value={`₹${fmt(salesData?.month?.actual)}`} icon="🛒" />
                  <StatCard label="Weekly Target" value={`₹${fmt(salesData?.week?.target)}`} icon="📅" />
                  <StatCard label="Weekly Actual" value={`₹${fmt(salesData?.week?.actual)}`} icon="📈" />
                </div>
              </div>

              {/* Collections summary */}
              <div className="data-group">
                <h3 className="group-heading">Collections</h3>
                <div className="cards-row-2">
                  <StatCard
                    label="Credit Limit"
                    value={customerDetails?.credit_limit ? `₹${fmt(customerDetails.credit_limit)}` : "—"}
                    icon="�"
                  />
                  <StatCard
                    label="Outstanding Amount"
                    value={customerDetails?.outstanding_amount ? `₹${fmt(customerDetails.outstanding_amount)}` : "—"}
                    icon="⏳"
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
                Showing receipts for <strong>{customerName}</strong>
              </span>
            </div>
            <div className="orders-main-list">
              {ordersLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#999" }}>No orders found.</div>
              ) : orders.map((r, i) => (
                <div key={i} className="order-item-row">
                  <div className="order-item-left">
                    <div className="info-circle-blue">i</div>
                    <div className="order-info-stack">
                      <span className="text-light-grey">Receipt Ref</span>
                      <span className="text-bold-id">{r.receipt_ref_number || "—"}</span>
                      <span className="text-light-grey">{r.receipt_mode || r.receipt_method || "—"}</span>
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

        {/* VISITS TAB — no API, static placeholder */}
        {activeTab === "Visits" && (
          <div className="orders-section-container">
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              Visit history for this customer is not available yet.
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
