import { useState, useEffect } from 'react';
import './AddUser.css';

const API_URL = 'http://127.0.0.1:5000';

function AddUser({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const token = localStorage.getItem('access_token');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`User "${data.name}" (${data.role}) created successfully!`);
        setFormData({ name: '', email: '', password: '', role: '' });
        setShowForm(false);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess(`User "${userName}" deleted.`);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'manager': return 'role-badge role-manager';
      case 'dispatcher': return 'role-badge role-dispatcher';
      case 'safety': return 'role-badge role-safety';
      case 'analyst': return 'role-badge role-analyst';
      default: return 'role-badge';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'manager': return 'Fleet Manager';
      case 'dispatcher': return 'Dispatcher';
      case 'safety': return 'Safety Officer';
      case 'analyst': return 'Financial Analyst';
      default: return role;
    }
  };

  return (
    <div className="adduser-bg">
      <div className="adduser-container">
        {error && <div className="msg msg-error">{error}</div>}
        {success && <div className="msg msg-success">{success}</div>}

        <div className="adduser-header-row">
          <h2>System Users</h2>
          <button className="add-btn" onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}>
            + Add User
          </button>
        </div>

        {/* Add User Form Popup */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-card">
              <h3>Add New User</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. john@fleetflow.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set a password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Role...</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="safety">Safety Officer</option>
                    <option value="analyst">Financial Analyst</option>
                    <option value="manager">Fleet Manager</option>
                  </select>
                </div>

                {/* Role description */}
                {formData.role && (
                  <div className="role-description">
                    {formData.role === 'dispatcher' && (
                      <p><strong>Dispatcher:</strong> Create trips, assign drivers & vehicles, validate cargo.</p>
                    )}
                    {formData.role === 'safety' && (
                      <p><strong>Safety Officer:</strong> Monitor driver compliance, update safety scores, suspend drivers.</p>
                    )}
                    {formData.role === 'analyst' && (
                      <p><strong>Financial Analyst:</strong> View fuel logs, maintenance costs, calculate ROI, export reports.</p>
                    )}
                    {formData.role === 'manager' && (
                      <p><strong>Fleet Manager:</strong> Full system access — vehicles, trips, maintenance, analytics, users.</p>
                    )}
                  </div>
                )}

                <div className="form-btn-row">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                    No users yet. Click "+ Add User" to create one.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
