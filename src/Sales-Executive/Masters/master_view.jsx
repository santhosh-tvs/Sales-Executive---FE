import React, { useState, useRef } from "react";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import "./item.css";
import Search from "..//../assets/Assets/Beat/search.png";
const Masters = () => {
  const [activeTab, setActiveTab] = useState("Master");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("Item Information");
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState("Item Details");

  const mastersData = {
    Master: [
      {
        id: 1,
        company: "TVSASL",
        itemcode: "351CVCF415W40DEO7.5L",
        itemName: "15W40 MYTVS DIESEL ENGINE OIL 7.5 LITRES",
        brand: "-",
        category: "LUBRICANTS & FLUIDS",
        subCategory: "Lubrication",
        minQty: "0.00",
        maxQty: "0.00",
        uom: "Cash",
        lineCode: "351",
        qtyPackage: "1.00",
        hsnCode: "27101980",
        availableDate: "01-01-1900",
        winNumber: "0",
        productGroup: "MyTVS DEO",
        displayOrder: "10",
        MRP: "2,429",
        CostPrice: "0",
        ListPrice: "969",
        SupplierPackageType: "Individual",
        ItemAvailableDate: "01-01-1900",
        DisplayOrder: "10"
      },
    ],
    "item Uom": [
      { id: 5, ItemCode: "351TRGL490GO50L", ItemDescription: "90 MYTVS GEAR OIL 50 LITRES", UOM: "1.00" },
      { id: 6, ItemCode: "351GRLLGNLGI35KG", ItemDescription: "MYTVS MAX LONG LIFE GREASE 5 KG", UOM: "1.00" },
    ],
    Brands: [
      { id: 9, BrandName: " 545 Dosth OE", ParentBrand: "TVS", Status: "Active" },
    ],
    "Brand and Location": [
      { id: 13, State: "KARNATAKA", Brand: "3M" },
    ],
    "Exculusive Brands configuration": [
      { id: 17, BrandName: "WABCO", CustomerGroupcode: "007", CustomerGroupType: "Retailer" },
    ],
  };

  const tabs = ["Master", "item Uom", "Brands", "Brand and Location", "Exculusive Brands configuration"];

  // --- LOGIC FUNCTIONS ---
  const currentData = mastersData[activeTab] || [];

  const filteredData = currentData.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // --- EVENT HANDLERS ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setCurrentPage(1);
    setViewItem(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (item) => setViewItem(item);
  const handleEdit = (item) => {
    setViewItem(item);
    setIsEditing(true);
  };
  const handleBack = () => {
    setViewItem(null);
    setIsEditing(false);
  };

  // --- REFACTORED EditItemForm ---
  const EditItemForm = () => {
    // 1. All Hooks and Refs (Top level)
    const dateInputRef = useRef(null);
    const imageInputRef = useRef(null); // FIXED: Added missing ref
    
    const [altSearch, setAltSearch] = useState("");
    const [upsellSearch, setUpsellSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(viewItem?.ItemAvailableDate || "Enter Available Date");
    const [selectedImageName, setSelectedImageName] = useState("Select Item picture");

    const editTabs = ["Item Details", "Vehicle Mapping", "Alternate Parts", "Upsell Parts"];

    // 2. FIXED: Added missing Folder Icon Click function
    const handleFolderIconClick = () => {
      if (imageInputRef.current) {
        imageInputRef.current.click(); // File explorer-ai open pannum
      }
    };

    // 3. FIXED: Added missing File Change function
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedImageName(e.target.files[0].name); // Select panna file name-ai update pannum
      }
    };

    const handleCalendarClick = () => {
      if (dateInputRef.current) {
        dateInputRef.current.showPicker();
      }
    };

    const handleNext = () => {
      const currentIndex = editTabs.indexOf(activeEditTab);
      if (currentIndex < editTabs.length - 1) {
        setActiveEditTab(editTabs[currentIndex + 1]);
      }
    };

    const handlePrevious = () => {
      const currentIndex = editTabs.indexOf(activeEditTab);
      if (currentIndex > 0) {
        setActiveEditTab(editTabs[currentIndex - 1]);
      }
    };

    return (
      <div className="detail-view-container">
        <div className="detail-header">
          <button className="back-arrow-btn" onClick={() => setIsEditing(false)}>←</button>
          
          <div className="detail-nav-tabs">
            {["Item Details", "Vehicle Mapping", "Alternate Parts", "Upsell Parts"].map(t => (
              <button
                key={t}
                className={`nav-tab ${activeEditTab === t ? "active" : ""}`}
                onClick={() => setActiveEditTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-content-card">
          {activeEditTab === "Item Details" && (
            <>
              <h3 className="section-head-orange">General Informations</h3>
              <div className="edit-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div className="form-group"><label>Item Code</label><input type="text" placeholder="Enter Item Code" defaultValue={viewItem?.itemcode} /></div>
                <div className="form-group"><label>Item Name</label><input type="text" placeholder="Enter Item Name" defaultValue={viewItem?.itemName} /></div>
                <div className="form-group"><label>Category / Aggregate</label><select><option>Select Category</option></select></div>
                <div className="form-group"><label>Item Sub Category</label><select><option>Select Item Sub Category</option></select></div>
                <div className="form-group"><label>Component</label><select><option>Select Component</option></select></div>
                <div className="form-group"><label>Supplier Category</label><select><option>Select Supplier Category</option></select></div>
                <div className="form-group"><label>Min Sale Order Qty</label><input type="text" placeholder="Enter Min Qty" /></div>
                <div className="form-group"><label>Max Sale Order Qty</label><input type="text" placeholder="Enter Max Qty" /></div>
                <div className="form-group"><label>Unit of Measurement</label><select><option>Select Unit</option></select></div>
                <div className="form-group"><label>Line Code / Item Group</label><input type="text" placeholder="Line code" /></div>
                <div className="form-group"><label>HSN Code</label><input type="text" placeholder="HSN code" /></div>
                <div className="form-group"><label>Supplier Package Type</label><select><option>Select Package Type</option></select></div>
                <div className="form-group"><label>Sticker Repetition Qty</label><input type="text" placeholder="Enter Qty" /></div>
                <div className="form-group"><label>Pack Size</label><input type="text" placeholder="Enter package Qty" /></div>
                <div className="form-group"><label>Vehicle Category</label><select><option>Select Category</option></select></div>
                <div className="form-group custom-field-group">
                  <label className="custom-field-label">Image</label>
                  <div className="custom-input-with-icon-wrapper-white">

                    {/* Hidden File Input - Ithu thaan background-la irukkum */}
                    <input
                      type="file"
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      accept="image/*"
                    />

                    {/* File name inga theriya aarambikkum */}
                    <span className="custom-input-text-display">
                      {selectedImageName}
                    </span>

                    {/* Folder Icon with Dark Background */}
                    <div className="icon-box-dark" onClick={handleFolderIconClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="form-group"><label>Height</label><input type="text" placeholder="Enter height" /></div>
                <div className="form-group"><label>Width</label><input type="text" placeholder="Enter width" /></div>
                <div className="form-group"><label>Weight</label><input type="text" placeholder="Enter weight" /></div>
                <div className="form-group custom-field-group">
                  <label className="custom-field-label">Item Available Date</label>
                  <div className="custom-input-with-icon-wrapper-white">
                    {/* 1. Date Input with onChange */}
                    <input
                      type="date"
                      ref={dateInputRef}
                      className="custom-date-hidden"
                      onChange={(e) => setSelectedDate(e.target.value)} // Date select panna state update aagum
                    />

                    {/* 2. Inga thaan select panna date theriyum */}
                    <span className="custom-input-text-display">
                      {selectedDate}
                    </span>

                    <div className="icon-box-dark" onClick={handleCalendarClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="form-group"><label>Local Language Name</label><input type="text" placeholder="Enter Local Name" /></div>
                <div className="form-group"><label>Product Video Link</label><input type="text" placeholder="Enter Link" /></div>
                <div className="form-group"><label>MRP (₹)</label><input type="text" placeholder="Enter MRP" /></div>
                <div className="form-group"><label>List Price (₹)</label><input type="text" placeholder="Enter List Price" /></div>
                <div className="form-group"><label>Cost Price (₹)</label><input type="text" placeholder="Enter Cost Price" /></div>
                <div className="form-group"><label>Win Number</label><input type="text" placeholder="Enter Win Number" /></div>
                <div className="form-group"><label>Label Height</label><input type="text" placeholder="Enter Height" /></div>
                <div className="form-group"><label>Label Width</label><input type="text" placeholder="Enter Width" /></div>
                <div className="form-group"><label>Warranty Policy</label><select><option>Select Policy</option></select></div>
                <div className="form-group"><label>Pack Size Group</label><select><option>Select Group</option></select></div>
                <div className="form-group"><label>Product Group</label><select><option>Select Group</option></select></div>
                <div className="form-group"><label>Display Order</label><input type="text" placeholder="Enter Order" /></div>
                <div className="form-group"><label>Tag</label><input type="text" placeholder="select Tag" /></div>
                <div className="form-group"><label>Type</label><input type="text" placeholder="Select item Type" /></div>
              </div>
            </>
          )}
          {/* Vehicle Mapping Content */}
          {activeEditTab === "Vehicle Mapping" && (
            <div className="vehicle-mapping-section">
              <button className="add-mapping-btn">
                + Add Vehicle Mapping
              </button>
            </div>
          )}

          {activeEditTab === "Alternate Parts" && (
            <div className="alternate-parts-section">
              <div className="search-box-container">
                <label className="search-label">Search Alternate Parts</label>
                <div className="search-input-wrapper">
                  <img src={Search} alt="search icon" />

                  <input
                    type="text"
                    placeholder="Search Alternate Parts"
                    className="search-input-box"
                    value={altSearch}
                    onChange={(e) => setAltSearch(e.target.value)}
                  />
                  {altSearch && (
                    <button className="clear-search-btn" onClick={() => setAltSearch("")}>×</button>
                  )}
                </div>
              </div>

              <h3 className="section-title-orange">Alternate Parts</h3>

              <div className="parts-table-wrapper">
                <table className="custom-edit-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>MRP (₹)</th>
                      <th>Cost Price (₹)</th>
                      <th>List Price (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          )}
          {/* Upsell Parts Content */}
          {activeEditTab === "Upsell Parts" && (
            <div className="upsell-parts-section">
              <div className="search-box-container">
                <label className="search-label">Search Upsell Parts</label>
                <div className="search-input-wrapper">
                  <img src={Search} alt="search icon" className="orange-icon" />
                  <input
                    type="text"
                    placeholder="Search Upsell Parts"
                    className="search-input-box"
                    value={upsellSearch} // Separate state use pannunga: const [upsellSearch, setUpsellSearch] = useState("");
                    onChange={(e) => setUpsellSearch(e.target.value)}
                  />
                  {upsellSearch && (
                    <button className="clear-search-btn" onClick={() => setUpsellSearch("")}>×</button>
                  )}
                </div>
              </div>

              <h3 className="section-title-orange">Upsell Parts</h3>

              <div className="parts-table-wrapper">
                <table className="custom-edit-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>MRP (₹)</th>
                      <th>Cost Price (₹)</th>
                      <th>List Price (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="edit-footer-action-bar">

          {/* 1. "Item Details" thavira matha tabs-la mattum thaan Previous button varanum */}
          {activeEditTab !== "Item Details" && (
            <button className="orange-submit-btn" onClick={handlePrevious}>
              Previous
            </button>
          )}

          {/* 2. "Upsell Parts" (last tab) thavira matha ellathukum Next button varanum */}
          {activeEditTab !== "Upsell Parts" && (
            <button className="orange-submit-btn" onClick={handleNext}>
              Next
            </button>
          )}

          {/* 3. Submit button eppovum theriyanum (neenga ketta maadhiri) */}
          <button className="orange-submit-btn" onClick={() => setIsEditing(false)}>
            Submit
          </button>

        </div>
      </div>
    );
  };

  // --- DETAIL VIEW COMPONENT ---
  const ItemInformationView = () => (
    <div className="detail-view-container">
      <div className="detail-header">
        <button className="back-arrow-btn" onClick={handleBack}>←</button>
        <h2 className="detail-title-text">Item Information</h2>
        <div className="detail-nav-tabs">
          <button className={`nav-tab ${activeDetailTab === "Item Information" ? "active" : ""}`} onClick={() => setActiveDetailTab("Item Information")}>Item Information</button>
          <button className={`nav-tab ${activeDetailTab === "Alternative Parts" ? "active" : ""}`} onClick={() => setActiveDetailTab("Alternative Parts")}>Alternative Parts</button>
          <button className={`nav-tab ${activeDetailTab === "Upsell parts" ? "active" : ""}`} onClick={() => setActiveDetailTab("Upsell parts")}>Upsell parts</button>
        </div>
      </div>

      <div className="detail-content-card">
        {activeDetailTab === "Item Information" ? (
          <>
            <h3 className="section-head-orange">General Information</h3>
            <div className="info-grid-layout">
              <div className="info-block"><label>Company</label><p>{viewItem.company || "TVSASL"}</p></div>
              <div className="info-block"><label>Item Code</label><p>{viewItem.itemcode || viewItem.ItemCode}</p></div>
              <div className="info-block"><label>Item Name</label><p>{viewItem.itemName || viewItem.ItemDescription}</p></div>
              <div className="info-block"><label>Brand</label><p>{viewItem.brand || viewItem.BrandName || "-"}</p></div>
              <div className="info-block"><label>Category</label><p>{viewItem.category || "-"}</p></div>
              <div className="info-block"><label>Sub Category</label><p>{viewItem.subCategory || "Lubrication"}</p></div>
              <div className="info-block"><label>Min Qty</label><p>{viewItem.minQty || "0.00"}</p></div>
              <div className="info-block"><label>Max Qty</label><p>{viewItem.maxQty || "0.00"}</p></div>
              <div className="info-block"><label>UOM</label><p>{viewItem.uom || viewItem.UOM || "-"}</p></div>
              <div className="info-block"><label>Line Code</label><p>{viewItem.lineCode || "351"}</p></div>
              <div className="info-block"><label>Qty in Each package</label><p>{viewItem.qtyPackage || "1.00"}</p></div>
              <div className="info-block"><label>Estimated Time of Availability</label><p>0</p></div>
              <div className="info-block"><label>Supplier Package Type</label><p>{viewItem.SupplierPackageType || "-"}</p></div>
              <div className="info-block"><label>Carton Box Qty</label><p>-</p></div>
              <div className="info-block"><label>Repetition Qty</label><p>-</p></div>
              <div className="info-block"><label>Height</label><p>0.00</p></div>
              <div className="info-block"><label>Width</label><p>0.00</p></div>
              <div className="info-block"><label>Weight</label><p>0.00</p></div>
              <div className="info-block"><label>HSN Code</label><p>{viewItem.hsnCode || "27101980"}</p></div>
              <div className="info-block"><label>Item Available Date</label><p>{viewItem.ItemAvailableDate || "-"}</p></div>
              <div className="info-block"><label>Rating (Out of 5)</label><p>-</p></div>
              <div className="info-block"><label>Product Video Link</label><p>-</p></div>
              <div className="info-block"><label>WIN Number</label><p>{viewItem.winNumber || "0"}</p></div>
              <div className="info-block"><label>Item Group</label><p>-</p></div>
              <div className="info-block"><label>Warranty Policy</label><p>-</p></div>
              <div className="info-block"><label>Product Group</label><p>{viewItem.productGroup || "MyTVS DEO"}</p></div>
              <div className="info-block"><label>Display Order</label> <p>{viewItem.DisplayOrder || "-"}</p></div>
            </div>
          </>
        ) : (
          <div className="parts-section-container">
            <div className="alt-parts-grid-header">
              <span className="alt-label">Item Code</span>
              <span className="alt-label">Item Name</span>
              <span className="alt-label">MRP (₹)</span>
              <span className="alt-label">Cost Price (₹)</span>
              <span className="alt-label">List Price (₹)</span>
              <span className="alt-label">CGST</span>
              <span className="alt-label">SGST</span>
              <span className="alt-label">IGST</span>
            </div>
            <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>No {activeDetailTab} Found</div>
          </div>
        )}
      </div>

      {activeDetailTab === "Item Information" && (
        <div className="footer-action-bar">
          <button className="orange-submit-btn" onClick={() => handleEdit(viewItem)}>Edit</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="masters-container">
      <Header />
      <div className="masters-content">
        {isEditing ? <EditItemForm /> : viewItem ? <ItemInformationView /> : (
          <>
            <div className="masters-header">
              <Breadcrumb currentPage="Masters" />
              <div className="masters-header-controls">
                <div className="masters-tabs">
                  {tabs.map((tab) => (
                    <button key={tab} className={`master-tab ${activeTab === tab ? "active" : ""}`} onClick={() => handleTabChange(tab)}>{tab}</button>
                  ))}
                </div>
                <div className="header-search-control">
                  <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." className="header-search-input" />
                  <button className="export-btn">Export</button>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="masters-table">
                <thead>
                  {activeTab === "Master" ? <tr><th>Item Code</th><th>Item Name</th><th>Brand</th><th>Category</th><th>Actions</th></tr> : <tr><th>Code</th><th>Description</th><th>Actions</th></tr>}
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemcode || item.ItemCode || item.BrandName}</td>
                      <td>{item.itemName || item.ItemDescription || item.ParentBrand}</td>
                      {activeTab === "Master" && <td>{item.brand}</td>}
                      {activeTab === "Master" && <td>{item.category}</td>}
                      <td>
                        <div className="action-icons">
                          <button className="action-btn view-btn" onClick={() => handleView(item)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg></button>
                          <button className="action-btn edit-btn" onClick={() => handleEdit(item)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <div className="pagination-controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => handlePageChange(page)} className={`pagination-btn ${currentPage === page ? "active" : ""}`}>{page}</button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Masters;








