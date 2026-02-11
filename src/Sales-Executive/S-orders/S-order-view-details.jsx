// OrderViewDetails.jsx
import React, { useState } from "react";
import Header from "../header/Header";
import DownloadIcon from "../../assets/Icons/Import.png"; // Ensure this icon exists
import "../../styles/S-orders/order-view-details.css";

const OrderViewDetails = ({ order, onBack }) => {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const orderItems = order?.items || [];
  const filteredItems = orderItems.filter((item) => {
    const matchesSearch = item.partNumber
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDate = selectedDate
      ? item.deliveryDate === selectedDate
      : true;
    return matchesSearch && matchesDate;
  });

  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Header />
      <div className="order-details-container">
        <div className="order-view-header">
          <div className="order-header">
            <div className="back-button" onClick={onBack}>
              ←
            </div>
            <div className="order-title">
              <div className="order-title-text">Order Number</div>
              <div className="order-number">{order?.orderNumber}</div>
            </div>
          </div>
          <div className="order-controls">
            <input
              type="date"
              className="date-input"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search"
              className="search-input-order-view-details"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="export-btn"
              onClick={() => {
                const exportData = filteredItems.map(
                  ({
                    partNumber,
                    invoiceNumber,
                    dispatchDate,
                    deliveryDate,
                    quantity,
                    price,
                    status,
                  }) =>
                    `${partNumber},${invoiceNumber},${dispatchDate},${deliveryDate},${quantity},${price},${status}`
                );
                const blob = new Blob([exportData.join("\n")], {
                  type: "text/csv",
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "order-details.csv");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              }}
            >
              <img src={DownloadIcon} alt="Export" className="export-icon" />{" "}
              Export
            </button>
          </div>
        </div>

        <div className="order-table-wrapper">
          <table className="order-table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Invoice Number</th>
                <th>Dispatch Date</th>
                <th>Delivery Date</th>
                <th>Quantity Ordered</th>
                <th>Price per Unit</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.partNumber}</td>
                  <td>{item.invoiceNumber}</td>
                  <td>{item.dispatchDate}</td>
                  <td>{item.deliveryDate}</td>
                  <td>{item.quantity}</td>
                  <td>₹ {item.price}</td>
                  <td>
                    <span
                      className={`status-badge ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button
            className="page-nav"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {[...Array(pageCount).keys()].slice(0, 5).map((num) => (
            <button
              key={num + 1}
              className={`page-btn ${currentPage === num + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(num + 1)}
            >
              {(num + 1).toString().padStart(2, "0")}
            </button>
          ))}
          {pageCount > 5 && <span className="ellipsis">...</span>}
          <button
            className="page-btn"
            onClick={() => setCurrentPage(pageCount)}
          >
            {pageCount.toString().padStart(2, "0")}
          </button>
          <button
            className="page-nav"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
            disabled={currentPage === pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderViewDetails;
