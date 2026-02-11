import React, { useState } from "react";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import "./CustomerSummary.css";

const CustomerSummary = () => {
  const [activeTab, setActiveTab] = useState("DashBoard");

  return (
    <div className="summary-page">
      <Header />
      <Breadcrumb 
        currentPage={activeTab === "DashBoard" ? "Customer Summary" : "Repeat Orders"} 
        parentPage="My Customers"
        parentPath="/my-customers"
      />
      
      {/* 2. Customer Header */}
      <div className="customer-header-box">
        <div className="header-top-row">
          <span className="cust-name">BHALLA MOTORS</span>
          <span className="cust-divider">|</span>
          <span className="cust-id">EOTN000182</span>
        </div>
        <p className="cust-address">
          D.NO.5800 S.NO.122/6C1 BYE PASS SERVICE ROAD WARD NO.9 EAST
          MEENAKSHINAYAKENPATTI KURUMBAPATTI DINDIGUL. TAMIL NADU, 624002.
        </p>
      </div>
      {/* 3. Navigation Tabs */}
      <div className="nav-tabs-wrapper">
        {["DashBoard", "Insights", "Orders", "Collections", "Visits"].map(
          (tab) => (
            <button
              key={tab}
              className={`nav-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ),
        )}
      </div>
      {/* 4. Dashboard Content */}
      <div className="dashboard-sections">
        {/* ENQUIRY SECTION */}
        {(activeTab === "DashBoard" || activeTab === "Enquiry") && (
          <div className="data-group">
            <h3 className="group-heading">Enquiry</h3>
            <div className="cards-row-4">
              <StatCard label="Target vs Actual" value="20/10" icon="🎯" />
              <StatCard label="Enquiry Value" value="15,000" icon="💰" />
              <StatCard label="Confirmed Count" value="15,000" icon="✅" />
              <StatCard label="Confirmed Value" value="7800" icon="💳" />
            </div>
          </div>
        )}
        {/* VISITS SECTION */}
        {(activeTab === "DashBoard" || activeTab === "Visits") && (
          <div className="data-group">
            <h3 className="group-heading">Visits</h3>
            <div className="cards-row-2">
              <StatCard label="Target Visits" value="15" icon="📍" />
              <StatCard label="Actual Visits" value="9" icon="👤" />
            </div>
          </div>
        )}
        {/* SALES SECTION */}
        {(activeTab === "DashBoard" || activeTab === "Sales") && (
          <div className="data-group">
            <h3 className="group-heading">Sales</h3>
            <div className="cards-row-4">
              <StatCard label="Sales Target" value="1,00,000" icon="📊" />
              <StatCard label="Actual" value="22,000" icon="🛒" />
              <StatCard label="% Primary Brands" value="1500" icon="🛍️" />
              <StatCard label="Target Achieved %" value="12" icon="📈" />
            </div>
          </div>
        )}

        {/* COLLECTIONS SUMMARY (Dashboard click panna mattum idhu theriyum) */}
        {activeTab === "DashBoard" && (
          <div className="data-group">
            <h3 className="group-heading">Collections</h3>
            <div className="cards-row-4">
              <StatCard label="Sales Target" value="25,000/1,000" icon="📉" />
              <StatCard label="Total Due" value="40,000" icon="📅" />
              <StatCard label="Over Due Today" value="2,5000" icon="⏳" />
              <StatCard
                label="Over Due in Next 7 Days"
                value="5,800"
                icon="🗓️"
              />
            </div>
          </div>
        )}
        {/* INSIGHTS SECTION */}
        {activeTab === "Insights" && (
          <div className="insights-outer-box">
            <div className="insights-list-box">
              <div className="insight-row">
                <div className="insight-left">
                  <div className="info-circle-blue">i</div>
                  <p className="insight-text">
                    Your visit frequency has decreased(4 Visits) compared to
                    last month(12 visits) on the same day. So, we have created a
                    plan for this customer to visit on tomorrow.
                  </p>
                </div>
                <button className="insight-action-btn">➥ Visits</button>
              </div>
              <div className="insight-row">
                <div className="insight-left">
                  <div className="info-circle-blue">i</div>
                  <p className="insight-text">
                    This month's sales are lower than last month. Your average
                    order value this month is 1,200. Pls increase avg order
                    value to achieve the target.
                  </p>
                </div>
                <button className="insight-action-btn">➥ Create Orders</button>
              </div>
              <div className="insight-row">
                <div className="insight-left">
                  <div className="info-circle-blue">i</div>
                  <p className="insight-text">
                    PMTD is 5 lakhs, While MTD is only 2.1 lakhs. So, we have
                    create a plan for tomorrow to visit the customer.
                  </p>
                </div>
                <button className="insight-action-btn">➥ View</button>
              </div>
              <div className="insight-row">
                <div className="insight-left">
                  <div className="info-circle-blue">i</div>
                  <p className="insight-text">
                    The customer has four pending invoices totalling 8 lakhs.
                    One invoice for 1.1 lakhs is due to become overdue next
                    Monday. A reminder message and mobile app notification have
                    been sent.
                  </p>
                </div>
                <button className="insight-action-btn">➥ Make Payment</button>
              </div>
              <div className="insight-row">
                <div className="insight-left">
                  <div className="info-circle-blue">i</div>
                  <p className="insight-text">
                    Four back orders for this customer have been pending for a
                    week. The delivery date was yesterday, and as stock is
                    available, we’ve notified the warehouse team for action.
                  </p>
                </div>
                <button className="insight-action-btn">➥ Visits</button>
              </div>
            </div>
          </div>
        )}
        {/* COLLECTIONS TAB - Individual List View */}
        {activeTab === "Collections" && (
          <div className="orders-section-container">
            {/* Filter Row */}
            <div className="orders-header-actions">
              <select className="month-dropdown">
                <option>Current month</option>
              </select>
              <button className="blue-submit-btn">Submit</button>
              <button className="refresh-circular-btn">🔄</button>
            </div>

            {/* Collections Main List (Image-la irukura data) */}
            <div className="orders-main-list">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="order-item-row">
                  <div className="order-item-left">
                    <div className="info-circle-blue">i</div>
                    <div className="order-info-stack">
                      <span className="text-light-grey">Orders Created</span>
                      <span className="text-bold-id">I0F25190045361</span>
                      <span className="text-light-grey">Order ID</span>
                    </div>
                  </div>
                  <div className="order-item-right">
                    <span className="order-item-date">13/11/2025</span>
                    <div className="price-stack">
                      <span className="text-light-grey">Total Price</span>
                      <span className="text-bold-amt">₹ 1598</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "Orders" && (
          <div className="orders-section-container">
            {/* Filter Row - Tabs line-kku straight-ah align aagum */}
            <div className="orders-header-actions">
              <select className="month-dropdown">
                <option>Current month</option>
              </select>
              <button className="blue-submit-btn">Submit</button>
              <button className="refresh-circular-btn">🔄</button>
            </div>

            {/* Orders List Box */}
            <div className="orders-main-list">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="order-item-row">
                  <div className="order-item-left">
                    <div className="info-circle-blue">i</div>
                    <div className="order-info-stack">
                      <span className="text-light-grey">Orders Created</span>
                      <span className="text-bold-id">I0F25190045361</span>
                      <span className="text-light-grey">Order ID</span>
                    </div>
                  </div>
                  <div className="order-item-right">
                    <span className="order-item-date">13/11/2025</span>
                    <div className="price-stack">
                      <span className="text-light-grey">Total Price</span>
                      <span className="text-bold-amt">₹ 1598</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>{" "}
      {/* dashboard-sections end */}
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
