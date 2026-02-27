import React from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom"; // 1. useNavigate import pannunga

import Picture from "../../assets/Login/picture.png";
import Tvs from "../../assets/Login/mytvs.png";
import lock from "../../assets/Login/lock.png";
import user from "../../assets/Login/user.png";

function Login() {
  const navigate = useNavigate(); // 2. Navigate initialize

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login clicked - Redirecting to Dashboard");
    
    // Ippo logic check panna direct-ah dashboard-ku poga veipom
    // Pinadi neenga API link pannum pothu inga thaan success condition check pannanum
    navigate("/dashboard"); 
  };

  return (
    <div className="login-wrapper">
      <div className="orange-bg-slant"></div>

      <div className="main-container">
        <div className="login-card">
          <div className="left-panel">
            <img src={Picture} alt="Worker Illustration" className="worker-img" />
          </div>

          <div className="right-panel">
            <div className="brand-logo">
              <img src={Tvs} alt="myTVS" className="tvs-img" />
            </div>

            {/* 3. onSubmit-la handleSubmit function-ai link pannunga */}
            <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="input-field">
                <img src={user} alt="user" className="field-icon" />
                <div className="input-data">
                  <label>Username</label>
                  <input type="text" required autoComplete="off" />
                </div>
              </div>

              <div className="input-field">
                <img src={lock} alt="lock" className="field-icon" />
                <div className="input-data">
                  <label>Password</label>
                  <input type="password" required autoComplete="new-password" />
                </div>
              </div>

              <div className="helper-links">
                <Link to="/forget-password" className="forgot">Forget Password ?</Link>
              </div>

              <button type="submit" className="gradient-login-btn">
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;