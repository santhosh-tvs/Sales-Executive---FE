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
          <div className="nav-item mega-dropdown">
            <button className="nav-btn">Beat</button>
            <div className="mega-dropdown-content">
              <div className="mega-menu-main">
                <div className="mega-menu-item">
                  <Link to="/view-plan" className="mega-menu-direct-link">Create Beat</Link>
                </div>
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Report</span>
                  <div className="mega-submenu">
                    <Link to="/report/plan-report" className="mega-submenu-link">Plan Report</Link>
                    <Link to="/report/visit-report" className="mega-submenu-link">Visit Report</Link>
                    <Link to="/report/checkin-checkout-report" className="mega-submenu-link">Check In &amp; Check Out Report</Link>
                    <Link to="/report/consolidate-report" className="mega-submenu-link">Consolidate Report</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-item dropdown">
            <button className="nav-btn">Receipt</button>
            <div className="dropdown-content">
              <Link to="/receipt">Receipt</Link>
              <Link to="/receipt-history">Receipt History</Link>
            </div>
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
                    <Link to="/masters/item?view=master" className="mega-submenu-link">Item Master</Link>
                    <Link to="/masters/item?view=uom" className="mega-submenu-link">Item UOM</Link>
                    <Link to="/masters/item?view=brands" className="mega-submenu-link">Brands</Link>
                    <Link to="/masters/item?view=brandLocation" className="mega-submenu-link">Brand & Location Mapping</Link>
                    <Link to="/masters/item?view=exclusiveBrand" className="mega-submenu-link">Exclusive Brand Configuration</Link>
                  </div>
                </div>

                {/* Employee Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Employees</span>
                  <div className="mega-submenu">
                    <Link to="/masters/employee?view=master" className="mega-submenu-link">Employee Master</Link>
                    <Link to="/masters/employee?view=hierarchy" className="mega-submenu-link">Employee Hierarchy</Link>
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
                    <Link to="/masters/branch?view=master" className="mega-submenu-link">Branch Master</Link>
                    <Link to="/masters/branch?view=sites" className="mega-submenu-link">Sites</Link>
                  </div>
                </div>

                {/* Location Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Locations</span>
                  <div className="mega-submenu">
                    <Link to="/masters/location?view=countries" className="mega-submenu-link">Countries</Link>
                    <Link to="/masters/location?view=states" className="mega-submenu-link">States</Link>
                    <Link to="/masters/location?view=cities" className="mega-submenu-link">Cities</Link>
                  </div>
                </div>

                {/* Partner Master - with submenu */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Partners</span>
                  <div className="mega-submenu">
                    <Link to="/masters/partner?view=warranty" className="mega-submenu-link">Partner Warranty Master</Link>
                    <Link to="/masters/partner?view=master" className="mega-submenu-link">Partner Master</Link>
                  </div>
                </div>

                {/* Application Master - with submenu (empty for now) */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Application Master</span>
                  <div className="mega-submenu">
                    <Link to="/masters/application" className="mega-submenu-link">Application Master</Link>
                  </div>
                </div>

                {/* Pricing Master - with submenu (empty for now) */}
                <div className="mega-menu-item has-submenu">
                  <span className="mega-menu-main-link">Pricing Master</span>
                  <div className="mega-submenu">
                    <Link to="/masters/pricing" className="mega-submenu-link">Pricing Master</Link>
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
