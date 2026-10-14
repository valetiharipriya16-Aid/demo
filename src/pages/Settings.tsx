// src/pages/Settings.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const operatorProfile = useAppStore((s) => s.operatorProfile);
  const officerProfile = useAppStore((s) => s.officerProfile);

  const simSpeed = useAppStore((s) => s.simSpeed);
  const setSimSpeed = useAppStore((s) => s.setSimSpeed);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const mapStyle = useAppStore((s) => s.mapStyle);
  const setMapStyle = useAppStore((s) => s.setMapStyle);

  const resetDemo = useAppStore((s) => s.resetDemo);

  const [showResetModal, setShowResetModal] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleRoleChange = (role: 'operator' | 'officer') => {
    setActiveRole(role);
    setSaveToast(`Active role switched to ${role === 'operator' ? 'Ambulance Operator' : 'Traffic Officer'}.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleConfirmReset = () => {
    resetDemo();
    setShowResetModal(false);
    setSaveToast('ClearPath demo state has been fully reset to initial baseline.');
    setTimeout(() => {
      setSaveToast(null);
      navigate('/operator');
    }, 1500);
  };

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>⚙️ System Preferences & Demo Profiles</span>
          </h1>
          <p className="page-subtitle">
            Configure simulated operator roles, telemetry speed multipliers, and prototype defaults
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="demo-disclaimer" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'var(--color-success)', color: 'var(--color-text)' }}>
          <span>✓ {saveToast}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Role & Profile Selection */}
        <div className="card">
          <h2 className="card-title">
            <span>👤 Active Demo Role Selection</span>
          </h2>
          <p className="card-desc" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            Toggle your active operational perspective. The top navigation and default consoles adapt to your selected profile.
          </p>

          <div className="role-selection-cards">
            {/* Operator Card */}
            <div
              className={`role-select-box ${activeRole === 'operator' ? 'active-role' : ''}`}
              onClick={() => handleRoleChange('operator')}
            >
              <div className="rs-header">
                <span className="rs-icon">🚑</span>
                <div>
                  <strong>Ambulance Operator</strong>
                  <span className="badge badge-cyan" style={{ marginLeft: '6px' }}>CAD Console</span>
                </div>
              </div>
              <p className="rs-desc">
                Dispatches ambulances, selects specialty hospitals, monitors route corridors, and tracks arrival telemetry.
              </p>
              <div className="rs-profile-meta">
                <span>Officer: <strong>{operatorProfile.name}</strong></span>
                <span>Unit: <strong>{operatorProfile.badgeOrUnit}</strong></span>
              </div>
            </div>

            {/* Officer Card */}
            <div
              className={`role-select-box ${activeRole === 'officer' ? 'active-role' : ''}`}
              onClick={() => handleRoleChange('officer')}
            >
              <div className="rs-header">
                <span className="rs-icon">👮</span>
                <div>
                  <strong>Traffic Intercept Officer</strong>
                  <span className="badge badge-warning" style={{ marginLeft: '6px' }}>Field Post</span>
                </div>
              </div>
              <p className="rs-desc">
                Receives advance intersection alerts, acknowledges approaching units, holds cross-traffic, and clears green corridors.
              </p>
              <div className="rs-profile-meta">
                <span>Officer: <strong>{officerProfile.name}</strong></span>
                <span>Post: <strong>{officerProfile.sector}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Simulation Controls */}
        <div className="card">
          <h2 className="card-title">
            <span>⚡ Telemetry & Simulation Speed</span>
          </h2>

          <div className="form-group">
            <label className="label">Ambulance Movement Speed Multiplier</label>
            <div className="speed-selector-row">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={`btn-sm ${simSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.65rem' }}
                  onClick={() => setSimSpeed(spd)}
                >
                  {spd}x {spd === 1 ? '(Standard 1.8s/step)' : spd === 2 ? '(Fast 0.9s/step)' : '(Hyper 0.45s/step)'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="label">Default Map Telemetry Provider</label>
            <div className="speed-selector-row">
              <button
                type="button"
                className={`btn-sm ${mapStyle === 'osm-dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.65rem' }}
                onClick={() => setMapStyle('osm-dark')}
              >
                OpenStreetMap Dark Tile Engine
              </button>
              <button
                type="button"
                className={`btn-sm ${mapStyle === 'schematic-grid' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.65rem' }}
                onClick={() => setMapStyle('schematic-grid')}
              >
                Offline Schematic Vector Canvas
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="label">Audio Cues & Alert Notifications</label>
            <label className="checkbox-toggle-label">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span>Enable audio chime simulation on advance intersection alerts</span>
            </label>
          </div>
        </div>

        {/* Prototype Reset Card */}
        <div className="card reset-card">
          <h2 className="card-title" style={{ color: 'var(--color-emergency)' }}>
            <span>⚠️ Prototype State Reset</span>
          </h2>
          <p className="card-desc" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Clear all active simulation runs, reset alerts back to standby, restore default demo parameters, and return the application to initial staging state.
          </p>

          <button
            type="button"
            className="btn-emergency"
            onClick={() => setShowResetModal(true)}
          >
            <span>Reset Demo State (Safe Restore)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--color-emergency)' }}>
                Confirm Demo State Reset
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowResetModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                Are you sure you want to reset the prototype? <br />
                This will:
              </p>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.5rem', color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <li>Halt any active ambulance simulation movement</li>
                <li>Clear in-flight intersection alerts and restore defaults</li>
                <li>Reset the active role to Ambulance Operator</li>
                <li>Re-seed benchmark historical journey records</li>
              </ul>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-emergency"
                onClick={handleConfirmReset}
              >
                Confirm Full Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
