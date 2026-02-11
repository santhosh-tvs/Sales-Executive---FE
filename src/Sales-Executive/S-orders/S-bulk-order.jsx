import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import maginfyingglass from "../../assets/Icons/MagnifyingGlass.png";
import mappin from "../../assets/Icons/MapPin.png";
import "./S-bulk-order.css";
import "../../styles/S-orders/bulk-order-2.css";

const BulkOrder = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShipToModal, setShowShipToModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [rows, setRows] = useState([{ 
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
  }]);
  const dropdownRef = useRef(null);

  // Mock customer data - replace with API call
  const mockCustomers = [
    {
      id: 1,
      code: "CUST001",
      name: "ABC Motors Pvt Ltd",
      email: "contact@abcmotors.com",
      phone: "+91 9876543210",
      address: "123 Industrial Area, Mumbai, Maharashtra",
      gst: "27ABCDE1234F1Z5"
    },
    {
      id: 2,
      code: "CUST002", 
      name: "XYZ Auto Parts",
      email: "info@xyzauto.com",
      phone: "+91 9876543211",
      address: "456 Commercial Street, Delhi",
      gst: "07XYZAB5678G2H9"
    },
    {
      id: 3,
      code: "CUST003",
      name: "PQR Vehicle Services",
      email: "sales@pqrvehicle.com", 
      phone: "+91 9876543212",
      address: "789 Service Road, Bangalore, Karnataka",
      gst: "29PQRST9012I3J4"
    }
  ];

  // Mock product database for auto-population
  const mockProducts = {
    "PART001": {
      itemName: "Brake Pad Set",
      pkgQty: "1",
      listPrice: "1200.00",
      gst: "18",
      mrp: "1500.00",
      price: "1200.00",
      stock: "50"
    },
    "PART002": {
      itemName: "Oil Filter",
      pkgQty: "1",
      listPrice: "350.00",
      gst: "18",
      mrp: "400.00",
      price: "350.00",
      stock: "100"
    },
    "PART003": {
      itemName: "Spark Plug",
      pkgQty: "4",
      listPrice: "180.00",
      gst: "18",
      mrp: "220.00",
      price: "180.00",
      stock: "200"
    },
    "PART004": {
      itemName: "Air Filter",
      pkgQty: "1",
      listPrice: "450.00",
      gst: "18",
      mrp: "550.00",
      price: "450.00",
      stock: "75"
    },
    "PART005": {
      itemName: "Clutch Plate",
      pkgQty: "1",
      listPrice: "2500.00",
      gst: "18",
      mrp: "3000.00",
      price: "2500.00",
      stock: "25"
    }
  };

  const addressList = [
    "9789328983 / KMS-BHM / Customer Address 1",
    "9789328983 / KMS-WHM / Customer Address 2", 
    "9789328983 / KMS-AHM / Customer Address 3",
  ];

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDropdown(false);
    setCustomerSearchTerm("");
  };

  // Filter customers based on search term
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.code.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Auto-populate product details when item code is entered
    if (field === "itemCode" && value && mockProducts[value]) {
      const product = mockProducts[value];
      updatedRows[index] = {
        ...updatedRows[index],
        itemName: product.itemName,
        pkgQty: product.pkgQty,
        listPrice: product.listPrice,
        gst: product.gst,
        mrp: product.mrp,
        price: product.price,
        stock: product.stock
      };
    }

    // Calculate total when quantity or price changes
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
    if (updatedRows.length === 0) updatedRows.push({ 
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
    });
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { 
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
    }]);
  };

  const handleClearAll = () => {
    setSelectedCustomer(null);
    setRows([{ 
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
    }]);
    setShowDropdown(false);
    setCustomerSearchTerm("");
  };

  const getTotalQuantity = () =>
    rows.reduce((sum, row) => sum + (parseFloat(row.quantity) || 0), 0);

  const getTotalAmount = () =>
    rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);

  const getFilledRowsCount = () =>
    rows.filter((row) => row.itemCode || row.itemName || row.quantity).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="bulk-order-page">
      <Header />
      <Breadcrumb currentPage="Bulk Order Management" />
      
      <div className="bulk-order-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Bulk Order Management</h1>
            <p>Search for customers and create bulk orders efficiently</p>
          </div>
          
          <div className="header-right">
            <div className="enhanced-customer-selector" ref={dropdownRef}>
              <div className="selector-label">Select Customer:</div>
              <div className="customer-selector-dropdown">
                <div 
                  className="selector-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="selector-text">
                    {selectedCustomer ? selectedCustomer.name : "Choose a customer..."}
                  </span>
                  <span className={`selector-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
                </div>
                
                {showDropdown && (
                  <div className="selector-dropdown-menu">
                    {/* Search Input */}
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="search-input-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Customer List */}
                    <div className="dropdown-list">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          <div 
                            key={customer.id} 
                            className="dropdown-customer-item"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="customer-item-info">
                              <div className="customer-item-name">{customer.name}</div>
                              <div className="customer-item-details">
                                <span className="customer-item-code">{customer.code}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-customers-found">
                          <span>No customers found</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Customer Details with Detailed Order Table */}
        {selectedCustomer && (
          <>
            {/* Enhanced Customer Info Header */}
            <div className="enhanced-customer-header">
              <div className="customer-info-left">
                <h2 className="customer-name">{selectedCustomer.name}</h2>
                <div className="customer-details-row">
                  <span className="customer-code">{selectedCustomer.code}</span>
                  <span className="customer-gst">GST: {selectedCustomer.gst}</span>
                  <span className="customer-phone">Phone: {selectedCustomer.phone}</span>
                </div>
              </div>
            </div>

            {/* Detailed Order Table */}
            <div className="enhanced-table-container">
              <table className="enhanced-bulk-table">
                <thead>
                  <tr>
                    <th>S No</th>
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
                      <tr key={index} className={active ? 'active-row' : 'inactive-row'}>
                        <td className="sno-cell">{index + 1}</td>
                        
                        {/* Item Code - Editable */}
                        <td>
                          <input
                            type="text"
                            value={row.itemCode}
                            onChange={(e) => handleInputChange(index, "itemCode", e.target.value)}
                            disabled={!active}
                            className="editable-input"
                            placeholder="Enter part number"
                          />
                        </td>
                        
                        {/* Item Name - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.itemName}
                            readOnly
                            className="readonly-input"
                            placeholder="Auto-filled"
                          />
                        </td>
                        
                        {/* Quantity - Editable without Controls */}
                        <td>
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                            disabled={!active}
                            className="quantity-input-simple"
                            placeholder="0"
                            min="0"
                          />
                        </td>
                        
                        {/* Package Quantity - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.pkgQty}
                            readOnly
                            className="readonly-input"
                          />
                        </td>
                        
                        {/* List Price - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.listPrice}
                            readOnly
                            className="readonly-input"
                          />
                        </td>
                        
                        {/* GST - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.gst}
                            readOnly
                            className="readonly-input"
                          />
                        </td>
                        
                        {/* MRP - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.mrp}
                            readOnly
                            className="readonly-input"
                          />
                        </td>
                        
                        {/* Selling Price - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.price}
                            readOnly
                            className="readonly-input"
                          />
                        </td>
                        
                        {/* Total - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.total}
                            readOnly
                            className="readonly-input total-input"
                          />
                        </td>
                        
                        {/* Stock - Read Only */}
                        <td>
                          <input
                            type="text"
                            value={row.stock}
                            readOnly
                            className="readonly-input stock-input"
                          />
                        </td>
                        
                        {/* Actions */}
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button 
                              type="button"
                              className="delete-btn" 
                              onClick={() => handleDeleteRow(index)}
                              title="Delete Row"
                            >
                              ×
                            </button>
                            {index === rows.length - 1 && (
                              <button 
                                type="button"
                                className="add-btn" 
                                onClick={handleAddRow}
                                title="Add Row"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="enhanced-action-buttons">
              <button 
                type="button"
                className="clear-all-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
              <button
                type="button"
                className="submit-order-btn"
                onClick={() => setShowShipToModal(true)}
              >
                Submit
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!selectedCustomer && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11h-6"/>
              </svg>
            </div>
            <h3>No Customer Selected</h3>
            <p>Select a customer from the dropdown to start creating bulk orders</p>
          </div>
        )}

        {/* Enhanced Ship To Modal */}
        {showShipToModal && (
          <>
            <div
              className="enhanced-modal-overlay"
              onClick={() => setShowShipToModal(false)}
            ></div>
            <div className="enhanced-ship-to-modal">
              {/* Modal Header */}
              <div className="modal-header">
                <h2 className="modal-title">Ship to :</h2>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowShipToModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Address Selection Section */}
              <div className="address-selection-section">
                <div className="search-section">
                  <div className="search-input-container">
                    <input
                      type="text"
                      placeholder="Select Ship to Address"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="address-search-input"
                    />
                  </div>
                </div>

                {/* Address List */}
                <div className="address-list-container">
                  {addressList
                    .filter((addr) =>
                      addr.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((addr, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setSearchTerm(addr);
                        }}
                        className={`address-item ${selectedAddress === addr ? "selected" : ""}`}
                      >
                        <div className="address-icon">
                          <img src={mappin} alt="Map Pin" className="map-pin-icon" />
                        </div>
                        <div className="address-text">{addr}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="order-summary-section-modal">
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">No of Parts Selected</span>
                    <span className="summary-value">{getFilledRowsCount()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Quantity</span>
                    <span className="summary-value">{getTotalQuantity()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Amount</span>
                    <span className="summary-value total-amount">₹{getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Billing Warehouse</span>
                    <span className="summary-value">--</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowShipToModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="submit-btn"
                  onClick={() => {
                    console.log("Submitted to:", selectedAddress);
                    setShowShipToModal(false);
                    navigate("/s-bulk", {
                      state: { selectedCustomer, orderData: rows },
                    });
                  }}
                  disabled={!selectedAddress}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkOrder;
