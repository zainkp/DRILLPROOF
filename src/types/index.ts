export type HazardType =
  | 'fire'
  | 'earthquake'
  | 'flood'
  | 'severe_weather'
  | 'chemical'
  | 'medical'
  | 'electrical'
  | 'security';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ActionStatus = 'open' | 'in_progress' | 'resolved' | 'verified';

export type InspectionStatus = 'pass' | 'needs_attention' | 'not_checked';

export type DrillStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'school' | 'college' | 'university' | 'office' | 'hospital' | 'industrial';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  emergencyHotline: string;
  primaryContactName: string;
  primaryContactEmail: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  verifiedPlansCount: number;
}

export interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phone: string;
  isExternal?: boolean;
}

export interface AssemblyPoint {
  id: string;
  name: string;
  code: string;
  locationDescription: string;
  capacity: number;
  isPrimary: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface HazardInstruction {
  hazard: HazardType;
  title: string;
  immediateActions: string[];
  evacuationRouteNote: string;
  doNotDo: string[];
}

export interface EmergencyPlan {
  id: string;
  buildingId: string;
  lastReviewedAt: string;
  reviewedBy: string;
  approvalStatus: 'approved' | 'in_review' | 'draft';
  hazardInstructions: HazardInstruction[];
  primaryAssemblyPointId: string;
  generalNotes: string;
}

export interface FloorExit {
  id: string;
  name: string;
  type: 'stairwell_north' | 'stairwell_south' | 'stairwell_east' | 'stairwell_west' | 'external_ramp' | 'emergency_door';
  isAccessible: boolean;
  status: 'clear' | 'partially_obstructed' | 'blocked';
  locationDescription?: string;
  instructions?: string;
}

export interface FloorEquipment {
  id: string;
  type: 'fire_extinguisher' | 'first_aid_kit' | 'fire_hose' | 'aed_defibrillator' | 'emergency_light' | 'alarm_pull_station';
  identifier: string;
  location: string;
  lastChecked: string;
  status: 'operational' | 'expired' | 'missing' | 'requires_service';
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  label: string; // e.g. "Ground Floor", "Level 1", "Basement"
  occupancyCapacity: number;
  primaryWardens: string[]; // staff IDs
  exits: FloorExit[];
  equipment: FloorEquipment[];
  inspectionStatus: 'pass' | 'needs_attention';
  lastInspectionDate: string;
  floorPlanUrl?: string;
  floorPlanType?: 'svg' | 'image' | 'upload';
  floorPlanDisclaimer?: string;
}

export interface Building {
  id: string;
  slug: string;
  institutionId: string;
  name: string;
  code: string; // e.g., "AB-01"
  type: 'academic' | 'administrative' | 'residential' | 'laboratory' | 'healthcare' | 'assembly';
  address: string;
  description?: string;
  totalFloors: number;
  constructionYear: number;
  occupancyCapacity: number;
  readinessScore: number; // 0 - 100
  lastDrillDate?: string;
  lastInspectionDate?: string;
  assemblyPoints: AssemblyPoint[];
  emergencyContacts: EmergencyContact[];
  plan: EmergencyPlan;
  floorsCount: number;
  activeIssuesCount: number;
  qrCodeUrl?: string;
}

export interface StaffMember {
  id: string;
  institutionId: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  emergencyRole: 
    | 'Chief Safety Officer'
    | 'Building Warden'
    | 'Floor Warden'
    | 'First Aid Officer'
    | 'Assembly Coordinator'
    | 'Facility Manager'
    | 'Security Lead';
  assignedBuildingId: string;
  assignedFloorId?: string;
  trainingCompleted: boolean;
  lastTrainedDate: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  status: InspectionStatus;
  notes?: string;
  targetLocation?: string;
  flaggedAsIssue?: boolean;
  linkedIssueId?: string;
}

export interface Inspection {
  id: string;
  institutionId: string;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floorLabel?: string;
  category?: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  status: 'passed' | 'needs_attention' | 'pending';
  score: number; // 0-100%
  items: ChecklistItem[];
  notes?: string;
  createdAt: string;
  passedCount?: number;
  attentionCount?: number;
  notCheckedCount?: number;
}

export interface DrillCheckin {
  id: string;
  floorId: string;
  floorLabel: string;
  wardenName: string;
  clearedAt?: string;
  accountedCount: number;
  expectedCount: number;
  status: 'pending' | 'in_progress' | 'cleared';
  notes?: string;
}

export interface DrillObservation {
  id: string;
  timestamp: string;
  observerName: string;
  floorOrZone: string;
  observation: string;
  severity: PriorityLevel;
  convertedToIssueId?: string;
}

export interface DrillParticipant {
  id: string;
  name: string;
  role: string;
  assignedArea: string;
  status: 'checked_in' | 'absent' | 'evacuating';
}

export interface Drill {
  id: string;
  code: string; // e.g. "DRL-2026-03"
  institutionId: string;
  buildingId: string;
  buildingName: string;
  hazardType: HazardType;
  title: string;
  scenarioNotes: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  targetDurationSeconds: number;
  status: DrillStatus;
  participantsExpected: number;
  participantsAccountedFor: number;
  leadCoordinatorId: string;
  leadCoordinatorName: string;
  floorCheckins: DrillCheckin[];
  observations: DrillObservation[];
  drillInstructions?: string;
  assignedWardenIds?: string[];
  participatingFloorIds?: string[];
  isDemo: boolean;
}

export interface SafetyIssue {
  id: string;
  code: string; // e.g., "ISS-104"
  institutionId: string;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floorLabel?: string;
  sourceType: 'inspection' | 'drill' | 'manual';
  sourceId?: string;
  checklistItemId?: string;
  checklistItemLabel?: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  assignedToName: string;
  assignedToRole: string;
  assignedToId?: string;
  dueDate: string;
  createdAt: string;
  status: ActionStatus;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  verificationNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'drill' | 'inspection' | 'issue' | 'plan';
  title: string;
  description: string;
  actorName: string;
  targetUrl?: string;
  badgeType: 'success' | 'warning' | 'info' | 'critical';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'safety_officer' | 'warden' | 'viewer';
  title: string;
  institutionId: string;
  institutionName: string;
  avatarUrl?: string;
}
