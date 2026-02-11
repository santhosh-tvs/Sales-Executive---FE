import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PageNavigate.css';

const PageNavigate = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Cart page
    if (path.includes('/cart')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Cart', path: '/cart' }
      ];
    }
    
    // Wishlist page
    if (path.includes('/wishlist')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Wishlist', path: '/wishlist' }
      ];
    }
    
    // Brands page
    if (path === '/brands') {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Brands', path: '/brands' }
      ];
    }
    
    // Categories page (Make/Model selection)
    if (path.includes('/categories/')) {
      const brandName = path.split('/categories/')[1];
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Brands', path: '/brands' },
        { label: decodeURIComponent(brandName), path: path }
      ];
    }
    
    // Product listing page
    if (path.includes('/product-listing')) {
      const make = searchParams.get('make');
      const model = searchParams.get('model');
      
      const breadcrumbs = [
        { label: 'Home', path: '/sales-home' },
        { label: 'Brands', path: '/brands' }
      ];
      
      if (make) {
        breadcrumbs.push({ label: make, path: `/categories/${make}` });
      }
      
      if (model) {
        breadcrumbs.push({ label: model, path: path });
      }
      
      return breadcrumbs;
    }
    
    // Create Order page
    if (path.includes('/create-order')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Create Order', path: '/create-order' }
      ];
    }
    
    // Sales Order page
    if (path.includes('/sales-order')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'History', path: '/sales-order' },
        { label: 'Sales Order', path: '/sales-order' }
      ];
    }
    
    // Hold Order page
    if (path.includes('/hold-order')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'History', path: '/sales-order' },
        { label: 'Hold Order', path: '/hold-order' }
      ];
    }
    
    // Beat Plan pages
    if (path.includes('/view-plan')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Beat', path: '/view-plan' },
        { label: 'View Plan', path: '/view-plan' }
      ];
    }
    
    if (path.includes('/locate')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Beat', path: '/view-plan' },
        { label: 'Locate', path: '/locate' }
      ];
    }
    
    if (path.includes('/apply-leave')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'Beat', path: '/view-plan' },
        { label: 'Apply Leave', path: '/apply-leave' }
      ];
    }
    
    // My Actions
    if (path.includes('/my-actions')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'My Actions', path: '/my-actions' }
      ];
    }
    
    // My Collections
    if (path.includes('/my-collections')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'My Collections', path: '/my-collections' }
      ];
    }
    
    // My Customers
    if (path.includes('/my-customers')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'My Customers', path: '/my-customers' }
      ];
    }
    
    // Customer Summary
    if (path.includes('/customer-summary')) {
      return [
        { label: 'Home', path: '/sales-home' },
        { label: 'My Customers', path: '/my-customers' },
        { label: 'Customer Summary', path: '/customer-summary' }
      ];
    }
    
    // Default - just Home
    return [{ label: 'Home', path: '/sales-home' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="page-navigate">
      <div className="breadcrumb-container">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumb-link">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default PageNavigate;
