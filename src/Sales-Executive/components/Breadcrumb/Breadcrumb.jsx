import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

/**
 * Breadcrumb supports two usage modes:
 *
 * 1. Multi-level (preferred):
 *    <Breadcrumb crumbs={[
 *      { label: 'Home', path: '/sales-home' },
 *      { label: 'Beat Plan', path: '/beatplan' },
 *      { label: 'Create Beat' }   // no path = current page
 *    ]} />
 *
 * 2. Legacy single-level (backward compatible):
 *    <Breadcrumb currentPage="Beat Plan" />
 *    <Breadcrumb currentPage="Create Beat" parentPage="Beat Plan" parentPath="/beatplan" />
 */
const Breadcrumb = ({ crumbs, currentPage, parentPage = 'Home', parentPath = '/sales-home' }) => {
  const navigate = useNavigate();

  // Build crumbs array from legacy props if crumbs not provided
  const items = crumbs || [
    { label: parentPage, path: parentPath },
    { label: currentPage },
  ];

  return (
    <nav className="breadcrumb-navigation" aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            {isLast || !item.path ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <span
                className="breadcrumb-home"
                onClick={() => item.path === -1 ? navigate(-1) : navigate(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (item.path === -1 ? navigate(-1) : navigate(item.path))}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
