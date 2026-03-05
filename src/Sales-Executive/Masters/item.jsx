import React, { useState } from "react";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./item.css";

const Masters = () => {
  const [activeTab, setActiveTab] = useState("Master");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const mastersData = {
    Master: [
      { id: 1, itemcode: "351CVCF415W40DEO7.5L", itemName: "15W40 MYTVS DIESEL ENGINE OIL 7.5 LITRES", Brand: "--", category: "LUBRICANTS&FLUIDS", UOM: "Cash", MRP: "2,429", CostPrice: "0", ListPrice: "969" },
      { id: 2, itemcode: "351MCSL10W30PEO210L", itemName: "10W30 MYTVS SCOOTER OIL 210 LITRES", Brand: "--", category: "LUBRICANTS & FLUIDS", UOM: "Cash", MRP: "0", CostPrice: "0", ListPrice: "26,535" },
      { id: 3, itemcode: "351TRUTTOWBO50L", itemName: "MYTVS OIB OIL", Brand: "--", category: "LUBRICANTS&FLUIDS", UOM: "Cash", MRP: "0", CostPrice: "0", ListPrice: " 6,817" },
      { id: 4, itemcode: "351GRLLGNLGI30.5KG", itemName: "MYTVS MAX LONG LIFE GREASE 0.5 KG", Brand: "--", category: "--", UOM: "Cash", MRP: "409", CostPrice: "0", ListPrice: "155" },
    ],
    "item Uom": [
      { id: 5, ItemCode: "351TRGL490GO50L", ItemDescription: "90 MYTVS GEAR OIL 50 LITRES", UOM: "1.00" },
      { id: 6, ItemCode: "351GRLLGNLGI35KG", ItemDescription: "MYTVS MAX LONG LIFE GREASE 5 KG", UOM: "1.00" },
      { id: 7, ItemCode: "351PCSN5W30PEO3.5L", ItemDescription: "5W30 MYTVS ENGINE OIL SYNTHETIC 3.5 LITRES", UOM: "1.00" },
      { id: 8, ItemCode: "351CVCI4PLUS15W40DEO20L", ItemDescription: "915W40 MYTVS DIESEL ENGINE OIL 20 LITRES", UOM: "1.00" },
    ],
    Brands: [
      { id: 9, BrandName: " 545 Dosth OE", ParentBrand: " ", Status: "Active" },
      { id: 10, BrandName: " SIS LOCAL PURCHASE", ParentBrand: " ", Status: "Active" },
      { id: 11, BrandName: " ASIAN PPG TINTS", ParentBrand: " ", Status: "Active" },
      { id: 12, BrandName: " UCAP U CLAMP AND BOLTS", ParentBrand: " ", Status: "Active" },
    ],
    "Brand and Location": [
      { id: 13, State: "KARNATAKA", Brand: "  3M" },
      { id: 14, State: "KARNATAKA", Brand: "ANABOND" },
      { id: 15, State: "KARNATAKA", Brand: "  ABC" },
      { id: 16, State: "KARNATAKA", Brand: "COMBOS" },
    ],
    "Exculusive Brands configuration": [
      { id: 17, BrandName: " WABCO", CustomerGroupcode: "007", CustomerGroupType: "  Retailer" },
      { id: 18, BrandName: "SKF", CustomerGroupcode: "007", CustomerGroupType: " Retailer" },
      { id: 19, BrandName: " VALEO", CustomerGroupcode: "007", CustomerGroupType: "  Retailer" },
      { id: 20, BrandName: " DENSO", CustomerGroupcode: "007", CustomerGroupType: "  Retailer" },
    ],
  };

  const tabs = ["Master", "item Uom", "Brands", "Brand and Location", "Exculusive Brands configuration"];

  const currentData = mastersData[activeTab] || [];

  const filteredData = currentData.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  // Line 48: Ippo ithu used aagum, warning varathu
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleEdit = (item) => console.log("Edit item:", item);
  const handleView = (item) => console.log("View item:", item);

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "Master":
        return <tr><th>Item Code</th><th>Item Name</th><th>Brand</th><th>Category</th><th>UOM</th><th>MRP (₹)</th><th>Cost Price (₹)</th><th>List Price (₹)</th><th>Actions</th></tr>;
      case "item Uom":
        return <tr><th>Item Code</th><th>Item Description</th><th>UOM</th><th>Actions</th></tr>;
      case "Brands":
        return <tr><th>Brand Name</th><th>Parent Brand</th><th>Status</th><th>Actions</th></tr>;
      case "Brand and Location":
        return <tr><th>State</th><th>Brand</th><th>Actions</th></tr>;
      case "Exculusive Brands configuration":
        return <tr><th>BrandName</th><th>CustomerGroupcode</th><th>CustomerGroupType</th><th>Actions</th></tr>;
      default: return null;
    }
  };

  const renderTableRows = () => {
    return paginatedData.map((item, index) => (
      <tr key={`${activeTab}-${item.id || index}`}>
        {activeTab === "Master" && (
          <>
            <td>{item.itemcode}</td><td>{item.itemName}</td><td>{item.Brand}</td>
            <td>{item.category}</td><td>{item.UOM}</td><td>{item.MRP}</td>
            <td>{item.CostPrice}</td><td>{item.ListPrice}</td>
          </>
        )}
        {activeTab === "item Uom" && (
          <><td>{item.ItemCode}</td><td>{item.ItemDescription}</td><td>{item.UOM}</td></>
        )}
        {activeTab === "Brands" && (
          <><td>{item.BrandName}</td><td>{item.ParentBrand}</td><td>{item.Status}</td></>
        )}
        {activeTab === "Brand and Location" && (
          <><td>{item.State}</td><td>{item.Brand}</td></>
        )}
        {activeTab === "Exculusive Brands configuration" && (
          <><td>{item.BrandName}</td><td>{item.CustomerGroupcode}</td><td>{item.CustomerGroupType}</td></>
        )}
        <td>
          <div className="action-icons">
            <button className="action-btn view-btn" onClick={() => handleView(item)}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
          <Breadcrumb currentPage="Masters" />
          <div className="masters-header-controls">
            <div className="masters-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`master-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="header-search-control">
              <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." className="header-search-input" />
              <button className="export-btn">Export</button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="masters-table">
              <thead>{renderTableHeaders()}</thead>
              <tbody>
                {paginatedData.length > 0 ? renderTableRows() : (
                  <tr><td colSpan="12" style={{ textAlign: "center" }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pagination-container">
          {/* Ippo totalRecords-ai inga use pandrom, so warning poidum */}
         
          <div className="pagination-right">
            <div className="pagination-controls">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`pagination-btn ${currentPage === page ? "active" : ""}`}>
                  {page < 10 ? `0${page}` : page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Masters;