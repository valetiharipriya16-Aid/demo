// @ts-nocheck
// src/pages/RouteTracker.tsx
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';
import { DEMO_ROUTE, INTERSECTION_NODES } from '../utils/demoData';
import './RouteTracker.css';

// Component to dynamically re-center Leaflet map when ambulance moves
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function RouteTracker() {
  const currentJourney = useAppStore((s) => s.currentJourney);
  const selectedHospital = useAppStore((s) => s.selectedHospital);
  const routeIndex = useAppStore((s) => s.routeIndex);
  const isSimulating = useAppStore((s) => s.isSimulating);
  const isPaused = useAppStore((s) => s.isPaused);
  const simSpeed = useAppStore((s) => s.simSpeed);
  const setSimSpeed = useAppStore((s) => s.setSimSpeed);
  const alerts = useAppStore((s) => s.alerts);

  const startEmergency = useAppStore((s) => s.startEmergency);
  const pauseSimulation = useAppStore((s) => s.pauseSimulation);
  const resumeSimulation = useAppStore((s) => s.resumeSimulation);
  const endJourney = useAppStore((s) => s.endJourney);
  const advanceRouteStep = useAppStore((s) => s.advanceRouteStep);

  const [mapMode, setMapMode] = useState<'leaflet' | 'schematic'>('leaflet');

  // Simulation step timer
  useEffect(() => {
    if (!isSimulating || isPaused) return undefined;
    const intervalMs = Math.round(1800 / simSpeed);
    const interval = setInterval(() => {
      advanceRouteStep();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isSimulating, isPaused, simSpeed, advanceRouteStep]);

  const currentPoint = DEMO_ROUTE[Math.min(routeIndex, DEMO_ROUTE.length - 1)];
  const hospitalPoint = DEMO_ROUTE[DEMO_ROUTE.length - 1];
  const progressPercent = Math.round(((routeIndex + 1) / DEMO_ROUTE.length) * 100);

  // Custom DivIcons for Leaflet
  const ambulanceIcon = useMemo(() => {
    return L.divIcon({
      className: 'leaflet-custom-div-icon',
      html: `
        <div class="leaflet-ambulance-pin ${isSimulating && !isPaused ? 'pulse-emergency' : ''}">
          <span style="font-size: 18px;">🚑</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, [isSimulating, isPaused]);

  const hospitalIcon = useMemo(() => {
    return L.divIcon({
      className: 'leaflet-custom-div-icon',
      html: `
        <div class="leaflet-hospital-pin">
          <span style="font-size: 18px;">🏥</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, []);

  const getIntersectionIcon = (nodeId: string) => {
    const alert = alerts.find((a) => a.intersectionId === nodeId);
    let color = '#2B3A50';
    let text = '🚦';

    if (alert) {
      if (alert.status === 'Pending') {
        color = '#F59E0B';
        text = '⚠️';
      } else if (alert.status === 'Acknowledged' || alert.status === 'In Progress') {
        color = '#38BDF8';
        text = '👮';
      } else if (alert.status === 'Cleared') {
        color = '#22C55E';
        text = '🟢';
      }
    }

    return L.divIcon({
      className: 'leaflet-custom-div-icon',
      html: `
        <div class="leaflet-intersection-pin" style="border-color: ${color};">
          <span style="font-size: 14px;">${text}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const statusLabel = currentJourney ? currentJourney.status : 'Idle';

  return (
    <div className="route-tracker-container">
      {/* Header & Status */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>🗺️ Live Route Tracking & Intersection Telemetry</span>
            <span className={`badge ${statusLabel === 'En Route' ? 'badge-emergency pulse-emergency' : statusLabel === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
              {statusLabel}
            </span>
          </h1>
          <p className="page-subtitle">
            Simulated arterial corridor progression with automated advance alert triggers
          </p>
        </div>

        {/* Quick Map Controls */}
        <div className="route-header-controls">
          <div className="map-mode-toggle">
            <button
              type="button"
              className={`btn-sm ${mapMode === 'leaflet' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMapMode('leaflet')}
            >
              OSM Map
            </button>
            <button
              type="button"
              className={`btn-sm ${mapMode === 'schematic' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMapMode('schematic')}
            >
              Schematic Vector
            </button>
          </div>

          <Link to="/officer" className="btn-warning btn-sm">
            <span>Open Officer Feed ({alerts.filter((a) => a.status === 'Pending').length} Pending)</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Map on Left (Wide), Telemetry & Timeline on Right */}
      <div className="tracker-layout-grid">
        {/* Map Column */}
        <div className="tracker-map-col">
          <div className="card map-display-card">
            <div className="map-toolbar-overlay">
              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot red"></span> Unit AMB-902</span>
                <span className="legend-item"><span className="legend-dot cyan"></span> Route Corridor</span>
                <span className="legend-item"><span className="legend-dot green"></span> Cleared Intersection</span>
                <span className="legend-item"><span className="legend-dot amber"></span> Pending Alert</span>
              </div>

              <div className="map-speed-controls">
                <span className="label" style={{ marginBottom: 0, fontSize: '0.72rem' }}>Speed:</span>
                {([1, 2, 4] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    className={`btn-sm ${simSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => setSimSpeed(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Map Body: Leaflet or Schematic Fallback */}
            <div className="map-viewport-wrapper">
              {mapMode === 'leaflet' ? (
                <MapContainer
                  center={[currentPoint.lat, currentPoint.lng]}
                  zoom={15}
                  scrollWheelZoom={true}
                  className="leaflet-full-container"
                >
                  <MapController center={[currentPoint.lat, currentPoint.lng]} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Route Polyline */}
                  <Polyline
                    positions={DEMO_ROUTE.map((p) => [p.lat, p.lng])}
                    color="#38BDF8"
                    weight={5}
                    opacity={0.85}
                  />

                  {/* Intersection Markers */}
                  {INTERSECTION_NODES.map((node) => {
                    const alert = alerts.find((a) => a.intersectionId === node.id);
                    return (
                      <Marker
                        key={node.id}
                        position={[node.lat, node.lng]}
                        icon={getIntersectionIcon(node.id)}
                      >
                        <Popup>
                          <div style={{ color: '#111827', padding: '4px' }}>
                            <strong>{node.name}</strong>
                            <p style={{ margin: '4px 0', fontSize: '12px' }}>{node.crossStreet}</p>
                            <p style={{ margin: '2px 0', fontSize: '11px', color: '#4B5563' }}>
                              Status: {alert ? alert.status : 'Standby (Pre-approach)'}
                            </p>
                            <p style={{ margin: '2px 0', fontSize: '11px', color: '#4B5563' }}>
                              Assigned: {node.officerAssigned}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Ambulance Marker */}
                  <Marker position={[currentPoint.lat, currentPoint.lng]} icon={ambulanceIcon}>
                    <Popup>
                      <div style={{ color: '#111827', padding: '4px' }}>
                        <strong>🚑 Ambulance AMB-902</strong>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>
                          Current: {currentPoint.name || 'En Route'}
                        </p>
                        <p style={{ margin: '2px 0', fontSize: '11px', color: '#EF4444', fontWeight: 'bold' }}>
                          {currentJourney ? currentJourney.priority : 'Emergency'} Transit
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination Hospital Marker */}
                  <Marker position={[hospitalPoint.lat, hospitalPoint.lng]} icon={hospitalIcon}>
                    <Popup>
                      <div style={{ color: '#111827', padding: '4px' }}>
                        <strong>🏥 {selectedHospital?.name || 'Trauma Center'}</strong>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>Emergency Bay Arrival Point</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                /* Built-in Schematic Vector Grid Map */
                <div className="schematic-vector-map">
                  <div className="schematic-grid-pattern"></div>
                  <div className="schematic-corridor-line"></div>

                  {/* Progress Line */}
                  <div
                    className="schematic-active-line"
                    style={{ width: `${progressPercent}%` }}
                  ></div>

                  {/* Node Pins on Vector Map */}
                  {INTERSECTION_NODES.map((node) => {
                    const alert = alerts.find((a) => a.intersectionId === node.id);
                    const positionPercent = Math.round((node.routeIndex / (DEMO_ROUTE.length - 1)) * 100);
                    let color = '#2B3A50';
                    let label = 'Standby';

                    if (alert) {
                      label = alert.status;
                      if (alert.status === 'Pending') color = 'var(--color-warning)';
                      if (alert.status === 'Acknowledged' || alert.status === 'In Progress') color = 'var(--color-primary)';
                      if (alert.status === 'Cleared') color = 'var(--color-success)';
                    }

                    return (
                      <div
                        key={node.id}
                        className="schematic-node-pin"
                        style={{ left: `${positionPercent}%`, borderColor: color }}
                        title={`${node.name} - ${label}`}
                      >
                        <span className="sc-node-icon">🚦</span>
                        <div className="sc-node-tooltip">
                          <strong>{node.name}</strong>
                          <span>{label}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Ambulance Marker */}
                  <div
                    className="schematic-ambulance-marker pulse-emergency"
                    style={{ left: `${progressPercent}%` }}
                  >
                    <span>🚑</span>
                    <div className="sc-amb-label">AMB-902</div>
                  </div>

                  {/* Destination Marker */}
                  <div className="schematic-hospital-marker" style={{ right: '0%' }}>
                    <span>🏥</span>
                    <div className="sc-hosp-label">{selectedHospital?.name.split(' ')[0] || 'Hospital'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Footer Bar with Primary Simulation Controls */}
            <div className="map-controls-footer">
              <div className="footer-control-actions">
                {statusLabel === 'Idle' || statusLabel === 'Completed' ? (
                  <button type="button" className="btn-emergency" onClick={() => startEmergency()}>
                    <span>🚨 Start Route Run</span>
                  </button>
                ) : statusLabel === 'En Route' ? (
                  <button type="button" className="btn-warning" onClick={() => pauseSimulation()}>
                    <span>⏸️ Pause Movement</span>
                  </button>
                ) : statusLabel === 'Paused' ? (
                  <button type="button" className="btn-primary" onClick={() => resumeSimulation()}>
                    <span>▶️ Resume Movement</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => advanceRouteStep()}
                  disabled={statusLabel !== 'En Route' && statusLabel !== 'Paused'}
                  title="Advance 1 step along the route manually"
                >
                  <span>Step Forward ⏭️</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => endJourney()}
                  disabled={!currentJourney || statusLabel === 'Completed'}
                >
                  <span>End Journey</span>
                </button>
              </div>

              <div className="route-progress-indicator">
                <span className="rp-label">Progress:</span>
                <div className="rp-track">
                  <div className="rp-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="rp-percent">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column: Telemetry & Live Timeline */}
        <div className="tracker-sidebar-col">
          {/* Real-Time Telemetry Metrics Card */}
          <div className="card">
            <h2 className="card-title">
              <span>📡 Run Telemetry</span>
            </h2>

            <div className="sidebar-metrics-list">
              <div className="sb-metric-row">
                <span className="sbm-label">Destination Facility</span>
                <span className="sbm-val text-cyan">{selectedHospital?.name || 'General Trauma Center'}</span>
              </div>
              <div className="sb-metric-row">
                <span className="sbm-label">Current Waypoint</span>
                <span className="sbm-val">{currentPoint.name}</span>
              </div>
              <div className="sb-metric-row">
                <span className="sbm-label">Remaining Distance</span>
                <span className="sbm-val">
                  {currentJourney ? `${currentJourney.distanceRemainingMetres} m` : '3,400 m'}
                </span>
              </div>
              <div className="sb-metric-row">
                <span className="sbm-label">Simulated Arrival ETA</span>
                <span className="sbm-val text-amber">
                  {statusLabel === 'Completed'
                    ? '0 min (Arrived)'
                    : currentJourney
                    ? `${Math.max(1, Math.round(currentJourney.distanceRemainingMetres / 500))} min`
                    : '8 min'}
                </span>
              </div>
              <div className="sb-metric-row">
                <span className="sbm-label">Active Alerts Dispatched</span>
                <span className="sbm-val">{alerts.length}</span>
              </div>
            </div>
          </div>

          {/* Active Intersection Alerts List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>
                <span>🚦 Corridor Alerts</span>
              </h2>
              <Link to="/officer" className="btn-sm btn-outline-cyan">
                Officer Terminal →
              </Link>
            </div>

            {alerts.length === 0 ? (
              <p className="empty-state-text">
                No alerts dispatched yet. Advance the ambulance toward upcoming intersections to trigger automatic advance warnings.
              </p>
            ) : (
              <div className="sidebar-alerts-list">
                {alerts.map((al) => (
                  <div key={al.id} className={`sidebar-alert-card status-${al.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="sal-header">
                      <strong className="sal-name">{al.intersection}</strong>
                      <span className={`badge ${al.status === 'Pending' ? 'badge-warning' : al.status === 'Cleared' ? 'badge-success' : 'badge-cyan'}`}>
                        {al.status}
                      </span>
                    </div>
                    <span className="sal-meta">ETA: ~{al.etaSeconds}s • {al.distanceMetres}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Journey Event Stream */}
          <div className="card">
            <h2 className="card-title">
              <span>⏱️ Event Timeline</span>
            </h2>

            {currentJourney && currentJourney.timelineEvents.length > 0 ? (
              <div className="timeline-container">
                {currentJourney.timelineEvents.slice(-6).reverse().map((evt) => (
                  <div key={evt.id} className={`timeline-entry ${evt.type}`}>
                    <span className="timeline-time">{evt.time}</span>
                    <span className="timeline-text">{evt.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state-text">No active telemetry stream.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
