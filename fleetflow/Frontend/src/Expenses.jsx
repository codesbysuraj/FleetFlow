import React, { useState } from "react";
import "./Expenses.css";

const initialExpenses = [
  {
    tripId: 321,
    driver: "John",
    distance: "1000 km",
    fuel: "19k",
    misc: "3k",
    status: "Done",
  },
];

const Expenses = ({ onNavigate }) => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tripId: "",
    driver: "",
    distance: "",
    fuel: "",
    misc: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setExpenses((prev) => [...prev, { ...form }]);
    setForm({
      tripId: "",
      driver: "",
      distance: "",
      fuel: "",
      misc: "",
      status: "",
    });
    setShowForm(false);
  };

  return (
    <div className="expenses-page-container">
      <div className="expenses-header-row">
        <button className="expenses-add-btn" onClick={() => setShowForm(true)}>
          Add an Expense
        </button>
      </div>
      <div className="expenses-table-section">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver</th>
              <th>Distance</th>
              <th>Fuel Expense</th>
              <th>Misc. Expense</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, idx) => (
              <tr key={idx}>
                <td>{exp.tripId}</td>
                <td>{exp.driver}</td>
                <td>{exp.distance}</td>
                <td>{exp.fuel}</td>
                <td>{exp.misc}</td>
                <td>{exp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="expenses-form-overlay">
          <div className="expenses-form-card">
            <h3 className="expenses-form-title">New Expense</h3>
            <form onSubmit={handleSubmit} className="expenses-form">
              <label>
                Trip ID:
                <input
                  name="tripId"
                  value={form.tripId}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Driver:
                <input
                  name="driver"
                  value={form.driver}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Distance:
                <input
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Fuel Cost:
                <input
                  name="fuel"
                  value={form.fuel}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Misc Expense:
                <input name="misc" value={form.misc} onChange={handleChange} />
              </label>
              <label>
                Status:
                <input
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                />
              </label>
              <div className="expenses-form-btn-row">
                <button type="submit" className="expenses-create-btn">
                  Create
                </button>
                <button
                  type="button"
                  className="expenses-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
