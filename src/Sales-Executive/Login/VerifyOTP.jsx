import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./VerifyOTP.css";
import Picture from "../../components/login/Assets/Login/picture.png";
import Tvs from "../../components/login/Assets/Login/mytvs.png";
import { apiService } from "../../services/apiservice";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);
  const email = location.state?.email;

  useEffect(() => {
    // Redirect to forgot password if no email
    if (!email) {
      navigate("/forget-password");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.post("/auth/verify-otp", {
        email: email,
        otp: parseInt(otpValue),
      });

      if (data.success) {
        setSuccess(true);
        setLoading(false);
        
        // Show success message and redirect to login
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Password reset successful! Please login with your new password." 
            } 
          });
        }, 2000);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(error.response?.data?.message || "Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");
    setResendMessage("");

    try {
      const data = await apiService.post("/auth/resend-otp", {
        email: email,
      });

      if (data.success) {
        setResendMessage("OTP has been resent to your email successfully!");
        setResendLoading(false);
        
        // Clear the message after 5 seconds
        setTimeout(() => {
          setResendMessage("");
        }, 5000);

        // Clear OTP inputs
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.");
        setResendLoading(false);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError(error.response?.data?.message || "Unable to connect to server. Please try again.");
      setResendLoading(false);
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

            <h2 className="auth-title">Verify OTP</h2>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to<br />
              <strong>{email}</strong>
            </p>

            {error && <div className="error-message-new">{error}</div>}
            {resendMessage && (
              <div className="success-message-new">{resendMessage}</div>
            )}
            {success && (
              <div className="success-message-new">
                OTP verified successfully! Redirecting to login...
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="otp-input-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading || success}
                    className="otp-input"
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="gradient-login-btn"
                disabled={loading || success}
              >
                {loading ? "VERIFYING..." : success ? "VERIFIED!" : "VERIFY OTP"}
              </button>

              <div className="helper-links">
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleResendOTP}
                  disabled={loading || success || resendLoading}
                >
                  {resendLoading ? "Resending..." : "Didn't receive OTP? Resend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
