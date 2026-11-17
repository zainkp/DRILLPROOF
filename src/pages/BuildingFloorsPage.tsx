import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  Layers,
  DoorOpen,
  ShieldCheck,
  Flame,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  Maximize2,
  Image as ImageIcon,
  FileCheck,
  Accessibility,
  Compass,
  Sparkles,
} from 'lucide-react';
import { formatDateString } from '../utils/formatters';
import { Floor, FloorExit, FloorEquipment } from '../types';
import { ImageStorageService } from '../services/imageStorage';
import {
  generateGenericFloorSvg,
  DISCLAIMER_TEXT,
} from '../data/sampleFloorPlans';

export const BuildingFloorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    buildings,
    floors,
    staff,
    user,
    addFloor,
    updateFloor,
    deleteFloor,
    addFloorExit,
    updateFloorExit,
    deleteFloorExit,
    addFloorEquipment,
    updateFloorEquipment,
    deleteFloorEquipment,
  } = useData();

  const isAdmin = user?.role === 'admin';

  const building = buildings.find(
    (b) => b.id.toLowerCase() === id?.toLowerCase() || b.slug.toLowerCase() === id?.toLowerCase()
  );

  if (!building) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="p-4 bg-red-50 text-brand-red rounded border border-red-200 mb-4 text-sm font-semibold">
          Facility record not found for ID: {id}
        </div>
        <Link to="/buildings">
          <Button variant="primary" size="sm">
            Return to Facilities Registry
          </Button>
        </Link>
      </div>
    );
  }

  const buildingFloors = floors.filter((f) => f.buildingId === building.id);

  const [activeFloorId, setActiveFloorId] = useState<string>(
    buildingFloors[0]?.id || ''
  );

  const activeFloor =
    buildingFloors.find((f) => f.id === activeFloorId) || buildingFloors[0];

  // Modals state
  const [addFloorModalOpen, setAddFloorModalOpen] = useState(false);
  const [editFloorModalOpen, setEditFloorModalOpen] = useState(false);
  const [addExitModalOpen, setAddExitModalOpen] = useState(false);
  const [editExitModalOpen, setEditExitModalOpen] = useState(false);
  const [editingExit, setEditingExit] = useState<FloorExit | null>(null);
  const [addEqModalOpen, setAddEqModalOpen] = useState(false);
  const [planUploadModalOpen, setPlanUploadModalOpen] = useState(false);
  const [enlargePlanModalOpen, setEnlargePlanModalOpen] = useState(false);

  // New Floor form
  const [newFloorNumber, setNewFloorNumber] = useState(buildingFloors.length);
  const [newFloorLabel, setNewFloorLabel] = useState('');
  const [newFloorCapacity, setNewFloorCapacity] = useState(250);

  // Edit Floor form
  const [editFloorLabel, setEditFloorLabel] = useState('');
  const [editFloorCapacity, setEditFloorCapacity] = useState(250);
  const [editFloorWardenId, setEditFloorWardenId] = useState('');

  // Add Exit form
  const [exitName, setExitName] = useState('');
  const [exitType, setExitType] = useState<FloorExit['type']>('stairwell_north');
  const [exitStatus, setExitStatus] = useState<FloorExit['status']>('clear');
  const [exitAccessible, setExitAccessible] = useState(true);
  const [exitLocation, setExitLocation] = useState('');
  const [exitInstructions, setExitInstructions] = useState('');

  // Edit Exit form
  const [editExitName, setEditExitName] = useState('');
  const [editExitType, setEditExitType] = useState<FloorExit['type']>('stairwell_north');
  const [editExitStatus, setEditExitStatus] = useState<FloorExit['status']>('clear');
  const [editExitAccessible, setEditExitAccessible] = useState(true);
  const [editExitLocation, setEditExitLocation] = useState('');
  const [editExitInstructions, setEditExitInstructions] = useState('');

  // New Equipment form
  const [eqType, setEqType] = useState<FloorEquipment['type']>('fire_extinguisher');
  const [eqIdentifier, setEqIdentifier] = useState('');
  const [eqLocation, setEqLocation] = useState('');
  const [eqStatus, setEqStatus] = useState<FloorEquipment['status']>('operational');

  // Plan Upload form
  const [uploadedPlanPreview, setUploadedPlanPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resolvedPlanUrl, setResolvedPlanUrl] = useState<string | null>(null);
  const [planFileName, setPlanFileName] = useState('floor_plan.png');
  const [planFileType, setPlanFileType] = useState('image/png');

  // Resolve plan URL from IndexedDB
  React.useEffect(() => {
    let isMounted = true;
    if (activeFloor?.floorPlanUrl) {
      const cached = ImageStorageService.getCachedSync(building.id, activeFloor.id);
      if (cached) setResolvedPlanUrl(cached);

      ImageStorageService.resolvePlanUrl(activeFloor.floorPlanUrl, building.id, activeFloor.id)
        .then((res) => {
          if (isMounted && res) setResolvedPlanUrl(res);
        })
        .catch(() => {
          if (isMounted) setResolvedPlanUrl(activeFloor.floorPlanUrl || null);
        });
    } else {
      setResolvedPlanUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeFloor, building.id]);

  const displayPlanUrl = resolvedPlanUrl || activeFloor?.floorPlanUrl;

  const getWardenName = (staffId: string) => {
    const s = staff.find((member) => member.id === staffId);
    return s ? `${s.name} (${s.title})` : 'Floor Warden';
  };

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newFloorLabel || `Level ${newFloorNumber} (New Wing)`;

    const created = addFloor(building.id, {
      floorNumber: Number(newFloorNumber),
      label,
      occupancyCapacity: Number(newFloorCapacity),
      primaryWardens: [],
      inspectionStatus: 'pass',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      floorPlanUrl: generateGenericFloorSvg(building.name, label, Number(newFloorNumber)),
      floorPlanType: 'svg',
      floorPlanDisclaimer: DISCLAIMER_TEXT,
      exits: [
        {
          id: `ex-${Date.now()}-1`,
          name: 'North Egress Stairwell',
          type: 'stairwell_north',
          isAccessible: true,
          status: 'clear',
          locationDescription: 'North side pressurized fire stair core',
          instructions: 'Direct downward evacuation to grade.',
        },
      ],
      equipment: [
        {
          id: `eq-${Date.now()}-1`,
          type: 'fire_extinguisher',
          identifier: `EXT-${newFloorNumber}-01 (CO2 4.5kg)`,
          location: 'Corridor central recess',
          lastChecked: new Date().toISOString().split('T')[0],
          status: 'operational',
        },
      ],
    });

    setActiveFloorId(created.id);
    setNewFloorLabel('');
    setAddFloorModalOpen(false);
  };

  const handleOpenEditFloor = () => {
    if (!activeFloor) return;
    setEditFloorLabel(activeFloor.label);
    setEditFloorCapacity(activeFloor.occupancyCapacity);
    setEditFloorWardenId(activeFloor.primaryWardens[0] || '');
    setEditFloorModalOpen(true);
  };

  const handleSaveFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFloor) return;

    const primaryWardens = editFloorWardenId ? [editFloorWardenId] : activeFloor.primaryWardens;

    updateFloor(activeFloor.id, {
      label: editFloorLabel,
      occupancyCapacity: Number(editFloorCapacity),
      primaryWardens,
    });

    setEditFloorModalOpen(false);
  };

  const handleDeleteFloor = () => {
    if (!activeFloor) return;
    if (buildingFloors.length <= 1) {
      alert('A facility must contain at least one floor roster.');
      return;
    }
    if (window.confirm(`Delete "${activeFloor.label}" and its exit/equipment inventories?`)) {
      deleteFloor(activeFloor.id);
      const remaining = buildingFloors.filter((f) => f.id !== activeFloor.id);
      if (remaining.length > 0) setActiveFloorId(remaining[0].id);
    }
  };

  // Exit Creation
  const handleCreateExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFloor || !exitName.trim()) return;

    addFloorExit(activeFloor.id, {
      name: exitName.trim(),
      type: exitType,
      status: exitStatus,
      isAccessible: exitAccessible,
      locationDescription: exitLocation.trim() || undefined,
      instructions: exitInstructions.trim() || undefined,
    });

    setExitName('');
    setExitLocation('');
    setExitInstructions('');
    setAddExitModalOpen(false);
  };

  // Exit Editing
  const handleOpenEditExit = (exit: FloorExit) => {
    setEditingExit(exit);
    setEditExitName(exit.name);
    setEditExitType(exit.type);
    setEditExitStatus(exit.status);
    setEditExitAccessible(exit.isAccessible);
    setEditExitLocation(exit.locationDescription || '');
    setEditExitInstructions(exit.instructions || '');
    setEditExitModalOpen(true);
  };

  const handleSaveEditExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFloor || !editingExit) return;

    updateFloorExit(activeFloor.id, editingExit.id, {
      name: editExitName.trim(),
      type: editExitType,
      status: editExitStatus,
      isAccessible: editExitAccessible,
      locationDescription: editExitLocation.trim() || undefined,
      instructions: editExitInstructions.trim() || undefined,
    });

    setEditExitModalOpen(false);
    setEditingExit(null);
  };

  // Equipment Creation
  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFloor || !eqIdentifier.trim() || !eqLocation.trim()) return;

    addFloorEquipment(activeFloor.id, {
      type: eqType,
      identifier: eqIdentifier,
      location: eqLocation,
      lastChecked: new Date().toISOString().split('T')[0],
      status: eqStatus,
    });

    setEqIdentifier('');
    setEqLocation('');
    setAddEqModalOpen(false);
  };

  // Floor Plan Management
  const handleOpenPlanUpload = () => {
    setUploadedPlanPreview(activeFloor?.floorPlanUrl || null);
    setUploadError(null);
    setPlanUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload an optimized image or SVG.');
      return;
    }

    setPlanFileName(file.name);
    setPlanFileType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPlanPreview(dataUrl);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please ensure it is a valid PNG, JPG, or SVG.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFloorPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !activeFloor || !uploadedPlanPreview) return;

    try {
      // Save permanently to IndexedDB
      const persistentKey = await ImageStorageService.saveFloorPlan(
        building.id,
        activeFloor.id,
        uploadedPlanPreview,
        planFileName,
        planFileType
      );

      setResolvedPlanUrl(uploadedPlanPreview);

      updateFloor(activeFloor.id, {
        floorPlanUrl: persistentKey,
        floorPlanType: planFileType.includes('svg') ? 'svg' : 'upload',
        floorPlanDisclaimer: DISCLAIMER_TEXT,
      });

      setPlanUploadModalOpen(false);
    } catch {
      setUploadError('Failed to save floor plan into persistent storage.');
    }
  };

  const handleRemoveFloorPlan = async () => {
    if (!isAdmin || !activeFloor) return;
    if (window.confirm(`Remove floor plan schematic from "${activeFloor.label}"?`)) {
      await ImageStorageService.deleteFloorPlan(building.id, activeFloor.id);
      updateFloor(activeFloor.id, {
        floorPlanUrl: undefined,
      });
      setUploadedPlanPreview(null);
      setResolvedPlanUrl(null);
      setPlanUploadModalOpen(false);
    }
  };

  const handleGenerateTemplatePlan = () => {
    if (!isAdmin || !activeFloor) return;
    const svg = generateGenericFloorSvg(building.name, activeFloor.label, activeFloor.floorNumber);
    setResolvedPlanUrl(svg);
    updateFloor(activeFloor.id, {
      floorPlanUrl: svg,
      floorPlanType: 'svg',
      floorPlanDisclaimer: DISCLAIMER_TEXT,
    });
  };

  return (
    <div>
      <PageHeader
        title={`${building.name} — Floor Rosters & Egress Paths`}
        description="Maintain floor-by-floor egress maps, stairwell obstruction states, fire suppression assets, and assigned floor wardens."
        breadcrumbs={[
          { label: 'Facilities', path: '/buildings' },
          { label: building.name, path: `/buildings/${building.id}` },
          { label: 'Floor Rosters' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setNewFloorNumber(buildingFloors.length);
                  setNewFloorLabel(`Level ${buildingFloors.length}`);
                  setAddFloorModalOpen(true);
                }}
              >
                Add Floor Level
              </Button>
            )}

            <Link to={`/building/${building.slug}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                Public Emergency Passport
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Floor Navigation List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono mb-2">
            <span>Levels & Zones ({buildingFloors.length})</span>
          </div>

          <div className="space-y-2">
            {buildingFloors.map((flr) => {
              const isSelected = activeFloor?.id === flr.id;
              return (
                <button
                  key={flr.id}
                  onClick={() => setActiveFloorId(flr.id)}
                  className={`w-full text-left p-3.5 rounded border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-red bg-white shadow-xs ring-1 ring-brand-red'
                      : 'border-brand-border bg-white hover:border-brand-graphite-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-brand-graphite-900 truncate">
                      {flr.label}
                    </span>
                    <Badge
                      variant={flr.inspectionStatus === 'pass' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {flr.inspectionStatus === 'pass' ? 'PASS' : 'ATTENTION'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-brand-graphite-500 flex items-center justify-between font-mono">
                    <span>Cap: {flr.occupancyCapacity}</span>
                    <span>{flr.exits.length} exits &bull; {flr.equipment.length} items</span>
                  </div>
                  {flr.floorPlanUrl && (
                    <div className="mt-2 pt-1 border-t border-brand-border/60 flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
                      <FileCheck className="w-3 h-3" />
                      <span>Plan Attached</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Active Floor Maintenance */}
        {activeFloor && (
          <div className="lg:col-span-3 space-y-6">
            {/* Active Floor Header Card */}
            <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-red uppercase">
                    Level {activeFloor.floorNumber}
                  </span>
                  <h2 className="text-xl font-bold text-brand-graphite-900 tracking-tight">
                    {activeFloor.label}
                  </h2>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" icon={Edit3} onClick={handleOpenEditFloor}>
                      Edit Floor
                    </Button>
                    <Button size="sm" variant="outline" icon={Trash2} onClick={handleDeleteFloor}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Wardens & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-brand-graphite-50 rounded border border-brand-border text-xs mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
                    Designated Floor Wardens:
                  </span>
                  <div className="flex items-center gap-2 font-medium text-brand-graphite-800">
                    <UserCheck className="w-4 h-4 text-brand-red flex-shrink-0" />
                    <span>
                      {activeFloor.primaryWardens.length > 0
                        ? activeFloor.primaryWardens.map(getWardenName).join(', ')
                        : 'No warden assigned yet (click Edit Floor to assign)'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
                    Floor Safety Capacity:
                  </span>
                  <span className="font-mono font-bold text-brand-graphite-900 text-sm">
                    {activeFloor.occupancyCapacity} occupants max
                  </span>
                </div>
              </div>

              {/* Floor Plan Management Section */}
              <div className="mb-8 p-4 bg-brand-graphite-50/70 border border-brand-border rounded">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-red" />
                      <span>Architectural Floor Plan Schematic</span>
                    </h3>
                    <p className="text-[11px] text-brand-graphite-500">
                      Evacuation blueprint displayed on both administrative dashboards and public Emergency Passports.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {displayPlanUrl ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Maximize2}
                          onClick={() => setEnlargePlanModalOpen(true)}
                        >
                          Enlarge
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Upload}
                              onClick={handleOpenPlanUpload}
                            >
                              Replace Plan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Trash2}
                              onClick={handleRemoveFloorPlan}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      isAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Upload}
                            onClick={handleOpenPlanUpload}
                          >
                            Upload Plan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Sparkles}
                            onClick={handleGenerateTemplatePlan}
                          >
                            Generate Template
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </div>

                {displayPlanUrl ? (
                  <div
                    onClick={() => setEnlargePlanModalOpen(true)}
                    className="relative border border-brand-border rounded bg-white overflow-hidden cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={displayPlanUrl}
                      alt={`Floor plan for ${activeFloor.label}`}
                      className="w-full h-auto max-h-[280px] object-contain mx-auto transition-transform group-hover:scale-[1.01]"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 group-hover:bg-black text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 shadow">
                      <Maximize2 className="w-3 h-3" />
                      <span>Click to Enlarge</span>
                    </div>
                    <div className="p-2 bg-brand-graphite-100 border-t border-brand-border text-center text-[10px] font-mono text-brand-graphite-600">
                      {activeFloor.floorPlanDisclaimer || DISCLAIMER_TEXT}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-brand-border rounded bg-white">
                    <ImageIcon className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-brand-graphite-700">
                      No architectural evacuation plan uploaded for this floor.
                    </p>
                    <p className="text-[11px] text-brand-graphite-500 mt-1 max-w-md mx-auto">
                      Upload an architectural schematic (PNG, JPG, SVG, WebP) or generate an illustrative template plan.
                    </p>
                    {isAdmin && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Button size="sm" variant="primary" icon={Upload} onClick={handleOpenPlanUpload}>
                          Upload Image / SVG Plan
                        </Button>
                        <Button size="sm" variant="outline" icon={Sparkles} onClick={handleGenerateTemplatePlan}>
                          Auto-Generate Blueprint
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emergency Exits Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-brand-graphite-700" />
                      <span>Designated Egress Exits ({activeFloor.exits.length})</span>
                    </h3>
                    <p className="text-[11px] text-brand-graphite-500">
                      Configure fire escapes, exit routes, obstruction statuses, and emergency instructions.
                    </p>
                  </div>

                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Plus}
                      onClick={() => {
                        setExitName('');
                        setExitLocation('');
                        setExitInstructions('');
                        setExitStatus('clear');
                        setExitAccessible(true);
                        setAddExitModalOpen(true);
                      }}
                    >
                      Add Exit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeFloor.exits.map((exit) => (
                    <div
                      key={exit.id}
                      className={`p-3.5 rounded border text-xs flex flex-col justify-between group ${
                        exit.status === 'clear'
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                          : exit.status === 'partially_obstructed'
                          ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                          : 'border-red-300 bg-red-50/70 text-red-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-bold text-brand-graphite-900 leading-snug">
                            {exit.name}
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleOpenEditExit(exit)}
                                className="p-1 text-brand-graphite-500 hover:text-brand-graphite-900 rounded hover:bg-white/60 transition-colors"
                                title="Edit exit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete exit "${exit.name}"?`)) {
                                    deleteFloorExit(activeFloor.id, exit.id);
                                  }
                                }}
                                className="p-1 text-brand-graphite-400 hover:text-red-600 rounded hover:bg-white/60 transition-colors"
                                title="Delete exit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
                          <p className="text-[11px] text-brand-graphite-700 leading-relaxed font-sans mb-1">
                            <span className="font-semibold text-brand-graphite-800">Loc:</span> {exit.locationDescription}
                          </p>
                        )}

                        {exit.instructions && (
                          <p className="text-[11px] text-brand-graphite-600 font-sans italic mb-2">
                            &ldquo;{exit.instructions}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Status Display or Changer */}
                      <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-brand-graphite-500">Status:</span>
                        {isAdmin ? (
                          <select
                            value={exit.status}
                            onChange={(e) =>
                              updateFloorExit(activeFloor.id, exit.id, {
                                status: e.target.value as any,
                              })
                            }
                            className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border ${
                              exit.status === 'clear'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : exit.status === 'partially_obstructed'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="clear">CLEAR</option>
                            <option value="partially_obstructed">OBSTRUCTED</option>
                            <option value="blocked">BLOCKED</option>
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 uppercase ${
                              exit.status === 'clear'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exit.status === 'partially_obstructed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {exit.status === 'clear' ? 'CLEAR' : exit.status === 'partially_obstructed' ? 'OBSTRUCTED' : 'BLOCKED'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Equipment Inventory */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-red" />
                    <span>Safety Equipment Inventory ({activeFloor.equipment.length})</span>
                  </h3>

                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Plus}
                      onClick={() => setAddEqModalOpen(true)}
                    >
                      Add Asset
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-brand-border border border-brand-border rounded overflow-hidden">
                  {activeFloor.equipment.length === 0 ? (
                    <div className="p-6 text-center text-xs text-brand-graphite-500">
                      No safety equipment registered on this floor.
                    </div>
                  ) : (
                    activeFloor.equipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-brand-graphite-50/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <Flame className="w-4 h-4 text-brand-red flex-shrink-0" />
                          <div>
                            <span className="font-bold text-brand-graphite-900 block sm:inline mr-2">
                              {eq.identifier}
                            </span>
                            <span className="text-brand-graphite-500 text-[11px]">
                              Location: {eq.location}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isAdmin ? (
                            <>
                              <select
                                value={eq.status}
                                onChange={(e) =>
                                  updateFloorEquipment(activeFloor.id, eq.id, {
                                    status: e.target.value as any,
                                  })
                                }
                                className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border ${
                                  eq.status === 'operational'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="operational">OPERATIONAL</option>
                                <option value="requires_service">NEEDS SERVICE</option>
                                <option value="expired">EXPIRED</option>
                                <option value="missing">MISSING</option>
                              </select>

                              <button
                                onClick={() => deleteFloorEquipment(activeFloor.id, eq.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-brand-graphite-400 hover:text-red-600 transition-opacity"
                                title="Delete equipment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span
                              className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 uppercase ${
                                eq.status === 'operational'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {eq.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Floor Modal */}
      <Modal
        isOpen={addFloorModalOpen}
        onClose={() => setAddFloorModalOpen(false)}
        title="Add Floor Level"
        description="Register a new floor level, dorm wing, or basement zone."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFloor} className="space-y-3.5">
          <Input
            label="Floor Number"
            type="number"
            value={newFloorNumber}
            onChange={(e) => setNewFloorNumber(Number(e.target.value))}
            required
          />

          <Input
            label="Floor Label / Name"
            placeholder="e.g. Level 4 (Research Suites)"
            value={newFloorLabel}
            onChange={(e) => setNewFloorLabel(e.target.value)}
            required
          />

          <Input
            label="Max Floor Capacity"
            type="number"
            value={newFloorCapacity}
            onChange={(e) => setNewFloorCapacity(Number(e.target.value))}
            required
          />

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddFloorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Create Floor Level
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Floor Modal */}
      {activeFloor && (
        <Modal
          isOpen={editFloorModalOpen}
          onClose={() => setEditFloorModalOpen(false)}
          title={`Edit Floor: ${activeFloor.label}`}
          description="Update floor occupancy and assign designated warden."
          maxWidth="sm"
        >
          <form onSubmit={handleSaveFloor} className="space-y-3.5">
            <Input
              label="Floor Label"
              value={editFloorLabel}
              onChange={(e) => setEditFloorLabel(e.target.value)}
              required
            />

            <Input
              label="Occupancy Capacity"
              type="number"
              value={editFloorCapacity}
              onChange={(e) => setEditFloorCapacity(Number(e.target.value))}
              required
            />

            <Select
              label="Assign Primary Floor Warden"
              value={editFloorWardenId}
              onChange={(e) => setEditFloorWardenId(e.target.value)}
            >
              <option value="">-- Select from Staff Directory --</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.emergencyRole})
                </option>
              ))}
            </Select>

            <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditFloorModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Floor Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Egress Exit Modal */}
      <Modal
        isOpen={addExitModalOpen}
        onClose={() => setAddExitModalOpen(false)}
        title="Add Designated Egress Exit"
        description="Register a fire escape stairwell, emergency door, or external ramp."
        maxWidth="md"
      >
        <form onSubmit={handleCreateExit} className="space-y-3.5">
          <Input
            label="Exit Name / Label"
            placeholder="e.g. West Stairwell Fire Door"
            value={exitName}
            onChange={(e) => setExitName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Exit Type"
              value={exitType}
              onChange={(e) => setExitType(e.target.value as any)}
            >
              <option value="stairwell_north">North Stairwell</option>
              <option value="stairwell_south">South Stairwell</option>
              <option value="stairwell_east">East Stairwell</option>
              <option value="stairwell_west">West Stairwell</option>
              <option value="emergency_door">Main Grade Emergency Door</option>
              <option value="external_ramp">External ADA Ramp</option>
            </Select>

            <Select
              label="Initial Obstruction Status"
              value={exitStatus}
              onChange={(e) => setExitStatus(e.target.value as any)}
            >
              <option value="clear">Clear (Unobstructed)</option>
              <option value="partially_obstructed">Partially Obstructed</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>

          <Input
            label="Location Description"
            placeholder="e.g. North corridor opposite Lab 102"
            value={exitLocation}
            onChange={(e) => setExitLocation(e.target.value)}
          />

          <Input
            label="Evacuation Instructions"
            placeholder="e.g. Push panic bar. Direct egress to outside ground."
            value={exitInstructions}
            onChange={(e) => setExitInstructions(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={exitAccessible}
              onChange={(e) => setExitAccessible(e.target.checked)}
              className="rounded text-brand-red focus:ring-brand-red"
            />
            <span>Wheelchair / ADA Accessible Path</span>
          </label>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddExitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Add Exit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Egress Exit Modal */}
      {editingExit && (
        <Modal
          isOpen={editExitModalOpen}
          onClose={() => {
            setEditExitModalOpen(false);
            setEditingExit(null);
          }}
          title={`Edit Exit: ${editingExit.name}`}
          description="Update exit attributes, obstruction status, and instructions."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditExit} className="space-y-3.5">
            <Input
              label="Exit Name / Label"
              value={editExitName}
              onChange={(e) => setEditExitName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Exit Type"
                value={editExitType}
                onChange={(e) => setEditExitType(e.target.value as any)}
              >
                <option value="stairwell_north">North Stairwell</option>
                <option value="stairwell_south">South Stairwell</option>
                <option value="stairwell_east">East Stairwell</option>
                <option value="stairwell_west">West Stairwell</option>
                <option value="emergency_door">Main Grade Emergency Door</option>
                <option value="external_ramp">External ADA Ramp</option>
              </Select>

              <Select
                label="Obstruction Status"
                value={editExitStatus}
                onChange={(e) => setEditExitStatus(e.target.value as any)}
              >
                <option value="clear">Clear (Unobstructed)</option>
                <option value="partially_obstructed">Partially Obstructed</option>
                <option value="blocked">Blocked</option>
              </Select>
            </div>

            <Input
              label="Location Description"
              value={editExitLocation}
              onChange={(e) => setEditExitLocation(e.target.value)}
            />

            <Input
              label="Evacuation Instructions"
              value={editExitInstructions}
              onChange={(e) => setEditExitInstructions(e.target.value)}
            />

            <label className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editExitAccessible}
                onChange={(e) => setEditExitAccessible(e.target.checked)}
                className="rounded text-brand-red focus:ring-brand-red"
              />
              <span>Wheelchair / ADA Accessible Path</span>
            </label>

            <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditExitModalOpen(false);
                  setEditingExit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Exit Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Equipment Modal */}
      <Modal
        isOpen={addEqModalOpen}
        onClose={() => setAddEqModalOpen(false)}
        title="Add Safety Equipment Asset"
        description="Register a portable extinguisher, AED defibrillator, or first-aid kit on this level."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateEquipment} className="space-y-3.5">
          <Select
            label="Asset Type"
            value={eqType}
            onChange={(e) => setEqType(e.target.value as any)}
          >
            <option value="fire_extinguisher">Fire Extinguisher</option>
            <option value="first_aid_kit">First Aid Medical Kit</option>
            <option value="aed_defibrillator">AED Automated Defibrillator</option>
            <option value="fire_hose">Pressurized Fire Hose Reel</option>
            <option value="emergency_light">Emergency Twin-LED Light</option>
            <option value="alarm_pull_station">Manual Alarm Pull Station</option>
          </Select>

          <Input
            label="Asset Identifier / Tag"
            placeholder="e.g. EXT-2-03 (DCP 6kg)"
            value={eqIdentifier}
            onChange={(e) => setEqIdentifier(e.target.value)}
            required
          />

          <Input
            label="Exact Physical Location"
            placeholder="e.g. Outside Lab 202 entrance pillar"
            value={eqLocation}
            onChange={(e) => setEqLocation(e.target.value)}
            required
          />

          <Select
            label="Initial Status"
            value={eqStatus}
            onChange={(e) => setEqStatus(e.target.value as any)}
          >
            <option value="operational">Operational</option>
            <option value="requires_service">Requires Service</option>
            <option value="expired">Expired</option>
            <option value="missing">Missing</option>
          </Select>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddEqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Register Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floor Plan Upload / Replace Modal */}
      <Modal
        isOpen={planUploadModalOpen}
        onClose={() => setPlanUploadModalOpen(false)}
        title={`Upload Floor Plan &bull; ${activeFloor?.label}`}
        description="Upload an architectural evacuation schematic (PNG, JPG, SVG, WebP up to 5MB)."
        maxWidth="md"
      >
        <form onSubmit={handleSaveFloorPlan} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono mb-2">
              Select Image or SVG File
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={handleFileChange}
              className="w-full text-xs text-brand-graphite-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border file:border-brand-border file:text-xs file:font-semibold file:bg-brand-graphite-100 hover:file:bg-brand-graphite-200 cursor-pointer"
            />
            <p className="text-[10px] text-brand-graphite-500 mt-1 font-mono">
              Accepted: SVG, PNG, JPG, WebP. Recommended: High contrast blueprint or dark/light slate drawing.
            </p>
          </div>

          {uploadedPlanPreview && (
            <div className="border border-brand-border rounded p-2 bg-slate-900">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                Preview Before Saving:
              </span>
              <img
                src={uploadedPlanPreview}
                alt="Upload preview"
                className="w-full h-auto max-h-[220px] object-contain rounded"
              />
            </div>
          )}

          <div className="pt-2 border-t border-brand-border flex items-center justify-between">
            {activeFloor?.floorPlanUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFloorPlan}
                className="text-red-600 hover:text-red-700 border-red-200"
              >
                Delete Current Plan
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPlanUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!uploadedPlanPreview}
              >
                Save Floor Plan
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Enlarged Plan Full-Screen Modal */}
      {displayPlanUrl && activeFloor && (
        <Modal
          isOpen={enlargePlanModalOpen}
          onClose={() => setEnlargePlanModalOpen(false)}
          title={`Full View &bull; ${building.name} (${activeFloor.label})`}
          description={activeFloor.floorPlanDisclaimer || DISCLAIMER_TEXT}
          maxWidth="2xl"
        >
          <div className="p-3 bg-slate-900 rounded overflow-auto max-h-[75vh] flex items-center justify-center">
            <img
              src={displayPlanUrl}
              alt={`Full size floor plan for ${activeFloor.label}`}
              className="w-full h-auto max-w-4xl object-contain rounded"
            />
          </div>
          <div className="pt-3 border-t border-brand-border flex items-center justify-between">
            <span className="text-xs font-mono text-brand-graphite-500">
              Level {activeFloor.floorNumber} &bull; Safety Capacity: {activeFloor.occupancyCapacity} occupants
            </span>
            <Button size="sm" variant="outline" onClick={() => setEnlargePlanModalOpen(false)}>
              Close Full View
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
