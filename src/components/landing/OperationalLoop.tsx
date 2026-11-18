import React, { useState, useEffect, useRef } from 'react';

export interface WorkflowStep {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  deliverable: string;
  metric: string;
}

interface OperationalLoopProps {
  workflowSteps: WorkflowStep[];
}

export const OperationalLoop: React.FC<OperationalLoopProps> = ({ workflowSteps }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const current = workflowSteps[activeStep] || workflowSteps[0];

  // Positions of stations on desktop horizontal track (percentages)
  const stationPercentages = [12.5, 37.5, 62.5, 87.5];
  const activePercent = stationPercentages[activeStep];

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-brand-canvas border-b border-brand-border overflow-hidden"
      aria-label="The operational loop"
    >
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-brand-red tracking-normal uppercase">
            The operational loop
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-graphite-950 tracking-tight mt-2">
            Plan, inspect, practise, improve
          </h2>
          <p className="mt-3 text-sm sm:text-base text-brand-graphite-600 leading-relaxed">
            Real institutional safety is not a static PDF file stored in an office binder. It is an active operational rhythm that identifies physical bottlenecks before emergencies occur.
          </p>
        </div>

        {/* Closed Loop Circuit SVG & Station Selectors */}
        <div className="bg-white border border-brand-border rounded-lg p-6 sm:p-8 shadow-subtle mb-8">
          {/* Desktop SVG Circuit Track */}
          <div className="hidden md:block relative pb-4">
            {/* SVG Track */}
            <div className="relative h-20 w-full">
              <svg
                viewBox="0 0 1000 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                {/* Circuit Track Background */}
                <path
                  d="M 125,24 H 875 C 930,24 955,42 955,56 C 955,70 930,76 875,76 H 125 C 70,76 45,70 45,56 C 45,42 70,24 125,24 Z"
                  stroke="#E2E4E8"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Animated Forward Circuit Line (draws on scroll in view) */}
                <path
                  d="M 125,24 H 875 C 930,24 955,42 955,56 C 955,70 930,76 875,76 H 125 C 70,76 45,70 45,56 C 45,42 70,24 125,24 Z"
                  stroke="#B8BBC2"
                  strokeWidth="2"
                  strokeDasharray="2100"
                  strokeDashoffset={inView || prefersReducedMotion ? 0 : 2100}
                  fill="none"
                  style={{
                    transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />

                {/* Return Flow Arrow Indicator on bottom leg */}
                <g transform="translate(500, 76)">
                  <polygon points="10,-4 -2,0 10,4" fill="#8C909A" />
                  <text x="-16" y="3" fill="#8C909A" fontSize="9" fontFamily="sans-serif" textAnchor="end">
                    continuous readiness feedback
                  </text>
                </g>

                {/* Active Marker on the SVG Track */}
                <circle
                  cx={activePercent * 10}
                  cy="24"
                  r="7"
                  fill="#E51C23"
                  style={{
                    transition: prefersReducedMotion ? 'none' : 'cx 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <circle
                  cx={activePercent * 10}
                  cy="24"
                  r="12"
                  fill="#E51C23"
                  fillOpacity="0.2"
                  style={{
                    transition: prefersReducedMotion ? 'none' : 'cx 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </svg>
            </div>

            {/* Station Buttons across the Track */}
            <div
              className="grid grid-cols-4 gap-4 mt-2"
              role="tablist"
              aria-label="Operational loop stages"
            >
              {workflowSteps.map((step, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={step.num}
                    role="tab"
                    id={`stage-tab-${idx}`}
                    aria-selected={isSelected}
                    aria-controls={`stage-panel-${idx}`}
                    onClick={() => setActiveStep(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        setActiveStep((prev) => (prev + 1) % workflowSteps.length);
                      } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        setActiveStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length);
                      }
                    }}
                    className={`group text-center py-3 px-2 rounded transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                      isSelected
                        ? 'text-brand-graphite-950 font-bold'
                        : 'text-brand-graphite-500 hover:text-brand-graphite-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          isSelected ? 'bg-brand-red ring-4 ring-brand-red/20' : 'bg-brand-graphite-300'
                        }`}
                      />
                      <span className="text-sm font-semibold tracking-tight">{step.title}</span>
                    </div>
                    <span className="block text-xs text-brand-graphite-500 text-center font-normal">
                      Stage {step.num}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Track (< md) */}
          <div className="md:hidden space-y-2 mb-6" role="tablist" aria-label="Operational loop stages">
            <div className="flex flex-col gap-2 relative pl-6 border-l-2 border-brand-border">
              {workflowSteps.map((step, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={step.num}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveStep(idx)}
                    className={`relative text-left py-2 px-3 rounded text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                      isSelected
                        ? 'bg-brand-graphite-100/80 font-bold text-brand-graphite-950'
                        : 'text-brand-graphite-600 hover:bg-brand-graphite-50'
                    }`}
                  >
                    {/* Marker dot on the vertical track */}
                    <span
                      className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                        isSelected ? 'bg-brand-red' : 'bg-brand-graphite-300'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span>{step.title}</span>
                      <span className="text-xs font-normal text-brand-graphite-400">Stage {step.num}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Detail Panel & Animated Scene */}
          <div
            id={`stage-panel-${activeStep}`}
            role="tabpanel"
            aria-labelledby={`stage-tab-${activeStep}`}
            className="pt-6 border-t border-brand-border"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Stage Copy & Deliverable */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-graphite-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  <span>Stage {current.num}: {current.title}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-brand-graphite-950 tracking-tight leading-snug">
                  {current.subtitle}
                </h3>

                <p className="text-sm text-brand-graphite-600 leading-relaxed">
                  {current.description}
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border text-xs">
                  <div className="p-3 bg-brand-canvas rounded border border-brand-border">
                    <span className="text-brand-graphite-500 block mb-1">Deliverable</span>
                    <span className="font-semibold text-brand-graphite-900 block leading-tight">
                      {current.deliverable}
                    </span>
                  </div>
                  <div className="p-3 bg-brand-canvas rounded border border-brand-border">
                    <span className="text-brand-graphite-500 block mb-1">Operational benchmark</span>
                    <span className="font-semibold text-brand-graphite-900 block leading-tight">
                      {current.metric}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Stage Specific Interactive Scene */}
              <div className="lg:col-span-6 bg-brand-canvas border border-brand-border rounded p-6 min-h-[260px] flex items-center justify-center">
                {activeStep === 0 && <PlanScene prefersReducedMotion={prefersReducedMotion} />}
                {activeStep === 1 && <InspectScene prefersReducedMotion={prefersReducedMotion} />}
                {activeStep === 2 && <PractiseScene prefersReducedMotion={prefersReducedMotion} />}
                {activeStep === 3 && <ImproveScene prefersReducedMotion={prefersReducedMotion} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Scene 1: Plan - Floor plan lines draw themselves, then a QR code assembles
const PlanScene: React.FC<{ prefersReducedMotion: boolean }> = ({ prefersReducedMotion }) => {
  const [stage, setStage] = useState(prefersReducedMotion ? 2 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setStage(1), 150);
    const t2 = setTimeout(() => setStage(2), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between text-xs text-brand-graphite-600 pb-2 border-b border-brand-border">
        <span className="font-semibold text-brand-graphite-900">Digital facility digitizer</span>
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
          {stage === 2 ? 'QR live' : 'Vectorizing'}
        </span>
      </div>

      <svg viewBox="0 0 320 140" fill="none" className="w-full h-auto">
        {/* Architectural layout outlines */}
        <rect
          x="10"
          y="10"
          width="190"
          height="120"
          rx="2"
          stroke="#4A4D53"
          strokeWidth="1.5"
          strokeDasharray="620"
          strokeDashoffset={stage >= 1 ? 0 : 620}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
        {/* Interior rooms */}
        <line
          x1="10"
          y1="70"
          x2="200"
          y2="70"
          stroke="#8C909A"
          strokeWidth="1"
          strokeDasharray="190"
          strokeDashoffset={stage >= 1 ? 0 : 190}
          style={{ transition: 'stroke-dashoffset 500ms ease-out 100ms' }}
        />
        <line
          x1="110"
          y1="10"
          x2="110"
          y2="70"
          stroke="#8C909A"
          strokeWidth="1"
          strokeDasharray="60"
          strokeDashoffset={stage >= 1 ? 0 : 60}
          style={{ transition: 'stroke-dashoffset 400ms ease-out 200ms' }}
        />
        {/* Egress corridor path */}
        <path
          d="M 50,40 L 50,105 L 170,105"
          stroke="#E51C23"
          strokeWidth="1.5"
          strokeDasharray="180"
          strokeDashoffset={stage >= 1 ? 0 : 180}
          style={{ transition: 'stroke-dashoffset 600ms ease-out 300ms' }}
        />
        <circle cx="170" cy="105" r="3" fill="#E51C23" opacity={stage >= 1 ? 1 : 0} />

        {/* Text indicators */}
        <text x="20" y="32" fill="#646871" fontSize="8" fontFamily="sans-serif">
          Wing A
        </text>
        <text x="120" y="32" fill="#646871" fontSize="8" fontFamily="sans-serif">
          Lab 102
        </text>
        <text x="20" y="90" fill="#646871" fontSize="8" fontFamily="sans-serif">
          Primary egress
        </text>

        {/* Assembling QR Code block on the right */}
        <g transform="translate(225, 20)">
          <rect
            x="0"
            y="0"
            width="80"
            height="80"
            rx="4"
            fill="#FFFFFF"
            stroke="#DFE1E5"
            strokeWidth="1"
            opacity={stage >= 2 ? 1 : 0.3}
            style={{ transition: 'opacity 300ms ease' }}
          />

          {/* QR Finders */}
          <rect x="8" y="8" width="20" height="20" fill="none" stroke="#202124" strokeWidth="2" rx="1" opacity={stage >= 2 ? 1 : 0} />
          <rect x="13" y="13" width="10" height="10" fill="#202124" opacity={stage >= 2 ? 1 : 0} />

          <rect x="52" y="8" width="20" height="20" fill="none" stroke="#202124" strokeWidth="2" rx="1" opacity={stage >= 2 ? 1 : 0} />
          <rect x="57" y="13" width="10" height="10" fill="#202124" opacity={stage >= 2 ? 1 : 0} />

          <rect x="8" y="52" width="20" height="20" fill="none" stroke="#202124" strokeWidth="2" rx="1" opacity={stage >= 2 ? 1 : 0} />
          <rect x="13" y="57" width="10" height="10" fill="#202124" opacity={stage >= 2 ? 1 : 0} />

          {/* Inner data modules */}
          <rect x="34" y="12" width="6" height="6" fill="#E51C23" opacity={stage >= 2 ? 1 : 0} />
          <rect x="34" y="24" width="6" height="6" fill="#202124" opacity={stage >= 2 ? 1 : 0} />
          <rect x="42" y="36" width="6" height="6" fill="#202124" opacity={stage >= 2 ? 1 : 0} />
          <rect x="54" y="44" width="6" height="6" fill="#202124" opacity={stage >= 2 ? 1 : 0} />
          <rect x="36" y="56" width="6" height="6" fill="#202124" opacity={stage >= 2 ? 1 : 0} />
          <rect x="62" y="62" width="6" height="6" fill="#E51C23" opacity={stage >= 2 ? 1 : 0} />

          <text x="40" y="96" fill="#646871" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
            Instant phone access
          </text>
        </g>
      </svg>
    </div>
  );
};

// Scene 2: Inspect - Checklist rows tick off one by one; one row flags amber
const InspectScene: React.FC<{ prefersReducedMotion: boolean }> = ({ prefersReducedMotion }) => {
  const [checkedCount, setCheckedCount] = useState(prefersReducedMotion ? 3 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setCheckedCount(1), 250);
    const t2 = setTimeout(() => setCheckedCount(2), 550);
    const t3 = setTimeout(() => setCheckedCount(3), 850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion]);

  const items = [
    { label: 'Fire extinguisher seal & pressure pin', ok: true },
    { label: 'Emergency exit luminaire battery backup', ok: true },
    { label: 'Level 1 west stairwell door swing clearance', ok: false, finding: 'Corridor 40% obstructed' },
  ];

  return (
    <div className="w-full max-w-sm space-y-2.5">
      <div className="flex items-center justify-between text-xs text-brand-graphite-600 pb-2 border-b border-brand-border">
        <span className="font-semibold text-brand-graphite-900">Safety equipment inspection</span>
        <span className="text-[11px] font-mono text-brand-graphite-500">Audit session 12-B</span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const isTicked = checkedCount > idx;
          return (
            <div
              key={item.label}
              className={`p-2.5 rounded border transition-all duration-300 text-xs flex items-center justify-between ${
                !isTicked
                  ? 'bg-white border-brand-border text-brand-graphite-400'
                  : item.ok
                  ? 'bg-white border-emerald-200 text-brand-graphite-800'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 pr-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    !isTicked
                      ? 'border border-brand-graphite-300 text-transparent'
                      : item.ok
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {isTicked && (item.ok ? '✓' : '!')}
                </span>
                <span className="leading-tight">{item.label}</span>
              </div>

              {isTicked && (
                <span
                  className={`text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded ${
                    item.ok
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-amber-800 bg-amber-100 font-semibold'
                  }`}
                >
                  {item.ok ? 'Verified' : item.finding}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Scene 3: Practise - Timer ring sweeps while dots flow to an assembly point
const PractiseScene: React.FC<{ prefersReducedMotion: boolean }> = ({ prefersReducedMotion }) => {
  const [progress, setProgress] = useState(prefersReducedMotion ? 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setProgress(1), 100);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between text-xs text-brand-graphite-600 pb-2 border-b border-brand-border">
        <span className="font-semibold text-brand-graphite-900">Multi-hazard drill simulation</span>
        <span className="text-brand-orange bg-orange-50 font-medium px-2 py-0.5 rounded text-[11px]">
          Target: 05:00
        </span>
      </div>

      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Sweep ring stopwatch */}
        <div className="col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#E2E4E8" strokeWidth="4" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="163"
                strokeDashoffset={progress ? 22 : 163}
                strokeLinecap="round"
                fill="none"
                style={{ transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 900ms ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold font-mono text-brand-graphite-900 leading-none">04:37</span>
              <span className="text-[8px] text-brand-graphite-500 font-mono mt-0.5">MET</span>
            </div>
          </div>
        </div>

        {/* Egress schematic dots to muster point */}
        <div className="col-span-8 bg-white border border-brand-border rounded p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
            <span className="text-brand-graphite-500">Assembly A</span>
            <span className="font-bold text-emerald-700">828 / 840 Accounted</span>
          </div>

          <svg viewBox="0 0 160 50" fill="none" className="w-full h-auto">
            {/* Egress paths */}
            <line x1="10" y1="12" x2="110" y2="12" stroke="#DFE1E5" strokeWidth="2" strokeDasharray="2 2" />
            <line x1="10" y1="36" x2="110" y2="36" stroke="#DFE1E5" strokeWidth="2" strokeDasharray="2 2" />
            <path d="M 110,12 L 135,24 L 110,36" stroke="#DFE1E5" strokeWidth="2" />

            {/* Assembly Zone */}
            <rect x="125" y="10" width="30" height="30" rx="3" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
            <text x="140" y="27" fill="#047857" fontSize="8" fontWeight="bold" textAnchor="middle">
              PT-A
            </text>

            {/* Moving occupant dots */}
            <circle
              cx={progress ? 132 : 20}
              cy="16"
              r="2.5"
              fill="#10B981"
              style={{ transition: 'cx 800ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <circle
              cx={progress ? 138 : 35}
              cy="22"
              r="2.5"
              fill="#10B981"
              style={{ transition: 'cx 750ms cubic-bezier(0.4, 0, 0.2, 1) 50ms' }}
            />
            <circle
              cx={progress ? 134 : 50}
              cy="28"
              r="2.5"
              fill="#10B981"
              style={{ transition: 'cx 700ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' }}
            />
            <circle
              cx={progress ? 142 : 15}
              cy="34"
              r="2.5"
              fill="#10B981"
              style={{ transition: 'cx 850ms cubic-bezier(0.4, 0, 0.2, 1) 80ms' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Scene 4: Improve - The flagged item becomes a ticket and closes green; return arrow points back to Plan
const ImproveScene: React.FC<{ prefersReducedMotion: boolean }> = ({ prefersReducedMotion }) => {
  const [resolved, setResolved] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setResolved(true), 600);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between text-xs text-brand-graphite-600 pb-2 border-b border-brand-border">
        <span className="font-semibold text-brand-graphite-900">Corrective action closure</span>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {resolved ? 'Verified closed' : 'Ticket assigned'}
        </span>
      </div>

      <div className="p-3 bg-white border border-brand-border rounded space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-brand-graphite-800">ACT-101</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
              resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {resolved ? 'Closed & audited' : 'In remediation'}
          </span>
        </div>
        <p className="text-brand-graphite-600 text-[11px] leading-snug">
          Level 1 west stairwell door swing clearance restored. 1.5m minimum egress width confirmed.
        </p>
      </div>

      {/* Return loop arrow to Plan */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-graphite-500">
        <svg viewBox="0 0 24 16" fill="none" className="w-5 h-3 text-brand-red flex-shrink-0">
          <path d="M 22,8 L 4,8 M 4,8 L 9,3 M 4,8 L 9,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Closed actions update building safety plan for next cycle</span>
      </div>
    </div>
  );
};