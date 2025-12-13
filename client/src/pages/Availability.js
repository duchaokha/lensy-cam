import React, { useState } from 'react';
import api from '../services/api';

function Availability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCameras, setAvailableCameras] = useState(null);
  const [rentalType, setRentalType] = useState('daily');
  const [searchParams, setSearchParams] = useState({
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '17:00'
  });

  const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')} ₫`;

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!searchParams.start_date || !searchParams.end_date) {
      setError('Please select start and end dates');
      return;
    }

    if (rentalType === 'hourly' && (!searchParams.start_time || !searchParams.end_time)) {
      setError('Please select start and end time for hourly rentals');
      return;
    }

    setLoading(true);
    setError('');
    setAvailableCameras(null);

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timeout. Please try again.');
    }, 10000);

    try {
      const params = {
        start_date: searchParams.start_date,
        end_date: searchParams.end_date,
        rental_type: rentalType
      };

      if (rentalType === 'hourly') {
        params.start_time = searchParams.start_time;
        params.end_time = searchParams.end_time;
      }

      console.log('Checking availability with params:', params);
      const data = await api.checkAvailability(params);
      console.log('Availability response:', data);
      clearTimeout(timeoutId);
      setAvailableCameras(data);
    } catch (err) {
      console.error('Availability check error:', err);
      clearTimeout(timeoutId);
      setError(err.message || 'Failed to check availability. Please try again.');
      setAvailableCameras(null);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setSearchParams({
      start_date: '',
      end_date: '',
      start_time: '09:00',
      end_time: '17:00'
    });
    setAvailableCameras(null);
    setError('');
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>📅 Check Availability</h2>
        <p>Find available cameras for your rental period</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Search Parameters</h3>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Rental Type</label>
            <select 
              value={rentalType} 
              onChange={(e) => setRentalType(e.target.value)}
              required
            >
              <option value="daily">Daily Rental</option>
              <option value="hourly">Hourly Rental</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={searchParams.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="end_date"
                value={searchParams.end_date}
                onChange={handleInputChange}
                min={searchParams.start_date}
                required
              />
            </div>
          </div>

          {rentalType === 'hourly' && (
            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  name="start_time"
                  value={searchParams.start_time}
                  onChange={handleInputChange}
                  step="60"
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  name="end_time"
                  value={searchParams.end_time}
                  onChange={handleInputChange}
                  step="60"
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : '🔍 Check Availability'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {availableCameras !== null && (
        <div className="card">
          <div className="card-header">
            <h3>
              {availableCameras.length > 0 
                ? `✅ ${availableCameras.length} Camera${availableCameras.length !== 1 ? 's' : ''} Available`
                : '❌ No Cameras Available'
              }
            </h3>
          </div>

          {availableCameras.length > 0 ? (
            <div className="stats-grid">
              {availableCameras.map((camera) => (
                <div key={camera.id} className="stat-card">
                  <h4>{camera.name}</h4>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p><strong>Brand:</strong> {camera.brand} {camera.model}</p>
                    <p><strong>Category:</strong> {camera.category}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${camera.status === 'available' ? 'success' : 'secondary'}`}>{camera.status}</span></p>
                    <p><strong>Condition:</strong> {camera.condition}</p>
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                      <p><strong>Daily Rate:</strong> {formatCurrency(camera.daily_rate)}</p>
                      {camera.hourly_rate && (
                        <p><strong>Hourly Rate:</strong> {formatCurrency(camera.hourly_rate)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No cameras available for this time period</h3>
              <p>Try adjusting your search dates or check our rental calendar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Availability;
