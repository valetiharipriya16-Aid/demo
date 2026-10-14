// src/components/Header.tsx
import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './Header.css';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const currentJourney = useAppStore((s) => s.currentJourney);
  const alerts = useAppStore((s) => s.alerts);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);

  const pendingAlertsCount = alerts.filter((a) => a.status === 'Pending').length;
  const isLiveEmergency = currentJourney && currentJourney.status === 'En Route';

  const toggleRole = () => {
    const nextRole = activeRole === 'operator' ? 'officer' : 'operator';
    setActiveRole(nextRole);
    if (nextRole === 'officer') {
      navigate('/officer');
    } else {
      navigate('/operator');
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="logo-icon-box">
            <span className="logo-icon">🚑</span>
          </div>
          <div className="brand-text-group">
            <span className="brand-title">ClearPath</span>
            <span className="brand-tagline">Emergency Route AI</span>
          </div>
        </Link>

        {/* Live Emergency Alert Banner (when active) */}
        {isLiveEmergency && (
          <Link to="/track" className="live-status-pill pulse-emergency" title="Active emergency journey in progress. Click to view live map.">
            <span className="status-dot"></span>
            <span className="status-text">EMERGENCY ACTIVE: {currentJourney.ambulanceId}</span>
          </Link>
        )}

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/operator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Operator
          </NavLink>
          <NavLink to="/hospitals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Hospitals
          </NavLink>
          <NavLink to="/track" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Route Track
            {isLiveEmergency && <span className="nav-badge-dot"></span>}
          </NavLink>
          <NavLink to="/officer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Officer
            {pendingAlertsCount > 0 && (
              <span className="nav-badge-count">{pendingAlertsCount}</span>
            )}
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            History
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Settings
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Quick Role Switcher Pill */}
          <button
            className="role-switch-btn"
            onClick={toggleRole}
            title="Click to toggle between Operator and Traffic Officer role"
          >
            <span className="role-label">Role:</span>
            <span className={`role-value ${activeRole}`}>{activeRole === 'operator' ? 'Operator' : 'Traffic Officer'}</span>
            <span className="switch-icon">⇄</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <NavLink to="/" end className="mobile-nav-item" onClick={closeMenu}>
              🏠 Home
            </NavLink>
            <NavLink to="/operator" className="mobile-nav-item" onClick={closeMenu}>
              🚑 Operator Dashboard
            </NavLink>
            <NavLink to="/hospitals" className="mobile-nav-item" onClick={closeMenu}>
              🏥 Hospital Candidates
            </NavLink>
            <NavLink to="/track" className="mobile-nav-item" onClick={closeMenu}>
              🗺️ Route Tracking
              {isLiveEmergency && <span className="badge badge-emergency">Active</span>}
            </NavLink>
            <NavLink to="/officer" className="mobile-nav-item" onClick={closeMenu}>
              👮 Traffic Officer Dashboard
              {pendingAlertsCount > 0 && (
                <span className="badge badge-warning">{pendingAlertsCount} Alerts</span>
              )}
            </NavLink>
            <NavLink to="/history" className="mobile-nav-item" onClick={closeMenu}>
              📋 Journey History
            </NavLink>
            <NavLink to="/settings" className="mobile-nav-item" onClick={closeMenu}>
              ⚙️ Settings & Role
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
