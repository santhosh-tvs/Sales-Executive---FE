import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import cartSvg from "../../assets/Icons/Cart.png";
import heartSvg from "../../assets/Icons/Heart.png";
import profileSvg from "../../assets/Icons/profile.png";
import "./header.css"

const HeaderRight = () => {
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    
    // Navigate to login page
    navigate("/login");
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };

    if (showProfilePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfilePopup]);

  return (
    <div className="header-right">
      {/* Heart/Wishlist Icon */}
      <div className="header-section header-wishlist">
        <RouterLink to="/wishlist" className="header-icon-link">
          <img src={heartSvg} alt="wishlist" className="wishlist-icon" />
        </RouterLink>
      </div>

      {/* Cart Icon */}
      <div className="header-section header-cart">
        <RouterLink to="/cart" className="header-icon-link">
          <img src={cartSvg} alt="cart" className="cart-icon" />
        </RouterLink>
      </div>

      {/* Profile Icon */}
      <div className="header-section header-profile" ref={profileRef}>
        <button className="header-icon-link profile-btn" onClick={toggleProfilePopup}>
          <img src={profileSvg} alt="profile" className="profile-icon-header" />
        </button>
        
        {/* Profile Popup */}
        {showProfilePopup && (
          <div className="profile-popup">
            <div className="profile-popup-header">
              <div className="profile-avatar">
                <div className="avatar-circle"></div>
              </div>
              <div className="profile-info">
                <h3 className="profile-name">Ashik</h3>
                <p className="profile-email">ashik@tvs.in</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="detail-label">Mobile</span>
                <span className="detail-value">93228 99498</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Employee Code</span>
                <span className="detail-value">93228 99498</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Reporting TO</span>
                <span className="detail-value">Sam T</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Designation</span>
                <span className="detail-value">Employee</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Sales Manager Name</span>
                <span className="detail-value">Jhon</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Sales Manager Number</span>
                <span className="detail-value">9876545678</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="header-section header-logout">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default HeaderRight;
