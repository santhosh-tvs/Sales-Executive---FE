import React from "react";
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Visits from './Visits';
import Orders from './Orders';
import Payment from './Payment';
import Customers from './Customers';
import './myaction.css';


const MyActions = () => {
  return (
    <div className="actions-dashboard">
      <Header />
      <Breadcrumb currentPage="My Actions" />
      
      <main className="sections-container">
        <Visits />
        <Orders />
        <Payment />
        <Customers />
      </main>
    </div>
  );
};

export default MyActions;