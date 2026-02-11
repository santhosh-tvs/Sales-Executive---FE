import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "../../../styles/Sales/Beat/ViewPlan1.css";

const ViewPlan1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeMobileNumber, setEmployeeMobileNumber] = useState("");

  // State for created plans
  const [createdPlans, setCreatedPlans] = useState({});
  // State for applied leaves
  const [appliedLeaves, setAppliedLeaves] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPlans = localStorage.getItem("createdPlans");
    const savedLeaves = localStorage.getItem("appliedLeaves");

    if (savedPlans) {
      try {
        setCreatedPlans(JSON.parse(savedPlans));
      } catch (error) {
        console.error("Error loading saved plans:", error);
      }
    }

    if (savedLeaves) {
      try {
        setAppliedLeaves(JSON.parse(savedLeaves));
      } catch (error) {
        console.error("Error loading saved leaves:", error);
      }
    }
  }, []);

  // Get current date for default month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Sample employee data with mobile numbers - Enhanced database
  const employees = [
    { code: "YAMUNARAM-AL-00257", name: "YAMUNARAM AL", mobile: "9898542396" },
    { code: "SANOOP-TK-00123", name: "SANOOP THEKKIYIL", mobile: "9444555666" },
    { code: "RAJESH-BN-00456", name: "RAJESH BANGALORE", mobile: "9876543210" },
    { code: "PRIYA-CH-00789", name: "PRIYA CHENNAI", mobile: "9123456789" },
    { code: "KUMAR-HY-00321", name: "KUMAR HYDERABAD", mobile: "9988776655" },
    { code: "DEEPA-KL-00654", name: "DEEPA KERALA", mobile: "9111222333" },
    { code: "ARUN-MU-00987", name: "ARUN MUMBAI", mobile: "9555444333" },
    { code: "LAKSHMI-PU-00147", name: "LAKSHMI PUNE", mobile: "9777888999" },
    { code: "VIKRAM-DE-00258", name: "VIKRAM DELHI", mobile: "9333222111" },
    { code: "MEERA-KO-00369", name: "MEERA KOLKATA", mobile: "9666555444" },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = ["2023", "2024", "2025", "2026", "2027"];

  // Handle returning from ViewPlan_2 with created plan or Apply_Leave with leave data
  useEffect(() => {
    const stateData = location.state;

    // Handle plan data from ViewPlan_2
    if (stateData?.returnFromPlan && stateData?.createdPlan) {
      const planData = stateData.createdPlan;
      const planDate = planData.date;

      // Store the created plan data indexed by date
      setCreatedPlans((prev) => {
        const updatedPlans = {
          ...prev,
          [planDate]: planData,
        };
        // Save to localStorage
        localStorage.setItem("createdPlans", JSON.stringify(updatedPlans));
        return updatedPlans;
      });
    }

    // Handle leave data from Apply_Leave
    if (stateData?.returnFromLeave && stateData?.appliedLeave) {
      const leaveData = stateData.appliedLeave;
      const leaveDate = leaveData.date;

      // Store the applied leave data indexed by date
      setAppliedLeaves((prev) => {
        const updatedLeaves = {
          ...prev,
          [leaveDate]: leaveData,
        };
        // Save to localStorage
        localStorage.setItem("appliedLeaves", JSON.stringify(updatedLeaves));
        return updatedLeaves;
      });
    }

    // Clear the location state to prevent repeated processing
    if (stateData?.returnFromPlan || stateData?.returnFromLeave) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Function to validate and auto-fill employee data
  const validateAndFillEmployeeData = () => {
    if (date && employeeCode) {
      const selectedEmployee = employees.find(
        (emp) => emp.code === employeeCode
      );
      if (selectedEmployee) {
        setEmployeeName(selectedEmployee.name);
        setEmployeeMobileNumber(selectedEmployee.mobile);
        return true;
      }
    }
    return false;
  };

  const handleEmployeeCodeChange = (e) => {
    const selectedCode = e.target.value;
    setEmployeeCode(selectedCode);

    // Auto-fill both name and mobile when code is selected
    if (selectedCode) {
      const selectedEmployee = employees.find(
        (emp) => emp.code === selectedCode
      );
      if (selectedEmployee) {
        setEmployeeName(selectedEmployee.name);
        setEmployeeMobileNumber(selectedEmployee.mobile);
      } else {
        setEmployeeName("");
        setEmployeeMobileNumber("");
      }
    } else {
      // Clear fields when no employee is selected
      setEmployeeName("");
      setEmployeeMobileNumber("");
    }
  };

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate) {
      // Convert from YYYY-MM-DD to DD-MM-YYYY format
      const [year, month, day] = inputDate.split("-");
      const formattedDate = `${day}-${month}-${year}`;
      setDate(formattedDate);

      // If employee code is already selected, refresh the employee data
      if (employeeCode) {
        const selectedEmployee = employees.find(
          (emp) => emp.code === employeeCode
        );
        if (selectedEmployee) {
          setEmployeeName(selectedEmployee.name);
          setEmployeeMobileNumber(selectedEmployee.mobile);
        }
      }
    } else {
      setDate("");
    }
  };

  // Convert date back to YYYY-MM-DD for input value
  const getInputDateValue = () => {
    if (date) {
      const [day, month, year] = date.split("-");
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  const handleSubmit = () => {
    // Validate that all required fields are filled
    if (!date) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Please select a date before submitting.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (!employeeCode) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Please select an employee code before submitting.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    if (!employeeName || !employeeMobileNumber) {
      Swal.fire({
        icon: "error",
        title: "Invalid Employee",
        text: "Employee data not found. Please check the employee code.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    // Success - process the form data
    const formData = {
      date,
      employeeCode,
      employeeName,
      employeeMobileNumber,
    };

    console.log("Form submitted successfully:", formData);

    // Navigate to ViewPlan_2 with form data
    navigate("/viewplan2", { state: formData });
  };

  const handleCreatePlan = () => {
    // Navigate to ViewPlan1 (refresh the page to start a new plan)
    navigate("/view-plan");
    // Reset form data for new plan
    setDate("");
    setEmployeeCode("");
    setEmployeeName("");
    setEmployeeMobileNumber("");
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

  const handleClearCalendarData = () => {
    // Function to clear all calendar data (for testing/admin purposes)
    if (
      window.confirm(
        "Are you sure you want to clear all calendar data? This will remove all plans and leaves."
      )
    ) {
      setCreatedPlans({});
      setAppliedLeaves({});
      localStorage.removeItem("createdPlans");
      localStorage.removeItem("appliedLeaves");
      Swal.fire({
        title: "Are you sure?",
        text: "This will remove all plans and leaves!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, clear it!",
      }).then((result) => {
        if (result.isConfirmed) {
          setCreatedPlans({});
          setAppliedLeaves({});
          localStorage.removeItem("createdPlans");
          localStorage.removeItem("appliedLeaves");

          Swal.fire({
            icon: "success",
            title: "Cleared!",
            text: "Calendar data cleared successfully!",
            confirmButtonColor: "#f97316",
          });
        }
      });
    }
  };

  const handleBeat = () => {
    console.log("Beat clicked");
  };

  const handleLeave = () => {
    console.log("Leave clicked");
  };

  // Generate calendar days for the selected month/year
  const generateCalendarDays = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const year = parseInt(selectedYear);
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    // We need to adjust for Monday start (Monday = 0, Sunday = 6)
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Convert to Monday = 0

    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, monthIndex - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isCurrentMonth: true,
        isNextMonth: false,
      });
    }

    // Next month's leading days to complete the grid
    const totalCells = Math.ceil(days.length / 7) * 7; // Round up to complete weeks
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day: day,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return days;
  };

  // Handle calendar day click
  const handleCalendarDayClick = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    const monthIndex = months.indexOf(selectedMonth);
    const year = parseInt(selectedYear);
    const clickedDate = `${day.toString().padStart(2, "0")}-${(monthIndex + 1)
      .toString()
      .padStart(2, "0")}-${year}`;

    // Check if there's a plan for this date
    const planForDate = createdPlans[clickedDate];
    // Check if there's a leave for this date
    const leaveForDate = appliedLeaves[clickedDate];

    if (planForDate) {
      // Show plan details in popup
      const customerDetails = planForDate.selectedCustomers
        .map(
          (customer) =>
            `• ${customer.name} (${customer.code}) - ${customer.targetType}, ${customer.unit}`
        )
        .join("\n");

      Swal.fire({
        title: "📋 Beat Plan Details",
        html: `
    <div style="text-align:left;">
      <b>Date:</b> ${clickedDate}<br>
      <b>Employee:</b> ${planForDate.employeeName}<br>
      <b>Beat:</b> ${planForDate.beat}<br>
      <b>Location:</b> ${planForDate.location}<br><br>
      <b>Selected Customers (${planForDate.selectedCustomers.length}):</b><br>
      <ul style="margin-top:5px; padding-left:20px;">
        ${planForDate.selectedCustomers
          .map(
            (c) => `<li>${c.name} (${c.code}) - ${c.targetType}, ${c.unit}</li>`
          )
          .join("")}
      </ul>
    </div>
  `,
        icon: "info",
        confirmButtonText: "Close",
        confirmButtonColor: "#f97316",
        width: "600px",
        background: "#fff",
        customClass: {
          popup: "swal2-rounded",
        },
      });
    } else if (leaveForDate) {
      // Show leave details in popup
      Swal.fire({
        title: "🌴 Leave Details",
        html: `
    <div style="text-align:left;">
      <b>Date:</b> ${clickedDate}<br>
      <b>Employee:</b> ${leaveForDate.employeeName}<br>
      <b>Code:</b> ${leaveForDate.employeeCode}<br>
      <b>Mobile:</b> ${leaveForDate.employeeMobileNumber}<br><br>
      <b>Reason:</b><br>${leaveForDate.reason}
    </div>
  `,
        icon: "warning",
        confirmButtonText: "Okay",
        confirmButtonColor: "#10b981",
        width: "500px",
        background: "#fff",
      });
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="view-plan-container">
      <Header />
      <Breadcrumb currentPage="View Plan" />

      <div className="view-plan-content">
        <div className="view-plan-header">
          <div className="title-section">
            <h2 className="page-title">View Plan</h2>
          </div>

          <div className="header-actions-group">
            <div className="view-plan-search-box">
              <input
                type="text"
                placeholder="Search Customer Name / Code"
                className="view-plan-search-input"
              />
              <span className="view-plan-search-icon">🔍</span>
            </div>
            
            <button className="view-plan-action-btn delete-btn">
              <span className="btn-icon">🗑️</span>
              Delete
            </button>
            <button className="view-plan-action-btn filters-btn">
              <span className="btn-icon">☰</span>
              Filters
            </button>
            <button className="view-plan-action-btn export-btn">
              <span className="btn-icon">⬇</span>
              Export
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="form-controls">
            <div className="control-row">
              <div className="control-item">
                <label className="control-label">Date</label>
                <input
                  type="date"
                  value={getInputDateValue()}
                  onChange={handleDateChange}
                  className="date-input"
                  placeholder="01-01-2025"
                />
              </div>

              <div className="control-item">
                <label className="control-label">Employee Code</label>
                <select
                  value={employeeCode}
                  onChange={handleEmployeeCodeChange}
                  className="employee-select"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.code} value={employee.code}>
                      {employee.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-item">
                <label className="control-label">Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  readOnly
                  className="employee-input readonly"
                  placeholder="Employee Name"
                />
              </div>

              <div className="control-item">
                <label className="control-label">Employee Mobile Number</label>
                <input
                  type="tel"
                  value={employeeMobileNumber}
                  readOnly
                  className="mobile-input readonly"
                  placeholder="Mobile Number"
                />
              </div>

              <div className="control-item submit-item">
                <button onClick={handleSubmit} className="submit-button">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-section">
          <div className="calendar-header">
            <div className="month-year-selector">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-select"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="year-select"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="calendar-action-buttons">
              <button onClick={handleBeat} className="calendar-btn beat-btn">
                Beat
              </button>
              <button onClick={handleLeave} className="calendar-btn leave-btn">
                Leave
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div className="weekday">M</div>
              <div className="weekday">Tu</div>
              <div className="weekday">W</div>
              <div className="weekday">Th</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sa</div>
              <div className="weekday">Su</div>
            </div>

            <div className="calendar-days">
              {calendarDays.map((dayObj, index) => {
                const monthIndex = months.indexOf(selectedMonth);
                const year = parseInt(selectedYear);
                const dayDate = `${dayObj.day.toString().padStart(2, "0")}-${(
                  monthIndex + 1
                )
                  .toString()
                  .padStart(2, "0")}-${year}`;
                const hasPlan = dayObj.isCurrentMonth && createdPlans[dayDate];
                const hasLeave =
                  dayObj.isCurrentMonth && appliedLeaves[dayDate];

                return (
                  <div
                    key={index}
                    className={`calendar-day ${
                      dayObj.isCurrentMonth ? "current-month" : "other-month"
                    } ${hasPlan ? "has-plan" : ""} ${
                      hasLeave ? "has-leave" : ""
                    }`}
                    onClick={() =>
                      handleCalendarDayClick(dayObj.day, dayObj.isCurrentMonth)
                    }
                    style={{
                      cursor: dayObj.isCurrentMonth ? "pointer" : "default",
                    }}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPlan1;
