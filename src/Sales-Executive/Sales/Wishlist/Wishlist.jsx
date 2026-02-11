import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import { useWishlist } from "../../../Context/WishlistContext";
import PageNavigate from "../Cart/PageNavigate";
import { useCart } from "../../../Context/CartContext";
import "./Wishlist.css";

const Wishlist = () => {
    const navigate = useNavigate();
  
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();

  return (
    <>
      <Header />
      <div className="wishlist-container">
        <PageNavigate />

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <div className="empty-wishlist-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#f5f5f5"/>
              <path d="M60 35C50 35 45 40 45 50C45 65 60 75 60 75C60 75 75 65 75 50C75 40 70 35 60 35Z" stroke="#ccc" strokeWidth="3" fill="none"/>
            </svg>
          </div>
          <h2>Your Wishlist is empty</h2>
          <p>Please add products to proceed with your purchase</p>

          <button
            className="return-shop-btn"
            onClick={() => navigate("/brands")}
          >
            Return to Shop ↺
          </button>
        </div>
      ) : (
        <>
          <div className="wishlist-header-row">
            <h3>Wishlist</h3>
          </div>

          <table className="wishlist-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Product</th>
                <th style={{ width: "15%", textAlign: "center" }}>Price</th>
                <th style={{ width: "15%", textAlign: "center" }}>Subtotal</th>
                <th style={{ width: "15%", textAlign: "center" }}>Action</th>
                <th style={{ width: "10%", textAlign: "center" }}>
                  <button className="clear-all-btn" onClick={clearWishlist}>
                    Clear All
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {wishlistItems.map((product) => (
                <tr key={product.partNumber}>
                  <td className="product-info" onClick={() => navigate('/cart-summary')} style={{ cursor: 'pointer' }}>
                    <img
                      src={product.image || "https://via.placeholder.com/60"}
                      alt="product"
                      className="wishlist-product-img"
                    />
                    <span className="wishlist-title">
                      {product.itemDescription}
                    </span>
                  </td>

                  <td>₹{product.listPrice}</td>
                  <td>₹{product.listPrice}</td>

                  <td className="wishlist-actions">
                    <button
                      className={`wishlist-cart-btn ${
                        cartItems?.some(
                          (i) => i.partNumber === product.partNumber
                        )
                          ? "added"
                          : ""
                      }`}
                      disabled={cartItems?.some(
                        (i) => i.partNumber === product.partNumber
                      )}
                      onClick={() => {
                        if (
                          !cartItems.some(
                            (i) => i.partNumber === product.partNumber
                          )
                        ) {
                          addToCart(product); // <-- Only add to cart, DO NOT remove from wishlist
                        }
                      }}
                    >
                      {cartItems.some(
                        (i) => i.partNumber === product.partNumber
                      )
                        ? "Added"
                        : "Add to Cart"}
                    </button>
                  </td>

                  <td className="remove-col">
                    <button
                      className="remove-icon-btn"
                      onClick={() => removeFromWishlist(product.partNumber)}
                      aria-label="Remove from wishlist"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="wishlist-footer" onClick={() => navigate("/product")}>
            <button className="update-btn"> Update Wishlist</button>
          </div>
        </>
      )}
      </div>
    </>
  );
};

export default Wishlist;
