// src/pages/OfficerDashboard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore, type Alert, type AlertStatus } from '../store/useAppStore';
import AlertDetailsModal from './AlertDetailsModal';
import './OfficerDashboard.css';

export default function OfficerDashboard() {
  const alerts = useAppStore((s) => s.alerts);
  const updateAlertStatus = useAppStore((s) => s.updateAlertStatus);
  const addAlert = useAppStore((s) => s.addAlert);
  const officerProfile = useAppStore((s) => s.officerProfile);
  const currentJourney = useAppStore((s) => s.currentJourney);

  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Active' | 'Cleared'>('All');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return a.status === 'Pending';
    if (filterTab === 'Active') return a.status === 'Acknowledged' || a.status === 'In Progress';
    if (filterTab === 'Cleared') return a.status === 'Cleared';
    return true;
  });

  const pendingCount = alerts.filter((a) => a.status === 'Pending').length;
  const activeCount = alerts.filter((a) => a.status === 'Acknowledged' || a.status === 'In Progress').length;
  const clearedCount = alerts.filter((a) => a.status === 'Cleared').length;

  const handleStatusTransition = (id: string, newStatus: AlertStatus) => {
    updateAlertStatus(id, newStatus, officerProfile.name);
  };

  // Helper to trigger a realistic manual demo alert if testing the officer screen directly
  const handleTriggerDemoAlert = () => {
    const alertId = `ALT-${100 + alerts.length + 1}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const demoAlert: Alert = {
      id: alertId,
      intersectionId: 'INT-02',
      intersection: 'Market St & 5th St',
      crossStreet: '5th Street Commercial Corridor',
      ambulanceId: 'AMB-902',
      etaSeconds: 85,
      distanceMetres: 480,
      priority: 'Critical',
      status: 'Pending',
      createdAt: now,
      history: [
        {
          time: now,
          action: 'Advance Corridor Warning Dispatched to Post 7',
          actor: 'ClearPath CAD System',
        },
      ],
      recommendedAction: 'Hold cross-traffic on 5th Street. Secure clear transit green corridor.',
      routeIndex: 4,
    };
    addAlert(demoAlert);
  };

  return (
    <div className="officer-dashboard-container">
      {/* Officer Station Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>👮 Traffic Officer Intercept Terminal</span>
            {pendingCount > 0 && (
              <span className="badge badge-warning pulse-emergency">
                {pendingCount} Pending Action
              </span>
            )}
          </h1>
          <p className="page-subtitle">
            Sector Post: <strong>{officerProfile.sector}</strong> • Officer on Duty: <strong>{officerProfile.name} ({officerProfile.badgeOrUnit})</strong>
          </p>
        </div>

        <div className="officer-quick-actions">
          <button
            type="button"
            className="btn-outline-cyan btn-sm"
            onClick={handleTriggerDemoAlert}
            title="Inject a simulated advance intersection alert for testing"
          >
            + Trigger Advance Alert
          </button>
          <Link to="/track" className="btn-secondary btn-sm">
            View Live Route Map →
          </Link>
          <Link to="/operator" className="btn-secondary btn-sm">
            Operator Console →
          </Link>
        </div>
      </div>

      {/* Corridor Alert Warning Banner */}
      {pendingCount > 0 && (
        <div className="officer-priority-banner pulse-emergency">
          <div className="opb-left">
            <span className="opb-siren">🚨</span>
            <div>
              <strong className="opb-title">Urgent Advance Clearance Required!</strong>
              <p className="opb-desc">
                High-priority emergency vehicle approaching designated intersection. Acknowledge and hold cross-traffic cycles.
              </p>
            </div>
          </div>
          <span className="badge badge-emergency">Code 3 Active</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="officer-tabs-bar">
        <button
          type="button"
          className={`officer-tab-btn ${filterTab === 'All' ? 'active' : ''}`}
          onClick={() => setFilterTab('All')}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          type="button"
          className={`officer-tab-btn ${filterTab === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilterTab('Pending')}
        >
          Pending Intercepts ({pendingCount})
        </button>
        <button
          type="button"
          className={`officer-tab-btn ${filterTab === 'Active' ? 'active' : ''}`}
          onClick={() => setFilterTab('Active')}
        >
          In Progress ({activeCount})
        </button>
        <button
          type="button"
          className={`officer-tab-btn ${filterTab === 'Cleared' ? 'active' : ''}`}
          onClick={() => setFilterTab('Cleared')}
        >
          Cleared ({clearedCount})
        </button>
      </div>

      {/* Alert Cards Feed */}
      <div className="officer-alerts-grid">
        {filteredAlerts.map((a) => {
          const isPending = a.status === 'Pending';
          const isAcknowledged = a.status === 'Acknowledged';
          const isInProgress = a.status === 'In Progress';
          const isCleared = a.status === 'Cleared';

          let borderClass = 'status-pending';
          let statusBadgeClass = 'badge-warning';

          if (isAcknowledged || isInProgress) {
            borderClass = 'status-active';
            statusBadgeClass = 'badge-cyan';
          } else if (isCleared) {
            borderClass = 'status-cleared';
            statusBadgeClass = 'badge-success';
          }

          return (
            <div key={a.id} className={`card officer-alert-card ${borderClass}`}>
              {/* Alert Card Header */}
              <div className="oac-header">
                <div>
                  <div className="oac-title-row">
                    <span className="oac-id">{a.id}</span>
                    <span className="badge badge-emergency">{a.priority} Priority</span>
                    <span className={`badge ${statusBadgeClass}`}>{a.status}</span>
                  </div>
                  <h3 className="oac-intersection">{a.intersection}</h3>
                  <span className="oac-cross">{a.crossStreet}</span>
                </div>

                <div className="oac-eta-badge">
                  <span className="eta-tag">APPROACH ETA</span>
                  <strong className="eta-seconds">~{a.etaSeconds}s</strong>
                  <span className="eta-dist">{a.distanceMetres}m away</span>
                </div>
              </div>

              {/* Alert Mission Details */}
              <div className="oac-meta-grid">
                <div className="oac-meta-item">
                  <span className="label">Approaching Unit</span>
                  <span className="oac-meta-val text-cyan font-bold">{a.ambulanceId}</span>
                </div>
                <div className="oac-meta-item">
                  <span className="label">Destination Facility</span>
                  <span className="oac-meta-val">
                    {currentJourney ? currentJourney.hospital.name : 'General Trauma Center'}
                  </span>
                </div>
                <div className="oac-meta-item">
                  <span className="label">Dispatched At</span>
                  <span className="oac-meta-val">{a.createdAt}</span>
                </div>
                <div className="oac-meta-item">
                  <span className="label">Assigned Post</span>
                  <span className="oac-meta-val">{officerProfile.callsign}</span>
                </div>
              </div>

              {/* Clearance Directive Box */}
              <div className="oac-directive-box">
                <span className="directive-icon">⚡</span>
                <span className="directive-text">{a.recommendedAction}</span>
              </div>

              {/* Working Interactive Action Controls */}
              <div className="oac-actions-bar">
                {isPending && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleStatusTransition(a.id, 'Acknowledged')}
                  >
                    <span>✓ Acknowledge Alert</span>
                  </button>
                )}

                {isAcknowledged && (
                  <button
                    type="button"
                    className="btn-warning"
                    onClick={() => handleStatusTransition(a.id, 'In Progress')}
                  >
                    <span>⚠️ Mark In Progress (Holding Signals)</span>
                  </button>
                )}

                {isInProgress && (
                  <button
                    type="button"
                    className="btn-success"
                    onClick={() => handleStatusTransition(a.id, 'Cleared')}
                  >
                    <span>🟢 Confirm Cleared (Green Wave)</span>
                  </button>
                )}

                {isCleared && (
                  <span className="cleared-indicator">
                    ✓ Corridor Cleared by {officerProfile.name}
                  </span>
                )}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedAlertForModal(a)}
                >
                  <span>View Details & Cam Feed</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="card officer-empty-state">
          <span className="empty-icon">🚦</span>
          <h3>No Active Alerts for "{filterTab}"</h3>
          <p>
            When an ambulance approaches an intersection on the route, automatic advance corridor warnings will arrive here in real time.
          </p>
          <div className="empty-action-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={handleTriggerDemoAlert}
            >
              Simulate Trigger of Advance Alert
            </button>
            <Link to="/operator" className="btn-secondary">
              Go to Operator Console
            </Link>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {selectedAlertForModal && (
        <AlertDetailsModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
        />
      )}
    </div>
  );
}
