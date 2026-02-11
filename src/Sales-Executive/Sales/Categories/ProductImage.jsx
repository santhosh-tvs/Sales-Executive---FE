import React, { useState } from 'react';

const ProductImage = ({ partNumber, folder = 'product', alt = 'Product' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Placeholder image - you can replace with your own
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Construct image path - adjust based on your image storage structure
  const imagePath = imageError 
    ? placeholderImage 
    : `/images/${folder}/${partNumber}.jpg`;

  return (
    <div className="product-image-wrapper">
      {!imageLoaded && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
      <img
        src={imagePath}
        alt={alt || partNumber}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: imageLoaded ? 'block' : 'none' }}
        className="product-image"
      />
    </div>
  );
};

export default ProductImage;
