import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { itemMasterAPI, stockCheckNewAPI, warehouseMappingAPI, partsListAPI, masterListAPI, clearStockCaches } from '../../../services/api';
import { useCart } from '../../../Context/CartContext';
import { useWishlist } from '../../../Context/WishlistContext';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import Spinner from '../../components/Spinner/Spinner';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { addToCart, removeFromCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const brand = searchParams.get('brand');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchRunRef = useRef(0);
  const [addedToCart, setAddedToCart] = useState({});
  const [undoTimers, setUndoTimers] = useState({});

  const [productStockStatus, setProductStockStatus] = useState({});
  const [loadingStockStatus, setLoadingStockStatus] = useState({});

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterStock, setFilterStock] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showWarehousePopup, setShowWarehousePopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [customerWarehouses, setCustomerWarehouses] = useState([]);
  const [mappedWarehouses, setMappedWarehouses] = useState([]);
  const [defaultWarehouse, setDefaultWarehouse] = useState(null);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({
    brand: true, make: true, model: false, variant: false,
    fuelType: false, year: false, category: true, subCategory: false,
  });

  // Selected filter values (single-select per field, array for API compat)
  const [filters, setFilters] = useState(() => ({
    brand:       brand       ? [brand]       : [],
    make:        [],
    model:       [],
    variant:     [],
    fuelType:    [],
    year:        [],
    category:    category    ? [category]    : [],
    subCategory: subcategory ? [subcategory] : [],
  }));

  // Filter options loaded from masterListAPI
  const [filterOptions, setFilterOptions] = useState({
    brand: [], make: [], model: [], variant: [],
    fuelType: [], year: [], category: [], subCategory: [],
  });
  const [filterLoading, setFilterLoading] = useState({
    brand: false, make: false, model: false, variant: false,
    fuelType: false, year: false, category: false, subCategory: false,
  });

  // masterType mapping
  const MASTER_TYPE_MAP = {
    brand: 'brand', make: 'make', model: 'model', variant: 'variant',
    fuelType: 'fuelType', year: 'year', category: 'aggregate', subCategory: 'subAggregate',
  };

  const FILTER_CONFIG = [
    { key: 'brand',       label: 'Brand' },
    { key: 'make',        label: 'Make' },
    { key: 'model',       label: 'Model' },
    { key: 'variant',     label: 'Variant' },
    { key: 'fuelType',    label: 'Fuel Type' },
    { key: 'year',        label: 'Year' },
    { key: 'category',    label: 'Category' },
    { key: 'subCategory', label: 'Sub-Category' },
  ];

  // Clear remembered warehouse when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setDefaultWarehouse(null);
    }
  }, [cartItems]);

  useEffect(() => {
    const initialF = {
      brand:       brand       ? [brand]       : [],
      make:        [],
      model:       [],
      variant:     [],
      fuelType:    [],
      year:        [],
      category:    category    ? [category]    : [],
      subCategory: subcategory ? [subcategory] : [],
    };
    // Flush stale cache from previous customer session
    clearStockCaches();
    // Load warehouses first, then fetch products so stock checks have correct warehouse codes
    loadWarehouseMapping().then(resolvedWarehouses => {
      fetchProducts(initialF, resolvedWarehouses);
    });
    loadAllFilterOptions(initialF);
  }, [category, subcategory, brand]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stock check is triggered directly after fetchProducts sets products

  // ─── Load warehouse list — returns resolved warehouse names for immediate use ──
  const loadWarehouseMapping = async () => {
    try {
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const customerDetails = apiConfigManager.getCustomerDetails();
      const customerCode = customerDetails?.customer_code;
      if (!customerCode) return [];

      // Always clear stale warehouse cache before fetching fresh data for this customer
      localStorage.removeItem('customer_warehouses');

      const response = await warehouseMappingAPI(customerCode);
      if (response && response.success && response.data && response.data.length > 0) {
        const LABELS = ['Primary', 'Secondary', 'Tertiary'];
        const labeled = response.data.map((item, index) => ({
          name: item.warehouse_name,
          label: index < 3 ? LABELS[index] : null,
          isCustomerWarehouse: index < 3,
        }));
        setMappedWarehouses(labeled);
        const allNames = labeled.map(w => w.name);
        setCustomerWarehouses(allNames);
        localStorage.setItem('customer_warehouses', JSON.stringify(allNames));
        return allNames;
      } else {
        // Fall back to customer's own warehouse fields
        const fallback = [
          customerDetails.primary_ware_house,
          customerDetails.secondary_ware_house,
          customerDetails.teritary_ware_house,
          customerDetails.warehouse?.warehouse_name,
        ].filter(Boolean);
        if (fallback.length > 0) {
          const labeled = fallback.map((name, index) => ({
            name,
            label: index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary',
            isCustomerWarehouse: true,
          }));
          setMappedWarehouses(labeled);
          setCustomerWarehouses(fallback);
          localStorage.setItem('customer_warehouses', JSON.stringify(fallback));
          return fallback;
        }
      }
    } catch (error) {
      console.error('Error loading warehouse mapping:', error);
    }
    return [];
  };

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  // ─── Load filter options from masterListAPI ───────────────────────────────
  const loadFilterOptions = useCallback(async (masterTypeKey, filterKey, currentFilters) => {
    setFilterLoading(prev => ({ ...prev, [filterKey]: true }));
    try {
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const unitCode = apiConfigManager.getUnitCode();
      if (!unitCode) return;

      const f = currentFilters || filters;
      const res = await masterListAPI({
        partNumber: null, sortOrder: 'ASC', customerCode: unitCode,
        limit: 0, offset: 0, primary: false,
        masterType: masterTypeKey,
        // Pass all OTHER active filters as context (not the one being loaded)
        brand:        filterKey !== 'brand'       && f.brand[0]       ? f.brand[0]       : null,
        make:         filterKey !== 'make'        && f.make[0]        ? f.make[0]        : null,
        model:        filterKey !== 'model'       && f.model[0]       ? f.model[0]       : null,
        variant:      filterKey !== 'variant'     && f.variant[0]     ? f.variant[0]     : null,
        fuelType:     filterKey !== 'fuelType'    && f.fuelType[0]    ? f.fuelType[0]    : null,
        year:         filterKey !== 'year'        && f.year[0]        ? f.year[0]        : null,
        aggregate:    filterKey !== 'category'    && f.category[0]    ? f.category[0]    : null,
        subAggregate: filterKey !== 'subCategory' && f.subCategory[0] ? f.subCategory[0] : null,
      });
      const options = (res?.data || []).map(i => i.masterName).filter(Boolean);
      setFilterOptions(prev => ({ ...prev, [filterKey]: options }));
    } catch (e) {
      console.error(`Error loading ${filterKey}:`, e);
    } finally {
      setFilterLoading(prev => ({ ...prev, [filterKey]: false }));
    }
  }, [filters]);

  const loadAllFilterOptions = (currentFilters) => {
    Object.entries(MASTER_TYPE_MAP).forEach(([filterKey, masterTypeKey]) => {
      loadFilterOptions(masterTypeKey, filterKey, currentFilters);
    });
  };

  // Toggle a filter value (single-select: selecting same value deselects)
  const toggleFilter = (filterKey, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      newFilters[filterKey] = prev[filterKey][0] === value ? [] : [value];
      console.log(`🎯 toggleFilter: ${filterKey}=${newFilters[filterKey][0] || 'cleared'}`, newFilters);
      // Fetch products and reload filter options with new filters
      setTimeout(() => {
        console.log(`⏱ setTimeout firing for ${filterKey}, calling fetchProducts`);
        fetchProducts(newFilters, customerWarehouses);
        loadAllFilterOptions(newFilters);
      }, 0);
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    const cleared = {
      brand: [], make: [], model: [], variant: [],
      fuelType: [], year: [], category: [], subCategory: [],
    };
    setFilters(cleared);
    setFilterSearch({});
    fetchProducts(cleared);
    loadAllFilterOptions(cleared);
  };

  const activeFilterCount = Object.values(filters).filter(v => v.length > 0).length;

  // ─── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = async (currentFilters, resolvedWarehouses = []) => {
    const f = currentFilters || filters;
    // Cancel any in-flight fetch by incrementing a run ID
    const runId = ++fetchRunRef.current;
    console.log(`🚀 fetchProducts START runId=${runId}`, {
      brand: f.brand[0] || null,
      make: f.make[0] || null,
      model: f.model[0] || null,
      category: f.category[0] || null,
      subCategory: f.subCategory[0] || null,
    });
    try {
      setLoading(true);
      setError(null);
      setProducts([]); // clear immediately so old results don't show

      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const unitCode = apiConfigManager.getUnitCode();

      if (!unitCode) {
        setError('Please select a customer first.');
        setLoading(false);
        return;
      }

      const requestBody = {
        brandPriority: null,
        limit: 200000,
        offset: 0,
        sortOrder: 'ASC',
        fieldOrder: null,
        customerCode: unitCode,
        partNumber: null,
        model:        f.model[0]       || null,
        brand:        f.brand[0]       || null,
        subAggregate: f.subCategory[0] || null,
        aggregate:    f.category[0]    || null,
        make:         f.make[0]        || null,
        variant:      f.variant[0]     || null,
        fuelType:     f.fuelType[0]    || null,
        vehicle: null,
        year:         f.year[0]        || null,
      };

      console.log(`📦 fetchProducts REQUEST runId=${runId}:`, requestBody);

      const response = await partsListAPI(requestBody);

      console.log(`📬 fetchProducts RESPONSE runId=${runId}, currentRef=${fetchRunRef.current}, count=${response?.data?.length}`);

      if (response && response.success && response.data) {
        const data = response.data || [];
        console.log(`✅ setProducts runId=${runId} count=${data.length} — ${runId === fetchRunRef.current ? 'APPLYING' : 'DISCARDING (stale)'}`);
        // Discard stale responses
        if (runId !== fetchRunRef.current) return;
        setProducts(data);
        // Trigger stock check directly after setting products — pass resolved warehouses
        if (data.length > 0) {
          setTimeout(() => fetchStockStatusForProducts(data, resolvedWarehouses), 0);
        }
      } else {
        if (runId !== fetchRunRef.current) return;
        setProducts([]);
      }
    } catch (error) {
      if (runId !== fetchRunRef.current) return;
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      if (runId === fetchRunRef.current) setLoading(false);
    }
  };

  // ─── Check stock per product in small batches ─────────────────────────────
  const fetchStockStatusForProducts = async (productList, resolvedWarehouses = []) => {
    const items = productList || products;
    try {
      // Priority: passed-in resolved warehouses → state → localStorage
      let warehouses = resolvedWarehouses.length > 0
        ? resolvedWarehouses
        : mappedWarehouses.map(w => w.name);
      if (warehouses.length === 0) {
        const stored = localStorage.getItem('customer_warehouses');
        if (stored) {
          try { warehouses = JSON.parse(stored); } catch { warehouses = []; }
        }
      }

      const BATCH_SIZE = 3;
      const BATCH_DELAY = 1500;

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);

        setLoadingStockStatus(prev => {
          const next = { ...prev };
          batch.forEach(p => { next[p.partNumber] = true; });
          return next;
        });

        const batchResults = await Promise.all(
          batch.map(async (product) => {
            const partNumber = product.partNumber;
            try {
              const itemData = await itemMasterAPI(partNumber);
              if (!itemData || itemData.length === 0) {
                return { partNumber, qty: 0, inStock: false, checked: true };
              }
              const inventoryItemId = String(itemData[0].inventoryItemId);
              const stockData = await stockCheckNewAPI(inventoryItemId, warehouses);
              // Sum available_to_reserve across all records — matches mobile spec (no lot_age_date filter)
              const totalQty = Array.isArray(stockData)
                ? stockData.reduce((sum, r) => sum + (parseInt(r.available_to_reserve || 0) || 0), 0)
                : 0;
              return { partNumber, qty: totalQty, inStock: totalQty > 0, inventoryItemId, checked: true };
            } catch {
              return { partNumber, qty: 0, inStock: false, checked: true };
            }
          })
        );

        setProductStockStatus(prev => {
          const next = { ...prev };
          batchResults.forEach(r => { next[r.partNumber] = r; });
          return next;
        });
        setLoadingStockStatus(prev => {
          const next = { ...prev };
          batch.forEach(p => { next[p.partNumber] = false; });
          return next;
        });

        if (i + BATCH_SIZE < items.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
    } catch (error) {
      console.error('Error fetching stock status:', error);
    }
  };

  const getPageTitle = () => {
    if (brand) return `${brand} Products`;
    if (category && subcategory) return `${category} - ${subcategory}`;
    if (category) return category;
    return 'All Products';
  };

  // ─── Filtered & sorted products (server-side filtered, client-side search/sort) ──
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.itemDescription?.toLowerCase().includes(q) ||
        p.partNumber?.toLowerCase().includes(q) ||
        p.brandName?.toLowerCase().includes(q)
      );
    }

    if (filterStock !== 'all') {
      filtered = filtered.filter(p => {
        const s = productStockStatus[p.partNumber];
        if (filterStock === 'in-stock') return s?.inStock === true;
        if (filterStock === 'out-of-stock') return !s?.inStock;
        return true;
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return (a.itemDescription || '').localeCompare(b.itemDescription || '');
      if (sortBy === 'price-low') return (parseFloat(a.mrp) || 0) - (parseFloat(b.mrp) || 0);
      if (sortBy === 'price-high') return (parseFloat(b.mrp) || 0) - (parseFloat(a.mrp) || 0);
      return 0;
    });
  }, [products, searchQuery, filterStock, sortBy, productStockStatus]);

  // ─── Cart handlers ────────────────────────────────────────────────────────
  const handleAddToCart = async (product) => {
    const partNumber = product.partNumber;
    const stockInfo = productStockStatus[partNumber];

    // If stock is confirmed in-stock AND we already have a default warehouse selected
    // in this session, skip the popup and add directly
    if (stockInfo && stockInfo.inStock && defaultWarehouse) {
      const cartProduct = {
        id: product.partNumber,
        partNumber: product.partNumber,
        itemDescription: product.itemDescription,
        brandName: product.brandName,
        price: parseFloat(product.mrp) || 0,
        mrp: product.mrp,
        listPrice: product.listPrice || product.mrp,   // fallback to mrp like mobile
        hsnCode: product.hsnCode,
        taxpercent: product.taxpercent || 28,
        aggregate: product.aggregate,
        subAggregate: product.subAggregate,
        imageUrl: null,
        warehouse: defaultWarehouse.inventoryName,
        availableQty: defaultWarehouse.qty,
        unitCost: defaultWarehouse.unitCost,
        locator: defaultWarehouse.locator,
        entity: defaultWarehouse.entity,
        software: defaultWarehouse.software,
        isBackOrder: parseInt(defaultWarehouse.qty) === 0,
      };
      addToCart(cartProduct);
      setAddedToCart(prev => ({ ...prev, [partNumber]: true }));
      if (undoTimers[partNumber]) clearTimeout(undoTimers[partNumber]);
      const t = setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
        setUndoTimers(prev => { const n = { ...prev }; delete n[partNumber]; return n; });
      }, 2000);
      setUndoTimers(prev => ({ ...prev, [partNumber]: t }));
      return;
    }

    // All other cases: show the warehouse popup so the user can pick a warehouse
    setSelectedProduct(product);
    setShowWarehousePopup(true);
    await fetchWarehouseStock(product.partNumber);
  };

  // ─── Fetch per-warehouse stock for popup ──────────────────────────────────
  const fetchWarehouseStock = async (partNumber) => {
    try {
      setLoadingStock(true);
      const LABELS = ['Primary', 'Secondary', 'Tertiary'];
      let warehousesToQuery = mappedWarehouses;

      if (warehousesToQuery.length === 0) {
        const { default: apiConfigManager } = await import('../../../services/apiConfig');
        const customerDetails = apiConfigManager.getCustomerDetails();
        const customerCode = customerDetails?.customer_code;
        if (customerCode) {
          const mappingRes = await warehouseMappingAPI(customerCode);
          if (mappingRes?.success && mappingRes.data?.length > 0) {
            warehousesToQuery = mappingRes.data.map((item, index) => ({
              name: item.warehouse_name,
              label: index < 3 ? LABELS[index] : null,
              isCustomerWarehouse: index < 3,
            }));
            setMappedWarehouses(warehousesToQuery);
            setCustomerWarehouses(warehousesToQuery.map(w => w.name));
          }
        }
      }

      const itemData = await itemMasterAPI(partNumber);
      if (!itemData || itemData.length === 0) {
        setWarehouseStock([]);
        setLoadingStock(false);
        return;
      }
      const inventoryItemId = String(itemData[0].inventoryItemId);
      const allWarehouseNames = warehousesToQuery.map(w => w.name);
      const stockData = await stockCheckNewAPI(inventoryItemId, allWarehouseNames);

      const combined = warehousesToQuery.map((wh) => {
        const whRecords = Array.isArray(stockData)
          ? stockData.filter(r => {
              const orgCode = (
                r.organization_code ||
                r.inventoryName ||
                r.warehouse ||
                r.subinventory ||
                r.organization ||
                ''
              ).toLowerCase();
              return orgCode === wh.name.toLowerCase() || orgCode.includes(wh.name.toLowerCase());
            })
          : [];
        // Sum available_to_reserve — matches mobile spec (no lot_age_date filter)
        const totalQty = whRecords.reduce(
          (sum, r) => sum + (parseInt(r.available_to_reserve || 0) || 0),
          0
        );
        const firstRecord = whRecords[0] || {};
        return {
          inventoryName: wh.name,
          qty: totalQty,
          unitCost: firstRecord.lot_list_price || firstRecord.unitCost || firstRecord.unit_cost || null,
          locator: firstRecord.locator_id || firstRecord.locator || null,
          entity: firstRecord.entity || null,
          software: firstRecord.software || null,
        };
      });

      // Always show the warehouse list — even if all qty = 0.
      // The user will see Back Order tags and must confirm by clicking "Add to Cart".
      setWarehouseStock(combined);
    } catch (error) {
      console.error('Error fetching warehouse stock:', error);
      setWarehouseStock([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct || !selectedWarehouse) {
      alert('Please select a warehouse');
      return;
    }

    const partNumber = selectedProduct.partNumber;
    const hasStock = parseInt(selectedWarehouse.qty) > 0;

    const cartProduct = {
      id: selectedProduct.partNumber,
      partNumber: selectedProduct.partNumber,
      itemDescription: selectedProduct.itemDescription,
      brandName: selectedProduct.brandName,
      price: parseFloat(selectedProduct.mrp) || 0,
      mrp: selectedProduct.mrp,
      listPrice: selectedProduct.listPrice || selectedProduct.mrp,   // fallback to mrp like mobile
      hsnCode: selectedProduct.hsnCode,
      taxpercent: selectedProduct.taxpercent || 28,
      aggregate: selectedProduct.aggregate,
      subAggregate: selectedProduct.subAggregate,
      imageUrl: null,
      warehouse: selectedWarehouse.inventoryName,
      availableQty: selectedWarehouse.qty,
      unitCost: selectedWarehouse.unitCost,
      locator: selectedWarehouse.locator,
      entity: selectedWarehouse.entity,
      software: selectedWarehouse.software,
      isBackOrder: !hasStock,
    };

    addToCart(cartProduct);
    setAddedToCart(prev => ({ ...prev, [partNumber]: true }));
    setDefaultWarehouse(selectedWarehouse);

    if (undoTimers[partNumber]) clearTimeout(undoTimers[partNumber]);
    const timer = setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
      setUndoTimers(prev => { const n = { ...prev }; delete n[partNumber]; return n; });
    }, 2000);
    setUndoTimers(prev => ({ ...prev, [partNumber]: timer }));

    setShowWarehousePopup(false);
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setWarehouseStock([]);
  };

  const handleClosePopup = () => {
    setShowWarehousePopup(false);
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setWarehouseStock([]);
  };

  useEffect(() => {
    return () => {
      Object.values(undoTimers).forEach(timer => clearTimeout(timer));
    };
  }, [undoTimers]);

  const isInCart = (partNumber) => cartItems.some(item => item.partNumber === partNumber || item.id === partNumber);

  const getCartQuantity = (partNumber) => {
    const item = cartItems.find(item => item.partNumber === partNumber || item.id === partNumber);
    return item ? item.quantity : 0;
  };

  const handleWishlistToggle = (product) => {
    const partNumber = product.partNumber;
    if (isInWishlist(partNumber)) {
      removeFromWishlist(partNumber);
    } else {
      addToWishlist({
        id: product.partNumber,
        partNumber: product.partNumber,
        itemDescription: product.itemDescription,
        brandName: product.brandName,
        price: parseFloat(product.mrp) || 0,
        mrp: product.mrp,
        listPrice: product.listPrice || product.mrp,
        hsnCode: product.hsnCode,
        taxpercent: product.taxpercent || 28,
        aggregate: product.aggregate,
        subAggregate: product.subAggregate,
        imageUrl: null,
      });
    }
  };

  const getStockBadge = (partNumber) => {
    if (loadingStockStatus[partNumber]) {
      return <span className="stock-badge loading">Checking...</span>;
    }
    const stockInfo = productStockStatus[partNumber];
    if (!stockInfo || stockInfo.checked === false) {
      return <span className="stock-badge loading">Checking...</span>;
    }
    if (stockInfo.inStock) {
      return (
        <span className="stock-badge in-stock">
          <span className="stock-dot"></span>
          In Stock ({stockInfo.qty})
        </span>
      );
    }
    return (
      <span className="stock-badge out-of-stock">
        <span className="stock-dot"></span>
        Out of Stock
      </span>
    );
  };

  // ─── Helper: render a filter accordion group ─────────────────────────────
  const renderFilterGroup = (filterKey, label) => {
    const isOpen = expandedGroups[filterKey];
    const search = filterSearch[filterKey] || '';
    const selected = filters[filterKey] || [];
    const options = filterOptions[filterKey] || [];
    const isLoading = filterLoading[filterKey];
    const hasValue = selected.length > 0;

    const visible = options.filter(o =>
      String(o).toLowerCase().includes(search.toLowerCase())
    );

    // Sort: selected first
    const sorted = [...visible].sort((a, b) => {
      const aS = selected.includes(a) ? 1 : 0;
      const bS = selected.includes(b) ? 1 : 0;
      return bS - aS;
    });

    return (
      <div key={filterKey} className={`fg${isOpen ? ' fg-open' : ''}${hasValue ? ' fg-active' : ''}`}>
        <button className="fg-header" onClick={() => toggleGroup(filterKey)}>
          <span className="fg-label">
            {label}
            {hasValue && <span className="fg-chip">{selected[0]}</span>}
          </span>
          <span className="fg-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="fg-body">
            {isLoading ? (
              <div className="fg-loading">
                <div style={{ width: '100%' }}>
                  {[85, 70, 55, 80].map((w, i) => (
                    <div key={i} className={`skeleton fg-skeleton-opt`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {options.length > 6 && (
                  <div className="fg-search-wrap">
                    <input
                      className="fg-search"
                      placeholder={`Search ${label.toLowerCase()}...`}
                      value={search}
                      onChange={e => setFilterSearch(prev => ({ ...prev, [filterKey]: e.target.value }))}
                    />
                  </div>
                )}
                <div className="fg-options">
                  {hasValue && (
                    <button
                      className="fg-opt"
                      style={{ color: '#e53935', fontWeight: 600 }}
                      onClick={() => toggleFilter(filterKey, selected[0])}
                    >
                      Clear {label}
                    </button>
                  )}
                  {sorted.map(opt => {
                    const isSel = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        className={`fg-opt${isSel ? ' fg-opt-active' : ''}`}
                        onClick={() => toggleFilter(filterKey, opt)}
                        title={String(opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  {sorted.length === 0 && !isLoading && (
                    <p className="fg-empty">{search ? `No results for "${search}"` : 'No options'}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="product-listing-page">
      <Header />
      <div className="product-listing-container">
        {/* Header row */}
        <div className="header-row">
          <PageNavigate />
          <div className="search-container">
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="product-listing-content">
          <div className="content-header">
            <div className="title-section">
              <h2 className="product-listing-heading">{getPageTitle()}</h2>
              <span className="product-count">{filteredAndSortedProducts.length} products</span>
            </div>
            <div className="toolbar">
              {/* Filter toggle */}
              <button
                className={`filter-toggle-btn${activeFilterCount > 0 ? ' has-filters' : ''}`}
                onClick={() => setFilterSidebarOpen(prev => !prev)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filters
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>

              {/* View toggle */}
              <div className="view-toggle">
                <button className={`view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button className={`view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Sort */}
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">Name A–Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Stock filter */}
              <select className="filter-select" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Body: sidebar + product grid */}
          <div className="product-listing-body">
            {/* ── Filter Sidebar ── */}
            {filterSidebarOpen && (
              <aside className="filter-sidebar">
                <div className="filter-sidebar-header">
                  <span className="filter-sidebar-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </span>
                  {activeFilterCount > 0 && (
                    <button className="filter-clear-btn" onClick={handleClearFilters}>Clear All</button>
                  )}
                </div>
                <div className="filter-sidebar-body">
                  {FILTER_CONFIG.map(({ key, label }) =>
                    renderFilterGroup(key, label)
                  )}
                </div>
              </aside>
            )}

            {/* ── Product Area ── */}
            <div className="product-listing-main">
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="active-filters-bar">
                  {FILTER_CONFIG.map(({ key, label }) =>
                    filters[key]?.[0] ? (
                      <span key={key} className="active-filter-chip" onClick={() => toggleFilter(key, filters[key][0])}>
                        <span>{label}: {filters[key][0]}</span>
                        <span className="active-filter-chip-x">×</span>
                      </span>
                    ) : null
                  )}
                  <span className="clear-all-chip" onClick={handleClearFilters}>
                    Clear all ×
                  </span>
                </div>
              )}

              {loading ? (
                <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton skeleton-image" />
                      <div className="skeleton skeleton-line w-80" />
                      <div className="skeleton skeleton-line w-60" />
                      <div className="skeleton skeleton-line w-40 h-16" />
                      <div className="skeleton skeleton-line h-36" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="error-message">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="no-products-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <p>No products found</p>
                  <span>Try adjusting your filters or search query</span>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
                  {filteredAndSortedProducts.map(product => {
                    const partNumber = product.partNumber;
                    const inCart = isInCart(partNumber);
                    const wasAdded = addedToCart[partNumber];
                    const inWishlist = isInWishlist(partNumber);
                    const stockInfo = productStockStatus[partNumber];

                    return (
                      <div key={partNumber} className="product-card">
                        <div className="product-image-container">
                          {getStockBadge(partNumber)}
                          <button
                            className="wishlist-heart-btn"
                            onClick={() => handleWishlistToggle(product)}
                            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? '#e53935' : 'none'} stroke={inWishlist ? '#e53935' : '#9aa3b8'} strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <span className="product-placeholder">{product.brandName || 'PART'}</span>
                        </div>

                        <div className="product-details">
                          <p className="product-name">{product.itemDescription || 'Unknown Part'}</p>
                          <p className="product-part-number">
                            <span className="label">Part#</span> {partNumber}
                          </p>
                          {product.brandName && (
                            <p className="product-brand">
                              <span className="label">Brand</span> {product.brandName}
                            </p>
                          )}
                          <div className="price-section">
                            <p className="product-price">₹{parseFloat(product.mrp || 0).toFixed(2)}</p>
                            {product.listPrice && parseFloat(product.listPrice) !== parseFloat(product.mrp) && (
                              <p className="product-list-price">₹{parseFloat(product.listPrice).toFixed(2)}</p>
                            )}
                          </div>
                        </div>

                        <button
                          className={`add-to-cart-btn${wasAdded ? ' added' : inCart ? ' in-cart' : stockInfo && !stockInfo.inStock ? ' out-of-stock-btn' : ''}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {wasAdded ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Added
                            </>
                          ) : inCart ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                              </svg>
                              In Cart ({getCartQuantity(partNumber)})
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                              </svg>
                              {stockInfo && !stockInfo.inStock ? 'Back Order' : 'Add to Cart'}
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Warehouse Popup ── */}
      {showWarehousePopup && (
        <div className="warehouse-popup-overlay" onClick={handleClosePopup}>
          <div className="warehouse-popup" onClick={e => e.stopPropagation()}>
            <div className="warehouse-popup-header">
              <div>
                <p className="wh-popup-product-name">{selectedProduct?.itemDescription}</p>
                <p className="wh-popup-part">Part# {selectedProduct?.partNumber}</p>
              </div>
              <button className="close-btn" onClick={handleClosePopup}>×</button>
            </div>

            <div className="warehouse-popup-content">
              {loadingStock ? (
                <div className="loading-stock">
                  <div className="spinner" />
                  <span>Checking stock...</span>
                </div>
              ) : warehouseStock.length === 0 ? (
                <div className="wh-empty">No warehouse data available</div>
              ) : (
                <div className="warehouse-list">
                  {warehouseStock.map((wh, idx) => {
                    const isSelected = selectedWarehouse?.inventoryName === wh.inventoryName;
                    const isEmpty = parseInt(wh.qty) === 0;
                    const whMeta = mappedWarehouses.find(m => m.name === wh.inventoryName);
                    const tagLabels = ['primary', 'secondary', 'tertiary'];
                    return (
                      <div
                        key={wh.inventoryName}
                        className={`wh-row${isSelected ? ' wh-row-selected' : ''}${isEmpty ? ' wh-row-empty' : ''}`}
                        onClick={() => handleWarehouseSelect(wh)}
                      >
                        <div className="wh-row-left">
                          <span className="wh-row-name">{wh.inventoryName}</span>
                          {whMeta?.label && (
                            <span className={`wh-tag wh-tag-${tagLabels[idx] || 'tertiary'}`}>{whMeta.label}</span>
                          )}
                          {isEmpty && <span className="wh-backorder-tag">Back Order</span>}
                        </div>
                        <div className="wh-row-right">
                          {wh.unitCost && <span className="wh-row-price">₹{parseFloat(wh.unitCost).toFixed(2)}</span>}
                          <span className={`wh-row-qty${isEmpty ? ' wh-qty-zero' : ''}`}>
                            {isEmpty ? '0' : wh.qty} units
                          </span>
                          {isSelected && <span className="wh-check">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="warehouse-popup-footer">
              <button className="cancel-btn" onClick={handleClosePopup}>Cancel</button>
              <button
                className="confirm-btn"
                onClick={handleConfirmAddToCart}
                disabled={!selectedWarehouse}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;