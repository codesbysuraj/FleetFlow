import { useState, useEffect } from 'react';
import './Maintenance.css';

function Maintenance({ onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    issue_service: '',
    date: '',
    cost: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Fetch maintenance logs
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/maintenance/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setLogs(await response.json());
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/vehicles/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setVehicles(await response.json());
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/maintenance/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicle_id: parseInt(formData.vehicle_id),
          issue_service: formData.issue_service,
          date: formData.date,
          cost: parseFloat(formData.cost) || 0
        })
      });
      const data = await response.json();
      if (response.ok) {
        setShowForm(false);
        setFormData({ vehicle_id: '', issue_service: '', date: '', cost: '' });
        fetchLogs();
      } else {
        setError(data.error || 'Failed to create log');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-page">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Fleet Flow</h1>
          <button 
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="btn-back"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
      <div className="subheader">
        <h2>5. Maintenance & Service Logs</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="content-container">
        <div className="logs-section">
          <div className="section-header">
            <h3>Service Logs</h3>
            <button className="btn-new-service" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Hide Form' : 'Create New Service'}
            </button>
          </div>
          <table className="logs-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Vehicle</th>
                <th>Issue/Service</th>
                <th>Date</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="6" className="no-data">No logs found</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.license_plate} {log.model_name}</td>
                    <td>{log.service_type}</td>
                    <td>{log.service_date}</td>
                    <td>{log.cost ? `₹${log.cost}` : '-'}</td>
                    <td>{log.status === 'in_shop' ? <span className="status-inshop">In Shop</span> : log.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showForm && (
          <div className="form-section">
            <h3>New Service</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle Name:</label>
                <select name="vehicle_id" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.license_plate} {v.model_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Issue/Service:</label>
                <input type="text" name="issue_service" value={formData.issue_service} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Cost:</label>
                <input type="number" name="cost" value={formData.cost} onChange={handleInputChange} min="0" step="0.01" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-create" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="info-section">
          <h3>What it's for:</h3>
          <p>This is where you keep your vehicles healthy. It tracks every time a vehicle goes in for a check-up or a repair.</p>
          <h3>How it works:</h3>
          <div className="info-item">
            <h4>Logging a Repair:</h4>
            <p>When a vehicle needs work (like an oil change or new tires), you create a log entry here.</p>
          </div>
          <div className="info-item">
            <h4>The "Auto-Hide" Rule:</h4>
            <p>As soon as you add a vehicle to a maintenance log, the system automatically marks it as "In Shop." While a vehicle is "In Shop," the Dispatcher cannot see it or pick it for a new trip. This prevents you from accidentally sending a broken truck out on a delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
