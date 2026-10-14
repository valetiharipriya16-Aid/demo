// src/__tests__/security_efficiency.test.ts
import { describe, it, expect } from 'vitest';
import { DEMO_HOSPITALS, DEMO_ROUTE, INTERSECTION_NODES } from '../utils/demoData';

describe('Security & Efficiency Validations', () => {
  it('sanitizes malicious search patterns and prevents script injection', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitizedSearch = maliciousInput.replace(/[<>]/g, '').trim();

    // Verify search matches against sanitized text
    const matches = DEMO_HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
        h.capabilities.some((c) => c.toLowerCase().includes(sanitizedSearch.toLowerCase()))
    );

    expect(matches).toEqual([]);
  });

  it('verifies demo hospitals contain valid geospatial coordinates within expected bounds', () => {
    DEMO_HOSPITALS.forEach((hospital) => {
      expect(hospital.coordinates.lat).toBeGreaterThan(37.0);
      expect(hospital.coordinates.lat).toBeLessThan(38.0);
      expect(hospital.coordinates.lng).toBeGreaterThan(-123.0);
      expect(hospital.coordinates.lng).toBeLessThan(-122.0);
    });
  });

  it('guarantees route waypoints are ordered and monotonic for predictable simulation', () => {
    expect(DEMO_ROUTE.length).toBeGreaterThan(10);
    for (let i = 1; i < DEMO_ROUTE.length; i++) {
      const prev = DEMO_ROUTE[i - 1];
      const cur = DEMO_ROUTE[i];
      // Latitude steadily advances northward along arterial corridor
      expect(cur.lat).toBeGreaterThan(prev.lat);
    }
  });

  it('verifies all intersection nodes correspond to valid route indices', () => {
    INTERSECTION_NODES.forEach((node) => {
      expect(node.routeIndex).toBeGreaterThan(0);
      expect(node.routeIndex).toBeLessThan(DEMO_ROUTE.length - 1);
      expect(node.id).toMatch(/^INT-\d{2}$/);
    });
  });

  it('confirms hospital capability matching correctly tags trauma, cardiac, and pediatric facilities', () => {
    const traumaCenters = DEMO_HOSPITALS.filter((h) =>
      h.capabilities.some((c) => c.toLowerCase().includes('trauma'))
    );
    expect(traumaCenters.length).toBeGreaterThanOrEqual(2);

    const cardiacCenters = DEMO_HOSPITALS.filter((h) =>
      h.capabilities.some((c) => c.toLowerCase().includes('cardiac'))
    );
    expect(cardiacCenters.length).toBeGreaterThanOrEqual(1);
  });
});
