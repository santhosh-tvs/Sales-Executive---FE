import React from "react";
import { Link } from "react-router-dom";
import HeaderLogo from "./HeaderLogo"; 
import HeaderRight from "./HeaderRight";

import "./header.css"

const Header = () => {
  return (
    <div className="header-container">
      <div>
        <HeaderLogo />
      </div>
      <div className="header-center-nav">
        {/* Center Navigation - Direct Links */}
        <div className="nav-group">
          <div className="nav-item">
            <Link to="/consolidate-report" className="nav-btn">History</Link>
          </div>
          <div className="nav-item">
            <Link to="/view-plan" className="nav-btn">Beat</Link>
          </div>
          <div className="nav-item">
            <Link to="/receipt" className="nav-btn">Reciept</Link>
          </div>
          <div className="nav-item dropdown">
            <button className="nav-btn">Order</button>
            <div className="dropdown-content">
              <Link to="/s-bulk">Bulk Order</Link>
              <Link to="/s-import">Import Order</Link>
              <Link to="/create-order">Create Order</Link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <HeaderRight />
      </div>
    </div>
  );
};

export default Header;
