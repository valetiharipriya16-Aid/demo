// src/pages/History.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { SeedJourneyRecord } from '../utils/demoData';
import './History.css';

export default function History() {
  const history = useAppStore((s) => s.history);
  const currentJourney = useAppStore((s) => s.currentJourney);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Active'>('All');
  const [selectedJourneyModal, setSelectedJourneyModal] = useState<SeedJourneyRecord | null>(null);

  // If there's an active journey currently en route, create a live preview record
  const allJourneys: SeedJourneyRecord[] = useMemo(() => [
    ...(currentJourney && currentJourney.status !== 'Completed'
      ? [
          {
            id: currentJourney.id,
            ambulanceId: currentJourney.ambulanceId,
            category: currentJourney.category,
            priority: currentJourney.priority,
            hospitalName: currentJourney.hospital.name,
            startLocation: 'Civic Center Staging',
            endLocation: `${currentJourney.hospital.name} ER Bay`,
            status: 'Active' as const,
            startedAt: `Today, ${currentJourney.startedAt}`,
            completedAt: 'In Progress',
            durationMinutes: currentJourney.durationMinutes || 1,
            intersectionsAlerted: 4,
            intersectionsCleared: 0,
            averageClearanceTimeSec: 0,
            isSeededDemo: false,
          },
        ]
      : []),
    ...history,
  ], [currentJourney, history]);

  // Sanitized & Memoized Filtering
  const sanitizedQuery = searchQuery.replace(/[<>]/g, '').trim().toLowerCase();
  const filteredJourneys = useMemo(() => {
    return allJourneys.filter((j) => {
      const matchesSearch =
        !sanitizedQuery ||
        j.id.toLowerCase().includes(sanitizedQuery) ||
        j.hospitalName.toLowerCase().includes(sanitizedQuery) ||
        j.category.toLowerCase().includes(sanitizedQuery) ||
        j.ambulanceId.toLowerCase().includes(sanitizedQuery);

      const matchesStatus =
        statusFilter === 'All' || j.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allJourneys, sanitizedQuery, statusFilter]);

  return (
    <div className="history-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>📋 Emergency Journey History & Clearance Archive</span>
          </h1>
          <p className="page-subtitle">
            Historical audit logs of simulated corridor runs, response timestamps, and intersection clearance metrics
          </p>
        </div>

        <div className="history-header-actions">
          <Link to="/operator" className="btn-primary">
            + New Emergency Run
          </Link>
          <Link to="/track" className="btn-secondary">
            View Live Route →
          </Link>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="demo-disclaimer">
        <span>ℹ️ Note: ClearPath distinguishes seeded reference benchmark records from live journeys executed during your current browser session.</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card history-filter-card">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Journey ID (e.g. JRN-2026), hospital, or triage category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        <div className="history-tabs">
          <button
            type="button"
            className={`officer-tab-btn ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All Journeys ({allJourneys.length})
          </button>
          <button
            type="button"
            className={`officer-tab-btn ${statusFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Completed')}
          >
            Completed
          </button>
          <button
            type="button"
            className={`officer-tab-btn ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            Active Runs
          </button>
        </div>
      </div>

      {/* Journeys Table / Card Grid */}
      <div className="card history-table-card">
        <div className="table-responsive-wrapper">
          <table className="history-data-table">
            <thead>
              <tr>
                <th>Journey ID</th>
                <th>Unit & Category</th>
                <th>Receiving Hospital</th>
                <th>Status</th>
                <th>Timeline</th>
                <th>Intersections</th>
                <th>Record Origin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJourneys.map((j) => (
                <tr key={j.id} className="history-row">
                  <td>
                    <span className="jrn-id-tag">{j.id}</span>
                  </td>
                  <td>
                    <div className="jrn-unit-col">
                      <strong className="text-cyan">{j.ambulanceId}</strong>
                      <span className="jrn-cat">{j.category}</span>
                    </div>
                  </td>
                  <td>
                    <span className="jrn-hosp">{j.hospitalName}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        j.status === 'Completed'
                          ? 'badge-success'
                          : j.status === 'Active'
                          ? 'badge-emergency pulse-emergency'
                          : 'badge-neutral'
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td>
                    <div className="jrn-time-col">
                      <span>{j.startedAt}</span>
                      <span className="jrn-duration">Duration: {j.durationMinutes} min</span>
                    </div>
                  </td>
                  <td>
                    <div className="jrn-int-col">
                      <span className="jrn-cleared">
                        {j.intersectionsCleared} / {j.intersectionsAlerted} Cleared
                      </span>
                      {j.averageClearanceTimeSec > 0 && (
                        <span className="jrn-avg-time">Avg: {j.averageClearanceTimeSec}s</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {j.isSeededDemo ? (
                      <span className="badge badge-neutral" title="Pre-seeded benchmark demo dataset">
                        Seeded Demo
                      </span>
                    ) : (
                      <span className="badge badge-cyan" title="Created during your current live testing session">
                        Session Run
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-sm btn-secondary"
                      onClick={() => setSelectedJourneyModal(j)}
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJourneys.length === 0 && (
          <div className="empty-history-box">
            <p>No journey records found matching your search filter.</p>
          </div>
        )}
      </div>

      {/* Journey Details Modal */}
      {selectedJourneyModal && (
        <div className="modal-overlay" onClick={() => setSelectedJourneyModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-cyan">JOURNEY AUDIT DOSSIER</span>
                <h3 className="modal-title" style={{ marginTop: '4px' }}>
                  Mission: {selectedJourneyModal.id}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedJourneyModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="adm-summary-grid">
                <div className="adm-metric-box">
                  <span className="label">Unit</span>
                  <strong className="adm-val text-cyan">{selectedJourneyModal.ambulanceId}</strong>
                </div>
                <div className="adm-metric-box">
                  <span className="label">Triage</span>
                  <strong className="adm-val">{selectedJourneyModal.category}</strong>
                </div>
                <div className="adm-metric-box">
                  <span className="label">Duration</span>
                  <strong className="adm-val">{selectedJourneyModal.durationMinutes} min</strong>
                </div>
                <div className="adm-metric-box">
                  <span className="label">Status</span>
                  <span className="badge badge-success" style={{ marginTop: '4px' }}>
                    {selectedJourneyModal.status}
                  </span>
                </div>
              </div>

              <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <h4 className="label">Transit Routing Information</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginTop: '0.4rem' }}>
                  <strong>Origin:</strong> {selectedJourneyModal.startLocation} <br />
                  <strong>Destination:</strong> {selectedJourneyModal.hospitalName} <br />
                  <strong>Completed At:</strong> {selectedJourneyModal.completedAt}
                </p>
              </div>

              <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <h4 className="label">Intersection Pre-Clearance Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <span className="label">Intersections Alerted:</span>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-text)' }}>
                      {selectedJourneyModal.intersectionsAlerted}
                    </strong>
                  </div>
                  <div>
                    <span className="label">Successfully Cleared:</span>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-success)' }}>
                      {selectedJourneyModal.intersectionsCleared}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedJourneyModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
