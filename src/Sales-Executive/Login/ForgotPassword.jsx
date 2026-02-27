import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import Picture from "../../components/login/Assets/Login/picture.png";
import Tvs from "../../components/login/Assets/Login/mytvs.png";

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLoading(false);
        // Navigate to OTP verify page with email
        navigate("/verify-otp", { state: { email: formData.email } });
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
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

            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Enter your details to reset password</p>

            {error && <div className="error-message-new">{error}</div>}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  disabled={loading}
                  className="input-box"
                  placeholder="Enter your email"
                />
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">New Password</label>
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
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="input-box"
                  placeholder="Enter new password"
                />
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">Confirm Password</label>
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showConfirmPassword ? (
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
                    <span>{showConfirmPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="input-box"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="gradient-login-btn"
                disabled={loading}
              >
                {loading ? "GENERATING OTP..." : "GENERATE OTP"}
              </button>

              <div className="helper-links">
                <button
                  type="button"
                  className="back-to-login"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
