import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { partsListAPI } from '../../../services/api';
import { useCart } from '../../../Context/CartContext';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { addToCart, removeFromCart, cartItems } = useCart();
  
  // Get filters from URL - support both Categories and Brands navigation
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const brand = searchParams.get('brand');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [undoTimers, setUndoTimers] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [category, subcategory, brand]);

  // Debug: Monitor cart changes
  useEffect(() => {
    console.log('🛒 Cart items updated:', cartItems);
    console.log('📊 Cart count:', cartItems.length);
  }, [cartItems]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        brandPriority: null,
        limit: 5000,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
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

      console.log('Fetching products with filters:', requestBody);

      const response = await partsListAPI(requestBody);
      
      if (response && response.success && response.data) {
        const productsData = response.data || [];
        console.log('Products fetched:', productsData);
        console.log('Total count:', response.count);
        setProducts(productsData);
      } else {
        console.warn('No response data from partsListAPI');
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

  const getPageTitle = () => {
    if (brand) return `${brand} Products`;
    if (category && subcategory) return `${category} - ${subcategory}`;
    if (category) return category;
    return 'All Products';
  };

  const handleAddToCart = (product) => {
    const partNumber = product.partNumber;
    
    console.log('🛒 Add to Cart clicked for:', partNumber);
    console.log('📦 Product data:', product);
    
    // Prepare product data for cart
    const cartProduct = {
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

    console.log('✅ Adding to cart:', cartProduct);
    addToCart(cartProduct);

    // Show "Added" feedback
    setAddedToCart(prev => ({ ...prev, [partNumber]: true }));
    
    // Clear any existing timer
    if (undoTimers[partNumber]) {
      clearTimeout(undoTimers[partNumber]);
    }
    
    // Reset to normal after 2 seconds
    const timer = setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
      setUndoTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[partNumber];
        return newTimers;
      });
    }, 2000);
    
    setUndoTimers(prev => ({ ...prev, [partNumber]: timer }));
  };

  const handleUndo = (partNumber) => {
    // Remove from cart
    removeFromCart(partNumber);
    
    // Clear the timer
    if (undoTimers[partNumber]) {
      clearTimeout(undoTimers[partNumber]);
    }
    
    // Hide the undo message
    setAddedToCart(prev => ({ ...prev, [partNumber]: false }));
    setUndoTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[partNumber];
      return newTimers;
    });
  };

  // Cleanup timers on unmount
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

  return (
    <div className="product-listing-page">
      <Header />
      <div className="product-listing-container">
        <div className="header-row">
          <PageNavigate />
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search Products"
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        <div className="product-listing-content">
          <h2 className="product-listing-heading">{getPageTitle()}</h2>
          
          {loading ? (
            <div className="loading-message">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products-message">
              <p>No products found for the selected filters.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="product-image-container">
                    <span className="product-placeholder">No Image</span>
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product.itemDescription || 'N/A'}</h3>
                    <p className="product-part-number">Part Number: {product.partNumber || 'N/A'}</p>
                    <p className="product-brand">Brand: {product.brandName || 'N/A'}</p>
                    {product.mrp && <p className="product-price">₹{product.mrp}</p>}
                  </div>
                  
                  <button 
                    className={`add-to-cart-btn ${addedToCart[product.partNumber] ? 'added' : ''} ${isInCart(product.partNumber) && !addedToCart[product.partNumber] ? 'in-cart' : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedToCart[product.partNumber] 
                      ? '✓ Added' 
                      : isInCart(product.partNumber)
                        ? `In Cart (${getCartQuantity(product.partNumber)})`
                        : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
