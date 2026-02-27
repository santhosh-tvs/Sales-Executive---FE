import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Picture from "../../components/login/Assets/Login/picture.png";
import Tvs from "../../components/login/Assets/Login/mytvs.png";
import lock from "../../components/login/Assets/Login/lock.png";
import user from "../../components/login/Assets/Login/user.png";

function NewLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          is_proceed_to_login: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user details
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user_detail));
        localStorage.setItem("isPasswordExpired", data.is_password_expired);

        setLoading(false);
        
        // Navigate to sales home for sales executive
        if (data.user_detail.user_type === "sales_executive") {
          navigate("/sales-home");
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
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

            {error && <div className="error-message-new">{error}</div>}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="input-group">
                <label className="input-label">Username or Email</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
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
    </div>
  );
}

export default NewLogin;
