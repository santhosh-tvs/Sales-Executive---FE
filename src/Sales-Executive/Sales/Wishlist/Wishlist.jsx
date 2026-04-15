import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useWishlist } from "../../../Context/WishlistContext";
import { useCart } from "../../../Context/CartContext";
import { itemMasterAPI, stockCheckNewAPI, warehouseMappingAPI } from "../../../services/api";
import apiConfigManager from "../../../services/apiConfig";
import WarehousePickerModal from "../../components/WarehousePickerModal/WarehousePickerModal";
import "./Wishlist.css";

const extractInventoryItemId = (data) => {
  if (!data?.length) return null;
  const item = data[0];
  return item.inventoryItemId || item.inventory_item_id || item.InventoryItemId
    || item.ItemId || item.item_id || item.INVENTORY_ITEM_ID || null;
};

const sumQtyByWarehouse = (stockRecords, warehouseCode) => {
  const key = String(warehouseCode).trim().toUpperCase();
  return stockRecords
    .filter(r => String(r.organization_code || '').trim().toUpperCase() === key)
    .reduce((s, r) => s + Number(r.available_to_reserve || 0), 0);
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const [stockStatus, setStockStatus]         = useState({});
  const [customerWarehouses, setCustomerWarehouses] = useState([]);
  const [showPicker, setShowPicker]           = useState(false);
  const [pickerProduct, setPickerProduct]     = useState(null);
  const [pickerWarehouses, setPickerWarehouses] = useState([]);
  const [pickerLoading, setPickerLoading]     = useState(false);
  const [selectedWh, setSelectedWh]           = useState(null);
  const [removingId, setRemovingId]           = useState(null);

  const isInCart = (id) => cartItems.some(i => i.partNumber === id || i.id === id);

  /* ── load warehouses ── */
  useEffect(() => {
    const load = async () => {
      const cd = apiConfigManager.getCustomerDetails?.();
      if (!cd?.customer_code) return;
      try {
        const res = await warehouseMappingAPI(cd.customer_code);
        if (res?.success && res.data?.length) {
          setCustomerWarehouses(res.data.map(w => w.warehouse_name));
        } else {
          setCustomerWarehouses([cd.primary_ware_house, cd.secondary_ware_house, cd.teritary_ware_house].filter(Boolean));
        }
      } catch {
        const stored = localStorage.getItem('customer_warehouses');
        if (stored) try { setCustomerWarehouses(JSON.parse(stored)); } catch { /**/ }
      }
    };
    load();
  }, []);

  /* ── live stock check — all items in parallel ── */
  const checkAllStock = useCallback(async (items, warehouses) => {
    if (!items.length || !warehouses.length) return;

    const validItems = items.filter(p => p.partNumber || p.id);

    // Mark all as checking
    setStockStatus(prev => {
      const next = { ...prev };
      validItems.forEach(p => { next[p.partNumber || p.id] = { checking: true }; });
      return next;
    });

    // Step 1: fetch all itemMaster in parallel
    const itemDataResults = await Promise.allSettled(
      validItems.map(p => itemMasterAPI(p.partNumber || p.id))
    );

    // Step 2: fetch all stock in parallel for items that have inventoryItemId
    const stockPromises = validItems.map((product, i) => {
      const partNumber = product.partNumber || product.id;
      const itemData = itemDataResults[i].status === 'fulfilled' ? itemDataResults[i].value : null;
      const inventoryItemId = extractInventoryItemId(itemData);
      if (!inventoryItemId) return Promise.resolve({ partNumber, qty: 0, noId: true });
      return stockCheckNewAPI(inventoryItemId, warehouses)
        .then(stockData => {
          const totalQty = Array.isArray(stockData)
            ? stockData.reduce((s, r) => s + Number(r.available_to_reserve || 0), 0) : 0;
          return { partNumber, qty: totalQty };
        })
        .catch(() => ({ partNumber, qty: 0, error: true }));
    });

    const stockResults = await Promise.allSettled(stockPromises);

    // Update all at once
    setStockStatus(prev => {
      const next = { ...prev };
      stockResults.forEach(r => {
        if (r.status === 'fulfilled') {
          const { partNumber, qty, error } = r.value;
          next[partNumber] = { checking: false, inStock: qty > 0, qty, error: !!error };
        }
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (wishlistItems.length && customerWarehouses.length) checkAllStock(wishlistItems, customerWarehouses);
  }, [wishlistItems, customerWarehouses, checkAllStock]);

  /* ── add to cart flow ── */
  const handleAddToCart = async (product) => {
    const partNumber = product.partNumber || product.id;
    setPickerProduct(product);
    setPickerWarehouses([]);
    setSelectedWh(null);
    setShowPicker(true);
    setPickerLoading(true);
    try {
      const itemData = await itemMasterAPI(partNumber);
      const inventoryItemId = extractInventoryItemId(itemData);
      const whList = customerWarehouses.length > 0 ? customerWarehouses : (() => {
        try { return JSON.parse(localStorage.getItem('customer_warehouses') || '[]'); } catch { return []; }
      })();
      if (!inventoryItemId || !whList.length) { setPickerLoading(false); return; }
      const stockData = await stockCheckNewAPI(inventoryItemId, whList);
      const rows = whList.map(wh => ({
        code: wh,
        qty: sumQtyByWarehouse(Array.isArray(stockData) ? stockData : [], wh),
      }));
      setPickerWarehouses(rows);
      const best = rows.find(w => w.qty > 0) || rows[0];
      if (best) setSelectedWh(best.code);
    } catch { setPickerWarehouses([]); }
    finally { setPickerLoading(false); }
  };

  const handleConfirmAdd = () => {
    if (!pickerProduct || !selectedWh) return;
    const wh = pickerWarehouses.find(w => w.code === selectedWh);
    const partNumber = pickerProduct.partNumber || pickerProduct.id;
    addToCart({
      id: partNumber, partNumber,
      itemDescription: pickerProduct.itemDescription,
      brandName:       pickerProduct.brandName,
      listPrice:       pickerProduct.listPrice || pickerProduct.price || 0,
      mrp:             pickerProduct.mrp || pickerProduct.listPrice || 0,
      taxpercent:      pickerProduct.taxpercent || 28,
      warehouse:       selectedWh,
      availableQty:    wh?.qty || 0,
      isBackOrder:     (wh?.qty || 0) === 0,
      imageUrl:        pickerProduct.imageUrl || null,
      quantity:        1,
    });
    closePicker();
  };

  const closePicker = () => { setShowPicker(false); setPickerProduct(null); setPickerWarehouses([]); setSelectedWh(null); };

  const handleRemove = async (partNumber) => {
    setRemovingId(partNumber);
    await removeFromWishlist(partNumber);
    setRemovingId(null);
  };

  /* ── render ── */
  return (
    <>
      <Header />
      <div className="wl-page">
        <div className="wl-inner">
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Wishlist' },
          ]} />

          {wishlistLoading ? (
            <div className="wl-loading">
              <span className="wl-spin wl-spin--lg" />
              <p>Loading wishlist…</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="wl-empty-state">
              <div className="wl-empty-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Save items you love and order them later</p>
              <button className="wl-shop-btn" onClick={() => navigate("/create-order")}>Browse Products</button>
            </div>
          ) : (
            <>
              {/* Top bar */}
              <div className="wl-topbar">
                <div className="wl-topbar-left">
                  <h2>My Wishlist</h2>
                  <span className="wl-count">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="wl-topbar-right">
                  <button className="wl-cart-all-btn" onClick={() => navigate("/cart")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Go to Cart
                  </button>
                  <button className="wl-clear-btn" onClick={clearWishlist}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="wl-grid">
                {wishlistItems.map((product) => {
                  const partNumber = product.partNumber || product.id;
                  const inCart   = isInCart(partNumber);
                  const stock    = stockStatus[partNumber];
                  const checking = stock?.checking;
                  const inStock  = stock?.inStock;
                  const qty      = stock?.qty ?? 0;
                  const isRemoving = removingId === partNumber;

                  return (
                    <div key={partNumber} className={`wl-card${isRemoving ? ' wl-card--removing' : ''}`}>
                      {/* Remove */}
                      <button className="wl-remove-btn" onClick={() => handleRemove(partNumber)} title="Remove from wishlist">
                        {isRemoving
                          ? <span className="wl-spin" style={{ width: 12, height: 12 }} />
                          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        }
                      </button>

                      {/* Image */}
                      <div className="wl-card-img">
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.itemDescription} />
                          : (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          )}
                      </div>

                      <div className="wl-card-body">
                        {/* Stock badge */}
                        <div className="wl-card-badge-row">
                          {checking ? (
                            <span className="wl-badge checking"><span className="wl-spin" />Checking…</span>
                          ) : inStock ? (
                            <span className="wl-badge in-stock">
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                              In Stock ({qty})
                            </span>
                          ) : stock ? (
                            <span className="wl-badge out-of-stock">
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                              Out of Stock
                            </span>
                          ) : null}
                        </div>

                        <h4 className="wl-card-name" title={product.itemDescription}>
                          {product.itemDescription || 'N/A'}
                        </h4>
                        <p className="wl-card-part">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                          {partNumber}
                        </p>
                        {product.brandName && <p className="wl-card-brand">{product.brandName}</p>}
                        <div className="wl-card-price">
                          ₹{parseFloat(product.listPrice || product.price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="wl-card-footer">
                        <button
                          className={`wl-add-cart-btn${inCart ? ' added' : ''}`}
                          disabled={inCart || checking || isRemoving}
                          onClick={() => handleAddToCart(product)}
                        >
                          {inCart ? (
                            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>In Cart</>
                          ) : (
                            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add to Cart</>
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

      {/* Warehouse Picker */}
      <WarehousePickerModal
        open={showPicker}
        onClose={closePicker}
        onConfirm={(wh) => {
          if (!pickerProduct) return;
          const partNumber = pickerProduct.partNumber || pickerProduct.id;
          addToCart({
            id: partNumber, partNumber,
            itemDescription: pickerProduct.itemDescription,
            brandName:       pickerProduct.brandName,
            listPrice:       pickerProduct.listPrice || pickerProduct.price || 0,
            mrp:             pickerProduct.mrp || pickerProduct.listPrice || 0,
            taxpercent:      pickerProduct.taxpercent || 28,
            warehouse:       wh.name,
            availableQty:    wh.qty || 0,
            isBackOrder:     (wh.qty || 0) === 0,
            imageUrl:        pickerProduct.imageUrl || null,
            quantity:        1,
          });
          closePicker();
        }}
        loading={pickerLoading}
        warehouses={pickerWarehouses.map(w => ({ name: w.code, qty: w.qty }))}
        product={pickerProduct ? { itemDescription: pickerProduct.itemDescription, partNumber: pickerProduct.partNumber || pickerProduct.id } : null}
      />
    </>
  );
}
