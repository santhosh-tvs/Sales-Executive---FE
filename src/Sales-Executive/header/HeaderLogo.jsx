import React from "react";
import { useNavigate } from "react-router-dom";
import "./header.css"
import logoImage from "../../assets/Icons/partsmart_logo_new.png";

const HeaderLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/sales-home');
  };

  return (
    <div className="header-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
      <img src={logoImage} alt="myTVS partsmart" className="logo-image" />
    </div>
  );
};

export default HeaderLogo;
