import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cameras from './pages/Cameras';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Availability from './pages/Availability';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app">
                <Sidebar isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
                <div className="main-content">
                  {/* Mobile header with menu toggle */}
                  <div className="mobile-header">
                    <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>LensyCam</h1>
                    <button className="menu-toggle" onClick={toggleMobileMenu}>
                      ☰
                    </button>
                  </div>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cameras" element={<Cameras />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/rentals" element={<Rentals />} />
                    <Route path="/availability" element={<Availability />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
