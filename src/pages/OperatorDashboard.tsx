// src/pages/OperatorDashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore, type PriorityLevel } from '../store/useAppStore';
import { DEMO_ROUTE, INTERSECTION_NODES } from '../utils/demoData';
import './OperatorDashboard.css';

const EMERGENCY_CATEGORIES = [
  'Major Road Accident',
  'Cardiac Emergency',
  'Severe Pediatric Trauma',
  'Dental / Facial Trauma',
  'Acute Stroke Protocol',
];

export default function OperatorDashboard() {
  const navigate = useNavigate();

  // App Store State & Actions
  const emergencyCategory = useAppStore((s) => s.emergencyCategory);
  const setEmergencyCategory = useAppStore((s) => s.setEmergencyCategory);
  const priority = useAppStore((s) => s.priority);
  const setPriority = useAppStore((s) => s.setPriority);
  const ambulanceId = useAppStore((s) => s.ambulanceId);

  const hospitals = useAppStore((s) => s.hospitals);
  const selectedHospital = useAppStore((s) => s.selectedHospital);
  const setSelectedHospital = useAppStore((s) => s.setSelectedHospital);

  const currentJourney = useAppStore((s) => s.currentJourney);
  const startEmergency = useAppStore((s) => s.startEmergency);
  const pauseSimulation = useAppStore((s) => s.pauseSimulation);
  const resumeSimulation = useAppStore((s) => s.resumeSimulation);
  const endJourney = useAppStore((s) => s.endJourney);
  const advanceRouteStep = useAppStore((s) => s.advanceRouteStep);

  const routeIndex = useAppStore((s) => s.routeIndex);
  const isSimulating = useAppStore((s) => s.isSimulating);
  const isPaused = useAppStore((s) => s.isPaused);
  const simSpeed = useAppStore((s) => s.simSpeed);
  const setSimSpeed = useAppStore((s) => s.setSimSpeed);
  const alerts = useAppStore((s) => s.alerts);
  const resetDemo = useAppStore((s) => s.resetDemo);

  // Local notification banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Simulation timer hook
  useEffect(() => {
    if (!isSimulating || isPaused) return undefined;
    const intervalMs = Math.round(1800 / simSpeed);
    const interval = setInterval(() => {
      advanceRouteStep();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isSimulating, isPaused, simSpeed, advanceRouteStep]);

  const handleStart = () => {
    if (!selectedHospital) {
      setActionNotice('Please select a destination hospital before initiating emergency dispatch.');
      return;
    }
    const success = startEmergency();
    if (success) {
      setActionNotice(`Emergency run initiated. Unit ${ambulanceId.split(' ')[0]} dispatched.`);
    }
  };

  const handlePause = () => {
    pauseSimulation();
    setActionNotice('Simulation paused.');
  };

  const handleResume = () => {
    resumeSimulation();
    setActionNotice('Simulation resumed.');
  };

  const handleEnd = () => {
    endJourney();
    setActionNotice('Emergency journey completed. Archived to history.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo state back to default? Active simulation will stop.')) {
      resetDemo();
      setActionNotice('Demo reset to initial staging state.');
    }
  };

  // Metrics
  const currentStatus = currentJourney ? currentJourney.status : 'Idle';
  const totalIntersections = INTERSECTION_NODES.length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'Acknowledged' || a.status === 'In Progress' || a.status === 'Cleared').length;
  const clearedCount = alerts.filter((a) => a.status === 'Cleared').length;

  const currentPoint = DEMO_ROUTE[Math.min(routeIndex, DEMO_ROUTE.length - 1)];

  return (
    <div className="operator-dashboard-container">
      {/* Top Banner & Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>🚑 Ambulance Operator Console</span>
            <span className={`badge ${currentStatus === 'En Route' ? 'badge-emergency pulse-emergency' : currentStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
              Status: {currentStatus}
            </span>
          </h1>
          <p className="page-subtitle">
            Centralized Computer-Aided Dispatch (CAD) & Real-Time Intersection Pre-Clearance
          </p>
        </div>

        <div className="operator-quick-actions">
          <Link to="/track" className="btn-outline-cyan">
            <span>Live Map View</span>
            <span>🗺️</span>
          </Link>
          <Link to="/officer" className="btn-secondary">
            <span>Traffic Officer Feed</span>
            <span>👮</span>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="demo-disclaimer" style={{ justifyContent: 'space-between' }}>
          <span>ℹ️ {actionNotice}</span>
          <button
            type="button"
            className="btn-sm btn-secondary"
            style={{ padding: '2px 8px' }}
            onClick={() => setActionNotice(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Controls & Telemetry */}
      <div className="operator-grid">
        {/* Left Column: Configuration & Controls */}
        <div className="operator-col-left">
          {/* Mission Dispatch Configuration Card */}
          <div className="card">
            <h2 className="card-title">
              <span>📋 Emergency Configuration</span>
            </h2>

            <div className="form-group">
              <label htmlFor="category-select" className="label">
                Emergency Triage Classification
              </label>
              <select
                id="category-select"
                className="select"
                value={emergencyCategory}
                disabled={isSimulating}
                onChange={(e) => setEmergencyCategory(e.target.value)}
              >
                {EMERGENCY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority-select" className="label">
                Transit Priority Code
              </label>
              <div className="priority-button-group">
                {(['Critical', 'High', 'Medium'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={isSimulating}
                    className={`priority-btn ${lvl.toLowerCase()} ${priority === lvl ? 'active' : ''}`}
                    onClick={() => setPriority(lvl)}
                  >
                    {lvl === 'Critical' ? '🚨 Code 3 (Critical)' : lvl === 'High' ? '⚠️ Code 2 (High)' : 'ℹ️ Code 1 (Standard)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="label">Destination Facility</label>
                <Link to="/hospitals" className="btn-sm btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                  Browse All Hospitals →
                </Link>
              </div>
              <select
                id="hospital-select"
                aria-label="Destination Facility"
                className="select"
                value={selectedHospital?.id || ''}
                disabled={isSimulating && currentStatus === 'En Route'}
                onChange={(e) => {
                  const found = hospitals.find((h) => h.id === e.target.value);
                  if (found) setSelectedHospital(found);
                }}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.travelTimeMin}m ETA ({h.capacityStatus})
                  </option>
                ))}
              </select>
            </div>

            {selectedHospital && (
              <div className="selected-hospital-snippet">
                <div className="snippet-header">
                  <strong>{selectedHospital.name}</strong>
                  <span className="badge badge-cyan">{selectedHospital.capacityStatus}</span>
                </div>
                <div className="snippet-caps">
                  {selectedHospital.capabilities.slice(0, 3).map((cap) => (
                    <span key={cap} className="cap-tag">
                      {cap}
                    </span>
                  ))}
                </div>
                <div className="snippet-meta">
                  <span>📍 {selectedHospital.address}</span>
                  <span>⏱️ Est. Travel: {selectedHospital.travelTimeMin} min (Simulated)</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="operator-action-cluster">
              {currentStatus === 'Idle' || currentStatus === 'Completed' ? (
                <button
                  type="button"
                  className="btn-emergency btn-large"
                  onClick={handleStart}
                  disabled={!selectedHospital}
                >
                  <span>🚨 Start Emergency Mission</span>
                </button>
              ) : currentStatus === 'En Route' ? (
                <button type="button" className="btn-warning btn-large" onClick={handlePause}>
                  <span>⏸️ Pause Simulation</span>
                </button>
              ) : currentStatus === 'Paused' ? (
                <button type="button" className="btn-primary btn-large" onClick={handleResume}>
                  <span>▶️ Resume Simulation</span>
                </button>
              ) : null}

              <div className="secondary-controls-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleEnd}
                  disabled={!currentJourney || currentStatus === 'Completed'}
                >
                  <span>End Journey</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/track')}
                >
                  <span>View Route Map</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                  title="Reset demo parameters"
                >
                  <span>Reset Demo</span>
                </button>
              </div>

              {/* Simulation Speed Selector */}
              <div className="sim-speed-box">
                <span className="label" style={{ marginBottom: 0 }}>Sim Speed:</span>
                <div className="speed-buttons">
                  {([1, 2, 4] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      className={`btn-sm ${simSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSimSpeed(spd)}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Telemetry & Intersections Overview */}
        <div className="operator-col-right">
          {/* Active Unit Telemetry Card */}
          <div className="card">
            <h2 className="card-title">
              <span>📡 Active Unit Telemetry</span>
              <span className="badge badge-cyan">{ambulanceId.split(' ')[0]}</span>
            </h2>

            <div className="telemetry-grid">
              <div className="telemetry-item">
                <span className="t-label">Simulated Location</span>
                <span className="t-val text-cyan">{currentPoint?.name || 'Civic Center'}</span>
              </div>
              <div className="telemetry-item">
                <span className="t-label">Route Progress</span>
                <span className="t-val">
                  Step {routeIndex + 1} of {DEMO_ROUTE.length}
                </span>
              </div>
              <div className="telemetry-item">
                <span className="t-label">Simulated Remaining Dist.</span>
                <span className="t-val">
                  {currentJourney ? `${currentJourney.distanceRemainingMetres} m` : '3,400 m'}
                </span>
              </div>
              <div className="telemetry-item">
                <span className="t-label">Simulated Arrival ETA</span>
                <span className="t-val text-amber">
                  {currentStatus === 'Completed'
                    ? '0 min (Arrived)'
                    : currentJourney
                    ? `${Math.max(1, Math.round(currentJourney.distanceRemainingMetres / 500))} min`
                    : '8 min'}
                </span>
              </div>
            </div>

            {/* Corridor Clearance Progress Bar */}
            <div className="corridor-progress-box">
              <div className="cp-header">
                <span className="label">Corridor Pre-Clearance Rate</span>
                <span className="cp-counts">
                  <strong>{clearedCount}</strong> Cleared • <strong>{acknowledgedCount}</strong> In Intercept (of {totalIntersections})
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.round((clearedCount / totalIntersections) * 100)}%`,
                    backgroundColor: clearedCount === totalIntersections ? 'var(--color-success)' : 'var(--color-primary)',
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Upcoming Corridor Intersections */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>
                <span>🚦 Corridor Intersections & Alert Status</span>
              </h2>
              <Link to="/officer" className="btn-sm btn-outline-cyan">
                Open Officer Terminal →
              </Link>
            </div>

            <div className="intersections-list">
              {INTERSECTION_NODES.map((node) => {
                const alertMatch = alerts.find((a) => a.intersectionId === node.id);
                const isAmbulancePast = routeIndex > node.routeIndex;
                const isAmbulanceAt = routeIndex === node.routeIndex;

                let badgeClass = 'badge-neutral';
                let statusLabel = 'Standby';

                if (alertMatch) {
                  statusLabel = alertMatch.status;
                  if (alertMatch.status === 'Pending') badgeClass = 'badge-warning';
                  else if (alertMatch.status === 'Acknowledged' || alertMatch.status === 'In Progress') badgeClass = 'badge-cyan';
                  else if (alertMatch.status === 'Cleared') badgeClass = 'badge-success';
                } else if (isAmbulancePast) {
                  statusLabel = 'Passed';
                  badgeClass = 'badge-neutral';
                }

                return (
                  <div key={node.id} className={`intersection-row ${isAmbulanceAt ? 'active-corridor' : ''}`}>
                    <div className="int-info">
                      <div className="int-name-row">
                        <span className="int-pin">{isAmbulanceAt ? '🚑' : '📍'}</span>
                        <strong className="int-name">{node.name}</strong>
                        <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                      </div>
                      <span className="int-cross">{node.crossStreet} • {node.officerAssigned}</span>
                    </div>

                    <div className="int-actions">
                      {alertMatch ? (
                        <Link to="/officer" className="btn-sm btn-secondary">
                          View Alert ({alertMatch.id})
                        </Link>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Triggers at Step {Math.max(1, node.routeIndex - 1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live CAD Event Timeline */}
          <div className="card">
            <h2 className="card-title">
              <span>⏱️ Real-Time Journey Audit Timeline</span>
            </h2>

            {currentJourney && currentJourney.timelineEvents.length > 0 ? (
              <div className="timeline-container">
                {currentJourney.timelineEvents.slice(-5).reverse().map((evt) => (
                  <div key={evt.id} className={`timeline-entry ${evt.type}`}>
                    <span className="timeline-time">{evt.time}</span>
                    <span className="timeline-text">{evt.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state-text">
                No active journey. Click <strong>Start Emergency Mission</strong> above to commence live corridor telemetry.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
