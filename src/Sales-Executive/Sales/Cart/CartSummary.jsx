import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/customer/cart/CartSummary.css';
import Header from '../header/Header';
import PageNavigate from './PageNavigate';
import van from '../../../assets/customer/cart/van 1.png';
import like from '../../../assets/customer/cart/like.png';
import MyTVS from '../../../assets/customer/cart/MyTVS.png';
import compare from '../../../assets/customer/cart/Compare.png';
import copy from '../../../assets/customer/cart/Copy.png';
import whatsapp from '../../../assets/customer/cart/whatsapp.png';
import heart from '../../../assets/customer/cart/Heart.png';

const CartSummary = () => {
  const [quantity, setQuantity] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Main product data
  const mainProduct = {
    brandName: 'Valeo',
    myTVSChoice: 'myTVS-Choice',
    productName: 'Zerex G05 Phosphate Free Antifreeze Coolant Concentrate 1',
    partNumber: 'AM28276373',
    availability: 'In Stock',
    description: 'Leather Steering Wheel Cover, Car Steering Wheel Cover, Anti-Slip Steering Wheel Cover, Steering Wheel Protective Cover, Heat-Resistant Steering Wheel Cover, Car Accessories Interior',
    currentPrice: 400.00,
    originalPrice: 600.00,
    deliveryTime: '1 - 2 Days',
    image: '/path-to-product-image.png' // Replace with actual image path
  };

  // Related products data
  const relatedProducts = [
    {
      id: 1,
      myTVSChoice: true,
      brandName: 'Valeo',
      inStock: true,
      deliveryTime: '1 - 2 Days',
      description: 'Zerex G05 Phosphate Free Antifreeze Coolant Concentrate 1',
      currentPrice: 400.00,
      originalPrice: 599.00,
      image: '/path-to-product-image.png'
    },
    {
      id: 2,
      myTVSChoice: true,
      brandName: 'Valeo',
      inStock: true,
      deliveryTime: '1 - 2 Days',
      description: 'Anya USA – 11163OA FORD F-150 15-17 FULL LED PRO-SERIES PLANK STYLE',
      currentPrice: 724.00,
      originalPrice: 850.00,
      image: '/path-to-product-image.png'
    },
    {
      id: 3,
      myTVSChoice: false,
      brandName: 'Valeo',
      inStock: true,
      deliveryTime: '1 - 2 Days',
      description: 'Spyder BMW E90 3-Series 06-08 4Dr Headlights - Halogen Model Only - Black PRO',
      currentPrice: 900.00,
      originalPrice: 1099.00,
      image: '/path-to-product-image.png'
    },
    {
      id: 4,
      myTVSChoice: false,
      brandName: 'Valeo',
      inStock: true,
      deliveryTime: '1 - 2 Days',
      description: 'Mobil 1 Advanced Fuel Economy Full Synthetic Motor Oil 0W-20, 5',
      currentPrice: 690.00,
      originalPrice: 720.00,
      image: '/path-to-product-image.png'
    },
    {
      id: 5,
      myTVSChoice: false,
      brandName: 'Valeo',
      inStock: true,
      deliveryTime: '1 - 2 Days',
      description: 'Mobil 1 Advanced Fuel Economy Full Synthetic Motor Oil 0W-20, 5',
      currentPrice: 690.00,
      originalPrice: 720.00,
      image: '/path-to-product-image.png'
    }
  ];

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlistItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    // Add your cart logic here
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this product: ${mainProduct.productName}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  return (
    <div className="cs-cart-summary-page">
      <Header />
      
      <div className="cs-cart-summary-container">
        <PageNavigate items={['Home', 'Cart', 'Cart Summary']} />

        {/* Product Details Section */}
        <h1 className="cs-product-details-header">Product Details</h1>

        <div className="cs-product-details-content">
          {/* Image Section */}
          <div className="cs-image-section">
            <div className="cs-brand-header">
              <span className="cs-brand-name">{mainProduct.brandName}</span>
              <div className="cs-mytvs-wrapper">
                <img src={MyTVS} alt="myTVS" width={53} height={17} />
                <span className="cs-choice-text">Choice</span>
              </div>
            </div>
            <div className="cs-product-image">
              <img src={mainProduct.image} alt="" />
            </div>
          </div>

          {/* Product Info Section */}
          <div className="cs-product-info">
            <h2 className="cs-product-name">{mainProduct.productName}</h2>
            
            <div className="cs-part-availability">
              <span className="cs-part-number">{mainProduct.partNumber}</span>
              <span className="cs-availability">
                Availability: <span className="cs-in-stock">{mainProduct.availability}</span>
              </span>
            </div>

            <p className="cs-description">{mainProduct.description}</p>

            <div className="cs-price-quantity-row">
              <div className="cs-price-section">
                <span className="cs-current-price">₹{mainProduct.currentPrice.toFixed(2)}</span>
                <span className="cs-original-price">₹{mainProduct.originalPrice.toFixed(2)}</span>
              </div>

              <div className="cs-quantity-box">
                <button onClick={() => handleQuantityChange('decrement')}>−</button>
                <span>{String(quantity).padStart(2, '0')}</span>
                <button onClick={() => handleQuantityChange('increment')}>+</button>
              </div>

              <div className="cs-delivery-info">
                <img src={van} alt="Delivery" />
                <span>{mainProduct.deliveryTime}</span>
              </div>
            </div>

            <div className="cs-actions-row">
              <button className="cs-action-btn">
                <img src={like} alt="Wishlist" />
                <span>Add to Wishlist</span>
              </button>
              <button className="cs-action-btn">
                <img src={compare} alt="Compare" />
                <span>Add to Compare</span>
              </button>
              <button className="cs-action-btn">
                <span>View Compatibility</span>
              </button>
              <div className="cs-share-section">
                <span>Share product:</span>
                <button onClick={handleCopyLink} className="cs-share-icon-btn">
                  <img src={copy} alt="Copy" />
                </button>
                <button onClick={handleWhatsAppShare} className="cs-share-icon-btn">
                  <img src={whatsapp} alt="WhatsApp" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <h2 className="cs-related-products-header">Related Products</h2>

        <div className="cs-related-products-grid">
          {relatedProducts.map((product) => (
            <div key={product.id} className="cs-related-product-item">
              <div className="cs-related-top-row">
                {product.myTVSChoice ? (
                  <div className="cs-mytvs-wrapper">
                    <img src={MyTVS} alt="myTVS" width={53} height={17} />
                    <span className="cs-choice-text">Choice</span>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  className={`cs-heart-btn ${wishlistItems.includes(product.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlistItems.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <img src={heart} alt="Wishlist" />
                </button>
              </div>

              <div className="cs-related-image-section">
                <img src={product.image} alt="" />
              </div>

              <div className="cs-related-info-row">
                <span className="cs-related-brand">{product.brandName}</span>
                {product.inStock && <span className="cs-related-stock">In Stock</span>}
                <span className="cs-related-delivery">{product.deliveryTime}</span>
              </div>

              <p className="cs-related-description">{product.description}</p>

              <div className="cs-related-price-section">
                <span className="cs-related-current-price">₹ {product.currentPrice.toFixed(2)}</span>
                <span className="cs-related-original-price">₹ {product.originalPrice.toFixed(2)}</span>
              </div>

              <button 
                className="cs-add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
