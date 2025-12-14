import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [rentalType, setRentalType] = useState('daily');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')} ₫`;
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Ensure 24-hour format display
    return timeStr; // HTML time inputs already use 24-hour format (HH:MM)
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const [rentalsData, camerasData, customersData] = await Promise.all([
        api.getRentals(params),
        api.getCameras(), // Get all cameras, we'll check availability by date
        api.getCustomers()
      ]);
      setRentals(rentalsData);
      setCameras(camerasData);
      setCustomers(customersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rental = Object.fromEntries(formData.entries());

    try {
      // If adding a new customer, check if they exist first
      if (isNewCustomer && !editingRental) {
        const name = rental.customer_name;
        const phone = rental.customer_phone || '';
        
        // Check if customer with this name and phone already exists
        const existingCustomer = customers.find(c => 
          c.name.toLowerCase() === name.toLowerCase() && 
          (phone === '' || c.phone === phone || (!c.phone && !phone))
        );
        
        if (existingCustomer) {
          // Use existing customer
          rental.customer_id = existingCustomer.id;
        } else {
          // Create new customer
          const customerData = {
            name: rental.customer_name,
            phone: rental.customer_phone || '',
            email: rental.customer_email || '',
            address: rental.customer_address || ''
          };
          const newCustomer = await api.createCustomer(customerData);
          rental.customer_id = newCustomer.id;
        }
        
        // Remove customer fields from rental object
        delete rental.customer_name;
        delete rental.customer_phone;
        delete rental.customer_email;
        delete rental.customer_address;
      }

      if (editingRental) {
        await api.updateRental(editingRental.id, rental);
      } else {
        await api.createRental(rental);
      }
      setShowModal(false);
      setEditingRental(null);
      setIsNewCustomer(false);
      loadData();
    } catch (err) {
      const errorMsg = err.message;
      if (errorMsg.includes('already rented during this period')) {
        alert('This camera is already rented during the selected dates. Please choose different dates or another camera.');
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this rental as completed?')) return;

    try {
      const returnDate = new Date().toISOString().split('T')[0];
      await api.returnRental(id, returnDate);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rental?')) return;

    try {
      await api.deleteRental(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (rental = null) => {
    setEditingRental(rental);
    if (rental) {
      setRentalType(rental.rental_type || 'daily');
    } else {
      setRentalType('daily');
    }
    setShowModal(true);
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const isOverdue = (rental) => {
    if (rental.status !== 'active') return false;
    
    const now = new Date();
    const endDate = new Date(rental.end_date || rental.start_date);
    
    // For hourly rentals, check both date and time
    if (rental.rental_type === 'hourly' && rental.end_time) {
      const [hours, minutes] = rental.end_time.split(':').map(Number);
      endDate.setHours(hours, minutes, 0, 0);
      return endDate < now;
    }
    
    // For daily rentals, just check the date
    endDate.setHours(23, 59, 59, 999); // End of the day
    return endDate < now;
  };

  if (loading) return <div className="loading">Loading rentals</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Rentals</h2>
        <p>Manage camera rentals</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Rentals</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            + New Rental
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Camera</th>
                <th>Customer</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Deposit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} style={{ backgroundColor: isOverdue(rental) ? '#fff3cd' : 'transparent' }}>
                  <td>#{rental.id}</td>
                  <td>
                    <strong>{rental.camera_name}</strong>
                    <br />
                    <small>{rental.brand} {rental.model}</small>
                  </td>
                  <td>
                    {rental.customer_name}
                    <br />
                    <small>{rental.customer_phone}</small>
                  </td>
                  <td>
                    {formatDate(rental.start_date)}
                    {rental.start_time && <><br/><small>{formatTime(rental.start_time)}</small></>}
                  </td>
                  <td>
                    {formatDate(rental.end_date || rental.start_date)}
                    {rental.end_time && <><br/><small>{formatTime(rental.end_time)}</small></>}
                  </td>
                  <td>
                    {rental.rental_type === 'hourly' ? (
                      <span>{Math.ceil(((new Date(`2000-01-01 ${rental.end_time}`) - new Date(`2000-01-01 ${rental.start_time}`)) / (1000 * 60 * 60)))} hrs</span>
                    ) : (
                      <span>{calculateDays(rental.start_date, rental.end_date)} days</span>
                    )}
                  </td>
                  <td>{formatCurrency(rental.total_amount)}</td>
                  <td>{formatCurrency(rental.deposit)}</td>
                  <td>
                    <span className={`badge badge-${
                      isOverdue(rental) ? 'danger' :
                      rental.status === 'active' ? 'warning' :
                      rental.status === 'completed' ? 'success' : 'secondary'
                    }`}>
                      {isOverdue(rental) ? 'Overdue' : rental.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {rental.status === 'active' && (
                        <button
                          onClick={() => handleReturn(rental.id)}
                          className="btn btn-success btn-small"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => openModal(rental)}
                        className="btn btn-secondary btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rental.id)}
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

        {rentals.length === 0 && (
          <div className="empty-state">
            <h3>No rentals found</h3>
            <p>Create your first rental to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRental ? 'Edit Rental' : 'New Rental'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form key={editingRental?.id || 'new'} onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rental Type *</label>
                <select 
                  value={rentalType} 
                  onChange={(e) => setRentalType(e.target.value)}
                  disabled={!!editingRental}
                  required
                >
                  <option value="daily">Daily Rental</option>
                  <option value="hourly">Hourly Rental</option>
                </select>
                {editingRental && <small>Cannot change rental type when editing</small>}
              </div>

              {!editingRental && (
                <>
                  <div className="form-group">
                    <label>Camera *</label>
                    <select 
                      name="camera_id" 
                      required
                      onChange={(e) => {
                        const camera = cameras.find(c => c.id === parseInt(e.target.value));
                        setSelectedCamera(camera);
                      }}
                    >
                      <option value="">Select a camera</option>
                      {cameras.map((camera) => {
                        const rate = rentalType === 'hourly' ? camera.hourly_rate : camera.daily_rate;
                        const rateLabel = rentalType === 'hourly' ? '/hr' : '/day';
                        return (
                          <option key={camera.id} value={camera.id}>
                            {camera.name} - {camera.brand} {camera.model} 
                            {rate ? ` ($${rate}${rateLabel})` : ' (Rate not set)'}
                            {camera.status === 'rented' ? ' - Currently Rented' : ''}
                            {camera.status === 'maintenance' ? ' - In Maintenance' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <small>You can select any camera. System will check for {rentalType === 'hourly' ? 'time' : 'date'} conflicts.</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={isNewCustomer}
                        onChange={(e) => setIsNewCustomer(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                      />
                      Add New Customer
                    </label>
                  </div>

                  {isNewCustomer ? (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Customer Name *</label>
                          <input
                            type="text"
                            name="customer_name"
                            required
                            placeholder="Enter customer name"
                          />
                        </div>

                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="tel"
                            name="customer_phone"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Email (Optional)</label>
                          <input
                            type="email"
                            name="customer_email"
                            placeholder="Enter email"
                          />
                        </div>

                        <div className="form-group">
                          <label>Address (Optional)</label>
                          <input
                            type="text"
                            name="customer_address"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Customer *</label>
                      <select name="customer_id" required>
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}{customer.phone ? ` - ${customer.phone}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <input type="hidden" name="rental_type" value={rentalType} />

              {rentalType === 'daily' ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="start_date"
                        defaultValue={editingRental?.start_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingRental?.end_date}
                        min={startDate}
                        required
                      />
                      <small>Must be after or equal to start date</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Daily Rate *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="daily_rate"
                        defaultValue={editingRental?.daily_rate || selectedCamera?.daily_rate}
                        required
                        placeholder="0.00"
                      />
                      <small>Rate per day</small>
                    </div>

                    <div className="form-group">
                      <label>Custom Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        name="custom_total_amount"
                        defaultValue={editingRental?.total_amount}
                        placeholder="Leave blank for auto-calculation"
                      />
                      <small>Override calculated amount</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Deposit</label>
                      <input
                        type="number"
                        step="0.01"
                        name="deposit"
                        defaultValue={editingRental?.deposit || 0}
                        placeholder="0.00"
                      />
                      <small>Security deposit</small>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Rental Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={editingRental?.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        name="start_time"
                        defaultValue={editingRental?.start_time || '09:00'}
                        onChange={(e) => setStartTime(e.target.value)}
                        step="60"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        name="end_time"
                        defaultValue={editingRental?.end_time || '17:00'}
                        min={startTime}
                        step="60"
                        required
                      />
                      <small>Must be after start time</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hourly Rate *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="hourly_rate"
                        defaultValue={editingRental?.hourly_rate || selectedCamera?.hourly_rate}
                        required
                        placeholder="0.00"
                      />
                      <small>Rate per hour</small>
                    </div>

                    <div className="form-group">
                      <label>Custom Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        name="custom_total_amount"
                        defaultValue={editingRental?.total_amount}
                        placeholder="Leave blank for auto-calculation"
                      />
                      <small>Override calculated amount</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Deposit</label>
                      <input
                        type="number"
                        step="0.01"
                        name="deposit"
                        defaultValue={editingRental?.deposit || 0}
                        placeholder="0.00"
                      />
                      <small>Security deposit</small>
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                {rentalType === 'daily' && (
                  <div style={{display: 'none'}}>
                    <input type="hidden" name="hourly_rate" value="0" />
                  </div>
                )}
                {rentalType === 'hourly' && (
                  <div style={{display: 'none'}}>
                    <input type="hidden" name="daily_rate" value="0" />
                  </div>
                )}
              </div>

              {editingRental && (
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={editingRental?.status}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingRental?.notes}
                  placeholder="Additional rental notes..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRental ? 'Update' : 'Create Rental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rentals;
