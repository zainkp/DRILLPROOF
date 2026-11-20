// Comprehensive QA Test Runner for Fire Drill State Synchronization
// Covering Scenarios A through G as required by DRILLPROOF specification

console.log('================================================================');
console.log('    DRILLPROOF — FIRE DRILL STATE SYNCHRONIZATION AUDIT SUITE    ');
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

// 1. Initial Planned State Definition (as in mockData.ts)
function createInitialDrill() {
  return {
    id: 'drl-fire-scheduled',
    code: 'DRL-2026-05',
    institutionId: 'inst-northstar',
    buildingId: 'bld-academic',
    buildingName: 'Academic Block (Engineering & Science)',
    hazardType: 'fire',
    title: 'Scheduled Fire & Smoke Evacuation Drill',
    scenarioNotes: 'Scheduled full-facility fire and smoke evacuation simulation across all Academic Block floors.',
    scheduledAt: '2026-11-20T10:00:00Z',
    targetDurationSeconds: 300,
    status: 'planned',
    participantsExpected: 1250,
    participantsAccountedFor: 0,
    leadCoordinatorId: 'stf-01',
    leadCoordinatorName: 'Marcus Vance',
    floorCheckins: [
      { id: 'ck-sched-0', floorId: 'flr-acad-0', floorLabel: 'Ground Floor (Atrium & Lecture Halls 1-4)', wardenName: 'Prof. Ananya Sen (Building Warden)', accountedCount: 0, expectedCount: 450, status: 'pending' },
      { id: 'ck-sched-1', floorId: 'flr-acad-1', floorLabel: 'Level 1 (Computer Laboratories & Faculty Offices)', wardenName: 'Rohan Deshmukh (Floor Warden)', accountedCount: 0, expectedCount: 320, status: 'pending' },
      { id: 'ck-sched-2', floorId: 'flr-acad-2', floorLabel: 'Level 2 (Chemistry & Material Science Labs)', wardenName: 'Dr. Meera Nambiar (Floor Warden)', accountedCount: 0, expectedCount: 260, status: 'pending' },
      { id: 'ck-sched-3', floorId: 'flr-acad-3', floorLabel: 'Level 3 (Departmental Library & Research Suites)', wardenName: 'Tenzing Norbu (Floor Warden)', accountedCount: 0, expectedCount: 220, status: 'pending' },
    ],
    observations: [],
  };
}

// Operations mirroring DrillDetailPage & DataService
function computeMetrics(drill) {
  const totalAccounted = drill.floorCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  const totalExpected = drill.participantsExpected || drill.floorCheckins.reduce((s, c) => s + (c.expectedCount || 0), 0);
  const missingCount = Math.max(0, totalExpected - totalAccounted);
  const accountabilityRate = totalExpected > 0 ? Math.round((totalAccounted / totalExpected) * 100) : 0;
  const totalFloors = drill.floorCheckins.length;
  const clearedFloors = drill.floorCheckins.filter((c) => c.status === 'cleared').length;
  const floorClearanceRate = totalFloors > 0 ? Math.round((clearedFloors / totalFloors) * 100) : 0;
  return {
    totalAccounted,
    totalExpected,
    missingCount,
    accountabilityRate,
    totalFloors,
    clearedFloors,
    floorClearanceRate,
  };
}

// Mirror DrillDetailPage handleFloorCycle
function handleFloorCycle(drill, checkinId) {
  const currentTime = '10:05 am';
  const updatedCheckins = drill.floorCheckins.map((chk) => {
    if (chk.id === checkinId) {
      let nextStatus;
      let nextClearedAt = chk.clearedAt;
      let nextAccounted = chk.accountedCount;

      if (chk.status === 'cleared') {
        // Reopen sweep: switches to in_progress / sweeping, reverses floor headcount
        nextStatus = 'in_progress';
        nextClearedAt = undefined;
        nextAccounted = 0;
      } else if (chk.status === 'in_progress') {
        // Mark Cleared: switches to cleared with timestamp and marks all floor occupants accounted
        nextStatus = 'cleared';
        nextClearedAt = currentTime;
        nextAccounted = chk.expectedCount;
      } else {
        // pending: switches to in_progress
        nextStatus = 'in_progress';
      }

      return {
        ...chk,
        status: nextStatus,
        clearedAt: nextClearedAt,
        accountedCount: nextAccounted,
      };
    }
    return chk;
  });

  const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  return {
    ...drill,
    floorCheckins: updatedCheckins,
    participantsAccountedFor: newTotal,
  };
}

// Mirror DrillDetailPage handleAdjustFloorAccounted
function handleAdjustFloorAccounted(drill, checkinId, delta) {
  const currentTime = '10:06 am';
  const updatedCheckins = drill.floorCheckins.map((chk) => {
    if (chk.id === checkinId) {
      const newCount = Math.max(0, Math.min(chk.expectedCount, chk.accountedCount + delta));
      let nextStatus = chk.status;
      let nextClearedAt = chk.clearedAt;

      if (newCount === chk.expectedCount) {
        nextStatus = 'cleared';
        if (!nextClearedAt) nextClearedAt = currentTime;
      } else if (newCount < chk.expectedCount && chk.status === 'cleared') {
        nextStatus = 'in_progress';
        nextClearedAt = undefined;
      }

      return {
        ...chk,
        accountedCount: newCount,
        status: nextStatus,
        clearedAt: nextClearedAt,
      };
    }
    return chk;
  });
  const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  return {
    ...drill,
    floorCheckins: updatedCheckins,
    participantsAccountedFor: newTotal,
  };
}

// Mirror DrillDetailPage handleSetFloorAllAccounted
function handleSetFloorAllAccounted(drill, checkinId) {
  const currentTime = '10:07 am';
  const updatedCheckins = drill.floorCheckins.map((chk) => {
    if (chk.id === checkinId) {
      return {
        ...chk,
        accountedCount: chk.expectedCount,
        status: 'cleared',
        clearedAt: chk.clearedAt || currentTime,
      };
    }
    return chk;
  });
  const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  return {
    ...drill,
    floorCheckins: updatedCheckins,
    participantsAccountedFor: newTotal,
  };
}

// Mirror DrillDetailPage handleAdjustAccountability
function handleAdjustAccountability(drill, delta) {
  const currentTime = '10:08 am';
  const updatedCheckins = drill.floorCheckins.map((c) => ({ ...c }));
  if (delta > 0) {
    let remaining = delta;
    for (const chk of updatedCheckins) {
      if (remaining <= 0) break;
      const available = chk.expectedCount - chk.accountedCount;
      if (available > 0) {
        const toAdd = Math.min(available, remaining);
        chk.accountedCount += toAdd;
        remaining -= toAdd;
      }
      if (chk.accountedCount === chk.expectedCount) {
        chk.status = 'cleared';
        if (!chk.clearedAt) chk.clearedAt = currentTime;
      } else if (chk.status === 'pending') {
        chk.status = 'in_progress';
      }
    }
  } else if (delta < 0) {
    let remaining = Math.abs(delta);
    for (let i = updatedCheckins.length - 1; i >= 0; i--) {
      if (remaining <= 0) break;
      const chk = updatedCheckins[i];
      if (chk.accountedCount > 0) {
        const toSub = Math.min(chk.accountedCount, remaining);
        chk.accountedCount -= toSub;
        remaining -= toSub;
      }
      if (chk.accountedCount < chk.expectedCount && chk.status === 'cleared') {
        chk.status = 'in_progress';
        chk.clearedAt = undefined;
      }
    }
  }

  const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  return {
    ...drill,
    floorCheckins: updatedCheckins,
    participantsAccountedFor: newTotal,
  };
}

// Mirror DrillDetailPage handleSetAllAccounted
function handleSetAllAccounted(drill) {
  const currentTime = '10:09 am';
  const updatedCheckins = drill.floorCheckins.map((chk) => ({
    ...chk,
    accountedCount: chk.expectedCount,
    status: 'cleared',
    clearedAt: chk.clearedAt || currentTime,
  }));
  const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  return {
    ...drill,
    floorCheckins: updatedCheckins,
    participantsAccountedFor: newTotal,
  };
}

// DataService Reconciler function
function reconcileDrills(storedDrills) {
  for (const drl of storedDrills) {
    // Reconcile cleared floors whose accountedCount is out of sync with expectedCount
    for (const chk of drl.floorCheckins) {
      if (chk.status === 'cleared' && chk.accountedCount === 0 && chk.expectedCount > 0) {
        chk.accountedCount = chk.expectedCount;
      }
    }
    const realAccounted = drl.floorCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    drl.participantsAccountedFor = realAccounted;
  }
  return storedDrills;
}

// -------------------------------------------------------------
// TEST SUITE: SCENARIOS A THROUGH G
// -------------------------------------------------------------

console.log('--- [SCENARIO A: CLEAR ONE FLOOR] ---');
let drill = createInitialDrill();
// Transition Ground Floor from pending -> in_progress -> cleared
drill = handleFloorCycle(drill, 'ck-sched-0'); // starts sweep
assert(drill.floorCheckins[0].status === 'in_progress', 'Ground floor status transitions to in_progress');
assert(drill.floorCheckins[0].accountedCount === 0, 'In-progress floor retains 0 accounted before clearance');

drill = handleFloorCycle(drill, 'ck-sched-0'); // marks cleared
assert(drill.floorCheckins[0].status === 'cleared', 'Ground floor status transitions to cleared');
assert(drill.floorCheckins[0].accountedCount === 450, 'Ground floor accountedCount updates to full capacity (450)');

let metrics = computeMetrics(drill);
assert(metrics.totalAccounted === 450, `Global accounted immediately updates to 450 (got ${metrics.totalAccounted})`);
assert(metrics.missingCount === 800, `Missing count drops to 800 (1250 - 450 = 800, got ${metrics.missingCount})`);
assert(metrics.accountabilityRate === 36, `Accountability rate updates to 36% (got ${metrics.accountabilityRate}%)`);
assert(metrics.clearedFloors === 1, `Cleared floors shows 1 of 4 (got ${metrics.clearedFloors})`);
assert(metrics.floorClearanceRate === 25, `Floor clearance rate is 25% (got ${metrics.floorClearanceRate}%)`);

console.log('\n--- [SCENARIO B: CLEAR ALL FOUR FLOORS] ---');
// Clear Level 1 (320), Level 2 (260), Level 3 (220)
drill = handleFloorCycle(drill, 'ck-sched-1'); // start sweep
drill = handleFloorCycle(drill, 'ck-sched-1'); // mark cleared
drill = handleFloorCycle(drill, 'ck-sched-2'); // start sweep
drill = handleFloorCycle(drill, 'ck-sched-2'); // mark cleared
drill = handleFloorCycle(drill, 'ck-sched-3'); // start sweep
drill = handleFloorCycle(drill, 'ck-sched-3'); // mark cleared

metrics = computeMetrics(drill);
assert(metrics.clearedFloors === 4, `All 4 floors cleared: 4 of 4 (got ${metrics.clearedFloors})`);
assert(metrics.floorClearanceRate === 100, `Floor sweep coverage is 100% (got ${metrics.floorClearanceRate}%)`);
assert(drill.floorCheckins[0].accountedCount === 450, 'Ground Floor accounted is 450/450');
assert(drill.floorCheckins[1].accountedCount === 320, 'Level 1 accounted is 320/320');
assert(drill.floorCheckins[2].accountedCount === 260, 'Level 2 accounted is 260/260');
assert(drill.floorCheckins[3].accountedCount === 220, 'Level 3 accounted is 220/220');
assert(metrics.totalAccounted === 1250, `Total accounted is exactly 1250 (got ${metrics.totalAccounted})`);
assert(metrics.missingCount === 0, `Unaccounted/Missing is 0 (got ${metrics.missingCount})`);
assert(metrics.accountabilityRate === 100, `Accountability is exactly 100% (got ${metrics.accountabilityRate}%)`);

console.log('\n--- [SCENARIO C: REPEATED CLEARANCE (IDEMPOTENCY / NO DOUBLE-COUNTING)] ---');
// Re-marking full or already cleared floor must not duplicate count
drill = handleSetFloorAllAccounted(drill, 'ck-sched-0');
drill = handleSetFloorAllAccounted(drill, 'ck-sched-1');
metrics = computeMetrics(drill);
assert(metrics.totalAccounted === 1250, `Repeated clearance keeps total accounted at 1250 without double-counting (got ${metrics.totalAccounted})`);
assert(metrics.missingCount === 0, `Missing count stays 0 (got ${metrics.missingCount})`);
assert(drill.floorCheckins[0].accountedCount === 450, `Ground floor does not exceed 450 (got ${drill.floorCheckins[0].accountedCount})`);

console.log('\n--- [SCENARIO D: REOPEN ONE FLOOR] ---');
// Click "Reopen Sweep" on Level 1 (ck-sched-1, 320 occupants)
drill = handleFloorCycle(drill, 'ck-sched-1');
assert(drill.floorCheckins[1].status === 'in_progress', 'Level 1 status reverts to in_progress / sweeping');
assert(drill.floorCheckins[1].clearedAt === undefined, 'Level 1 clearedAt timestamp is reset to undefined');
assert(drill.floorCheckins[1].accountedCount === 0, 'Level 1 accounted count resets to 0 (unverified)');

metrics = computeMetrics(drill);
assert(metrics.clearedFloors === 3, `Cleared floors count updates to 3 of 4 (got ${metrics.clearedFloors})`);
assert(metrics.floorClearanceRate === 75, `Floor clearance rate drops to 75% (got ${metrics.floorClearanceRate}%)`);
assert(metrics.totalAccounted === 930, `Total accounted drops to 930 (1250 - 320 = 930, got ${metrics.totalAccounted})`);
assert(metrics.missingCount === 320, `Missing count increases to 320 (got ${metrics.missingCount})`);
assert(metrics.accountabilityRate === 74, `Accountability rate recalculates to 74% (got ${metrics.accountabilityRate}%)`);

console.log('\n--- [SCENARIO E: CLEAR REOPENED FLOOR AGAIN] ---');
// Click "Mark Cleared" on Level 1
drill = handleFloorCycle(drill, 'ck-sched-1');
assert(drill.floorCheckins[1].status === 'cleared', 'Level 1 status returns to cleared');
assert(drill.floorCheckins[1].clearedAt !== undefined, 'Level 1 clearedAt timestamp is set');
assert(drill.floorCheckins[1].accountedCount === 320, 'Level 1 accounted count returns to 320');

metrics = computeMetrics(drill);
assert(metrics.clearedFloors === 4, `Cleared floors returns to 4 of 4 (got ${metrics.clearedFloors})`);
assert(metrics.floorClearanceRate === 100, `Floor clearance rate returns to 100% (got ${metrics.floorClearanceRate}%)`);
assert(metrics.totalAccounted === 1250, `Total accounted returns to 1250 (got ${metrics.totalAccounted})`);
assert(metrics.missingCount === 0, `Missing count returns to 0 (got ${metrics.missingCount})`);
assert(metrics.accountabilityRate === 100, `Accountability rate returns to 100% (got ${metrics.accountabilityRate}%)`);

console.log('\n--- [SCENARIO F: MANUAL CONTROLS (+10, +50, ALL, -10)] ---');
let freshDrill = createInitialDrill(); // all pending, 0 accounted
// 1. Floor-level +50 on Ground floor
freshDrill = handleAdjustFloorAccounted(freshDrill, 'ck-sched-0', 50);
metrics = computeMetrics(freshDrill);
assert(freshDrill.floorCheckins[0].accountedCount === 50, `Ground floor shows 50/450 (got ${freshDrill.floorCheckins[0].accountedCount})`);
assert(metrics.totalAccounted === 50, `Global accounted shows 50/1250 (got ${metrics.totalAccounted})`);

// 2. Floor-level "All" on Level 3 (220)
freshDrill = handleSetFloorAllAccounted(freshDrill, 'ck-sched-3');
metrics = computeMetrics(freshDrill);
assert(freshDrill.floorCheckins[3].accountedCount === 220, `Level 3 shows 220/220 (got ${freshDrill.floorCheckins[3].accountedCount})`);
assert(freshDrill.floorCheckins[3].status === 'cleared', `Level 3 auto-transitions to cleared on reaching full capacity`);
assert(metrics.totalAccounted === 270, `Global accounted shows 270/1250 (50 + 220 = 270, got ${metrics.totalAccounted})`);

// 3. Floor-level -10 on Level 3 (from 220 -> 210)
freshDrill = handleAdjustFloorAccounted(freshDrill, 'ck-sched-3', -10);
assert(freshDrill.floorCheckins[3].accountedCount === 210, `Level 3 drops to 210/220`);
assert(freshDrill.floorCheckins[3].status === 'in_progress', `Level 3 reverts to in_progress when dropping below full capacity`);
assert(freshDrill.floorCheckins[3].clearedAt === undefined, `Level 3 cleared timestamp reset on dropping below capacity`);

// 4. Global "All (100%)" button
freshDrill = handleSetAllAccounted(freshDrill);
metrics = computeMetrics(freshDrill);
assert(metrics.totalAccounted === 1250, `Global All: total accounted is 1250`);
assert(metrics.clearedFloors === 4, `Global All: all 4 floors marked cleared`);
assert(metrics.missingCount === 0, `Global All: 0 missing`);
assert(metrics.accountabilityRate === 100, `Global All: 100% accountability rate`);

// 5. Global "-10" button
freshDrill = handleAdjustAccountability(freshDrill, -10);
metrics = computeMetrics(freshDrill);
assert(metrics.totalAccounted === 1240, `Global -10: total accounted drops to 1240 (got ${metrics.totalAccounted})`);
assert(freshDrill.floorCheckins[3].accountedCount === 210, `Global -10: top floor (Level 3) decremented from 220 to 210`);
assert(freshDrill.floorCheckins[3].status === 'in_progress', `Global -10: Level 3 reverts from cleared to in_progress`);

console.log('\n--- [SCENARIO G: DATA RECONCILIATION & PERSISTENCE (USER SCREENSHOT STATE)] ---');
// Reproduce exact state from user's screenshot: 4 cleared floors but 0 accounted!
const inconsistentDrill = {
  id: 'drl-fire-scheduled',
  code: 'DRL-2026-05',
  institutionId: 'inst-northstar',
  buildingId: 'bld-academic',
  buildingName: 'Academic Block (Engineering & Science)',
  hazardType: 'fire',
  title: 'Scheduled Fire & Smoke Evacuation Drill',
  participantsExpected: 1250,
  participantsAccountedFor: 0,
  floorCheckins: [
    { id: 'ck-sched-0', floorId: 'flr-acad-0', floorLabel: 'Ground Floor', accountedCount: 0, expectedCount: 450, status: 'cleared', clearedAt: '07:48 am' },
    { id: 'ck-sched-1', floorId: 'flr-acad-1', floorLabel: 'Level 1', accountedCount: 0, expectedCount: 320, status: 'cleared', clearedAt: '07:45 am' },
    { id: 'ck-sched-2', floorId: 'flr-acad-2', floorLabel: 'Level 2', accountedCount: 0, expectedCount: 260, status: 'cleared', clearedAt: '07:45 am' },
    { id: 'ck-sched-3', floorId: 'flr-acad-3', floorLabel: 'Level 3', accountedCount: 0, expectedCount: 220, status: 'cleared', clearedAt: '07:45 am' },
  ],
  observations: [],
};

// Simulate storage and reload through DataService.init() reconciler
const reloadedDrills = reconcileDrills([inconsistentDrill]);
const reconciled = reloadedDrills[0];
const reconciledMetrics = computeMetrics(reconciled);

assert(reconciled.floorCheckins[0].accountedCount === 450, `Ground Floor auto-reconciled to 450 (got ${reconciled.floorCheckins[0].accountedCount})`);
assert(reconciled.floorCheckins[1].accountedCount === 320, `Level 1 auto-reconciled to 320 (got ${reconciled.floorCheckins[1].accountedCount})`);
assert(reconciled.floorCheckins[2].accountedCount === 260, `Level 2 auto-reconciled to 260 (got ${reconciled.floorCheckins[2].accountedCount})`);
assert(reconciled.floorCheckins[3].accountedCount === 220, `Level 3 auto-reconciled to 220 (got ${reconciled.floorCheckins[3].accountedCount})`);
assert(reconciled.participantsAccountedFor === 1250, `participantsAccountedFor auto-reconciled to 1250 (got ${reconciled.participantsAccountedFor})`);
assert(reconciledMetrics.totalAccounted === 1250, `Global accounted displays 1250`);
assert(reconciledMetrics.missingCount === 0, `Missing count displays 0`);
assert(reconciledMetrics.accountabilityRate === 100, `Accountability rate displays 100%`);
assert(reconciledMetrics.clearedFloors === 4, `Cleared floors displays 4 of 4 (100%)`);

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) process.exit(1);
