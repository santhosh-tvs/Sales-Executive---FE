import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/customer/productss/pro_filter.css';
import EditIcon from '../../../assets/customer/product/Edit.png';
import RightArrow from '../../../assets/customer/product/RightArrow.png';
import ClearIcon from '../../../assets/customer/product/pro_product/clear.png';

const API_BASE_URL = 'http://localhost:5000/api';

// Master type mapping for API calls
const MASTER_TYPE_MAP = {
  brand: 'brand',
  make: 'make',
  model: 'model',
  variant: 'variant',
  fuelType: 'fuelType',
  year: 'year',
  category: 'aggregate',
  subCategory: 'subAggregate'
};

// Configuration for expandable filter sections (in display order)
const FILTER_CONFIG = [
  { key: 'make', title: 'Make', masterType: 'Make' },
  { key: 'model', title: 'Model', masterType: 'Model' },
  { key: 'variant', title: 'Variant', masterType: 'Variant' },
  { key: 'fuelType', title: 'Fuel type', masterType: 'FuelType' },
  { key: 'year', title: 'Year', masterType: 'Year' },
  { key: 'category', title: 'Categories', masterType: 'Aggregate' },
  { key: 'subCategory', title: 'Sub Category', masterType: 'SubAggregate' }
];

// Modal Component for showing all filter options
const FilterModal = ({ isOpen, onClose, title, options, selected, onSelect, filterType }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredOptions = options.filter(option =>
    String(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <input
            type="text"
            className="filter-modal-search"
            placeholder={`Search ${title}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="filter-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="filter-modal-options">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              className={`filter-modal-option ${selected.includes(option) ? 'selected' : ''}`}
              onClick={() => {
                onSelect(filterType, option);
                onClose();
              }}
              title={option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Filter Section Component
const FilterSection = ({ 
  title, 
  type, 
  options, 
  selected, 
  expanded, 
  onToggleExpand, 
  onToggleFilter,
  showMore,
  onToggleShowMore,
  onShowModal,
  loading
}) => {
  // Sort options: selected items first, then unselected
  const sortedOptions = [...options].sort((a, b) => {
    const aSelected = selected.includes(a);
    const bSelected = selected.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
  
  const visibleOptions = showMore ? sortedOptions : sortedOptions.slice(0, 5);

  return (
    <div className="filter-section">
      <div className="filter-section-header" onClick={onToggleExpand}>
        <span>{title}</span>
        <img
          src={RightArrow}
          alt="Arrow"
          className={`filter-arrow ${expanded ? 'expanded' : ''}`}
        />
      </div>

      {expanded && (
        <div className="filter-section-content">
          {loading ? (
            <div className="filter-loading">Loading...</div>
          ) : options.length === 0 ? (
            <div className="filter-no-data">No options available</div>
          ) : (
            <>
              {visibleOptions.map((item, index) => (
                <div key={index} className="filter-option">
                  <input
                    type="checkbox"
                    id={`${type}-${index}`}
                    checked={selected.includes(item)}
                    onChange={() => onToggleFilter(type, item)}
                  />
                  <label htmlFor={`${type}-${index}`}>{item}</label>
                </div>
              ))}

              {options.length > 5 && (
                <button
                  className="show-more-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowModal(type);
                  }}
                >
                  {`Show More (${options.length})`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ProFilter = ({ onFilterChange, externalFilters }) => {
  const [searchParams] = useSearchParams();
  
  // Get initial filter values from URL query parameters
  const getInitialFilters = () => {
    // If search parameter exists, clear all other filters
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      return {
        brand: [],
        make: [],
        model: [],
        variant: [],
        fuelType: [],
        year: [],
        category: [],
        subCategory: [],
        price: { min: 0, max: 10000 }
      };
    }

    // Otherwise, load from URL parameters (from Faster.jsx)
    const urlMake = searchParams.get('make');
    const urlModel = searchParams.get('model');
    const urlYear = searchParams.get('year');
    const urlVariant = searchParams.get('variant');

    return {
      brand: [],
      make: urlMake ? [urlMake] : [],
      model: urlModel ? [urlModel] : [],
      variant: urlVariant ? [urlVariant] : [],
      fuelType: [],
      year: urlYear ? [urlYear] : [],
      category: [],
      subCategory: [],
      price: { min: 0, max: 10000 }
    };
  };

  // Single state object for all filters
  const [filters, setFilters] = useState(getInitialFilters());

  // Ref to track if filters are being set from search (to prevent cascading reload)
  const isSearchUpdate = useRef(false);
  // Ref to track processed search terms to avoid reprocessing
  const processedSearchTerm = useRef(null);
  // Ref to track if initial options have loaded
  const hasInitialOptionsLoaded = useRef(false);

  // Notify parent of initial filters from URL
  useEffect(() => {
    const initialFilters = getInitialFilters();
    if (onFilterChange) {
      onFilterChange(initialFilters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with external filters when they change (from breadcrumb clicks)
  useEffect(() => {
    if (externalFilters && !isSearchUpdate.current) {
      setFilters(externalFilters);
      // Reload filter options when external filters change
      Object.keys(MASTER_TYPE_MAP).forEach(filterKey => {
        fetchFilterOptions(MASTER_TYPE_MAP[filterKey], filterKey);
      });
    }
    // Reset the search update flag
    isSearchUpdate.current = false;
  }, [externalFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    brand: [],
    make: [],
    model: [],
    variant: [],
    fuelType: [],
    year: [],
    category: [],
    subCategory: []
  });

  // Loading states
  const [loading, setLoading] = useState({
    brand: false,
    make: false,
    model: false,
    variant: false,
    fuelType: false,
    year: false,
    category: false,
    subCategory: false
  });

  // Expanded sections state (all open by default)
  const [expandedSections, setExpandedSections] = useState({
    make: true,
    model: true,
    variant: true,
    fuelType: true,
    year: true,
    category: true,
    subCategory: true
  });

  // Show more state
  const [showMore, setShowMore] = useState({
    brand: false,
    make: false,
    model: false,
    variant: false,
    fuelType: false,
    year: false,
    category: false,
    subCategory: false
  });

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    filterType: null,
    title: ''
  });

  // Fetch filter options from API
  const fetchFilterOptions = useCallback(async (masterType, filterKey, customFilters = null) => {
    setLoading(prev => ({ ...prev, [filterKey]: true }));

    try {
      // Use custom filters if provided, otherwise use current filters state
      const activeFilters = customFilters || filters;
      
      // When fetching options for a specific filter, don't use that filter's value in the request
      // This ensures all options remain visible even when one is selected
      const requestBody = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: "0046",
        aggregate: filterKey !== 'category' && activeFilters.category.length > 0 ? activeFilters.category[0] : null,
        brand: filterKey !== 'brand' && activeFilters.brand.length > 0 ? activeFilters.brand[0] : null,
        fuelType: filterKey !== 'fuelType' && activeFilters.fuelType.length > 0 ? activeFilters.fuelType[0] : null,
        limit: 0,
        make: filterKey !== 'make' && activeFilters.make.length > 0 ? activeFilters.make[0] : null,
        masterType: masterType,
        model: filterKey !== 'model' && activeFilters.model.length > 0 ? activeFilters.model[0] : null,
        offset: 0,
        primary: false,
        subAggregate: filterKey !== 'subCategory' && activeFilters.subCategory.length > 0 ? activeFilters.subCategory[0] : null,
        variant: filterKey !== 'variant' && activeFilters.variant.length > 0 ? activeFilters.variant[0] : null,
        year: filterKey !== 'year' && activeFilters.year.length > 0 ? activeFilters.year[0] : null
      };

      console.log(`Fetching ${filterKey} with masterType: ${masterType}`, requestBody);

      const response = await axios.post(`${API_BASE_URL}/matertype`, requestBody);

      if (response.data.success) {
        let options = response.data.data.map(item => item.masterName);
        
        // Ensure currently selected filter value is included in options
        if (filters[filterKey]?.length > 0) {
          const selectedValue = filters[filterKey][0];
          if (!options.includes(selectedValue)) {
            options = [selectedValue, ...options];
            console.log(`Added selected ${filterKey} to options:`, selectedValue);
          }
        }
        
        console.log(`${filterKey} options:`, options.length, 'items');
        setFilterOptions(prev => ({ ...prev, [filterKey]: options }));
      }
    } catch (error) {
      console.error(`Error fetching ${filterKey}:`, error);
      setFilterOptions(prev => ({ ...prev, [filterKey]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [filterKey]: false }));
    }
  }, [filters]);

  // Load ALL filter options on initial mount (no cascading)
  useEffect(() => {
    console.log('Loading ALL filter options...');
    fetchFilterOptions(MASTER_TYPE_MAP.brand, 'brand');
    fetchFilterOptions(MASTER_TYPE_MAP.make, 'make');
    fetchFilterOptions(MASTER_TYPE_MAP.model, 'model');
    fetchFilterOptions(MASTER_TYPE_MAP.variant, 'variant');
    fetchFilterOptions(MASTER_TYPE_MAP.fuelType, 'fuelType');
    fetchFilterOptions(MASTER_TYPE_MAP.year, 'year');
    fetchFilterOptions(MASTER_TYPE_MAP.category, 'category');
    fetchFilterOptions(MASTER_TYPE_MAP.subCategory, 'subCategory');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search parameter from URL - match against all filter options
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    
    // Reset processed term if no search
    if (!searchTerm) {
      processedSearchTerm.current = null;
      return;
    }

    // Skip if we've already processed this search term
    if (processedSearchTerm.current === searchTerm) {
      return;
    }

    // Check if we have any options loaded
    const hasAnyOptions = Object.values(filterOptions).some(options => options && options.length > 0);
    
    // If no options loaded yet, mark that we need to wait
    if (!hasAnyOptions) {
      hasInitialOptionsLoaded.current = false;
      return;
    }

    // If this is the first time we have options, mark it
    if (!hasInitialOptionsLoaded.current) {
      hasInitialOptionsLoaded.current = true;
    }

    console.log('Search term detected:', searchTerm);

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    let matched = false;
    const newFilters = {
      brand: [],
      make: [],
      model: [],
      variant: [],
      fuelType: [],
      year: [],
      category: [],
      subCategory: [],
      price: { min: 0, max: 10000 }
    };

    // Search through all filter options for a match
    const filterKeys = ['brand', 'make', 'model', 'variant', 'fuelType', 'year', 'category', 'subCategory'];
    
    for (const filterKey of filterKeys) {
      const options = filterOptions[filterKey] || [];
      
      // Skip if no options loaded yet
      if (options.length === 0) continue;
      
      // First try exact match (case-insensitive)
      let matchedOption = options.find(option => {
        if (!option) return false;
        return String(option).toLowerCase().trim() === lowerSearchTerm;
      });
      
      // If exact match found, apply immediately
      if (matchedOption) {
        newFilters[filterKey] = [matchedOption];
        matched = true;
        console.log(`Exact match found for "${searchTerm}" in ${filterKey}: ${matchedOption}`);
        
        // Mark this search term as processed BEFORE updating state
        processedSearchTerm.current = searchTerm;
        
        // Set flag to prevent cascading reload
        isSearchUpdate.current = true;
        
        setFilters(newFilters);
        
        // Use setTimeout to ensure parent update happens after this effect completes
        setTimeout(() => {
          if (onFilterChange) {
            onFilterChange(newFilters);
          }
          console.log('Filters updated from search (exact match):', newFilters);
          
          // After search filter is applied, reload OTHER filter options based on this selection
          // Pass newFilters explicitly so API calls use the updated filter values
          setTimeout(() => {
            isSearchUpdate.current = false; // Allow normal cascading now
            console.log('Reloading all filters with search selection:', filterKey, matchedOption);
            Object.keys(MASTER_TYPE_MAP).forEach(key => {
              if (key !== filterKey) { // Don't reload the filter we just selected
                fetchFilterOptions(MASTER_TYPE_MAP[key], key, newFilters);
              }
            });
          }, 100);
        }, 0);
        
        return; // Stop immediately, don't continue searching
      }
    }

    // If no exact match found, try "starts with" match
    if (!matched) {
      for (const filterKey of filterKeys) {
        const options = filterOptions[filterKey] || [];
        
        // Skip if no options loaded yet
        if (options.length === 0) continue;
        
        const matchedOption = options.find(option => {
          if (!option) return false;
          return String(option).toLowerCase().trim().startsWith(lowerSearchTerm);
        });

        if (matchedOption) {
          newFilters[filterKey] = [matchedOption];
          matched = true;
          console.log(`Partial match found for "${searchTerm}" in ${filterKey}: ${matchedOption}`);
          break;
        }
      }

      if (matched) {
        // Mark this search term as processed BEFORE updating state
        processedSearchTerm.current = searchTerm;
        
        // Set flag to prevent cascading reload
        isSearchUpdate.current = true;
        
        setFilters(newFilters);
        
        // Use setTimeout to ensure parent update happens after this effect completes
        setTimeout(() => {
          if (onFilterChange) {
            onFilterChange(newFilters);
          }
          console.log('Filters updated from search (partial match):', newFilters);
          
          // After search filter is applied, reload OTHER filter options based on this selection
          // Pass newFilters explicitly so API calls use the updated filter values
          const matchedFilterKey = filterKeys.find(key => newFilters[key].length > 0);
          setTimeout(() => {
            isSearchUpdate.current = false; // Allow normal cascading now
            console.log('Reloading all filters with search selection:', matchedFilterKey);
            Object.keys(MASTER_TYPE_MAP).forEach(key => {
              if (key !== matchedFilterKey) { // Don't reload the filter we just selected
                fetchFilterOptions(MASTER_TYPE_MAP[key], key, newFilters);
              }
            });
          }, 100);
        }, 0);
      } else {
        console.log('No match found for search term:', searchTerm);
      }
    }
  }, [searchParams, filterOptions, onFilterChange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generic toggle filter handler with cross-filter cascading
  const toggleFilter = (type, value) => {
    console.log('🎯 toggleFilter called:', type, value);
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Single select toggle
      newFilters[type] = newFilters[type].includes(value) ? [] : [value];
      
      console.log('📝 New filters after toggle:', JSON.stringify(newFilters, null, 2));
      
      // Notify parent component about filter change
      if (onFilterChange) {
        console.log('📢 Calling parent onFilterChange...');
        onFilterChange(newFilters);
      } else {
        console.error('❌ onFilterChange callback is not defined!');
      }
      
      // Immediately reload ALL OTHER filters with the new filter state
      console.log(`Filter ${type} changed, reloading all other filters...`);
      
      setTimeout(() => {
        Object.keys(MASTER_TYPE_MAP).forEach(filterKey => {
          // Reload all filters (including the one that changed) with updated context
          fetchFilterOptions(MASTER_TYPE_MAP[filterKey], filterKey, newFilters);
        });
      }, 0);
      
      return newFilters;
    });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle show more
  const toggleShowMore = (section) => {
    setShowMore(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Open modal for filter
  const openFilterModal = (filterType) => {
    const filterConfig = FILTER_CONFIG.find(f => f.key === filterType);
    setModalState({
      isOpen: true,
      filterType: filterType,
      title: filterConfig ? filterConfig.title : filterType
    });
  };

  // Close modal
  const closeFilterModal = () => {
    setModalState({
      isOpen: false,
      filterType: null,
      title: ''
    });
  };

  // Handle price change
  const handlePriceChange = (e) => {
    setFilters(prev => ({
      ...prev,
      price: { ...prev.price, max: parseInt(e.target.value) }
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    // Reset all filters to empty state
    const clearedFilters = {
      brand: [],
      make: [],
      model: [],
      variant: [],
      fuelType: [],
      year: [],
      category: [],
      subCategory: [],
      price: { min: 0, max: 10000 }
    };
    
    setFilters(clearedFilters);

    // Notify parent component about cleared filters
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }

    // Reload all filter options with no filters applied (pass clearedFilters explicitly)
    console.log('Clearing all filters and reloading data...');
    setTimeout(() => {
      Object.keys(MASTER_TYPE_MAP).forEach(filterKey => {
        fetchFilterOptions(MASTER_TYPE_MAP[filterKey], filterKey, clearedFilters);
      });
    }, 0);
  };

  return (
    <div className="pro-filter-container">
      {/* Filter Modal */}
      <FilterModal
        isOpen={modalState.isOpen}
        onClose={closeFilterModal}
        title={modalState.title}
        options={filterOptions[modalState.filterType] || []}
        selected={filters[modalState.filterType] || []}
        onSelect={toggleFilter}
        filterType={modalState.filterType}
      />

      <div className="filter-header">
        <h2>Filters</h2>
        <img 
          src={ClearIcon} 
          alt="Clear" 
          className="filter-clear-icon" 
          onClick={handleClearFilters}
        />
        <img src={EditIcon} alt="Edit" className="filter-edit-icon" />
      </div>

      {/* Brand Section - Always Open */}
      <div className="filter-section categories-section">
        <h3 className="categories-title">Brand</h3>
        {loading.brand ? (
          <div className="filter-loading">Loading brands...</div>
        ) : (
          <>
            <div className="categories-list">
              {(() => {
                // Sort brands: selected first, then unselected
                const sortedBrands = [...filterOptions.brand].sort((a, b) => {
                  const aSelected = filters.brand.includes(a);
                  const bSelected = filters.brand.includes(b);
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  return 0;
                });
                const visibleBrands = showMore.brand ? sortedBrands : sortedBrands.slice(0, 5);
                return visibleBrands.map((brand, index) => (
                  <div key={index} className="filter-option">
                    <input 
                      type="checkbox" 
                      id={`brand-${index}`}
                      checked={filters.brand.includes(brand)}
                      onChange={() => toggleFilter('brand', brand)}
                    />
                    <label htmlFor={`brand-${index}`}>{brand}</label>
                  </div>
                ));
              })()}
            </div>
            {filterOptions.brand.length > 5 && (
              <button 
                className="show-more-btn"
                onClick={() => openFilterModal('brand')}
              >
                {`Show More (${filterOptions.brand.length})`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Dynamic Expandable Filter Sections */}
      {FILTER_CONFIG.map(({ key, title }) => (
        <FilterSection
          key={key}
          title={title}
          type={key}
          options={filterOptions[key]}
          selected={filters[key]}
          expanded={expandedSections[key]}
          onToggleExpand={() => toggleSection(key)}
          onToggleFilter={toggleFilter}
          showMore={showMore[key]}
          onToggleShowMore={() => toggleShowMore(key)}
          onShowModal={openFilterModal}
          loading={loading[key]}
        />
      ))}

      {/* Price Section */}
      <div className="filter-section price-section">
        <h3 className="price-title">Price</h3>
        <div className="price-slider">
          <input 
            type="range" 
            min="0" 
            max="100000" 
            value={filters.price.max}
            onChange={handlePriceChange}
            className="price-range-input"
            style={{
              background: `linear-gradient(
                to right,
                #1976d2 0%,
                #1976d2 ${(filters.price.max / 100000) * 100}%,
                #e0e0e0 ${(filters.price.max / 100000) * 100}%,
                #e0e0e0 100%
              )`
            }}
          />
        </div>
        <div className="price-inputs">
          <div className="price-input-group">
            <select className="price-select">
              <option value="0">Min</option>
              <option value="1000">₹1,000</option>
              <option value="5000">₹5,000</option>
              <option value="10000">₹10,000</option>
            </select>
          </div>
          <span className="price-separator">to</span>
          <div className="price-input-group">
            <select className="price-select" value={filters.price.max}>
              <option value="10000">₹10000</option>
              <option value="25000">₹25,000</option>
              <option value="50000">₹50,000</option>
              <option value="100000">₹100,000</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProFilter;
