import React, { useState, useEffect } from 'react';

export interface EnvironmentItem {
  sector: string;
  headline: string;
  hazards: string;
  context: string;
  operationalFocus: string;
}

interface SupportedEnvironmentsProps {
  environments: EnvironmentItem[];
}

export const SupportedEnvironments: React.FC<SupportedEnvironmentsProps> = ({ environments }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    setAnimationKey((prev) => prev + 1);
  };

  const handleMobileToggle = (idx: number) => {
    if (mobileExpandedIndex === idx) {
      setMobileExpandedIndex(null);
    } else {
      setMobileExpandedIndex(idx);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const current = environments[selectedIndex] || environments[0];

  return (
    <section
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-brand-canvas border-b border-brand-border"
      aria-label="Supported environments"
    >
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-brand-red tracking-normal uppercase">
            Supported environments
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-graphite-950 tracking-tight mt-2">
            Engineered for multi-occupant facilities
          </h2>
          <p className="mt-3 text-sm sm:text-base text-brand-graphite-600 leading-relaxed">
            Every facility type faces distinct physical bottlenecks and occupant dynamics. DRILLPROOF adapts protocols and floor rosters to your operational environment.
          </p>
        </div>

        {/* Desktop: Master Typographic Index + Floor-Plan Schematic View (>= md) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Large Typographic Index (5 cols) */}
          <div className="md:col-span-5 space-y-2" role="tablist" aria-label="Facility sectors">
            {environments.map((env, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={env.sector}
                  role="tab"
                  id={`env-tab-${idx}`}
                  aria-selected={isSelected}
                  aria-controls={`env-panel-${idx}`}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-5 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                    isSelected
                      ? 'bg-white border-brand-graphite-800 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-white/60 hover:border-brand-border text-brand-graphite-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors ${
                        isSelected ? 'text-brand-graphite-950' : 'text-brand-graphite-400 group-hover:text-brand-graphite-700'
                      }`}
                    >
                      {env.sector}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                        isSelected
                          ? 'bg-brand-graphite-100 text-brand-graphite-800'
                          : 'text-brand-graphite-400'
                      }`}
                    >
                      Facility type 0{idx + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-brand-graphite-600 line-clamp-2 leading-relaxed">
                    {env.headline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Architectural Top-Down Floor-Plan & Plain Sentences (7 cols) */}
          <div
            id={`env-panel-${selectedIndex}`}
            role="tabpanel"
            aria-labelledby={`env-tab-${selectedIndex}`}
            className="md:col-span-7 bg-white border border-brand-border rounded-lg p-6 lg:p-8 shadow-subtle space-y-6"
          >
            {/* Top-Down Architectural Line Illustration */}
            <div className="bg-brand-canvas border border-brand-border rounded p-4 overflow-hidden">
              <div className="flex items-center justify-between text-xs text-brand-graphite-500 pb-2 mb-2 border-b border-brand-border font-mono">
                <span>SCHEMATIC / {current.sector.toUpperCase()}</span>
                <span>SINGLE-STROKE ARCHITECTURAL MODEL</span>
              </div>
              <SectorFloorPlan
                key={`${current.sector}-${animationKey}`}
                sector={current.sector}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>

            {/* Plain Sentences Description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-brand-graphite-950 tracking-tight">
                  {current.headline}
                </h3>
                <p className="mt-2 text-sm text-brand-graphite-700 leading-relaxed">
                  {current.context}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border space-y-2 text-xs">
                <p className="text-brand-graphite-800 leading-relaxed">
                  <strong className="font-semibold text-brand-graphite-950">Target hazards: </strong>
                  {current.hazards}.
                </p>
                <p className="text-brand-graphite-700 leading-relaxed">
                  <strong className="font-semibold text-brand-graphite-950">Operational focus: </strong>
                  {current.operationalFocus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Accordion (< md) */}
        <div className="md:hidden space-y-3">
          {environments.map((env, idx) => {
            const isExpanded = mobileExpandedIndex === idx;
            return (
              <div
                key={env.sector}
                className="bg-white border border-brand-border rounded-lg overflow-hidden transition-all"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => handleMobileToggle(idx)}
                  className="w-full text-left p-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  <div>
                    <span className="text-xl font-extrabold text-brand-graphite-950 block">
                      {env.sector}
                    </span>
                    <span className="text-xs text-brand-graphite-500 font-normal">
                      {env.headline}
                    </span>
                  </div>
                  <span className="text-base text-brand-graphite-400 font-bold ml-2">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-brand-border/60 space-y-4">
                    <div className="bg-brand-canvas border border-brand-border rounded p-3 mt-3">
                      <SectorFloorPlan
                        sector={env.sector}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </div>

                    <p className="text-xs text-brand-graphite-700 leading-relaxed">
                      {env.context}
                    </p>

                    <div className="pt-3 border-t border-brand-border space-y-2 text-xs">
                      <p className="text-brand-graphite-800 leading-relaxed">
                        <strong className="font-semibold text-brand-graphite-950">Target hazards: </strong>
                        {env.hazards}.
                      </p>
                      <p className="text-brand-graphite-700 leading-relaxed">
                        <strong className="font-semibold text-brand-graphite-950">Operational focus: </strong>
                        {env.operationalFocus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Top-Down Floor Plan Schematic for each Sector (One stroke weight, stroke-dash animation on selection)
const SectorFloorPlan: React.FC<{ sector: string; prefersReducedMotion: boolean }> = ({
  sector,
  prefersReducedMotion,
}) => {
  const [drawn, setDrawn] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  const strokeStyle = {
    transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (sector === 'Education') {
    // Campus with hostel blocks and a field muster point
    return (
      <svg viewBox="0 0 440 220" fill="none" className="w-full h-auto">
        <style>{`
          .arch-stroke { stroke: #323438; stroke-width: 1.5; stroke-dasharray: 800; }
          .arch-stroke-accent { stroke: #E51C23; stroke-width: 1.5; stroke-dasharray: 400; }
          .arch-stroke-field { stroke: #10B981; stroke-width: 1.5; stroke-dasharray: 600; }
        `}</style>
        {/* Academic Quad Block */}
        <rect
          x="20"
          y="20"
          width="140"
          height="80"
          rx="2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="30" y="40" fill="#4A4D53" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
          Academic Block (Labs & Classes)
        </text>

        {/* Internal partition */}
        <line
          x1="20"
          y1="60"
          x2="160"
          y2="60"
          stroke="#8C909A"
          strokeWidth="1.5"
          strokeDasharray="140"
          strokeDashoffset={drawn ? 0 : 140}
          style={strokeStyle}
        />

        {/* Residential Hostel Blocks A & B */}
        <rect
          x="20"
          y="120"
          width="65"
          height="75"
          rx="2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="26" y="140" fill="#4A4D53" fontSize="8" fontFamily="sans-serif">
          Hostel Wing A
        </text>

        <rect
          x="95"
          y="120"
          width="65"
          height="75"
          rx="2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="101" y="140" fill="#4A4D53" fontSize="8" fontFamily="sans-serif">
          Hostel Wing B
        </text>

        {/* Covered Walkway connecting blocks */}
        <line
          x1="160"
          y1="60"
          x2="240"
          y2="60"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <line
          x1="160"
          y1="155"
          x2="240"
          y2="155"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <line
          x1="240"
          y1="60"
          x2="240"
          y2="155"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="175" y="52" fill="#8C909A" fontSize="7" fontFamily="sans-serif">
          Walkway
        </text>

        {/* Main Athletic Field Muster Point */}
        <rect
          x="260"
          y="35"
          width="160"
          height="145"
          rx="8"
          fill="#D1FAE5"
          fillOpacity="0.25"
          className="arch-stroke-field"
          strokeDashoffset={drawn ? 0 : 600}
          style={strokeStyle}
        />
        <circle cx="340" cy="107" r="28" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <circle cx="340" cy="107" r="4" fill="#10B981" />
        <text x="340" y="85" fill="#047857" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
          Muster Point: Athletic Field
        </text>
        <text x="340" y="125" fill="#065F46" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
          Capacity: 1,800 Occupants
        </text>

        {/* Egress Arcs from buildings to field */}
        <path
          d="M 160,60 L 260,60"
          className="arch-stroke-accent"
          strokeDashoffset={drawn ? 0 : 400}
          style={strokeStyle}
        />
        <path
          d="M 160,155 L 260,155"
          className="arch-stroke-accent"
          strokeDashoffset={drawn ? 0 : 400}
          style={strokeStyle}
        />
      </svg>
    );
  }

  if (sector === 'Workplaces') {
    // Office tower core with stairwells
    return (
      <svg viewBox="0 0 440 220" fill="none" className="w-full h-auto">
        <style>{`
          .arch-stroke { stroke: #323438; stroke-width: 1.5; stroke-dasharray: 800; }
          .arch-stroke-accent { stroke: #E51C23; stroke-width: 1.5; stroke-dasharray: 400; }
        `}</style>
        {/* Perimeter Floorplate Boundary */}
        <rect
          x="20"
          y="15"
          width="400"
          height="190"
          rx="2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="32" y="32" fill="#4A4D53" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
          High-Rise Level 18 Core & Tenant Floorplate
        </text>

        {/* Central Core */}
        <rect
          x="150"
          y="45"
          width="140"
          height="130"
          rx="2"
          fill="#EEF0F2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />
        <text x="220" y="62" fill="#323438" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
          Service Core
        </text>

        {/* Elevators (gated during fire) */}
        <rect x="165" y="72" width="50" height="35" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="190" y="93" fill="#8C909A" fontSize="7" textAnchor="middle">
          Lifts
        </text>
        <rect x="225" y="72" width="50" height="35" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="250" y="93" fill="#8C909A" fontSize="7" textAnchor="middle">
          HVAC
        </text>

        {/* North Pressurized Stairwell */}
        <rect
          x="165"
          y="118"
          width="50"
          height="45"
          rx="1"
          fill="#FFF5F5"
          className="arch-stroke-accent"
          strokeDashoffset={drawn ? 0 : 400}
          style={strokeStyle}
        />
        <text x="190" y="138" fill="#B91F2A" fontSize="8" fontWeight="bold" textAnchor="middle">
          Stair 1
        </text>
        <text x="190" y="152" fill="#B91F2A" fontSize="6" textAnchor="middle">
          Pressurized
        </text>

        {/* South Pressurized Stairwell */}
        <rect
          x="225"
          y="118"
          width="50"
          height="45"
          rx="1"
          fill="#FFF5F5"
          className="arch-stroke-accent"
          strokeDashoffset={drawn ? 0 : 400}
          style={strokeStyle}
        />
        <text x="250" y="138" fill="#B91F2A" fontSize="8" fontWeight="bold" textAnchor="middle">
          Stair 2
        </text>
        <text x="250" y="152" fill="#B91F2A" fontSize="6" textAnchor="middle">
          Pressurized
        </text>

        {/* Open Office Workstation Wings */}
        <rect x="35" y="55" width="95" height="110" rx="2" stroke="#B8BBC2" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="45" y="75" fill="#646871" fontSize="8">
          West Wing Desks
        </text>

        <rect x="310" y="55" width="95" height="110" rx="2" stroke="#B8BBC2" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="320" y="75" fill="#646871" fontSize="8">
          East Wing Desks
        </text>

        {/* Egress Direction Arrows into Stairwells */}
        <path d="M 130,140 L 165,140" stroke="#E51C23" strokeWidth="2" strokeLinecap="round" />
        <path d="M 310,140 L 275,140" stroke="#E51C23" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (sector === 'Healthcare') {
    // Hospital ward with smoke-compartment doors and a triage corridor
    return (
      <svg viewBox="0 0 440 220" fill="none" className="w-full h-auto">
        <style>{`
          .arch-stroke { stroke: #323438; stroke-width: 1.5; stroke-dasharray: 800; }
          .arch-stroke-smoke { stroke: #DF6614; stroke-width: 2; stroke-dasharray: 400; }
        `}</style>
        {/* Exterior Hospital Ward Boundary */}
        <rect
          x="20"
          y="15"
          width="400"
          height="190"
          rx="2"
          className="arch-stroke"
          strokeDashoffset={drawn ? 0 : 800}
          style={strokeStyle}
        />

        {/* Patient Care Bays (North Side) */}
        <rect x="30" y="25" width="75" height="50" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="36" y="45" fill="#4A4D53" fontSize="8">
          Ward 101 (ICU)
        </text>

        <rect x="115" y="25" width="75" height="50" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="121" y="45" fill="#4A4D53" fontSize="8">
          Ward 102
        </text>

        <rect x="250" y="25" width="75" height="50" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="256" y="45" fill="#4A4D53" fontSize="8">
          Ward 103
        </text>

        <rect x="335" y="25" width="75" height="50" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="341" y="45" fill="#4A4D53" fontSize="8">
          Sterile Wing
        </text>

        {/* Central Horizontal Triage Corridor */}
        <rect x="20" y="85" width="400" height="50" fill="#F7F6F4" stroke="#DFE1E5" strokeWidth="1" />
        <text x="30" y="113" fill="#646871" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
          Central Horizontal Triage Corridor (Continuous Bed Transit)
        </text>

        {/* Smoke Compartment Barrier Wall & Double-Swing Magnetic Doors */}
        <line x1="210" y1="15" x2="210" y2="85" stroke="#DF6614" strokeWidth="2.5" />
        <line x1="210" y1="135" x2="210" y2="205" stroke="#DF6614" strokeWidth="2.5" />

        {/* Double magnetic smoke doors across corridor */}
        <rect
          x="204"
          y="85"
          width="12"
          height="50"
          rx="1"
          fill="#FEF3EB"
          className="arch-stroke-smoke"
          strokeDashoffset={drawn ? 0 : 400}
          style={strokeStyle}
        />
        <text x="210" y="105" fill="#DF6614" fontSize="7" fontWeight="bold" textAnchor="middle">
          SMOKE
        </text>
        <text x="210" y="118" fill="#DF6614" fontSize="7" fontWeight="bold" textAnchor="middle">
          BARRIER
        </text>

        {/* South Service Area & Ambulance Bay Egress */}
        <rect x="30" y="145" width="160" height="50" rx="1" stroke="#8C909A" strokeWidth="1.5" />
        <text x="38" y="172" fill="#4A4D53" fontSize="8">
          Pre-Op & Nurse Station
        </text>

        <rect x="250" y="145" width="160" height="50" rx="2" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5" />
        <text x="330" y="168" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle">
          Ambulance Egress Portal
        </text>
        <text x="330" y="182" fill="#065F46" fontSize="7" textAnchor="middle">
          Direct Non-Ambulatory Rollout
        </text>
      </svg>
    );
  }

  // Industry: Factory with high-bay racks and a muster zone
  return (
    <svg viewBox="0 0 440 220" fill="none" className="w-full h-auto">
      <style>{`
        .arch-stroke { stroke: #323438; stroke-width: 1.5; stroke-dasharray: 800; }
        .arch-stroke-rack { stroke: #646871; stroke-width: 1.5; stroke-dasharray: 400; }
      `}</style>
      {/* Factory Floor Boundary */}
      <rect
        x="20"
        y="15"
        width="270"
        height="190"
        rx="2"
        className="arch-stroke"
        strokeDashoffset={drawn ? 0 : 800}
        style={strokeStyle}
      />
      <text x="32" y="32" fill="#4A4D53" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
        Manufacturing & High-Bay Warehouse Floor
      </text>

      {/* High-Bay Storage Racks (Parallel Aisles) */}
      <g>
        <rect x="35" y="50" width="100" height="14" rx="1" className="arch-stroke-rack" strokeDashoffset={drawn ? 0 : 400} style={strokeStyle} />
        <text x="40" y="61" fill="#4A4D53" fontSize="7">Rack Row A (Heavy Stacking)</text>

        <rect x="35" y="74" width="100" height="14" rx="1" className="arch-stroke-rack" strokeDashoffset={drawn ? 0 : 400} style={strokeStyle} />
        <text x="40" y="85" fill="#4A4D53" fontSize="7">Rack Row B</text>

        <rect x="35" y="98" width="100" height="14" rx="1" className="arch-stroke-rack" strokeDashoffset={drawn ? 0 : 400} style={strokeStyle} />
        <text x="40" y="109" fill="#4A4D53" fontSize="7">Rack Row C</text>

        <rect x="35" y="122" width="100" height="14" rx="1" className="arch-stroke-rack" strokeDashoffset={drawn ? 0 : 400} style={strokeStyle} />
        <text x="40" y="133" fill="#4A4D53" fontSize="7">Rack Row D</text>
      </g>

      {/* Machinery Fabrication & Chemical Cutoff Zone */}
      <rect x="155" y="50" width="120" height="86" rx="2" fill="#FFF5F5" stroke="#E51C23" strokeWidth="1.5" />
      <text x="215" y="75" fill="#B91F2A" fontSize="8" fontWeight="bold" textAnchor="middle">
        Machinery / HAZMAT Bay
      </text>
      <text x="215" y="92" fill="#4A4D53" fontSize="7" textAnchor="middle">
        Automated Power Cutoff E-Stop
      </text>
      <text x="215" y="112" fill="#DF6614" fontSize="7" textAnchor="middle">
        Spill Containment Arcs Active
      </text>

      {/* Forklift & Egress Corridor */}
      <line x1="35" y1="160" x2="290" y2="160" stroke="#E51C23" strokeWidth="2" strokeDasharray="4 3" />
      <text x="40" y="175" fill="#8C909A" fontSize="7">
        Main 3.0m Egress Corridor
      </text>

      {/* Exterior Perimeter Muster Zone */}
      <rect
        x="310"
        y="30"
        width="110"
        height="160"
        rx="4"
        fill="#D1FAE5"
        fillOpacity="0.25"
        stroke="#10B981"
        strokeWidth="1.5"
      />
      <circle cx="365" cy="100" r="22" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <circle cx="365" cy="100" r="4" fill="#10B981" />
      <text x="365" y="75" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle">
        Exterior Muster
      </text>
      <text x="365" y="135" fill="#065F46" fontSize="7" textAnchor="middle">
        Shift Headcount Post
      </text>
    </svg>
  );
};