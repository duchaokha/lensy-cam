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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h1 style={{ margin: 0 }}>LensyCam</h1>
          </div>
          <p>Xin chào, {user?.username}</p>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end onClick={handleNavClick}>
                <span>📊</span>
                <span>Tổng quan</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cameras" className="nav-link" onClick={handleNavClick}>
                <span>📷</span>
                <span>Máy ảnh</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rentals" className="nav-link" onClick={handleNavClick}>
                <span>📋</span>
                <span>Cho thuê</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/availability" className="nav-link" onClick={handleNavClick}>
                <span>📅</span>
                <span>Kiểm tra</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/customers" className="nav-link" onClick={handleNavClick}>
                <span>👥</span>
                <span>Khách hàng</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <button onClick={logout} className="logout-btn">
          <span>🚪</span> <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );
}

export default Sidebar;
