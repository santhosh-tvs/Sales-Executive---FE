import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import cartSvg from "../../assets/Icons/Cart.png";
import heartSvg from "../../assets/Icons/Heart.png";
import profileSvg from "../../assets/Icons/profile.png";
import "./header.css"

const HeaderRight = () => {
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const profileRef = useRef(null);

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        return;
      }

      const response = await fetch("http://localhost:3000/profile/user-details", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileData(data.data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (token) {
        // Call logout API
        const response = await fetch("http://localhost:3000/profile/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
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
                <h3 className="profile-name">{profileData?.name || "User"}</h3>
                <p className="profile-email">{profileData?.email || "N/A"}</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="detail-label">Mobile</span>
                <span className="detail-value">{profileData?.mobile_number || "N/A"}</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Employee Code</span>
                <span className="detail-value">{profileData?.sales_executive_code || "N/A"}</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Reporting TO</span>
                <span className="detail-value">{profileData?.reporting_manager || "N/A"}</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Designation</span>
                <span className="detail-value">{profileData?.department || "Employee"}</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Sales Manager Name</span>
                <span className="detail-value">{profileData?.reporting_manager || "N/A"}</span>
              </div>
              
              <div className="profile-detail-row">
                <span className="detail-label">Sales Manager Number</span>
                <span className="detail-value">{profileData?.reporting_email || "N/A"}</span>
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
