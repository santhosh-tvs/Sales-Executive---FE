import React from "react";
import { useNavigate } from "react-router-dom";
import "./header.css"
import logoImage from "../../assets/Icons/partsmart_logo_new.png";
import logoFallback from "../../assets/Icons/mytvs-partsmart-logo.png";

const HeaderLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/sales-home');
  };

  return (
    <div className="header-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
      <img
        src={logoImage}
        alt="myTVS Partsmart"
        className="logo-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = logoFallback;
        }}
      />
    </div>
  );
};

export default HeaderLogo;
