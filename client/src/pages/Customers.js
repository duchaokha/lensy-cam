import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  const loadCustomers = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const data = await api.getCustomers(params);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = Object.fromEntries(formData.entries());

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, customer);
      } else {
        await api.createCustomer(customer);
      }
      setShowModal(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (customer = null) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading customers</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage your customer database</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            + Add Customer
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>ID Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.email || 'N/A'}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address || 'N/A'}</td>
                  <td>{customer.id_number || 'N/A'}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => openModal(customer)}
                        className="btn btn-secondary btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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

        {customers.length === 0 && (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Add your first customer to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  defaultValue={editingCustomer?.name}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingCustomer?.email}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingCustomer?.phone}
                    required
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  name="address"
                  defaultValue={editingCustomer?.address}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <div className="form-group">
                <label>ID Number</label>
                <input
                  name="id_number"
                  defaultValue={editingCustomer?.id_number}
                  placeholder="Driver's License or ID"
                />
                <small>For rental verification purposes</small>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingCustomer?.notes}
                  placeholder="Additional notes about the customer..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
