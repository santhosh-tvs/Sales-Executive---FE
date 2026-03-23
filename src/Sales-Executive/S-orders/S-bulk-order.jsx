import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import mappin from "../../assets/Icons/MapPin.png";
import "./S-bulk-order.css";
import { apiService } from "../../services/apiservice";
import { partsListAPI, createOrderAPI, generalSearchAPI, stockListAPI } from "../../services/api";
import apiConfigManager from "../../services/apiConfig";

const EMPTY_ROW = () => ({
  partNumber: "",
  itemName: "",
  quantity: "",
  pkgQty: "",
  listPrice: "",
  gst: "",
  mrp: "",
  price: "",
  total: "",
  lineCode: "",
  brandName: "",
  hsnCode: "",
  warehouse: "",
  loading: false,
  error: "",
  suggestions: [],
  showSuggestions: false,
});

const getEmployeeCode = () => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  return localStorage.getItem("sales_executive_code") || userData.sales_executive_code || "";
};

const BulkOrder = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const partDebounceRefs = useRef({});
  const searchDebounceRefs = useRef({});
  const partInputRefs = useRef({});  // ref map: index → input DOM node

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Order rows
  const [rows, setRows] = useState([EMPTY_ROW()]);

  // Ship-to modal
  const [showShipToModal, setShowShipToModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [addressList, setAddressList] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Customers ──────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async (query = "") => {
    setLoadingCustomers(true);
    try {
      const params = query ? { search: query } : {};
      const data = await apiService.get("/profile/sales-executive-customers", params);
      setCustomers(data?.success ? data.data || [] : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearchTerm.length >= 3 || customerSearchTerm.length === 0) {
        fetchCustomers(customerSearchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerSearchTerm, fetchCustomers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowDropdown(false);
    setCustomerSearchTerm("");
    setSelectedAddress("");
    setAddressList([]);
    setLoadingAddresses(true);

    try {
      const res = await apiService.get(`/profile/view-customer/${customer.customer_code}`);
      if (res?.success && res.user_detail) {
        apiConfigManager.updateFromCustomer(res);
        const d = res.user_detail;

        // Build address string
        const addrParts = [d.address1, d.address2, d.address3, d.address4, d.city, d.state, d.post_code]
          .filter(Boolean).join(", ");
        const phone = d.phone_number || "";
        const siteCode = d.site_code || d.site_number || "";

        // Build ship-to options — one entry per warehouse if available
        const warehouses = [d.primary_ware_house, d.secondary_ware_house, d.teritary_ware_house]
          .filter(Boolean);

        let addresses = [];
        if (warehouses.length > 0) {
          addresses = warehouses.map(
            (wh) => `${phone ? phone + " / " : ""}${wh}${siteCode ? " / " + siteCode : ""}${addrParts ? " — " + addrParts : ""}`
          );
        } else if (addrParts) {
          addresses = [`${phone ? phone + " / " : ""}${siteCode || customer.customer_code} — ${addrParts}`];
        }

        setAddressList(addresses);
      }
    } catch {
      // silently fall back to empty list
    } finally {
      setLoadingAddresses(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.customer_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.customer_code?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // ── Parts API lookup ────────────────────────────────────────────────────────
  const fetchPartDetails = useCallback(async (index, partNumber) => {
    if (!partNumber || !selectedCustomer) return;

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], loading: true, error: "" };
      return updated;
    });

    try {
      const res = await partsListAPI({
        brandPriority: null,
        limit: 2,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: apiConfigManager.getUnitCode(),
        partNumber,
        model: null,
        brand: null,
        subAggregate: null,
        aggregate: null,
        make: null,
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      });

      if (res?.success && res.data?.length > 0) {
        const part = res.data[0];
        const listPrice = parseFloat(part.listPrice || part.mrp || 0);
        const qty = parseFloat(rows[index]?.quantity) || 0;

        // Try to get the real warehouse via stock API
        let warehouseCode = "";
        try {
          const unitCode = apiConfigManager.getUnitCode();
          const customerWarehouses = apiConfigManager.getCustomerWarehouses();
          const warehouseToQuery = customerWarehouses.length > 0 ? customerWarehouses[0] : null;
          const stockRes = await stockListAPI({
            customerCode: unitCode,
            partNumber,
            inventoryName: warehouseToQuery,
            entity: null,
            software: null,
          });
          if (stockRes?.success && stockRes.data?.length > 0) {
            warehouseCode = stockRes.data[0].inventoryName || "";
          }
        } catch {
          // silently ignore — will fall back to primary_ware_house at submit time
        }

        setRows((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            itemName: part.itemDescription || "",
            pkgQty: part.salesUom || "",
            listPrice: part.listPrice || "",
            gst: part.taxpercent || "",
            mrp: part.mrp || "",
            price: part.listPrice || "",
            lineCode: part.lineCode || "",
            brandName: part.brandName || "",
            hsnCode: part.hsnCode || "",
            warehouse: warehouseCode,
            total: qty > 0 ? (qty * listPrice).toFixed(2) : "",
            loading: false,
            error: "",
          };
          return updated;
        });
      } else {
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            itemName: "",
            pkgQty: "",
            listPrice: "",
            gst: "",
            mrp: "",
            price: "",
            lineCode: "",
            brandName: "",
            hsnCode: "",
            warehouse: "",
            total: "",
            loading: false,
            error: "Part not found",
          };
          return updated;
        });
      }
    } catch {
      setRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], loading: false, error: "Lookup failed" };
        return updated;
      });
    }
  }, [selectedCustomer, rows]);

  // ── Part number search (autocomplete) ──────────────────────────────────────
  const searchPartSuggestions = useCallback(async (index, searchKey) => {
    if (!searchKey || searchKey.length < 2) {
      setRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], suggestions: [], showSuggestions: false };
        return updated;
      });
      return;
    }
    try {
      const unitCode = apiConfigManager.getUnitCode();
      const res = await generalSearchAPI({
        customerCode: unitCode || "0046",
        searchKey,
      });
      const suggestions = res?.success && res.data?.length > 0 ? res.data : [];
      setRows((prev) => {
        const updated = [...prev];
        const currentVal = updated[index]?.partNumber?.trim() || "";
        if (currentVal.length >= 2) {
          updated[index] = { ...updated[index], suggestions, showSuggestions: suggestions.length > 0 };
        }
        return updated;
      });
    } catch {
      // silently ignore
    }
  }, []);

  // ── Row handlers ────────────────────────────────────────────────────────────
  const handlePartNumberChange = (index, value) => {
    const trimmed = value.trim();

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        partNumber: value,
        itemName: "",
        pkgQty: "",
        listPrice: "",
        gst: "",
        mrp: "",
        price: "",
        total: "",
        lineCode: "",
        brandName: "",
        hsnCode: "",
        loading: false,
        error: "",
        // clear suggestions only when input is too short; otherwise keep until API responds
        suggestions: trimmed.length < 2 ? [] : updated[index].suggestions,
        showSuggestions: trimmed.length < 2 ? false : updated[index].showSuggestions,
      };
      return updated;
    });

    // Clear both debounce timers
    if (searchDebounceRefs.current[index]) clearTimeout(searchDebounceRefs.current[index]);
    if (partDebounceRefs.current[index]) clearTimeout(partDebounceRefs.current[index]);

    if (trimmed.length < 2) {
      // immediately hide suggestions
      setRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], suggestions: [], showSuggestions: false };
        return updated;
      });
      return;
    }

    // Debounce suggestions fetch (300ms)
    searchDebounceRefs.current[index] = setTimeout(() => {
      searchPartSuggestions(index, trimmed);
    }, 300);

    // Debounce full part details fetch (700ms)
    if (trimmed.length >= 3) {
      partDebounceRefs.current[index] = setTimeout(() => {
        fetchPartDetails(index, trimmed);
      }, 700);
    }
  };

  // When user picks a suggestion from the dropdown
  const handleSelectSuggestion = (index, suggestion) => {
    const partNo = suggestion.partNumber;
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], partNumber: partNo, suggestions: [], showSuggestions: false };
      return updated;
    });
    fetchPartDetails(index, partNo);
  };

  const hideSuggestions = (index) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], showSuggestions: false };
      return updated;
    });
  };

  const handleQuantityChange = (index, value) => {
    setRows((prev) => {
      const updated = [...prev];
      const listPrice = parseFloat(updated[index].listPrice) || 0;
      const qty = parseFloat(value) || 0;
      updated[index] = {
        ...updated[index],
        quantity: value,
        total: listPrice > 0 && qty > 0 ? (qty * listPrice).toFixed(2) : "",
      };
      return updated;
    });
  };

  const isRowActive = (index) => {
    if (index === 0) return true;
    const prev = rows[index - 1];
    return !!(prev.partNumber && prev.itemName);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [EMPTY_ROW()] : updated;
    });
  };

  const handleAddRow = () => setRows((prev) => [...prev, EMPTY_ROW()]);

  const handleClearAll = () => {
    setSelectedCustomer(null);
    setRows([EMPTY_ROW()]);
    setShowDropdown(false);
    setCustomerSearchTerm("");
    setSubmitError("");
    setAddressList([]);
    setSelectedAddress("");
  };

  const getTotalQuantity = () =>
    rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);

  const getTotalAmount = () =>
    rows.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);

  const getFilledRowsCount = () =>
    rows.filter((r) => r.partNumber && r.itemName).length;

  // ── Submit order ────────────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    const validRows = rows.filter((r) => r.partNumber && r.itemName && r.quantity);
    if (!validRows.length) {
      setSubmitError("Please add at least one valid part with quantity.");
      return;
    }
    if (!selectedAddress) {
      setSubmitError("Please select a ship-to address.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // ── Geocode customer location (same as Shipping.jsx) ──────────────────
      const customerDetails = apiConfigManager.getCustomerDetails();
      let latitude = "0.000";
      let longitude = "0.000";
      let mobileNumber = "";
      let shipToPincode = null;

      if (customerDetails) {
        mobileNumber = customerDetails.phone_number || "";
        shipToPincode = customerDetails.post_code ? String(customerDetails.post_code) : null;

        const geocodeQueries = [
          [customerDetails.city, customerDetails.state, customerDetails.post_code].filter(Boolean).join(", ") + ", India",
          customerDetails.post_code ? `${customerDetails.post_code}, India` : null,
          customerDetails.city ? `${customerDetails.city}, ${customerDetails.state || "India"}` : null,
        ].filter(Boolean);

        for (const query of geocodeQueries) {
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
              { headers: { "User-Agent": "MyTVS-Sales-App" } }
            );
            const data = await resp.json();
            if (data && data.length > 0) {
              latitude = parseFloat(data[0].lat).toFixed(3);
              longitude = parseFloat(data[0].lon).toFixed(3);
              break;
            }
          } catch {
            // try next query
          }
        }
      }

      // ── Build payload ─────────────────────────────────────────────────────
      const empCode = getEmployeeCode();
      const now = new Date();
      const trackId =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0") +
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        now.getSeconds().toString().padStart(2, "0") +
        Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 30);
      const formattedValidityDate = validityDate.toISOString().split("T")[0];

      // Get primary warehouse from customer details (fallback)
      const primaryWarehouse = customerDetails?.primary_ware_house || "";

      const partDetails = validRows.map((r) => {
        const listPrice = parseFloat(r.listPrice) || 0;
        const qty = parseFloat(r.quantity) || 0;
        // Use per-part warehouse from stock API; fall back to primary warehouse
        const warehouseCode = r.warehouse || primaryWarehouse;
        return {
          parts_no: r.partNumber,
          parts_name: r.itemName,
          quantity: qty,
          warehouse: warehouseCode,
          item_price: listPrice.toFixed(2),
          brand_name: r.brandName || "",
          sub_total: (listPrice * qty).toFixed(0),
          tax_price: (listPrice * qty * 0.18).toFixed(2),
          total_price: (listPrice * qty).toFixed(1),
          cgst: (listPrice * qty * 0.09).toFixed(2),
          sgst: (listPrice * qty * 0.09).toFixed(2),
          igst: (listPrice * qty * 0.18).toFixed(2),
          mrp: (parseFloat(r.mrp) || listPrice).toFixed(2),
        };
      });

      const totalQuantity = validRows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
      const totalPrice = validRows
        .reduce((s, r) => {
          const lp = parseFloat(r.listPrice) || 0;
          const qty = parseFloat(r.quantity) || 0;
          return s + lp * qty * 1.18;
        }, 0)
        .toFixed(1);

      const shipToLocation = customerDetails?.city || selectedAddress || null;

      const orderPayload = {
        validity_date: formattedValidityDate,
        customer_code: selectedCustomer.customer_code,
        employee_code: empCode,
        purchase_order_no: null,
        purchase_order_date: null,
        latitude,
        longitude,
        transaction_track_id: trackId,
        total_price: totalPrice,
        total_quantity: totalQuantity.toString(),
        mobile_number: mobileNumber,
        ship_to_location: shipToLocation,
        ship_to_pincode: shipToPincode,
        site_number: customerDetails?.site_number || null,
        part_details: partDetails,
      };

      const response = await createOrderAPI(orderPayload);

      if (response && (response.order_number || response.id || response.success)) {
        setShowShipToModal(false);

        // Build cartItems shape for OrderSuccess
        const cartItemsForSuccess = validRows.map((r) => ({
          itemDescription: r.itemName,
          partNumber: r.partNumber,
          brandName: r.brandName || "",
          quantity: parseFloat(r.quantity) || 0,
          listPrice: parseFloat(r.listPrice) || 0,
        }));

        // Build shippingAddress for OrderSuccess
        const addrParts = [
          customerDetails?.address1,
          customerDetails?.address2,
          customerDetails?.address3,
          customerDetails?.address4,
          customerDetails?.city,
          customerDetails?.state,
          customerDetails?.post_code,
        ].filter(Boolean).join(", ");

        const shippingAddress = {
          name: selectedCustomer.customer_name || "",
          phone: mobileNumber,
          address: addrParts,
        };

        // Compute totals for OrderSuccess
        const basicTotal = validRows.reduce((s, r) => s + (parseFloat(r.listPrice) || 0) * (parseFloat(r.quantity) || 0), 0);
        const gst = basicTotal * 0.18;
        const total = basicTotal + gst;

        navigate("/order-success", {
          state: {
            orderResponse: response,
            orderPayload,
            cartItems: cartItemsForSuccess,
            shippingAddress,
            totals: { basicTotal, gst, total },
          },
        });
      } else {
        setSubmitError(response?.message || "Order submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Order submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bulk-order-page">
      <Header />
      <Breadcrumb
        crumbs={[
          { label: "Home", path: "/sales-home" },
          { label: "Orders", path: "/s-bulk" },
          { label: "Bulk Order Management" },
        ]}
      />

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
                <input
                  type="text"
                  placeholder={
                    selectedCustomer
                      ? selectedCustomer.customer_name
                      : "Search customer by name or code..."
                  }
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="customer-search-input"
                />

                {showDropdown && (
                  <div className="selector-dropdown-menu">
                    <div className="dropdown-list">
                      {loadingCustomers ? (
                        <div className="dropdown-loading">Loading customers...</div>
                      ) : filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.customer_id}
                            className="dropdown-customer-item"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="customer-item-info">
                              <div className="customer-item-name">{customer.customer_name}</div>
                              <div className="customer-item-details">
                                <span className="customer-item-code">{customer.customer_code}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-customers-found">
                          <span>
                            {customerSearchTerm
                              ? "No customers found matching your search"
                              : "Start typing to search customers"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Customer + Order Table */}
        {selectedCustomer && (
          <>
            <div className="enhanced-customer-header">
              <div className="customer-info-left">
                <h2 className="customer-name">{selectedCustomer.customer_name}</h2>
                <div className="customer-details-row">
                  <span className="customer-code">{selectedCustomer.customer_code}</span>
                </div>
              </div>
            </div>

            <div className="enhanced-table-container">
              <table className="enhanced-bulk-table">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Part Number</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Pkg Qty</th>
                    <th>List Price</th>
                    <th>GST (%)</th>
                    <th>MRP</th>
                    <th>Selling Price</th>
                    <th>Total</th>
                    <th>Brand</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const active = isRowActive(index);
                    return (
                      <tr key={index} className={active ? "active-row" : "inactive-row"}>
                        <td className="sno-cell">{index + 1}</td>

                        {/* Part Number — editable, triggers API */}
                        <td style={{ position: "relative" }}>
                          <div className="part-input-wrap">
                            <input
                              type="text"
                              ref={(el) => { partInputRefs.current[index] = el; }}
                              value={row.partNumber}
                              onChange={(e) => handlePartNumberChange(index, e.target.value)}
                              onBlur={() => setTimeout(() => hideSuggestions(index), 300)}
                              disabled={!active}
                              className="editable-input"
                              placeholder="Enter part no."
                            />
                            {row.loading && <span className="part-spinner" />}
                          </div>
                          {row.showSuggestions && row.suggestions.length > 0 &&
                            ReactDOM.createPortal(
                              (() => {
                                const inputEl = partInputRefs.current[index];
                                const rect = inputEl ? inputEl.getBoundingClientRect() : null;
                                if (!rect) return null;
                                return (
                                  <div
                                    className="part-suggestions"
                                    style={{
                                      position: "fixed",
                                      top: rect.bottom + 2,
                                      left: rect.left,
                                      width: Math.max(rect.width, 260),
                                      zIndex: 99999,
                                    }}
                                  >
                                    {row.suggestions.map((s, si) => (
                                      <div
                                        key={si}
                                        className="part-suggestion-item"
                                        onMouseDown={() => handleSelectSuggestion(index, s)}
                                      >
                                        <span className="suggestion-part-no">{s.partNumber}</span>
                                        {s.itemName && <span className="suggestion-item-name">{s.itemName}</span>}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })(),
                              document.body
                            )
                          }
                          {row.error && <div className="part-error">{row.error}</div>}
                        </td>

                        {/* Item Name — read only */}
                        <td>
                          <input
                            type="text"
                            value={row.itemName}
                            readOnly
                            className="readonly-input"
                            placeholder="Auto-filled"
                          />
                        </td>

                        {/* Quantity — only editable field */}
                        <td>
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            disabled={!active || !row.itemName}
                            className="quantity-input-simple"
                            placeholder="0"
                            min="1"
                          />
                        </td>

                        {/* Pkg Qty — read only */}
                        <td>
                          <input type="text" value={row.pkgQty} readOnly className="readonly-input" />
                        </td>

                        {/* List Price — read only */}
                        <td>
                          <input type="text" value={row.listPrice} readOnly className="readonly-input" />
                        </td>

                        {/* GST — read only */}
                        <td>
                          <input type="text" value={row.gst} readOnly className="readonly-input" />
                        </td>

                        {/* MRP — read only */}
                        <td>
                          <input type="text" value={row.mrp} readOnly className="readonly-input" />
                        </td>

                        {/* Selling Price — read only */}
                        <td>
                          <input type="text" value={row.price} readOnly className="readonly-input" />
                        </td>

                        {/* Total — read only */}
                        <td>
                          <input type="text" value={row.total} readOnly className="readonly-input total-input" />
                        </td>

                        {/* Brand — read only */}
                        <td>
                          <input type="text" value={row.brandName} readOnly className="readonly-input" />
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

            <div className="enhanced-action-buttons">
              <button type="button" className="clear-all-btn" onClick={handleClearAll}>
                Clear All
              </button>
              <button
                type="button"
                className="submit-order-btn"
                onClick={() => { setSubmitError(""); setShowShipToModal(true); }}
                disabled={getFilledRowsCount() === 0}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <h3>No Customer Selected</h3>
            <p>Select a customer from the dropdown to start creating bulk orders</p>
          </div>
        )}

        {/* Ship To Modal */}
        {showShipToModal && (
          <>
            <div className="enhanced-modal-overlay" onClick={() => setShowShipToModal(false)} />
            <div className="enhanced-ship-to-modal">
              <div className="modal-header">
                <h2 className="modal-title">Ship to :</h2>
                <button className="modal-close-btn" onClick={() => setShowShipToModal(false)}>
                  ×
                </button>
              </div>

              <div className="address-selection-section">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Select Ship to Address"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    className="address-search-input"
                  />
                </div>
                <div className="address-list-container">
                  {loadingAddresses ? (
                    <div className="dropdown-loading">Loading addresses...</div>
                  ) : addressList.length === 0 ? (
                    <div className="no-customers-found">No addresses found for this customer</div>
                  ) : addressList
                    .filter((addr) =>
                      addr.toLowerCase().includes(addressSearch.toLowerCase())
                    )
                    .map((addr, i) => (
                      <div
                        key={i}
                        onClick={() => { setSelectedAddress(addr); setAddressSearch(addr); }}
                        className={`address-item ${selectedAddress === addr ? "selected" : ""}`}
                      >
                        <img src={mappin} alt="Map Pin" className="map-pin-icon" />
                        <div className="address-text">{addr}</div>
                      </div>
                    ))}
                </div>
              </div>

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

              {submitError && <div className="submit-error">{submitError}</div>}

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowShipToModal(false)}>
                  Cancel
                </button>
                <button
                  className="submit-btn"
                  onClick={handleSubmitOrder}
                  disabled={!selectedAddress || submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
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
