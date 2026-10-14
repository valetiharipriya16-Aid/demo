// src/pages/HospitalSelection.tsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { DemoHospital } from '../utils/demoData';
import './HospitalSelection.css';

export default function HospitalSelection() {
  const navigate = useNavigate();
  const hospitals = useAppStore((s) => s.hospitals);
  const selectedHospital = useAppStore((s) => s.selectedHospital);
  const setSelectedHospital = useAppStore((s) => s.setSelectedHospital);
  const emergencyCategory = useAppStore((s) => s.emergencyCategory);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapabilityFilter, setSelectedCapabilityFilter] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<string>('All');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  // Extract all unique capabilities for filter pills
  const allCapabilities = [
    'All',
    'Trauma Level 1',
    'Cardiac Cath Lab',
    'Pediatric Trauma',
    'Comprehensive Stroke Center',
    'Emergency Surgery',
    'Specialized Burn Unit',
    'Dental Emergency',
  ];

  // Sanitized & Memoized Filtering for Security & Efficiency
  const sanitizedQuery = searchQuery.replace(/[<>]/g, '').trim().toLowerCase();
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        !sanitizedQuery ||
        h.name.toLowerCase().includes(sanitizedQuery) ||
        h.address.toLowerCase().includes(sanitizedQuery) ||
        h.capabilities.some((c) => c.toLowerCase().includes(sanitizedQuery));

      const matchesCapability =
        selectedCapabilityFilter === 'All' ||
        h.capabilities.some((c) => c.toLowerCase().includes(selectedCapabilityFilter.toLowerCase()));

      const matchesCapacity =
        capacityFilter === 'All' || h.capacityStatus === capacityFilter;

      return matchesSearch && matchesCapability && matchesCapacity;
    });
  }, [hospitals, sanitizedQuery, selectedCapabilityFilter, capacityFilter]);

  const handleSelectHospital = (h: DemoHospital) => {
    setSelectedHospital(h);
    setSelectionNotice(`Destination set to ${h.name}. Telemetry route synchronized.`);
    setTimeout(() => {
      setSelectionNotice(null);
    }, 4000);
  };

  return (
    <div className="hospital-selection-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>🏥 Hospital Destination Directory</span>
            <span className="badge badge-cyan">Simulated Capacity Telemetry</span>
          </h1>
          <p className="page-subtitle">
            Targeting specialty receiving facilities for active emergency: <strong>{emergencyCategory}</strong>
          </p>
        </div>

        <div className="header-navigation-actions">
          <Link to="/operator" className="btn-secondary">
            ← Operator Dashboard
          </Link>
          <Link to="/track" className="btn-primary">
            View on Live Map →
          </Link>
        </div>
      </div>

      {/* Demo Warning / Notice */}
      <div className="demo-disclaimer">
        <span>⚠️ All hospital bed availability, cath lab readiness, and trauma capacities shown below are simulated for hackathon demonstration. Real-world systems require state-level EMResource API synchronization.</span>
      </div>

      {selectionNotice && (
        <div className="card-selection-toast">
          <span>✅ {selectionNotice}</span>
          <button type="button" className="btn-sm btn-outline-cyan" onClick={() => navigate('/operator')}>
            Back to Operator Console
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="card filter-toolbar-card">
        <div className="toolbar-top">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by hospital name, address, or medical specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className="filter-select-group">
            <select
              aria-label="Filter by Capacity"
              className="select"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="All">All Capacity Statuses</option>
              <option value="High Availability">High Availability</option>
              <option value="Moderate">Moderate</option>
              <option value="Near Capacity">Near Capacity</option>
            </select>
          </div>
        </div>

        {/* Capability Filter Pills */}
        <div className="capability-filter-row">
          <span className="filter-row-label">Specialty:</span>
          <div className="caps-scroll-list">
            {allCapabilities.map((cap) => (
              <button
                key={cap}
                type="button"
                className={`cap-filter-pill ${selectedCapabilityFilter === cap ? 'active' : ''}`}
                onClick={() => setSelectedCapabilityFilter(cap)}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="hospitals-grid">
        {filteredHospitals.map((h) => {
          const isSelected = selectedHospital?.id === h.id;

          let badgeColor = 'badge-cyan';
          if (h.capacityStatus === 'Near Capacity') badgeColor = 'badge-warning';
          if (h.capacityStatus === 'High Availability') badgeColor = 'badge-success';

          return (
            <div key={h.id} className={`card hospital-card ${isSelected ? 'selected-card' : ''}`}>
              <div className="h-card-header">
                <div>
                  <div className="h-name-row">
                    <h3 className="h-title">{h.name}</h3>
                    {h.verified ? (
                      <span className="badge badge-success" title="Verified Primary Receiving Facility">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="badge badge-warning" title="Secondary / Unverified Facility">
                        ⚠️ Unverified
                      </span>
                    )}
                  </div>
                  <span className="h-address">📍 {h.address}</span>
                </div>

                <span className={`badge ${badgeColor}`}>{h.capacityStatus}</span>
              </div>

              {/* Metrics Row */}
              <div className="h-metrics-row">
                <div className="h-metric">
                  <span className="hm-label">Est. Travel</span>
                  <span className="hm-val text-cyan">{h.travelTimeMin} min</span>
                </div>
                <div className="h-metric">
                  <span className="hm-label">Distance</span>
                  <span className="hm-val">{h.distanceKm} km</span>
                </div>
                <div className="h-metric">
                  <span className="hm-label">Simulated ICU Beds</span>
                  <span className="hm-val text-green">{h.availableBeds} Open</span>
                </div>
              </div>

              {/* Capabilities Badges */}
              <div className="h-caps-container">
                <span className="hm-label" style={{ marginBottom: '4px', display: 'block' }}>Capabilities:</span>
                <div className="h-caps-list">
                  {h.capabilities.map((cap) => (
                    <span key={cap} className="h-cap-tag">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <p className="h-notes">{h.notes}</p>

              {/* Action Button */}
              <div className="h-card-actions">
                {isSelected ? (
                  <button type="button" className="btn-success h-action-btn" disabled>
                    <span>✓ Currently Selected Destination</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary h-action-btn"
                    onClick={() => handleSelectHospital(h)}
                  >
                    <span>Select as Route Target</span>
                  </button>
                )}

                {isSelected && (
                  <Link to="/track" className="btn-secondary h-view-btn">
                    Open Map Route →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="card empty-filter-state">
          <p>No hospitals match your current search and capability filter criteria.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCapabilityFilter('All');
              setCapacityFilter('All');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
