import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./item.css";

const ItemMaster = () => {
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState("master");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Get view from URL parameter
  useEffect(() => {
    const view = searchParams.get("view") || "master";
    setActiveView(view);
  }, [searchParams]);

  // Sample data for different views
  const itemData = {
    master: [
      { id: 1, itemCode: "ITEM001", itemName: "Brake Pad Set", brand: "Bosch", category: "Brakes", uom: "Set", mrp: "2500", costPrice: "2000", listPrice: "2300", stock: "50" },
      { id: 2, itemCode: "ITEM002", itemName: "Engine Oil 5W30", brand: "Castrol", category: "Lubricants", uom: "Liter", mrp: "850", costPrice: "650", listPrice: "780", stock: "100" },
      { id: 3, itemCode: "ITEM003", itemName: "Air Filter", brand: "Mann", category: "Filters", uom: "Piece", mrp: "450", costPrice: "320", listPrice: "400", stock: "75" },
    ],
    uom: [
      { id: 1, itemCode: "ITEM001", itemDescription: "Brake Pad Set", uom: "Set", conversionFactor: "1", baseUOM: "Piece" },
      { id: 2, itemCode: "ITEM002", itemDescription: "Engine Oil 5W30", uom: "Liter", conversionFactor: "1", baseUOM: "Liter" },
      { id: 3, itemCode: "ITEM003", itemDescription: "Air Filter", uom: "Piece", conversionFactor: "1", baseUOM: "Piece" },
    ],
    brands: [
      { id: 1, brandName: "Bosch", parentBrand: "Bosch Group", brandCode: "BSH001", status: "Active", country: "Germany" },
      { id: 2, brandName: "Castrol", parentBrand: "BP Group", brandCode: "CST001", status: "Active", country: "UK" },
      { id: 3, brandName: "Mann", parentBrand: "Mann+Hummel", brandCode: "MAN001", status: "Active", country: "Germany" },
    ],
    brandLocation: [
      { id: 1, state: "Karnataka", brand: "Bosch", location: "Bangalore", warehouse: "WH001", status: "Active" },
      { id: 2, state: "Tamil Nadu", brand: "Castrol", location: "Chennai", warehouse: "WH002", status: "Active" },
      { id: 3, state: "Maharashtra", brand: "Mann", location: "Mumbai", warehouse: "WH003", status: "Active" },
    ],
    exclusiveBrand: [
      { id: 1, brandName: "Bosch", customerGroupCode: "CG001", customerGroupType: "Dealer", exclusivityType: "Regional", validFrom: "2024-01-01", validTo: "2024-12-31" },
      { id: 2, brandName: "Castrol", customerGroupCode: "CG002", customerGroupType: "Retailer", exclusivityType: "National", validFrom: "2024-01-01", validTo: "2024-12-31" },
    ],
  };

  const currentData = itemData[activeView] || [];

  const filteredData = currentData.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);
  
  const handleEdit = (item) => {
    navigate('/masters/edit', { state: { data: item, masterType: getPageTitle() } });
  };
  
  const handleView = (item) => {
    navigate('/masters/view', { state: { data: item, masterType: getPageTitle() } });
  };

  // Get page title based on active view
  const getPageTitle = () => {
    const titles = {
      master: "Item Master",
      uom: "Item UOM",
      brands: "Brands",
      brandLocation: "Brand & Location Mapping",
      exclusiveBrand: "Exclusive Brand Configuration"
    };
    return titles[activeView] || "Item Master";
  };

  // Render table headers based on active view
  const renderTableHeaders = () => {
    switch (activeView) {
      case "master":
        return (
          <tr>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>UOM</th>
            <th>MRP (₹)</th>
            <th>Cost Price (₹)</th>
            <th>List Price (₹)</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        );
      case "uom":
        return (
          <tr>
            <th>Item Code</th>
            <th>Item Description</th>
            <th>UOM</th>
            <th>Conversion Factor</th>
            <th>Base UOM</th>
            <th>Actions</th>
          </tr>
        );
      case "brands":
        return (
          <tr>
            <th>Brand Name</th>
            <th>Parent Brand</th>
            <th>Brand Code</th>
            <th>Status</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        );
      case "brandLocation":
        return (
          <tr>
            <th>State</th>
            <th>Brand</th>
            <th>Location</th>
            <th>Warehouse</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        );
      case "exclusiveBrand":
        return (
          <tr>
            <th>Brand Name</th>
            <th>Customer Group Code</th>
            <th>Customer Group Type</th>
            <th>Exclusivity Type</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // Render table rows based on active view
  const renderTableRows = () => {
    return paginatedData.map((item, index) => (
      <tr key={`${activeView}-${item.id || index}`}>
        {activeView === "master" && (
          <>
            <td>{item.itemCode}</td>
            <td>{item.itemName}</td>
            <td>{item.brand}</td>
            <td>{item.category}</td>
            <td>{item.uom}</td>
            <td>₹{item.mrp}</td>
            <td>₹{item.costPrice}</td>
            <td>₹{item.listPrice}</td>
            <td>{item.stock}</td>
          </>
        )}
        {activeView === "uom" && (
          <>
            <td>{item.itemCode}</td>
            <td>{item.itemDescription}</td>
            <td>{item.uom}</td>
            <td>{item.conversionFactor}</td>
            <td>{item.baseUOM}</td>
          </>
        )}
        {activeView === "brands" && (
          <>
            <td>{item.brandName}</td>
            <td>{item.parentBrand}</td>
            <td>{item.brandCode}</td>
            <td>{item.status}</td>
            <td>{item.country}</td>
          </>
        )}
        {activeView === "brandLocation" && (
          <>
            <td>{item.state}</td>
            <td>{item.brand}</td>
            <td>{item.location}</td>
            <td>{item.warehouse}</td>
            <td>{item.status}</td>
          </>
        )}
        {activeView === "exclusiveBrand" && (
          <>
            <td>{item.brandName}</td>
            <td>{item.customerGroupCode}</td>
            <td>{item.customerGroupType}</td>
            <td>{item.exclusivityType}</td>
            <td>{item.validFrom}</td>
            <td>{item.validTo}</td>
          </>
        )}
        <td>
          <div className="action-icons">
            <button className="action-btn view-btn" onClick={() => handleView(item)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="masters-container">
      <Header />
      <div className="masters-content">
        <div className="masters-header">
          <Breadcrumb currentPage={getPageTitle()} />
          <div className="masters-header-controls">
            <div className="header-search-control">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="header-search-input"
              />
              <button className="export-btn">Export</button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="masters-table">
              <thead>{renderTableHeaders()}</thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  renderTableRows()
                ) : (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center" }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pagination-container">
          <div className="pagination-right">
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                >
                  {page < 10 ? `0${page}` : page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemMaster;
