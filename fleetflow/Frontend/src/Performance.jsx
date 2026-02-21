import React, { useState } from "react";
import "./Performance.css";

const menuItems = [
  "Dashboard",
  "Vehicle Registry",
  "Trip Dispatcher",
  "Maintenance",
  "Trip & Expense",
  "Performance",
  "Analytics",
];

const sampleData = [
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
  {
    name: "John",
    license: "23223",
    expiry: "22/36",
    completion: "92%",
    safety: "89%",
    complaints: 4,
  },
  // ... add more rows as needed
];

function Performance({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="performance-bg">
      {/* Sidebar Drawer */}
      <div className={`sidebar-drawer${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Menu</span>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            &times;
          </button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item} className="sidebar-menu-item">
              <button
                type="button"
                aria-label={`Navigate to ${item}`}
                onClick={() => {
                  if (item === "Dashboard") {
                    onNavigate?.("dashboard");
                  } else if (item === "Vehicle Registry") {
                    onNavigate?.("vehicles");
                  } else if (item === "Trip Dispatcher") {
                    onNavigate?.("trips");
                  } else if (item === "Maintenance") {
                    onNavigate?.("maintenance");
                  } else if (item === "Trip & Expense") {
                    onNavigate?.("expenses");
                  } else if (item === "Performance") {
                    onNavigate?.("performance");
                  } else if (item === "Analytics") {
                    onNavigate?.("analytics");
                  }
                  setSidebarOpen(false);
                }}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "8px 16px",
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            border: "none",
            zIndex: 1000,
          }}
        ></button>
      )}
      <div className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Hamburger Icon */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <span>FleetFlow</span>
        </div>
      </div>
      {/* Performance Table */}
      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr
              style={{ color: "#e91e63", fontWeight: 600, fontSize: "1.1rem" }}
            >
              <th>Name</th>
              <th>License#</th>
              <th>Expiry</th>
              <th>Completion Rate</th>
              <th>Safety Score</th>
              <th>Complaints</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>{row.license}</td>
                <td>{row.expiry}</td>
                <td>{row.completion}</td>
                <td>{row.safety}</td>
                <td>{row.complaints}</td>
              </tr>
            ))}
            {/* Add more rows or dots as needed */}
            <tr>
              <td colSpan={6} style={{ textAlign: "center", fontSize: "2rem" }}>
                •<br />•<br />•<br />•
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Performance;
