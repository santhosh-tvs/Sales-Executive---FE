// Layout.jsx
import React, { useRef, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SessionMonitor from "../components/SessionMonitor";

const Layout = () => {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ✅ Dynamically calculate header height for proper padding
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <>
      {/* Session Monitor - monitors token validity and cross-tab logout */}
      <SessionMonitor />
      
      {/* Header */}
      <div ref={headerRef}>
      </div>

      {/* Page content area (padded so content starts below header) */}
      <div style={{ paddingTop: headerHeight || 75 }}>
        <Outlet /> {/* ✅ This renders the matched child route */}
      </div>
    </>
  );
};

export default Layout;
