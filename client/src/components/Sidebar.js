import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="mobile-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'none'
          }}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>📷 LensyCam</h1>
          <p>Welcome, {user?.username}</p>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end onClick={handleNavClick}>
                <span>📊</span>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cameras" className="nav-link" onClick={handleNavClick}>
                <span>📷</span>
                <span>Cameras</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rentals" className="nav-link" onClick={handleNavClick}>
                <span>📋</span>
                <span>Rentals</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/availability" className="nav-link" onClick={handleNavClick}>
                <span>📅</span>
                <span>Availability</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/customers" className="nav-link" onClick={handleNavClick}>
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
    </>
  );
}

export default Sidebar;
