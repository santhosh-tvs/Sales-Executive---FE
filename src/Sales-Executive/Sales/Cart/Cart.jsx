import React from 'react';
import Header from '../../header/Header';
import CartDetails from './CartDetails';
import CardTotal from './CardTotal';
import PageNavigate from './PageNavigate'; 
import { useCart } from "../../../Context/CartContext";
import "./Cart.css";

const Cart = () => {
    const { cartItems, addToCart, removeFromCart } = useCart();
    
  return (
    <>
      <Header />
      <div className="cart-page">
        <PageNavigate />
        
        <div className="cart-content-wrapper">
          <div className="cart-left">
            <CartDetails />
          </div>

          {/* Hide cart total when empty */}
          {cartItems.length > 0 && (
            <div className="cart-right">
              <CardTotal />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
