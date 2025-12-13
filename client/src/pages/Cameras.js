import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);

  const categories = ['DSLR', 'Mirrorless', 'Cinema', 'Action', 'Drone', 'Lens', 'Accessories'];
  const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')} ₫`;

  useEffect(() => {
    loadCameras();
  }, [searchTerm, statusFilter, categoryFilter]);

  const loadCameras = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await api.getCameras(params);
      setCameras(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const camera = Object.fromEntries(formData.entries());

    try {
      if (editingCamera) {
        await api.updateCamera(editingCamera.id, camera);
      } else {
        await api.createCamera(camera);
      }
      setShowModal(false);
      setEditingCamera(null);
      loadCameras();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) return;

    try {
      await api.deleteCamera(id);
      loadCameras();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (camera = null) => {
    setEditingCamera(camera);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading cameras</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Camera Inventory</h2>
        <p>Manage your camera equipment</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Filters</h3>
          <button onClick={() => openModal()} className="btn btn-primary">
            + Add Camera
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search cameras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand/Model</th>
                <th>Category</th>
                <th>Serial #</th>
                <th>Daily Rate</th>
                <th>Hourly Rate</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((camera) => (
                <tr key={camera.id}>
                  <td><strong>{camera.name}</strong></td>
                  <td>{camera.brand} {camera.model}</td>
                  <td>{camera.category}</td>
                  <td>{camera.serial_number || 'N/A'}</td>
                  <td>{formatCurrency(camera.daily_rate)}</td>
                  <td>{camera.hourly_rate ? formatCurrency(camera.hourly_rate) : 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${
                      camera.status === 'available' ? 'success' :
                      camera.status === 'rented' ? 'warning' : 'secondary'
                    }`}>
                      {camera.status}
                    </span>
                  </td>
                  <td>{camera.condition}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => openModal(camera)}
                        className="btn btn-secondary btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(camera.id)}
                        className="btn btn-danger btn-small"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cameras.length === 0 && (
          <div className="empty-state">
            <h3>No cameras found</h3>
            <p>Add your first camera to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCamera ? 'Edit Camera' : 'Add Camera'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Camera Name *</label>
                <input
                  name="name"
                  defaultValue={editingCamera?.name}
                  required
                  placeholder="e.g., Canon EOS R5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    name="brand"
                    defaultValue={editingCamera?.brand}
                    required
                    placeholder="e.g., Canon"
                  />
                </div>

                <div className="form-group">
                  <label>Model *</label>
                  <input
                    name="model"
                    defaultValue={editingCamera?.model}
                    required
                    placeholder="e.g., EOS R5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" defaultValue={editingCamera?.category} required>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    name="serial_number"
                    defaultValue={editingCamera?.serial_number}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    name="purchase_date"
                    defaultValue={editingCamera?.purchase_date}
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price"
                    defaultValue={editingCamera?.purchase_price}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Daily Rental Rate *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    defaultValue={editingCamera?.daily_rate}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Hourly Rental Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    defaultValue={editingCamera?.hourly_rate}
                    placeholder="0.00"
                  />
                  <small>For hourly rentals</small>
                </div>
              </div>

              <div className="form-group">
                <label>Condition *</label>
                <select name="condition" defaultValue={editingCamera?.condition || 'excellent'} required>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {editingCamera && (
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editingCamera?.status}>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  defaultValue={editingCamera?.description}
                  placeholder="Additional details about the camera..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCamera ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cameras;
