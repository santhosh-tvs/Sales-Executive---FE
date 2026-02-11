import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiservice";
import "./Login.css";
import BackgroundImage from "../../assets/login/back.png";
import MyTvsLogo from "../../assets/New_Login/myTvs_Logo.png";

const NewLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUser = (role) => {
    if (role === 2) {
      navigate("/sales-home");
    } else if (role === 3) {
      navigate("/customer-home");
    } else if (role === 1) {
      navigate("/sales-home");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiService.post("/auth/login", {
        username: formData.email,
        password: formData.password,
      });

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        redirectUser(data.role);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="background-side">
        <img src={BackgroundImage} alt="background" className="bg-image" />
      </div>

      <div className="form-side">
        <div className="login-box">
          <div className="logo-container">
            <img src={MyTvsLogo} alt="myTVS partsmart" className="main-logo" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#666"/>
                  <path d="M10 12C4.477 12 0 14.477 0 17.5V20H20V17.5C20 14.477 15.523 12 10 12Z" fill="#666"/>
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 7H14V5C14 2.24 11.76 0 9 0C6.24 0 4 2.24 4 5V7H3C1.9 7 1 7.9 1 9V17C1 18.1 1.9 19 3 19H15C16.1 19 17 18.1 17 17V9C17 7.9 16.1 7 15 7ZM9 14C7.9 14 7 13.1 7 12C7 10.9 7.9 10 9 10C10.1 10 11 10.9 11 12C11 13.1 10.1 14 9 14ZM12 7H6V5C6 3.34 7.34 2 9 2C10.66 2 12 3.34 12 5V7Z" fill="#666"/>
                </svg>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-footer">
              <a href="#forgot" className="forgot-link">
                Forget Password ?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
