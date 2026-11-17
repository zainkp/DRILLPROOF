import { ChecklistItem } from '../types';

export interface InspectionCategoryDef {
  id: string;
  name: string;
  description: string;
  defaultItems: Omit<ChecklistItem, 'status' | 'notes' | 'flaggedAsIssue'>[];
}

export const INSPECTION_CATEGORIES: InspectionCategoryDef[] = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Institutional Audit',
    description: 'Multi-domain readiness inspection covering egress, fire suppression, alarms, electrical, and first aid.',
    defaultItems: [
      {
        id: 'chk-comp-01',
        category: 'exits_and_evacuation',
        label: 'Emergency exits unlatched, unlocked, and unobstructed',
      },
      {
        id: 'chk-comp-02',
        category: 'exits_and_evacuation',
        label: 'Corridors and primary escape routes free from combustible storage and tripping hazards',
      },
      {
        id: 'chk-comp-03',
        category: 'extinguishers_equipment',
        label: 'Fire extinguisher pressure gauge in green operating zone with intact inspection tag',
      },
      {
        id: 'chk-comp-04',
        category: 'fire_safety',
        label: 'Manual alarm call points visible, unobstructed, with unbroken protective cover',
      },
      {
        id: 'chk-comp-05',
        category: 'lighting_and_signage',
        label: 'Illuminated exit directional signs fully lit with operational battery backup',
      },
      {
        id: 'chk-comp-06',
        category: 'lighting_and_signage',
        label: 'Emergency evacuation map placards posted at main corridors and elevator banks',
      },
      {
        id: 'chk-comp-07',
        category: 'first_aid',
        label: 'First-aid kit accessible, fully stocked with in-date sterile supplies, and unsealed',
      },
      {
        id: 'chk-comp-08',
        category: 'electrical',
        label: 'Electrical distribution panels have 1-meter clear clearance with no exposed wiring',
      },
      {
        id: 'chk-comp-09',
        category: 'general_safety',
        label: 'Emergency contact placards and warden roster updated with current telephone numbers',
      },
    ],
  },
  {
    id: 'fire_safety',
    name: 'Fire Safety & Smoke Compartmentalization',
    description: 'Verification of fire containment barriers, alarms, sprinkler clearances, and smoke seals.',
    defaultItems: [
      {
        id: 'chk-fire-01',
        category: 'fire_safety',
        label: 'Fire alarm manual pull stations visible, accessible, with intact tamper seal',
      },
      {
        id: 'chk-fire-02',
        category: 'fire_safety',
        label: 'Self-closing fire barrier doors latch securely without door wedges or obstructions',
      },
      {
        id: 'chk-fire-03',
        category: 'fire_safety',
        label: 'Intumescent fire door perimeter smoke seals intact with no cracks or gaps',
      },
      {
        id: 'chk-fire-04',
        category: 'fire_safety',
        label: 'Automatic sprinkler heads maintain minimum 45cm vertical clearance from shelving',
      },
      {
        id: 'chk-fire-05',
        category: 'fire_safety',
        label: 'Flammable chemical and hazardous solvent storage cabinets properly grounded and locked',
      },
    ],
  },
  {
    id: 'exits_and_evacuation',
    name: 'Emergency Exits & Evacuation Access',
    description: 'Inspection of stairwells, exit corridors, panic hardware, and exterior assembly pathways.',
    defaultItems: [
      {
        id: 'chk-exit-01',
        category: 'exits_and_evacuation',
        label: 'Emergency exit doors open outward smoothly with single-motion panic push-bars',
      },
      {
        id: 'chk-exit-02',
        category: 'exits_and_evacuation',
        label: 'Stairwell landings and flights free of stored equipment, packaging, or obstacles',
      },
      {
        id: 'chk-exit-03',
        category: 'exits_and_evacuation',
        label: 'Corridors maintain designated minimum continuous egress width (1.5m minimum)',
      },
      {
        id: 'chk-exit-04',
        category: 'exits_and_evacuation',
        label: 'External exit discharge paths and ADA ramp landings clear of parked vehicles or debris',
      },
    ],
  },
  {
    id: 'extinguishers_equipment',
    name: 'Fire Extinguishers & Safety Equipment',
    description: 'Physical audit of portable cylinders, hose reels, hydrants, and suppression systems.',
    defaultItems: [
      {
        id: 'chk-ext-01',
        category: 'extinguishers_equipment',
        label: 'Fire extinguishers mounted at required height (maximum 1.5m) in marked wall brackets',
      },
      {
        id: 'chk-ext-02',
        category: 'extinguishers_equipment',
        label: 'Extinguisher pressure indicators inside green operating zone with intact safety pin',
      },
      {
        id: 'chk-ext-03',
        category: 'extinguishers_equipment',
        label: 'Inspection maintenance service tags signed within the past 12 months',
      },
      {
        id: 'chk-ext-04',
        category: 'extinguishers_equipment',
        label: 'Fire hose reel nozzles operational and hoses free of dry rot or water leaks',
      },
      {
        id: 'chk-ext-05',
        category: 'extinguishers_equipment',
        label: 'Automated gaseous clean-agent suppression panels (server rooms/labs) in standby mode',
      },
    ],
  },
  {
    id: 'lighting_and_signage',
    name: 'Emergency Lighting & Signage',
    description: 'Illumination verification for primary egress corridors, photoluminescent signs, and stairwells.',
    defaultItems: [
      {
        id: 'chk-light-01',
        category: 'lighting_and_signage',
        label: 'Illuminated exit signs operational on mains power with no dark LED sectors',
      },
      {
        id: 'chk-light-02',
        category: 'lighting_and_signage',
        label: 'Emergency battery backup lights pass 30-second manual test button push',
      },
      {
        id: 'chk-light-03',
        category: 'lighting_and_signage',
        label: 'Photoluminescent floor markings and directional floor arrows visible in darkened state',
      },
      {
        id: 'chk-light-04',
        category: 'lighting_and_signage',
        label: 'Stairwell step edge nosing strips intact and slip-resistant',
      },
    ],
  },
  {
    id: 'first_aid',
    name: 'First-Aid Readiness & AED Assets',
    description: 'Inspection of trauma kits, eye-wash stations, AED defibrillators, and medical consumables.',
    defaultItems: [
      {
        id: 'chk-med-01',
        category: 'first_aid',
        label: 'First-aid kits sealed with breakable tamper tag and complete inventory list',
      },
      {
        id: 'chk-med-02',
        category: 'first_aid',
        label: 'Sterile bandages, burn dressings, and eye-wash solutions in-date (unexpired)',
      },
      {
        id: 'chk-med-03',
        category: 'first_aid',
        label: 'AED defibrillator status light flashing green with pads and battery within expiry',
      },
      {
        id: 'chk-med-04',
        category: 'first_aid',
        label: 'Emergency eye-wash stations and chemical safety showers deliver clear water on test pull',
      },
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical Safety & Distribution Hazards',
    description: 'Audit of panel clearances, extension cables, overloaded sockets, and generator changeovers.',
    defaultItems: [
      {
        id: 'chk-elec-01',
        category: 'electrical',
        label: 'Distribution board panels fully latched and free of storage within 1.0m radius',
      },
      {
        id: 'chk-elec-02',
        category: 'electrical',
        label: 'No daisy-chained power strips, damaged insulation, or exposed wiring conductors',
      },
      {
        id: 'chk-elec-03',
        category: 'electrical',
        label: 'Emergency generator automatic transfer switch (ATS) indicator lights in normal mode',
      },
      {
        id: 'chk-elec-04',
        category: 'electrical',
        label: 'High-voltage switchgear rooms locked with authorized-personnel warning placards',
      },
    ],
  },
  {
    id: 'general_safety',
    name: 'General Facility & Egress Readiness',
    description: 'General housekeeping, housekeeping hazards, emergency assembly signs, and warden postings.',
    defaultItems: [
      {
        id: 'chk-gen-01',
        category: 'general_safety',
        label: 'Emergency contact placards displayed at building entrances with current numbers',
      },
      {
        id: 'chk-gen-02',
        category: 'general_safety',
        label: 'Assembly area rally posts and boundary markings clear of construction activity',
      },
      {
        id: 'chk-gen-03',
        category: 'general_safety',
        label: 'No accumulation of combustible waste, wooden pallets, or cardboard in service areas',
      },
      {
        id: 'chk-gen-04',
        category: 'general_safety',
        label: 'Roof access and mechanical plant room fire egress doors unblocked from inside',
      },
    ],
  },
];

export function getChecklistForCategory(categoryId: string): ChecklistItem[] {
  const category = INSPECTION_CATEGORIES.find((c) => c.id === categoryId) || INSPECTION_CATEGORIES[0];
  return category.defaultItems.map((item) => ({
    ...item,
    status: 'not_checked' as const, // Strict requirement: never automatically mark as pass!
    notes: '',
    flaggedAsIssue: false,
  }));
}
