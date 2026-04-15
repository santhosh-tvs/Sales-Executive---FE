import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../header/Header';
import './OrderFailed.css';

const OrderFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const { errorMessage, cartItems = [], shippingAddress = {}, totals = {} } = location.state || {};
  const { basicTotal = 0, gst = 0, total = 0 } = totals;
  const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);

  const isLocationError = errorMessage?.toLowerCase().includes('location');
  const isCustomerError = errorMessage?.toLowerCase().includes('customer');

  const errLabel = isLocationError ? 'Location Error' : isCustomerError ? 'Customer Error' : 'Order Error';
  const errColor = isLocationError ? '#f59e0b' : isCustomerError ? '#8b5cf6' : '#ef4444';

  return (
    <>
      <Header />
      <div className={`fail-root${visible ? ' fail-visible' : ''}`}>

        {/* Banner */}
        <div className="fail-banner">
          <div className="fail-banner-inner">
            <div className="fail-icon-wrap">
              <svg className="fail-x-svg" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="34" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="rgba(255,255,255,0.15)" />
                <path d="M24 24L48 48M48 24L24 48" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <div className="fail-pulse" />
            </div>
            <div className="fail-banner-text">
              <h1>Order Failed</h1>
              <p>Something went wrong while placing your order. Your cart is still saved.</p>
            </div>
            <div className="fail-err-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errLabel}
            </div>
          </div>
          <div className="fail-stats-strip">
            <div className="fail-stat"><span className="fail-stat-val">{cartItems.length}</span><span className="fail-stat-lbl">Products</span></div>
            <div className="fail-stat-divider" />
            <div className="fail-stat"><span className="fail-stat-val">{totalQty}</span><span className="fail-stat-lbl">Total Qty</span></div>
            <div className="fail-stat-divider" />
            <div className="fail-stat"><span className="fail-stat-val">₹{Number(total).toFixed(0)}</span><span className="fail-stat-lbl">Order Amount</span></div>
            <div className="fail-stat-divider" />
            <div className="fail-stat"><span className="fail-stat-val fail-stat-red">Failed</span><span className="fail-stat-lbl">Status</span></div>
          </div>
        </div>

        {/* Body */}
        <div className="fail-body">
          {/* Left */}
          <div className="fail-left">

            {/* Error detail */}
            <div className="fail-card fail-card--error">
              <div className="fail-card-head">
                <div className="fail-card-icon fail-icon-red">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <span>What went wrong</span>
              </div>
              <p className="fail-err-msg">{errorMessage || 'An unexpected error occurred.'}</p>
              <div className="fail-tip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {isLocationError
                  ? 'Enable location permissions in your browser settings and try again.'
                  : isCustomerError
                  ? 'Go back and make sure a customer is selected before placing the order.'
                  : 'Check your internet connection and try again. If the issue persists, contact support.'}
              </div>
            </div>

            {/* Cart items */}
            <div className="fail-card">
              <div className="fail-card-head">
                <div className="fail-card-icon fail-icon-orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <span>Your Cart (still saved)</span>
                <span className="fail-badge">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
              </div>
              <div className="fail-items">
                {cartItems.map((item, i) => (
                  <div key={i} className="fail-item-row">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.itemDescription} className="fail-item-img" />
                      : (
                        <div className="fail-item-img-placeholder">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    <div className="fail-item-info">
                      <p className="fail-item-name">{item.itemDescription || item.parts_name}</p>
                      <p className="fail-item-meta">
                        {item.partNumber || item.parts_no}
                        {item.brandName && <> · {item.brandName}</>}
                      </p>
                    </div>
                    <div className="fail-item-price">
                      <span className="fail-item-qty">×{item.quantity}</span>
                      <span>₹{((item.listPrice || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="fail-right">

            {/* Summary */}
            <div className="fail-card fail-card--summary">
              <div className="fail-card-head">
                <div className="fail-card-icon fail-icon-green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <span>Order Summary</span>
              </div>
              <div className="fail-summary-rows">
                <div className="fail-summary-row"><span>Basic Total</span><span>₹{Number(basicTotal).toFixed(2)}</span></div>
                <div className="fail-summary-row"><span>GST</span><span>₹{Number(gst).toFixed(2)}</span></div>
                <div className="fail-summary-divider" />
                <div className="fail-summary-row fail-summary-total"><span>Order Total</span><span>₹{Number(total).toFixed(2)}</span></div>
              </div>
            </div>

            {/* Address */}
            {shippingAddress.name && (
              <div className="fail-card">
                <div className="fail-card-head">
                  <div className="fail-card-icon fail-icon-blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span>Delivery Address</span>
                </div>
                <div className="fail-address">
                  <p className="fail-addr-name">{shippingAddress.name}</p>
                  <p className="fail-addr-phone">{shippingAddress.phone}</p>
                  <p className="fail-addr-line">{shippingAddress.address}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="fail-actions">
              <button className="fail-btn fail-btn--primary" onClick={() => navigate(-1)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                </svg>
                Retry Order
              </button>
              <button className="fail-btn fail-btn--outline" onClick={() => navigate('/cart')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Back to Cart
              </button>
              <button className="fail-btn fail-btn--ghost" onClick={() => navigate('/sales-home')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
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
