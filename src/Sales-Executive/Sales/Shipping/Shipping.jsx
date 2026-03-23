import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import { useCart } from '../../../Context/CartContext';
import { createOrderAPI } from '../../../services/api';
import './Shipping.css';

const Shipping = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems: contextCartItems } = useCart();
  
  // Use cart items from context if location state is empty
  const cartItems = location.state?.cartItems || contextCartItems;
  
  const [orderNotes, setOrderNotes] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [tempAddress, setTempAddress] = useState({ ...shippingAddress });
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const currentBalance = 1112;

  // Load customer details from localStorage or apiConfigManager
  useEffect(() => {
    const loadCustomerDetails = async () => {
      try {
        // First try localStorage
        let customerData = localStorage.getItem('selected_customer');
        
        if (!customerData) {
          // If not in localStorage, try apiConfigManager
          const { default: apiConfigManager } = await import('../../../services/apiConfig');
          const customer = apiConfigManager.getCustomerDetails();
          
          if (customer) {
            console.log('📦 Customer loaded from apiConfigManager');
            customerData = JSON.stringify(customer);
          }
        }
        
        if (customerData) {
          const customer = typeof customerData === 'string' ? JSON.parse(customerData) : customerData;
          
          // Build address from customer data
          const addressParts = [];
          if (customer.address1) addressParts.push(customer.address1);
          if (customer.address2) addressParts.push(customer.address2);
          if (customer.address3) addressParts.push(customer.address3);
          if (customer.address4) addressParts.push(customer.address4);
          if (customer.city) addressParts.push(customer.city);
          if (customer.state) addressParts.push(customer.state);
          if (customer.post_code) addressParts.push(customer.post_code);
          
          const address = {
            name: customer.customer_name || '',
            phone: customer.phone_number || '',
            address: addressParts.filter(Boolean).join(', ')
          };
          
          console.log('📦 Customer address loaded:', address);
          setShippingAddress(address);
          setTempAddress(address);
        } else {
          console.warn('⚠️ No customer data found - please select a customer first');
        }
      } catch (error) {
        console.error('❌ Error loading customer details:', error);
      } finally {
        setLoadingCustomer(false);
      }
    };
    
    loadCustomerDetails();
  }, []);

  // Calculate totals dynamically
  const basicTotal = cartItems.reduce((sum, item) => sum + (item.listPrice * item.quantity), 0);
  const gst = basicTotal * 0.18;
  const total = basicTotal + gst;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError('');

    try {
      // Geocode using customer location data (city + state + pincode)
      let latitude, longitude;

      // Get customer details first so we can use structured location fields
      const { default: apiConfigManager } = await import('../../../services/apiConfig');
      const customerDetails = apiConfigManager.getCustomerDetails();

      if (!customerDetails || !customerDetails.customer_code) {
        alert('Please select a customer first');
        setIsPlacingOrder(false);
        return;
      }

      const customerCode = customerDetails.customer_code;

      // Build progressively simpler queries until one works
      const geocodeQueries = [
        [customerDetails.city, customerDetails.state, customerDetails.post_code].filter(Boolean).join(', ') + ', India',
        customerDetails.post_code ? `${customerDetails.post_code}, India` : null,
        customerDetails.city ? `${customerDetails.city}, ${customerDetails.state || 'India'}` : null,
      ].filter(Boolean);

      let geocoded = false;
      for (const query of geocodeQueries) {
        try {
          console.log('🔍 Geocoding query:', query);
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
            { headers: { 'User-Agent': 'MyTVS-Sales-App' } }
          );
          const data = await resp.json();
          if (data && data.length > 0) {
            latitude = parseFloat(data[0].lat);
            longitude = parseFloat(data[0].lon);
            console.log('✅ Geocoded successfully:', { query, latitude, longitude });
            geocoded = true;
            break;
          }
        } catch (e) {
          console.warn('Geocode attempt failed for query:', query, e);
        }
      }

      if (!geocoded) {
        setOrderError('Unable to determine location from customer address. Please verify the customer city/pincode.');
        setIsPlacingOrder(false);
        return;
      }

      // Get user data from localStorage — sales_executive_id is the employee id
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeCode = localStorage.getItem('sales_executive_code') || userData.sales_executive_code || null;

      // Generate transaction track ID
      const now = new Date();
      const trackId = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0') +
        Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

      // Calculate validity date (30 days from now)
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 30);
      const formattedValidityDate = validityDate.toISOString().split('T')[0];

      // Build part details
      const partDetails = cartItems.map(item => ({
        parts_no: item.partNumber || item.parts_no,
        parts_name: item.itemDescription || item.parts_name,
        quantity: item.quantity,
        warehouse: item.warehouse ,
        item_price: parseFloat(item.listPrice || item.item_price).toFixed(2),
        brand_name: item.brandName || item.brand_name ,
        sub_total: parseFloat(item.listPrice * item.quantity).toFixed(0),
        tax_price: (parseFloat(item.listPrice * item.quantity) * 0.18).toFixed(2),
        total_price: parseFloat(item.listPrice * item.quantity).toFixed(1),
        cgst: (parseFloat(item.listPrice * item.quantity) * 0.09).toFixed(2),
        sgst: (parseFloat(item.listPrice * item.quantity) * 0.09).toFixed(2),
        igst: (parseFloat(item.listPrice * item.quantity) * 0.18).toFixed(2),
        mrp: parseFloat(item.listPrice || item.mrp).toFixed(2)
      }));

      // Calculate totals
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.listPrice * item.quantity * 1.18), 0).toFixed(1);

      // Extract city and pincode from address for ship_to fields
      const addressParts = shippingAddress.address ? shippingAddress.address.split(',') : [];
      const shipToLocation = customerDetails.city || (addressParts.length > 0 ? addressParts[addressParts.length - 3]?.trim() : null) || null;
      const shipToPincode = customerDetails.post_code ? String(customerDetails.post_code) : null;

      // Build order payload matching the createOrder API contract
      const orderPayload = {
        validity_date: formattedValidityDate,
        customer_code: customerCode,
        employee_code: employeeCode,
        purchase_order_no: null,
        purchase_order_date: null,
        latitude: latitude.toFixed(3),
        longitude: longitude.toFixed(3),
        transaction_track_id: trackId,
        total_price: totalPrice,
        total_quantity: totalQuantity.toString(),
        mobile_number: shippingAddress.phone,
        ship_to_location: shipToLocation,
        ship_to_pincode: shipToPincode,
        site_number: customerDetails.site_number || null,
        part_details: partDetails
      };

      console.log('📦 Placing order:', orderPayload);
      console.log('📦 Customer code being sent:', customerCode);

      // Call API
      const response = await createOrderAPI(orderPayload);

      if (response && (response.order_number || response.id)) {
        console.log('✅ Order placed successfully:', response);
        navigate('/order-success', {
          state: {
            orderResponse: response,
            orderPayload,
            cartItems,
            shippingAddress,
            totals: { basicTotal, gst, total },
          }
        });
      } else {
        const errorMessage = response?.error?.message || response?.message || 'Failed to place order. Please try again.';
        console.error('❌ Order placement failed:', errorMessage);
        navigate('/order-failed', {
          state: {
            errorMessage,
            orderPayload,
            cartItems,
            shippingAddress,
            totals: { basicTotal, gst, total },
          }
        });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (error.code === 1) {
        setOrderError('Location access denied. Please enable location to place order.');
      } else {
        setOrderError('Failed to place order. Please try again.');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleChangeAddress = () => {
    setTempAddress({ ...shippingAddress });
    setShowAddressPopup(true);
  };

  const handleSaveAddress = () => {
    setShippingAddress({ ...tempAddress });
    setShowAddressPopup(false);
  };

  const handleCancelAddress = () => {
    setTempAddress({ ...shippingAddress });
    setShowAddressPopup(false);
  };

  return (
    <>
      <Header />
      <div className="shipping-page">
        <div className="shipping-container">
          <PageNavigate />
          
          <div className="shipping-content">
            {/* Left Section */}
            <div className="shipping-left">
              {/* Shipping Address */}
              <div className="shipping-section">
                <div className="section-header">
                  <h2>Shipping Address</h2>
                  <button className="change-btn" onClick={handleChangeAddress}>
                    Change ✎
                  </button>
                </div>
                {loadingCustomer ? (
                  <div className="address-details">
                    <p>Loading customer details...</p>
                  </div>
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
                      <img 
                        src={item.imageUrl} 
                        alt={item.itemDescription} 
                        className="item-image"
                      />
                      <div className="item-details">
                        <p className="item-name">{item.itemDescription}</p>
                        <p className="item-quantity">{item.quantity} x ₹{Number(item.listPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
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

            {/* Right Section */}
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

                <div className="amount-divider"></div>

                <div className="amount-row total-row">
                  <span className="label">Total</span>
                  <span className="value">₹{total.toFixed(2)}</span>
                </div>

                <button className="place-order-btn" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                  {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER →'}
                </button>

                {orderError && (
                  <div className="order-error">
                    {orderError}
                  </div>
                )}

                {/* Coin Balance */}
                <div className="coin-balance-section">
                  <div className="coin-checkbox">
                    <input
                      type="checkbox"
                      id="useCoins"
                      checked={useCoins}
                      onChange={(e) => setUseCoins(e.target.checked)}
                    />
                    <label htmlFor="useCoins">
                      <span className="coin-icon">🪙</span>
                      <span className="coin-text">Current Balance: ₹{currentBalance}</span>
                    </label>
                  </div>
                  <p className="coin-info">
                    You are eligible now to redeem the coin. You can use super coins once per month. 
                    <a href="#" className="click-here-link">Click here</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Change Popup */}
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
                <input
                  type="text"
                  value={tempAddress.name}
                  onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={tempAddress.phone}
                  onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={tempAddress.address}
                  onChange={(e) => setTempAddress({ ...tempAddress, address: e.target.value })}
                  placeholder="Enter complete address"
                  rows="4"
                />
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
