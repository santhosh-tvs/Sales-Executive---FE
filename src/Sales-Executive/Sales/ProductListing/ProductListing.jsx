import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../../../services/apiservice';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Get filters from URL - support both Categories and Brands navigation
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const brand = searchParams.get('brand');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category, subcategory, brand]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        limit: 5000,
        offset: 0,
        sortOrder: "ASC",
        customerCode: "0046",
        brand: brand || null,
        partNumber: null,
        aggregate: category || null,
        subAggregate: subcategory || null,
        make: null,
        model: null,
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      };

      console.log('Fetching products with filters:', requestBody);

      const response = await apiService.post("/getparts", requestBody);
      const productsData = response.data || [];

      console.log('Products fetched:', productsData);

      setProducts(productsData);
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

  return (
    <div className="product-listing-page">
      <Header />
      <div className="product-listing-container">
        <PageNavigate />
        
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
                    <p className="product-part-number">Part #: {product.partNumber || 'N/A'}</p>
                    <p className="product-brand">Brand: {product.brandName || 'N/A'}</p>
                    {product.mrp && <p className="product-price">₹{product.mrp}</p>}
                  </div>
                  <button className="add-to-cart-btn">Add to Cart</button>
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
