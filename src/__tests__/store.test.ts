// src/__tests__/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { DEMO_HOSPITALS, DEMO_ROUTE, INTERSECTION_NODES } from '../utils/demoData';

describe('ClearPath CAD & Corridor State Store', () => {
  beforeEach(() => {
    useAppStore.getState().resetDemo();
  });

  it('initializes with default operator profile and baseline state', () => {
    const state = useAppStore.getState();
    expect(state.activeRole).toBe('operator');
    expect(state.emergencyCategory).toBe('Major Road Accident');
    expect(state.priority).toBe('Critical');
    expect(state.selectedHospital?.id).toBe(DEMO_HOSPITALS[0].id);
    expect(state.currentJourney).toBeNull();
    expect(state.alerts).toEqual([]);
    expect(state.routeIndex).toBe(0);
  });

  it('initiates an emergency mission and creates an active journey with unique ID', () => {
    const success = useAppStore.getState().startEmergency();
    expect(success).toBe(true);

    const state = useAppStore.getState();
    expect(state.isSimulating).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.currentJourney).not.toBeNull();
    expect(state.currentJourney?.id).toMatch(/^JRN-\d{4}-\d+/);
    expect(state.currentJourney?.status).toBe('En Route');
    expect(state.currentJourney?.timelineEvents.length).toBeGreaterThanOrEqual(2);
  });

  it('pauses and resumes active simulation safely', () => {
    useAppStore.getState().startEmergency();

    useAppStore.getState().pauseSimulation();
    expect(useAppStore.getState().isPaused).toBe(true);
    expect(useAppStore.getState().currentJourney?.status).toBe('Paused');

    useAppStore.getState().resumeSimulation();
    expect(useAppStore.getState().isPaused).toBe(false);
    expect(useAppStore.getState().currentJourney?.status).toBe('En Route');
  });

  it('triggers advance intersection alerts when ambulance approaches', () => {
    useAppStore.getState().startEmergency();

    // Advance steps until approaching first intersection node (index 1 -> node at index 2)
    useAppStore.getState().advanceRouteStep(); // Step 1

    const state = useAppStore.getState();
    expect(state.routeIndex).toBe(1);
    expect(state.alerts.length).toBeGreaterThanOrEqual(1);

    const firstAlert = state.alerts[0];
    expect(firstAlert.status).toBe('Pending');
    expect(firstAlert.intersection).toBe(INTERSECTION_NODES[0].name);
    expect(firstAlert.priority).toBe('Critical');
  });

  it('validates sequential status transitions: Pending -> Acknowledged -> In Progress -> Cleared', () => {
    useAppStore.getState().startEmergency();
    useAppStore.getState().advanceRouteStep();

    const alertId = useAppStore.getState().alerts[0].id;

    // Transition 1: Acknowledge
    useAppStore.getState().updateAlertStatus(alertId, 'Acknowledged', 'Officer David Miller');
    expect(useAppStore.getState().alerts[0].status).toBe('Acknowledged');

    // Transition 2: In Progress
    useAppStore.getState().updateAlertStatus(alertId, 'In Progress', 'Officer David Miller');
    expect(useAppStore.getState().alerts[0].status).toBe('In Progress');

    // Transition 3: Cleared
    useAppStore.getState().updateAlertStatus(alertId, 'Cleared', 'Officer David Miller');
    expect(useAppStore.getState().alerts[0].status).toBe('Cleared');
    expect(useAppStore.getState().alerts[0].history.length).toBeGreaterThanOrEqual(4);
  });

  it('completes journey and archives summary to history when destination is reached', () => {
    useAppStore.getState().startEmergency();
    const initialHistoryLength = useAppStore.getState().history.length;

    // Advance to end of route
    for (let i = 0; i < DEMO_ROUTE.length; i++) {
      useAppStore.getState().advanceRouteStep();
    }

    const state = useAppStore.getState();
    expect(state.isSimulating).toBe(false);
    expect(state.currentJourney?.status).toBe('Completed');
    expect(state.history.length).toBe(initialHistoryLength + 1);
    expect(state.history[0].status).toBe('Completed');
    expect(state.history[0].isSeededDemo).toBe(false);
  });

  it('safely restores clean default state on resetDemo()', () => {
    useAppStore.getState().startEmergency();
    useAppStore.getState().advanceRouteStep();
    useAppStore.getState().resetDemo();

    const state = useAppStore.getState();
    expect(state.currentJourney).toBeNull();
    expect(state.isSimulating).toBe(false);
    expect(state.alerts).toEqual([]);
    expect(state.routeIndex).toBe(0);
  });
});
