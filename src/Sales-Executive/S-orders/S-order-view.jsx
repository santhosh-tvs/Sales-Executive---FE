import React, { useState, useMemo, useEffect } from "react";
import Header from "../header/Header";
import OrderViewDetails from "./S-order-view-details";
import Download from "../../assets/Icons/Import.png";
import "../../styles/S-orders/order-view.css";

const getStatusClass = (status) => {
  switch (status) {
    case "Invoiced":
      return "status invoiced";
    case "Dispatched":
      return "status dispatched";
    case "Delivery":
      return "status delivery";
    default:
      return "status";
  }
};

const OrderView = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 8;

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      const dummyData = Array.from({ length: 50 }, (_, i) => ({
        orderNumber: `5340109BAR00${i + 1}IN`,
        date: "2100-02-10",
        quantity: Math.floor(Math.random() * 5) + 1,
        status: ["Invoiced", "Dispatched", "Delivery"][i % 3],
        orderStatus: "Credit",
        location: ["Chennai", "Mumbai", "Delhi"][i % 3],
        items: [
          {
            partNumber: `PN-${i + 1}`,
            invoiceNumber: `INV-${i + 1}`,
            dispatchDate: "2100-02-11",
            deliveryDate: "2100-02-12",
            quantity: Math.floor(Math.random() * 10) + 1,
            price: Math.floor(Math.random() * 500) + 100,
            status: ["Pending", "Delivered", "Cancelled"][i % 3],
          },
        ],
      }));
      setOrders(dummyData);
    };
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.location.toLowerCase().includes(search.toLowerCase());
      const matchesDate = selectedDate ? order.date === selectedDate : true;
      return matchesSearch && matchesDate;
    });
  }, [search, selectedDate, orders]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (selectedOrder) {
    return (
      <OrderViewDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div>
      <Header />
      <div className="order-view-container">
        <div className="order-view-header">
          <div className="order-title">
            <h2>Order View</h2>
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
              className="search-input-order-view"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="export-btn"
              onClick={() => {
                const exportData = filteredOrders.map(
                  ({
                    orderNumber,
                    date,
                    quantity,
                    status,
                    orderStatus,
                    location,
                  }) =>
                    `${orderNumber},${date},${quantity},${status},${orderStatus},${location}`
                );
                const blob = new Blob([exportData.join("\n")], {
                  type: "text/csv",
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "orders.csv");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
              }}
            >
              <img src={Download} alt="Download" className="export-icon" />
              Export
            </button>
          </div>
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th>Quantity</th>
              <th>Order Status</th>
              <th>Order Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, index) => (
              <tr key={index}>
                <td>
                  <span
                    className="order-link"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {order.orderNumber}
                  </span>
                </td>
                <td>{order.date}</td>
                <td>{order.quantity}</td>
                <td>
                  <span className={getStatusClass(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td>{order.orderStatus}</td>
                <td>{order.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-order-view">
          <button
            className="prev"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 5)
            .map((num) => (
              <button
                key={num}
                className={`pagination-page ${
                  currentPage === num ? "active" : ""
                }`}
                onClick={() => setCurrentPage(num)}
              >
                {num.toString().padStart(2, "0")}
              </button>
            ))}
          {totalPages > 5 && <span>...</span>}
          {totalPages > 5 && (
            <button onClick={() => setCurrentPage(totalPages)}>
              {totalPages}
            </button>
          )}
          <button
            className="next"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
