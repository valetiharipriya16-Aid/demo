// src/store/useAppStore.ts
import { create } from 'zustand';
import {
  DEMO_HOSPITALS,
  type DemoHospital,
  DEMO_ROUTE,
  INTERSECTION_NODES,
  SEEDED_JOURNEYS,
  type SeedJourneyRecord,
} from '../utils/demoData';

export type AlertStatus = 'Pending' | 'Acknowledged' | 'In Progress' | 'Cleared';
export type JourneyStatus = 'Idle' | 'En Route' | 'Paused' | 'Completed' | 'Cancelled';
export type PriorityLevel = 'Critical' | 'High' | 'Medium';

export interface AlertHistoryEntry {
  time: string;
  action: string;
  actor: string;
}

export interface Alert {
  id: string;
  intersectionId: string;
  intersection: string;
  crossStreet: string;
  ambulanceId: string;
  etaSeconds: number;
  distanceMetres: number;
  priority: PriorityLevel;
  status: AlertStatus;
  createdAt: string;
  history: AlertHistoryEntry[];
  recommendedAction: string;
  routeIndex: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'alert' | 'success' | 'warning';
}

export interface ActiveJourney {
  id: string;
  ambulanceId: string;
  category: string;
  priority: PriorityLevel;
  hospital: DemoHospital;
  status: JourneyStatus;
  startedAt: string;
  completedAt?: string;
  durationMinutes: number;
  distanceTotalMetres: number;
  distanceRemainingMetres: number;
  timelineEvents: TimelineEvent[];
}

export interface UserProfile {
  name: string;
  callsign: string;
  role: 'operator' | 'officer';
  badgeOrUnit: string;
  sector: string;
}

interface AppState {
  // Roles & Profiles
  activeRole: 'operator' | 'officer';
  setActiveRole: (role: 'operator' | 'officer') => void;
  operatorProfile: UserProfile;
  officerProfile: UserProfile;

  // Emergency Configuration
  emergencyCategory: string;
  setEmergencyCategory: (cat: string) => void;
  priority: PriorityLevel;
  setPriority: (p: PriorityLevel) => void;
  ambulanceId: string;

  // Hospitals
  hospitals: DemoHospital[];
  selectedHospital: DemoHospital | null;
  setSelectedHospital: (h: DemoHospital) => void;

  // Active Journey
  currentJourney: ActiveJourney | null;
  startEmergency: () => boolean;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  endJourney: () => void;
  advanceRouteStep: () => void;

  // Route Simulation
  routeIndex: number;
  isSimulating: boolean;
  isPaused: boolean;
  simSpeed: 1 | 2 | 4;
  setSimSpeed: (speed: 1 | 2 | 4) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (a: Alert) => void;
  updateAlertStatus: (id: string, status: AlertStatus, actor?: string) => void;

  // Settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  mapStyle: 'osm-dark' | 'schematic-grid';
  setMapStyle: (style: 'osm-dark' | 'schematic-grid') => void;

  // Journey History
  history: SeedJourneyRecord[];
  
  // Safe Reset
  resetDemo: () => void;
}

const getCurrentTimeString = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const useAppStore = create<AppState>((set, get) => ({
  activeRole: 'operator',
  setActiveRole: (role) => set({ activeRole: role }),

  operatorProfile: {
    name: 'Elena Rostova',
    callsign: 'DISPATCH-CONTROL-1',
    role: 'operator',
    badgeOrUnit: 'Unit AMB-902 Dispatcher',
    sector: 'Central Emergency Operations Center (EOC)',
  },

  officerProfile: {
    name: 'Officer David Miller',
    callsign: 'TRAFFIC-POST-7',
    role: 'officer',
    badgeOrUnit: 'Badge #4188 - SFPD Traffic Command',
    sector: 'Market Corridor Sectors 1-4',
  },

  emergencyCategory: 'Major Road Accident',
  setEmergencyCategory: (cat) => set({ emergencyCategory: cat }),
  priority: 'Critical',
  setPriority: (p) => set({ priority: p }),
  ambulanceId: 'AMB-902 (ALS Mobile Intensive Unit)',

  hospitals: DEMO_HOSPITALS,
  selectedHospital: DEMO_HOSPITALS[0], // default to Bay Area Trauma & Surgical Center
  setSelectedHospital: (h) => {
    set({ selectedHospital: h });
    const { currentJourney } = get();
    if (currentJourney && currentJourney.status !== 'Completed') {
      set({
        currentJourney: {
          ...currentJourney,
          hospital: h,
          timelineEvents: [
            ...currentJourney.timelineEvents,
            {
              id: `evt-${Date.now()}`,
              time: getCurrentTimeString(),
              text: `Destination hospital updated to ${h.name}`,
              type: 'info',
            },
          ],
        },
      });
    }
  },

  currentJourney: null,
  routeIndex: 0,
  isSimulating: false,
  isPaused: false,
  simSpeed: 1,
  setSimSpeed: (speed) => set({ simSpeed: speed }),

  alerts: [],

  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  mapStyle: 'osm-dark',
  setMapStyle: (style) => set({ mapStyle: style }),

  history: SEEDED_JOURNEYS,

  startEmergency: () => {
    const { selectedHospital, emergencyCategory, priority, ambulanceId } = get();
    if (!selectedHospital) return false;

    const journeyId = `JRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = getCurrentTimeString();

    const newJourney: ActiveJourney = {
      id: journeyId,
      ambulanceId: ambulanceId.split(' ')[0],
      category: emergencyCategory,
      priority,
      hospital: selectedHospital,
      status: 'En Route',
      startedAt: nowStr,
      durationMinutes: 0,
      distanceTotalMetres: 3400,
      distanceRemainingMetres: 3400,
      timelineEvents: [
        {
          id: `evt-${Date.now()}-1`,
          time: nowStr,
          text: `🚨 Emergency dispatch activated for ${emergencyCategory} (${priority} Priority). Destination: ${selectedHospital.name}`,
          type: 'alert',
        },
        {
          id: `evt-${Date.now()}-2`,
          time: nowStr,
          text: `Ambulance ${ambulanceId.split(' ')[0]} en route from Civic Center staging. AI Route Pre-clearance initialized.`,
          type: 'info',
        },
      ],
    };

    set({
      currentJourney: newJourney,
      routeIndex: 0,
      isSimulating: true,
      isPaused: false,
      alerts: [], // fresh alerts for new journey
    });

    return true;
  },

  pauseSimulation: () => {
    const { currentJourney } = get();
    if (!currentJourney || currentJourney.status !== 'En Route') return;

    set({
      isPaused: true,
      currentJourney: {
        ...currentJourney,
        status: 'Paused',
        timelineEvents: [
          ...currentJourney.timelineEvents,
          {
            id: `evt-${Date.now()}`,
            time: getCurrentTimeString(),
            text: 'Simulation paused by operator.',
            type: 'warning',
          },
        ],
      },
    });
  },

  resumeSimulation: () => {
    const { currentJourney } = get();
    if (!currentJourney || currentJourney.status !== 'Paused') return;

    set({
      isPaused: false,
      currentJourney: {
        ...currentJourney,
        status: 'En Route',
        timelineEvents: [
          ...currentJourney.timelineEvents,
          {
            id: `evt-${Date.now()}`,
            time: getCurrentTimeString(),
            text: 'Simulation resumed by operator.',
            type: 'info',
          },
        ],
      },
    });
  },

  advanceRouteStep: () => {
    const { routeIndex, isSimulating, isPaused, currentJourney, alerts, priority } = get();
    if (!isSimulating || isPaused || !currentJourney) return;

    const nextIndex = routeIndex + 1;
    const totalPoints = DEMO_ROUTE.length;
    const progressRatio = nextIndex / (totalPoints - 1);
    const distanceRemaining = Math.max(0, Math.round(3400 * (1 - progressRatio)));
    const durationMinutes = Math.min(8, Math.round(progressRatio * 8));

    // Check if an intersection node triggers an advance alert
    // Alerts trigger when the ambulance is 1 step before or at the intersection
    let updatedAlerts = [...alerts];
    let newEvents: TimelineEvent[] = [];

    INTERSECTION_NODES.forEach((node) => {
      // Trigger alert when ambulance reaches (node.routeIndex - 1)
      if (nextIndex === Math.max(0, node.routeIndex - 1)) {
        const alreadyExists = updatedAlerts.some((a) => a.intersectionId === node.id);
        if (!alreadyExists) {
          const nowStr = getCurrentTimeString();
          const alertId = `ALT-${100 + updatedAlerts.length + 1}`;
          const newAlert: Alert = {
            id: alertId,
            intersectionId: node.id,
            intersection: node.name,
            crossStreet: node.crossStreet,
            ambulanceId: currentJourney.ambulanceId,
            etaSeconds: 90,
            distanceMetres: 450,
            priority,
            status: 'Pending',
            createdAt: nowStr,
            history: [
              {
                time: nowStr,
                action: 'Advance Intersection Alert Broadcasted to Sector Post',
                actor: 'ClearPath Route AI Engine',
              },
            ],
            recommendedAction: `Hold cross-traffic on ${node.crossStreet}. Open clear green corridor for inbound emergency unit.`,
            routeIndex: node.routeIndex,
          };

          updatedAlerts.push(newAlert);
          newEvents.push({
            id: `evt-${Date.now()}-${node.id}`,
            time: nowStr,
            text: `⚠️ Advance Alert dispatched for ${node.name} (${node.officerAssigned}). Approaching at 450m.`,
            type: 'alert',
          });
        }
      }
    });

    // Check if destination reached
    if (nextIndex >= totalPoints - 1) {
      const nowStr = getCurrentTimeString();
      const completedJourney: ActiveJourney = {
        ...currentJourney,
        status: 'Completed',
        completedAt: nowStr,
        durationMinutes: 8,
        distanceRemainingMetres: 0,
        timelineEvents: [
          ...currentJourney.timelineEvents,
          ...newEvents,
          {
            id: `evt-${Date.now()}-dest`,
            time: nowStr,
            text: `🏁 Ambulance safely arrived at ${currentJourney.hospital.name}. Patient transfer in progress. Journey completed.`,
            type: 'success',
          },
        ],
      };

      // Add to session history
      const newHistoryRecord: SeedJourneyRecord = {
        id: currentJourney.id,
        ambulanceId: currentJourney.ambulanceId,
        category: currentJourney.category,
        priority: currentJourney.priority,
        hospitalName: currentJourney.hospital.name,
        startLocation: 'Civic Center (Staging Point)',
        endLocation: `${currentJourney.hospital.name} ER Bay`,
        status: 'Completed',
        startedAt: `Today, ${currentJourney.startedAt}`,
        completedAt: `Today, ${nowStr}`,
        durationMinutes: 8,
        intersectionsAlerted: updatedAlerts.length,
        intersectionsCleared: updatedAlerts.filter((a) => a.status === 'Cleared').length,
        averageClearanceTimeSec: 26,
        isSeededDemo: false,
      };

      set({
        routeIndex: totalPoints - 1,
        isSimulating: false,
        isPaused: false,
        currentJourney: completedJourney,
        alerts: updatedAlerts,
        history: [newHistoryRecord, ...get().history],
      });
      return;
    }

    set({
      routeIndex: nextIndex,
      alerts: updatedAlerts,
      currentJourney: {
        ...currentJourney,
        distanceRemainingMetres: distanceRemaining,
        durationMinutes,
        timelineEvents: [...currentJourney.timelineEvents, ...newEvents],
      },
    });
  },

  endJourney: () => {
    const { currentJourney, alerts, history } = get();
    if (!currentJourney || currentJourney.status === 'Completed') return;

    const nowStr = getCurrentTimeString();
    const completedJourney: ActiveJourney = {
      ...currentJourney,
      status: 'Completed',
      completedAt: nowStr,
      durationMinutes: Math.max(1, currentJourney.durationMinutes),
      distanceRemainingMetres: 0,
      timelineEvents: [
        ...currentJourney.timelineEvents,
        {
          id: `evt-${Date.now()}-end`,
          time: nowStr,
          text: `Journey manually finalized by operator. Summary archived to Journey History.`,
          type: 'info',
        },
      ],
    };

    const newHistoryRecord: SeedJourneyRecord = {
      id: currentJourney.id,
      ambulanceId: currentJourney.ambulanceId,
      category: currentJourney.category,
      priority: currentJourney.priority,
      hospitalName: currentJourney.hospital.name,
      startLocation: 'Civic Center (Staging Point)',
      endLocation: `${currentJourney.hospital.name} ER Bay`,
      status: 'Completed',
      startedAt: `Today, ${currentJourney.startedAt}`,
      completedAt: `Today, ${nowStr}`,
      durationMinutes: Math.max(1, currentJourney.durationMinutes),
      intersectionsAlerted: alerts.length,
      intersectionsCleared: alerts.filter((a) => a.status === 'Cleared').length,
      averageClearanceTimeSec: 29,
      isSeededDemo: false,
    };

    set({
      isSimulating: false,
      isPaused: false,
      currentJourney: completedJourney,
      history: [newHistoryRecord, ...history],
    });
  },

  addAlert: (a) => set((state) => ({ alerts: [...state.alerts, a] })),

  updateAlertStatus: (id, newStatus, actor) => {
    const { alerts, currentJourney, officerProfile } = get();
    const nowStr = getCurrentTimeString();
    const actorName = actor || officerProfile.name;

    const targetAlert = alerts.find((a) => a.id === id);
    if (!targetAlert) return;

    // Transition validation
    // Pending -> Acknowledged -> In Progress -> Cleared
    const updatedAlerts = alerts.map((al) => {
      if (al.id !== id) return al;

      let actionText = '';
      if (newStatus === 'Acknowledged') {
        actionText = `Officer acknowledged inbound unit. Preparing corridor.`;
      } else if (newStatus === 'In Progress') {
        actionText = `Traffic signals held. Stopping opposing lanes on ${al.crossStreet}.`;
      } else if (newStatus === 'Cleared') {
        actionText = `Intersection 100% clear. Green wave verified.`;
      }

      return {
        ...al,
        status: newStatus,
        history: [
          ...al.history,
          {
            time: nowStr,
            action: actionText,
            actor: actorName,
          },
        ],
      };
    });

    let updatedEvents = currentJourney ? [...currentJourney.timelineEvents] : [];
    if (currentJourney) {
      updatedEvents.push({
        id: `evt-${Date.now()}-${id}`,
        time: nowStr,
        text: `🚦 [${targetAlert.intersection}] Status updated to ${newStatus} by ${actorName}`,
        type: newStatus === 'Cleared' ? 'success' : 'info',
      });
    }

    set({
      alerts: updatedAlerts,
      currentJourney: currentJourney
        ? {
            ...currentJourney,
            timelineEvents: updatedEvents,
          }
        : null,
    });
  },

  resetDemo: () => {
    set({
      activeRole: 'operator',
      emergencyCategory: 'Major Road Accident',
      priority: 'Critical',
      selectedHospital: DEMO_HOSPITALS[0],
      currentJourney: null,
      routeIndex: 0,
      isSimulating: false,
      isPaused: false,
      simSpeed: 1,
      alerts: [],
      history: SEEDED_JOURNEYS,
    });
  },
}));
