// Layout.jsx
import React, { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // ✅ For nested routing

const Layout = () => {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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
