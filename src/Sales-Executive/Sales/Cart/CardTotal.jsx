import React from "react";
import "./CardTotal.css";
import { useCart } from "../../../Context/CartContext";
import { useNavigate } from "react-router-dom";

function CardTotal() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const basicPrice = cartItems.reduce(
    (sum, item) => sum + item.listPrice * item.quantity,
    0
  );

  const gst = basicPrice * 0.18;
  const total = basicPrice + gst;

  // Compute split summary across all cart items
  const splitSummary = cartItems.reduce((acc, item) => {
    const ordered = item.quantity || 0;
    const available = item.availableQty ?? ordered;
    acc.saleQty += Math.min(ordered, available);
    acc.backQty += Math.max(0, ordered - available);
    return acc;
  }, { saleQty: 0, backQty: 0 });

  const hasBackOrder = splitSummary.backQty > 0;

  const handleCheckout = () => {
    navigate("/shipping", {
      state: { cartItems, basicTotal: basicPrice, gst, total }
    });
  };

  return (
    <div className="cardtotal">
      <div className="cardtotal-frame">

        <div className="cardtotal-title">Cart Totals</div>

        <div className="cardtotal-body">

          <div className="cardtotal-row">
            <div className="label">Basic Price</div>
            <div className="value">₹{basicPrice.toFixed(2)}</div>
          </div>

          <div className="cardtotal-row">
            <div className="label">GST (18%)</div>
            <div className="value">₹{gst.toFixed(2)}</div>
          </div>

          <div className="cardtotal-sep" />

          <div className="cardtotal-row total">
            <div className="label">Grand Total</div>
            <div className="value">₹{total.toFixed(2)}</div>
          </div>

          {/* Split summary — only when back order items exist */}
          {hasBackOrder && (
            <div className="cardtotal-split-summary">
              <div className="cardtotal-split-row">
                <span className="cardtotal-split-dot cardtotal-dot-sale" />
                <span className="cardtotal-split-label">Sale Order</span>
                <span className="cardtotal-split-qty cardtotal-qty-sale">{splitSummary.saleQty} units</span>
              </div>
              <div className="cardtotal-split-row">
                <span className="cardtotal-split-dot cardtotal-dot-bo" />
                <span className="cardtotal-split-label">Back Order</span>
                <span className="cardtotal-split-qty cardtotal-qty-bo">{splitSummary.backQty} units</span>
              </div>
              <p className="cardtotal-split-note">
                Available stock → Sale Order. Remaining → Back Order.
              </p>
            </div>
          )}

          <button className="cardtotal-cta" onClick={handleCheckout}>
            Proceed to Checkout
          </button>

        </div>
      </div>
    </div>
  );
}

export default CardTotal;
