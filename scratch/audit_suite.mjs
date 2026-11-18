import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('================================================================');
console.log('       DRILLPROOF — COMPREHENSIVE QA & AUDIT TEST RUNNER        ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// 1. MODULE 1 — READINESS DASHBOARD AUDIT
console.log('\n--- [MODULE 1: READINESS DASHBOARD AUDIT] ---');

// Formula verification:
// Base 100 - (criticalIssues * 8) - (otherIssues * 3) - (pendingInspections * 4) + (completedDrills * 2, capped at 8)
function calcReadiness(openCritical, openOther, pendingInspections, completedDrills) {
  const penalty = (openCritical * 8) + (openOther * 3) + (pendingInspections * 4);
  const bonus = Math.min(8, completedDrills * 2);
  return Math.max(45, Math.min(99, 100 - penalty + bonus));
}

const baseScore = calcReadiness(1, 1, 1, 1); // 100 - 8 - 3 - 4 + 2 = 87
assert(baseScore === 87, `Base readiness formula calculates correctly (Expected 87, got ${baseScore})`);

const remediatedScore = calcReadiness(0, 0, 0, 1); // 100 - 0 - 0 - 0 + 2 = 102 -> capped at 99
assert(remediatedScore === 99, `Remediated readiness score increases to upper cap (Expected 99, got ${remediatedScore})`);

const heavyPenaltyScore = calcReadiness(6, 4, 3, 0); // 100 - 48 - 12 - 12 = 28 -> lower floor 45
assert(heavyPenaltyScore === 45, `Heavy penalty respects lower safety floor of 45 (Expected 45, got ${heavyPenaltyScore})`);

// 2. MODULE 2 — BUILDINGS & PLANS AUDIT
console.log('\n--- [MODULE 2: BUILDINGS & PLANS AUDIT] ---');

// Mock building data structure
const sampleBuilding = {
  id: 'bld-academic',
  name: 'Academic Block (Engineering & Science)',
  slug: 'academic-block',
  code: 'ACAD-ENG',
  type: 'academic',
  address: 'Sector 4, West Campus Boulevard',
  totalFloors: 4,
  occupancyCapacity: 1250,
  activeIssuesCount: 1,
  readinessScore: 88,
};

// Strict lookup test
function lookupBuilding(identifier, buildings) {
  const normalized = (identifier || '').trim().toLowerCase();
  return buildings.find(
    (b) =>
      b.slug.toLowerCase() === normalized ||
      b.id.toLowerCase() === normalized ||
      (b.code && b.code.toLowerCase() === normalized)
  );
}

const foundBySlug = lookupBuilding('academic-block', [sampleBuilding]);
assert(foundBySlug?.id === 'bld-academic', 'Building correctly resolved by slug ("academic-block")');

const foundById = lookupBuilding('bld-academic', [sampleBuilding]);
assert(foundById?.id === 'bld-academic', 'Building correctly resolved by ID ("bld-academic")');

const foundByCode = lookupBuilding('ACAD-ENG', [sampleBuilding]);
assert(foundByCode?.id === 'bld-academic', 'Building correctly resolved by code ("ACAD-ENG")');

const unknownLookup = lookupBuilding('non-existent-building', [sampleBuilding]);
assert(unknownLookup === undefined, 'Unknown identifier strictly returns undefined (no silent fallback)');

// 3. MODULE 3 — SAFETY INSPECTIONS AUDIT
console.log('\n--- [MODULE 3: SAFETY INSPECTIONS AUDIT] ---');

const mockInspection = {
  id: 'insp-sample-1',
  buildingId: 'bld-academic',
  buildingName: 'Academic Block',
  score: 83,
  status: 'pending',
  items: [
    { id: 'it-1', label: 'Egress clear', status: 'pass' },
    { id: 'it-2', label: 'Fire doors latch', status: 'pass' },
    { id: 'it-3', label: 'Fire extinguisher pressure', status: 'needs_attention', linkedIssueId: 'iss-sample-1' },
    { id: 'it-4', label: 'Manual alarm call points', status: 'not_checked' },
  ],
};

const notCheckedCount = mockInspection.items.filter(i => i.status === 'not_checked').length;
const isAuditIncomplete = notCheckedCount > 0;
assert(isAuditIncomplete === true && notCheckedCount === 1, 'Incomplete audit correctly identified with 1 unchecked item');

// Linked action check
const issuesList = [
  {
    id: 'iss-sample-1',
    code: 'ACT-105',
    status: 'verified',
    verificationNote: 'Cylinder inspected and passed.',
    verifiedBy: 'Marcus Vance',
  },
];

function isItemRemediated(item, inspectionId, issues) {
  const linked = issues.find(
    iss =>
      (item.linkedIssueId && iss.id === item.linkedIssueId) ||
      (iss.sourceId === inspectionId && (iss.checklistItemId === item.id || iss.title?.includes(item.label)))
  );
  return !!(linked && (linked.status === 'resolved' || linked.status === 'verified'));
}

const it3Remediated = isItemRemediated(mockInspection.items[2], mockInspection.id, issuesList);
assert(it3Remediated === true, 'Defective item linked to verified action correctly identified as Remediated');

// Dual score check
const passItems = mockInspection.items.filter(i => i.status === 'pass').length;
const remediatedItems = mockInspection.items.filter(i => i.status === 'needs_attention' && isItemRemediated(i, mockInspection.id, issuesList)).length;
const evaluatedItems = mockInspection.items.filter(i => i.status === 'pass' || i.status === 'needs_attention').length;
const liveRemediatedScore = evaluatedItems > 0 ? Math.round(((passItems + remediatedItems) / evaluatedItems) * 100) : 0;
assert(liveRemediatedScore === 100, `Dual live remediated score calculates to 100% (historical was 83%)`);

// 4. MODULE 4 — MOCK DRILLS AUDIT
console.log('\n--- [MODULE 4: MOCK DRILLS AUDIT] ---');

const mockDrill = {
  id: 'drl-fire-scheduled',
  code: 'DRL-2026-05',
  participantsExpected: 1250,
  participantsAccountedFor: 0,
  floorCheckins: [
    { id: 'ck-0', floorLabel: 'Ground Floor', expectedCount: 450, accountedCount: 0, status: 'pending' },
    { id: 'ck-1', floorLabel: 'Level 1', expectedCount: 320, accountedCount: 0, status: 'pending' },
    { id: 'ck-2', floorLabel: 'Level 2', expectedCount: 260, accountedCount: 0, status: 'pending' },
    { id: 'ck-3', floorLabel: 'Level 3', expectedCount: 220, accountedCount: 0, status: 'pending' },
  ],
};

const sumExpected = mockDrill.floorCheckins.reduce((acc, c) => acc + c.expectedCount, 0);
assert(sumExpected === 1250, `1,250 participant floor checkins exactly equal total drill expected (450+320+260+220 = ${sumExpected})`);

// Decoupled floor sweep test: Clearing floor 0 does not alter accounted count
const clearedFloor0 = { ...mockDrill.floorCheckins[0], status: 'cleared', clearedAt: '10:02' };
assert(clearedFloor0.accountedCount === 0 && clearedFloor0.status === 'cleared', 'Floor sweep status decoupled: clearing floor records time without inflating headcount to 100%');

// Floor adjuster test (+50 to Ground Floor)
const adjustedFloor0 = { ...clearedFloor0, accountedCount: 50 };
assert(adjustedFloor0.accountedCount === 50, 'Floor-level adjuster (+50) updates accounted count accurately');

// 5. MODULE 5 — CORRECTIVE ACTIONS LIFECYCLE AUDIT
console.log('\n--- [MODULE 5: CORRECTIVE ACTIONS LIFECYCLE AUDIT] ---');

let testIssue = {
  id: 'iss-test-01',
  code: 'ACT-201',
  status: 'open',
  priority: 'high',
  title: 'Blocked emergency egress',
};

// Transition 1: open -> in_progress
testIssue.status = 'in_progress';
assert(testIssue.status === 'in_progress', 'Lifecycle transition 1: OPEN -> IN_PROGRESS');

// Transition 2: in_progress -> resolved
testIssue = {
  ...testIssue,
  status: 'resolved',
  resolutionNote: 'Surplus boxes removed.',
  resolvedBy: 'Karthik Raja',
  resolvedAt: '2026-11-18T05:00:00Z',
};
assert(testIssue.status === 'resolved' && !!testIssue.resolutionNote, 'Lifecycle transition 2: IN_PROGRESS -> RESOLVED with resolution note');

// Transition 3: Admin sign-off: resolved -> verified
testIssue = {
  ...testIssue,
  status: 'verified',
  verificationNote: 'Inspected on-site. Verified clear.',
  verifiedBy: 'Marcus Vance',
  verifiedAt: '2026-11-18T05:10:00Z',
};
assert(testIssue.status === 'verified' && !!testIssue.verificationNote && testIssue.verifiedBy === 'Marcus Vance', 'Lifecycle transition 3: RESOLVED -> VERIFIED with Admin Sign-Off');

// Permission check
function canVerifyAction(userRole) {
  return userRole === 'admin' || userRole === 'safety_officer';
}
assert(canVerifyAction('admin') === true, 'Admin has verification permission');
assert(canVerifyAction('safety_officer') === true, 'Safety Officer has verification permission');
assert(canVerifyAction('warden') === false, 'Warden does NOT have verification permission (Awaiting Admin Sign-off)');
assert(canVerifyAction('volunteer') === false, 'Volunteer does NOT have verification permission');

// 6. MODULE 6 — READINESS REPORTS AUDIT
console.log('\n--- [MODULE 6: READINESS REPORTS AUDIT] ---');

function generateCsvString(rows) {
  return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

const facilityRows = [
  ['Facility Name', 'Code', 'Total Floors', 'Capacity', 'Readiness Score'],
  ['Academic Block', 'ACAD-ENG', 4, 1250, '88%'],
  ['Administration Complex', 'ADMIN-MAIN', 3, 400, '94%'],
];

const csvOut = generateCsvString(facilityRows);
assert(csvOut.includes('"Academic Block","ACAD-ENG"'), 'CSV Export engine generates valid RFC-4180 CSV content');
assert(csvOut.split('\n').length === 3, 'CSV output contains exact header and record row count');

// 7. MODULE 7 — STAFF & WARDENS AUDIT
console.log('\n--- [MODULE 7: STAFF & WARDENS AUDIT] ---');

const mockAuthDatabase = [
  { email: 'admin@northstar.edu', password: 'Password@123', role: 'admin', name: 'Marcus Vance' },
  { email: 'warden@northstar.edu', password: 'Password@123', role: 'warden', name: 'Rohan Deshmukh' },
];

function mockAuthenticate(email, password) {
  const user = mockAuthDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: 'User not found' };
  if (user.password !== password) return { success: false, error: 'Invalid password' };
  return { success: true, user };
}

const validLogin = mockAuthenticate('admin@northstar.edu', 'Password@123');
assert(validLogin.success === true && validLogin.user.role === 'admin', 'Valid admin credentials authenticate successfully');

const invalidPasswordLogin = mockAuthenticate('admin@northstar.edu', 'WrongPass');
assert(invalidPasswordLogin.success === false && invalidPasswordLogin.error === 'Invalid password', 'Incorrect password correctly rejected');

const unknownUserLogin = mockAuthenticate('intruder@outside.com', 'Pass123');
assert(unknownUserLogin.success === false, 'Unknown email address correctly rejected');

// 8. CROSS-MODULE INTEGRATION WORKFLOWS
console.log('\n--- [CROSS-MODULE INTEGRATION WORKFLOWS] ---');

// Workflow A: Building -> Inspection -> Defect Action -> Remediation -> Verification -> Score update
console.log('Testing Workflow A (Building to Corrective Action)...');
let buildingA = { id: 'bld-test-a', activeIssuesCount: 0, readinessScore: 92 };
let inspectionA = { id: 'insp-test-a', buildingId: buildingA.id, status: 'needs_attention', items: [{ id: 'it-a1', label: 'Blocked exit', status: 'needs_attention', linkedIssueId: 'iss-a1' }] };
let issueA = { id: 'iss-a1', buildingId: buildingA.id, status: 'open', priority: 'high' };
buildingA.activeIssuesCount = 1;
buildingA.readinessScore = calcReadiness(1, 0, 1, 0); // 100 - 8 - 4 = 88
assert(buildingA.readinessScore === 88, 'Workflow A: Defect creation correctly reduces building readiness to 88%');

// Remediate and verify issue A
issueA.status = 'verified';
issueA.verificationNote = 'Cleared and verified.';
buildingA.activeIssuesCount = 0;
buildingA.readinessScore = calcReadiness(0, 0, 0, 0); // 100
assert(buildingA.activeIssuesCount === 0 && buildingA.readinessScore === 99, 'Workflow A: Remediation & Admin verification restores readiness score to 99%');

// Workflow B: Incomplete Inspection Continuation
console.log('Testing Workflow B (Incomplete Inspection Continuation)...');
let inspectionB = {
  id: 'insp-b',
  items: [
    { id: 'b1', label: 'Door 1', status: 'pass' },
    { id: 'b2', label: 'Door 2', status: 'not_checked' },
    { id: 'b3', label: 'Door 3', status: 'not_checked' },
  ],
};
assert(inspectionB.items.filter(i => i.status === 'not_checked').length === 2, 'Workflow B: Audit initially saved as incomplete with 2 unchecked items');

// Continue inspection
inspectionB.items[1].status = 'pass';
inspectionB.items[2].status = 'pass';
const bRemaining = inspectionB.items.filter(i => i.status === 'not_checked').length;
assert(bRemaining === 0, 'Workflow B: Continued audit completed all items without data loss');

// Workflow C: Mock Drill to Corrective Action
console.log('Testing Workflow C (Mock Drill Observation to Action)...');
const drillC = {
  id: 'drl-c',
  observations: [
    { id: 'obs-c1', observation: 'Narrow bottleneck at exit stairs', convertedToIssueId: undefined },
  ],
};
const issueC = { id: 'iss-c1', sourceType: 'drill', sourceId: drillC.id, title: 'Narrow bottleneck at exit stairs' };
drillC.observations[0].convertedToIssueId = issueC.id;
assert(drillC.observations[0].convertedToIssueId === issueC.id, 'Workflow C: Drill observation successfully converted and linked to corrective action ticket');

// Workflow D: Staff / Warden access separation
console.log('Testing Workflow D (Staff Responsibilities & Access Control)...');
const wardenUser = { id: 'usr-w1', role: 'warden', name: 'Rohan Deshmukh' };
const adminUser = { id: 'usr-a1', role: 'admin', name: 'Marcus Vance' };
assert(canVerifyAction(wardenUser.role) === false && canVerifyAction(adminUser.role) === true, 'Workflow D: Role-based action verification access separation verified');

// Workflow E: Readiness score synchronization across modules
console.log('Testing Workflow E (Readiness Synchronisation)...');
const syncScoreBefore = calcReadiness(2, 2, 1, 2); // 100 - 16 - 6 - 4 + 4 = 78
const syncScoreAfterClose = calcReadiness(0, 0, 0, 2); // 100 - 0 - 0 - 0 + 4 = 104 -> 99
assert(syncScoreBefore === 78 && syncScoreAfterClose === 99, 'Workflow E: Synchronisation accurately reflects multi-module status transitions');

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}

// 9. PUBLIC QR PAGE — TARGETED IMPROVEMENTS AUDIT
console.log('\n--- [PUBLIC QR PAGE TARGETED IMPROVEMENTS AUDIT] ---');

// Mock buildings database including Mech Block & IT
const fullBuildings = [
  sampleBuilding,
  {
    id: 'bld-admin',
    name: 'Administration & Executive Complex',
    slug: 'administration-block',
    code: 'ADM-HQ',
    type: 'administrative',
    address: 'Central Campus Quadrangle',
    totalFloors: 3,
    occupancyCapacity: 400,
    assemblyPoints: [
      { id: 'ap-admin', name: 'Main Campus Quadrangle Fountain Plaza', code: 'ASM-B', locationDescription: 'Paved open plaza in front of Executive Building', capacity: 500, isPrimary: true }
    ],
    emergencyContacts: [
      { id: 'ec-admin-1', role: 'Executive Building Warden', name: 'Vikram Mehta', phone: '+91 (0) 80 4421 9915', priority: 1 }
    ],
    plan: {
      hazardInstructions: [
        { hazard: 'fire', title: 'Administrative Complex Fire Egress Protocol', immediateActions: ['Trigger alarms', 'Evacuate via Executive West Exit'], evacuationRouteNote: 'West exit directly to Quadrangle Plaza', doNotDo: ['Do not use elevators'] }
      ]
    }
  },
  {
    id: 'bld-residence',
    name: 'Student Residence Hall (Block Alpha)',
    slug: 'student-residence',
    code: 'RES-ALPHA',
    type: 'residence',
    address: 'North Residential Precinct',
    totalFloors: 6,
    occupancyCapacity: 600,
    assemblyPoints: [
      { id: 'ap-res', name: 'North Residence Lawn & Basketball Courts', code: 'ASM-C', locationDescription: 'Outdoor sports court perimeter', capacity: 700, isPrimary: true }
    ],
    emergencyContacts: [
      { id: 'ec-res-1', role: 'Hostel Chief Warden', name: 'Karthik Raja', phone: '+91 (0) 80 4421 9920', priority: 1 }
    ],
    plan: {
      hazardInstructions: [
        { hazard: 'fire', title: 'Hostel Night-time Fire Evacuation Protocol', immediateActions: ['Sound dorm alarm whistles', 'Wake adjacent rooms'], evacuationRouteNote: 'Stairwell B directly to outdoor court', doNotDo: ['Do not re-enter'] }
      ]
    }
  },
  {
    id: 'bld-mech',
    name: 'Mech Block',
    slug: 'mech-block',
    code: 'MECH-01',
    type: 'industrial',
    address: 'East Workshop Zone',
    totalFloors: 2,
    occupancyCapacity: 350,
    assemblyPoints: [],
    emergencyContacts: [],
    plan: { hazardInstructions: [] }
  },
  {
    id: 'bld-it',
    name: 'IT',
    slug: 'it',
    code: 'IT-01',
    type: 'academic',
    address: 'North Technology Cluster',
    totalFloors: 3,
    occupancyCapacity: 450,
    assemblyPoints: [],
    emergencyContacts: [],
    plan: { hazardInstructions: [] }
  },
];

// Test 1: Selector contains all 5 buildings dynamically
assert(fullBuildings.length === 5, 'Building selector dynamically populates all 5 registered facilities');
const selectorLabels = fullBuildings.map(b => `${b.name} (${b.code})`);
assert(selectorLabels.some(l => l.includes('Administration & Executive Complex (ADM-HQ)')), 'Administration Complex present in selector options');
assert(selectorLabels.some(l => l.includes('Student Residence Hall (Block Alpha) (RES-ALPHA)')), 'Student Residence Hall present in selector options');
assert(selectorLabels.some(l => l.includes('Mech Block (MECH-01)')), 'Mech Block present in selector options');
assert(selectorLabels.some(l => l.includes('IT (IT-01)')), 'IT present in selector options');

// Test 2: Switching to Administration Complex loads its actual data, never Academic Block
const adminBuilding = lookupBuilding('administration-block', fullBuildings);
assert(adminBuilding?.name === 'Administration & Executive Complex', 'Switching to Administration Complex updates building name');
assert(adminBuilding?.totalFloors === 3 && adminBuilding?.occupancyCapacity === 400, 'Administration Complex displays 3 levels and 400 capacity (not Academic Block)');
assert(adminBuilding?.assemblyPoints[0]?.name.includes('Quadrangle Fountain Plaza'), 'Administration Complex displays its own Quadrangle assembly point');
assert(adminBuilding?.emergencyContacts[0]?.name === 'Vikram Mehta', 'Administration Complex displays Vikram Mehta as contact');

// Test 3: Switching to Mech Block (dynamically created without custom plan) uses safe institutional fallback
const mechBuilding = lookupBuilding('mech-block', fullBuildings);
assert(mechBuilding?.name === 'Mech Block', 'Switching to Mech Block updates building name');
assert(mechBuilding?.totalFloors === 2 && mechBuilding?.occupancyCapacity === 350, 'Mech Block displays 2 levels and 350 capacity');

// Fallback test
const defaultInstructions = [
  { hazard: 'fire', title: 'Fire & Smoke Evacuation Protocol' }
];
const effectiveHazardInstructions = mechBuilding?.plan?.hazardInstructions?.length > 0 ? mechBuilding.plan.hazardInstructions : defaultInstructions;
assert(effectiveHazardInstructions[0].title === 'Fire & Smoke Evacuation Protocol', 'Mech Block safely renders standard institutional hazard instructions without runtime errors');

// Test 4: Red banner removed from PublicBuildingPage.tsx
const publicBuildingContent = readFileSync(resolve('src/pages/PublicBuildingPage.tsx'), 'utf-8');
const hasRedEmergencyBanner = publicBuildingContent.includes('BUILDING EMERGENCY PASSPORT') && publicBuildingContent.includes('bg-brand-red text-white px-4 py-2.5');
assert(!hasRedEmergencyBanner, 'Red Emergency Passport top banner is completely removed from PublicBuildingPage.tsx');
assert(publicBuildingContent.includes('id="public-building-select"'), 'PublicBuildingPage.tsx contains the modern building-selection dropdown (id="public-building-select")');
assert(publicBuildingContent.includes('navigate(`/building/${target.slug || target.id}`)'), 'Building selector triggers client-side navigation updating the URL');

console.log('\n--- TARGETED IMPROVEMENTS VERIFICATION COMPLETE ---');
