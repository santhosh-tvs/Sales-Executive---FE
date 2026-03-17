import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orderResponse,
    orderPayload,
    cartItems = [],
    shippingAddress = {},
    totals = {},
  } = location.state || {};

  const orderId =
    orderResponse?.order_number ||
    orderResponse?.data?.order_number ||
    orderResponse?.data?.order_id ||
    orderResponse?.order_id ||
    orderPayload?.transaction_track_id ||
    null;

  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const { basicTotal = 0, gst = 0, total = 0 } = totals;
  const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalItems = cartItems.length;

  return (
    <div className="suc-root">
      <Header />

      {/* ── Top success banner ── */}
      <div className="suc-banner">
        <div className="suc-banner-inner">
          <div className="suc-check-wrap">
            <svg className="suc-check-svg" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" stroke="#22c55e" strokeWidth="3" fill="#f0fdf4" />
              <path d="M22 36L31 45L50 26" stroke="#22c55e" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="suc-pulse" />
          </div>
          <div className="suc-banner-text">
            <h1>Order Placed Successfully!</h1>
            <p>Your order has been confirmed and is being processed.</p>
          </div>
          <div className="suc-banner-meta">
            {orderId && (
              <div className="suc-id-chip">
                <span className="suc-id-label">Order ID</span>
                <span className="suc-id-value">{orderId}</span>
              </div>
            )}
            <div className="suc-date-chip">{orderDate}</div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="suc-stats-strip">
          <div className="suc-stat">
            <span className="suc-stat-val">{totalItems}</span>
            <span className="suc-stat-lbl">Products</span>
          </div>
          <div className="suc-stat-divider" />
          <div className="suc-stat">
            <span className="suc-stat-val">{totalQty}</span>
            <span className="suc-stat-lbl">Total Qty</span>
          </div>
          <div className="suc-stat-divider" />
          <div className="suc-stat">
            <span className="suc-stat-val">₹{Number(total).toFixed(0)}</span>
            <span className="suc-stat-lbl">Order Amount</span>
          </div>
          <div className="suc-stat-divider" />
          <div className="suc-stat">
            <span className="suc-stat-val suc-stat-green">Confirmed</span>
            <span className="suc-stat-lbl">Status</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="suc-body">

        {/* LEFT */}
        <div className="suc-left">

          {/* Delivery address */}
          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span>Delivery Address</span>
            </div>
            <div className="suc-address-box">
              <p className="suc-addr-name">{shippingAddress.name || '—'}</p>
              <p className="suc-addr-phone">{shippingAddress.phone || '—'}</p>
              <p className="suc-addr-line">{shippingAddress.address || '—'}</p>
            </div>
          </div>

          {/* Items ordered */}
          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <span>Items Ordered</span>
              <span className="suc-count-badge">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
            </div>

            <div className="suc-items-table">
              <div className="suc-items-thead">
                <span>Product</span>
                <span>Part No.</span>
                <span>Brand</span>
                <span className="suc-col-right">Qty</span>
                <span className="suc-col-right">Price</span>
                <span className="suc-col-right">Subtotal</span>
              </div>
              {cartItems.map((item, i) => (
                <div key={i} className="suc-items-row">
                  <div className="suc-item-name-cell">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="suc-item-thumb" />
                    )}
                    <span className="suc-item-name">{item.itemDescription || item.parts_name || '—'}</span>
                  </div>
                  <span className="suc-item-part">{item.partNumber || item.parts_no || '—'}</span>
                  <span className="suc-item-brand">{item.brandName || item.brand_name || '—'}</span>
                  <span className="suc-col-right">{item.quantity}</span>
                  <span className="suc-col-right">₹{Number(item.listPrice).toFixed(2)}</span>
                  <span className="suc-col-right suc-item-sub">₹{(item.listPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="suc-right">

          {/* Price breakdown */}
          <div className="suc-card suc-price-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <span>Order Amount</span>
            </div>
            <div className="suc-price-rows">
              <div className="suc-price-row">
                <span>Basic Total</span>
                <span>₹{Number(basicTotal).toFixed(2)}</span>
              </div>
              <div className="suc-price-row">
                <span>GST (18%)</span>
                <span>₹{Number(gst).toFixed(2)}</span>
              </div>
              <div className="suc-price-row">
                <span>Shipping</span>
                <span className="suc-free-tag">FREE</span>
              </div>
              <div className="suc-price-divider" />
              <div className="suc-price-row suc-price-total">
                <span>Order Total</span>
                <span>₹{Number(total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span>Order Details</span>
            </div>
            <div className="suc-detail-rows">
              {orderId && (
                <div className="suc-detail-row">
                  <span>Order ID</span>
                  <strong>{orderId}</strong>
                </div>
              )}
              {orderPayload?.transaction_track_id && (
                <div className="suc-detail-row">
                  <span>Track ID</span>
                  <strong className="suc-mono">{orderPayload.transaction_track_id}</strong>
                </div>
              )}
              {orderPayload?.validity_date && (
                <div className="suc-detail-row">
                  <span>Valid Until</span>
                  <strong>{orderPayload.validity_date}</strong>
                </div>
              )}
              {orderPayload?.customer_code && (
                <div className="suc-detail-row">
                  <span>Customer Code</span>
                  <strong>{orderPayload.customer_code}</strong>
                </div>
              )}
              <div className="suc-detail-row">
                <span>Total Items</span>
                <strong>{totalQty}</strong>
              </div>
              <div className="suc-detail-row">
                <span>Status</span>
                <span className="suc-pay-badge">Order Placed</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="suc-actions">
            <button className="suc-btn suc-btn-primary" onClick={() => navigate('/sales-home')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go to Home
            </button>
            <button className="suc-btn suc-btn-outline" onClick={() => navigate('/s-order-view')}>
              View All Orders →
            </button>
            <button className="suc-btn suc-btn-ghost" onClick={() => navigate('/brands')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
