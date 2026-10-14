// src/pages/Landing.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const currentJourney = useAppStore((s) => s.currentJourney);
  const startEmergency = useAppStore((s) => s.startEmergency);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  const handleQuickLaunch = () => {
    if (!currentJourney || currentJourney.status === 'Completed') {
      startEmergency();
    }
    navigate('/track');
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>AI Emergency Route Coordination System</span>
          </div>

          <h1 className="hero-headline">
            Every Second Matters. <br />
            <span className="text-cyan-glow">Clear the Way.</span>
          </h1>

          <p className="hero-description">
            During critical medical emergencies, ambulances lose up to 12 minutes navigating congested urban intersections. ClearPath synchronizes ambulance routing with on-duty traffic officers in real time—dispatching advance corridor alerts and securing green waves before the vehicle arrives.
          </p>

          <div className="hero-cta-group">
            <Link to="/operator" className="btn-primary hero-btn">
              <span>Launch Demo</span>
              <span className="btn-arrow">→</span>
            </Link>

            <button
              type="button"
              className="btn-secondary hero-btn"
              onClick={() => setShowHowItWorksModal(true)}
            >
              <span>Explore How It Works</span>
              <span className="btn-icon">ℹ️</span>
            </button>

            <button
              type="button"
              className="btn-emergency hero-btn"
              onClick={handleQuickLaunch}
              title="Instantly dispatch demo ambulance and jump to live map tracking"
            >
              <span>Quick Dispatch & Track</span>
              <span className="btn-icon">🚑</span>
            </button>
          </div>

          <div className="hero-demo-notice">
            <span className="demo-icon">⚡</span>
            <span>Interactive prototype — simulated ambulance movement and officer responses.</span>
          </div>
        </div>

        {/* Hero Interactive Map / Ambulance Simulation Illustration */}
        <div className="hero-visual">
          <div className="simulation-preview-card">
            <div className="preview-header">
              <div className="preview-title-row">
                <span className="preview-indicator"></span>
                <span className="preview-title">Live Corridor Telemetry</span>
              </div>
              <span className="badge badge-emergency">Active Unit: AMB-902</span>
            </div>

            <div className="schematic-map-preview">
              <div className="map-grid-lines"></div>

              {/* Waypoints */}
              <div className="map-route-svg-container">
                <svg className="route-svg" viewBox="0 0 360 220">
                  <path
                    d="M 30 180 Q 90 140 150 110 T 260 70 L 330 30"
                    fill="none"
                    stroke="#1e3a5f"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 30 180 Q 90 140 150 110 T 260 70 L 330 30"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Animated Ambulance Node */}
                <div className="node-ambulance pulse-emergency" style={{ left: '42%', top: '50%' }}>
                  <span>🚑</span>
                </div>

                {/* Intersection Nodes */}
                <div className="node-intersection" style={{ left: '10%', top: '78%' }} title="Intersection 1 - Cleared">
                  <span className="node-pin cleared">✓</span>
                  <span className="node-label">7th St</span>
                </div>

                <div className="node-intersection" style={{ left: '42%', top: '48%' }} title="Intersection 2 - Alert Dispatched">
                  <span className="node-pin pending pulse-emergency">!</span>
                  <span className="node-label">5th St</span>
                </div>

                <div className="node-intersection" style={{ left: '72%', top: '30%' }} title="Intersection 3 - Upcoming">
                  <span className="node-pin upcoming">3</span>
                  <span className="node-label">4th St</span>
                </div>

                {/* Hospital Node */}
                <div className="node-hospital" style={{ left: '90%', top: '12%' }} title="Bay Area Trauma Center">
                  <span className="hospital-pin">🏥</span>
                  <span className="node-label">Trauma Bay</span>
                </div>
              </div>
            </div>

            <div className="preview-footer">
              <div className="preview-stat">
                <span className="stat-label">Next Intersection</span>
                <span className="stat-value text-amber">Market & 5th St</span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">ETA to Corridor</span>
                <span className="stat-value text-cyan">1m 30s (Simulated)</span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">Officer Status</span>
                <span className="stat-value text-green">Cleared Green Wave</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Key Feature Cards */}
      <section className="features-section">
        <div className="section-header-centered">
          <h2 className="section-title">Designed for Seconds-Count Precision</h2>
          <p className="section-subtitle">
            A closed-loop coordination pipeline connecting dispatchers, traffic posts, and emergency receiving bays.
          </p>
        </div>

        <div className="grid-3">
          <div className="card feature-card">
            <div className="feature-icon-box cyan">
              <span>🚦</span>
            </div>
            <h3 className="feature-card-title">Route-Aware Traffic Alerts</h3>
            <p className="feature-card-desc">
              Deterministic distance triggers notify intersection officers 90 seconds prior to ambulance arrival, allowing safe staging of pedestrian and turning queues.
            </p>
            <Link to="/officer" className="feature-link">
              Explore Officer View →
            </Link>
          </div>

          <div className="card feature-card">
            <div className="feature-icon-box emergency">
              <span>🏥</span>
            </div>
            <h3 className="feature-card-title">Hospital Coordination</h3>
            <p className="feature-card-desc">
              Filter receiving centers by verified trauma level, cath lab readiness, and simulated bed availability to eliminate costly secondary ambulance transfers.
            </p>
            <Link to="/hospitals" className="feature-link">
              View Hospital Candidates →
            </Link>
          </div>

          <div className="card feature-card">
            <div className="feature-icon-box green">
              <span>⚡</span>
            </div>
            <h3 className="feature-card-title">Real-Time Alert Acknowledgement</h3>
            <p className="feature-card-desc">
              Bi-directional audit loop confirms when officers acknowledge alerts and clear intersections, giving drivers speed confidence on emergency approaches.
            </p>
            <Link to="/track" className="feature-link">
              Inspect Live Route →
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Explanation Section */}
      <section className="workflow-section">
        <div className="section-header-centered">
          <h2 className="section-title">Three-Step Coordination Workflow</h2>
          <p className="section-subtitle">How ClearPath streamlines urban emergency transit in practice.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <h4>Report Emergency</h4>
              <p>
                Operator configures category (e.g. Major Trauma, Cardiac Arrest) and sets priority level. The system calculates optimal candidate facilities.
              </p>
            </div>
          </div>

          <div className="step-divider">→</div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <h4>Plan Route & Select Hospital</h4>
              <p>
                Dispatcher locks in destination based on specialized capacity. Navigation traces arterial transit corridors with minimum high-risk left turns.
              </p>
            </div>
          </div>

          <div className="step-divider">→</div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <h4>Coordinate Intersections</h4>
              <p>
                Traffic wardens receive localized corridor alerts, hold opposing light cycles, clear gridlock, and confirm route clearance back to telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="workflow-action-bar">
          <Link to="/operator" className="btn-primary">
            Start Live Emergency Demo Now →
          </Link>
        </div>
      </section>

      {/* "Explore How It Works" Interactive Modal */}
      {showHowItWorksModal && (
        <div className="modal-overlay" onClick={() => setShowHowItWorksModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">ClearPath Architecture & Simulation Guide</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowHowItWorksModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="guide-step-item">
                <h4 className="text-cyan">1. Dual Role Operations</h4>
                <p>
                  You can experience ClearPath from both perspectives: use the <strong>Role Switcher</strong> in the top header or Settings page to toggle between <strong>Ambulance Operator</strong> and <strong>Traffic Officer</strong>.
                </p>
              </div>

              <div className="guide-step-item">
                <h4 className="text-emergency">2. Emergency Dispatch Life Cycle</h4>
                <p>
                  On the <strong>Operator Dashboard</strong>, select an emergency category and destination hospital. Click <strong>Start Emergency</strong> to generate an active telemetry run and begin route progression.
                </p>
              </div>

              <div className="guide-step-item">
                <h4 className="text-amber">3. Intersection Advance Alerts</h4>
                <p>
                  As the ambulance progresses down the corridor, advance alerts trigger for approaching intersections. The assigned officer can Acknowledge, Mark In Progress, and Mark Cleared.
                </p>
              </div>

              <div className="guide-step-item">
                <h4 className="text-green">4. Complete Journey Summary</h4>
                <p>
                  When the ambulance reaches the receiving hospital, the journey archives to <strong>Journey History</strong> with full response timestamps, clearance metrics, and audit logs.
                </p>
              </div>

              <div className="demo-disclaimer" style={{ marginTop: '1rem' }}>
                <span>ℹ️ This prototype runs entirely on deterministic client-side simulation. No external API keys or live traffic network privileges are required.</span>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowHowItWorksModal(false)}
              >
                Close Guide
              </button>
              <Link
                to="/operator"
                className="btn-primary"
                onClick={() => setShowHowItWorksModal(false)}
              >
                Go to Operator Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
