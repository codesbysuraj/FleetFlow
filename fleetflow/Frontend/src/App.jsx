import React, { useState } from "react";
import "./App.css";
import Login from "./login";
import Layout from "./Layout";
import AdminDashboard from "./AdminDashboard";
import VehicleRegistry from "./VehicleRegistry";
import TripDispatcher from "./TripDispatcher";
import Maintenance from "./Maintenance";
import Expenses from "./Expenses";
import Performance from "./Performance";
import AddUser from "./AddUser";
import Analytics from "./Analytics";

/*
  RBAC View Access:
  - manager/admin: ALL views
  - dispatcher: dashboard, trips
  - safety: dashboard, performance (drivers)
  - analyst: dashboard, expenses, analytics
*/

const viewTitles = {
  dashboard: "Dashboard",
  vehicles: "Vehicle Registry",
  trips: "Trip Dispatcher",
  maintenance: "Maintenance",
  expenses: "Trip & Expense",
  performance: "Performance",
  analytics: "Analytics",
  users: "Manage Users",
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentView("dashboard");
  };

  const navigateTo = (view) => {
    if (view === "logout") {
      handleLogout();
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Layout onNavigate={navigateTo} userRole={userRole} pageTitle={viewTitles[currentView]}>
          {currentView === "dashboard" && (
            <AdminDashboard onNavigate={navigateTo} userRole={userRole} />
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
          {currentView === "users" && <AddUser onNavigate={navigateTo} />}
          {currentView === "analytics" && <Analytics onNavigate={navigateTo} />}
        </Layout>
      )}
    </div>
  );
};

export default App;
