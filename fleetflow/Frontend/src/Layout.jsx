import React, { useState } from "react";
import "./Layout.css";

// Role-based menu access
const roleMenuMap = {
  manager: ["Dashboard", "Vehicle Registry", "Trip Dispatcher", "Maintenance", "Trip & Expense", "Performance", "Analytics", "Manage Users", "Logout"],
  admin: ["Dashboard", "Vehicle Registry", "Trip Dispatcher", "Maintenance", "Trip & Expense", "Performance", "Analytics", "Manage Users", "Logout"],
  dispatcher: ["Dashboard", "Trip Dispatcher", "Logout"],
  safety: ["Dashboard", "Performance", "Logout"],
  analyst: ["Dashboard", "Trip & Expense", "Analytics", "Logout"],
};

const menuRouteMap = {
  "Dashboard": "dashboard",
  "Vehicle Registry": "vehicles",
  "Trip Dispatcher": "trips",
  "Maintenance": "maintenance",
  "Trip & Expense": "expenses",
  "Performance": "performance",
  "Analytics": "analytics",
  "Manage Users": "users",
  "Logout": "logout",
};

function Layout({ children, onNavigate, userRole, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = roleMenuMap[userRole] || roleMenuMap["manager"];

  return (
    <div className="layout-root">
      {/* Sidebar Drawer */}
      <div className={`layout-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="layout-sidebar-header">
          <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Menu</span>
          <button
            className="layout-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            &times;
          </button>
        </div>
        <ul className="layout-sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item}
              className={`layout-sidebar-item${item === "Logout" ? " layout-sidebar-logout" : ""}`}
              onClick={() => {
                onNavigate && onNavigate(menuRouteMap[item] || "dashboard");
                setSidebarOpen(false);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="layout-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Navbar */}
      <div className="layout-navbar">
        <div className="layout-navbar-left">
          <button
            className="layout-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="layout-hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <span className="layout-brand">FleetFlow</span>
          {pageTitle && <span className="layout-page-title">/ {pageTitle}</span>}
        </div>
      </div>
      {/* Page Content */}
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
