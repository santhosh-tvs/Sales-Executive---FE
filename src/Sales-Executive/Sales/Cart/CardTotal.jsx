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

  const handleCheckout = () => {
    navigate("/shipping", {
      state: {
        cartItems,
        basicTotal: basicPrice,
        gst,
        total
      }
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

          <button className="cardtotal-cta" onClick={handleCheckout}>
            Proceed to Checkout
          </button>

        </div>
      </div>
    </div>
  );
}

export default CardTotal;
