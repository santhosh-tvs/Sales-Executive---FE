import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { getOrderListAPI, getOrderDetailsAPI, createOrderAPI } from '../../services/api';
import apiConfigManager from '../../services/apiConfig';
import OrderPlacingOverlay from '../../components/OrderPlacingOverlay';
import './RepeatOrder.css';

const PAGE_SIZE = 8;

const getEmployeeCode = () =>
  localStorage.getItem('sales_executive_code') ||
  (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').sales_executive_code || ''; } catch { return ''; } })();

const getDefaultDates = () => {
  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
};

const defaultValidity = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

const fmt = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function RepeatOrder() {
  const navigate  = useNavigate();
  const defaults  = getDefaultDates();

  // ── Order list state ──────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate,   setToDate]   = useState(defaults.to);
  const [search,   setSearch]   = useState('');
  const [orders,   setOrders]   = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError,   setListError]   = useState('');
  const [page, setPage] = useState(1);

  // ── Detail state ──────────────────────────────────────────────────────────
  const [selected,      setSelected]      = useState(null);
  const [items,         setItems]         = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError,   setDetailError]   = useState('');

  // ── Validity modal state ──────────────────────────────────────────────────
  const [showValidity,  setShowValidity]  = useState(false);
  const [validityDate,  setValidityDate]  = useState(defaultValidity());

  // ── Order placement state ─────────────────────────────────────────────────
  const [placing,      setPlacing]      = useState(false);
  const [placeError,   setPlaceError]   = useState('');

  // ── Fetch order list ──────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setListLoading(true);
    setListError('');
    setOrders([]);
    setSelected(null);
    setItems([]);
    setPage(1);
    try {
      const res = await getOrderListAPI({
        customer_code: null,
        employee_code: getEmployeeCode(),
        from_date: fromDate,
        to_date:   toDate,
      });
      const data = res?.success && res.data ? res.data : [];
      setOrders(data);
      if (!data.length) setListError('No orders found for the selected period.');
    } catch {
      setListError('Failed to fetch orders. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [fromDate, toDate]);

  // ── Select order → fetch details ──────────────────────────────────────────
  const handleSelect = async (order) => {
    if (selected?.order_no === order.order_no) return;
    setSelected(order);
    setItems([]);
    setDetailError('');
    setPlaceError('');
    setDetailLoading(true);
    try {
      const res = await getOrderDetailsAPI({ order_no: order.order_no });
      if (!res?.success || !res.data) { setDetailError('Could not load order details.'); return; }
      const d = res.data;

      // Build initial items from order details
      const rawItems = (d.item_details || []).map((it, i) => ({
        _id:   `${order.order_no}_${i}`,
        partNo:  it.part_no   || '',
        name:    it.part_name || '',
        brand:   it.brand_name || '',
        price:   parseFloat(it.item_price || 0),
        mrp:     parseFloat(it.mrp || it.item_price || 0),
        tax:     parseFloat(it.tax_percent || it.taxpercent || 28),
        wh:      it.warehouse || d.warehouse || order.warehouse || '',
        qty:     Math.max(1, parseInt(it.quantity || 1, 10)),
      }));

      // For items missing brand_name, fetch from partsListAPI using part number
      const missingBrand = rawItems.filter(it => !it.brand && it.partNo);
      if (missingBrand.length > 0) {
        const { partsListAPI } = await import('../../services/api');
        const { default: apiCfg } = await import('../../services/apiConfig');
        // unitCode is the business_unit_code used for catalog queries
        const unitCode = apiCfg.getUnitCode()
          || localStorage.getItem('unit_code')
          || apiCfg.getCustomerDetails()?.unit_code
          || '';
        console.log('🔍 RepeatOrder brand lookup — unitCode:', unitCode, '| parts:', missingBrand.map(i => i.partNo));
        if (unitCode) {
          await Promise.all(missingBrand.map(async (it) => {
            try {
              const res2 = await partsListAPI({
                partNumber:    it.partNo,
                customerCode:  unitCode,
                limit:         1,
                offset:        0,
                sortOrder:     'ASC',
                brandPriority: null,
                fieldOrder:    null,
                brand:         null,
                make:          null,
                model:         null,
                variant:       null,
                fuelType:      null,
                year:          null,
                aggregate:     null,
                subAggregate:  null,
                vehicle:       null,
              });
              const found = res2?.data?.[0];
              console.log('🏷 Brand lookup for', it.partNo, '→', found?.brandName);
              if (found?.brandName) it.brand = found.brandName;
            } catch (e) {
              console.warn('Brand lookup failed for', it.partNo, e.message);
            }
          }));
        } else {
          console.warn('⚠️ No unitCode available — brand lookup skipped');
        }
      }

      setItems(rawItems);
    } catch {
      setDetailError('Failed to load order details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const setQty = (id, v) => {
    const q = Math.max(1, parseInt(v, 10) || 1);
    setItems(p => p.map(it => it._id === id ? { ...it, qty: q } : it));
  };

  // ── Step 1: open validity modal ───────────────────────────────────────────
  const handlePlaceClick = () => {
    if (!items.length) return;
    const cd = apiConfigManager.getCustomerDetails();
    if (!cd?.customer_code) {
      setPlaceError('No customer selected. Please select a customer first.');
      return;
    }
    setPlaceError('');
    setValidityDate(defaultValidity());
    setShowValidity(true);
  };

  // ── Step 2: confirm validity → create order ───────────────────────────────
  const handleConfirmOrder = async () => {
    setShowValidity(false);
    setPlacing(true);
    setPlaceError('');

    try {
      const customerDetails = apiConfigManager.getCustomerDetails();
      if (!customerDetails?.customer_code) {
        setPlaceError('No customer selected.');
        return;
      }

      // Geocode
      let latitude = '0.000', longitude = '0.000';
      const geocodeQueries = [
        [customerDetails.city, customerDetails.state, customerDetails.post_code].filter(Boolean).join(', ') + ', India',
        customerDetails.post_code ? `${customerDetails.post_code}, India` : null,
        customerDetails.city ? `${customerDetails.city}, India` : null,
      ].filter(Boolean);
      for (const q of geocodeQueries) {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=in`,
            { headers: { 'User-Agent': 'MyTVS-Sales-App' } }
          );
          const data = await resp.json();
          if (data?.length > 0) {
            latitude  = parseFloat(data[0].lat).toFixed(3);
            longitude = parseFloat(data[0].lon).toFixed(3);
            break;
          }
        } catch { /* try next */ }
      }

      const userData    = JSON.parse(localStorage.getItem('user') || '{}');
      const empCode     = localStorage.getItem('sales_executive_code') || userData.sales_executive_code || null;
      const now         = new Date();
      const trackId     = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0') +
        Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

      let grandTotal = 0;
      const totalQty = items.reduce((s, i) => s + i.qty, 0);

      const partDetails = items.map(it => {
        const subTotal  = it.price * it.qty;
        const taxAmount = (subTotal * it.tax) / 100;
        grandTotal += subTotal;
        return {
          parts_no:   it.partNo,
          parts_name: it.name,
          quantity:   String(it.qty),
          warehouse:  it.wh || customerDetails?.primary_ware_house || customerDetails?.warehouse?.warehouse_name || '',
          item_price: it.price.toFixed(2),
          brand_name: it.brand || 'NA',
          sub_total:  subTotal.toFixed(2),
          tax_price:  taxAmount.toFixed(2),
          total_price: (subTotal + taxAmount).toFixed(2),
          cgst:  (taxAmount / 2).toFixed(2),
          sgst:  (taxAmount / 2).toFixed(2),
          igst:  taxAmount.toFixed(2),
          mrp:   it.mrp.toFixed(2),
        };
      });

      const orderPayload = {
        validity_date:       validityDate,
        customer_code:       customerDetails.customer_code,
        employee_code:       empCode,
        purchase_order_no:   null,
        purchase_order_date: null,
        latitude,
        longitude,
        mobile_number:       customerDetails.mobile_number || customerDetails.phone_number || '',
        ship_to_location:    customerDetails.city || null,
        ship_to_pincode:     customerDetails.post_code ? String(customerDetails.post_code) : null,
        site_number:         null,
        transaction_track_id: trackId,
        total_price:         Math.round(grandTotal).toString(),
        total_quantity:      totalQty.toString(),
        part_details:        partDetails,
      };

      const orderResponse = await createOrderAPI(orderPayload);
      const success = orderResponse?.message === 'Successfully Order Created' || orderResponse?.success === true;

      const gst = items.reduce((s, it) => s + (it.price * it.qty * it.tax) / 100, 0);
      const shippingAddress = {
        name:    customerDetails.customer_name || '',
        phone:   customerDetails.mobile_number || customerDetails.phone_number || '',
        address: [customerDetails.address1, customerDetails.address2, customerDetails.city, customerDetails.state, customerDetails.post_code].filter(Boolean).join(', '),
      };

      if (success) {
        navigate('/order-success', {
          state: {
            orderResponse,
            orderPayload,
            cartItems: items.map(it => ({
              partNumber: it.partNo, itemDescription: it.name,
              brandName: it.brand, listPrice: it.price,
              quantity: it.qty, warehouse: it.wh,
            })),
            shippingAddress,
            totals: { basicTotal: grandTotal, gst, total: grandTotal + gst },
          },
        });
      } else {
        const msg = orderResponse?.error?.message || orderResponse?.message || 'Failed to place order.';
        navigate('/order-failed', {
          state: { errorMessage: msg, shippingAddress, totals: { basicTotal: grandTotal, gst, total: grandTotal + gst } },
        });
      }
    } catch (err) {
      console.error('Repeat order error:', err);
      setPlaceError('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = orders.filter(o =>
    !search ||
    (o.order_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_code || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grandTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty   = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      {placing && <OrderPlacingOverlay />}
      <Header />
      <div className="rp-page">
        <div className="rp-breadcrumb-wrap">
          <Breadcrumb crumbs={[{ label: 'Home', path: '/sales-home' }, { label: 'Repeat Order' }]} />
        </div>

        {/* Hero */}
        <div className="rp-hero">
          <div className="rp-hero-text">
            <h1>Repeat Order</h1>
            <p>Select a previous order, adjust quantities, and place a new order instantly.</p>
          </div>
          <div className="rp-hero-filters">
            <div className="rp-field">
              <label>From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="rp-field">
              <label>To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="rp-load-btn" onClick={fetchOrders} disabled={listLoading}>
              {listLoading
                ? <><span className="rp-spin" />Loading…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Load Orders</>}
            </button>
          </div>
        </div>

        {/* Split */}
        <div className={`rp-split${selected ? ' rp-split--open' : ''}`}>

          {/* LEFT */}
          <div className="rp-left">
            {orders.length > 0 && (
              <div className="rp-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input placeholder="Search order no, customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                {search && <button className="rp-clear-search" onClick={() => setSearch('')}>×</button>}
              </div>
            )}

            {listError && !listLoading && (
              <div className="rp-notice rp-notice--warn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {listError}
              </div>
            )}

            {listLoading && (
              <div className="rp-skeleton-list">
                {[...Array(5)].map((_, i) => <div key={i} className="rp-skeleton-card" />)}
              </div>
            )}

            {!listLoading && orders.length === 0 && !listError && (
              <div className="rp-empty-hero">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                <p>Pick a date range and click <strong>Load Orders</strong></p>
              </div>
            )}

            {!listLoading && paged.length > 0 && (
              <div className="rp-order-list">
                {paged.map(o => {
                  const active = selected?.order_no === o.order_no;
                  return (
                    <button key={o.order_no} className={`rp-order-card${active ? ' rp-order-card--active' : ''}`} onClick={() => handleSelect(o)}>
                      <div className="rp-card-top">
                        <span className="rp-order-no">{o.order_no}</span>
                        <span className="rp-order-date">{fmt(o.created_at)}</span>
                      </div>
                      <div className="rp-card-mid">
                        <span className="rp-customer">{o.customer_name || o.customer_code || '—'}</span>
                        <span className="rp-wh-badge">{o.warehouse || '—'}</span>
                      </div>
                      {active && <div className="rp-card-active-indicator"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Selected</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="rp-pag">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>›</button>
              </div>
            )}
          </div>

          {/* RIGHT */}
          {selected ? (
            <div className="rp-right">
              <div className="rp-detail-header">
                <div>
                  <div className="rp-detail-order-no">{selected.order_no}</div>
                  <div className="rp-detail-meta">
                    <span>{selected.customer_name || selected.customer_code}</span>
                    <span className="rp-dot">·</span>
                    <span>{selected.warehouse || '—'}</span>
                    <span className="rp-dot">·</span>
                    <span>{fmt(selected.created_at)}</span>
                  </div>
                </div>
                <div className="rp-lock-note">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Qty only editable
                </div>
              </div>

              {detailError && <div className="rp-notice rp-notice--error" style={{ margin: '12px 18px' }}>{detailError}</div>}
              {placeError  && <div className="rp-notice rp-notice--error" style={{ margin: '12px 18px' }}>{placeError}</div>}

              {detailLoading && (
                <div className="rp-skeleton-list" style={{ padding: '16px 18px' }}>
                  {[...Array(3)].map((_, i) => <div key={i} className="rp-skeleton-card" style={{ height: 52 }} />)}
                </div>
              )}

              {!detailLoading && items.length > 0 && (
                <>
                  <div className="rp-items-list">
                    {items.map((it, i) => (
                      <div key={it._id} className="rp-item-row">
                        <div className="rp-item-num">{i + 1}</div>
                        <div className="rp-item-info">
                          <div className="rp-item-name">{it.name || '—'}</div>
                          <div className="rp-item-sub">
                            <span className="rp-part-badge">{it.partNo}</span>
                            {it.brand && <span className="rp-brand-badge">{it.brand}</span>}
                            <span className="rp-wh-badge">{it.wh}</span>
                          </div>
                        </div>
                        <div className="rp-item-price">₹{it.price.toFixed(2)}</div>
                        <div className="rp-qty-ctrl">
                          <button onClick={() => setQty(it._id, it.qty - 1)} disabled={it.qty <= 1}>−</button>
                          <input type="number" min="1" value={it.qty} onChange={e => setQty(it._id, e.target.value)} />
                          <button onClick={() => setQty(it._id, it.qty + 1)}>+</button>
                        </div>
                        <div className="rp-item-sub-total">₹{(it.price * it.qty).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rp-summary-bar">
                    <div className="rp-summary-stats">
                      <div className="rp-stat"><span>{items.length}</span><label>Parts</label></div>
                      <div className="rp-stat-div" />
                      <div className="rp-stat"><span>{totalQty}</span><label>Total Qty</label></div>
                      <div className="rp-stat-div" />
                      <div className="rp-stat rp-stat--total"><span>₹{grandTotal.toFixed(2)}</span><label>Grand Total</label></div>
                    </div>
                    <button className="rp-place-btn" onClick={handlePlaceClick} disabled={placing}>
                      {placing
                        ? <><span className="rp-spin rp-spin--white" />Placing…</>
                        : <>Place Order <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                    </button>
                  </div>
                </>
              )}

              {!detailLoading && items.length === 0 && !detailError && (
                <div className="rp-empty-hero" style={{ padding: '40px 20px' }}><p>No items found for this order.</p></div>
              )}
            </div>
          ) : (
            !listLoading && orders.length > 0 && (
              <div className="rp-right rp-right--placeholder">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                <p>Select an order from the list to view and edit its items</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Validity Date Modal ── */}
      {showValidity && (
        <div className="rp-modal-overlay" onClick={() => setShowValidity(false)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-header">
              <h3>Set Validity Date</h3>
              <button className="rp-modal-close" onClick={() => setShowValidity(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="rp-modal-body">
              <p className="rp-modal-desc">Select the date until which this order remains valid. Default is one month from today.</p>
              <div className="rp-modal-field">
                <label>Validity Date</label>
                <input
                  type="date"
                  value={validityDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setValidityDate(e.target.value)}
                />
              </div>
              <div className="rp-modal-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Valid until: <strong>{validityDate ? new Date(validityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</strong>
              </div>
            </div>
            <div className="rp-modal-footer">
              <button className="rp-modal-cancel" onClick={() => setShowValidity(false)}>Cancel</button>
              <button className="rp-modal-confirm" onClick={handleConfirmOrder} disabled={!validityDate}>
                Confirm &amp; Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
