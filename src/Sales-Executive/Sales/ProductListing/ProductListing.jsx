import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import './ProductListing.css';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch products based on make and model
    // This is a placeholder - implement actual API call
    console.log('Fetching products for:', { make, model });
  }, [make, model]);

  return (
    <div className="product-listing-page">
      <Header />
      <div className="product-listing-container">
        <PageNavigate />
        
        <div className="product-listing-content">
          <h2 className="product-listing-heading">
            Products for {make} - {model}
          </h2>
          
          <div className="product-grid">
            <div className="placeholder-message">
              <p>Product listing page - Coming soon</p>
              <p>Make: {make}</p>
              <p>Model: {model}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
