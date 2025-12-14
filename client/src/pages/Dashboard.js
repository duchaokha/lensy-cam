import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')} ₫`;
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Tổng quan</h2>
        <p>Tổng quan kinh doanh cho thuê máy ảnh</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h4>Tổng doanh thu</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.total)}</div>
          <div className="stat-label">Tất cả thời gian</div>
        </div>

        <div className="stat-card">
          <h4>Tháng này</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.monthly)}</div>
          <div className="stat-label">Doanh thu tháng</div>
        </div>

        <div className="stat-card">
          <h4>Năm nay</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.yearly)}</div>
          <div className="stat-label">Doanh thu năm</div>
        </div>

        <div className="stat-card">
          <h4>Tổng số máy</h4>
          <div className="stat-value">{stats.cameras.total}</div>
          <div className="stat-label">Trong kho</div>
        </div>

        <div className="stat-card">
          <h4>Sẵn sàng</h4>
          <div className="stat-value">{stats.cameras.available}</div>
          <div className="stat-label">Có thể cho thuê</div>
        </div>

        <div className="stat-card">
          <h4>Đang cho thuê</h4>
          <div className="stat-value">{stats.cameras.rented}</div>
          <div className="stat-label">Đang sử dụng</div>
        </div>

        <div className="stat-card">
          <h4>Đơn đang hoạt động</h4>
          <div className="stat-value">{stats.rentals.active}</div>
          <div className="stat-label">Đang tiến hành</div>
        </div>

        <div className="stat-card">
          <h4>Đơn quá hạn</h4>
          <div className="stat-value" style={{ color: stats.rentals.overdue > 0 ? '#dc3545' : '#28a745' }}>
            {stats.rentals.overdue}
          </div>
          <div className="stat-label">Cần chú ý</div>
        </div>
      </div>

      {stats.monthlyData && stats.monthlyData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Xu hướng doanh thu (6 tháng gần đây)</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Đơn thuê</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyData.map((month) => (
                  <tr key={month.month}>
                    <td>{month.month}</td>
                    <td>{month.rental_count}</td>
                    <td>{formatCurrency(month.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.recentRentals && stats.recentRentals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Đơn đang hoạt động</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Máy ảnh</th>
                  <th>Khách hàng</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRentals.map((rental) => {
                  const isOverdue = new Date(rental.end_date) < new Date() && rental.status === 'active';
                  return (
                    <tr key={rental.id}>
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
                      <td>{formatDate(rental.start_date)}</td>
                      <td>{formatDate(rental.end_date)}</td>
                      <td>{formatCurrency(rental.total_amount)}</td>
                      <td>
                        <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-success'}`}>
                          {isOverdue ? 'Quá hạn' : 'Đang hoạt động'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!stats.recentRentals || stats.recentRentals.length === 0) && (
        <div className="empty-state">
          <h3>Không có đơn thuê nào</h3>
          <p>Bắt đầu tạo đơn thuê để xem tại đây</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
