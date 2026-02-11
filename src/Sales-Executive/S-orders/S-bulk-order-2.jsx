import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import Header from "../header/Header";
import BulkOrderSearch from "./S-bulk-order-search";
import maginfyingglass from "../../assets/Icons/MagnifyingGlass.png";
import mappin from "../../assets/Icons/MapPin.png";
import "../../styles/S-orders/bulk-order-2.css";

const defaultCustomerDetails = {
  id: 1,
  name: "Sam Automobiles",
  group: "Sam Auto Group",
  companyId: "345678654345",
  companyCode: "SAM4738",
  address: "45, Main Road, Anna Nagar, Madurai - 625020",
  email: "samauto.madurai@example.com",
  phone: "97893 28983",
  status: "Active",
};

const initialRow = {
  itemCode: "",
  itemName: "",
  quantity: "",
  pkgQty: "",
  listPrice: "",
  gst: "",
  mrp: "",
  price: "",
  total: "",
  stock: "",
};

const addressList = [
  "9789328983 / KMS-BHM / Sam Automobiles-Madurai",
  "9789328983 / KMS-WHM / Sam Automobiles-Madurai",
  "9789328983 / KMS-AHM / Sam Automobiles-Madurai",
];

const BulkOrder2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get customer data from navigation state or use default
  const customerDetails = location.state?.selectedCustomer || defaultCustomerDetails;
  
  const [isCustomerAdded, setIsCustomerAdded] = useState(true); // Set to true since customer is already selected
  const [showShipToModal, setShowShipToModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([{ ...initialRow }]); // Start with 1 row

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    const qty = parseFloat(updatedRows[index].quantity) || 0;
    const price = parseFloat(updatedRows[index].price) || 0;
    updatedRows[index].total = (qty * price).toFixed(2);

    setRows(updatedRows);
  };

  const isRowActive = (index) => {
    if (index === 0) return true;
    const prevRow = rows[index - 1];
    return prevRow.itemCode && prevRow.itemName && prevRow.quantity;
  };

  const handleDeleteRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    if (updatedRows.length === 0) updatedRows.push({ ...initialRow });
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { ...initialRow }]);
  };

  const handleClearAll = () => {
    setRows([{ ...initialRow }]);
  };

  const getTotalQuantity = () =>
    rows.reduce((sum, row) => sum + (parseFloat(row.quantity) || 0), 0);

  const getTotalAmount = () =>
    rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);

  const getFilledRowsCount = () =>
    rows.filter((row) => row.itemCode || row.itemName || row.quantity).length;

  return (
    <div>
      <Header />
      <BulkOrderSearch />

      <div className="bulk-2-order-container">
        {/* Customer Info */}
        <div className="bulk-2-customer-name-container">
          <div className="bulk-2-customer-name">
            <h3>{customerDetails.name}</h3>
          </div>
          <div className="bulk-2-customer-code-btn">
            <div className="bulk-2-customer-code">
              <p>{customerDetails.code || customerDetails.companyId}</p>
            </div>
            <div className="bulk-2-customer-btn">
              <button
                onClick={() => {
                  setIsCustomerAdded(true);
                  navigate("", { state: customerDetails });
                }}
                disabled={isCustomerAdded}
              >
                {isCustomerAdded ? "Added" : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container-bulk-2">
          <table className="bulk-2-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Package Quantity</th>
                <th>List Price</th>
                <th>GST(%)</th>
                <th>MRP</th>
                <th>Selling Price</th>
                <th>Total</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const active = isRowActive(index);
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {[
                      "itemCode",
                      "itemName",
                      "quantity",
                      "pkgQty",
                      "listPrice",
                      "gst",
                      "mrp",
                      "price",
                      "stock",
                    ].map((field, i) => (
                      <td key={i}>
                        <input
                          type={
                            ["quantity", "price", "pkgQty", "listPrice", "gst", "mrp"].includes(
                              field
                            )
                              ? "number"
                              : "text"
                          }
                          value={row[field]}
                          onChange={(e) =>
                            handleInputChange(index, field, e.target.value)
                          }
                          disabled={!active}
                        />
                      </td>
                    ))}
                    <td>
                      <input type="text" value={row.total} readOnly />
                    </td>
                    <td className="action-buttons">
                      <button className="ai-close" onClick={() => handleDeleteRow(index)}>
                        <AiOutlineClose size={16} />
                      </button>
                      {index === rows.length - 1 && (
                        <button className="ai-add" onClick={handleAddRow}>
                          <AiOutlinePlus size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="bulk-2-button">
          <div className="bulk-2-button-left">
            <button className="bulk-2-clear-btn" onClick={handleClearAll}>
              Clear All
            </button>
          </div>
          <div className="bulk-2-button-right">
            <button
              className="bulk-2-submit-btn"
              onClick={() => setShowShipToModal(true)}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Ship To Modal */}
      {showShipToModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowShipToModal(false)}
          ></div>
          <div className="bulk2-ship-to-modal">
            <h3>Ship to :</h3>
            <div className="bulk2-search-dropdown">
              <input
                type="text"
                placeholder="Select Ship to Address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <img
                src={maginfyingglass}
                alt="Search Icon"
                className="bulk2-search-icon"
              />
              <ul className="bulk2-address-dropdown">
                {addressList
                  .filter((addr) =>
                    addr.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((addr, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setSearchTerm(addr);
                      }}
                      className={selectedAddress === addr ? "bulk2-selected" : ""}
                    >
                      <img src={mappin} alt="Map Pin" className="bulk2-map-pin" />
                      {addr}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bulk2-summary-box">
              <div className="bulk2-summary-details">
                <p>No of Parts Selected : {getFilledRowsCount()}</p>
                <p>Total Quantity : {getTotalQuantity()}</p>
              </div>
              <div className="bulk2-summary-details-2">
                <p>Total Amount : ₹{getTotalAmount().toFixed(2)}</p>
                <p>Billing Warehouse : --</p>
              </div>
            </div>

            <div className="bulk2-modal-buttons">
              <button onClick={() => setShowShipToModal(false)}>Cancel</button>
              <button
                onClick={() => {
                  console.log("Submitted to:", selectedAddress);
                  setShowShipToModal(false);
                  navigate("s-bulk", {
                    state: customerDetails,
                  });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkOrder2;
