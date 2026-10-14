// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">🚑 ClearPath</span>
            <p className="footer-tagline">Every second matters. Clear the way.</p>
          </div>
          <div className="footer-links">
            <Link to="/operator">Operator Dashboard</Link>
            <Link to="/hospitals">Hospital Selection</Link>
            <Link to="/track">Route Tracking</Link>
            <Link to="/officer">Traffic Officer</Link>
            <Link to="/history">Journey History</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-notice">
            <span className="notice-badge">Simulated Demo</span>
            <span>
              Interactive hackathon prototype. All GPS coordinates, intersection signals, and hospital capacity data are simulated for demonstration purposes.
            </span>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} ClearPath Project. Built for Emergency Response Innovation.
          </div>
        </div>
      </div>
    </footer>
  );
}
