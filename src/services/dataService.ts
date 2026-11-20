import {
  Institution,
  Building,
  Floor,
  FloorExit,
  FloorEquipment,
  AssemblyPoint,
  EmergencyContact,
  HazardInstruction,
  HazardType,
  StaffMember,
  Inspection,
  ChecklistItem,
  Drill,
  SafetyIssue,
  ActivityItem,
  User,
  ActionStatus,
} from '../types';

import {
  mockInstitution,
  mockCurrentUser,
  mockBuildings,
  mockFloors,
  mockStaff,
  mockInspections,
  mockDrills,
  mockSafetyIssues,
  mockActivities,
} from '../data/mockData';

import {
  generateGenericFloorSvg,
  DISCLAIMER_TEXT,
} from '../data/sampleFloorPlans';

const STORAGE_KEYS = {
  INSTITUTION: 'drillproof_institution_v1',
  BUILDINGS: 'drillproof_buildings_v1',
  FLOORS: 'drillproof_floors_v1',
  STAFF: 'drillproof_staff_v1',
  INSPECTIONS: 'drillproof_inspections_v1',
  DRILLS: 'drillproof_drills_v1',
  ISSUES: 'drillproof_safety_issues_v1',
  ACTIVITIES: 'drillproof_activities_v1',
  USER: 'drillproof_user_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export class DataService {
  // Fixed Internal Demo Accounts
  static readonly DEMO_ACCOUNTS = {
    ADMIN: {
      email: 'admin@drillproof.io',
      password: 'drillproof2026',
      alternateEmails: ['m.vance@northstar.edu', 'm.vance@drillproof.io'],
      user: {
        id: 'usr-admin-01',
        name: 'Marcus Vance',
        email: 'admin@drillproof.io',
        role: 'admin' as const,
        title: 'Director of Institutional Safety & Operations',
        institutionId: 'inst-northstar',
        institutionName: 'Northstar Institute of Technology',
      },
    },
    WARDEN: {
      email: 'warden@drillproof.io',
      password: 'warden2026',
      alternatePasswords: ['drillproof2026'],
      alternateEmails: ['staff@drillproof.io', 'a.sen@northstar.edu', 'warden@drillproof.com'],
      user: {
        id: 'usr-warden-01',
        name: 'Prof. Ananya Sen',
        email: 'warden@drillproof.io',
        role: 'warden' as const,
        title: 'Chief Building Warden & Safety Faculty',
        institutionId: 'inst-northstar',
        institutionName: 'Northstar Institute of Technology',
      },
    },
  };

  // Initialization
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.BUILDINGS)) {
      this.resetToDefaults();
    } else {
      // Data migration & integrity reconciliation
      try {
        // 1. Reconcile floors and apply designated fire exit plans
        const storedFloors = safeGet<Floor[]>(STORAGE_KEYS.FLOORS, []);
        let floorsUpdated = false;

        const buildingPlanMap: Record<string, { url: string; disclaimer: string }> = {
          'bld-academic': {
            url: '/plans/fire-exit-plan-academic.jpg',
            disclaimer: 'Official Fire Exit Plan — Room 210-211 Route',
          },
          'bld-admin': {
            url: '/plans/fire-exit-plan-admin.jpg',
            disclaimer: 'Official Fire Exit Plan — Room 217-218 Route',
          },
          'bld-residence': {
            url: '/plans/fire-exit-plan-residence.jpg',
            disclaimer: 'Official Fire Exit Plan — Room 219-220 Route',
          },
          'bld-mech': {
            url: '/plans/fire-exit-plan-mech.jpg',
            disclaimer: 'Official Fire Exit Plan — Room 225-226 Route',
          },
          'bld-it': {
            url: '/plans/fire-exit-plan-it.jpg',
            disclaimer: 'Official Fire Exit Plan — Room 228 Route',
          },
        };

        for (const mf of mockFloors) {
          const found = storedFloors.find((f) => f.id === mf.id);
          if (!found) {
            storedFloors.push(mf);
            floorsUpdated = true;
          }
        }

        // Apply official fire exit plan to all floors in each building unless custom upload
        for (const flr of storedFloors) {
          const planConfig = buildingPlanMap[flr.buildingId];
          if (planConfig && flr.floorPlanType !== 'upload') {
            if (flr.floorPlanUrl !== planConfig.url) {
              flr.floorPlanUrl = planConfig.url;
              flr.floorPlanType = 'image';
              flr.floorPlanDisclaimer = planConfig.disclaimer;
              floorsUpdated = true;
            }
          }
        }

        if (floorsUpdated) {
          safeSet(STORAGE_KEYS.FLOORS, storedFloors);
        }

        // 2. Reconcile inspections and issues integrity
        const storedInspections = safeGet<Inspection[]>(STORAGE_KEYS.INSPECTIONS, mockInspections);
        const storedIssues = safeGet<SafetyIssue[]>(STORAGE_KEYS.ISSUES, mockSafetyIssues);
        let inspectionsChanged = false;
        let issuesChanged = false;

        // Ensure all stored issues with source inspection have checklistItemId, checklistItemLabel, buildingId, floorId
        for (const iss of storedIssues) {
          if (iss.sourceType === 'inspection' && iss.sourceId) {
            const srcInsp = storedInspections.find((i) => i.id === iss.sourceId);
            if (srcInsp) {
              if (!iss.checklistItemId) {
                const match = srcInsp.items.find(
                  (it) =>
                    it.linkedIssueId === iss.id ||
                    (it.label &&
                      iss.title &&
                      (iss.title.toLowerCase().includes(it.label.toLowerCase()) ||
                        (it.label.toLowerCase().includes('extinguisher') &&
                          iss.title.toLowerCase().includes('extinguisher')) ||
                        (it.label.toLowerCase().includes('battery') &&
                          iss.title.toLowerCase().includes('battery'))))
                );
                if (match) {
                  iss.checklistItemId = match.id;
                  iss.checklistItemLabel = match.label;
                  match.linkedIssueId = iss.id;
                  match.flaggedAsIssue = true;
                  inspectionsChanged = true;
                  issuesChanged = true;
                }
              }
              if (!iss.buildingId) {
                iss.buildingId = srcInsp.buildingId;
                iss.buildingName = srcInsp.buildingName;
                issuesChanged = true;
              }
              if (!iss.floorId && srcInsp.floorId) {
                iss.floorId = srcInsp.floorId;
                iss.floorLabel = srcInsp.floorLabel;
                issuesChanged = true;
              }
            }
          }
        }

        // Ensure all inspection checklist items have valid category and linkedIssueId if an issue exists
        for (const insp of storedInspections) {
          for (const item of insp.items) {
            if (!item.category) {
              item.category = 'general_safety';
              inspectionsChanged = true;
            }
            if (!item.linkedIssueId && item.status === 'needs_attention') {
              const matchedIssue = storedIssues.find(
                (iss) =>
                  iss.sourceId === insp.id &&
                  (iss.checklistItemId === item.id ||
                    (iss.title &&
                      item.label &&
                      iss.title.toLowerCase().includes(item.label.toLowerCase())))
              );
              if (matchedIssue) {
                item.linkedIssueId = matchedIssue.id;
                item.flaggedAsIssue = true;
                if (!matchedIssue.checklistItemId) {
                  matchedIssue.checklistItemId = item.id;
                  matchedIssue.checklistItemLabel = item.label;
                  issuesChanged = true;
                }
                inspectionsChanged = true;
              }
            }
          }
        }

        // Recalculate metrics & status for stored inspections
        for (const insp of storedInspections) {
          const pCount = insp.items.filter((i) => i.status === 'pass').length;
          const aCount = insp.items.filter((i) => i.status === 'needs_attention').length;
          const uCount = insp.items.filter((i) => i.status === 'not_checked').length;
          const ev = pCount + aCount;
          const sc = ev > 0 ? Math.round((pCount / ev) * 100) : 0;
          const st: Inspection['status'] =
            uCount > 0 ? 'pending' : aCount > 0 ? 'needs_attention' : 'passed';

          if (
            insp.passedCount !== pCount ||
            insp.attentionCount !== aCount ||
            insp.notCheckedCount !== uCount ||
            insp.score !== sc ||
            insp.status !== st
          ) {
            insp.passedCount = pCount;
            insp.attentionCount = aCount;
            insp.notCheckedCount = uCount;
            insp.score = sc;
            insp.status = st;
            inspectionsChanged = true;
          }
        }

        // 3. Reconcile stored drills
        const storedDrills = safeGet<Drill[]>(STORAGE_KEYS.DRILLS, mockDrills);
        let drillsChanged = false;

        const fireScheduledExists = storedDrills.some((d) => d.id === 'drl-fire-scheduled');
        if (!fireScheduledExists) {
          const freshDrill = mockDrills.find((d) => d.id === 'drl-fire-scheduled');
          if (freshDrill) {
            storedDrills.unshift(freshDrill);
            drillsChanged = true;
          }
        }

        for (const drl of storedDrills) {
          if ((drl.participantsExpected === 1250 || drl.id === 'drl-fire-scheduled') && drl.buildingId === 'bld-academic') {
            const expectedSum = drl.floorCheckins.reduce((s, c) => s + (c.expectedCount || 0), 0);
            if (expectedSum !== 1250 || drl.floorCheckins.length < 4) {
              drl.participantsExpected = 1250;
              drl.floorCheckins = [
                { id: `ck-${drl.id}-0`, floorId: 'flr-acad-0', floorLabel: 'Ground Floor (Atrium & Lecture Halls 1-4)', wardenName: 'Prof. Ananya Sen (Building Warden)', accountedCount: 0, expectedCount: 450, status: 'pending' },
                { id: `ck-${drl.id}-1`, floorId: 'flr-acad-1', floorLabel: 'Level 1 (Computer Laboratories & Faculty Offices)', wardenName: 'Rohan Deshmukh (Floor Warden)', accountedCount: 0, expectedCount: 320, status: 'pending' },
                { id: `ck-${drl.id}-2`, floorId: 'flr-acad-2', floorLabel: 'Level 2 (Chemistry & Material Science Labs)', wardenName: 'Dr. Meera Nambiar (Floor Warden)', accountedCount: 0, expectedCount: 260, status: 'pending' },
                { id: `ck-${drl.id}-3`, floorId: 'flr-acad-3', floorLabel: 'Level 3 (Departmental Library & Research Suites)', wardenName: 'Tenzing Norbu (Floor Warden)', accountedCount: 0, expectedCount: 220, status: 'pending' },
              ];
              drl.participantsAccountedFor = 0;
              drillsChanged = true;
            }
          }

          // Reconcile cleared floors whose accountedCount is out of sync with expectedCount
          for (const chk of drl.floorCheckins) {
            if (chk.status === 'cleared' && chk.accountedCount === 0 && chk.expectedCount > 0) {
              chk.accountedCount = chk.expectedCount;
              drillsChanged = true;
            }
          }

          const realAccounted = drl.floorCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
          if (drl.participantsAccountedFor !== realAccounted) {
            drl.participantsAccountedFor = realAccounted;
            drillsChanged = true;
          }
        }

        // 4. Reconcile building activeIssuesCount and ensure all 5 registered buildings exist
        const storedBuildings = safeGet<Building[]>(STORAGE_KEYS.BUILDINGS, mockBuildings);
        let buildingsChanged = false;

        for (const mb of mockBuildings) {
          const found = storedBuildings.find((b) => b.id === mb.id);
          if (!found) {
            storedBuildings.push(mb);
            buildingsChanged = true;
          }
        }

        for (const bld of storedBuildings) {
          const actualActive = storedIssues.filter(
            (iss) =>
              iss.buildingId === bld.id && (iss.status === 'open' || iss.status === 'in_progress')
          ).length;
          if (bld.activeIssuesCount !== actualActive) {
            bld.activeIssuesCount = actualActive;
            buildingsChanged = true;
          }
        }

        if (inspectionsChanged) safeSet(STORAGE_KEYS.INSPECTIONS, storedInspections);
        if (drillsChanged) safeSet(STORAGE_KEYS.DRILLS, storedDrills);
        if (issuesChanged) safeSet(STORAGE_KEYS.ISSUES, storedIssues);
        if (buildingsChanged) safeSet(STORAGE_KEYS.BUILDINGS, storedBuildings);
      } catch (e) {
        console.warn('Data reconciliation error:', e);
      }
    }
  }

  static resetToDefaults(): void {
    safeSet(STORAGE_KEYS.INSTITUTION, mockInstitution);
    safeSet(STORAGE_KEYS.BUILDINGS, mockBuildings);
    safeSet(STORAGE_KEYS.FLOORS, mockFloors);
    safeSet(STORAGE_KEYS.STAFF, mockStaff);
    safeSet(STORAGE_KEYS.INSPECTIONS, mockInspections);
    safeSet(STORAGE_KEYS.DRILLS, mockDrills);
    safeSet(STORAGE_KEYS.ISSUES, mockSafetyIssues);
    safeSet(STORAGE_KEYS.ACTIVITIES, mockActivities);
    // Note: Do NOT auto-authenticate on reset to preserve legitimate session state
  }

  // Auth / Current User
  static getCurrentUser(): User | null {
    return safeGet<User | null>(STORAGE_KEYS.USER, null);
  }

  static authenticate(
    email: string,
    password: string
  ): { success: boolean; user?: User; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        success: false,
        error: 'Please enter both your institutional email and password.',
      };
    }

    // Check Administrator credentials
    const isAdminEmail =
      cleanEmail === this.DEMO_ACCOUNTS.ADMIN.email.toLowerCase() ||
      this.DEMO_ACCOUNTS.ADMIN.alternateEmails.some((e) => e.toLowerCase() === cleanEmail);
    const isAdminPassword = cleanPassword === this.DEMO_ACCOUNTS.ADMIN.password;

    if (isAdminEmail && isAdminPassword) {
      const user = { ...this.DEMO_ACCOUNTS.ADMIN.user, email: cleanEmail };
      safeSet(STORAGE_KEYS.USER, user);
      return { success: true, user };
    }

    // Check Staff / Warden credentials
    const isWardenEmail =
      cleanEmail === this.DEMO_ACCOUNTS.WARDEN.email.toLowerCase() ||
      this.DEMO_ACCOUNTS.WARDEN.alternateEmails.some((e) => e.toLowerCase() === cleanEmail);
    const isWardenPassword =
      cleanPassword === this.DEMO_ACCOUNTS.WARDEN.password ||
      this.DEMO_ACCOUNTS.WARDEN.alternatePasswords.includes(cleanPassword);

    if (isWardenEmail && isWardenPassword) {
      const user = { ...this.DEMO_ACCOUNTS.WARDEN.user, email: cleanEmail };
      safeSet(STORAGE_KEYS.USER, user);
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid institutional credentials. Please check your email and password.',
    };
  }

  static loginAsDemoUser(role: User['role'] = 'admin'): User {
    const user: User =
      role === 'admin'
        ? this.DEMO_ACCOUNTS.ADMIN.user
        : this.DEMO_ACCOUNTS.WARDEN.user;
    safeSet(STORAGE_KEYS.USER, user);
    return user;
  }

  static logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // ignore
    }
  }

  // Institution
  static getInstitution(): Institution {
    return safeGet<Institution>(STORAGE_KEYS.INSTITUTION, mockInstitution);
  }

  static updateInstitution(updated: Partial<Institution>): Institution {
    const current = this.getInstitution();
    const merged = { ...current, ...updated };
    safeSet(STORAGE_KEYS.INSTITUTION, merged);
    return merged;
  }

  // Buildings
  static getBuildings(): Building[] {
    return safeGet<Building[]>(STORAGE_KEYS.BUILDINGS, mockBuildings);
  }

  static getBuildingById(id: string): Building | undefined {
    if (!id) return undefined;
    return this.getBuildings().find((b) => b.id.toLowerCase() === id.toLowerCase());
  }

  static getBuildingBySlug(slug: string): Building | undefined {
    if (!slug) return undefined;
    const clean = slug.trim().toLowerCase();
    return this.getBuildings().find(
      (b) => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean
    );
  }

  static updateBuilding(id: string, updates: Partial<Building>): Building | undefined {
    const buildings = this.getBuildings();
    const index = buildings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    buildings[index] = { ...buildings[index], ...updates };
    safeSet(STORAGE_KEYS.BUILDINGS, buildings);
    return buildings[index];
  }

  static createBuilding(input: {
    name: string;
    type: Building['type'];
    address: string;
    description?: string;
    code?: string;
  }): Building {
    const buildings = this.getBuildings();
    const id = `bld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const baseSlug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `building-${Date.now()}`;
    const slug = baseSlug;

    // Generate facility code if not explicitly given
    const code = input.code
      ? input.code.toUpperCase()
      : input.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 4) || 'BLD';

    const newBuilding: Building = {
      id,
      slug,
      institutionId: this.getInstitution().id || 'inst-northstar',
      name: input.name.trim(),
      code: code.length >= 2 ? code : `${code}-01`,
      type: input.type || 'academic',
      address: input.address.trim(),
      description: input.description?.trim() || '',
      totalFloors: 0,
      constructionYear: new Date().getFullYear(),
      occupancyCapacity: 0,
      readinessScore: 0,
      assemblyPoints: [],
      emergencyContacts: [],
      floorsCount: 0,
      activeIssuesCount: 0,
      qrCodeUrl: `/building/${slug}`,
      plan: {
        id: `plan-${id}`,
        buildingId: id,
        lastReviewedAt: new Date().toISOString().split('T')[0],
        reviewedBy: 'Authorized Safety Lead',
        approvalStatus: 'draft',
        primaryAssemblyPointId: '',
        generalNotes: '',
        hazardInstructions: [],
      },
    };

    buildings.push(newBuilding);
    safeSet(STORAGE_KEYS.BUILDINGS, buildings);

    this.addActivity({
      type: 'plan',
      title: 'Facility Registered',
      description: `${newBuilding.name} (${newBuilding.code}) registered in institutional safety directory.`,
      actorName: this.getCurrentUser()?.name || 'Administrator',
      targetUrl: `/buildings/${newBuilding.id}`,
      badgeType: 'info',
    });

    return newBuilding;
  }

  static deleteBuilding(id: string): boolean {
    const buildings = this.getBuildings();
    const target = buildings.find((b) => b.id === id);
    if (!target) return false;

    const filtered = buildings.filter((b) => b.id !== id);
    safeSet(STORAGE_KEYS.BUILDINGS, filtered);

    // delete associated floors
    const floors = this.getFloors().filter((f) => f.buildingId !== id);
    safeSet(STORAGE_KEYS.FLOORS, floors);

    this.addActivity({
      type: 'plan',
      title: 'Facility Removed',
      description: `${target.name} (${target.code}) removed from active registry.`,
      actorName: this.getCurrentUser()?.name || 'Administrator',
      targetUrl: '/buildings',
      badgeType: 'warning',
    });

    return true;
  }

  // Assembly Points
  static addAssemblyPoint(
    buildingId: string,
    ap: Omit<AssemblyPoint, 'id'>
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    const newAp: AssemblyPoint = {
      ...ap,
      id: `ap-${Date.now()}`,
    };
    bld.assemblyPoints.push(newAp);
    return this.updateBuilding(buildingId, { assemblyPoints: bld.assemblyPoints });
  }

  static updateAssemblyPoint(
    buildingId: string,
    apId: string,
    updates: Partial<AssemblyPoint>
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    bld.assemblyPoints = bld.assemblyPoints.map((ap) =>
      ap.id === apId ? { ...ap, ...updates } : ap
    );
    return this.updateBuilding(buildingId, { assemblyPoints: bld.assemblyPoints });
  }

  static deleteAssemblyPoint(buildingId: string, apId: string): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    bld.assemblyPoints = bld.assemblyPoints.filter((ap) => ap.id !== apId);
    return this.updateBuilding(buildingId, { assemblyPoints: bld.assemblyPoints });
  }

  // Emergency Contacts
  static addEmergencyContact(
    buildingId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec-${Date.now()}`,
    };
    bld.emergencyContacts.push(newContact);
    return this.updateBuilding(buildingId, { emergencyContacts: bld.emergencyContacts });
  }

  static updateEmergencyContact(
    buildingId: string,
    contactId: string,
    updates: Partial<EmergencyContact>
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    bld.emergencyContacts = bld.emergencyContacts.map((c) =>
      c.id === contactId ? { ...c, ...updates } : c
    );
    return this.updateBuilding(buildingId, { emergencyContacts: bld.emergencyContacts });
  }

  static deleteEmergencyContact(
    buildingId: string,
    contactId: string
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    bld.emergencyContacts = bld.emergencyContacts.filter((c) => c.id !== contactId);
    return this.updateBuilding(buildingId, { emergencyContacts: bld.emergencyContacts });
  }

  // Hazard Instructions
  static updateHazardInstruction(
    buildingId: string,
    hazard: HazardType,
    updates: Partial<HazardInstruction>
  ): Building | undefined {
    const bld = this.getBuildingById(buildingId);
    if (!bld) return undefined;
    const plan = bld.plan;
    const index = plan.hazardInstructions.findIndex((h) => h.hazard === hazard);
    if (index !== -1) {
      plan.hazardInstructions[index] = { ...plan.hazardInstructions[index], ...updates };
    } else {
      plan.hazardInstructions.push({
        hazard,
        title: updates.title || `${hazard.toUpperCase()} Protocol`,
        immediateActions: updates.immediateActions || [],
        evacuationRouteNote: updates.evacuationRouteNote || '',
        doNotDo: updates.doNotDo || [],
      });
    }
    plan.lastReviewedAt = new Date().toISOString().split('T')[0];
    return this.updateBuilding(buildingId, { plan });
  }

  // Floor Management
  static addFloor(
    buildingId: string,
    floorData: Omit<Floor, 'id' | 'buildingId'>
  ): Floor {
    const floors = this.getFloors();
    const newFloor: Floor = {
      ...floorData,
      id: `flr-${buildingId}-${Date.now()}`,
      buildingId,
    };
    floors.push(newFloor);
    safeSet(STORAGE_KEYS.FLOORS, floors);

    const bld = this.getBuildingById(buildingId);
    if (bld) {
      this.updateBuilding(buildingId, {
        totalFloors: bld.totalFloors + 1,
        floorsCount: (bld.floorsCount || 0) + 1,
      });
    }
    return newFloor;
  }

  static updateFloor(id: string, updates: Partial<Floor>): Floor | undefined {
    const floors = this.getFloors();
    const index = floors.findIndex((f) => f.id === id);
    if (index === -1) return undefined;
    floors[index] = { ...floors[index], ...updates };
    safeSet(STORAGE_KEYS.FLOORS, floors);
    return floors[index];
  }

  static deleteFloor(id: string): boolean {
    const floors = this.getFloors();
    const target = floors.find((f) => f.id === id);
    if (!target) return false;

    const filtered = floors.filter((f) => f.id !== id);
    safeSet(STORAGE_KEYS.FLOORS, filtered);

    const bld = this.getBuildingById(target.buildingId);
    if (bld && bld.totalFloors > 1) {
      this.updateBuilding(target.buildingId, {
        totalFloors: bld.totalFloors - 1,
        floorsCount: Math.max(1, (bld.floorsCount || 1) - 1),
      });
    }
    return true;
  }

  // Floor Exits & Equipment
  static addFloorExit(floorId: string, exit: Omit<FloorExit, 'id'>): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.exits.push({ ...exit, id: `ex-${Date.now()}` });
    return this.updateFloor(floorId, { exits: floor.exits });
  }

  static updateFloorExit(
    floorId: string,
    exitId: string,
    updates: Partial<FloorExit>
  ): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.exits = floor.exits.map((e) => (e.id === exitId ? { ...e, ...updates } : e));
    return this.updateFloor(floorId, { exits: floor.exits });
  }

  static deleteFloorExit(floorId: string, exitId: string): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.exits = floor.exits.filter((e) => e.id !== exitId);
    return this.updateFloor(floorId, { exits: floor.exits });
  }

  static addFloorEquipment(
    floorId: string,
    eq: Omit<FloorEquipment, 'id'>
  ): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.equipment.push({ ...eq, id: `eq-${Date.now()}` });
    return this.updateFloor(floorId, { equipment: floor.equipment });
  }

  static updateFloorEquipment(
    floorId: string,
    eqId: string,
    updates: Partial<FloorEquipment>
  ): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.equipment = floor.equipment.map((e) =>
      e.id === eqId ? { ...e, ...updates } : e
    );
    return this.updateFloor(floorId, { equipment: floor.equipment });
  }

  static deleteFloorEquipment(floorId: string, eqId: string): Floor | undefined {
    const floor = this.getFloorById(floorId);
    if (!floor) return undefined;
    floor.equipment = floor.equipment.filter((e) => e.id !== eqId);
    return this.updateFloor(floorId, { equipment: floor.equipment });
  }

  // Floors
  static getFloors(buildingId?: string): Floor[] {
    const floors = safeGet<Floor[]>(STORAGE_KEYS.FLOORS, mockFloors);
    if (buildingId) {
      return floors.filter((f) => f.buildingId === buildingId);
    }
    return floors;
  }

  static getFloorById(id: string): Floor | undefined {
    return this.getFloors().find((f) => f.id === id);
  }

  // Staff
  static getStaff(): StaffMember[] {
    return safeGet<StaffMember[]>(STORAGE_KEYS.STAFF, mockStaff);
  }

  static getStaffById(id: string): StaffMember | undefined {
    return this.getStaff().find((s) => s.id === id);
  }

  // Inspections
  static getInspections(): Inspection[] {
    const inspections = safeGet<Inspection[]>(STORAGE_KEYS.INSPECTIONS, mockInspections);
    return inspections.map((insp) => {
      const pCount = insp.items.filter((i) => i.status === 'pass').length;
      const aCount = insp.items.filter((i) => i.status === 'needs_attention').length;
      const uCount = insp.items.filter((i) => i.status === 'not_checked').length;
      const ev = pCount + aCount;
      const sc = ev > 0 ? Math.round((pCount / ev) * 100) : 0;
      const st: Inspection['status'] =
        uCount > 0 ? 'pending' : aCount > 0 ? 'needs_attention' : 'passed';
      return {
        ...insp,
        passedCount: pCount,
        attentionCount: aCount,
        notCheckedCount: uCount,
        score: sc,
        status: st,
      };
    });
  }

  static getInspectionById(id: string): Inspection | undefined {
    return this.getInspections().find((i) => i.id === id);
  }

  static createInspection(inspection: Omit<Inspection, 'id' | 'createdAt'>): Inspection {
    const inspections = this.getInspections();
    const passedCount = inspection.items.filter((i) => i.status === 'pass').length;
    const attentionCount = inspection.items.filter((i) => i.status === 'needs_attention').length;
    const notCheckedCount = inspection.items.filter((i) => i.status === 'not_checked').length;

    const evaluated = passedCount + attentionCount;
    const score = evaluated > 0 ? Math.round((passedCount / evaluated) * 100) : 0;
    const status: Inspection['status'] =
      notCheckedCount > 0 ? 'pending' : attentionCount > 0 ? 'needs_attention' : 'passed';

    const newInspection: Inspection = {
      ...inspection,
      id: `insp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      passedCount,
      attentionCount,
      notCheckedCount,
      score,
      status,
    };
    inspections.unshift(newInspection);
    safeSet(STORAGE_KEYS.INSPECTIONS, inspections);

    // Update building last inspection date
    const buildings = this.getBuildings();
    const bldIndex = buildings.findIndex((b) => b.id === newInspection.buildingId);
    if (bldIndex !== -1) {
      buildings[bldIndex].lastInspectionDate = newInspection.date;
      safeSet(STORAGE_KEYS.BUILDINGS, buildings);
    }

    // Record activity
    this.addActivity({
      type: 'inspection',
      title: 'New Safety Inspection Recorded',
      description: `${newInspection.buildingName} inspection completed (${attentionCount} attention items, ${score}% score).`,
      actorName: newInspection.inspectorName,
      targetUrl: '/inspections',
      badgeType: newInspection.status === 'passed' ? 'success' : 'warning',
    });

    return newInspection;
  }

  static updateInspection(id: string, updates: Partial<Inspection>): Inspection | undefined {
    const inspections = this.getInspections();
    const index = inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const current = inspections[index];
    const items = updates.items || current.items;
    const passedCount = items.filter((i) => i.status === 'pass').length;
    const attentionCount = items.filter((i) => i.status === 'needs_attention').length;
    const notCheckedCount = items.filter((i) => i.status === 'not_checked').length;
    const evaluated = passedCount + attentionCount;
    const score = evaluated > 0 ? Math.round((passedCount / evaluated) * 100) : 0;
    const status: Inspection['status'] =
      notCheckedCount > 0 ? 'pending' : attentionCount > 0 ? 'needs_attention' : 'passed';

    inspections[index] = {
      ...current,
      ...updates,
      items,
      passedCount,
      attentionCount,
      notCheckedCount,
      score,
      status,
    };
    safeSet(STORAGE_KEYS.INSPECTIONS, inspections);
    return inspections[index];
  }

  static updateChecklistItem(
    inspectionId: string,
    itemId: string,
    itemUpdates: Partial<ChecklistItem>
  ): Inspection | undefined {
    const inspections = this.getInspections();
    const index = inspections.findIndex((i) => i.id === inspectionId);
    if (index === -1) return undefined;

    const current = inspections[index];
    const items = current.items.map((it) =>
      it.id === itemId ? { ...it, ...itemUpdates } : it
    );

    const passedCount = items.filter((i) => i.status === 'pass').length;
    const attentionCount = items.filter((i) => i.status === 'needs_attention').length;
    const notCheckedCount = items.filter((i) => i.status === 'not_checked').length;
    const evaluated = passedCount + attentionCount;
    const score = evaluated > 0 ? Math.round((passedCount / evaluated) * 100) : 0;
    const status: Inspection['status'] =
      notCheckedCount > 0 ? 'pending' : attentionCount > 0 ? 'needs_attention' : 'passed';

    inspections[index] = {
      ...current,
      items,
      passedCount,
      attentionCount,
      notCheckedCount,
      score,
      status,
    };
    safeSet(STORAGE_KEYS.INSPECTIONS, inspections);
    return inspections[index];
  }

  static deleteInspection(id: string): boolean {
    const inspections = this.getInspections();
    const target = inspections.find((i) => i.id === id);
    if (!target) return false;
    const filtered = inspections.filter((i) => i.id !== id);
    safeSet(STORAGE_KEYS.INSPECTIONS, filtered);
    return true;
  }

  // Drills
  static getDrills(): Drill[] {
    const drills = safeGet<Drill[]>(STORAGE_KEYS.DRILLS, mockDrills);
    return drills.map((d) => {
      const realAccounted = d.floorCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
      return {
        ...d,
        participantsAccountedFor: realAccounted,
      };
    });
  }

  static getDrillById(id: string): Drill | undefined {
    return this.getDrills().find((d) => d.id === id);
  }

  static createDrill(drill: Omit<Drill, 'id' | 'code'>): Drill {
    const drills = this.getDrills();
    const year = new Date().getFullYear();
    const num = drills.length + 1;
    const code = `DRL-${year}-${num.toString().padStart(2, '0')}`;
    const newDrill: Drill = {
      ...drill,
      id: `drl-${Date.now()}`,
      code,
    };
    drills.unshift(newDrill);
    safeSet(STORAGE_KEYS.DRILLS, drills);

    this.addActivity({
      type: 'drill',
      title: 'Emergency Drill Created',
      description: `${newDrill.title} scheduled for ${newDrill.buildingName}.`,
      actorName: newDrill.leadCoordinatorName,
      targetUrl: `/drills/${newDrill.id}`,
      badgeType: 'info',
    });

    return newDrill;
  }

  static updateDrill(id: string, updates: Partial<Drill>): Drill | undefined {
    const drills = this.getDrills();
    const index = drills.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    // Calculate real accounted headcount if floorCheckins are updated
    let participantsAccountedFor = updates.participantsAccountedFor;
    if (updates.floorCheckins) {
      participantsAccountedFor = updates.floorCheckins.reduce(
        (sum, item) => sum + (item.accountedCount || 0),
        0
      );
    }

    drills[index] = {
      ...drills[index],
      ...updates,
      ...(participantsAccountedFor !== undefined ? { participantsAccountedFor } : {}),
    };
    safeSet(STORAGE_KEYS.DRILLS, drills);
    return drills[index];
  }

  static updateDrillCheckin(
    drillId: string,
    checkinId: string,
    updates: Partial<Drill['floorCheckins'][0]>
  ): Drill | undefined {
    const drill = this.getDrillById(drillId);
    if (!drill) return undefined;

    drill.floorCheckins = drill.floorCheckins.map((chk) => {
      if (chk.id === checkinId) {
        const next = { ...chk, ...updates };
        if (updates.status === 'cleared' && updates.accountedCount === undefined) {
          next.accountedCount = next.expectedCount;
        } else if (
          updates.status === 'in_progress' &&
          chk.status === 'cleared' &&
          updates.accountedCount === undefined
        ) {
          next.accountedCount = 0;
        }
        return next;
      }
      return chk;
    });

    // recalculate accounted
    drill.participantsAccountedFor = drill.floorCheckins.reduce(
      (sum, item) => sum + (item.accountedCount || 0),
      0
    );

    return this.updateDrill(drillId, drill);
  }

  static updateDrillCheckinsBulk(
    drillId: string,
    checkinUpdates: Array<{ checkinId: string; updates: Partial<Drill['floorCheckins'][0]> }>
  ): Drill | undefined {
    const drill = this.getDrillById(drillId);
    if (!drill) return undefined;

    const updateMap = new Map(checkinUpdates.map((u) => [u.checkinId, u.updates]));

    drill.floorCheckins = drill.floorCheckins.map((chk) => {
      const u = updateMap.get(chk.id);
      if (u) {
        return { ...chk, ...u };
      }
      return chk;
    });

    drill.participantsAccountedFor = drill.floorCheckins.reduce(
      (sum, item) => sum + (item.accountedCount || 0),
      0
    );

    return this.updateDrill(drillId, drill);
  }

  static addDrillObservation(
    drillId: string,
    observation: Omit<Drill['observations'][0], 'id'>
  ): Drill | undefined {
    const drill = this.getDrillById(drillId);
    if (!drill) return undefined;

    const newObs = {
      ...observation,
      id: `obs-${Date.now()}`,
    };
    drill.observations.push(newObs);
    return this.updateDrill(drillId, drill);
  }

  static deleteDrill(id: string): boolean {
    const drills = this.getDrills();
    const target = drills.find((d) => d.id === id);
    if (!target) return false;
    const filtered = drills.filter((d) => d.id !== id);
    safeSet(STORAGE_KEYS.DRILLS, filtered);
    return true;
  }

  // Safety Issues / Corrective Actions
  static calculateBuildingReadiness(buildingId: string): number {
    const issues = this.getSafetyIssues().filter((i) => i.buildingId === buildingId);
    const inspections = this.getInspections().filter((i) => i.buildingId === buildingId);
    const drills = this.getDrills().filter((d) => d.buildingId === buildingId);

    const openCritical = issues.filter(
      (i) => (i.status === 'open' || i.status === 'in_progress') && (i.priority === 'critical' || i.priority === 'high')
    ).length;
    const openOther = issues.filter(
      (i) => (i.status === 'open' || i.status === 'in_progress') && (i.priority === 'medium' || i.priority === 'low')
    ).length;
    const pendingInspec = inspections.filter(
      (i) => (i.notCheckedCount || 0) > 0 || i.status === 'pending'
    ).length;
    const completedDrills = drills.filter((d) => d.status === 'completed').length;

    const penalty = openCritical * 8 + openOther * 3 + pendingInspec * 4;
    const bonus = Math.min(10, completedDrills * 3);
    return Math.max(45, Math.min(100, 100 - penalty + bonus));
  }

  static syncBuildingActiveIssues(buildingId?: string): void {
    const buildings = this.getBuildings();
    const issues = this.getSafetyIssues();
    let changed = false;

    for (const bld of buildings) {
      if (!buildingId || bld.id === buildingId) {
        const activeCount = issues.filter(
          (i) => i.buildingId === bld.id && (i.status === 'open' || i.status === 'in_progress')
        ).length;
        const newScore = this.calculateBuildingReadiness(bld.id);
        if (bld.activeIssuesCount !== activeCount || bld.readinessScore !== newScore) {
          bld.activeIssuesCount = activeCount;
          bld.readinessScore = newScore;
          changed = true;
        }
      }
    }

    if (changed) {
      safeSet(STORAGE_KEYS.BUILDINGS, buildings);
    }
  }

  static getSafetyIssues(): SafetyIssue[] {
    return safeGet<SafetyIssue[]>(STORAGE_KEYS.ISSUES, mockSafetyIssues);
  }

  static getSafetyIssueById(id: string): SafetyIssue | undefined {
    return this.getSafetyIssues().find((i) => i.id === id);
  }

  static createSafetyIssue(issue: Omit<SafetyIssue, 'id' | 'code' | 'createdAt'>): SafetyIssue {
    const issues = this.getSafetyIssues();
    // Calculate next sequential code from highest existing ACT number
    let maxNum = 100;
    for (const iss of issues) {
      const match = iss.code?.match(/ACT-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    }
    const code = `ACT-${maxNum + 1}`;
    const newIssue: SafetyIssue = {
      ...issue,
      id: `iss-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      createdAt: new Date().toISOString(),
    };
    issues.unshift(newIssue);
    safeSet(STORAGE_KEYS.ISSUES, issues);
    this.syncBuildingActiveIssues(newIssue.buildingId);

    this.addActivity({
      type: 'issue',
      title: 'Corrective Action Created',
      description: `${newIssue.title} assigned to ${newIssue.assignedToName}.`,
      actorName: 'System / User',
      targetUrl: '/issues',
      badgeType: newIssue.priority === 'critical' || newIssue.priority === 'high' ? 'critical' : 'warning',
    });

    return newIssue;
  }

  static updateSafetyIssue(id: string, updates: Partial<SafetyIssue>): SafetyIssue | undefined {
    const issues = this.getSafetyIssues();
    const index = issues.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const prevStatus = issues[index].status;
    issues[index] = { ...issues[index], ...updates };
    const newStatus = issues[index].status;

    safeSet(STORAGE_KEYS.ISSUES, issues);
    this.syncBuildingActiveIssues(issues[index].buildingId);
    return issues[index];
  }

  static resolveSafetyIssue(
    id: string,
    resolutionNote: string,
    resolvedBy: string
  ): SafetyIssue | undefined {
    return this.updateSafetyIssue(id, {
      status: 'resolved',
      resolutionNote,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    });
  }

  static verifySafetyIssue(
    id: string,
    verificationNote: string,
    verifiedBy: string
  ): SafetyIssue | undefined {
    const updated = this.updateSafetyIssue(id, {
      status: 'verified',
      verificationNote,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
    });

    if (updated) {
      this.addActivity({
        type: 'issue',
        title: 'Remediation Verified & Closed',
        description: `Corrective action ${updated.code} verified and closed by ${verifiedBy}.`,
        actorName: verifiedBy,
        targetUrl: '/issues',
        badgeType: 'success',
      });
    }

    return updated;
  }

  static deleteSafetyIssue(id: string): boolean {
    const issues = this.getSafetyIssues();
    const target = issues.find((i) => i.id === id);
    if (!target) return false;

    // Unlink this issue from any checklist items in inspections
    const inspections = this.getInspections();
    let inspectionsChanged = false;
    for (const insp of inspections) {
      for (const item of insp.items) {
        if (item.linkedIssueId === id) {
          item.linkedIssueId = undefined;
          item.flaggedAsIssue = false;
          inspectionsChanged = true;
        }
      }
    }
    if (inspectionsChanged) {
      safeSet(STORAGE_KEYS.INSPECTIONS, inspections);
    }

    const filtered = issues.filter((i) => i.id !== id);
    safeSet(STORAGE_KEYS.ISSUES, filtered);
    this.syncBuildingActiveIssues(target.buildingId);
    return true;
  }

  // Activities
  static getActivities(): ActivityItem[] {
    return safeGet<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, mockActivities);
  }

  static addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): ActivityItem {
    const activities = this.getActivities();
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    activities.unshift(newActivity);
    safeSet(STORAGE_KEYS.ACTIVITIES, activities.slice(0, 20)); // keep last 20
    return newActivity;
  }

  // Readiness Metrics computation
  static getReadinessSummary() {
    const buildings = this.getBuildings();
    const inspections = this.getInspections();
    const drills = this.getDrills();
    const issues = this.getSafetyIssues();

    const registeredBuildingsCount = buildings.length;
    const totalFloorsCount = buildings.reduce((acc, b) => acc + (b.totalFloors || b.floorsCount || 0), 0);
    const completedDrillsCount = drills.filter((d) => d.status === 'completed').length;
    const plannedDrillsCount = drills.filter((d) => d.status === 'planned' || d.status === 'in_progress').length;
    
    const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress');
    const openIssuesCount = openIssues.length;
    const criticalIssuesCount = openIssues.filter((i) => i.priority === 'critical' || i.priority === 'high').length;
    const resolvedIssuesCount = issues.filter((i) => i.status === 'resolved').length;
    const verifiedIssuesCount = issues.filter((i) => i.status === 'verified').length;

    // pendingInspectionsCount:
    // Inspections that have unchecked items (notCheckedCount > 0 or status === 'pending')
    // OR completed inspections with active/unresolved deficiencies.
    const pendingInspectionsCount = inspections.filter((i) => {
      // 1. Incomplete audit (has unchecked items)
      if ((i.notCheckedCount || 0) > 0 || i.status === 'pending') return true;
      // 2. Audit with deficiencies: only pending if at least one deficiency is NOT resolved/verified
      if (i.status === 'needs_attention' || (i.attentionCount || 0) > 0) {
        return i.items.some((item) => {
          if (item.status !== 'needs_attention') return false;
          if (!item.linkedIssueId) return true; // Defect with no ticket yet
          const linked = issues.find((iss) => iss.id === item.linkedIssueId);
          return !linked || (linked.status !== 'resolved' && linked.status !== 'verified');
        });
      }
      return false;
    }).length;

    // Transparent Institutional Readiness Score calculation:
    // Base 100 - (critical issues * 8) - (medium issues * 3) - (pending inspections * 4) + (completed drills bonus)
    const penalty = (criticalIssuesCount * 8) + ((openIssuesCount - criticalIssuesCount) * 3) + (pendingInspectionsCount * 4);
    const bonus = Math.min(8, completedDrillsCount * 2);
    const calculatedScore = Math.max(45, Math.min(99, 100 - penalty + bonus));

    return {
      registeredBuildingsCount,
      totalFloorsCount,
      completedDrillsCount,
      plannedDrillsCount,
      openIssuesCount,
      criticalIssuesCount,
      resolvedIssuesCount,
      verifiedIssuesCount,
      pendingInspectionsCount,
      overallReadinessScore: calculatedScore,
      isDemoData: true,
    };
  }
}

// Automatically init on first import
DataService.init();
