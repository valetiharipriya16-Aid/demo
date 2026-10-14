// src/pages/AlertDetailsModal.tsx
import { type Alert, type AlertStatus, useAppStore } from '../store/useAppStore';
import './AlertDetailsModal.css';

interface AlertDetailsModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export default function AlertDetailsModal({ alert, onClose }: AlertDetailsModalProps) {
  const updateAlertStatus = useAppStore((s) => s.updateAlertStatus);
  const officerProfile = useAppStore((s) => s.officerProfile);

  if (!alert) return null;

  const handleStatusChange = (nextStatus: AlertStatus) => {
    updateAlertStatus(alert.id, nextStatus, officerProfile.name);
  };

  const isPending = alert.status === 'Pending';
  const isAcknowledged = alert.status === 'Acknowledged';
  const isInProgress = alert.status === 'In Progress';
  const isCleared = alert.status === 'Cleared';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content alert-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="adm-title-row">
            <span className="badge badge-emergency">EMERGENCY CORRIDOR ALERT</span>
            <h2 className="modal-title">Alert Dossier: {alert.id}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close alert details">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Key Metric Summary */}
          <div className="adm-summary-grid">
            <div className="adm-metric-box">
              <span className="label">Intersection</span>
              <strong className="adm-val">{alert.intersection}</strong>
              <span className="adm-sub">{alert.crossStreet}</span>
            </div>

            <div className="adm-metric-box">
              <span className="label">Inbound Unit</span>
              <strong className="adm-val text-cyan">{alert.ambulanceId}</strong>
              <span className="adm-sub text-emergency font-bold">{alert.priority} Priority</span>
            </div>

            <div className="adm-metric-box">
              <span className="label">Simulated ETA</span>
              <strong className="adm-val text-amber">{alert.etaSeconds} seconds</strong>
              <span className="adm-sub">{alert.distanceMetres}m remaining</span>
            </div>

            <div className="adm-metric-box">
              <span className="label">Current Status</span>
              <span
                className={`badge ${
                  isPending
                    ? 'badge-warning'
                    : isCleared
                    ? 'badge-success'
                    : 'badge-cyan'
                }`}
                style={{ marginTop: '4px' }}
              >
                {alert.status}
              </span>
            </div>
          </div>

          {/* Simulated Traffic Camera Feed */}
          <div className="adm-cam-preview">
            <div className="cam-header">
              <span className="cam-rec-dot"></span>
              <span>LIVE CAM FEED: SFPD-CAM-{alert.intersectionId.replace('INT-', '0')}</span>
              <span className="cam-time">{alert.createdAt}</span>
            </div>
            <div className="cam-display">
              <div className="cam-overlay-grid"></div>
              <div className="cam-crosshair"></div>
              <div className="cam-hud-text">
                CORRIDOR SCAN: {alert.intersection.toUpperCase()} <br />
                HOLD TRANSIT CROSSING • SECURE CORRIDOR
              </div>
            </div>
          </div>

          {/* Standard Operating Procedure (SOP) Action Advice */}
          <div className="card sop-card">
            <h4 className="sop-title">📋 Tactical Clearance Directive:</h4>
            <p className="sop-text">{alert.recommendedAction}</p>
          </div>

          {/* Audit Action History */}
          <div className="adm-history-section">
            <h4 className="label">Action Audit History:</h4>
            <div className="adm-history-list">
              {alert.history.map((entry, idx) => (
                <div key={idx} className="adm-history-entry">
                  <div className="adm-entry-time">{entry.time}</div>
                  <div className="adm-entry-info">
                    <span className="adm-entry-action">{entry.action}</span>
                    <span className="adm-entry-actor">Logged by: {entry.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Status Transitions */}
        <div className="modal-footer adm-footer">
          <div className="adm-status-actions">
            {isPending && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleStatusChange('Acknowledged')}
              >
                <span>✓ Acknowledge Inbound Alert</span>
              </button>
            )}

            {isAcknowledged && (
              <button
                type="button"
                className="btn-warning"
                onClick={() => handleStatusChange('In Progress')}
              >
                <span>⚠️ Mark Signals In Progress (Clearing)</span>
              </button>
            )}

            {isInProgress && (
              <button
                type="button"
                className="btn-success"
                onClick={() => handleStatusChange('Cleared')}
              >
                <span>🟢 Mark Intersection 100% Cleared</span>
              </button>
            )}

            {isCleared && (
              <button type="button" className="btn-success" disabled>
                <span>✓ Corridor Cleared & Verified</span>
              </button>
            )}
          </div>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
