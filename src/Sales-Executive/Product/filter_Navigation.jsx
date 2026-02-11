import React from "react";
import { Link } from "react-router-dom";
import "../../../styles/customer/productss/filter_Navigation.css";

function FilterNavigation({ filters, onFilterClick }) {
  // Build breadcrumb from filter values in order
  const buildFilterBreadcrumb = () => {
    const breadcrumbs = [];
    // Include all filter types in breadcrumb
    const filterOrder = ['brand', 'make', 'model', 'year', 'variant', 'fuelType', 'category', 'subCategory'];

    filterOrder.forEach((filterKey) => {
      if (filters?.[filterKey]?.length > 0) {
        // Format label for display
        let displayLabel = filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
        if (filterKey === 'fuelType') displayLabel = 'Fuel Type';
        if (filterKey === 'subCategory') displayLabel = 'Sub Category';
        
        breadcrumbs.push({ 
          key: filterKey,
          label: displayLabel, 
          value: filters[filterKey][0] 
        });
      }
    });

    return breadcrumbs;
  };

  const filterBreadcrumbs = buildFilterBreadcrumb();

  // Handle clicking on a filter breadcrumb - clear that filter and all subsequent filters
  const handleFilterClick = (clickedIndex) => {
    if (onFilterClick) {
      onFilterClick(clickedIndex);
    }
  };

  return (
    <nav className="filter-breadcrumb-container">
      <div className="breadcrumb-tabs">
        {/* HOME */}
        <Link to="/customer-home" className="filter-crumb">Home</Link>

        {/* FILTER VALUES - All clickable */}
        {filterBreadcrumbs.map((item, index) => {
          const isLast = index === filterBreadcrumbs.length - 1;
          return (
            <span 
              key={index} 
              className={`filter-crumb ${isLast ? 'active' : ''}`}
              onClick={() => handleFilterClick(index)}
            >
              {item.value}
            </span>
          );
        })}
      </div>
    </nav>
  );
}

export default FilterNavigation;
