import React, { useState } from "react";
import "./AdminDashboard.css";

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Dummy data for dropdowns
const availableVehicles = [
  { id: 1, name: "Truck AA00" },
  { id: 2, name: "Van BB11" },
];
const eligibleDrivers = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
];

const menuItems = [
  "Dashboard",
  "Vehicle Registry",
  "Trip Dispatcher",
  "Maintenance",
  "Trip & Expense",
  "Performance",
  "Analytics",
];

const AdminDashboard = ({ onNavigate }) => {
  const [showTripForm, setShowTripForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Form state
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  // Store trips
  const [trips, setTrips] = useState([]);

  return (
    <div className="admin-dashboard-bg">
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
          <button
            className="navbar-vehicle-btn"
            onClick={() => onNavigate && onNavigate("maintenance")}
          >
            Maintenance Logs
          </button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item}
              className="sidebar-menu-item"
              onClick={() => {
                if (item === "Dashboard") {
                  onNavigate && onNavigate("dashboard");
                } else if (item === "Vehicle Registry") {
                  onNavigate && onNavigate("vehicles");
                } else if (item === "Trip Dispatcher") {
                  onNavigate && onNavigate("trips");
                } else if (item === "Maintenance") {
                  onNavigate && onNavigate("maintenance");
                } else if (item === "Trip & Expense") {
                  onNavigate && onNavigate("expenses");
                } else if (item === "Performance") {
                  onNavigate && onNavigate("performance");
                } else if (item === "Analytics") {
                  onNavigate && onNavigate("analytics");
                }
                setSidebarOpen(false);
              }}
              style={{ cursor: "pointer" }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
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
      <div className="admin-dashboard-container">
        <div
          className="admin-dashboard-searchbar-row"
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Search bar"
            className="admin-dashboard-searchbar"
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="admin-dashboard-newservice-btn"
              onClick={() => setShowTripForm(true)}
            >
              + New Trip
            </button>
            <button className="admin-dashboard-newservice-btn">
              + New Vehicle
            </button>
          </div>
        </div>
        {showTripForm && (
          <div className="trip-form-overlay">
            <div className="trip-form-card">
              <h3 style={{ marginBottom: "1rem" }}>Add New Trip</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTrips((prev) => [
                    ...prev,
                    {
                      vehicle:
                        availableVehicles.find(
                          (v) => v.id.toString() === vehicle,
                        )?.name || "",
                      driver:
                        eligibleDrivers.find((d) => d.id.toString() === driver)
                          ?.name || "",
                      origin,
                      destination,
                      cargoWeight,
                      estimatedCost,
                      status: "Scheduled",
                    },
                  ]);
                  setVehicle("");
                  setDriver("");
                  setOrigin("");
                  setDestination("");
                  setCargoWeight("");
                  setEstimatedCost("");
                  setShowTripForm(false);
                }}
              >
                <div className="trip-form-row">
                  <label>Select Vehicle</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="trip-form-row">
                  <label>Select Driver</label>
                  <select
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {eligibleDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="trip-form-row">
                  <label>Origin</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
                <div className="trip-form-row">
                  <label>Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
                <div className="trip-form-row">
                  <label>Cargo Weight</label>
                  <input
                    type="text"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="trip-form-row">
                  <label>Estimated Cost (optional)</label>
                  <input
                    type="text"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
                >
                  <button
                    type="submit"
                    className="admin-dashboard-newservice-btn"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="admin-dashboard-newservice-btn"
                    style={{ background: "#eee", color: "#333" }}
                    onClick={() => setShowTripForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="admin-dashboard-summary-row">
          <div className="admin-dashboard-summary-card">
            <div style={{ fontWeight: 600 }}>Active Fleet</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginTop: "0.5rem",
              }}
            >
              {randomInt(10, 100)}
            </div>
          </div>
          <div className="admin-dashboard-summary-card">
            <div style={{ fontWeight: 600 }}>Maintaince Alert</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginTop: "0.5rem",
              }}
            >
              {randomInt(1, 20)}
            </div>
          </div>
          <div className="admin-dashboard-summary-card">
            <div style={{ fontWeight: 600 }}>Utilization Rate</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginTop: "0.5rem",
              }}
            >
              {randomInt(50, 99)}%
            </div>
          </div>
          <div className="admin-dashboard-summary-card">
            <div style={{ fontWeight: 600 }}>Pending Cargo</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginTop: "0.5rem",
              }}
            >
              {randomInt(5, 50)}
            </div>
          </div>
        </div>
        <div className="admin-dashboard-table-cards-row">
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="dashboard-no-data">
                      No trips yet
                    </td>
                  </tr>
                ) : (
                  trips.map((trip, idx) => (
                    <tr key={idx}>
                      <td>
                        {trip.origin} → {trip.destination}
                      </td>
                      <td>{trip.vehicle}</td>
                      <td>{trip.driver}</td>
                      <td>{trip.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
