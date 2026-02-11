import React from "react";
import "./CartDetails.css";
import { useCart } from "../../../Context/CartContext";
import { useNavigate } from "react-router-dom";

function CartDetails() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleIncrement = (id) => {
    const item = cartItems.find(item => item.id === id || item.partNumber === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrement = (id) => {
    const item = cartItems.find(item => item.id === id || item.partNumber === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeFromCart(id);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  return (
    <div className="cartdetails">
      <div className="cartdetails-frame">
        {/* If Cart is empty → show image + text */}
        {cartItems.length === 0 ? (
          <div className="empty-cart-wrapper">
            <div className="empty-cart-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="60" fill="#f5f5f5"/>
                <path d="M40 45L50 35L70 35L80 45L85 75L35 75L40 45Z" stroke="#ccc" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="85" r="5" fill="#ccc"/>
                <circle cx="70" cy="85" r="5" fill="#ccc"/>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Please add products to proceed with your purchase</p>

            <button
              className="return-shop-btn"
              onClick={() => navigate("/brands")}
            >
              Return to Shop
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="cartdetails-header">
              <div className="cartdetails-col-product">Product</div>
              <div className="cartdetails-col-price">Price</div>
              <div className="cartdetails-col-quantity">Quantity</div>
              <div className="cartdetails-col-subtotal">Subtotal</div>
              <div className="cartdetails-col-clear">
                <button
                  className="cartdetails-clearall-btn"
                  onClick={clearCart}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="cartdetails-body">
              {cartItems.map((item) => (
                <div key={item.partNumber} className="cartdetails-row">
                  {/* Product */}
                  <div className="cartdetails-product">
                    <img
                      src={item.imageUrl}
                      alt={item.itemDescription}
                      className="cartdetails-product-image"
                    />
                    <span className="cartdetails-product-name">
                      {item.itemDescription}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="cartdetails-price">
                    ₹{Number(item.listPrice).toFixed(2)}
                  </div>

                  {/* Quantity */}
                  <div className="cartdetails-quantity">
                    <div className="cartdetails-quantity-box">
                      <button
                        className="cartdetails-qty-btn"
                        onClick={() => handleDecrement(item.partNumber)}
                      >
                        −
                      </button>

                      <span className="cartdetails-qty-value">
                        {item.quantity}
                      </span>

                      <button
                        className="cartdetails-qty-btn"
                        onClick={() => handleIncrement(item.partNumber)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="cartdetails-subtotal">
                    ₹{(item.listPrice * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <div className="cartdetails-clear">
                    <button
                      className="cartdetails-remove-btn"
                      onClick={() => handleRemove(item.partNumber)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cartdetails-footer">
              <button
                type="button"
                className="cartdetails-update-btn"
                onClick={() => navigate("/product")}
              >
                UPDATE CART
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartDetails;
