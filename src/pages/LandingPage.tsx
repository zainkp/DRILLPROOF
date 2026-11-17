import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import {
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Building2,
  Activity,
  Layers,
  FileCheck,
  AlertTriangle,
  Users2,
  Compass,
  ShieldCheck,
  DoorOpen,
  Phone,
  Check,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { user } = useData();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const workflowSteps = [
    {
      num: '01',
      title: 'Plan',
      subtitle: 'Digitize Building Plans & Egress Routes',
      description:
        'Transform static PDF manuals and binder blueprints into living, mobile-accessible floor guides. Every wing, stairwell, and assembly zone is mapped to instant QR access points.',
      deliverable: 'Digital Floor Guides & Instant QR Codes',
      metric: '100% floor plan accessibility on any smartphone',
    },
    {
      num: '02',
      title: 'Inspect',
      subtitle: 'Verify Safety Equipment & Clear Corridors',
      description:
        'Equip safety wardens with structured verification checklists. Check fire extinguisher charge, emergency exit battery backups, and door swing clearances with automated deficiency escalation.',
      deliverable: 'Auditable Inspection Records & Status Tracking',
      metric: 'Zero unresolved safety asset discrepancies',
    },
    {
      num: '03',
      title: 'Practise',
      subtitle: 'Execute Timed Multi-Hazard Mock Drills',
      description:
        'Simulate fire, earthquake, flood, and medical incidents with timed drill sessions. Wardens log floor-by-floor clearances and account for occupants at designated muster posts.',
      deliverable: 'Timed Evacuation Logs & Accountability Rates',
      metric: 'Sub-5-minute evacuation target benchmark',
    },
    {
      num: '04',
      title: 'Improve',
      subtitle: 'Close Discovered Gaps Through Corrective Actions',
      description:
        'Turn drill bottlenecks, obstructed exits, and failed checklists directly into assigned facility tickets. Track remediation through physical verification and documented closure.',
      deliverable: 'Verified Remediation Dossier & Closed Tickets',
      metric: 'Continuous preparedness score improvement',
    },
  ];

  const environments = [
    {
      sector: 'Education',
      headline: 'Colleges, Universities & K-12 Schools',
      hazards: 'Fire, Earthquake, Lab Chemical Spills, Lockdown Evacuation',
      context:
        'Managing hundreds of students, multi-building campuses, laboratories, and residential hostels with nocturnal risk profiles.',
      operationalFocus: 'Classroom sweeps, laboratory chemical shut-offs, athletic field muster accountability.',
    },
    {
      sector: 'Workplaces',
      headline: 'Commercial Offices & High-Rise Towers',
      hazards: 'Fire & Smoke, Severe Weather, Medical Crisis, Structural Egress',
      context:
        'High-density vertical occupant flow, multi-tenant coordination, shift workers, and complex pressurized stairwell egress paths.',
      operationalFocus: 'Floor warden networks, tenant headcounts, server room FM-200 gaseous fire suppression.',
    },
    {
      sector: 'Healthcare',
      headline: 'Hospitals, Clinics & Care Facilities',
      hazards: 'Power Disruption, Gas Leak, Medical Triage, Fire Smoke Isolation',
      context:
        'High-dependency non-ambulatory patients, critical medical equipment, sterile zones, and strict continuous care obligations.',
      operationalFocus: 'Horizontal smoke compartmentalization, triage corridor clearance, ambulance staging.',
    },
    {
      sector: 'Industry',
      headline: 'Manufacturing Plants & Warehouses',
      hazards: 'Chemical Spills, Flash Flooding, Machinery Fires, Electrical Arc',
      context:
        'High-bay storage, heavy machinery, hazardous material storage, shift changes, and extensive footprint assembly zones.',
      operationalFocus: 'Emergency power cutoff, spill containment arcs, shift-change headcount verification.',
    },
  ];

  return (
    <div className="flex flex-col bg-brand-canvas text-brand-graphite-900 font-sans selection:bg-brand-red selection:text-white">
      {/* 1. HERO SECTION — ARCHITECTURAL, EDITORIAL & DECISIVE */}
      <section className="relative border-b border-brand-border bg-white pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative technical corner lines */}
        <div className="absolute top-0 left-0 w-32 h-32 border-r border-b border-brand-border/60 pointer-events-none hidden lg:block" />
        <div className="absolute top-0 right-0 w-32 h-32 border-l border-b border-brand-border/60 pointer-events-none hidden lg:block" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Direct Copy & Call to Action (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Product Identity Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-brand-border bg-brand-canvas text-[11px] font-semibold text-brand-graphite-800 mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="uppercase tracking-wider font-mono text-brand-red">DRILLPROOF</span>
                <span className="text-brand-graphite-400">/</span>
                <span className="text-brand-graphite-600">Institutional Emergency Readiness</span>
              </div>

              {/* Exact Requested Hero Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-graphite-950 tracking-tight leading-[1.08] font-sans">
                Don't just have a safety plan.{' '}
                <span className="text-brand-red block sm:inline">Prove your preparedness.</span>
              </h1>

              {/* Exact Requested Supporting Copy */}
              <p className="mt-6 text-base sm:text-lg text-brand-graphite-700 max-w-2xl leading-relaxed">
                Manage building safety, conduct emergency drills, track inspections and build a culture of preparedness.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link to={user ? "/dashboard" : "/login"}>
                  <Button
                    size="lg"
                    variant="primary"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full sm:w-auto font-semibold shadow-xs"
                  >
                    Explore the Platform
                  </Button>
                </Link>

                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto font-semibold border-brand-graphite-300 hover:border-brand-graphite-800"
                  >
                    Administrator Login
                  </Button>
                </Link>

                <Link
                  to="/building/academic-block"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden"
                >
                  <Button size="lg" variant="ghost" icon={QrCode} className="w-full text-xs">
                    View Demo QR Mobile Plan
                  </Button>
                </Link>
              </div>

              {/* Credibility & Prototype Transparency Note */}
              <div className="mt-8 pt-6 border-t border-brand-border/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-graphite-500 font-mono">
                <span className="flex items-center gap-1.5 text-brand-graphite-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Northstar Campus Case Simulation</span>
                </span>
                <span>&bull;</span>
                <span>Multi-Hazard Coverage</span>
                <span>&bull;</span>
                <span>Audit-Ready Tracking</span>
              </div>
            </div>

            {/* Right Column: Architectural Blueprint & Readiness Visual (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-brand-graphite-950 text-white rounded border border-brand-graphite-800 shadow-elevated p-6 relative overflow-hidden bg-tech-grid-dark">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-brand-graphite-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      SCHEMATIC: NORTHSTAR ACADEMIC
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    READINESS: 84%
                  </span>
                </div>

                {/* Architectural Blueprint Diagram (SVG Floor Plan Schematic) */}
                <div className="relative border border-brand-graphite-800 rounded bg-brand-graphite-900/90 p-4 mb-4">
                  <svg
                    viewBox="0 0 340 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto text-brand-graphite-400"
                  >
                    {/* Architectural Grid Lines */}
                    <line x1="10" y1="10" x2="330" y2="10" stroke="#2C2E33" strokeDasharray="3 3" />
                    <line x1="10" y1="110" x2="330" y2="110" stroke="#2C2E33" strokeDasharray="3 3" />
                    <line x1="10" y1="210" x2="330" y2="210" stroke="#2C2E33" strokeDasharray="3 3" />
                    <line x1="170" y1="10" x2="170" y2="210" stroke="#2C2E33" strokeDasharray="3 3" />

                    {/* Structural Boundary Walls */}
                    <rect x="20" y="20" width="300" height="180" rx="3" stroke="#4A4D53" strokeWidth="2" fill="none" />

                    {/* Interior Zones */}
                    {/* Zone West: CS Laboratories */}
                    <rect x="25" y="25" width="135" height="80" fill="#202124" stroke="#323438" />
                    <text x="35" y="45" fill="#8C909A" fontSize="9" fontFamily="monospace" fontWeight="bold">ZONE W1: IT LABS</text>
                    <text x="35" y="60" fill="#DFE1E5" fontSize="8" fontFamily="sans-serif">Level 1 Workstations</text>

                    {/* West Stairwell & Egress Route */}
                    <rect x="25" y="115" width="60" height="80" fill="#2A1B1D" stroke="#E51C23" strokeWidth="1.5" />
                    <text x="32" y="135" fill="#FDE8E9" fontSize="8" fontFamily="monospace" fontWeight="bold">WEST STAIR</text>
                    <path d="M 45 150 L 65 170 M 65 170 L 55 170 M 65 170 L 65 160" stroke="#E51C23" strokeWidth="2" />
                    <circle cx="75" cy="180" r="3" fill="#E51C23" />
                    <text x="30" y="190" fill="#F87171" fontSize="7" fontFamily="sans-serif">40% Door Swing Clear</text>

                    {/* Zone Central: Main Egress Atrium */}
                    <rect x="95" y="115" width="135" height="80" fill="#1A2421" stroke="#10B981" strokeWidth="1.5" />
                    <text x="105" y="135" fill="#A7F3D0" fontSize="9" fontFamily="monospace" fontWeight="bold">CENTRAL ATRIUM</text>
                    <text x="105" y="150" fill="#D1FAE5" fontSize="8" fontFamily="sans-serif">Primary Evacuation Path</text>
                    <path d="M 160 160 L 160 195 M 160 195 L 155 187 M 160 195 L 165 187" stroke="#10B981" strokeWidth="2.5" />

                    {/* Zone East: Lecture Halls & North Egress */}
                    <rect x="170" y="25" width="145" height="80" fill="#202124" stroke="#323438" />
                    <text x="180" y="45" fill="#8C909A" fontSize="9" fontFamily="monospace" fontWeight="bold">ZONE E1: LECTURE HALLS</text>
                    <text x="180" y="60" fill="#DFE1E5" fontSize="8" fontFamily="sans-serif">Capacity: 450 Occupants</text>

                    {/* East Pressurized Stairwell */}
                    <rect x="240" y="115" width="75" height="80" fill="#172228" stroke="#0284C7" strokeWidth="1.5" />
                    <text x="248" y="135" fill="#BAE6FD" fontSize="8" fontFamily="monospace" fontWeight="bold">EAST STAIR</text>
                    <text x="248" y="150" fill="#7DD3FC" fontSize="7" fontFamily="sans-serif">Pressurized Egress</text>

                    {/* Safety Equipment Pinpoints */}
                    <circle cx="150" cy="55" r="4" fill="#F47721" />
                    <text x="157" y="58" fill="#FDBA74" fontSize="7" fontFamily="monospace">EXT-01</text>

                    <circle cx="115" cy="170" r="4" fill="#10B981" />
                    <text x="122" y="173" fill="#6EE7B7" fontSize="7" fontFamily="monospace">AED-G</text>
                  </svg>
                </div>

                {/* Live Drill Telemetry Bar */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-brand-graphite-900 border border-brand-graphite-800">
                    <span className="text-[10px] text-brand-graphite-400 block uppercase">
                      Timed Evacuation
                    </span>
                    <span className="text-white font-bold text-sm">04:37 / 05:00</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">&bull; Target Met</span>
                  </div>

                  <div className="p-2.5 rounded bg-brand-graphite-900 border border-brand-graphite-800">
                    <span className="text-[10px] text-brand-graphite-400 block uppercase">
                      Assembly Point A
                    </span>
                    <span className="text-white font-bold text-sm">828 / 840</span>
                    <span className="text-[10px] text-brand-orange block mt-0.5">&bull; 98.5% Accounted</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-brand-graphite-400 flex items-center justify-between border-t border-brand-graphite-800/80 pt-2.5">
                  <span>Incident Type: Fire & Smoke Evacuation</span>
                  <Link
                    to="/building/academic-block"
                    target="_blank"
                    className="text-brand-red hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Public QR Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PREPAREDNESS CYCLE — PLAN -> INSPECT -> PRACTISE -> IMPROVE */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-brand-canvas border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          {/* Section Editorial Header */}
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red font-mono">
              The Operational Loop
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-graphite-950 tracking-tight mt-2">
              Plan &bull; Inspect &bull; Practise &bull; Improve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-brand-graphite-600 leading-relaxed">
              Real institutional safety is not a static PDF file stored in an office binder. It is an active operational rhythm that identifies physical bottlenecks before emergencies occur.
            </p>
          </div>

          {/* Interactive Editorial Process Stream */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const isSelected = activeWorkflowStep === idx;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`cursor-pointer transition-all duration-200 border rounded p-6 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-brand-red shadow-card ring-1 ring-brand-red'
                      : 'bg-white/70 border-brand-border hover:bg-white hover:border-brand-graphite-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-brand-red text-white'
                            : 'bg-brand-graphite-100 text-brand-graphite-700'
                        }`}
                      >
                        STAGE {step.num}
                      </span>
                      <span className="font-mono text-xs font-bold text-brand-graphite-400 uppercase">
                        {step.title}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-brand-graphite-900 tracking-tight mb-2">
                      {step.subtitle}
                    </h3>

                    <p className="text-xs text-brand-graphite-600 leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border/70 text-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-brand-graphite-400 block mb-0.5">
                      Deliverable:
                    </span>
                    <span className="font-semibold text-brand-graphite-800 text-[11px] block">
                      {step.deliverable}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE PRODUCT CAPABILITIES — ASYMMETRIC 4-PILLAR SHOWCASE */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red font-mono">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-graphite-950 tracking-tight mt-2">
              Purpose-Built for Safety Operations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-brand-graphite-600 leading-relaxed">
              Every feature in DRILLPROOF solves an actual breakdown point in institutional emergency readiness.
            </p>
          </div>

          <div className="space-y-12">
            {/* Capability 1: Digital Facility Plans & QR Egress Access */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 bg-brand-canvas border border-brand-border rounded shadow-xs">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-red font-mono">
                  <QrCode className="w-4 h-4" />
                  <span>Pillar 01</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-graphite-900 tracking-tight">
                  Instant QR Emergency Access for Occupants
                </h3>
                <p className="text-sm text-brand-graphite-600 leading-relaxed">
                  In an evacuation, occupants don't have time to download an app or log into a portal. DRILLPROOF generates building and floor-specific QR codes that load instant, high-contrast emergency instructions, clear stairwell routes, and live emergency call buttons on any smartphone.
                </p>
                <ul className="space-y-2 text-xs text-brand-graphite-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Hazard-specific evacuation tabs (Fire, Earthquake, Flood, Medical)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Designated primary and secondary assembly point coordinates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct-dial campus security and municipal emergency numbers</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-white border border-brand-border rounded p-6 shadow-xs font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
                  <span className="font-bold text-brand-graphite-900">QR DESTINATION PREVIEW</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PUBLIC / NO LOGIN
                  </span>
                </div>
                <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border space-y-2 mb-3">
                  <div className="flex justify-between text-brand-graphite-800 font-bold">
                    <span>Academic Block (Engineering)</span>
                    <span className="text-brand-red">HOTLINE: 112 / 101</span>
                  </div>
                  <p className="text-[11px] text-brand-graphite-600 font-sans">
                    Muster Area: Assembly Point A (East Athletic Field &bull; Capacity: 1,500)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-graphite-600">
                  <div className="p-2 border border-brand-border rounded bg-white">
                    <strong className="block text-brand-graphite-800">North Stairwell:</strong> Clear
                  </div>
                  <div className="p-2 border border-brand-border rounded bg-white">
                    <strong className="block text-brand-graphite-800">East Stairwell:</strong> Clear
                  </div>
                </div>
              </div>
            </div>

            {/* Capability 2: Timed Multi-Hazard Drills */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 bg-brand-canvas border border-brand-border rounded shadow-xs">
              <div className="lg:col-span-6 bg-white border border-brand-border rounded p-6 shadow-xs font-mono text-xs order-2 lg:order-1">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
                  <span className="font-bold text-brand-graphite-900">DRILL TIMING CONTROLLER</span>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    EXERCISE IN PROGRESS
                  </span>
                </div>
                <div className="p-4 bg-brand-graphite-900 text-white rounded text-center mb-3">
                  <span className="text-3xl font-bold font-mono">04:37.2</span>
                  <span className="block text-[10px] text-brand-graphite-400 mt-1">BENCHMARK: 05:00.0</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between p-1.5 bg-emerald-50 rounded text-emerald-900">
                    <span>Ground Floor Atrium</span>
                    <span className="font-bold">CLEARED (310 accounted)</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-amber-50 rounded text-amber-900">
                    <span>Level 1 West Corridor</span>
                    <span className="font-bold">BOTTLENECK DETECTED</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-red font-mono">
                  <Flame className="w-4 h-4" />
                  <span>Pillar 02</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-graphite-900 tracking-tight">
                  Measured, Timed Mock Drills with Floor Sweeps
                </h3>
                <p className="text-sm text-brand-graphite-600 leading-relaxed">
                  Moving people safely requires timed practice. DRILLPROOF allows safety coordinators to trigger scenario exercises, manage stopwatches, log manual floor warden clearances, and benchmark total egress time against institutional safety targets.
                </p>
                <ul className="space-y-2 text-xs text-brand-graphite-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Real-time stopwatch and evacuation target comparison</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Floor sweep check-ins with warden accountability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Observation logging with 1-click corrective action creation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Capability 3: Corrective Action Closure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 bg-brand-canvas border border-brand-border rounded shadow-xs">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-red font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pillar 03</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-graphite-900 tracking-tight">
                  Discovered Hazards Tracked to Verified Closure
                </h3>
                <p className="text-sm text-brand-graphite-600 leading-relaxed">
                  The most dangerous failure in safety management is finding an obstructed stairwell during a drill and forgetting about it the next day. DRILLPROOF connects every inspection failure and drill observation directly to an assigned remediation ticket with photo notes, assignee due dates, and verified closure logs.
                </p>
                <ul className="space-y-2 text-xs text-brand-graphite-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Automatic ticket generation from inspection defects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Assigned personnel, priority levels, and firm resolution deadlines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Transparent readiness score impact when actions are closed</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-white border border-brand-border rounded p-6 shadow-xs font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
                  <span className="font-bold text-brand-graphite-900">REMEDIATION DOSSIER</span>
                  <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    PRIORITY: HIGH
                  </span>
                </div>
                <div className="p-3 bg-white border border-brand-border rounded space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-graphite-900">ACT-101: West Stairwell Obstruction</span>
                    <span className="text-amber-700 font-semibold">IN PROGRESS</span>
                  </div>
                  <p className="text-[11px] text-brand-graphite-600 font-sans leading-relaxed">
                    Cartons obstructing 40% door swing on Level 1. Assigned to Facilities Maintenance Supervisor.
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>Physical Verification:</strong> Egress corridor cleared and verified to 1.5m minimum clearance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUPPORTED ENVIRONMENTS — EDUCATION, WORKPLACES, HEALTHCARE & INDUSTRY */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-brand-canvas border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red font-mono">
              Supported Environments
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-graphite-950 tracking-tight mt-2">
              Engineered for Multi-Occupant Facilities
            </h2>
            <p className="mt-3 text-sm sm:text-base text-brand-graphite-600 leading-relaxed">
              Every facility type faces distinct physical bottlenecks and occupant dynamics. DRILLPROOF adapts protocols and floor rosters to your operational environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {environments.map((env) => (
              <div
                key={env.sector}
                className="bg-white border border-brand-border rounded p-8 shadow-xs flex flex-col justify-between hover:border-brand-graphite-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase font-mono text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded">
                      {env.sector}
                    </span>
                    <span className="text-[11px] font-mono text-brand-graphite-500">
                      Multi-Hazard Protocol
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-graphite-900 tracking-tight mb-2">
                    {env.headline}
                  </h3>

                  <p className="text-xs text-brand-graphite-600 leading-relaxed mb-4">
                    {env.context}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-brand-graphite-400 block">
                      Target Hazards:
                    </span>
                    <span className="font-semibold text-brand-graphite-800 text-[11px]">
                      {env.hazards}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-brand-graphite-400 block">
                      Operational Focus:
                    </span>
                    <span className="text-brand-graphite-600 text-[11px]">
                      {env.operationalFocus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STRONG CLOSING CALL TO ACTION — ARCHITECTURAL COMMAND CALLOUT */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-brand-graphite-950 text-white bg-tech-grid-dark border-b border-brand-graphite-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-graphite-900 border border-brand-graphite-700 text-xs font-mono text-brand-graphite-300 mb-6">
            <span>READY FOR DEPLOYMENT</span>
            <span className="text-brand-red">&bull;</span>
            <span className="text-white font-bold">PREPARED. PROVEN.</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Turn your institution's emergency plans into verified operational readiness.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-brand-graphite-300 max-w-2xl mx-auto leading-relaxed">
            Review live campus facility readiness scores, launch a timed mock evacuation drill, or audit safety assets in the Northstar Campus management system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={user ? "/dashboard" : "/login"}>
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                Explore the Platform
              </Button>
            </Link>

            <Link to="/login">
              <Button size="lg" variant="secondary" className="border-brand-graphite-700">
                Administrator Login
              </Button>
            </Link>

            <Link to="/building/academic-block" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-brand-graphite-900 bg-white">
                Inspect Public Building QR Plan
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-brand-graphite-500 font-mono">
            Interactive Prototype &bull; Seeded with fictional Northstar Institute Campus data
          </p>
        </div>
      </section>
    </div>
  );
};
