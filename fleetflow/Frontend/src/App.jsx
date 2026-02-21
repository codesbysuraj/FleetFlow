import React, { useState } from "react";
import "./App.css";
import Login from "./login";
import AdminDashboard from "./AdminDashboard";
import VehicleRegistry from "./VehicleRegistry";
import TripDispatcher from "./TripDispatcher";
import Maintenance from "./Maintenance";
import Expenses from "./Expenses";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'vehicles', 'trips', or 'maintenance'

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {currentView === "dashboard" && (
            <AdminDashboard onNavigate={navigateTo} />
          )}
          {currentView === "vehicles" && (
            <VehicleRegistry onNavigate={navigateTo} />
          )}
          {currentView === "trips" && (
            <TripDispatcher onNavigate={navigateTo} />
          )}
          {currentView === "maintenance" && (
            <Maintenance onNavigate={navigateTo} />
          )}
          {currentView === "expenses" && <Expenses onNavigate={navigateTo} />}
          {currentView === "performance" && (
            <Performance onNavigate={navigateTo} />
          )}
          {currentView === "analytics" && <div>Analytics page coming soon</div>}
        </>
      )}
    </div>
  );
};

export default App;
