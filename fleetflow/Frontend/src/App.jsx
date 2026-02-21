import React, { useState } from "react";
import "./App.css";
import Login from "./login";
import AdminDashboard from "./AdminDashboard";
import VehicleRegistry from "./VehicleRegistry";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'vehicles'

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
          {currentView === 'dashboard' && <AdminDashboard onNavigate={navigateTo} />}
          {currentView === 'vehicles' && <VehicleRegistry onNavigate={navigateTo} />}
        </>
      )}
    </div>
  );
};

export default App;
