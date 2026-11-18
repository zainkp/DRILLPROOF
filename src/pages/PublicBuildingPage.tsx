import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { ImageStorageService } from '../services/imageStorage';
import {
  Flame,
  Activity,
  Compass,
  ShieldAlert,
  Phone,
  MapPin,
  AlertTriangle,
  Building2,
  ChevronDown,
  ExternalLink,
  Info,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  FileQuestion,
  HelpCircle,
  Accessibility,
  ArrowUpRight,
} from 'lucide-react';
import { HazardType, FloorExit } from '../types';
import { formatHazardName } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

export const PublicBuildingPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug, buildingId } = useParams<{ slug?: string; buildingId?: string }>();
  const { buildings, floors, institution } = useData();

  const rawIdentifier = (slug || buildingId || '').trim();
  const normalizedIdentifier = rawIdentifier.toLowerCase();

  // Strict lookup by slug, id, or code — NEVER fall back to another building
  const building = rawIdentifier
    ? buildings.find(
        (b) =>
          b.slug.toLowerCase() === normalizedIdentifier ||
          b.id.toLowerCase() === normalizedIdentifier ||
          (b.code && b.code.toLowerCase() === normalizedIdentifier)
      )
    : undefined;

  const [activeHazard, setActiveHazard] = useState<HazardType>('fire');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [enlargedPlanModalOpen, setEnlargedPlanModalOpen] = useState(false);

  // If building is NOT found, render dedicated high-contrast Emergency Passport Not Found screen
  if (!building) {
    return (
      <div className="min-h-screen bg-brand-canvas text-brand-graphite-900 font-sans flex flex-col justify-between">
        {/* Top Emergency Status Bar */}
        <div className="bg-brand-graphite-950 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-brand-graphite-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-red animate-pulse" />
            <span className="tracking-wider uppercase font-mono">
              EMERGENCY PASSPORT SYSTEM &bull; DRILLPROOF
            </span>
          </div>
          <span className="text-[10px] font-mono bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded">
            RECORD NOT FOUND
          </span>
        </div>

        {/* Central Not-Found Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-xl w-full bg-white border-2 border-brand-border rounded shadow-elevated p-6 sm:p-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-brand-red mx-auto mb-4 border border-red-200">
              <FileQuestion className="w-7 h-7 text-brand-red" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-center text-brand-graphite-900 tracking-tight">
              Building Emergency Passport Not Located
            </h1>

            <p className="mt-2 text-center text-xs sm:text-sm text-brand-graphite-600 leading-relaxed">
              No registered institutional safety passport matches the identifier:
            </p>

            <div className="mt-3 p-2.5 bg-brand-graphite-100 rounded border border-brand-border text-center font-mono text-xs font-bold text-brand-graphite-800 break-all select-all">
              {rawIdentifier ? `"${rawIdentifier}"` : '[No Identifier Specified]'}
            </div>

            {/* Practical Guidance */}
            <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200 rounded text-xs space-y-2 text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 font-mono text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>On-Site Emergency Assistance</span>
              </div>
              <p className="leading-normal">
                If you scanned an official physical QR placard at a building entrance and reached this page:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
                <li>Call Campus Safety Dispatch: <a href="tel:+918044219911" className="font-bold underline">+91 (0) 80 4421 9911</a></li>
                <li>In immediate danger, contact First Responders: <strong className="font-bold">112 / 101</strong></li>
                <li>Check with the nearest security desk or floor warden for a printed evacuation chart.</li>
              </ul>
            </div>

            {/* Prototype Note */}
            <p className="mt-4 text-[11px] text-brand-graphite-500 font-sans leading-normal text-center">
              Note: In prototype mode, buildings created in an administrator session are stored in that browser's local memory. If opened in a different browser profile or device, access the demo campus buildings below:
            </p>

            {/* Quick Links to Seeded Passports */}
            <div className="mt-5 pt-4 border-t border-brand-border">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-brand-graphite-400 text-center mb-2.5">
                Verified Campus Demo Passports
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {buildings.map((b) => (
                  <Link
                    key={b.id}
                    to={`/building/${b.slug || b.id}`}
                    className="p-2 text-center rounded border border-brand-border bg-brand-graphite-50 hover:bg-brand-graphite-100 hover:border-brand-red text-xs font-semibold text-brand-graphite-800 transition-colors"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link to="/">
                <Button size="sm" variant="outline">
                  Return to DRILLPROOF Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs font-mono text-brand-graphite-400 border-t border-brand-border">
          DRILLPROOF Emergency Readiness System &bull; Northstar Institute Campus
        </div>
      </div>
    );
  }

  // Building IS FOUND — render complete Emergency Passport
  const buildingFloors = floors.filter((f) => f.buildingId === building.id);
  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    buildingFloors[0]?.id || ''
  );

  // Synchronize selected floor when building changes
  useEffect(() => {
    if (buildingFloors.length > 0) {
      setSelectedFloorId(buildingFloors[0].id);
    }
  }, [building?.id]);

  const selectedFloor =
    buildingFloors.find((f) => f.id === selectedFloorId) || buildingFloors[0];

  const [resolvedPlanUrl, setResolvedPlanUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (selectedFloor?.floorPlanUrl && building) {
      const cached = ImageStorageService.getCachedSync(building.id, selectedFloor.id);
      if (cached) {
        setResolvedPlanUrl(cached);
      }
      ImageStorageService.resolvePlanUrl(selectedFloor.floorPlanUrl, building.id, selectedFloor.id)
        .then((res) => {
          if (isMounted && res) {
            setResolvedPlanUrl(res);
          }
        })
        .catch(() => {
          if (isMounted) setResolvedPlanUrl(selectedFloor.floorPlanUrl || null);
        });
    } else {
      setResolvedPlanUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedFloor, building]);

  const displayPlanUrl = resolvedPlanUrl || selectedFloor?.floorPlanUrl;

  // Institutional default hazard instructions if building plan has none configured
  const defaultHazardInstructions = [
    {
      hazard: 'fire' as const,
      title: 'Fire & Smoke Evacuation Protocol',
      immediateActions: [
        'Trigger the nearest red manual call station pull box immediately.',
        'Alert nearby classrooms, offices, and occupants. Close doors behind you.',
        'Evacuate systematically via designated fire stairwells. Do NOT use elevators.',
        'Report to designated assembly area and check in with your Floor Warden.',
      ],
      evacuationRouteNote: 'Follow marked green illuminated exit signage directly to outside grade level.',
      doNotDo: [
        'Do NOT use elevators under any circumstances.',
        'Do NOT stop to collect heavy personal baggage or items.',
        'Do NOT re-enter the facility until the All Clear is sounded by Safety Officers.',
      ],
    },
    {
      hazard: 'earthquake' as const,
      title: 'Earthquake — Drop, Cover & Hold Protocol',
      immediateActions: [
        'DROP to your hands and knees immediately to prevent being knocked down.',
        'COVER your head and neck under sturdy desks, tables, or interior weight-bearing walls.',
        'HOLD ON until ground shaking stops completely.',
        'Once vibrations cease, systematically evacuate via marked stairwells to open muster areas.',
      ],
      evacuationRouteNote: 'Move away from glass curtain walls and overhead fixtures before evacuating.',
      doNotDo: [
        'Do NOT run outside while shaking is in progress.',
        'Do NOT stand under glass skylights or unsupported shelving.',
      ],
    },
    {
      hazard: 'flood' as const,
      title: 'Severe Water Ingress / Flash Flood Protocol',
      immediateActions: [
        'Isolate local electrical circuits if safe to do so.',
        'Relocate sensitive electronic equipment and important items to upper levels.',
        'Direct all building occupants to designated upper floor muster zones.',
      ],
      evacuationRouteNote: 'Do not traverse flooded basement car parks or lower pedestrian pathways.',
      doNotDo: [
        'Do NOT step into standing water near electrical panels or machinery.',
        'Do NOT attempt to operate submerged equipment.',
      ],
    },
    {
      hazard: 'medical' as const,
      title: 'Critical Medical Emergency Protocol',
      immediateActions: [
        'Call Campus Emergency Dispatch immediately (+91 80 4421 9911).',
        'State exact facility, floor level, room location, and casualty condition.',
        'Retrieve nearest First Aid kit or automated external defibrillator (AED).',
        'Direct emergency responders to nearest elevator or stretcher access point.',
      ],
      evacuationRouteNote: 'Maintain primary egress corridor clear for paramedic stretcher access.',
      doNotDo: [
        'Do NOT move casualties with suspected spinal injuries unless in immediate peril.',
        'Do NOT crowd the first-aid area.',
      ],
    },
  ];

  const hazardInstructionsList =
    building.plan?.hazardInstructions && building.plan.hazardInstructions.length > 0
      ? building.plan.hazardInstructions
      : defaultHazardInstructions;

  const hazardInstruction =
    hazardInstructionsList.find((h) => h.hazard === activeHazard) ||
    hazardInstructionsList[0];

  const primaryAssemblyPoint =
    building.assemblyPoints?.find((a) => a.isPrimary) ||
    building.assemblyPoints?.[0] || {
      id: 'ap-campus-default',
      name: 'Main Campus Assembly Ground (East Athletic Field)',
      code: 'ASM-MAIN',
      locationDescription: 'Open athletic grounds adjacent to perimeter road. Follow floor warden directions.',
      capacity: 1500,
      isPrimary: true,
    };

  const secondaryAssemblyPoints =
    building.assemblyPoints?.filter((a) => !a.isPrimary) || [];

  const contactsList =
    building.emergencyContacts && building.emergencyContacts.length > 0
      ? building.emergencyContacts
      : [
          {
            id: 'ec-default-1',
            role: 'Campus Safety & Emergency Dispatch',
            name: 'Central Control Room',
            phone: '+91 (0) 80 4421 9911',
            priority: 1,
            isExternal: false,
          },
          {
            id: 'ec-default-2',
            role: 'Municipal Fire & Rescue Service',
            name: 'Emergency Dispatch',
            phone: '101 / 112',
            priority: 2,
            isExternal: true,
          },
        ];

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/building/${building.slug || building.id}`
      : `https://drillproof.io/building/${building.slug || building.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-graphite-900 font-sans pb-16">
      {/* 1. Facility Header Card with Multi-Building Selector */}
      <div className="bg-white border-b border-brand-border px-4 py-6 sm:px-8 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Top Context & Building Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/70">
            <div className="flex items-center gap-2 text-xs font-mono text-brand-graphite-500 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
              <span className="font-bold text-brand-graphite-800">{institution.name}</span>
              <span>&bull;</span>
              <span>Public Emergency Guide</span>
            </div>

            {/* Dynamic Multi-Building Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="public-building-select"
                className="text-[11px] font-mono text-brand-graphite-500 uppercase font-bold tracking-wider whitespace-nowrap"
              >
                Facility:
              </label>
              <div className="relative">
                <select
                  id="public-building-select"
                  value={building.id}
                  onChange={(e) => {
                    const target = buildings.find((b) => b.id === e.target.value);
                    if (target) {
                      navigate(`/building/${target.slug || target.id}`);
                    }
                  }}
                  className="appearance-none bg-brand-graphite-50 hover:bg-white text-brand-graphite-900 font-sans font-semibold text-xs py-1.5 pl-3 pr-8 rounded border border-brand-border hover:border-brand-graphite-400 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all cursor-pointer shadow-xs"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.code ? `(${b.code})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-brand-graphite-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Building Identity & Vital Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-graphite-500 uppercase tracking-wider mb-1">
                <span className="font-bold text-brand-graphite-700 bg-brand-graphite-100 px-1.5 py-0.5 rounded border border-brand-border/60">
                  {building.code || 'BLD'}
                </span>
                <span>&bull;</span>
                <span className="font-bold text-brand-graphite-700">{building.type.toUpperCase()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-graphite-900 tracking-tight">
                {building.name}
              </h1>
              <p className="text-xs text-brand-graphite-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-graphite-400 flex-shrink-0" />
                <span>{building.address}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-brand-graphite-50 border border-brand-border px-3 py-2 rounded text-center min-w-[64px]">
                <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Levels</span>
                <span className="text-base font-bold font-mono text-brand-graphite-900">{building.totalFloors}</span>
              </div>
              <div className="bg-brand-graphite-50 border border-brand-border px-3 py-2 rounded text-center min-w-[72px]">
                <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Capacity</span>
                <span className="text-base font-bold font-mono text-brand-graphite-900">{building.occupancyCapacity}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded text-center min-w-[80px]">
                <span className="text-[10px] font-mono text-emerald-700 uppercase block">Safety Plan</span>
                <span className="text-xs font-bold text-emerald-800 uppercase font-mono">VERIFIED</span>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="bg-brand-graphite-50 hover:bg-brand-graphite-100 border border-brand-border hover:border-brand-graphite-400 px-3 py-2 rounded text-center transition-colors group cursor-pointer"
                title="Display QR code for this building"
              >
                <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3 text-brand-graphite-600 group-hover:text-brand-red" />
                  <span>QR Code</span>
                </span>
                <span className="text-xs font-bold text-brand-graphite-800 group-hover:text-brand-red font-mono uppercase">
                  SHARE
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* 3. Primary Muster Assembly Area */}
        {primaryAssemblyPoint && (
          <div className="bg-white border-2 border-emerald-600 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                    Primary Muster Area
                  </span>
                  <span className="text-xs text-brand-graphite-600 font-mono">
                    Capacity: {primaryAssemblyPoint.capacity} occupants
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-graphite-900 mt-1">
                  {primaryAssemblyPoint.name}
                </h3>

                <p className="text-xs text-brand-graphite-700 mt-0.5 leading-relaxed font-medium">
                  {primaryAssemblyPoint.locationDescription}
                </p>

                {/* Secondary muster zones if any */}
                {secondaryAssemblyPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-brand-border text-xs text-brand-graphite-600">
                    <span className="font-bold text-brand-graphite-800 block text-[11px] font-mono uppercase mb-1">
                      Secondary Overflow Muster Area:
                    </span>
                    {secondaryAssemblyPoints.map((sec) => (
                      <p key={sec.id} className="text-xs text-brand-graphite-700">
                        &bull; <strong>{sec.name} ({sec.code}):</strong> {sec.locationDescription}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Hazard Response Protocols */}
        <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono">
              Hazard Response Protocols
            </h2>
            <p className="text-xs text-brand-graphite-500 mt-0.5">
              Select the active hazard condition to read immediate protective actions.
            </p>
          </div>

          {/* Hazard Tab Buttons */}
          <div className="flex overflow-x-auto border-b border-brand-border bg-white divide-x divide-brand-border">
            {hazardInstructionsList.map((inst) => {
              const isActive = activeHazard === inst.hazard;
              return (
                <button
                  key={inst.hazard}
                  onClick={() => setActiveHazard(inst.hazard)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors select-none ${
                    isActive
                      ? 'bg-brand-red text-white'
                      : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
                  }`}
                >
                  {inst.hazard === 'fire' ? (
                    <Flame className="w-3.5 h-3.5" />
                  ) : inst.hazard === 'earthquake' ? (
                    <Activity className="w-3.5 h-3.5" />
                  ) : inst.hazard === 'flood' ? (
                    <Compass className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  <span>{formatHazardName(inst.hazard)}</span>
                </button>
              );
            })}
          </div>

          {/* Instruction Content */}
          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-graphite-900 tracking-tight">
              {hazardInstruction.title}
            </h3>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Immediate Action Steps
              </h4>
              <ul className="space-y-2">
                {hazardInstruction.immediateActions.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-brand-graphite-800 leading-relaxed font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-graphite-100 flex items-center justify-center font-mono font-bold text-[10px] text-brand-graphite-800 flex-shrink-0 mt-0.5 border border-brand-border">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {hazardInstruction.evacuationRouteNote && (
              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-700">
                <span className="font-bold text-brand-graphite-900 block mb-0.5 font-mono uppercase text-[10px]">
                  Evacuation Route Note:
                </span>
                {hazardInstruction.evacuationRouteNote}
              </div>
            )}

            {hazardInstruction.doNotDo.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red mb-2 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-brand-red" />
                  Strict Prohibitions
                </h4>
                <ul className="space-y-1.5">
                  {hazardInstruction.doNotDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-red-700 flex items-start gap-2 font-medium">
                      <span className="text-red-500 font-bold">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 5. Floor Level Selector, Interactive Plan & Exits */}
        {buildingFloors.length > 0 && (
          <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono">
                  Floor Information & Egress Exits
                </h2>
                <p className="text-xs text-brand-graphite-500">
                  Select your current floor to view designated emergency stairwells, floor maps, and fire suppression assets.
                </p>
              </div>

              {/* Floor Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-brand-graphite-600 whitespace-nowrap">
                  Current Level:
                </label>
                <select
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  className="rounded border border-brand-border px-2.5 py-1.5 text-xs font-bold text-brand-graphite-900 bg-white focus:border-brand-red focus:outline-none"
                >
                  {buildingFloors.map((flr) => (
                    <option key={flr.id} value={flr.id}>
                      {flr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFloor && (
              <div className="p-5 space-y-6">
                {/* Floor Plan Display Section */}
                {displayPlanUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-red" />
                        <span>Floor Evacuation Schematic &bull; {selectedFloor.label}</span>
                      </h3>

                      <Button
                        size="sm"
                        variant="outline"
                        icon={Maximize2}
                        onClick={() => setEnlargedPlanModalOpen(true)}
                        className="text-xs"
                      >
                        Enlarge Floor Plan
                      </Button>
                    </div>

                    {/* Interactive Plan Viewer Box */}
                    <div className="relative border border-brand-border rounded bg-slate-50 overflow-hidden group cursor-pointer" onClick={() => setEnlargedPlanModalOpen(true)}>
                      <img
                        src={displayPlanUrl}
                        alt={`Evacuation plan for ${selectedFloor.label}`}
                        className="w-full h-auto max-h-[360px] object-contain mx-auto transition-transform group-hover:scale-[1.01]"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 shadow">
                        <Maximize2 className="w-3 h-3" />
                        <span>Click to Enlarge</span>
                      </div>
                      <div className="p-2 bg-brand-graphite-100/90 border-t border-brand-border text-center text-[10px] font-mono text-brand-graphite-600">
                        {selectedFloor.floorPlanDisclaimer || 'Illustrative Demo Plan — Not an Approved Evacuation Plan'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Designated Egress Exits */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 mb-2 font-mono flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-brand-graphite-600" />
                    <span>Designated Exits for {selectedFloor.label} ({selectedFloor.exits.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedFloor.exits.map((exit) => (
                      <div
                        key={exit.id}
                        className={`p-3.5 rounded border text-xs flex flex-col justify-between ${
                          exit.status === 'clear'
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                            : exit.status === 'partially_obstructed'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                            : 'bg-red-50/80 border-red-300 text-red-950'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-brand-graphite-900 leading-snug">
                              {exit.name}
                            </span>
                            <span
                              className={`font-bold font-mono text-[9px] px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                                exit.status === 'clear'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : exit.status === 'partially_obstructed'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-red-100 text-red-900'
                              }`}
                            >
                              {exit.status === 'clear' ? 'CLEAR' : exit.status === 'partially_obstructed' ? 'OBSTRUCTED' : 'BLOCKED'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-brand-graphite-600 font-mono mb-2">
                            <span className="capitalize">{exit.type.replace(/_/g, ' ')}</span>
                            {exit.isAccessible && (
                              <span className="inline-flex items-center gap-0.5 text-blue-700 bg-blue-50 px-1 rounded border border-blue-200">
                                <Accessibility className="w-2.5 h-2.5" />
                                <span>ADA Ramp</span>
                              </span>
                            )}
                          </div>

                          {exit.locationDescription && (
                            <p className="text-[11px] text-brand-graphite-700 leading-relaxed font-sans mb-1.5">
                              <span className="font-semibold text-brand-graphite-800">Location:</span> {exit.locationDescription}
                            </p>
                          )}

                          {exit.instructions && (
                            <p className="text-[11px] text-brand-graphite-600 font-sans italic">
                              &ldquo;{exit.instructions}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety equipment on this floor */}
                <div className="pt-2 border-t border-brand-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 mb-2 font-mono flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-red" />
                    <span>Safety Equipment On This Floor</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedFloor.equipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-2.5 rounded border border-brand-border bg-brand-graphite-50/50 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-brand-graphite-900 block">
                            {eq.identifier}
                          </span>
                          <span className="text-[11px] text-brand-graphite-500">
                            {eq.location}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                            eq.status === 'operational'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {eq.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Emergency Contacts Table with Quick Call Affordance */}
        <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono">
              Emergency Contact Directory
            </h2>
            <p className="text-xs text-brand-graphite-500">
              One-tap direct dials for campus wardens, security desks, and municipal first responders.
            </p>
          </div>

          <div className="divide-y divide-brand-border">
            {contactsList.map((c) => (
              <div
                key={c.id}
                className="p-3.5 sm:px-6 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-brand-graphite-900 block sm:inline mr-2">
                    {c.role}
                  </span>
                  <span className="text-brand-graphite-500 text-[11px]">
                    ({c.name})
                  </span>
                </div>
                <a
                  href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 bg-brand-graphite-100 hover:bg-brand-red hover:text-white text-brand-graphite-900 px-3 py-1.5 rounded font-mono font-bold text-xs transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{c.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Safety Notice */}
        <div className="p-4 rounded border border-brand-border bg-brand-graphite-100/60 text-xs text-brand-graphite-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-brand-graphite-900">
            <ShieldCheck className="w-4 h-4 text-brand-red flex-shrink-0" />
            <span>Official Emergency Notice</span>
          </div>
          <p className="leading-relaxed text-[11px] text-brand-graphite-600">
            This Emergency Passport reflects the verified institutional safety guidelines for {building.name}. In an active emergency or immediate threat to life, call municipal emergency dispatch (112 / 101) and follow directions from designated building wardens.
          </p>
        </div>
      </div>

      {/* QR Code Modal for Demo */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`${building.name} Emergency Passport`}
        description="Scan with any smartphone camera to open this Emergency Passport."
        maxWidth="sm"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="p-4 bg-white border-2 border-brand-graphite-950 rounded shadow-md mb-4 relative">
            <QRCodeSVG value={currentUrl} size={190} level="M" />
          </div>

          <span className="font-mono text-xs font-bold text-brand-graphite-800 bg-brand-graphite-100 px-2 py-0.5 rounded mb-2">
            PASSPORT: {building.code}
          </span>

          <p className="text-xs font-mono text-brand-graphite-700 text-center break-all mb-4 px-2 select-all">
            {currentUrl}
          </p>

          <div className="flex flex-col w-full gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={copiedUrl ? Check : Copy}
              onClick={handleCopy}
              className="w-full"
            >
              {copiedUrl ? 'Passport Link Copied!' : 'Copy Passport URL'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setQrModalOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enlarged Floor Plan Modal */}
      {selectedFloor && displayPlanUrl && (
        <Modal
          isOpen={enlargedPlanModalOpen}
          onClose={() => setEnlargedPlanModalOpen(false)}
          title={`Evacuation Schematic &bull; ${building.name} (${selectedFloor.label})`}
          description={selectedFloor.floorPlanDisclaimer || 'Illustrative Demo Plan — Not an Approved Evacuation Plan'}
          maxWidth="2xl"
        >
          <div className="p-2 sm:p-4 bg-slate-900 rounded overflow-auto max-h-[75vh] flex items-center justify-center">
            <img
              src={displayPlanUrl}
              alt={`Full size floor plan for ${selectedFloor.label}`}
              className="w-full h-auto max-w-4xl object-contain rounded"
            />
          </div>
          <div className="pt-3 border-t border-brand-border flex items-center justify-between">
            <span className="text-xs font-mono text-brand-graphite-500">
              Level: {selectedFloor.floorNumber} &bull; Capacity: {selectedFloor.occupancyCapacity}
            </span>
            <Button size="sm" variant="outline" onClick={() => setEnlargedPlanModalOpen(false)}>
              Close Full View
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
