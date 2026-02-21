import React from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard-bg">
      <div className="navbar">FleetFlow</div>
      {/* ...existing dashboard content... */}
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-searchbar-row">
          <input
            type="text"
            placeholder="Search bar"
            className="admin-dashboard-searchbar"
          />
          <button className="admin-dashboard-newservice-btn">
            + New Service
          </button>
        </div>
        <div className="admin-dashboard-summary-row">
          <div className="admin-dashboard-summary-card">Active Fleet</div>
          <div className="admin-dashboard-summary-card">Maintaince Alert</div>
          <div className="admin-dashboard-summary-card">Utilization Rate</div>
          <div className="admin-dashboard-summary-card">Pending Cargo</div>
        </div>
        <div className="admin-dashboard-table-row">
          <div className="admin-dashboard-table-col">
            <div className="admin-dashboard-table-header">Trip</div>
          </div>
          <div className="admin-dashboard-table-col">
            <div className="admin-dashboard-table-header">Vehicle</div>
          </div>
          <div className="admin-dashboard-table-col">
            <div className="admin-dashboard-table-header">Driver</div>
          </div>
          <div className="admin-dashboard-table-col">
            <div className="admin-dashboard-table-header">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
