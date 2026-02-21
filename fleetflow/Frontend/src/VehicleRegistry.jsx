import React, { useState } from "react";
import "./VehicleRegistry.css";

function VehicleRegistry({ onNavigate }) {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: "AA00",
      model: "2011",
      type: "MAN",
      capacity: "5 tons",
      odometer: 94000,
      status: "Idle",
    },
  ]);

  const [formData, setFormData] = useState({
    plate: "",
    maxPayload: "",
    initialOdometer: "",
    type: "",
    model: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing vehicle
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === editingId
            ? {
                ...vehicle,
                plate: formData.plate,
                model: formData.model,
                type: formData.type,
                capacity: formData.maxPayload,
                odometer: parseInt(formData.initialOdometer),
              }
            : vehicle,
        ),
      );
      setEditingId(null);
    } else {
      // Add new vehicle
      const newVehicle = {
        id: Date.now(),
        plate: formData.plate,
        model: formData.model,
        type: formData.type,
        capacity: formData.maxPayload,
        odometer: parseInt(formData.initialOdometer),
        status: "Idle",
      };
      setVehicles((prev) => [...prev, newVehicle]);
    }

    // Reset form
    setFormData({
      plate: "",
      maxPayload: "",
      initialOdometer: "",
      type: "",
      model: "",
    });
  };

  const handleEdit = (vehicle) => {
    setFormData({
      plate: vehicle.plate,
      maxPayload: vehicle.capacity,
      initialOdometer: vehicle.odometer.toString(),
      type: vehicle.type,
      model: vehicle.model,
    });
    setEditingId(vehicle.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      plate: "",
      maxPayload: "",
      initialOdometer: "",
      type: "",
      model: "",
    });
    setEditingId(null);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExport = () => {
    const csvContent = [
      ["NO", "Plate", "Model", "Type", "Capacity", "Odometer", "Status"],
      ...vehicles.map((v, i) => [
        i + 1,
        v.plate,
        v.model,
        v.type,
        v.capacity,
        v.odometer,
        v.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fleet_vehicles.csv";
    a.click();
  };

  return (
    <div className="vehicle-registry-bg">
      <div className="registry-layout">
        {/* Left Side - New Vehicle Registration Form */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">
              {editingId ? "Edit Vehicle" : "New Vehicle Registration"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="form-field">
              <label htmlFor="plate" className="field-label">
                License Plate:
              </label>
              <input
                type="text"
                id="plate"
                name="plate"
                className="field-input"
                value={formData.plate}
                onChange={handleInputChange}
                placeholder="e.g., AA00"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="maxPayload" className="field-label">
                Max Payload:
              </label>
              <input
                type="text"
                id="maxPayload"
                name="maxPayload"
                className="field-input"
                value={formData.maxPayload}
                onChange={handleInputChange}
                placeholder="e.g., 5 tons"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="initialOdometer" className="field-label">
                Initial Odometer:
              </label>
              <input
                type="number"
                id="initialOdometer"
                name="initialOdometer"
                className="field-input"
                value={formData.initialOdometer}
                onChange={handleInputChange}
                placeholder="e.g., 94000"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="type" className="field-label">
                Type:
              </label>
              <input
                type="text"
                id="type"
                name="type"
                className="field-input"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., MAN"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="model" className="field-label">
                Model:
              </label>
              <input
                type="text"
                id="model"
                name="model"
                className="field-input"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., 2011"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-save">
                {editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Vehicle Registry Table */}
        <div className="table-section">
          <div className="section-header">
            <h2 className="section-title">
              Vehicle Registry (Asset Management)
            </h2>
            <p className="section-description">
              What it's for: This is your digital garage. It's the place where
              you add, view, change, or remove every vehicle your company owns.
            </p>
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <button className="btn btn-primary btn-new" onClick={handleCancel}>
              + New Vehicle
            </button>
            <input
              type="text"
              className="search-input"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-secondary">Import</button>
            <button className="btn btn-secondary" onClick={handleExport}>
              Export
            </button>
          </div>

          {/* Fleet Table */}
          <div className="table-wrapper">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>Plate</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle, index) => (
                    <tr key={vehicle.id}>
                      <td>{index + 1}</td>
                      <td className="plate-cell">{vehicle.plate}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.type}</td>
                      <td>{vehicle.capacity}</td>
                      <td>{vehicle.odometer.toLocaleString()}</td>
                      <td>
                        <span
                          className={`status-badge status-${vehicle.status.toLowerCase()}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(vehicle)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(vehicle.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No vehicles found. Add your first vehicle!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <h4>The Details You Track:</h4>
            <ul>
              <li>
                <strong>Name/Model:</strong> The specific name/make of the
                vehicle.
              </li>
              <li>
                <strong>License Plate:</strong> The unique ID for each vehicle
                so you don't mix them up.
              </li>
              <li>
                <strong>Max Load Capacity:</strong> How much weight the vehicle
                can safely carry (in kg or tons).
              </li>
              <li>
                <strong>Odometer:</strong> The current mileage on the vehicle's
                dashboard.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleRegistry;
