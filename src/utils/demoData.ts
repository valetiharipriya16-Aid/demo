// src/utils/demoData.ts

export interface DemoPoint {
  lat: number;
  lng: number;
  name?: string;
  speedLimitKmh?: number;
}

export interface IntersectionNode {
  id: string;
  name: string;
  crossStreet: string;
  routeIndex: number;
  lat: number;
  lng: number;
  lanes: string;
  officerAssigned: string;
  cameraAvailable: boolean;
}

// Realistic urban route path with 14 coordinates traversing key arterial intersections
export const DEMO_ROUTE: DemoPoint[] = [
  { lat: 37.7749, lng: -122.4194, name: 'Dispatch Point (Civic Center)' },   // 0
  { lat: 37.7758, lng: -122.4178, name: 'Market St Approach' },             // 1
  { lat: 37.7766, lng: -122.4162, name: 'Market St & 7th St' },              // 2 - Intersection 1
  { lat: 37.7774, lng: -122.4146, name: 'Market Mid-Corridor' },            // 3
  { lat: 37.7782, lng: -122.4130, name: 'Market St & 5th St' },              // 4 - Intersection 2
  { lat: 37.7791, lng: -122.4114, name: 'Downtown Junction' },              // 5
  { lat: 37.7802, lng: -122.4095, name: 'Mission St & 4th St' },             // 6 - Intersection 3
  { lat: 37.7812, lng: -122.4076, name: 'Arterial Bypass' },                // 7
  { lat: 37.7824, lng: -122.4055, name: 'Folsom St & 2nd St' },              // 8 - Intersection 4
  { lat: 37.7836, lng: -122.4034, name: 'Embarcadero Expressway' },         // 9
  { lat: 37.7848, lng: -122.4012, name: 'Medical Center Access Ramp' },      // 10
  { lat: 37.7859, lng: -122.3992, name: 'Hospital Perimeter Ave' },          // 11
  { lat: 37.7870, lng: -122.3975, name: 'Emergency Bay Entrance' },          // 12
  { lat: 37.7882, lng: -122.3958, name: 'General Trauma ER Receiving Bay' }, // 13 - Final Destination
];

// Defined intersections along the route that trigger advance alerts
export const INTERSECTION_NODES: IntersectionNode[] = [
  {
    id: 'INT-01',
    name: 'Market St & 7th St',
    crossStreet: '7th Street Arterial',
    routeIndex: 2,
    lat: 37.7766,
    lng: -122.4162,
    lanes: '4 Lanes (2 East, 2 West) + Transit Lane',
    officerAssigned: 'Officer R. Davis (Post 12)',
    cameraAvailable: true,
  },
  {
    id: 'INT-02',
    name: 'Market St & 5th St',
    crossStreet: '5th Street Commercial Corridor',
    routeIndex: 4,
    lat: 37.7802,
    lng: -122.4095,
    lanes: '6 Lanes with Light Rail crossing',
    officerAssigned: 'Officer S. Chen (Post 19)',
    cameraAvailable: true,
  },
  {
    id: 'INT-03',
    name: 'Mission St & 4th St',
    crossStreet: '4th Street Transit Hub',
    routeIndex: 6,
    lat: 37.7802,
    lng: -122.4095,
    lanes: '4 Lanes Dual Direction',
    officerAssigned: 'Officer M. Taylor (Post 24)',
    cameraAvailable: true,
  },
  {
    id: 'INT-04',
    name: 'Folsom St & 2nd St',
    crossStreet: '2nd Street Bay Link',
    routeIndex: 8,
    lat: 37.7824,
    lng: -122.4055,
    lanes: '3 Lanes One-Way Express',
    officerAssigned: 'Officer K. Patel (Post 31)',
    cameraAvailable: true,
  },
];

// Demo Seed Hospitals with rich simulated capabilities & availability
export interface DemoHospital {
  id: string;
  name: string;
  address: string;
  capabilities: string[];
  travelTimeMin: number;
  distanceKm: number;
  availableBeds: number;
  capacityStatus: 'High Availability' | 'Moderate' | 'Near Capacity';
  verified: boolean;
  phone: string;
  coordinates: { lat: number; lng: number };
  notes: string;
}

export const DEMO_HOSPITALS: DemoHospital[] = [
  {
    id: 'h1',
    name: 'Bay Area Trauma & Surgical Center',
    address: '1001 Potrero Ave, San Francisco, CA',
    capabilities: ['Trauma Level 1', 'Emergency Surgery', 'Cardiac Resuscitation', 'Helipad', 'Critical ICU'],
    travelTimeMin: 8,
    distanceKm: 3.4,
    availableBeds: 6,
    capacityStatus: 'High Availability',
    verified: true,
    phone: '+1 (415) 555-0192',
    coordinates: { lat: 37.7882, lng: -122.3958 },
    notes: 'Primary Level 1 Trauma Center with 24/7 designated surgical team.',
  },
  {
    id: 'h2',
    name: 'City Cardiology & Comprehensive Stroke Institute',
    address: '505 Parnassus Ave, San Francisco, CA',
    capabilities: ['Cardiac Cath Lab', 'Comprehensive Stroke Center', 'Neuro ICU', 'Emergency Surgery'],
    travelTimeMin: 12,
    distanceKm: 5.1,
    availableBeds: 4,
    capacityStatus: 'Moderate',
    verified: true,
    phone: '+1 (415) 555-0388',
    coordinates: { lat: 37.7635, lng: -122.4578 },
    notes: 'Certified STEMI Receiving Center with active neurovascular lab.',
  },
  {
    id: 'h3',
    name: 'St. Jude Emergency & Pediatric Pavilion',
    address: '1101 Van Ness Ave, San Francisco, CA',
    capabilities: ['Pediatric Trauma', 'Emergency ICU', 'Specialized Burn Unit', 'Neonatal Support'],
    travelTimeMin: 14,
    distanceKm: 4.8,
    availableBeds: 2,
    capacityStatus: 'Near Capacity',
    verified: true,
    phone: '+1 (415) 555-0451',
    coordinates: { lat: 37.7851, lng: -122.4214 },
    notes: 'Specialized for pediatric emergencies and severe pediatric trauma.',
  },
  {
    id: 'h4',
    name: 'Pacific Regional Medical Annex',
    address: '2350 Geary Blvd, San Francisco, CA',
    capabilities: ['Trauma Level 2', 'Urgent Medical', 'Orthopedics', 'General Emergency'],
    travelTimeMin: 17,
    distanceKm: 6.9,
    availableBeds: 8,
    capacityStatus: 'High Availability',
    verified: false,
    phone: '+1 (415) 555-0720',
    coordinates: { lat: 37.7830, lng: -122.4430 },
    notes: 'Simulated secondary facility. Real-time telemetry pending synchronization.',
  },
  {
    id: 'h5',
    name: 'Civic Urgent & Dental Emergency Clinic',
    address: '450 Sutter St, San Francisco, CA',
    capabilities: ['Dental Emergency', 'Maxillofacial Urgent Care', 'Minor Trauma'],
    travelTimeMin: 9,
    distanceKm: 2.8,
    availableBeds: 5,
    capacityStatus: 'High Availability',
    verified: false,
    phone: '+1 (415) 555-0914',
    coordinates: { lat: 37.7895, lng: -122.4070 },
    notes: 'Daytime urgent center. Not equipped for code-blue or severe vehicular trauma.',
  },
];

// Seeded Journey records for Journey Summary & History
export interface SeedJourneyRecord {
  id: string;
  ambulanceId: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  hospitalName: string;
  startLocation: string;
  endLocation: string;
  status: 'Completed' | 'Active' | 'Cancelled';
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  intersectionsAlerted: number;
  intersectionsCleared: number;
  averageClearanceTimeSec: number;
  isSeededDemo: boolean;
}

export const SEEDED_JOURNEYS: SeedJourneyRecord[] = [
  {
    id: 'JRN-2026-081',
    ambulanceId: 'MEDIC-44',
    category: 'Cardiac Emergency (STEMI)',
    priority: 'Critical',
    hospitalName: 'City Cardiology & Comprehensive Stroke Institute',
    startLocation: 'Financial District (Pine & Montgomery)',
    endLocation: 'Cardiology Bay 1',
    status: 'Completed',
    startedAt: 'Today, 06:42 AM',
    completedAt: 'Today, 06:53 AM',
    durationMinutes: 11,
    intersectionsAlerted: 4,
    intersectionsCleared: 4,
    averageClearanceTimeSec: 28,
    isSeededDemo: true,
  },
  {
    id: 'JRN-2026-079',
    ambulanceId: 'RESCUE-12',
    category: 'Major Road Accident',
    priority: 'Critical',
    hospitalName: 'Bay Area Trauma & Surgical Center',
    startLocation: 'Hwy 101 South Ramp',
    endLocation: 'Trauma Bay 3',
    status: 'Completed',
    startedAt: 'Yesterday, 19:15 PM',
    completedAt: 'Yesterday, 19:27 PM',
    durationMinutes: 12,
    intersectionsAlerted: 5,
    intersectionsCleared: 5,
    averageClearanceTimeSec: 34,
    isSeededDemo: true,
  },
  {
    id: 'JRN-2026-077',
    ambulanceId: 'MEDIC-09',
    category: 'Pediatric Acute Respiratory',
    priority: 'High',
    hospitalName: 'St. Jude Emergency & Pediatric Pavilion',
    startLocation: 'Mission District (24th & Valencia)',
    endLocation: 'Pediatric Triage',
    status: 'Completed',
    startedAt: 'Yesterday, 14:05 PM',
    completedAt: 'Yesterday, 14:18 PM',
    durationMinutes: 13,
    intersectionsAlerted: 3,
    intersectionsCleared: 3,
    averageClearanceTimeSec: 41,
    isSeededDemo: true,
  },
];
