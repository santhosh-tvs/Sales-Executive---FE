import React from "react";
import {  useNavigate } from "react-router-dom";
import Header from "../header/Header";
import maginfyingglass from "../../assets/Icons/MagnifyingGlass.png";
import "../../styles/S-orders/bulk-order-search.css";

const BulkOrderSearch = () => {
  const navigate = useNavigate();

  const handleClickBulk = () => {
    navigate("/s-bulk-order-2");
  };

  return (
    <div>
      <Header />
      <div className="bulk-order-search-container">
        <div className="bulk-order-search-search">
          <div className="bulk-order-search-left">
            {" "}
            <h2>Customer search for Bulk Order</h2>
          </div>
          <div className="bulk-order-search-right">
            {" "}
            <div className="bulk-order-search-search-input">
              <input
                type="text"
                placeholder="Search Customer code or Name"
                className="bulk-order-search-search"
                onClick={handleClickBulk}
              />
            </div>
            <div className="bulk-order-search-search-icon-container">
              {" "}
              <img
                src={maginfyingglass}
                alt="Search Icon"
                className="bulk-order-search-search-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderSearch;
