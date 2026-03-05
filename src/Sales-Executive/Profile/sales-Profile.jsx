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
import { apiService } from "../../services/apiservice";

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
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchProfileData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const data = await apiService.get("/profile/user-details");

      if (data.success) {
        setProfileData(data.data.profile);
      } else {
        console.error("Failed to fetch profile:", data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (token) {
        // Call logout API
        const data = await apiService.post("/profile/logout");

        if (data.success) {
          console.log("Logged out successfully from server");
        } else {
          console.error("Logout API failed:", data.message);
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isPasswordExpired");
      
      // Navigate to login page
      navigate("/login");
    }
  };

  if (!user || loading) return null;

  // Use profileData if available, otherwise fallback to user from localStorage
  const displayData = profileData || user;

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
                <h3 className="profile-name">{displayData.name || "No Name"}</h3>
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
                <span className="profile-email-text">{displayData.email || "N/A"}</span>
              </div>
              <p className="profile-role">
                {displayData.status ? displayData.status.charAt(0).toUpperCase() + displayData.status.slice(1) : "Sales Executive"}
              </p>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-block">
                <p className="profile-label">Mobile</p>
                <p className="profile-value">{displayData.mobile_number || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Phone Number</p>
                <p className="profile-value">{displayData.phone_number || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Employee code</p>
                <p className="profile-value">{displayData.sales_executive_code || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Reporting to</p>
                <p className="profile-value">{displayData.reporting_manager || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Reporting Email</p>
                <p className="profile-value">{displayData.reporting_email || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Department</p>
                <p className="profile-value">{displayData.department || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Company</p>
                <p className="profile-value">{displayData.company_name || displayData.company?.company_name || "N/A"}</p>
              </div>
              <div className="profile-info-block">
                <p className="profile-label">Company Code</p>
                <p className="profile-value">{displayData.company_code || displayData.company?.company_code || "N/A"}</p>
              </div>
              {displayData.business && displayData.business.length > 0 && (
                <div className="profile-info-block profile-business-units">
                  <p className="profile-label">Business Units</p>
                  <div className="profile-business-list">
                    {displayData.business.map((unit, index) => (
                      <span key={index} className="profile-business-tag">
                        {unit.bussiness_unit_name} ({unit.business_unit_code})
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
