import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../header/Header';
import { HOLD_STATUSES } from '../../Reports/History/orderStatusUtils';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const {
    orderResponse,
    orderPayload,
    cartItems = [],
    shippingAddress = {},
    totals = {},
  } = location.state || {};

  // Derive sale / back-order split from orderResponse item_details (most accurate)
  const deriveOrderSplit = () => {
    // Use actual API response item_details — most accurate source
    const itemDetails = orderResponse?.data?.item_details || orderResponse?.item_details;
    if (Array.isArray(itemDetails) && itemDetails.length > 0) {
      let saleQty = 0, backQty = 0;
      itemDetails.forEach(item => {
        const status = (item.status || '').toLowerCase();
        const qty = parseFloat(item.quantity || 0);
        if (HOLD_STATUSES.has(status)) backQty += qty;
        else saleQty += qty;
      });
      return { saleQty, backQty };
    }

    // Fallback: order_array from response
    const orderArray = orderResponse?.order_array;
    if (Array.isArray(orderArray) && orderArray.length > 0) {
      let saleQty = 0, backQty = 0;
      orderArray.forEach(entry => {
        const h = (entry.header || '').toLowerCase();
        const count = Number(entry.items_count || 0);
        if (h.includes('no stock') || h.includes('back')) backQty += count;
        else saleQty += count;
      });
      return { saleQty, backQty };
    }

    // Last fallback: cartItems.isBackOrder
    let saleQty = 0, backQty = 0;
    cartItems.forEach(item => {
      const qty = item.quantity || 0;
      if (item.isBackOrder || item.isBackorder) backQty += qty;
      else saleQty += qty;
    });
    return { saleQty, backQty };
  };

  const { saleQty, backQty } = deriveOrderSplit();
  const totalQty   = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalItems = cartItems.length;
  const hasSplit   = saleQty > 0 && backQty > 0;
  const allBack    = saleQty === 0 && backQty > 0;

  const orderId =
    orderResponse?.order_number ||
    orderResponse?.data?.order_number ||
    orderResponse?.order_id ||
    orderPayload?.transaction_track_id ||
    null;

  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const { basicTotal = 0, gst = 0, total = 0 } = totals;
  const statusLabel = allBack ? 'Back Order' : hasSplit ? 'Partial' : 'Confirmed';
  const statusColor = allBack ? 'suc-stat-orange' : 'suc-stat-green';

  return (
    <div className={`suc-root${visible ? ' suc-visible' : ''}`}>
      <Header />

      <div className="suc-banner">
        <div className="suc-banner-inner">
          <div className="suc-check-wrap">
            <svg className="suc-check-svg" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" stroke="#22c55e" strokeWidth="3" fill="#f0fdf4" />
              <path d="M22 36L31 45L50 26" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="suc-pulse" />
          </div>
          <div className="suc-banner-text">
            <h1>Order Placed Successfully!</h1>
            <p>
              {hasSplit
                ? `${saleQty} unit${saleQty !== 1 ? 's' : ''} confirmed as Sale Order · ${backQty} unit${backQty !== 1 ? 's' : ''} placed as Back Order.`
                : allBack
                ? 'All items placed as Back Order — will be fulfilled when stock is available.'
                : 'Your order has been confirmed and is being processed.'}
            </p>
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

        <div className="suc-stats-strip">
          <div className="suc-stat"><span className="suc-stat-val">{totalItems}</span><span className="suc-stat-lbl">Products</span></div>
          <div className="suc-stat-divider" />
          <div className="suc-stat"><span className="suc-stat-val">{totalQty}</span><span className="suc-stat-lbl">Total Qty</span></div>
          {saleQty > 0 && (<><div className="suc-stat-divider" /><div className="suc-stat"><span className="suc-stat-val suc-stat-green">{saleQty}</span><span className="suc-stat-lbl">Sale Qty</span></div></>)}
          {backQty > 0 && (<><div className="suc-stat-divider" /><div className="suc-stat"><span className="suc-stat-val suc-stat-orange">{backQty}</span><span className="suc-stat-lbl">Back Order Qty</span></div></>)}
          <div className="suc-stat-divider" />
          <div className="suc-stat"><span className="suc-stat-val">₹{Number(total).toFixed(0)}</span><span className="suc-stat-lbl">Order Amount</span></div>
          <div className="suc-stat-divider" />
          <div className="suc-stat"><span className={`suc-stat-val ${statusColor}`}>{statusLabel}</span><span className="suc-stat-lbl">Status</span></div>
        </div>
      </div>

      {hasSplit && (
        <div className="suc-split-alert">
          <div className="suc-split-alert-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span><strong>{saleQty} unit{saleQty !== 1 ? 's' : ''}</strong> confirmed as <span className="suc-split-sale-tag">Sale Order</span> and <strong>{backQty} unit{backQty !== 1 ? 's' : ''}</strong> placed as <span className="suc-split-bo-tag">Back Order</span> — both under order ID <strong>{orderId}</strong>.</span>
          </div>
        </div>
      )}
      {allBack && (
        <div className="suc-split-alert suc-split-alert-bo">
          <div className="suc-split-alert-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>All <strong>{backQty} unit{backQty !== 1 ? 's' : ''}</strong> placed as <span className="suc-split-bo-tag">Back Order</span> — stock unavailable, will be fulfilled when available.</span>
          </div>
        </div>
      )}

      <div className="suc-body">
        <div className="suc-left">
          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span>Delivery Address</span>
            </div>
            <div className="suc-address-box">
              <p className="suc-addr-name">{shippingAddress.name || '—'}</p>
              <p className="suc-addr-phone">{shippingAddress.phone || '—'}</p>
              <p className="suc-addr-line">{shippingAddress.address || '—'}</p>
            </div>
          </div>

          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <span>Items Ordered</span>
              <span className="suc-count-badge">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
            </div>
            <div className="suc-items-table">
              <div className="suc-items-thead">
                <span>Product</span><span>Part No.</span><span>Brand</span>
                <span className="suc-col-right">Qty</span>
                <span className="suc-col-right">Price</span>
                <span className="suc-col-right">Subtotal</span>
                <span className="suc-col-right">Type</span>
              </div>
              <div className="suc-items-rows-wrap">
              {cartItems.map((item, i) => {
                const isBO = item.isBackOrder || item.isBackorder;
                return (
                  <div key={i} className="suc-items-row">
                    <div className="suc-item-name-cell">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="suc-item-thumb" />}
                      <span className="suc-item-name">{item.itemDescription || item.parts_name || item.name || '—'}</span>
                    </div>
                    <span className="suc-item-part">{item.partNumber || item.parts_no || item.code || '—'}</span>
                    <span className="suc-item-brand">{item.brandName || item.brand_name || item.brand || '—'}</span>
                    <span className="suc-col-right">{item.quantity}</span>
                    <span className="suc-col-right">₹{Number(item.listPrice || item.price || 0).toFixed(2)}</span>
                    <span className="suc-col-right suc-item-sub">₹{(Number(item.listPrice || item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    <span className="suc-col-right">
                      {isBO ? <span className="suc-type-bo-badge">Back Order</span> : <span className="suc-type-sale-badge">Sale</span>}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>

        <div className="suc-right">
          <div className="suc-card suc-split-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <span>Order Breakdown</span>
            </div>
            <div className="suc-split-rows">
              {saleQty > 0 && (
                <div className="suc-split-row suc-split-row-sale">
                  <div className="suc-split-row-left">
                    <span className="suc-split-dot suc-dot-sale" />
                    <div><div className="suc-split-row-title">Sale Order</div><div className="suc-split-row-sub">Stock available — processed immediately</div></div>
                  </div>
                  <span className="suc-split-qty suc-split-qty-sale">{saleQty} unit{saleQty !== 1 ? 's' : ''}</span>
                </div>
              )}
              {backQty > 0 && (
                <div className="suc-split-row suc-split-row-bo">
                  <div className="suc-split-row-left">
                    <span className="suc-split-dot suc-dot-bo" />
                    <div><div className="suc-split-row-title">Back Order</div><div className="suc-split-row-sub">No stock — fulfilled when available</div></div>
                  </div>
                  <span className="suc-split-qty suc-split-qty-bo">{backQty} unit{backQty !== 1 ? 's' : ''}</span>
                </div>
              )}
              {saleQty === 0 && backQty === 0 && (
                <div className="suc-split-row suc-split-row-sale">
                  <div className="suc-split-row-left">
                    <span className="suc-split-dot suc-dot-sale" />
                    <div><div className="suc-split-row-title">Sale Order</div><div className="suc-split-row-sub">Order confirmed and being processed</div></div>
                  </div>
                  <span className="suc-split-qty suc-split-qty-sale">{totalQty} unit{totalQty !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <div className="suc-card suc-price-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <span>Order Amount</span>
            </div>
            <div className="suc-price-rows">
              <div className="suc-price-row"><span>Basic Total</span><span>₹{Number(basicTotal).toFixed(2)}</span></div>
              <div className="suc-price-row"><span>GST</span><span>₹{Number(gst).toFixed(2)}</span></div>
              <div className="suc-price-row"><span>Shipping</span><span className="suc-free-tag">FREE</span></div>
              <div className="suc-price-divider" />
              <div className="suc-price-row suc-price-total"><span>Order Total</span><span>₹{Number(total).toFixed(2)}</span></div>
            </div>
          </div>

          <div className="suc-card">
            <div className="suc-card-head">
              <div className="suc-card-icon suc-icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <span>Order Details</span>
            </div>
            <div className="suc-detail-rows">
              {orderId && <div className="suc-detail-row"><span>Order ID</span><strong>{orderId}</strong></div>}
              {orderPayload?.transaction_track_id && <div className="suc-detail-row"><span>Track ID</span><strong className="suc-mono">{orderPayload.transaction_track_id}</strong></div>}
              {orderPayload?.validity_date && <div className="suc-detail-row"><span>Valid Until</span><strong>{orderPayload.validity_date}</strong></div>}
              {orderPayload?.customer_code && <div className="suc-detail-row"><span>Customer Code</span><strong>{orderPayload.customer_code}</strong></div>}
              <div className="suc-detail-row"><span>Total Items</span><strong>{totalQty}</strong></div>
              <div className="suc-detail-row">
                <span>Status</span>
                <span className={`suc-pay-badge ${allBack ? 'suc-pay-badge-bo' : hasSplit ? 'suc-pay-badge-partial' : ''}`}>
                  {allBack ? 'Back Order' : hasSplit ? 'Partial (Sale + Back Order)' : 'Order Placed'}
                </span>
              </div>
            </div>
          </div>

          <div className="suc-actions">
            <button className="suc-btn suc-btn-primary" onClick={() => navigate('/sales-home')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Go to Home
            </button>
            <button className="suc-btn suc-btn-outline" onClick={() => navigate('/history/sales-order')}>View All Orders →</button>
            <button className="suc-btn suc-btn-ghost" onClick={() => navigate('/brands')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
