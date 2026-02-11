import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import manIcon from "../../assets/Icons/man-icon.png";
import mailIcon from "../../assets/Icons/mail-icon.png";
import profileBanner from "../../assets/Icons/profile-banner.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import"./profile.css";

// Dummy chart data
const salesData = [
  { month: "Jan", sales: 400 },
  { month: "Feb", sales: 600 },
  { month: "Mar", sales: 550 },
  { month: "Apr", sales: 750 },
  { month: "May", sales: 500 },
  { month: "Jun", sales: 800 },
];

const paymentData = [
  { month: "Jan", payment: 300 },
  { month: "Feb", payment: 500 },
  { month: "Mar", payment: 450 },
  { month: "Apr", payment: 600 },
  { month: "May", payment: 400 },
  { month: "Jun", payment: 700 },
];

const ROLE_MAP = {
  1: "Admin",
  2: "Sales",
  3: "Customer",
};

const SalesProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div>
      <Header />

      <div className="Sales-profile-container">
        <div className="profile-banner">
          <img
            src={profileBanner}
            alt="Profile-Banner"
            className="profile-banner-img"
          />
        </div>
        <div className="profile-man-icon">
          <img src={manIcon} alt="man-icon" className="profile-man-icon" />
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-details-container">
          <div className="profile-left-panel">
            <div>
              <div className="profile-name-container">
                <h3 className="profile-name">{user.name || "No Name"}</h3>
                <button
                  className="profile-logout-btn"
                  onClick={handleLogOut}
                >
                  Log out
                </button>
              </div>
              <div className="profile-email">
                <img
                  src={mailIcon}
                  alt="email-icon"
                  className="profile-email-icon"
                />
                <span className="profile-email-text">{user.email_id}</span>
              </div>
              <p className="profile-role">{ROLE_MAP[user.role] || "User"}</p>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-block">
                <p className="profile-label">Mobile</p>
                <p className="profile-value">{user.Mobile_Number || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Employee code</p>
                <p className="profile-value">{user.emp_code || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Reporting to</p>
                <p className="profile-value">{user.reporting || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Designation</p>
                <p className="profile-value">{user.designation || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Sales Manager Name</p>
                <p className="profile-value">{user.sales_manager_name || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Sales Manager Number</p>
                <p className="profile-value">{user.sales_manager_number || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-right-section">
          <div className="profile-right-panel">
            <div className="profile-kpi-section">
              <div className="profile-kpi-1">
                <div className="profile-kpi-card">
                  <p className="profile-kpi-label">Today Orders</p>
                  <p className="profile-kpi-value">₹ 00.00</p>
                </div>
                <div className="profile-kpi-card">
                  <p className="profile-kpi-label">MTD Orders</p>
                  <p className="profile-kpi-value">₹ 00.00</p>
                </div>
                <div className="profile-kpi-card">
                  <p className="profile-kpi-label">YTD Orders</p>
                  <p className="profile-kpi-value">₹ 00.00</p>
                </div>
              </div>
              <div className="profile-kpi-2">
                <div className="profile-kpi-card1">
                  <p className="profile-kpi-label">Total Overdue</p>
                  <p className="profile-kpi-value blue">₹ 00.00</p>
                </div>
                <div className="profile-kpi-card1">
                  <p className="profile-kpi-label">Total Outstanding</p>
                  <p className="profile-kpi-value blue">₹ 00.00</p>
                </div>
              </div>
            </div>

            <div className="profile-chart-container">
              <h4 className="profile-chart-title">Sales Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="profile-chart-container">
              <h4 className="profile-chart-title">Payment Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={paymentData}>
                  <defs>
                    <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="payment"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPayment)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesProfile;
