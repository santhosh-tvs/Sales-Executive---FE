import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../header/Header";
import "../../../styles/Sales/Beat/ViewPlan_2.css";

const ViewPlan_2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from ViewPlan1
  const formData = location.state || {};

  const [beat, setBeat] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showCustomerSection, setShowCustomerSection] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customerTargetTypes, setCustomerTargetTypes] = useState({});
  const [customerUnits, setCustomerUnits] = useState({});

  // Beat options
  const beatOptions = ["Beat", "Display-Campaign", "Office-Work"];

  // Location options
  const locationOptions = ["Chennai", "Kerala", "Karnataka"];

  // Sample customer data based on location
  const customerData = {
    Chennai: [
      { code: "PSW_000511", name: "VINAYAK AGENCIES", contact: "7659818113" },
      { code: "CHN_000123", name: "RAJESH MOTORS", contact: "9876543210" },
      { code: "CHN_000456", name: "KUMAR SPARE PARTS", contact: "9123456789" },
      { code: "CHN_000789", name: "PRIYA AUTO WORKS", contact: "9988776655" },
    ],
    Kerala: [
      { code: "KER_000234", name: "KERALA AUTO PARTS", contact: "9444555666" },
      { code: "KER_000567", name: "MALABAR MOTORS", contact: "9777888999" },
      { code: "KER_000890", name: "COCHIN SPARES", contact: "9333222111" },
    ],
    Karnataka: [
      { code: "KAR_000345", name: "BANGALORE AUTO", contact: "9555444333" },
      { code: "KAR_000678", name: "MYSORE PARTS", contact: "9666555444" },
      { code: "KAR_000901", name: "HUBLI MOTORS", contact: "9111222333" },
    ],
  };

  // Target type options
  const targetTypeOptions = [
    "Sales Target",
    "Service Target",
    "Collection Target",
    "Visit Target",
  ];

  // Unit options
  const unitOptions = ["Pieces", "Amount", "Percentage", "Number"];

  const handleBeatChange = (e) => {
    setBeat(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    // Reset customer section when location changes
    setShowCustomerSection(false);
    setSelectedCustomers([]);
    setCustomerTargetTypes({});
    setCustomerUnits({});
  };

  const handleCustomerSelect = (customerCode, isSelected) => {
    if (isSelected) {
      setSelectedCustomers([...selectedCustomers, customerCode]);
    } else {
      setSelectedCustomers(
        selectedCustomers.filter((code) => code !== customerCode)
      );
      // Remove from other states too
      const newTargetTypes = { ...customerTargetTypes };
      const newUnits = { ...customerUnits };
      delete newTargetTypes[customerCode];
      delete newUnits[customerCode];
      setCustomerTargetTypes(newTargetTypes);
      setCustomerUnits(newUnits);
    }
  };

  const handleTargetTypeChange = (customerCode, targetType) => {
    setCustomerTargetTypes({
      ...customerTargetTypes,
      [customerCode]: targetType,
    });
  };

  const handleUnitChange = (customerCode, unit) => {
    setCustomerUnits({
      ...customerUnits,
      [customerCode]: unit,
    });
  };

  const handleCreate = () => {
    // Validate required fields
    if (!beat) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Please select a Beat option",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    if (!selectedLocation) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Please select a Location",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    // Show customer selection section
    setShowCustomerSection(true);
    console.log("Beat and Location selected:", { beat, selectedLocation });
  };

  const handleAddNewPlan = () => {
    // Validate customer selections
    if (selectedCustomers.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Please select at least one customer",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    // Validate that selected customers have target types and units
    for (const customerCode of selectedCustomers) {
      if (!customerTargetTypes[customerCode]) {
        Swal.fire({
          icon: "error",
          title: "Missing Field",
          text: `Please select Target Type for customer ${customerCode}`,
          confirmButtonColor: "#f97316",
        });
        return;
      }
      if (!customerUnits[customerCode]) {
        Swal.fire({
          icon: "error",
          title: "Missing Field",
          text: `Please select Unit for customer ${customerCode}`,
          confirmButtonColor: "#f97316",
        });
        return;
      }
    }

    // Process the complete plan data
    const completePlanData = {
      ...formData, // Data from ViewPlan1
      beat,
      location: selectedLocation,
      selectedCustomers: selectedCustomers.map((code) => {
        const customer = customerData[selectedLocation].find(
          (c) => c.code === code
        );
        return {
          ...customer,
          targetType: customerTargetTypes[code],
          unit: customerUnits[code],
        };
      }),
    };

    console.log("Complete Plan created successfully:", completePlanData);

    // Navigate back to ViewPlan1 with the created plan data
    navigate("/view-plan", {
      state: {
        createdPlan: completePlanData,
        returnFromPlan: true,
      },
    });
  };

  const handleCancel = () => {
    setShowCustomerSection(false);
    setSelectedCustomers([]);
    setCustomerTargetTypes({});
    setCustomerUnits({});
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleCreatePlan = () => {
    // Navigate to ViewPlan1 to start a new plan
    navigate("/view-plan");
  };

  const handleApplyLeave = () => {
    // Navigate to Apply Leave page
    navigate("/apply-leave");
  };

  const handleImport = () => {
    // Navigate to Sales Import page
    navigate("/sales-import");
  };

  const handleImportTemplate = () => {
    // Create Excel template data
    const templateData = [
      {
        customer_code: "CUST001",
        part_no: "PART001",
        quantity: 10,
        validity_date: "2024-12-31",
        site_number: "SITE001",
        reference_number: "REF001",
        scheduled_date: "2024-01-15",
        warehouse: "WH001",
      },
    ];

    // Create CSV content
    const headers = [
      "customer_code",
      "part_no",
      "quantity",
      "validity_date",
      "site_number",
      "reference_number",
      "scheduled_date",
      "warehouse",
    ];

    // Create CSV string
    let csvContent = headers.join(",") + "\n";
    templateData.forEach((row) => {
      const values = headers.map((header) => row[header] || "");
      csvContent += values.join(",") + "\n";
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Import_Template.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Template Downloaded",
      text: "Import template downloaded successfully!\nFile: Import_Template.csv",
      confirmButtonColor: "#f97316",
    });
  };

  return (
    <div className="view-plan-2-container">
      <Header />

      <div className="view-plan-2-content">
        <div className="view-plan-2-header">
          <h2 className="page-title">View Plan</h2>

          <div className="header-buttons">
            <button onClick={handleBack} className="header-btn back-btn">
              ← Back
            </button>
            <button
              onClick={handleCreatePlan}
              className="header-btn create-plan"
            >
              Create Plan
            </button>
            <button
              onClick={handleApplyLeave}
              className="header-btn apply-leave"
            >
              Apply Leave
            </button>
            <button onClick={handleImport} className="header-btn import">
              Import
            </button>
            <button
              className="header-btn import-template"
              onClick={handleImportTemplate}
            >
              Import Template
            </button>
          </div>
        </div>

        {/* First Form Section - Employee Information (readonly) */}
        <div className="form-section">
          <div className="form-controls">
            <div className="control-row">
              <div className="control-item">
                <label className="control-label">Date</label>
                <input
                  type="text"
                  value={formData.date || ""}
                  readOnly
                  className="date-input readonly"
                  placeholder="Date"
                />
              </div>

              <div className="control-item">
                <label className="control-label">Employee Code</label>
                <input
                  type="text"
                  value={formData.employeeCode || ""}
                  readOnly
                  className="employee-input readonly"
                  placeholder="Employee Code"
                />
              </div>

              <div className="control-item">
                <label className="control-label">Employee Name</label>
                <input
                  type="text"
                  value={formData.employeeName || ""}
                  readOnly
                  className="employee-input readonly"
                  placeholder="Employee Name"
                />
              </div>

              <div className="control-item">
                <label className="control-label">Employee Mobile Number</label>
                <input
                  type="tel"
                  value={formData.employeeMobileNumber || ""}
                  readOnly
                  className="mobile-input readonly"
                  placeholder="Mobile Number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Form Section - Beat and Location Selection */}
        <div className="form-section-2">
          <div className="form-controls-2">
            <div className="control-row-2">
              <div className="control-item-2">
                <label className="control-label-2">Beat</label>
                <select
                  value={beat}
                  onChange={handleBeatChange}
                  className="beat-select"
                >
                  <option value="">Select Location</option>
                  {beatOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-item-2">
                <label className="control-label-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  className="location-select"
                >
                  <option value="">Select Location</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-item-2 button-group">
                <button onClick={handleCreate} className="create-button">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Selection Section - Shows after Create button is clicked */}
        {showCustomerSection && selectedLocation && (
          <div className="customer-selection-section">
            <h3 className="customer-section-title">
              Selected Location Customer
            </h3>

            <div className="customer-table-container">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Dealers Code</th>
                    <th>Dealers Name</th>
                    <th>Contact Number</th>
                    <th>Target Type</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData[selectedLocation]?.map((customer) => (
                    <tr key={customer.code}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.code)}
                          onChange={(e) =>
                            handleCustomerSelect(
                              customer.code,
                              e.target.checked
                            )
                          }
                          className="customer-checkbox"
                        />
                      </td>
                      <td>{customer.code}</td>
                      <td>{customer.name}</td>
                      <td>{customer.contact}</td>
                      <td>
                        <select
                          value={customerTargetTypes[customer.code] || ""}
                          onChange={(e) =>
                            handleTargetTypeChange(
                              customer.code,
                              e.target.value
                            )
                          }
                          className="target-type-select"
                          disabled={!selectedCustomers.includes(customer.code)}
                        >
                          <option value="">Select Target type</option>
                          {targetTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={customerUnits[customer.code] || ""}
                          onChange={(e) =>
                            handleUnitChange(customer.code, e.target.value)
                          }
                          className="unit-select"
                          disabled={!selectedCustomers.includes(customer.code)}
                        >
                          <option value="">Select Unit</option>
                          {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="customer-action-buttons">
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleAddNewPlan} className="add-plan-btn">
                Add New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPlan_2;
