// Setup global localStorage mock before importing DataService
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

import { DataService } from '../src/services/dataService.ts';

console.log("=== Initializing DataService ===");
DataService.init();

const drill = DataService.getDrillById('drl-fire-scheduled');
console.log("Drill loaded:", drill ? drill.title : 'NOT FOUND');
console.log("Participants expected:", drill?.participantsExpected);
console.log("Participants accounted:", drill?.participantsAccountedFor);
console.log("Checkins count:", drill?.floorCheckins?.length);
drill?.floorCheckins.forEach((c) => {
  console.log(` - ${c.id} (${c.floorLabel}): expected=${c.expectedCount}, accounted=${c.accountedCount}, status=${c.status}`);
});
