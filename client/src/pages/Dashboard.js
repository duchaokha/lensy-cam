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

  if (loading) return <div className="loading">Loading dashboard</div>;
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
        <h2>Dashboard</h2>
        <p>Overview of your camera rental business</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h4>Total Revenue</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.total)}</div>
          <div className="stat-label">All time</div>
        </div>

        <div className="stat-card">
          <h4>This Month</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.monthly)}</div>
          <div className="stat-label">Monthly revenue</div>
        </div>

        <div className="stat-card">
          <h4>This Year</h4>
          <div className="stat-value">{formatCurrency(stats.revenue.yearly)}</div>
          <div className="stat-label">Yearly revenue</div>
        </div>

        <div className="stat-card">
          <h4>Total Cameras</h4>
          <div className="stat-value">{stats.cameras.total}</div>
          <div className="stat-label">In inventory</div>
        </div>

        <div className="stat-card">
          <h4>Available</h4>
          <div className="stat-value">{stats.cameras.available}</div>
          <div className="stat-label">Ready to rent</div>
        </div>

        <div className="stat-card">
          <h4>Currently Rented</h4>
          <div className="stat-value">{stats.cameras.rented}</div>
          <div className="stat-label">Out on rental</div>
        </div>

        <div className="stat-card">
          <h4>Active Rentals</h4>
          <div className="stat-value">{stats.rentals.active}</div>
          <div className="stat-label">Ongoing</div>
        </div>

        <div className="stat-card">
          <h4>Overdue Rentals</h4>
          <div className="stat-value" style={{ color: stats.rentals.overdue > 0 ? '#dc3545' : '#28a745' }}>
            {stats.rentals.overdue}
          </div>
          <div className="stat-label">Need attention</div>
        </div>
      </div>

      {stats.monthlyData && stats.monthlyData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Monthly Revenue Trend (Last 6 Months)</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Rentals</th>
                  <th>Revenue</th>
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
            <h3>Active Rentals</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Camera</th>
                  <th>Customer</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Status</th>
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
                          {isOverdue ? 'Overdue' : 'Active'}
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
          <h3>No active rentals</h3>
          <p>Start creating rentals to see them here</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
