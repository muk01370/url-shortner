import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            URL Shortener
          </Link>
        </div>
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
        </button>
        <div className={`navbar-menu ${isOpen ? 'is-active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="navbar-button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="navbar-link" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;