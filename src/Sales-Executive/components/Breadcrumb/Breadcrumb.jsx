import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

/**
 * Route map: path → { label, parent }
 * Used for auto-building crumbs when no crumbs prop is passed.
 */
const ROUTE_MAP = {
  '/sales-home':                    { label: 'Home' },
  '/create-order':                  { label: 'Create Order',          parent: '/sales-home' },
  '/s-bulk':                        { label: 'Orders',                parent: '/sales-home' },
  '/s-import':                      { label: 'Import Orders',         parent: '/s-bulk' },
  '/s-import-status':               { label: 'Import Status',         parent: '/s-import' },
  '/s-order-view':                  { label: 'Order View',            parent: '/s-bulk' },
  '/consolidate-report':            { label: 'Consolidate Report',    parent: '/sales-home' },
  '/report/consolidate-report':     { label: 'Consolidate Report',    parent: '/sales-home' },
  '/history/sales-order':           { label: 'Sales Order History',   parent: '/sales-home' },
  '/history/hold-order':            { label: 'Hold Order History',    parent: '/sales-home' },
  '/history/consolidate-order':     { label: 'Consolidate History',   parent: '/sales-home' },
  '/history/receipt':               { label: 'Receipt History',       parent: '/sales-home' },
  '/report/visit-report':           { label: 'Visit Report',          parent: '/consolidate-report' },
  '/report/checkin-checkout-report':{ label: 'Check-In/Out Report',   parent: '/consolidate-report' },
  '/report/beat-plan-report':       { label: 'Beat Plan Report',      parent: '/consolidate-report' },
  '/receipt':                       { label: 'Receipt',               parent: '/sales-home' },
  '/receipt-history':               { label: 'Receipt History',       parent: '/receipt' },
  '/locate':                        { label: 'Locate',                parent: '/beatplan' },
  '/view-plan':                     { label: 'Beat Plan',             parent: '/sales-home' },
  '/beatplan':                      { label: 'Beat Plan',             parent: '/sales-home' },
  '/viewplan2':                     { label: 'View Plan',             parent: '/beatplan' },
  '/apply-leave':                   { label: 'Apply Leave',           parent: '/beatplan' },
  '/sales-import':                  { label: 'Sales Import',          parent: '/beatplan' },
  '/create-beat':                   { label: 'Create Beat',           parent: '/beatplan' },
  '/sales-profile':                 { label: 'My Profile',            parent: '/sales-home' },
  '/cart':                          { label: 'Cart',                  parent: '/sales-home' },
  '/shipping':                      { label: 'Shipping',              parent: '/cart' },
  '/wishlist':                      { label: 'Wishlist',              parent: '/sales-home' },
  '/order-success':                 { label: 'Order Success',         parent: '/sales-home' },
  '/order-failed':                  { label: 'Order Failed',          parent: '/sales-home' },
  '/brands':                        { label: 'Brands',                parent: '/sales-home' },
  '/product-listing':               { label: 'Products',              parent: '/sales-home' },
  '/my-actions':                    { label: 'My Actions',            parent: '/sales-home' },
  '/my-collections':                { label: 'My Collections',        parent: '/sales-home' },
  '/my-customers':                  { label: 'My Customers',          parent: '/sales-home' },
  '/customer-summary':              { label: 'Customer Summary',      parent: '/my-customers' },
  '/masters':                       { label: 'Masters',               parent: '/sales-home' },
  '/masters/branch':                { label: 'Branch Master',         parent: '/masters' },
  '/masters/customer':              { label: 'Customer Master',       parent: '/masters' },
  '/masters/employee':              { label: 'Employee Master',       parent: '/masters' },
  '/masters/item':                  { label: 'Item Master',           parent: '/masters' },
  '/masters/location':              { label: 'Location Master',       parent: '/masters' },
  '/masters/partner':               { label: 'Partner Master',        parent: '/masters' },
  '/masters/application':           { label: 'Application Master',    parent: '/masters' },
  '/masters/pricing':               { label: 'Pricing Master',        parent: '/masters' },
  '/masters/view':                  { label: 'View Master',           parent: '/masters' },
  '/masters/edit':                  { label: 'Edit Master',           parent: '/masters' },
};

/** Build crumb chain from ROUTE_MAP by walking up parent links */
function buildAutocrumbs(pathname) {
  // Handle dynamic segments like /categories/:brandName
  const normalizedPath = pathname.replace(/\/categories\/.*/, '/categories');

  const chain = [];
  let current = normalizedPath;

  while (current && ROUTE_MAP[current]) {
    const { label, parent } = ROUTE_MAP[current];
    chain.unshift({ label, path: current });
    current = parent || null;
  }

  // Always ensure Home is the root
  if (chain.length === 0 || chain[0].path !== '/sales-home') {
    chain.unshift({ label: 'Home', path: '/sales-home' });
  }

  return chain;
}

/**
 * Breadcrumb — fully dynamic, auto-detects from URL when no crumbs prop given.
 *
 * Usage:
 *   <Breadcrumb />                          ← auto from URL
 *   <Breadcrumb showBack />                 ← auto + back button
 *   <Breadcrumb crumbs={[...]} />           ← manual crumbs
 *   <Breadcrumb crumbs={[...]} showBack />  ← manual + back button
 *
 * showBack defaults to true — always shows back button unless explicitly set to false.
 */
const Breadcrumb = ({
  crumbs,
  currentPage,
  parentPage = 'Home',
  parentPath = '/sales-home',
  showBack = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve crumbs: explicit > legacy props > auto from URL
  let items;
  if (crumbs) {
    items = crumbs;
  } else if (currentPage) {
    items = [
      { label: parentPage, path: parentPath },
      { label: currentPage },
    ];
  } else {
    items = buildAutocrumbs(location.pathname);
  }

  // Back target: second-to-last crumb path, or browser history
  const backTarget = items.length >= 2 ? items[items.length - 2] : null;

  const handleNavigate = (path) => {
    if (path === -1 || path === undefined) {
      navigate(-1);
    } else {
      navigate(path);
    }
  };

  const handleBack = () => {
    if (backTarget?.path) {
      navigate(backTarget.path);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="breadcrumb-wrapper">
      {showBack && items.length > 1 && (
        <button
          className="breadcrumb-back-btn"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
        >
          <svg
            className="breadcrumb-back-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <nav className="breadcrumb-navigation" aria-label="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.path ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <span
                  className="breadcrumb-link"
                  onClick={() => handleNavigate(item.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleNavigate(item.path)
                  }
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumb;
