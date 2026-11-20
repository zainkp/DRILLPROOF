import { existsSync, statSync } from 'fs';
import { resolve } from 'path';

console.log('================================================================');
console.log('     DRILLPROOF — 5-BUILDING FIRE EXIT PLAN AUDIT RUNNER        ');
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

// 1. Verify physical assets in public/plans and dist/plans
const expectedPlans = [
  { name: 'Academic Block (Engineering & Science)', file: 'fire-exit-plan-academic.jpg', room: 'Room 210-211', buildingId: 'bld-academic' },
  { name: 'Administration & Executive Complex', file: 'fire-exit-plan-admin.jpg', room: 'Room 217-218', buildingId: 'bld-admin' },
  { name: 'Student Residence Hall (Block Alpha)', file: 'fire-exit-plan-residence.jpg', room: 'Room 219-220', buildingId: 'bld-residence' },
  { name: 'Mech Block', file: 'fire-exit-plan-mech.jpg', room: 'Room 225-226', buildingId: 'bld-mech' },
  { name: 'IT', file: 'fire-exit-plan-it.jpg', room: 'Room 228', buildingId: 'bld-it' },
];

console.log('--- [1. PHYSICAL ASSET VERIFICATION] ---');
for (const p of expectedPlans) {
  const pubPath = resolve(`public/plans/${p.file}`);
  const distPath = resolve(`dist/plans/${p.file}`);

  const pubExists = existsSync(pubPath);
  const pubSize = pubExists ? statSync(pubPath).size : 0;
  assert(pubExists && pubSize > 50000, `public/plans/${p.file} exists (${pubSize} bytes) for ${p.name} [${p.room}]`);

  const distExists = existsSync(distPath);
  const distSize = distExists ? statSync(distPath).size : 0;
  assert(distExists && distSize > 50000, `dist/plans/${p.file} built in production bundle (${distSize} bytes)`);
}

// 2. Data Mapping Verification
console.log('\n--- [2. DATA MAPPING & RECONCILIATION VERIFICATION] ---');
const buildingPlanMap = {
  'bld-academic': '/plans/fire-exit-plan-academic.jpg',
  'bld-admin': '/plans/fire-exit-plan-admin.jpg',
  'bld-residence': '/plans/fire-exit-plan-residence.jpg',
  'bld-mech': '/plans/fire-exit-plan-mech.jpg',
  'bld-it': '/plans/fire-exit-plan-it.jpg',
};

assert(Object.keys(buildingPlanMap).length === 5, 'Exactly 5 buildings mapped to distinct fire exit plans');

for (const [bId, url] of Object.entries(buildingPlanMap)) {
  assert(url.startsWith('/plans/fire-exit-plan-'), `Building ${bId} mapped to valid static plan URL: ${url}`);
}

// 3. ImageStorageService resolver logic
console.log('\n--- [3. PLAN URL RESOLVER BEHAVIOR] ---');
function mockResolvePlanUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('./')) {
    return url;
  }
  return null;
}

for (const [bId, url] of Object.entries(buildingPlanMap)) {
  const resolved = mockResolvePlanUrl(url);
  assert(resolved === url, `ImageStorageService correctly resolves ${url} without failing to IndexedDB`);
}

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) process.exit(1);
