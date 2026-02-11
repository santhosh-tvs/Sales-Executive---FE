import React, { useState } from 'react';
import '../../../styles/customer/productss/pro_product.css';
import favoriteIcon from '../../../assets/customer/product/pro_product/favorite.png';
import redFavIcon from '../../../assets/customer/product/pro_product/red_fav.png';
import noImage from '../../../assets/customer/product/pro_product/No Image.png';

const ProProduct = ({ 
  productImage, 
  brand, 
  inStock = true, 
  eta = "1-2 Days", 
  productName, 
  price, 
  originalPrice,
  isInWishlist = false
}) => {
  const [isFavorite, setIsFavorite] = useState(isInWishlist);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Wishlist toggle (UI only)
  const handleFavoriteClick = () => {
    setIsFavorite(prev => !prev);
  };

  // Add to Cart toggle
  const handleAddToCart = () => {
    setIsAddedToCart(prev => !prev);
  };

  const truncateText = (text, maxLength = 25) =>
    text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  return (
    <div className="pro-product-container">

      {/* IMAGE SECTION */}
      <div className="pro-product-image-wrapper">
        <div className="pro-product-image-inner">
          <img
            src={productImage || noImage}
            alt={productName}
            className="pro-product-image"
          />
        </div>

        <button
          className="pro-favorite-btn"
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <img
            src={isFavorite ? redFavIcon : favoriteIcon}
            alt="Favorite"
            className="pro-favorite-icon"
          />
        </button>
      </div>

      {/* INFO SECTION */}
      <div className="pro-product-info">

        <div className="pro-product-tags">
          <span 
            className="pro-brand-tag"
            title={brand}
            onClick={() => alert(brand)}
          >
            {truncateText(brand, 15)}
          </span>

          <span 
            className={`pro-stock-tag ${inStock ? 'in-stock' : 'out-of-stock'}`}
            title={inStock ? 'In Stock' : 'Out of Stock'}
            onClick={() => alert(inStock ? 'In Stock' : 'Out of Stock')}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>

          <span 
            className="pro-eta-tag"
            title={eta}
            onClick={() => alert(eta)}
          >
            {truncateText(eta, 10)}
          </span>
        </div>

        <h3 
          className="pro-product-name"
          title={productName}
          onClick={() => alert(productName)}
        >
          {truncateText(productName, 30)}
        </h3>

        <div className="pro-product-price">
          <span className="pro-current-price">₹{price}</span>
          {originalPrice && originalPrice !== price && (
            <span className="pro-original-price">₹{originalPrice}</span>
          )}
        </div>

        <button
          className={`pro-add-to-cart-btn ${isAddedToCart ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          {isAddedToCart ? 'Added' : 'Add to Cart'}
        </button>

      </div>
    </div>
  );
};

export default ProProduct;
