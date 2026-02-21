import React, { useState, useEffect } from "react";
import "./Analytics.css";

const API_BASE_URL = "http://127.0.0.1:5000";

// Simple SVG Pie Chart component
function PieChart({ data, size = 220 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="pie-empty">
        <svg width={size} height={size} viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="100" fill="#e8eef8" />
          <text x="110" y="115" textAnchor="middle" fill="#999" fontSize="14">No data</text>
        </svg>
      </div>
    );
  }

  let cumulative = 0;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 220 220">
      {slices.map((slice, i) => (
        <path
          key={i}
          d={describeArc(110, 110, 100, slice.startAngle, slice.endAngle)}
          fill={slice.color}
          stroke="#fff"
          strokeWidth="2"
        >
          <title>{slice.label}: {slice.value} ({((slice.value / total) * 100).toFixed(1)}%)</title>
        </path>
      ))}
      {/* Center hole for donut effect */}
      <circle cx="110" cy="110" r="50" fill="#f9fbff" />
      <text x="110" y="108" textAnchor="middle" fill="#203F91" fontSize="20" fontWeight="700">{total}</text>
      <text x="110" y="126" textAnchor="middle" fill="#888" fontSize="11">Total</text>
    </svg>
  );
}

function Legend({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="pie-legend">
      {data.map((d, i) => (
        <div key={i} className="legend-item">
          <span className="legend-color" style={{ background: d.color }} />
          <span className="legend-label">{d.label}</span>
          <span className="legend-value">{d.value}</span>
          <span className="legend-pct">{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
        </div>
      ))}
    </div>
  );
}

function Analytics({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch multiple endpoints in parallel
      const [tripsRes, vehiclesRes, driversRes, maintenanceRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/trips/`, { headers }),
        fetch(`${API_BASE_URL}/vehicles/`, { headers }),
        fetch(`${API_BASE_URL}/drivers/available`, { headers }),
        fetch(`${API_BASE_URL}/maintenance/`, { headers }),
      ]);

      const trips = tripsRes.status === "fulfilled" && tripsRes.value.ok ? await tripsRes.value.json() : [];
      const vehicles = vehiclesRes.status === "fulfilled" && vehiclesRes.value.ok ? await vehiclesRes.value.json() : [];
      const drivers = driversRes.status === "fulfilled" && driversRes.value.ok ? await driversRes.value.json() : [];
      const maintenance = maintenanceRes.status === "fulfilled" && maintenanceRes.value.ok ? await maintenanceRes.value.json() : [];

      // Process trip statuses
      const tripStatuses = { draft: 0, dispatched: 0, completed: 0, cancelled: 0 };
      (Array.isArray(trips) ? trips : []).forEach((t) => {
        if (tripStatuses[t.status] !== undefined) tripStatuses[t.status]++;
      });

      // Process vehicle statuses
      const vehicleStatuses = { active: 0, idle: 0, in_shop: 0 };
      (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
        const s = (v.status || "idle").toLowerCase();
        if (s === "active" || s === "on_trip") vehicleStatuses.active++;
        else if (s === "in_shop" || s === "maintenance") vehicleStatuses.in_shop++;
        else vehicleStatuses.idle++;
      });

      // Process maintenance costs
      let totalMaintCost = 0;
      let maintenanceByMonth = {};
      (Array.isArray(maintenance) ? maintenance : []).forEach((m) => {
        totalMaintCost += parseFloat(m.cost) || 0;
        const month = (m.service_date || "").substring(0, 7);
        if (month) {
          maintenanceByMonth[month] = (maintenanceByMonth[month] || 0) + (parseFloat(m.cost) || 0);
        }
      });

      // Fuel cost from trips
      let totalFuelCost = 0;
      (Array.isArray(trips) ? trips : []).forEach((t) => {
        totalFuelCost += parseFloat(t.estimated_fuel_cost) || 0;
      });

      setStats({
        tripStatuses,
        vehicleStatuses,
        totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
        totalDrivers: Array.isArray(drivers) ? drivers.length : 0,
        totalTrips: Array.isArray(trips) ? trips.length : 0,
        totalMaintenance: Array.isArray(maintenance) ? maintenance.length : 0,
        totalMaintCost,
        totalFuelCost,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setStats({
        tripStatuses: { draft: 0, dispatched: 0, completed: 0, cancelled: 0 },
        vehicleStatuses: { active: 0, idle: 0, in_shop: 0 },
        totalVehicles: 0, totalDrivers: 0, totalTrips: 0, totalMaintenance: 0,
        totalMaintCost: 0, totalFuelCost: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  const tripPieData = [
    { label: "Draft", value: stats.tripStatuses.draft, color: "#90a4ae" },
    { label: "Dispatched", value: stats.tripStatuses.dispatched, color: "#42a5f5" },
    { label: "Completed", value: stats.tripStatuses.completed, color: "#66bb6a" },
    { label: "Cancelled", value: stats.tripStatuses.cancelled, color: "#ef5350" },
  ];

  const vehiclePieData = [
    { label: "Active / On Trip", value: stats.vehicleStatuses.active, color: "#66bb6a" },
    { label: "Idle", value: stats.vehicleStatuses.idle, color: "#42a5f5" },
    { label: "In Shop", value: stats.vehicleStatuses.in_shop, color: "#ffa726" },
  ];

  const costPieData = [
    { label: "Fuel Costs", value: Math.round(stats.totalFuelCost), color: "#42a5f5" },
    { label: "Maintenance Costs", value: Math.round(stats.totalMaintCost), color: "#ffa726" },
  ];

  const fleetOverviewData = [
    { label: "Vehicles", value: stats.totalVehicles, color: "#203F91" },
    { label: "Drivers", value: stats.totalDrivers, color: "#3A7DEE" },
    { label: "Trips", value: stats.totalTrips, color: "#66bb6a" },
    { label: "Maintenance Logs", value: stats.totalMaintenance, color: "#ffa726" },
  ];

  return (
    <div className="analytics-page">
      {/* KPI Cards */}
      <div className="analytics-kpi-row">
        <div className="kpi-card">
          <div className="kpi-value">{stats.totalVehicles}</div>
          <div className="kpi-label">Total Vehicles</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{stats.totalDrivers}</div>
          <div className="kpi-label">Available Drivers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{stats.totalTrips}</div>
          <div className="kpi-label">Total Trips</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{stats.totalMaintenance}</div>
          <div className="kpi-label">Service Logs</div>
        </div>
      </div>

      {/* Pie Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Trip Status */}
        <div className="chart-card">
          <h3 className="chart-title">Trip Status Breakdown</h3>
          <div className="chart-body">
            <PieChart data={tripPieData} />
            <Legend data={tripPieData} />
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="chart-card">
          <h3 className="chart-title">Vehicle Status</h3>
          <div className="chart-body">
            <PieChart data={vehiclePieData} />
            <Legend data={vehiclePieData} />
          </div>
        </div>

        {/* Cost Distribution */}
        <div className="chart-card">
          <h3 className="chart-title">Cost Distribution</h3>
          <div className="chart-body">
            <PieChart data={costPieData} />
            <Legend data={costPieData} />
          </div>
        </div>

        {/* Fleet Overview */}
        <div className="chart-card">
          <h3 className="chart-title">Fleet Overview</h3>
          <div className="chart-body">
            <PieChart data={fleetOverviewData} />
            <Legend data={fleetOverviewData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
