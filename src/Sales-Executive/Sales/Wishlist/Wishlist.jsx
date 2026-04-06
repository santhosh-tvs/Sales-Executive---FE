import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import { useWishlist } from "../../../Context/WishlistContext";
import PageNavigate from "../Cart/PageNavigate";
import { useCart } from "../../../Context/CartContext";
import { stockListAPI } from "../../../services/api";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const [showWarehousePopup, setShowWarehousePopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  const isInCart = (partNumber) =>
    cartItems.some((i) => i.partNumber === partNumber || i.id === partNumber);

  const handleAddToCart = async (product) => {
    if (product.isBackOrder) {
      addToCart(product);
      setAddingToCart((prev) => ({ ...prev, [product.partNumber]: true }));
      setTimeout(() => setAddingToCart((prev) => ({ ...prev, [product.partNumber]: false })), 1500);
      return;
    }

    setPopupProduct(product);
    setShowWarehousePopup(true);
    setLoadingStock(true);
    setWarehouseStock([]);
    setSelectedWarehouse(null);

    try {
      const { default: apiConfigManager } = await import("../../../services/apiConfig");
      const unitCode = apiConfigManager.getUnitCode();
      const warehouses = apiConfigManager.getCustomerWarehouses();

      if (warehouses.length > 0) {
        const responses = await Promise.all(
          warehouses.map((wh) =>
            stockListAPI({ customerCode: unitCode, partNumber: product.partNumber, inventoryName: wh, entity: null, software: null, limit: 100, offset: 0, sortOrder: "ASC", fieldOrder: "lotAgeDate" })
          )
        );
        let combined = [];
        responses.forEach((r) => { if (r?.success && r.data) combined = [...combined, ...r.data]; });
        setWarehouseStock(combined);
      } else {
        const r = await stockListAPI({ customerCode: unitCode, partNumber: product.partNumber, inventoryName: null, entity: null, software: null, limit: 100, offset: 0, sortOrder: "ASC", fieldOrder: "lotAgeDate" });
        setWarehouseStock(r?.success && r.data ? r.data : []);
      }
    } catch {
      setWarehouseStock([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!popupProduct || !selectedWarehouse) return;
    addToCart({
      ...popupProduct,
      warehouse: selectedWarehouse.inventoryName,
      availableQty: selectedWarehouse.qty,
      unitCost: selectedWarehouse.unitCost,
      isBackOrder: false,
    });
    setShowWarehousePopup(false);
    setPopupProduct(null);
    setSelectedWarehouse(null);
    setWarehouseStock([]);
  };

  const handleClosePopup = () => {
    setShowWarehousePopup(false);
    setPopupProduct(null);
    setSelectedWarehouse(null);
    setWarehouseStock([]);
  };

  return (
    <>
      <Header />
      <div className="wl-page">
        <div className="wl-inner">
          <PageNavigate />

          {wishlistItems.length === 0 ? (
            <div className="wl-empty-state">
              <div className="wl-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Save items you love and order them later</p>
              <button className="wl-shop-btn" onClick={() => navigate("/brands")}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* Header bar */}
              <div className="wl-topbar">
                <div className="wl-topbar-left">
                  <h2>Wishlist</h2>
                  <span className="wl-count">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="wl-topbar-right">
                  <button className="wl-cart-all-btn" onClick={() => navigate("/cart")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Go to Cart
                  </button>
                  <button className="wl-clear-btn" onClick={clearWishlist}>
                    Clear All
                  </button>
                </div>
              </div>

              {/* Cards grid */}
              <div className="wl-grid">
                {wishlistItems.map((product) => {
                  const inCart = isInCart(product.partNumber);
                  const justAdded = addingToCart[product.partNumber];
                  return (
                    <div key={product.partNumber} className="wl-card">
                      {/* Remove button */}
                      <button
                        className="wl-remove-btn"
                        onClick={() => removeFromWishlist(product.partNumber)}
                        title="Remove from wishlist"
                      >
                        ×
                      </button>

                      {/* Product image placeholder */}
                      <div className="wl-card-img">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>

                      {/* Info */}
                      <div className="wl-card-body">
                        <div className="wl-card-badge-row">
                          {product.isBackOrder ? (
                            <span className="wl-badge back-order">Back Order</span>
                          ) : (
                            <span className="wl-badge in-stock">In Stock</span>
                          )}
                        </div>
                        <h4 className="wl-card-name" title={product.itemDescription}>
                          {product.itemDescription || 'N/A'}
                        </h4>
                        <p className="wl-card-part">Part: {product.partNumber}</p>
                        {product.brandName && (
                          <p className="wl-card-brand">{product.brandName}</p>
                        )}
                        <div className="wl-card-price">
                          ₹{parseFloat(product.listPrice || product.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="wl-card-footer">
                        <button
                          className={`wl-add-cart-btn${inCart || justAdded ? ' added' : ''}`}
                          disabled={inCart}
                          onClick={() => handleAddToCart(product)}
                        >
                          {inCart ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              In Cart
                            </>
                          ) : justAdded ? (
                            'Added ✓'
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Warehouse popup */}
      {showWarehousePopup && (
        <div className="warehouse-popup-overlay" onClick={handleClosePopup}>
          <div className="warehouse-popup" onClick={(e) => e.stopPropagation()}>
            <div className="warehouse-popup-header">
              <h3>Select Warehouse</h3>
              <button className="close-btn" onClick={handleClosePopup}>×</button>
            </div>
            <div className="warehouse-popup-content">
              {popupProduct && (
                <div className="product-info-popup">
                  <p className="product-name-popup">{popupProduct.itemDescription}</p>
                  <p className="product-part-popup">Part: {popupProduct.partNumber}</p>
                </div>
              )}
              {loadingStock ? (
                <div className="loading-stock"><div className="spinner" /><p>Loading stock...</p></div>
              ) : warehouseStock.length === 0 ? (
                <div className="no-stock"><p>No stock available in any warehouse</p></div>
              ) : (
                <div className="warehouse-list">
                  {warehouseStock.map((wh, i) => (
                    <div
                      key={i}
                      className={`warehouse-item${selectedWarehouse?.inventoryName === wh.inventoryName ? " selected" : ""}`}
                      onClick={() => setSelectedWarehouse(wh)}
                    >
                      <div className="warehouse-header">
                        <span className="warehouse-name">{wh.inventoryName}</span>
                        <span className="warehouse-qty">Qty: {wh.qty}</span>
                      </div>
                      <div className="warehouse-details">
                        <span className="warehouse-locator">Locator: {wh.locator}</span>
                        <span className="warehouse-price">₹{wh.unitCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="warehouse-popup-footer">
              <button className="cancel-btn" onClick={handleClosePopup}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirmAddToCart} disabled={!selectedWarehouse}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Wishlist;
