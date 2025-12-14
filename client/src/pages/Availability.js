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
      setError('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (rentalType === 'hourly' && (!searchParams.start_time || !searchParams.end_time)) {
      setError('Vui lòng chọn giờ bắt đầu và kết thúc cho thuê theo giờ');
      return;
    }

    setLoading(true);
    setError('');
    setAvailableCameras(null);

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Hết thời gian chờ. Vui lòng thử lại.');
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
      setError(err.message || 'Không thể kiểm tra. Vui lòng thử lại.');
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
        <h2>📅 Kiểm Tra Tình Trạng</h2>
        <p>Tìm camera có sẵn cho khoảng thời gian thuê</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Thông Tin Tìm Kiếm</h3>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Loại Thuê</label>
            <select 
              value={rentalType} 
              onChange={(e) => setRentalType(e.target.value)}
              required
            >
              <option value="daily">Thuê Theo Ngày</option>
              <option value="hourly">Thuê Theo Giờ</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày Bắt Đầu *</label>
              <input
                type="date"
                name="start_date"
                value={searchParams.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày Kết Thúc *</label>
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
                <label>Giờ Bắt Đầu *</label>
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
                <label>Giờ Kết Thúc *</label>
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
              {loading ? 'Đang tìm...' : '🔍 Kiểm Tra'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Xóa
            </button>
          </div>
        </form>
      </div>

      {availableCameras !== null && (
        <div className="card">
          <div className="card-header">
            <h3>
              {availableCameras.length > 0 
                ? `✅ ${availableCameras.length} Camera Có Sẵn`
                : '❌ Không Có Camera Nào'
              }
            </h3>
          </div>

          {availableCameras.length > 0 ? (
            <div className="stats-grid">
              {availableCameras.map((camera) => (
                <div key={camera.id} className="stat-card">
                  <h4>{camera.name}</h4>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p><strong>Hãng:</strong> {camera.brand} {camera.model}</p>
                    <p><strong>Loại:</strong> {camera.category}</p>
                    <p><strong>Tình trạng:</strong> <span className={`badge badge-${camera.status === 'available' ? 'success' : 'secondary'}`}>{camera.status}</span></p>
                    <p><strong>Chất lượng:</strong> {camera.condition}</p>
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                      <p><strong>Giá theo ngày:</strong> {formatCurrency(camera.daily_rate)}</p>
                      {camera.hourly_rate && (
                        <p><strong>Giá theo giờ:</strong> {formatCurrency(camera.hourly_rate)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Không có camera nào trong khoảng thời gian này</h3>
              <p>Thử điều chỉnh ngày tìm kiếm hoặc kiểm tra lịch thuê</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Availability;
