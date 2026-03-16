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
          <div className="nav-item mega-dropdown">
            <button className="nav-btn">Masters</button>
            <div className="mega-dropdown-content">
              <div className="mega-menu-main">
                {/* Items Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Items</span>
                  <div className="mega-submenu">
                    <Link to="/masters/item" className="mega-submenu-link">Item Master</Link>
                    <Link to="/masters/item" className="mega-submenu-link">Item UOM</Link>
                    <Link to="/masters/item" className="mega-submenu-link">Brands</Link>
                    <Link to="/masters/item" className="mega-submenu-link">Brand & Location Mapping</Link>
                    <Link to="/masters/item" className="mega-submenu-link">Exclusive Brand Configuration</Link>
                  </div>
                </div>

                {/* Employee Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Employees</span>
                  <div className="mega-submenu">
                    <Link to="/masters/employee" className="mega-submenu-link">Employee Master</Link>
                    <Link to="/masters/employee" className="mega-submenu-link">Employee Hierarchy</Link>
                  </div>
                </div>

                {/* Customer Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Customers</span>
                  <div className="mega-submenu">
                    <Link to="/masters/customer" className="mega-submenu-link">Customer Master</Link>
                  </div>
                </div>

                {/* Branch Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Branches</span>
                  <div className="mega-submenu">
                    <Link to="/masters/branch" className="mega-submenu-link">Branch Master</Link>
                    <Link to="/masters/branch" className="mega-submenu-link">Sites</Link>
                  </div>
                </div>

                {/* Location Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Locations</span>
                  <div className="mega-submenu">
                    <Link to="/masters/location" className="mega-submenu-link">Countries</Link>
                    <Link to="/masters/location" className="mega-submenu-link">States</Link>
                    <Link to="/masters/location" className="mega-submenu-link">Cities</Link>
                  </div>
                </div>
              </div>
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
