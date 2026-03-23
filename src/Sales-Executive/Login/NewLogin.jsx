import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./NewLogin.css";
import Picture from "../../components/login/Assets/Login/picture.png";
import Tvs from "../../components/login/Assets/Login/mytvs.png";
import { apiService } from "../../services/apiservice";
import apiConfigManager from "../../services/apiConfig";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

function NewLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading Dashboard...");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionConflictData, setSessionConflictData] = useState(null);

  useEffect(() => {
    // Check for success message from password reset
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }

    // If user is already logged in, redirect to home
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/sales-home");
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Verifying Authorization...");
    setNavigating(true); // Show spinner immediately when login starts
    setError("");

    try {
      const data = await apiService.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        is_proceed_to_login: false, // First attempt without forcing logout
      });

      if (data.success) {
        // Store token and user details
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user_detail));
        localStorage.setItem("isPasswordExpired", data.is_password_expired);

        // Initialize API config if api_list is present (for customers)
        if (data.user_detail?.api_list && Array.isArray(data.user_detail.api_list)) {
          console.log('🔧 Initializing API configuration from login response (customer)');
          apiConfigManager.initialize(data.user_detail.api_list);
        } 
        // For sales executives, fetch profile to get api_list
        else if (data.user_detail?.user_type === "sales_executive") {
          console.log('🔧 Fetching profile for sales executive to get API configuration');
          try {
            const profileData = await apiService.get('/profile/user-details');
            if (profileData.success && profileData.data?.profile?.api_list) {
              console.log('✅ Initializing API configuration from profile response (sales executive)');
              apiConfigManager.initialize(profileData.data.profile.api_list);
              const seCode = profileData.data.profile.sales_executive_code;
              if (seCode) localStorage.setItem('sales_executive_code', seCode);
            }
          } catch (profileError) {
            console.error('❌ Failed to fetch profile for API configuration:', profileError);
          }
        }

        setLoading(false);
        
        // Navigate to sales home for sales executive after minimum 1 second
        if (data.user_detail.user_type === "sales_executive") {
          setLoadingMessage("Loading Dashboard...");
          setTimeout(() => {
            navigate("/sales-home");
          }, 1000); // Keep spinner visible for smooth transition
        }
      } else if (data.message?.includes("already logged in")) {
        // Session conflict - user is already logged in elsewhere
        setSessionConflictData(data);
        setShowSessionModal(true);
        setLoading(false);
        setNavigating(false);
      } else {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        setNavigating(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 409 || error.response?.data?.message?.includes("already logged in")) {
        setSessionConflictData(error.response.data);
        setShowSessionModal(true);
      } else {
        setError(error.response?.data?.message || "Unable to connect to server. Please try again.");
      }
      setLoading(false);
      setNavigating(false);
    }
  };

  const handleProceedLogin = async () => {
    setShowSessionModal(false);
    setLoading(true);
    setLoadingMessage("Verifying Authorization...");
    setNavigating(true);
    setError("");

    try {
      const data = await apiService.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        is_proceed_to_login: true, // Force logout from other session
      });

      if (data.success) {
        // Trigger force logout in other tabs/windows
        localStorage.setItem('forceLogout', 'true');
        
        // Small delay to ensure other tabs receive the event
        setTimeout(() => {
          localStorage.removeItem('forceLogout');
        }, 100);

        // Store token and user details
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user_detail));
        localStorage.setItem("isPasswordExpired", data.is_password_expired);

        // Initialize API config if api_list is present (for customers)
        if (data.user_detail?.api_list && Array.isArray(data.user_detail.api_list)) {
          console.log('🔧 Initializing API configuration from login response (customer)');
          apiConfigManager.initialize(data.user_detail.api_list);
        } 
        // For sales executives, fetch profile to get api_list
        else if (data.user_detail?.user_type === "sales_executive") {
          console.log('🔧 Fetching profile for sales executive to get API configuration');
          try {
            const profileData = await apiService.get('/profile/user-details');
            if (profileData.success && profileData.data?.profile?.api_list) {
              console.log('✅ Initializing API configuration from profile response (sales executive)');
              apiConfigManager.initialize(profileData.data.profile.api_list);
              const seCode = profileData.data.profile.sales_executive_code;
              if (seCode) localStorage.setItem('sales_executive_code', seCode);
            }
          } catch (profileError) {
            console.error('❌ Failed to fetch profile for API configuration:', profileError);
          }
        }

        setLoading(false);
        
        // Show loading spinner and navigate to sales home for sales executive
        if (data.user_detail.user_type === "sales_executive") {
          setLoadingMessage("Loading Dashboard...");
          setTimeout(() => {
            navigate("/sales-home");
          }, 1000); // Show spinner for 1 second before navigation
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleCancelLogin = () => {
    setShowSessionModal(false);
    setSessionConflictData(null);
  };

  return (
    <>
      {navigating && <LoadingSpinner message={loadingMessage} />}
      
      <div className="login-wrapper">
        <div className="orange-bg-slant"></div>

      <div className="main-container">
        <div className="login-card">
          <div className="left-panel">
            <img
              src={Picture}
              alt="Worker Illustration"
              className="worker-img"
            />
          </div>

          <div className="right-panel">
            <div className="brand-logo">
              <img src={Tvs} alt="myTVS" className="tvs-img" />
            </div>

            <h2 className="auth-title">Login</h2>

            {successMessage && (
              <div className="success-message-new">{successMessage}</div>
            )}
            {error && <div className="error-message-new">{error}</div>}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  placeholder="Enter Your Email"
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  disabled={loading}
                  className="input-box"
                />
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">Password</label>
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showPassword ? (
                        <>
                          <path
                            d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                            stroke="#f36f21"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#f36f21"
                            strokeWidth="2"
                          />
                        </>
                      ) : (
                        <>
                          <path
                            d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                            stroke="#f36f21"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#f36f21"
                            strokeWidth="2"
                          />
                          <line
                            x1="3"
                            y1="3"
                            x2="21"
                            y2="21"
                            stroke="#f36f21"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </svg>
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  placeholder="Enter Your Password"
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="input-box"
                />
              </div>

              <div className="helper-links">
                <Link to="/forget-password" className="forgot">
                  Forget Password ?
                </Link>
              </div>

              <button
                type="submit"
                className="gradient-login-btn"
                disabled={loading}
              >
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Session Conflict Modal */}
      {showSessionModal && (
        <>
          <div className="modal-overlay" onClick={handleCancelLogin}></div>
          <div className="session-modal">
            <div className="session-modal-content">
              <div className="session-modal-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#F36F21" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#F36F21" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="session-modal-title">Session Already Active</h2>
              <p className="session-modal-message">
                This username is already logged in. If you want to continue, please log out from the other session and log in again.
              </p>
              <div className="session-modal-actions">
                <button 
                  className="session-cancel-btn" 
                  onClick={handleCancelLogin}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="session-proceed-btn" 
                  onClick={handleProceedLogin}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Proceed"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}

export default NewLogin;
