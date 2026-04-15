import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlistAPI, addToWishlistAPI, deleteFromWishlistAPI } from '../services/api';
import apiConfigManager from '../services/apiConfig';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

const getEmpCode = () =>
  localStorage.getItem('sales_executive_code') ||
  (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').sales_executive_code || ''; } catch { return ''; } })();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ── fetch ── */
  const fetchWishlist = useCallback(async () => {
    if (!localStorage.getItem('authToken')) return;
    setLoading(true);
    try {
      const res = await getWishlistAPI();
      if (res?.success) {
        const mapped = (res.data || []).map(item => ({
          wishlist_id:     item.wishlist_id,
          id:              item.parts_no,
          partNumber:      item.parts_no,
          itemDescription: item.parts_name,
          brandName:       item.brand_name || '',
          listPrice:       item.item_price,
          price:           item.item_price,
          mrp:             item.item_price,
          taxpercent:      item.cgst,
          customer_code:   item.customer_code,
          company_id:      item.company_id,
          site_number:     item.site_number,
          imageUrl:        null,
        }));
        setWishlistItems(mapped);
      }
    } catch (e) {
      console.error('fetchWishlist error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  /* ── add ── */
  const addToWishlist = async (product) => {
    const partNumber = product.partNumber || product.id;
    // Optimistic update
    setWishlistItems(prev => {
      if (prev.some(i => i.partNumber === partNumber || i.id === partNumber)) return prev;
      return [...prev, { ...product, id: partNumber, partNumber }];
    });
    try {
      const cd = apiConfigManager.getCustomerDetails?.() || {};
      const employee_code = getEmpCode();

      const brand_name = product.brand_name || product.brandName || product.brandId || cd.brand_name || '';

      let latitude   = product.latitude   ?? cd.latitude   ?? null;
      let longtitude = product.longtitude ?? cd.longtitude ?? cd.longitude ?? null;

      // Geocode from customer address if lat/lon not available
      if (latitude === null && longtitude === null) {
        const addressParts = [cd.city, cd.state, cd.post_code, 'India'].filter(Boolean);
        if (addressParts.length > 1) {
          try {
            const encoded = encodeURIComponent(addressParts.join(', '));
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`,
              { headers: { 'User-Agent': 'MyTVS-Sales-App' } }
            );
            const geoData = await geoRes.json();
            if (geoData?.length) {
              latitude   = parseFloat(geoData[0].lat);
              longtitude = parseFloat(geoData[0].lon);
            }
          } catch { /* keep null */ }
        }
      }

      // Fallback: browser geolocation
      if (latitude === null && longtitude === null && navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
          );
          latitude   = pos.coords.latitude;
          longtitude = pos.coords.longitude;
        } catch { /* keep null */ }
      }

      await addToWishlistAPI({
        customer_code:    product.customer_code    || cd.customer_code,
        employee_code,
        brand_name,
        parts_name:       product.itemDescription  || product.name,
        parts_no:         partNumber,
        quantity:         product.quantity         ?? null,
        item_price:       product.listPrice        || product.price,
        cgst:             product.cgst             ?? null,
        sgst:             product.sgst             ?? null,
        igst:             product.igst             ?? null,
        tax_price:        product.tax_price        ?? null,
        total_price:      product.total_price      || product.listPrice || product.price,
        type:             product.type             ?? null,
        latitude,
        longtitude,
        site_number:      product.site_number      || cd.site_number      || null,
        company_id:       product.company_id       || cd.company_id       || null,
        ship_to_location: product.ship_to_location || cd.city             || null,
        ship_to_pincode:  product.ship_to_pincode  || cd.post_code        || null,
      });
      await fetchWishlist();
    } catch (e) {
      console.error('addToWishlist error:', e);
    }
  };

  /* ── remove ── */
  const removeFromWishlist = async (productId) => {
    const item = wishlistItems.find(i => i.partNumber === productId || i.id === productId);
    setWishlistItems(prev => prev.filter(i => i.partNumber !== productId && i.id !== productId));
    if (item?.wishlist_id) {
      try {
        await deleteFromWishlistAPI([item.wishlist_id]);
      } catch (e) {
        console.error('removeFromWishlist error:', e);
        await fetchWishlist();
      }
    }
  };

  /* ── clear all ── */
  const clearWishlist = async () => {
    const ids = wishlistItems.map(i => i.wishlist_id).filter(Boolean);
    setWishlistItems([]);
    if (ids.length) {
      try {
        await deleteFromWishlistAPI(ids);
      } catch (e) {
        console.error('clearWishlist error:', e);
        await fetchWishlist();
      }
    }
  };

  const isInWishlist = (productId) =>
    wishlistItems.some(i => i.id === productId || i.partNumber === productId);

  return (
    <WishlistContext.Provider value={{
      wishlistItems, loading,
      addToWishlist, removeFromWishlist,
      isInWishlist, clearWishlist, fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
