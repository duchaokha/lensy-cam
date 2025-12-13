import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>📷 LensyCam</h1>
        <p>Welcome, {user?.username}</p>
      </div>

      <nav>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              <span>📊</span>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cameras" className="nav-link">
              <span>📷</span>
              <span>Cameras</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/rentals" className="nav-link">
              <span>📋</span>
              <span>Rentals</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/customers" className="nav-link">
              <span>👥</span>
              <span>Customers</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <button onClick={logout} className="logout-btn">
        <span>🚪</span> <span>Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;
