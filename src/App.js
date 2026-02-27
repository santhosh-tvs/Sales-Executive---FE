import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/layout.jsx";
import Login from "./Sales-Executive/Login/NewLogin.jsx";
import ForgotPassword from "./Sales-Executive/Login/ForgotPassword.jsx";
import VerifyOTP from "./Sales-Executive/Login/VerifyOTP.jsx";

// Sales Home
import SalesHome from "./Sales-Executive/Sales/Home1/Home_Page.jsx";

// Sales History
import Consolidate_Report from "./Sales-Executive/Sales/History/Consolidate_Report.jsx";

// Sales Orders
import Create_Order from "./Sales-Executive/Sales/Create_Order/Create_Order.jsx";
import S_BulkOrder from "./Sales-Executive/S-orders/S-bulk-order.jsx";
import S_ImportOrder from "./Sales-Executive/S-orders/S-Import.jsx";
import S_BulkOrder2 from "./Sales-Executive/S-orders/S-bulk-order-2.jsx";
import S_ImportStatus from "./Sales-Executive/S-orders/S-ImportStatus.jsx";
import S_OrderView from "./Sales-Executive/S-orders/S-order-view.jsx";

// Sales Reports - Using Receipt module instead
import ReceiptPage from "./Sales-Executive/Receipt/Components/receipt.jsx";

// Sales Beat
import Locate from "./Sales-Executive/Sales/Beat/Locate.jsx";
import BeatPlanPage from "./Sales-Executive/BeatPlan/BeatPlanPage.jsx";
import ViewPlan_2 from "./Sales-Executive/Sales/Beat/ViewPlan_2.jsx";
import Apply_Leave from "./Sales-Executive/Sales/Beat/Apply_Leave.jsx";
import Sales_Import from "./Sales-Executive/Sales/Beat/Sales_Import.jsx";
import CreateBeat from "./Sales-Executive/BeatPlan/CreateBeat.jsx";

// Profile
import SalesProfile from "./Sales-Executive/Profile/sales-Profile.jsx";

// Cart and Wishlist
import Cart from "./Sales-Executive/Sales/Cart/Cart.jsx";
import Wishlist from "./Sales-Executive/Sales/Wishlist/Wishlist.jsx";

// Brands
import Brands from "./Sales-Executive/Sales/Brands/Brands.jsx";

// Categories
import Categories from "./Sales-Executive/Sales/Categories/Categories.jsx";

// Product Listing
import ProductListing from "./Sales-Executive/Sales/ProductListing/ProductListing.jsx";

// My Actions
import MyActions from "./Sales-Executive/MyActions/Myactions.jsx";

// My Collections
import MyCollections from "./Sales-Executive/MyCollection/Mycollection.jsx";

// My Customers
import MyCustomers from "./Sales-Executive/MycustomerPage/Mycustomer.jsx";

// Customer Summary
import CustomerSummary from "./Sales-Executive/My Customer page-Summary/Customersumary.jsx";

// Masters
import Masters from "./Sales-Executive/Masters/Masters.jsx";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Login (No Layout) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* 🔹 Sales Executive Pages (With Layout) */}
        <Route element={<Layout />}>
          <Route path="/sales-home" element={<SalesHome />} />

          {/* Orders */}
          <Route path="/create-order" element={<Create_Order />} />
          <Route path="/s-bulk" element={<S_BulkOrder />} />
          <Route path="/s-bulk-order-2" element={<S_BulkOrder2 />} />
          <Route path="/s-import" element={<S_ImportOrder />} />
          <Route path="/s-import-status" element={<S_ImportStatus />} />
          <Route path="/s-order-view" element={<S_OrderView />} />

          {/* Reports - Removed old Report module, using Receipt module */}
          <Route
            path="/consolidate-report"
            element={<Consolidate_Report />}
          />
          <Route path="/receipt" element={<ReceiptPage />} />

          {/* Beat */}
          <Route path="/locate" element={<Locate />} />
          <Route path="/view-plan" element={<BeatPlanPage />} />
          <Route path="/beatplan" element={<BeatPlanPage />} />
          <Route path="/viewplan2" element={<ViewPlan_2 />} />
          <Route path="/apply-leave" element={<Apply_Leave />} />
          <Route path="/sales-import" element={<Sales_Import />} />
          <Route path="/create-beat" element={<CreateBeat />} />

          {/* Profile */}
          <Route path="/sales-profile" element={<SalesProfile />} />

          {/* Cart and Wishlist */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Brands */}
          <Route path="/brands" element={<Brands />} />

          {/* Categories */}
          <Route path="/categories/:brandName" element={<Categories />} />

          {/* Product Listing */}
          <Route path="/product-listing" element={<ProductListing />} />

          {/* My Actions */}
          <Route path="/my-actions" element={<MyActions />} />

          {/* My Collections */}
          <Route path="/my-collections" element={<MyCollections />} />

          {/* My Customers */}
          <Route path="/my-customers" element={<MyCustomers />} />

          {/* Customer Summary */}
          <Route path="/customer-summary" element={<CustomerSummary />} />

          {/* Masters */}
          <Route path="/masters" element={<Masters />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
