import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import { useCart } from '../../../Context/CartContext';
import { createOrderAPI } from '../../../services/api';
import StockSplitBadge from '../Cart/StockSplitBadge';
import OrderPlacingOverlay from '../../../components/OrderPlacingOverlay';
import './Shipping.css';

const defaultValidity = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const Shipping = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems: contextCartItems, clearCart } = useCart();

  const cartItems = location.state?.cartItems || contextCartItems;

  const [orderNotes, setOrderNotes] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({ name: '', phone: '', address: '' });
  const [tempAddress, setTempAddress] = useState({ name: '', phone: '', address: '' });
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  // Validity date modal
  const [showValidityModal, setShowValidityModal] = useState(false);
  const [validityDate, setValidityDate] = useState(defaultValidity);

  const currentBalance = 1112;

  // ── Load customer details ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        let customerData = localStorage.getItem('selected_customer');
        if (!customerData) {
          const { default: apiConfigManager } = await import('../../../services/apiConfig');
          const customer = apiConfigManager.getCustomerDetails();
          if (customer) customerData = JSON.stringify(customer);
        }
        if (customerData) {
          const c = typeof customerData === 'string' ? JSON.parse(customerData) : customerData;
          const parts = [c.address1, c.address2, c.address3, c.address4, c.city, c.state, c.post_code].filter(Boolean);
          const addr = { name: c.customer_name || '', phone: c.phone_number || '', address: parts.join(', ') };
          setShippingAddress(addr);
          setTempAddress(addr);
        }
      } catch (e) {
        console.error('Error loading customer:', e);
      } finally {
        setLoadingCustomer(false);
      }
    };
    load();
  }, []);

  // ── Redirect if empty ──────────────────────────────────────────────────────
  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const basicTotal = cartItems.reduce((s, i) => s + (parseFloat(i.listPrice || 0) * (i.quantity || 0)), 0);
  const gst = cartItems.reduce((s, i) => {
    const taxableValue = parseFloat(i.listPrice || 0) * (i.quantity || 0);
    const taxPct = parseFloat(i.taxPercent || i.taxpercent || 28);
    return s + (taxableValue * taxPct) / 100;
  }, 0);
  const total = basicTotal + gst;
  const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);

  // ── Step 1: Open validity date modal ──────────────────────────────────────
  const handlePlaceOrder = () => {
    setOrderError('');
    setValidityDate(defaultValidity());
    setShowValidityModal(true);
  };

  // ── Step 2: Confirm validity date → submit order ───────────────────────────
  const handleConfirmOrder = async () => {
    setShowValidityModal(false);
    setIsPlacingOrder(true);
    setOrderError('');

    try {
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const customerDetails = apiConfigManager.getCustomerDetails();

      if (!customerDetails?.customer_code) {
        alert('Please select a customer first');
        setIsPlacingOrder(false);
        return;
      }

      const customerCode = customerDetails.customer_code;

      // Geocode
      let latitude = '0.000';
      let longitude = '0.000';
      const geocodeQueries = [
        [customerDetails.city, customerDetails.state, customerDetails.post_code].filter(Boolean).join(', ') + ', India',
        customerDetails.post_code ? `${customerDetails.post_code}, India` : null,
        customerDetails.city ? `${customerDetails.city}, ${customerDetails.state || 'India'}` : null,
      ].filter(Boolean);

      for (const q of geocodeQueries) {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=in`,
            { headers: { 'User-Agent': 'MyTVS-Sales-App' } }
          );
          const data = await resp.json();
          if (data?.length > 0) {
            latitude = parseFloat(data[0].lat).toFixed(3);
            longitude = parseFloat(data[0].lon).toFixed(3);
            break;
          }
        } catch { /* try next */ }
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeCode = localStorage.getItem('sales_executive_code') || userData.sales_executive_code || null;

      const now = new Date();
      const trackId = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0') +
        Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

      const shipToLocation = customerDetails.city || null;
      const shipToPincode = customerDetails.post_code ? String(customerDetails.post_code) : null;

      // Build part_details with per-item tax from taxPercent field (matches mobile spec)
      const partDetails = cartItems.map((item) => {
        const qty = item.quantity || 0;
        const price = parseFloat(item.listPrice || item.item_price) || 0;
        const taxPct = parseFloat(item.taxPercent || item.taxpercent || 28);
        const subTotal = price * qty;
        const taxAmount = (subTotal * taxPct) / 100;
        const cgst = taxAmount / 2;
        const sgst = taxAmount / 2;
        const igst = taxAmount;
        return {
          parts_no: item.partNumber || item.parts_no,
          parts_name: item.itemDescription || item.parts_name,
          quantity: String(qty),
          warehouse: item.warehouse || customerDetails?.primary_ware_house || customerDetails?.warehouse?.warehouse_name || customerDetails?.warehouse_name || '',
          item_price: price.toFixed(2),
          brand_name: item.brandName || item.brand_name || '-',
          sub_total: subTotal.toFixed(2),
          tax_price: taxAmount.toFixed(2),
          total_price: (subTotal + taxAmount).toFixed(2),  // sub_total + tax_price
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          igst: igst.toFixed(2),
          mrp: (parseFloat(item.mrp) || price).toFixed(2),
        };
      });

      // grandTotal = sum of (price * quantity) — NO tax, matches mobile spec
      const grandTotal = cartItems.reduce((s, i) => s + (parseFloat(i.listPrice || 0) * (i.quantity || 0)), 0);

      const orderPayload = {
        validity_date: validityDate,
        customer_code: customerCode,
        employee_code: employeeCode,
        purchase_order_no: null,
        purchase_order_date: null,
        latitude,
        longitude,
        mobile_number: customerDetails.mobile_number || customerDetails.phone_number || '',
        ship_to_location: shipToLocation,
        ship_to_pincode: shipToPincode,
        site_number: null,
        transaction_track_id: trackId,
        total_price: Math.round(grandTotal).toString(),
        total_quantity: totalQty.toString(),
        part_details: partDetails,
      };

      const orderResponse = await createOrderAPI(orderPayload);

      // Success condition matches mobile spec
      const success =
        orderResponse?.message === 'Successfully Order Created' ||
        orderResponse?.success === true;

      if (success) {
        // Clear cart from localStorage on success (matches mobile behaviour)
        localStorage.removeItem('cartItems');
        localStorage.removeItem('lastUsedWarehouse');
        localStorage.removeItem('cartUpdated');
        clearCart();

        navigate('/order-success', {
          state: {
            orderResponse,
            orderPayload,
            cartItems,
            shippingAddress,
            totals: { basicTotal, gst, total },
          },
        });
      } else {
        const msg = orderResponse?.error?.message || orderResponse?.message || 'Failed to place order. Please try again.';
        navigate('/order-failed', {
          state: { errorMessage: msg, cartItems, shippingAddress, totals: { basicTotal, gst, total } },
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleChangeAddress = () => { setTempAddress({ ...shippingAddress }); setShowAddressPopup(true); };
  const handleSaveAddress = () => { setShippingAddress({ ...tempAddress }); setShowAddressPopup(false); };
  const handleCancelAddress = () => { setTempAddress({ ...shippingAddress }); setShowAddressPopup(false); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {isPlacingOrder && <OrderPlacingOverlay />}
      <Header />
      <div className="shipping-page">
        <div className="shipping-container">
          <PageNavigate />

          <div className="shipping-content">
            {/* Left */}
            <div className="shipping-left">
              {/* Address */}
              <div className="shipping-section">
                <div className="section-header">
                  <h2>Shipping Address</h2>
                  <button className="change-btn" onClick={handleChangeAddress}>Change ✎</button>
                </div>
                {loadingCustomer ? (
                  <div className="address-details"><p>Loading customer details...</p></div>
                ) : (
                  <div className="address-details">
                    <p className="customer-name">{shippingAddress.name || 'N/A'}</p>
                    <p className="customer-phone">{shippingAddress.phone || 'N/A'}</p>
                    <p className="customer-address">{shippingAddress.address || 'N/A'}</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="shipping-section">
                <h2>Order Summary</h2>
                <div className="order-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.imageUrl} alt={item.itemDescription} className="item-image" />
                      <div className="item-details">
                        <p className="item-name">{item.itemDescription}</p>
                        <p className="item-quantity">{item.quantity} × ₹{Number(item.listPrice).toFixed(2)}</p>
                        <StockSplitBadge item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="shipping-section">
                <h2>Additional Information</h2>
                <div className="order-notes-section">
                  <label htmlFor="orderNotes">Order Notes (Optional)</label>
                  <textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Notes about your order, e.g. special notes for delivery"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="shipping-right">
              <div className="order-amount-card">
                <h3>Order Amount</h3>
                <div className="amount-row">
                  <span className="label">Basic total</span>
                  <span className="value">₹{basicTotal.toFixed(2)}</span>
                </div>
                <div className="amount-row">
                  <span className="label">GST</span>
                  <span className="value">₹{gst.toFixed(2)}</span>
                </div>
                <div className="amount-divider" />
                <div className="amount-row total-row">
                  <span className="label">Total</span>
                  <span className="value">₹{total.toFixed(2)}</span>
                </div>

                <button
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER →'}
                </button>

                {orderError && <div className="order-error">{orderError}</div>}

                <div className="coin-balance-section">
                  <div className="coin-checkbox">
                    <input type="checkbox" id="useCoins" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} />
                    <label htmlFor="useCoins">
                      <span className="coin-icon">🪙</span>
                      <span className="coin-text">Current Balance: ₹{currentBalance}</span>
                    </label>
                  </div>
                  <p className="coin-info">
                    You are eligible now to redeem the coin. You can use super coins once per month.{' '}
                    <a href="#" className="click-here-link">Click here</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Validity Date Modal ── */}
      {showValidityModal && (
        <div className="validity-modal-overlay" onClick={() => setShowValidityModal(false)}>
          <div className="validity-modal" onClick={e => e.stopPropagation()}>
            <div className="validity-modal-header">
              <h3>Set Validity Date</h3>
              <button className="validity-modal-close" onClick={() => setShowValidityModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="validity-modal-body">
              <p className="validity-modal-desc">
                Select the date until which this order remains valid. Default is one month from today.
              </p>
              <div className="validity-date-field">
                <label>Validity Date</label>
                <input
                  type="date"
                  className="validity-date-input"
                  value={validityDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setValidityDate(e.target.value)}
                />
              </div>
              <div className="validity-modal-summary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Order valid until: <strong>{validityDate ? new Date(validityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong></span>
              </div>
            </div>
            <div className="validity-modal-footer">
              <button className="validity-cancel-btn" onClick={() => setShowValidityModal(false)}>Cancel</button>
              <button
                className="validity-confirm-btn"
                onClick={handleConfirmOrder}
                disabled={!validityDate}
              >
                Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address popup */}
      {showAddressPopup && (
        <div className="address-popup-overlay" onClick={handleCancelAddress}>
          <div className="address-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Change Shipping Address</h3>
              <button className="popup-close" onClick={handleCancelAddress}>×</button>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={tempAddress.name} onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={tempAddress.phone} onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })} placeholder="Enter phone number" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={tempAddress.address} onChange={(e) => setTempAddress({ ...tempAddress, address: e.target.value })} placeholder="Enter complete address" rows="4" />
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-cancel" onClick={handleCancelAddress}>Cancel</button>
              <button className="btn-save" onClick={handleSaveAddress}>Save Address</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipping;
