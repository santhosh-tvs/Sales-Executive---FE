import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { partsListAPI, stockListAPI } from '../../../services/api';
import { useCart } from '../../../Context/CartContext';
import { useWishlist } from '../../../Context/WishlistContext';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { addToCart, removeFromCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const brand = searchParams.get('brand');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchProducts();
    loadCustomerWarehouses();
  }, [category, subcategory, brand]);

  useEffect(() => {
    if (products.length > 0) {
      fetchStockStatusForProducts();
    }
  }, [products, customerWarehouses]);

  const loadCustomerWarehouses = async () => {
    try {
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const warehouses = apiConfigManager.getCustomerWarehouses();
      setCustomerWarehouses(warehouses);
    } catch (error) {
      console.error('Error loading customer warehouses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const unitCode = apiConfigManager.getUnitCode();

      if (!unitCode) {
        setError('Please select a customer first.');
        setLoading(false);
        return;
      }

      const requestBody = {
        brandPriority: null,
        limit: 5000,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: unitCode,
        partNumber: null,
        model: null,
        brand: brand || null,
        subAggregate: subcategory || null,
        aggregate: category || null,
        make: null,
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      };

      const response = await partsListAPI(requestBody);

      if (response && response.success && response.data) {
        setProducts(response.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockStatusForProducts = async () => {
    try {
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const unitCode = apiConfigManager.getUnitCode();

      if (!unitCode) return;

      const stockPromises = products.map(async (product) => {
        const partNumber = product.partNumber;
        setLoadingStockStatus(prev => ({ ...prev, [partNumber]: true }));

        try {
          if (customerWarehouses.length > 0) {
            const allStockPromises = customerWarehouses.map(warehouseName => {
              const requestBody = {
                customerCode: unitCode,
                partNumber: partNumber,
                inventoryName: warehouseName,
                entity: null,
                software: null,
                limit: 100,
                offset: 0,
                sortOrder: "ASC",
                fieldOrder: "lotAgeDate"
              };
              return stockListAPI(requestBody);
            });

            const responses = await Promise.all(allStockPromises);
            let totalQty = 0;

            responses.forEach(response => {
              if (response && response.success && response.data) {
                response.data.forEach(stock => {
                  totalQty += parseInt(stock.qty) || 0;
                });
              }
            });

            return { partNumber, qty: totalQty, inStock: totalQty > 0 };
          } else {
            const requestBody = {
              customerCode: unitCode,
              partNumber: partNumber,
              inventoryName: null,
              entity: null,
              software: null,
              limit: 100,
              offset: 0,
              sortOrder: "ASC",
              fieldOrder: "lotAgeDate"
            };

            const response = await stockListAPI(requestBody);
            let totalQty = 0;

            if (response && response.success && response.data) {
              response.data.forEach(stock => {
                totalQty += parseInt(stock.qty) || 0;
              });
            }

            return { partNumber, qty: totalQty, inStock: totalQty > 0 };
          }
        } catch (error) {
          console.error(`Error fetching stock for ${partNumber}:`, error);
          return { partNumber, qty: 0, inStock: false };
        } finally {
          setLoadingStockStatus(prev => ({ ...prev, [partNumber]: false }));
        }
      });

      const stockResults = await Promise.all(stockPromises);
      const stockStatusMap = {};
      stockResults.forEach(result => {
        stockStatusMap[result.partNumber] = result;
      });

      setProductStockStatus(stockStatusMap);
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

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.itemDescription?.toLowerCase().includes(query) ||
        product.partNumber?.toLowerCase().includes(query) ||
        product.brandName?.toLowerCase().includes(query)
      );
    }

    if (filterStock !== 'all') {
      filtered = filtered.filter(product => {
        const stockInfo = productStockStatus[product.partNumber];
        if (filterStock === 'in-stock') {
          return stockInfo?.inStock === true;
        } else if (filterStock === 'out-of-stock') {
          return !stockInfo?.inStock;
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.itemDescription || '').localeCompare(b.itemDescription || '');
      } else if (sortBy === 'price-low') {
        return (parseFloat(a.mrp) || 0) - (parseFloat(b.mrp) || 0);
      } else if (sortBy === 'price-high') {
        return (parseFloat(b.mrp) || 0) - (parseFloat(a.mrp) || 0);
      }
      return 0;
    });

    return filtered;
  }, [products, searchQuery, filterStock, sortBy, productStockStatus]);

  const handleAddToCart = async (product) => {
    const partNumber = product.partNumber;
    const stockInfo = productStockStatus[partNumber];

    // Check if product is out of stock
    if (!stockInfo || !stockInfo.inStock) {
      // Out of stock - add to wishlist directly
      console.log('📦 Product out of stock, adding to wishlist:', partNumber);
      
      const wishlistProduct = {
        id: product.partNumber,
        partNumber: product.partNumber,
        itemDescription: product.itemDescription,
        brandName: product.brandName,
        price: parseFloat(product.mrp) || 0,
        mrp: product.mrp,
        listPrice: product.listPrice,
        hsnCode: product.hsnCode,
        taxpercent: product.taxpercent,
        aggregate: product.aggregate,
        subAggregate: product.subAggregate,
        imageUrl: null,
      };
      
      addToWishlist(wishlistProduct);
      
      // Show feedback
      setAddedToCart(prev => ({ ...prev, [partNumber]: true }));
      
      if (undoTimers[partNumber]) {
        clearTimeout(undoTimers[partNumber]);
      }
      
      const timer = setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
        setUndoTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[partNumber];
          return newTimers;
        });
      }, 2000);
      
      setUndoTimers(prev => ({ ...prev, [partNumber]: timer }));
      
      return;
    }

    // In stock - show warehouse popup
    console.log('✅ Product in stock, opening warehouse popup:', partNumber);
    setSelectedProduct(product);
    setShowWarehousePopup(true);
    await fetchWarehouseStock(product.partNumber);
  };

  const fetchWarehouseStock = async (partNumber) => {
    try {
      setLoadingStock(true);
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const unitCode = apiConfigManager.getUnitCode();

      if (!unitCode) {
        setLoadingStock(false);
        return;
      }

      if (customerWarehouses.length > 0) {
        const allStockPromises = customerWarehouses.map(warehouseName => {
          const requestBody = {
            customerCode: unitCode,
            partNumber: partNumber,
            inventoryName: warehouseName,
            entity: null,
            software: null,
            limit: 100,
            offset: 0,
            sortOrder: "ASC",
            fieldOrder: "lotAgeDate"
          };
          return stockListAPI(requestBody);
        });

        const responses = await Promise.all(allStockPromises);
        let combinedStock = [];
        responses.forEach(response => {
          if (response && response.success && response.data) {
            combinedStock = [...combinedStock, ...response.data];
          }
        });

        setWarehouseStock(combinedStock);
      } else {
        const requestBody = {
          customerCode: unitCode,
          partNumber: partNumber,
          inventoryName: null,
          entity: null,
          software: null,
          limit: 100,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: "lotAgeDate"
        };

        const response = await stockListAPI(requestBody);
        if (response && response.success && response.data) {
          setWarehouseStock(response.data);
        } else {
          setWarehouseStock([]);
        }
      }
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
    const cartProduct = {
      id: selectedProduct.partNumber,
      partNumber: selectedProduct.partNumber,
      itemDescription: selectedProduct.itemDescription,
      brandName: selectedProduct.brandName,
      price: parseFloat(selectedProduct.mrp) || 0,
      mrp: selectedProduct.mrp,
      listPrice: selectedProduct.listPrice,
      hsnCode: selectedProduct.hsnCode,
      taxpercent: selectedProduct.taxpercent,
      aggregate: selectedProduct.aggregate,
      subAggregate: selectedProduct.subAggregate,
      imageUrl: null,
      warehouse: selectedWarehouse.inventoryName,
      availableQty: selectedWarehouse.qty,
      unitCost: selectedWarehouse.unitCost,
      locator: selectedWarehouse.locator,
      entity: selectedWarehouse.entity,
      software: selectedWarehouse.software,
    };

    addToCart(cartProduct);
    setAddedToCart(prev => ({ ...prev, [partNumber]: true }));

    if (undoTimers[partNumber]) {
      clearTimeout(undoTimers[partNumber]);
    }

    const timer = setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
      setUndoTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[partNumber];
        return newTimers;
      });
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

  const isInCart = (partNumber) => {
    return cartItems.some(item => item.partNumber === partNumber || item.id === partNumber);
  };

  const getCartQuantity = (partNumber) => {
    const item = cartItems.find(item => item.partNumber === partNumber || item.id === partNumber);
    return item ? item.quantity : 0;
  };

  const handleWishlistToggle = (product) => {
    const partNumber = product.partNumber;
    if (isInWishlist(partNumber)) {
      removeFromWishlist(partNumber);
    } else {
      const wishlistProduct = {
        id: product.partNumber,
        partNumber: product.partNumber,
        itemDescription: product.itemDescription,
        brandName: product.brandName,
        price: parseFloat(product.mrp) || 0,
        mrp: product.mrp,
        listPrice: product.listPrice,
        hsnCode: product.hsnCode,
        taxpercent: product.taxpercent,
        aggregate: product.aggregate,
        subAggregate: product.subAggregate,
        imageUrl: null,
      };
      addToWishlist(wishlistProduct);
    }
  };

  const getStockBadge = (partNumber) => {
    if (loadingStockStatus[partNumber]) {
      return <span className="stock-badge loading">Checking...</span>;
    }

    const stockInfo = productStockStatus[partNumber];
    if (!stockInfo) {
      return <span className="stock-badge unknown">Stock Unknown</span>;
    }

    if (stockInfo.inStock) {
      return (
        <span className="stock-badge in-stock">
          <span className="stock-dot"></span>
          In Stock ({stockInfo.qty})
        </span>
      );
    } else {
      return (
        <span className="stock-badge out-of-stock">
          <span className="stock-dot"></span>
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="product-listing-page">
      <Header />
      <div className="product-listing-container">
        <div className="header-row">
          <PageNavigate />
          <div className="search-container">
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="product-listing-content">
          <div className="content-header">
            <div className="title-section">
              <h2 className="product-listing-heading">{getPageTitle()}</h2>
              <span className="product-count">{filteredAndSortedProducts.length} Products</span>
            </div>

            <div className="toolbar">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>

              <select className="filter-select" value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="no-products-message">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <p>No products found</p>
              <span>Try adjusting your filters or search query</span>
            </div>
          ) : (
            <div className={`product-${viewMode}`}>
              {filteredAndSortedProducts.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="product-image-container">
                    <button
                      className="wishlist-heart-btn"
                      onClick={() => handleWishlistToggle(product)}
                      aria-label={isInWishlist(product.partNumber) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isInWishlist(product.partNumber) ? "#ff4444" : "none"}
                        stroke={isInWishlist(product.partNumber) ? "#ff4444" : "#999"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    {getStockBadge(product.partNumber)}
                    <span className="product-placeholder">No Image</span>
                  </div>

                  <div className="product-details">
                    <h3 className="product-name" title={product.itemDescription}>
                      {product.itemDescription || 'N/A'}
                    </h3>
                    <p className="product-part-number">
                      <span className="label">Part:</span> {product.partNumber || 'N/A'}
                    </p>
                    <p className="product-brand">
                      <span className="label">Brand:</span> {product.brandName || 'N/A'}
                    </p>
                    {product.mrp && (
                      <div className="price-section">
                        <p className="product-price">₹{parseFloat(product.mrp).toLocaleString('en-IN')}</p>
                        {product.listPrice && product.listPrice !== product.mrp && (
                          <p className="product-list-price">₹{parseFloat(product.listPrice).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className={`add-to-cart-btn ${addedToCart[product.partNumber] ? 'added' : ''} ${
                      isInCart(product.partNumber) && !addedToCart[product.partNumber] ? 'in-cart' : ''
                    } ${!productStockStatus[product.partNumber]?.inStock ? 'out-of-stock-btn' : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedToCart[product.partNumber] ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {productStockStatus[product.partNumber]?.inStock ? 'Added to Cart' : 'Added to Wishlist'}
                      </>
                    ) : isInCart(product.partNumber) ? (
                      `In Cart (${getCartQuantity(product.partNumber)})`
                    ) : productStockStatus[product.partNumber]?.inStock ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        Add to Wishlist
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showWarehousePopup && (
        <div className="warehouse-popup-overlay" onClick={handleClosePopup}>
          <div className="warehouse-popup" onClick={(e) => e.stopPropagation()}>
            <div className="warehouse-popup-header">
              <h3>Select Warehouse</h3>
              <button className="close-btn" onClick={handleClosePopup}>×</button>
            </div>

            <div className="warehouse-popup-content">
              {selectedProduct && (
                <div className="product-info">
                  <p className="product-name-popup">{selectedProduct.itemDescription}</p>
                  <p className="product-part-popup">Part: {selectedProduct.partNumber}</p>
                </div>
              )}

              {loadingStock ? (
                <div className="loading-stock">
                  <div className="spinner"></div>
                  <p>Loading warehouse stock...</p>
                </div>
              ) : warehouseStock.length === 0 ? (
                <div className="no-stock">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <p>No stock available in any warehouse</p>
                </div>
              ) : (
                <div className="warehouse-list">
                  {warehouseStock.map((warehouse, index) => (
                    <div
                      key={index}
                      className={`warehouse-item ${
                        selectedWarehouse?.inventoryName === warehouse.inventoryName ? 'selected' : ''
                      }`}
                      onClick={() => handleWarehouseSelect(warehouse)}
                    >
                      <div className="warehouse-header">
                        <span className="warehouse-name">{warehouse.inventoryName}</span>
                        <span className="warehouse-qty">Qty: {warehouse.qty}</span>
                      </div>
                      <div className="warehouse-details">
                        <span className="warehouse-locator">Locator: {warehouse.locator}</span>
                        <span className="warehouse-price">₹{warehouse.unitCost}</span>
                      </div>
                      {warehouse.entity && (
                        <div className="warehouse-meta">
                          <span className="warehouse-entity">{warehouse.entity}</span>
                          {warehouse.software && <span className="warehouse-software">{warehouse.software}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="warehouse-popup-footer">
              <button className="cancel-btn" onClick={handleClosePopup}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmAddToCart} disabled={!selectedWarehouse}>
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
