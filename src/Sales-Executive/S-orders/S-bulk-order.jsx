import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Spinner from "../components/Spinner/Spinner";
import OrderPlacingOverlay from "../../components/OrderPlacingOverlay";
import "./S-bulk-order.css";
import WarehousePickerModal from "../components/WarehousePickerModal/WarehousePickerModal";
import { apiService } from "../../services/apiservice";
import { partsListAPI, createOrderAPI, generalSearchAPI, customerDetails as customerDetailsAPI, warehouseMappingAPI, itemMasterAPI, stockCheckNewAPI } from "../../services/api";
import apiConfigManager from "../../services/apiConfig";

const EMPTY_ROW = () => ({
  partNumber: "", itemName: "", quantity: "", pkgQty: "",
  listPrice: "", gst: "", mrp: "", price: "", total: "",
  lineCode: "", brandName: "", hsnCode: "", warehouse: "",
  loading: false, error: "", suggestions: [], showSuggestions: "",
});

const getEmployeeCode = () => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  return localStorage.getItem("sales_executive_code") || userData.sales_executive_code || "";
};

const BulkOrder = () => {
  const navigate = useNavigate();
  const partInputRefs = useRef({});
  const searchDebounceRefs = useRef({});
  const partDebounceRefs = useRef({});

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerFinancials, setCustomerFinancials] = useState(null);

  // Ship To — must be selected before searching parts
  const [shipToList, setShipToList] = useState([]);
  const [selectedShipTo, setSelectedShipTo] = useState("");
  const [loadingShipTo, setLoadingShipTo] = useState(false);

  // Warehouse modal — shown after part is found
  const [warehouseModal, setWarehouseModal] = useState(null); // { index, partData, warehouses: [{name, qty}] }
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [billingWarehouse, setBillingWarehouse] = useState("--");
  const [loadingWarehouseStock, setLoadingWarehouseStock] = useState(false);

  // Order rows
  const [rows, setRows] = useState([EMPTY_ROW()]);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validityDate, setValidityDate] = useState("");

  // ── Fetch customers ──────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async (query = "") => {
    setLoadingCustomers(true);
    try {
      const data = await apiService.get("/profile/sales-executive-customers", query ? { search: query } : {});
      setCustomers(data?.success ? data.data || [] : []);
    } catch { setCustomers([]); }
    finally { setLoadingCustomers(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(customerSearchTerm), 400);
    return () => clearTimeout(t);
  }, [customerSearchTerm, fetchCustomers]);

  // ── Select customer ──────────────────────────────────────────────────────
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm("");
    setSelectedShipTo("");
    setShipToList([]);
    setRows([EMPTY_ROW()]);
    setBillingWarehouse("--");
    setLoadingShipTo(true);

    try {
      const res = await apiService.get(`/profile/view-customer/${customer.customer_code}`);
      if (res?.success && res.user_detail) {
        apiConfigManager.updateFromCustomer(res);
        const d = res.user_detail;

        if (d.account_number) {
          customerDetailsAPI({ accountNumber: d.account_number.toString() })
            .then(fin => { if (fin) setCustomerFinancials({ ...fin, warehouse: d.primary_ware_house || "" }); })
            .catch(() => {});
        }

        // Build ship-to options from warehouses
        const warehouses = [d.primary_ware_house, d.secondary_ware_house, d.teritary_ware_house].filter(Boolean);

        const options = warehouses.length > 0
          ? warehouses.map(wh => `${wh} | ${customer.customer_code} | ${customer.customer_name}`)
          : [`${customer.customer_code} | ${customer.customer_name}`];

        setShipToList(options);
      }
    } catch { /* ignore */ }
    finally { setLoadingShipTo(false); }
  };

  // ── Part search & details ────────────────────────────────────────────────
  const searchPartSuggestions = useCallback(async (index, searchKey) => {
    if (!searchKey || searchKey.length < 2) {
      setRows(prev => { const u = [...prev]; u[index] = { ...u[index], suggestions: [], showSuggestions: false }; return u; });
      return;
    }
    try {
      const res = await generalSearchAPI({ customerCode: apiConfigManager.getUnitCode() || "0046", searchKey });
      const suggestions = res?.success && res.data?.length > 0 ? res.data : [];
      setRows(prev => {
        const u = [...prev];
        if ((u[index]?.partNumber?.trim() || "").length >= 2)
          u[index] = { ...u[index], suggestions, showSuggestions: suggestions.length > 0 };
        return u;
      });
    } catch { /* ignore */ }
  }, []);

  const fetchPartDetails = useCallback(async (index, partNumber) => {
    if (!partNumber || !selectedCustomer || !selectedShipTo) return;
    setRows(prev => { const u = [...prev]; u[index] = { ...u[index], loading: true, error: "" }; return u; });

    try {
      const res = await partsListAPI({
        brandPriority: null, limit: 2, offset: 0, sortOrder: "ASC", fieldOrder: null,
        customerCode: apiConfigManager.getUnitCode(), partNumber,
        model: null, brand: null, subAggregate: null, aggregate: null,
        make: null, variant: null, fuelType: null, vehicle: null, year: null,
      });

      if (res?.success && res.data?.length > 0) {
        const part = res.data[0];

        // ── If billing warehouse already chosen — skip modal, auto-assign ──
        if (billingWarehouse && billingWarehouse !== "--") {
          const listPrice = parseFloat(part.listPrice || part.mrp || 0);
          const qty = parseFloat(rows[index]?.quantity) || 0;
          setRows(prev => {
            const u = [...prev];
            u[index] = {
              ...u[index],
              itemName:    part.itemDescription || "",
              pkgQty:      part.salesUom || "",
              listPrice:   part.listPrice || "",
              gst:         part.taxpercent || "",
              mrp:         part.mrp || "",
              price:       part.listPrice || "",
              lineCode:    part.lineCode || "",
              brandName:   part.brandName || "",
              hsnCode:     part.hsnCode || "",
              warehouse:   billingWarehouse,
              availableQty: 0,
              total:       qty > 0 ? (qty * listPrice).toFixed(2) : "",
              loading: false, error: "",
            };
            return u;
          });
          return;
        }

        // ── First part — show warehouse modal ──
        setRows(prev => { const u = [...prev]; u[index] = { ...u[index], loading: false, error: "" }; return u; });
        setSelectedWarehouse("");
        setLoadingWarehouseStock(true);
        setWarehouseModal({ index, partData: part, warehouses: [] });

        // Load all warehouses from warehouse mapping API
        let allWarehouses = [];
        try {
          const whRes = await warehouseMappingAPI(selectedCustomer.customer_code);
          if (whRes?.success && whRes.data?.length > 0) {
            allWarehouses = whRes.data.map(w => w.warehouse_name).filter(Boolean);
          }
        } catch { /* ignore */ }

        // Fallback to locally stored warehouses
        if (allWarehouses.length === 0) {
          allWarehouses = apiConfigManager.getCustomerWarehouses();
        }

        // Fetch stock qty for each warehouse using itemMasterAPI + stockCheckNewAPI
        const warehousesWithQty = await (async () => {
          try {
            const itemData = await itemMasterAPI(part.partNumber);
            if (!itemData || itemData.length === 0) return allWarehouses.map(wh => ({ name: wh, qty: 0 }));
            const inventoryItemId = String(itemData[0].inventoryItemId);
            const stockData = await stockCheckNewAPI(inventoryItemId, allWarehouses);
            return allWarehouses.map(wh => {
              const records = Array.isArray(stockData)
                ? stockData.filter(r => {
                    const orgCode = (r.organization_code || r.inventoryName || r.warehouse || '').toLowerCase();
                    return orgCode === wh.toLowerCase() || orgCode.includes(wh.toLowerCase());
                  })
                : [];
              const qty = records.reduce((s, r) => s + (parseInt(r.available_to_reserve || 0) || 0), 0);
              return { name: wh, qty };
            });
          } catch {
            return allWarehouses.map(wh => ({ name: wh, qty: 0 }));
          }
        })();
        setWarehouseModal({ index, partData: part, warehouses: warehousesWithQty });
        setLoadingWarehouseStock(false);
      } else {
        setRows(prev => {
          const u = [...prev];
          u[index] = { ...u[index], loading: false, error: "Part not found", itemName: "", listPrice: "", gst: "", mrp: "", price: "", pkgQty: "", total: "" };
          return u;
        });
      }
    } catch {
      setRows(prev => { const u = [...prev]; u[index] = { ...u[index], loading: false, error: "Lookup failed" }; return u; });
    }
  }, [selectedCustomer, selectedShipTo, billingWarehouse, rows]);

  // ── Warehouse modal confirm ───────────────────────────────────────────────
  const handleWarehouseConfirm = () => {
    if (!selectedWarehouse || !warehouseModal) return;
    const { index, partData } = warehouseModal;
    const listPrice = parseFloat(partData.listPrice || partData.mrp || 0);
    const qty = parseFloat(rows[index]?.quantity) || 0;
    const selectedWhObj = warehouseModal.warehouses.find(w => w.name === selectedWarehouse);

    setRows(prev => {
      const u = [...prev];
      u[index] = {
        ...u[index],
        itemName: partData.itemDescription || "",
        pkgQty: partData.salesUom || "",
        listPrice: partData.listPrice || "",
        gst: partData.taxpercent || "",
        mrp: partData.mrp || "",
        price: partData.listPrice || "",
        lineCode: partData.lineCode || "",
        brandName: partData.brandName || "",
        hsnCode: partData.hsnCode || "",
        warehouse: selectedWarehouse,
        availableQty: selectedWhObj?.qty || 0,
        total: qty > 0 ? (qty * listPrice).toFixed(2) : "",
        loading: false, error: "",
      };
      return u;
    });

    setBillingWarehouse(selectedWarehouse);
    setWarehouseModal(null);
    setSelectedWarehouse("");
  };

  // ── Row handlers ─────────────────────────────────────────────────────────
  const handlePartNumberChange = (index, value) => {
    const trimmed = value.trim();
    setRows(prev => {
      const u = [...prev];
      u[index] = { ...u[index], partNumber: value, itemName: "", pkgQty: "", listPrice: "", gst: "", mrp: "", price: "", total: "", lineCode: "", brandName: "", hsnCode: "", loading: false, error: "",
        suggestions: trimmed.length < 2 ? [] : u[index].suggestions,
        showSuggestions: trimmed.length < 2 ? false : u[index].showSuggestions,
      };
      return u;
    });

    if (searchDebounceRefs.current[index]) clearTimeout(searchDebounceRefs.current[index]);
    if (partDebounceRefs.current[index]) clearTimeout(partDebounceRefs.current[index]);

    if (trimmed.length < 2) return;

    searchDebounceRefs.current[index] = setTimeout(() => searchPartSuggestions(index, trimmed), 300);
    if (trimmed.length >= 3)
      partDebounceRefs.current[index] = setTimeout(() => fetchPartDetails(index, trimmed), 700);
  };

  const handleSelectSuggestion = (index, suggestion) => {
    const partNo = suggestion.partNumber;
    setRows(prev => { const u = [...prev]; u[index] = { ...u[index], partNumber: partNo, suggestions: [], showSuggestions: false }; return u; });
    fetchPartDetails(index, partNo);
  };

  const hideSuggestions = (index) => {
    setRows(prev => { const u = [...prev]; u[index] = { ...u[index], showSuggestions: false }; return u; });
  };

  const handleQuantityChange = (index, value) => {
    setRows(prev => {
      const u = [...prev];
      const listPrice = parseFloat(u[index].listPrice) || 0;
      const qty = parseFloat(value) || 0;
      u[index] = { ...u[index], quantity: value, total: listPrice > 0 && qty > 0 ? (qty * listPrice).toFixed(2) : "" };
      return u;
    });
  };

  const isRowActive = (index) => index === 0 || !!(rows[index - 1]?.partNumber && rows[index - 1]?.itemName);

  const handleDeleteRow = (index) => {
    setRows(prev => { const u = prev.filter((_, i) => i !== index); return u.length === 0 ? [EMPTY_ROW()] : u; });
  };

  const handleClearAll = () => {
    setSelectedCustomer(null); setCustomerFinancials(null); setRows([EMPTY_ROW()]);
    setCustomerSearchTerm(""); setSubmitError(""); setShipToList([]); setSelectedShipTo(""); setBillingWarehouse("--");
  };

  const getTotalQuantity = () => rows.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
  const getTotalAmount = () => rows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const getFilledRowsCount = () => rows.filter(r => r.partNumber && r.itemName).length;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedShipTo) { setSubmitError("Please select a Ship To address first."); return; }
    if (!validityDate) { setSubmitError("Please select a validity date."); return; }
    const validRows = rows.filter(r => r.partNumber && r.itemName && r.quantity);
    if (!validRows.length) { setSubmitError("Please add at least one valid part with quantity."); return; }

    setSubmitting(true); setSubmitError("");

    try {
      const customerDetails = apiConfigManager.getCustomerDetails();
      let latitude = "0.000", longitude = "0.000";
      const mobileNumber = customerDetails?.phone_number || "";
      const shipToPincode = customerDetails?.post_code ? String(customerDetails.post_code) : null;

      // Geocode
      const geocodeQuery = [customerDetails?.city, customerDetails?.state, customerDetails?.post_code].filter(Boolean).join(", ") + ", India";
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geocodeQuery)}&limit=1&countrycodes=in`, { headers: { "User-Agent": "MyTVS-Sales-App" } });
        const data = await resp.json();
        if (data?.length > 0) { latitude = parseFloat(data[0].lat).toFixed(3); longitude = parseFloat(data[0].lon).toFixed(3); }
      } catch { /* fallback 0.000 */ }

      const empCode = getEmployeeCode();
      const now = new Date();
      const trackId = now.getFullYear().toString() + (now.getMonth()+1).toString().padStart(2,"0") + now.getDate().toString().padStart(2,"0") + now.getHours().toString().padStart(2,"0") + now.getMinutes().toString().padStart(2,"0") + now.getSeconds().toString().padStart(2,"0") + Math.floor(Math.random()*1000000).toString().padStart(6,"0");

      // ── Single payload — full ordered quantity, backend handles sale/back-order split ──
      const partDetails = validRows.map(r => {
        const qty = parseFloat(r.quantity) || 0;
        const price = parseFloat(r.listPrice) || 0;
        const taxPct = parseFloat(r.gst || 0);
        const subTotal = price * qty;
        const taxAmount = (subTotal * taxPct) / 100;
        const wh = r.warehouse || billingWarehouse || customerDetails?.primary_ware_house || "";
        return {
          parts_no: r.partNumber, parts_name: r.itemName, quantity: String(qty), warehouse: wh,
          item_price: price.toFixed(2), brand_name: r.brandName || '-',
          sub_total: subTotal.toFixed(2), tax_price: taxAmount.toFixed(2),
          total_price: (subTotal + taxAmount).toFixed(2),
          cgst: (taxAmount / 2).toFixed(2),
          sgst: (taxAmount / 2).toFixed(2),
          igst: taxAmount.toFixed(2),
          mrp: (parseFloat(r.mrp)||price).toFixed(2),
        };
      });

      const grandTotal = validRows.reduce((s, r) => s + (parseFloat(r.listPrice)||0) * (parseFloat(r.quantity)||0), 0);
      const grandTotalQty = validRows.reduce((s, r) => s + (parseFloat(r.quantity)||0), 0);

      const orderResponse = await createOrderAPI({
        validity_date: validityDate, customer_code: selectedCustomer.customer_code,
        employee_code: empCode, purchase_order_no: null, purchase_order_date: null,
        latitude, longitude,
        mobile_number: customerDetails?.mobile_number || customerDetails?.phone_number || '',
        ship_to_location: customerDetails?.city || null, ship_to_pincode: shipToPincode,
        site_number: null,
        transaction_track_id: trackId,
        total_price: Math.round(grandTotal).toString(),
        total_quantity: grandTotalQty.toString(),
        part_details: partDetails,
      });

      // Success condition matches mobile spec
      const success =
        orderResponse?.message === 'Successfully Order Created' ||
        orderResponse?.success === true;

      if (success) {
        const cartItemsForSuccess = validRows.map(r => ({ itemDescription: r.itemName, partNumber: r.partNumber, brandName: r.brandName||"", quantity: parseFloat(r.quantity)||0, listPrice: parseFloat(r.listPrice)||0 }));
        const addrParts = [customerDetails?.address1, customerDetails?.address2, customerDetails?.city, customerDetails?.state, customerDetails?.post_code].filter(Boolean).join(", ");
        const basicTotal = validRows.reduce((s,r) => s+(parseFloat(r.listPrice)||0)*(parseFloat(r.quantity)||0), 0);
        const gstTotal = validRows.reduce((s,r) => {
          const sub = (parseFloat(r.listPrice)||0)*(parseFloat(r.quantity)||0);
          return s + (sub * (parseFloat(r.gst||0))) / 100;
        }, 0);
        navigate("/order-success", {
          state: {
            orderResponse,
            orderPayload: { transaction_track_id: trackId, validity_date: validityDate, customer_code: selectedCustomer.customer_code },
            cartItems: cartItemsForSuccess,
            shippingAddress: { name: selectedCustomer.customer_name, phone: customerDetails?.mobile_number || customerDetails?.phone_number || '', address: addrParts },
            totals: { basicTotal, gst: gstTotal, total: basicTotal + gstTotal },
          },
        });
      } else {
        setSubmitError(orderResponse?.message || "Order submission failed. Please try again.");
      }
    } catch { setSubmitError("Order submission failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bulk-order-page">
      {submitting && <OrderPlacingOverlay />}
      <Header />
      <Breadcrumb crumbs={[{ label: "Home", path: "/sales-home" }, { label: "Bulk Orders" }]} />

      <div className="bulk-order-content">
        {/* Customer selection */}
        {!selectedCustomer ? (
          <div className="customer-list-section">
            <div className="customer-list-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search customer by name or code..." value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} className="customer-list-search-input" />
            </div>
            {loadingCustomers ? <Spinner text="Loading customers..." /> : customers.length === 0 ? (
              <div className="customer-list-empty">{customerSearchTerm ? "No customers found." : "No customers available."}</div>
            ) : (
              <div className="customer-list-grid">
                {customers.map(c => (
                  <div key={c.customer_id} className="customer-list-card" onClick={() => handleSelectCustomer(c)}>
                    <div className="clc-avatar">{c.customer_name?.charAt(0).toUpperCase()}</div>
                    <div className="clc-info">
                      <div className="clc-name">{c.customer_name}</div>
                      <div className="clc-meta"><span className="clc-code">{c.customer_code}</span></div>
                    </div>
                    <div className="clc-arrow">›</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Customer header */}
            <div className="enhanced-customer-header">
              <div className="customer-info-left">
                <h2 className="customer-name">{selectedCustomer.customer_name}</h2>
                <span className="customer-code">{selectedCustomer.customer_code}</span>
              </div>
              <button className="change-customer-btn" onClick={handleClearAll}>‹ Change Customer</button>
            </div>

            {/* Financial cards */}
            <div className="customer-fin-cards">
              {[
                { label: "Customer Warehouse", value: customerFinancials?.warehouse || "—" },
                { label: "Credit Limit", value: customerFinancials?.creditLimit ? `₹ ${Number(customerFinancials.creditLimit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—", cls: "cfc-blue" },
                { label: "Credit Balance", value: customerFinancials?.availablecreditlimit != null ? `₹ ${Number(customerFinancials.availablecreditlimit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—", cls: "cfc-green" },
                { label: "Outstanding Amount", value: customerFinancials?.outstandingamount != null ? `₹ ${Number(customerFinancials.outstandingamount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—", cls: "cfc-orange" },
                { label: "Overdue Amount", value: customerFinancials?.overdueamount != null ? `₹ ${Number(customerFinancials.overdueamount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—", cls: "cfc-red" },
              ].map((c, i) => (
                <div key={i} className="cfc-card"><span className="cfc-label">{c.label}</span><span className={`cfc-value ${c.cls||""}`}>{c.value}</span></div>
              ))}
            </div>

            {/* Ship To — above table, required before searching */}
            <div className="ship-to-bar">
              <span className="ship-to-bar-label">Ship To:</span>
              {loadingShipTo ? (
                <span style={{ fontSize: 13, color: "#64748b" }}>Loading addresses...</span>
              ) : (
                <select className="ship-to-bar-select" value={selectedShipTo} onChange={e => setSelectedShipTo(e.target.value)}>
                  <option value="">Select Ship To Address</option>
                  {shipToList.map((addr, i) => <option key={i} value={addr}>{addr}</option>)}
                </select>
              )}
              {!selectedShipTo && <span className="ship-to-required-hint">⚠ Select to enable part search</span>}
            </div>

            {/* Order table */}
            <div className="enhanced-table-container">
              <table className="enhanced-bulk-table">
                <thead>
                  <tr>
                    <th>S No</th><th>Item Code</th><th>Item Name</th><th>Quantity</th>
                    <th>Pkg Qty</th><th>List Price</th><th>GST (%)</th><th>MRP</th>
                    <th>Selling Price</th><th>Total</th><th>Stock</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const active = isRowActive(index) && !!selectedShipTo;
                    return (
                      <tr key={index} className={active ? "active-row" : "inactive-row"}>
                        <td className="sno-cell">{index + 1}</td>
                        <td style={{ position: "relative" }}>
                          <div className="part-input-wrap">
                            <input type="text" ref={el => { partInputRefs.current[index] = el; }} value={row.partNumber}
                              onChange={e => handlePartNumberChange(index, e.target.value)}
                              onBlur={() => setTimeout(() => hideSuggestions(index), 300)}
                              disabled={!active} className="editable-input" placeholder={selectedShipTo ? "Search part no." : "Select Ship To first"} />
                            {row.loading && <span className="part-spinner" />}
                          </div>
                          {row.showSuggestions && row.suggestions.length > 0 && ReactDOM.createPortal((() => {
                            const el = partInputRefs.current[index];
                            const rect = el ? el.getBoundingClientRect() : null;
                            if (!rect) return null;
                            return (
                              <div className="part-suggestions" style={{ position: "fixed", top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 260), zIndex: 99999 }}>
                                {row.suggestions.map((s, si) => (
                                  <div key={si} className="part-suggestion-item" onMouseDown={() => handleSelectSuggestion(index, s)}>
                                    <span className="suggestion-part-no">{s.partNumber}</span>
                                    {s.itemName && <span className="suggestion-item-name">{s.itemName}</span>}
                                  </div>
                                ))}
                              </div>
                            );
                          })(), document.body)}
                          {row.error && <div className="part-error">{row.error}</div>}
                        </td>
                        <td><input type="text" value={row.itemName} readOnly className="readonly-input" placeholder="Auto-filled" /></td>
                        <td><input type="number" value={row.quantity} onChange={e => handleQuantityChange(index, e.target.value)} disabled={!active || !row.itemName} className="quantity-input-simple" placeholder="0" min="1" /></td>
                        <td><input type="text" value={row.pkgQty} readOnly className="readonly-input" /></td>
                        <td><input type="text" value={row.listPrice} readOnly className="readonly-input" /></td>
                        <td><input type="text" value={row.gst} readOnly className="readonly-input" /></td>
                        <td><input type="text" value={row.mrp} readOnly className="readonly-input" /></td>
                        <td><input type="text" value={row.price} readOnly className="readonly-input" /></td>
                        <td><input type="text" value={row.total} readOnly className="readonly-input total-input" /></td>
                        <td><span className={`stock-badge ${(row.availableQty || 0) > 0 ? "stock-in" : "stock-out"}`}>{row.availableQty ?? "—"}</span></td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button type="button" className="delete-btn" onClick={() => handleDeleteRow(index)}>×</button>
                            {index === rows.length - 1 && row.itemName && (
                              <button type="button" className="add-btn" onClick={() => setRows(p => [...p, EMPTY_ROW()])}>+</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </>
        )}
      </div>

      {/* Bottom bar */}
      {selectedCustomer && (
        <div className="bulk-order-bottom-bar">
          <div className="bobb-stats">
            <div className="bobb-stat"><span className="bobb-label">No.of Parts Selected</span><span className="bobb-value">{getFilledRowsCount()}</span></div>
            <div className="bobb-stat"><span className="bobb-label">Total Quantity</span><span className="bobb-value">{getTotalQuantity()}</span></div>
            <div className="bobb-stat"><span className="bobb-label">Total Amount</span><span className="bobb-value">₹{getTotalAmount().toFixed(2)}</span></div>
            <div className="bobb-stat"><span className="bobb-label">Billing Warehouse</span><span className="bobb-value">{billingWarehouse}</span></div>
          </div>
          <div className="bobb-actions">
            <div className="bobb-date-wrap">
              <label className="bobb-date-label">Validity Date</label>
              <input type="date" className="bobb-date" value={validityDate} onChange={e => setValidityDate(e.target.value)} />
            </div>
            <button className="bobb-clear" onClick={handleClearAll}>Clear All</button>
            <button className="bobb-place" onClick={handlePlaceOrder} disabled={submitting || getFilledRowsCount() === 0 || !selectedShipTo || !validityDate}>
              {submitting ? "Placing..." : "Place Order"}
            </button>
          </div>
          {submitError && <div className="bobb-error">{submitError}</div>}
        </div>
      )}

      {/* Warehouse modal */}
      <WarehousePickerModal
        open={!!warehouseModal}
        onClose={() => setWarehouseModal(null)}
        onConfirm={(wh) => {
          if (!warehouseModal) return;
          const { index, partData } = warehouseModal;
          const listPrice = parseFloat(partData.listPrice || partData.mrp || 0);
          const qty = parseFloat(rows[index]?.quantity) || 0;
          setRows(prev => {
            const u = [...prev];
            u[index] = {
              ...u[index],
              itemName:    partData.itemDescription || "",
              pkgQty:      partData.salesUom || "",
              listPrice:   partData.listPrice || "",
              gst:         partData.taxpercent || "",
              mrp:         partData.mrp || "",
              price:       partData.listPrice || "",
              lineCode:    partData.lineCode || "",
              brandName:   partData.brandName || "",
              hsnCode:     partData.hsnCode || "",
              warehouse:   wh.name,
              availableQty: wh.qty || 0,
              total:       qty > 0 ? (qty * listPrice).toFixed(2) : "",
              loading: false, error: "",
            };
            return u;
          });
          setBillingWarehouse(wh.name);
          setWarehouseModal(null);
          setSelectedWarehouse("");
        }}
        loading={loadingWarehouseStock}
        warehouses={warehouseModal?.warehouses?.map(w => ({ name: w.name, qty: w.qty })) || []}
        product={warehouseModal?.partData ? { itemDescription: warehouseModal.partData.itemDescription, partNumber: warehouseModal.partData.partNumber } : null}
        title="Choose Billing Warehouse"
        confirmLabel="Continue"
        note="The order will be created against the selected warehouse. To change it, clear the items and try again."
      />
    </div>
  );
};

export default BulkOrder;
