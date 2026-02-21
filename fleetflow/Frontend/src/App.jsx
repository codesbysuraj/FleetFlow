import React, { useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const App = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="app-container">
      {!showDashboard ? (
        <>
          <h2>Welcome to FleetFlow</h2>
          <button
            className="maintainance-btn"
            onClick={() => setShowDashboard(true)}
          >
            Go to Admin Dashboard
          </button>
        </>
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default App;
