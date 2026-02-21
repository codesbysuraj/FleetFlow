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

const AdminDashboard = ({ onNavigate }) => {
  const [showTripForm, setShowTripForm] = useState(false);
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
      <div className="navbar">
        <span>FleetFlow</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="navbar-vehicle-btn"
            onClick={() => onNavigate && onNavigate('vehicles')}
          >
            Vehicle Registry
          </button>
          <button 
            className="navbar-vehicle-btn"
            onClick={() => onNavigate && onNavigate('trips')}
          >
            Trip Dispatcher
          </button>
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
          <div className="admin-dashboard-table-card">
            <div
              className="admin-dashboard-table-header"
              style={{ fontWeight: 700 }}
            >
              Trip
            </div>
            <div className="admin-dashboard-table-body">
              {trips.length === 0 ? (
                <div style={{ color: "#bbb", padding: "1rem" }}>
                  No trips yet
                </div>
              ) : (
                trips.map((trip, idx) => (
                  <div key={idx} className="admin-dashboard-table-entry">
                    {trip.origin} → {trip.destination}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="admin-dashboard-table-card">
            <div
              className="admin-dashboard-table-header"
              style={{ fontWeight: 700 }}
            >
              Vehicle
            </div>
            <div className="admin-dashboard-table-body">
              {trips.length === 0 ? (
                <div style={{ color: "#bbb", padding: "1rem" }}>
                  No trips yet
                </div>
              ) : (
                trips.map((trip, idx) => (
                  <div key={idx} className="admin-dashboard-table-entry">
                    {trip.vehicle}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="admin-dashboard-table-card">
            <div
              className="admin-dashboard-table-header"
              style={{ fontWeight: 700 }}
            >
              Driver
            </div>
            <div className="admin-dashboard-table-body">
              {trips.length === 0 ? (
                <div style={{ color: "#bbb", padding: "1rem" }}>
                  No trips yet
                </div>
              ) : (
                trips.map((trip, idx) => (
                  <div key={idx} className="admin-dashboard-table-entry">
                    {trip.driver}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="admin-dashboard-table-card">
            <div
              className="admin-dashboard-table-header"
              style={{ fontWeight: 700 }}
            >
              Status
            </div>
            <div className="admin-dashboard-table-body">
              {trips.length === 0 ? (
                <div style={{ color: "#bbb", padding: "1rem" }}>
                  No trips yet
                </div>
              ) : (
                trips.map((trip, idx) => (
                  <div key={idx} className="admin-dashboard-table-entry">
                    {trip.status}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;