import { useState, useEffect } from 'react';
import './TripDispatcher.css';

function TripDispatcher({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    origin: '',
    destination: '',
    estimated_fuel_cost: ''
  });

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Fetch trips
  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/trips/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/vehicles/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  // Fetch available drivers
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/drivers/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate cargo weight against vehicle capacity
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
    if (selectedVehicle && parseInt(formData.cargo_weight) > selectedVehicle.max_capacity_kg) {
      setError(`Too heavy! Cargo weight (${formData.cargo_weight}kg) exceeds vehicle capacity (${selectedVehicle.max_capacity_kg}kg)`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/trips/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicle_id: parseInt(formData.vehicle_id),
          driver_id: parseInt(formData.driver_id),
          cargo_weight: parseInt(formData.cargo_weight),
          origin: formData.origin,
          destination: formData.destination,
          estimated_fuel_cost: parseFloat(formData.estimated_fuel_cost) || 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Trip dispatched successfully!');
        setFormData({
          vehicle_id: '',
          driver_id: '',
          cargo_weight: '',
          origin: '',
          destination: '',
          estimated_fuel_cost: ''
        });
        setShowForm(false);
        fetchTrips();
        fetchDrivers(); // Refresh driver list as one is now on trip
      } else {
        setError(data.error || 'Failed to create trip');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (tripId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTrips();
        fetchDrivers(); // Refresh driver list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update trip');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'draft': 'status-draft',
      'dispatched': 'status-dispatched',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'dispatched': 'On Way',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="trip-dispatcher">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Fleet Flow</h1>
          <button 
            onClick={() => onNavigate && onNavigate('dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="subheader">
        <h2>4. Trip Dispatcher & Management</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-container">
        <div className="trips-section">
          <div className="section-header">
            <h3>Active Trips</h3>
            <button 
              className="btn-new-trip"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Hide Form' : 'New Trip Form'}
            </button>
          </div>

          <table className="trips-table">
            <thead>
              <tr>
                <th>Trip Fleet Type</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No trips found</td>
                </tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id}>
                    <td>{trip.vehicle_type}</td>
                    <td>{trip.origin}</td>
                    <td>{trip.destination}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(trip.status)}`}>
                        {getStatusDisplay(trip.status)}
                      </span>
                    </td>
                    <td>
                      {trip.status === 'dispatched' && (
                        <button 
                          className="btn-action btn-complete"
                          onClick={() => updateTripStatus(trip.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="form-section">
            <h3>New Trip Form</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Vehicle:</label>
                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_type} - {vehicle.model_name} ({vehicle.license_plate}) - Max: {vehicle.max_capacity_kg}kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cargo Weight (kg):</label>
                <input
                  type="number"
                  name="cargo_weight"
                  value={formData.cargo_weight}
                  onChange={handleInputChange}
                  placeholder="Enter cargo weight"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Driver:</label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.license_category}
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <small className="form-hint">No available drivers. Make sure drivers are marked as 'on_duty'.</small>
                )}
              </div>

              <div className="form-group">
                <label>Origin Address:</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="Enter origin address"
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination:</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Enter destination"
                  required
                />
              </div>

              <div className="form-group">
                <label>Estimated Fuel Cost:</label>
                <input
                  type="number"
                  name="estimated_fuel_cost"
                  value={formData.estimated_fuel_cost}
                  onChange={handleInputChange}
                  placeholder="Enter estimated fuel cost"
                  step="0.01"
                  min="0"
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Dispatching...' : 'Confirm & Dispatch Trip'}
              </button>
            </form>
          </div>
        )}

        <div className="info-section">
          <h3>What it's for:</h3>
          <p>
            This is the "brain" of the operation. It's where you actually set up deliveries 
            and move goods from one place to another.
          </p>

          <h3>How it works:</h3>
          <div className="info-item">
            <h4>Booking a Trip:</h4>
            <p>You pick a vehicle and a driver that are currently free and ready to go.</p>
            <p>
              You enter how much the cargo weighs. If you try to put a 2,000kg load into a 
              1,000kg van, the system will block you and say "Too heavy!"
            </p>
          </div>

          <div className="info-item">
            <h4>Trip Progress:</h4>
            <p>You can track the status of the job as it moves through four stages:</p>
            <ul>
              <li><strong>Draft:</strong> Trip is being planned</li>
              <li><strong>Dispatched (On Way):</strong> Trip is active and in progress</li>
              <li><strong>Completed:</strong> Trip has been finished</li>
              <li><strong>Cancelled:</strong> Trip was cancelled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripDispatcher;
