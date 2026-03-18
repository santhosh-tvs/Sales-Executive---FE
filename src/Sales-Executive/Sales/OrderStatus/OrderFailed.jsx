import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import './OrderStatus.css';

const OrderFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { errorMessage, orderPayload, cartItems = [], shippingAddress = {}, totals = {} } = location.state || {};

  const { basicTotal = 0, gst = 0, total = 0 } = totals;
  const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);

  const isLocationError = errorMessage?.toLowerCase().includes('location');
  const isCustomerError = errorMessage?.toLowerCase().includes('customer');

  const getErrorCategory = () => {
    if (isLocationError) return { icon: '📍', label: 'Location Error', color: '#f59e0b' };
    if (isCustomerError) return { icon: '👤', label: 'Customer Error', color: '#8b5cf6' };
    return { icon: '⚠️', label: 'Order Error', color: '#ef4444' };
  };

  const errCat = getErrorCategory();

  return (
    <>
      <Header />
      <div className="os-page">
        {/* Hero banner */}
        <div className="os-hero os-hero--failed">
          <div className="os-hero-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#ef4444" strokeWidth="3" fill="#fef2f2" />
              <path d="M22 22L42 42M42 22L22 42" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Order Failed</h1>
          <p>Something went wrong while placing your order. Your cart is still saved.</p>
          <div className="os-error-badge" style={{ borderColor: errCat.color, color: errCat.color }}>
            {errCat.icon} {errCat.label}
          </div>
        </div>

        <div className="os-body">
          {/* Left column */}
          <div className="os-left">
            {/* Error detail */}
            <div className="os-card os-error-card">
              <div className="os-card-title">
                <span className="os-card-icon">🔍</span> What went wrong
              </div>
              <p className="os-error-message">{errorMessage || 'An unexpected error occurred.'}</p>
              {isLocationError && (
                <div className="os-tip">
                  <strong>Fix:</strong> Enable location permissions in your browser settings and try again.
                </div>
              )}
              {isCustomerError && (
                <div className="os-tip">
                  <strong>Fix:</strong> Go back and make sure a customer is selected before placing the order.
                </div>
              )}
              {!isLocationError && !isCustomerError && (
                <div className="os-tip">
                  <strong>Tip:</strong> Check your internet connection and try again. If the issue persists, contact support.
                </div>
              )}
            </div>

            {/* Cart items still saved */}
            <div className="os-card">
              <div className="os-card-title">
                <span className="os-card-icon">🛒</span> Your Cart (still saved)
                <span className="os-badge">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
              </div>
              <div className="os-items-list">
                {cartItems.map((item, i) => (
                  <div key={i} className="os-item-row">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.itemDescription} className="os-item-img" />
                    )}
                    <div className="os-item-info">
                      <p className="os-item-name">{item.itemDescription || item.parts_name}</p>
                      <p className="os-item-meta">
                        Part: <strong>{item.partNumber || item.parts_no}</strong>
                        {item.brandName && <> · Brand: <strong>{item.brandName}</strong></>}
                      </p>
                    </div>
                    <div className="os-item-price">
                      <span className="os-item-qty">×{item.quantity}</span>
                      <span>₹{(item.listPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="os-right">
            {/* Order summary */}
            <div className="os-card os-summary-card">
              <div className="os-card-title">
                <span className="os-card-icon">🧾</span> Order Summary
              </div>
              <div className="os-summary-rows">
                <div className="os-summary-row">
                  <span>Basic Total</span>
                  <span>₹{Number(basicTotal).toFixed(2)}</span>
                </div>
                <div className="os-summary-row">
                  <span>GST (18%)</span>
                  <span>₹{Number(gst).toFixed(2)}</span>
                </div>
                <div className="os-summary-divider" />
                <div className="os-summary-row os-summary-total">
                  <span>Order Total</span>
                  <span>₹{Number(total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {shippingAddress.name && (
              <div className="os-card">
                <div className="os-card-title">
                  <span className="os-card-icon">📍</span> Delivery Address
                </div>
                <div className="os-address-block">
                  <p className="os-addr-name">{shippingAddress.name}</p>
                  <p className="os-addr-phone">{shippingAddress.phone}</p>
                  <p className="os-addr-text">{shippingAddress.address}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="os-actions">
              <button className="os-btn os-btn--primary" onClick={() => navigate('/shipping', { state: { cartItems } })}>
                🔄 Retry Order
              </button>
              <button className="os-btn os-btn--outline" onClick={() => navigate('/cart')}>
                ← Back to Cart
              </button>
              <button className="os-btn os-btn--ghost" onClick={() => navigate('/sales-home')}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderFailed;
