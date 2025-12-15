import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cameraFilter, setCameraFilter] = useState([]);
  const [showCameraFilter, setShowCameraFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [rentalType, setRentalType] = useState('daily');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
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
  }, [statusFilter, cameraFilter]);

  const loadData = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const [rentalsData, camerasData, customersData] = await Promise.all([
        api.getRentals(params),
        api.getCameras(), // Get all cameras, we'll check availability by date
        api.getCustomers()
      ]);
      
      // Sort rentals by start_date (oldest first)
      let sortedRentals = rentalsData.sort((a, b) => {
        return new Date(a.start_date) - new Date(b.start_date);
      });
      
      // Filter by selected cameras if any
      if (cameraFilter.length > 0) {
        sortedRentals = sortedRentals.filter(rental => 
          cameraFilter.includes(rental.camera_id.toString())
        );
      }
      
      setRentals(sortedRentals);
      setCameras(camerasData);
      setCustomers(customersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraFilterChange = (cameraId) => {
    setCameraFilter(prev => {
      if (prev.includes(cameraId)) {
        return prev.filter(id => id !== cameraId);
      } else {
        return [...prev, cameraId];
      }
    });
  };

  const getRowColor = (rental, index) => {
    if (isOverdue(rental)) return '#fff3cd';
    
    // Build a color map based on unique dates
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#fce4ec'];
    const dateColorMap = {};
    let colorIndex = 0;
    
    rentals.forEach((r) => {
      if (!dateColorMap[r.start_date]) {
        dateColorMap[r.start_date] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });
    
    return dateColorMap[rental.start_date] || '#ffffff';
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
      setRentalType('daily');
    } else {
      setRentalType('daily');
    }
    setShowModal(true);
  };

  const calculateDays = (startDate, endDate, startTime, endTime) => {
    // When times are provided, calculate based on actual duration
    if (startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const totalHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      
      // If less than 24 hours, show only hours
      if (totalHours < 24) {
        return `${totalHours} giờ`;
      }
      
      // Show as days and hours
      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;
      
      if (remainingHours === 0) {
        return `${days} ngày`;
      }
      return `${days} ngày ${remainingHours} giờ`;
    }
    
    // No times provided: use calendar days
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ngày`;
  };

  const isOverdue = (rental) => {
    if (rental.status !== 'active') return false;
    
    const now = new Date();
    const endDate = new Date(rental.end_date || rental.start_date);
    
    // If end time is specified, check both date and time
    if (rental.end_time) {
      const [hours, minutes] = rental.end_time.split(':').map(Number);
      endDate.setHours(hours, minutes, 0, 0);
      return endDate < now;
    }
    
    // Otherwise, check end of the day
    endDate.setHours(23, 59, 59, 999);
    return endDate < now;
  };

  if (loading) return <div className="loading">Đang tải đơn thuê</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Đơn Cho Thuê</h2>
        <p>Quản lý đơn thuê máy ảnh</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả Đơn thuê</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setShowCameraFilter(!showCameraFilter)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Lọc máy ảnh {cameraFilter.length > 0 && `(${cameraFilter.length})`}
                <span style={{ fontSize: '12px' }}>{showCameraFilter ? '▲' : '▼'}</span>
              </button>
              
              {showCameraFilter && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '5px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '5px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  minWidth: '200px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '5px', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    Chọn máy ảnh:
                  </div>
                  {cameras.map(camera => (
                    <label key={camera.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px',
                      borderRadius: '3px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={cameraFilter.includes(camera.id.toString())}
                        onChange={() => handleCameraFilterChange(camera.id.toString())}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{camera.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {cameraFilter.length > 0 && (
              <button 
                onClick={() => setCameraFilter([])} 
                className="btn btn-secondary btn-small"
                style={{ marginLeft: '10px' }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            + Thêm Đơn Thuê
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Máy ảnh</th>
                <th>Khách hàng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Thời gian</th>
                <th>Số tiền</th>
                <th>Tiền cọc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental, index) => (
                <tr key={rental.id} style={{ backgroundColor: getRowColor(rental, index) }}>
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
                    {rental.start_time && <><br/><span style={{ fontSize: '14px', fontWeight: '500' }}>{formatTime(rental.start_time)}</span></>}
                  </td>
                  <td>
                    {formatDate(rental.end_date || rental.start_date)}
                    {rental.end_time && <><br/><span style={{ fontSize: '14px', fontWeight: '500' }}>{formatTime(rental.end_time)}</span></>}
                  </td>
                  <td>
                    {calculateDays(rental.start_date, rental.end_date, rental.start_time, rental.end_time)}
                  </td>
                  <td>{formatCurrency(rental.total_amount)}</td>
                  <td>{formatCurrency(rental.deposit)}</td>
                  <td>
                    <span className={`badge badge-${
                      isOverdue(rental) ? 'danger' :
                      rental.status === 'active' ? 'warning' :
                      rental.status === 'completed' ? 'success' : 'secondary'
                    }`}>
                      {isOverdue(rental) ? 'Quá hạn' : rental.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {rental.status === 'active' && (
                        <button
                          onClick={() => handleReturn(rental.id)}
                          className="btn btn-success btn-small"
                        >
                          Hoàn thành
                        </button>
                      )}
                      <button
                        onClick={() => openModal(rental)}
                        className="btn btn-secondary btn-small"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(rental.id)}
                        className="btn btn-danger btn-small"
                      >
                        Xóa
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
            <h3>Không tìm thấy đơn thuê</h3>
            <p>Tạo đơn thuê đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRental ? 'Sửa Đơn Thuê' : 'Thêm Đơn Thuê'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form key={editingRental?.id || 'new'} onSubmit={handleSubmit}>
              {!editingRental && (
                <>
                  <div className="form-group">
                    <label>Máy ảnh *</label>
                    <select 
                      name="camera_id" 
                      required
                      onChange={(e) => {
                        const camera = cameras.find(c => c.id === parseInt(e.target.value));
                        setSelectedCamera(camera);
                      }}
                    >
                      <option value="">Chọn máy ảnh</option>
                      {cameras.map((camera) => {
                        const rate = camera.daily_rate;
                        const rateLabel = '/ngày';
                        return (
                          <option key={camera.id} value={camera.id}>
                            {camera.name} - {camera.brand} {camera.model} 
                            {rate ? ` ($${rate}${rateLabel})` : ' (Chưa đặt giá)'}
                            {camera.status === 'maintenance' ? ' - Bảo trì' : ''}
                            {camera.status === 'maintenance' ? ' - Đang bảo trì' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <small>Bạn có thể chọn bất kỳ máy ảnh nào. Hệ thống sẽ kiểm tra xung đột ngày và thời gian.</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={isNewCustomer}
                        onChange={(e) => setIsNewCustomer(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                      />
                      Thêm khách hàng mới
                    </label>
                  </div>

                  {isNewCustomer ? (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Tên khách hàng *</label>
                          <input
                            type="text"
                            name="customer_name"
                            required
                            placeholder="Nhập tên khách hàng"
                          />
                        </div>

                        <div className="form-group">
                          <label>Số điện thoại</label>
                          <input
                            type="tel"
                            name="customer_phone"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Email (Tùy chọn)</label>
                          <input
                            type="email"
                            name="customer_email"
                            placeholder="Nhập email"
                          />
                        </div>

                        <div className="form-group">
                          <label>Địa chỉ (Tùy chọn)</label>
                          <input
                            type="text"
                            name="customer_address"
                            placeholder="Nhập địa chỉ"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Khách hàng *</label>
                      <select name="customer_id" required>
                        <option value="">Chọn khách hàng</option>
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
                      <label>Ngày bắt đầu *</label>
                      <input
                        type="date"
                        name="start_date"
                        defaultValue={editingRental?.start_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Ngày kết thúc *</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingRental?.end_date}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        required
                      />
                      <small>Phải sau hoặc bằng ngày bắt đầu</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giờ bắt đầu *</label>
                      <input
                        type="time"
                        name="start_time"
                        defaultValue={editingRental?.start_time || '09:00'}
                        onChange={(e) => setStartTime(e.target.value)}
                        step="60"
                        required
                      />
                      <small>Giờ nhận máy</small>
                    </div>

                    <div className="form-group">
                      <label>Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="end_time"
                        defaultValue={editingRental?.end_time || '17:00'}
                        min={startDate === endDate ? startTime : undefined}
                        step="60"
                        required
                      />
                      <small>Giờ trả máy</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá theo ngày *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="daily_rate"
                        defaultValue={editingRental?.daily_rate || selectedCamera?.daily_rate}
                        required
                        placeholder="0.00"
                      />
                      <small>Giá mỗi ngày</small>
                    </div>

                    <div className="form-group">
                      <label>Tổng tiền tùy chỉnh</label>
                      <input
                        type="number"
                        step="0.01"
                        name="custom_total_amount"
                        defaultValue={editingRental?.total_amount}
                        placeholder="Để trống để tính tự động"
                      />
                      <small>Ghi đè số tiền tính toán</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Đặt cọc</label>
                      <input
                        type="number"
                        step="0.01"
                        name="deposit"
                        defaultValue={editingRental?.deposit || 0}
                        placeholder="0.00"
                      />
                      <small>Tiền đặt cọc</small>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Ngày thuê *</label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={editingRental?.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giờ bắt đầu *</label>
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
                      <label>Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="end_time"
                        defaultValue={editingRental?.end_time || '17:00'}
                        min={startTime}
                        step="60"
                        required
                      />
                      <small>Phải sau giờ bắt đầu</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá theo giờ</label>
                      <input
                        type="number"
                        step="0.01"
                        name="hourly_rate"
                        defaultValue={editingRental?.hourly_rate || selectedCamera?.hourly_rate}
                        placeholder="0.00"
                      />
                      <small>Giá mỗi giờ (tùy chọn nếu đã điền tổng tiền)</small>
                    </div>

                    <div className="form-group">
                      <label>Tổng tiền tùy chỉnh</label>
                      <input
                        type="number"
                        step="0.01"
                        name="custom_total_amount"
                        defaultValue={editingRental?.total_amount}
                        placeholder="Để trống để tính tự động"
                      />
                      <small>Ghi đè số tiền tính toán</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Đặt cọc</label>
                      <input
                        type="number"
                        step="0.01"
                        name="deposit"
                        defaultValue={editingRental?.deposit || 0}
                        placeholder="0.00"
                      />
                      <small>Tiền đặt cọc</small>
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
                  <label>Trạng thái</label>
                  <select name="status" defaultValue={editingRental?.status}>
                    <option value="active">Đang thuê</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  defaultValue={editingRental?.notes}
                  placeholder="Ghi chú thêm về đơn thuê..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRental ? 'Cập nhật' : 'Tạo đơn thuê'}
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
