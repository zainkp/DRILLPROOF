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
// @ts-expect-error LiveDrill is a .jsx component
import LiveDrill from '../components/common/LiveDrill';
import { OperationalLoop } from '../components/landing/OperationalLoop';
import { SupportedEnvironments } from '../components/landing/SupportedEnvironments';
import { ClosingCta } from '../components/landing/ClosingCta';

export const LandingPage: React.FC = () => {
  const { user } = useData();

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

            {/* Right Column: Live evacuation drill (5 cols) */}
            <div className="lg:col-span-5 relative">
              <LiveDrill />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE OPERATIONAL LOOP */}
      <OperationalLoop workflowSteps={workflowSteps} />

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

      {/* 4. SUPPORTED ENVIRONMENTS */}
      <SupportedEnvironments environments={environments} />

      {/* 5. CLOSING CALL TO ACTION */}
      <ClosingCta user={user} />
    </div>
  );
};
