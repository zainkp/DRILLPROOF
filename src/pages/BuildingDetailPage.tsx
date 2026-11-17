import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  Layers,
  MapPin,
  Flame,
  Phone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  FileText,
  Activity,
  Compass,
  ShieldAlert,
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  DoorOpen,
  UserCheck,
  Upload,
  Maximize2,
  Image as ImageIcon,
  Sparkles,
  Accessibility,
  Eye,
  Info,
  Clock,
  Printer,
} from 'lucide-react';
import { formatHazardName, formatDateString } from '../utils/formatters';
import {
  HazardType,
  AssemblyPoint,
  EmergencyContact,
  HazardInstruction,
  Floor,
  FloorExit,
} from '../types';
import { ImageStorageService } from '../services/imageStorage';
import {
  generateGenericFloorSvg,
  DISCLAIMER_TEXT,
} from '../data/sampleFloorPlans';

type ActiveTab =
  | 'overview'
  | 'floors'
  | 'exits'
  | 'assembly'
  | 'contacts'
  | 'wardens'
  | 'instructions'
  | 'passport';

export const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    buildings,
    floors,
    staff,
    user,
    updateBuilding,
    deleteBuilding,
    addFloor,
    updateFloor,
    deleteFloor,
    addFloorExit,
    updateFloorExit,
    deleteFloorExit,
    addAssemblyPoint,
    updateAssemblyPoint,
    deleteAssemblyPoint,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    updateHazardInstruction,
  } = useData();

  const isAdmin = user?.role === 'admin';

  const building = buildings.find(
    (b) => b.id.toLowerCase() === id?.toLowerCase() || b.slug.toLowerCase() === id?.toLowerCase()
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Resolved floor plan cache for rendering
  const [resolvedPlans, setResolvedPlans] = useState<Record<string, string>>({});

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [apModalOpen, setApModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Floor Modals
  const [addFloorModalOpen, setAddFloorModalOpen] = useState(false);
  const [editFloorModalOpen, setEditFloorModalOpen] = useState(false);
  const [selectedFloorForEdit, setSelectedFloorForEdit] = useState<Floor | null>(null);
  const [planUploadModalOpen, setPlanUploadModalOpen] = useState(false);
  const [selectedFloorForPlan, setSelectedFloorForPlan] = useState<Floor | null>(null);
  const [enlargedPlanUrl, setEnlargedPlanUrl] = useState<string | null>(null);
  const [enlargedPlanTitle, setEnlargedPlanTitle] = useState('');

  // Exit Modals
  const [addExitModalOpen, setAddExitModalOpen] = useState(false);
  const [editExitModalOpen, setEditExitModalOpen] = useState(false);
  const [selectedExitForEdit, setSelectedExitForEdit] = useState<{ exit: FloorExit; floorId: string } | null>(null);

  // Profile edit form state
  const [bldName, setBldName] = useState('');
  const [bldCode, setBldCode] = useState('');
  const [bldType, setBldType] = useState<FloorExit['type'] | any>('academic');
  const [bldAddress, setBldAddress] = useState('');
  const [bldDesc, setBldDesc] = useState('');
  const [bldCapacity, setBldCapacity] = useState(0);
  const [bldYear, setBldYear] = useState(new Date().getFullYear());

  // Floor form state
  const [floorNumber, setFloorNumber] = useState(0);
  const [floorLabel, setFloorLabel] = useState('');
  const [floorCapacity, setFloorCapacity] = useState(200);
  const [floorWardenId, setFloorWardenId] = useState('');

  // Plan Upload form state
  const [planPreview, setPlanPreview] = useState<string | null>(null);
  const [planFileType, setPlanFileType] = useState('image/png');
  const [planFileName, setPlanFileName] = useState('plan.png');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Exit form state
  const [targetFloorId, setTargetFloorId] = useState('');
  const [exitName, setExitName] = useState('');
  const [exitType, setExitType] = useState<FloorExit['type']>('stairwell_north');
  const [exitStatus, setExitStatus] = useState<FloorExit['status']>('clear');
  const [exitAccessible, setExitAccessible] = useState(true);
  const [exitLocation, setExitLocation] = useState('');
  const [exitInstructions, setExitInstructions] = useState('');

  // Assembly point form state
  const [apName, setApName] = useState('');
  const [apCode, setApCode] = useState('');
  const [apLocation, setApLocation] = useState('');
  const [apCapacity, setApCapacity] = useState(500);
  const [apIsPrimary, setApIsPrimary] = useState(false);

  // Contact form state
  const [cRole, setCRole] = useState('');
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cIsExternal, setCIsExternal] = useState(false);

  // Instruction edit form state
  const [activeHazard, setActiveHazard] = useState<HazardType>('fire');
  const [instTitle, setInstTitle] = useState('');
  const [instActionsText, setInstActionsText] = useState('');
  const [instRouteNote, setInstRouteNote] = useState('');
  const [instDoNotDoText, setInstDoNotDoText] = useState('');

  // Sync profile state when building changes
  useEffect(() => {
    if (building) {
      setBldName(building.name);
      setBldCode(building.code);
      setBldType(building.type);
      setBldAddress(building.address);
      setBldDesc(building.description || '');
      setBldCapacity(building.occupancyCapacity);
      setBldYear(building.constructionYear || new Date().getFullYear());
    }
  }, [building]);

  // Resolve floor plans from IndexedDB on load or floor update
  useEffect(() => {
    if (!building) return;
    const buildingFloors = floors.filter((f) => f.buildingId === building.id);

    buildingFloors.forEach(async (flr) => {
      if (flr.floorPlanUrl) {
        const resolved = await ImageStorageService.resolvePlanUrl(flr.floorPlanUrl, building.id, flr.id);
        if (resolved) {
          setResolvedPlans((prev) => ({ ...prev, [flr.id]: resolved }));
        }
      }
    });
  }, [building, floors]);

  if (!building) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="p-4 bg-red-50 text-brand-red rounded border border-red-200 mb-4 text-sm font-semibold">
          Facility record not found for: {id}
        </div>
        <Link to="/buildings">
          <Button variant="primary" size="sm">
            Return to Facilities Directory
          </Button>
        </Link>
      </div>
    );
  }

  const buildingFloors = floors.filter((f) => f.buildingId === building.id);

  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://drillproof.io';
  };

  const publicPassportUrl = `${getOrigin()}/building/${building.slug || building.id}`;

  const getWardenName = (staffId: string) => {
    const s = staff.find((member) => member.id === staffId);
    return s ? `${s.name} (${s.title})` : 'Appointed Warden';
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Section 1: Overview Update
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    updateBuilding(building.id, {
      name: bldName.trim(),
      code: bldCode.toUpperCase().trim(),
      type: bldType,
      address: bldAddress.trim(),
      description: bldDesc.trim(),
      occupancyCapacity: Number(bldCapacity),
      constructionYear: Number(bldYear),
    });
    setProfileModalOpen(false);
  };

  // Section 2: Floor Management
  const handleOpenAddFloor = () => {
    setFloorNumber(buildingFloors.length);
    setFloorLabel(buildingFloors.length === 0 ? 'Ground Floor (Main Entrance)' : `Level ${buildingFloors.length}`);
    setFloorCapacity(Math.round((building.occupancyCapacity || 200) / Math.max(1, buildingFloors.length + 1)));
    setAddFloorModalOpen(true);
  };

  const handleCreateFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const label = floorLabel.trim() || `Level ${floorNumber}`;
    addFloor(building.id, {
      floorNumber: Number(floorNumber),
      label,
      occupancyCapacity: Number(floorCapacity),
      primaryWardens: [],
      inspectionStatus: 'pass',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      floorPlanUrl: generateGenericFloorSvg(building.name, label, Number(floorNumber)),
      floorPlanType: 'svg',
      floorPlanDisclaimer: DISCLAIMER_TEXT,
      exits: [
        {
          id: `ex-${building.id}-${Date.now()}-1`,
          name: Number(floorNumber) === 0 ? 'Main Building Exit' : 'North Stairwell',
          type: Number(floorNumber) === 0 ? 'emergency_door' : 'stairwell_north',
          isAccessible: true,
          status: 'clear',
          locationDescription: Number(floorNumber) === 0 ? 'Ground floor entrance foyer' : 'North side fire stair landing',
          instructions: 'Direct downward evacuation path to outside ground.',
        },
      ],
      equipment: [],
    });

    setAddFloorModalOpen(false);
  };

  const handleOpenEditFloor = (flr: Floor) => {
    setSelectedFloorForEdit(flr);
    setFloorLabel(flr.label);
    setFloorCapacity(flr.occupancyCapacity);
    setFloorWardenId(flr.primaryWardens[0] || '');
    setEditFloorModalOpen(true);
  };

  const handleSaveFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedFloorForEdit) return;

    const primaryWardens = floorWardenId ? [floorWardenId] : selectedFloorForEdit.primaryWardens;

    updateFloor(selectedFloorForEdit.id, {
      label: floorLabel.trim(),
      occupancyCapacity: Number(floorCapacity),
      primaryWardens,
    });

    setEditFloorModalOpen(false);
    setSelectedFloorForEdit(null);
  };

  const handleDeleteFloor = (flr: Floor) => {
    if (!isAdmin) return;
    if (window.confirm(`Delete "${flr.label}" and its associated emergency exits?`)) {
      deleteFloor(flr.id);
    }
  };

  // Section 2B: Floor Plan Upload with IndexedDB
  const handleOpenPlanUpload = (flr: Floor) => {
    setSelectedFloorForPlan(flr);
    setPlanPreview(resolvedPlans[flr.id] || flr.floorPlanUrl || null);
    setUploadError(null);
    setPlanUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload an optimized image, SVG, or PDF.');
      return;
    }

    setPlanFileName(file.name);
    setPlanFileType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPlanPreview(dataUrl);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please ensure it is a valid PNG, JPG, SVG, or PDF.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFloorPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedFloorForPlan || !planPreview) return;

    try {
      // Store in IndexedDB for reliable permanent persistence without localStorage quota limits
      const persistentKey = await ImageStorageService.saveFloorPlan(
        building.id,
        selectedFloorForPlan.id,
        planPreview,
        planFileName,
        planFileType
      );

      // Update in memory cache and state
      setResolvedPlans((prev) => ({ ...prev, [selectedFloorForPlan.id]: planPreview }));

      updateFloor(selectedFloorForPlan.id, {
        floorPlanUrl: persistentKey,
        floorPlanType: planFileType.includes('svg') ? 'svg' : 'upload',
        floorPlanDisclaimer: DISCLAIMER_TEXT,
      });

      setPlanUploadModalOpen(false);
      setSelectedFloorForPlan(null);
    } catch (err) {
      setUploadError('Could not save floor plan. Please try again.');
    }
  };

  const handleRemoveFloorPlan = async (flr: Floor) => {
    if (!isAdmin) return;
    if (window.confirm(`Remove evacuation plan from "${flr.label}"?`)) {
      await ImageStorageService.deleteFloorPlan(building.id, flr.id);
      setResolvedPlans((prev) => {
        const next = { ...prev };
        delete next[flr.id];
        return next;
      });
      updateFloor(flr.id, { floorPlanUrl: undefined });
      setPlanUploadModalOpen(false);
    }
  };

  // Section 3: Emergency Exits
  const handleOpenAddExit = (flrId?: string) => {
    setTargetFloorId(flrId || buildingFloors[0]?.id || '');
    setExitName('');
    setExitType('stairwell_north');
    setExitStatus('clear');
    setExitAccessible(true);
    setExitLocation('');
    setExitInstructions('');
    setAddExitModalOpen(true);
  };

  const handleCreateExitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !targetFloorId || !exitName.trim()) return;

    addFloorExit(targetFloorId, {
      name: exitName.trim(),
      type: exitType,
      status: exitStatus,
      isAccessible: exitAccessible,
      locationDescription: exitLocation.trim() || undefined,
      instructions: exitInstructions.trim() || undefined,
    });

    setAddExitModalOpen(false);
  };

  const handleOpenEditExit = (exit: FloorExit, floorId: string) => {
    setSelectedExitForEdit({ exit, floorId });
    setExitName(exit.name);
    setExitType(exit.type);
    setExitStatus(exit.status);
    setExitAccessible(exit.isAccessible);
    setExitLocation(exit.locationDescription || '');
    setExitInstructions(exit.instructions || '');
    setEditExitModalOpen(true);
  };

  const handleSaveEditExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedExitForEdit) return;

    updateFloorExit(selectedExitForEdit.floorId, selectedExitForEdit.exit.id, {
      name: exitName.trim(),
      type: exitType,
      status: exitStatus,
      isAccessible: exitAccessible,
      locationDescription: exitLocation.trim() || undefined,
      instructions: exitInstructions.trim() || undefined,
    });

    setEditExitModalOpen(false);
    setSelectedExitForEdit(null);
  };

  const handleDeleteExit = (floorId: string, exitId: string, exitNameStr: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Delete emergency exit "${exitNameStr}"?`)) {
      deleteFloorExit(floorId, exitId);
    }
  };

  // Section 4: Assembly Points
  const handleAddApSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !apName.trim() || !apLocation.trim()) return;

    addAssemblyPoint(building.id, {
      name: apName.trim(),
      code: apCode.toUpperCase().trim() || `AP-${building.assemblyPoints.length + 1}`,
      locationDescription: apLocation.trim(),
      capacity: Number(apCapacity),
      isPrimary: apIsPrimary || building.assemblyPoints.length === 0,
    });

    setApName('');
    setApCode('');
    setApLocation('');
    setApModalOpen(false);
  };

  // Section 5: Emergency Contacts
  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !cRole.trim() || !cPhone.trim()) return;

    addEmergencyContact(building.id, {
      role: cRole.trim(),
      name: cName.trim() || 'Duty Officer',
      phone: cPhone.trim(),
      isExternal: cIsExternal,
    });

    setCRole('');
    setCName('');
    setCPhone('');
    setCIsExternal(false);
    setContactModalOpen(false);
  };

  // Section 7: Hazard Instructions
  const handleOpenEditInstruction = (hazard: HazardType) => {
    setActiveHazard(hazard);
    const inst = building.plan.hazardInstructions.find((h) => h.hazard === hazard);
    setInstTitle(inst?.title || `${formatHazardName(hazard)} Emergency Protocol`);
    setInstActionsText(inst?.immediateActions?.join('\n') || '');
    setInstRouteNote(inst?.evacuationRouteNote || '');
    setInstDoNotDoText(inst?.doNotDo?.join('\n') || '');
    setInstructionModalOpen(true);
  };

  const handleSaveInstructionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const immediateActions = instActionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const doNotDo = instDoNotDoText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    updateHazardInstruction(building.id, activeHazard, {
      title: instTitle.trim(),
      immediateActions,
      evacuationRouteNote: instRouteNote.trim(),
      doNotDo,
    });

    setInstructionModalOpen(false);
  };

  // Active Hazard Instruction for current tab
  const currentHazardInstruction =
    building.plan.hazardInstructions.find((h) => h.hazard === activeHazard) ||
    building.plan.hazardInstructions[0];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <PageHeader
        title={building.name}
        description={`Facility Code: ${building.code} • Classification: ${building.type.toUpperCase()}`}
        breadcrumbs={[
          { label: 'Facilities', path: '/buildings' },
          { label: building.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={publicPassportUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                Public Passport
              </Button>
            </Link>

            {isAdmin && (
              <Button
                size="sm"
                variant="primary"
                icon={Edit3}
                onClick={() => setProfileModalOpen(true)}
              >
                Edit Facility Profile
              </Button>
            )}
          </div>
        }
      />

      {/* Central Navigation Tabs (Stage B Workflow) */}
      <div className="border-b border-brand-border bg-white rounded-t shadow-2xs overflow-x-auto flex divide-x divide-brand-border text-xs font-mono font-bold select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('floors')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'floors'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. Floors & Plans ({buildingFloors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exits')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'exits'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>
            3. Exits ({buildingFloors.reduce((acc, f) => acc + (f.exits?.length || 0), 0)})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assembly')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'assembly'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>4. Assembly Points ({building.assemblyPoints?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'contacts'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>5. Emergency Contacts ({building.emergencyContacts?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('wardens')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'wardens'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>6. Wardens & Staff</span>
        </button>

        <button
          onClick={() => setActiveTab('instructions')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'instructions'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>7. Hazard Protocols</span>
        </button>

        <button
          onClick={() => setActiveTab('passport')}
          className={`px-4 py-3 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'passport'
              ? 'bg-brand-red text-white'
              : 'text-brand-graphite-700 hover:bg-brand-graphite-50'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>8. Passport QR</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
              <div>
                <span className="font-mono text-xs font-bold text-brand-red uppercase">
                  {building.code} &bull; {building.type.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-brand-graphite-900 tracking-tight mt-0.5">
                  {building.name}
                </h2>
                <p className="text-xs text-brand-graphite-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-graphite-400 flex-shrink-0" />
                  <span>{building.address}</span>
                </p>
              </div>

              {isAdmin && (
                <Button size="sm" variant="outline" icon={Edit3} onClick={() => setProfileModalOpen(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-brand-border text-center font-mono">
              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-graphite-500 block mb-1">
                  Total Levels
                </span>
                <span className="text-lg font-bold text-brand-graphite-900">
                  {buildingFloors.length || building.totalFloors}
                </span>
              </div>

              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-graphite-500 block mb-1">
                  Designated Exits
                </span>
                <span className="text-lg font-bold text-brand-graphite-900">
                  {buildingFloors.reduce((acc, f) => acc + (f.exits?.length || 0), 0)}
                </span>
              </div>

              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-graphite-500 block mb-1">
                  Max Occupancy
                </span>
                <span className="text-lg font-bold text-brand-graphite-900">
                  {building.occupancyCapacity || 'Not set'}
                </span>
              </div>

              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-graphite-500 block mb-1">
                  Construction Year
                </span>
                <span className="text-lg font-bold text-brand-graphite-900">
                  {building.constructionYear || 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono mb-2">
                Facility Operational Profile
              </h3>
              <p className="text-xs text-brand-graphite-700 leading-relaxed max-w-3xl">
                {building.description ||
                  'No facility operational summary documented yet. Administrators can add critical hazard notes, structural descriptions, and sensitive materials details by clicking "Edit Profile".'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLOORS & FLOOR PLANS */}
      {activeTab === 'floors' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Floors & Architectural Evacuation Plans
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Configure levels, safety capacities, and upload high-resolution egress maps.
                </p>
              </div>

              {isAdmin && (
                <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenAddFloor}>
                  Add Floor Level
                </Button>
              )}
            </div>

            {buildingFloors.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-brand-border rounded bg-brand-graphite-50/50">
                <Layers className="w-10 h-10 text-brand-graphite-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-brand-graphite-800">No floor levels registered yet</h3>
                <p className="text-xs text-brand-graphite-500 mt-1 max-w-sm mx-auto">
                  Add the building's first level (e.g. Ground Floor) to begin mapping exits and uploading evacuation blueprints.
                </p>
                {isAdmin && (
                  <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenAddFloor} className="mt-4">
                    Add First Floor Level
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {buildingFloors.map((flr) => {
                  const planSrc = resolvedPlans[flr.id] || flr.floorPlanUrl;

                  return (
                    <div
                      key={flr.id}
                      className="border border-brand-border rounded bg-white overflow-hidden shadow-2xs"
                    >
                      {/* Floor Header Bar */}
                      <div className="p-4 bg-brand-graphite-50 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded bg-brand-graphite-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                            {flr.floorNumber}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-brand-graphite-900">{flr.label}</h3>
                            <span className="text-[11px] text-brand-graphite-500 font-mono">
                              Capacity: {flr.occupancyCapacity} occupants &bull; Exits: {flr.exits?.length || 0}
                            </span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" icon={Edit3} onClick={() => handleOpenEditFloor(flr)}>
                              Edit Floor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Trash2}
                              onClick={() => handleDeleteFloor(flr)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Floor Body: Plan Preview and Exits summary */}
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Floor Plan Card */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-brand-red" />
                              <span>Evacuation Schematic</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              {planSrc && (
                                <button
                                  onClick={() => {
                                    setEnlargedPlanUrl(planSrc);
                                    setEnlargedPlanTitle(`${building.name} — ${flr.label}`);
                                  }}
                                  className="text-[11px] font-mono font-semibold text-brand-graphite-700 hover:text-brand-red px-2 py-0.5 rounded border border-brand-border hover:bg-brand-graphite-50 flex items-center gap-1"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Enlarge</span>
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleOpenPlanUpload(flr)}
                                  className="text-[11px] font-mono font-semibold text-brand-red hover:underline px-2 py-0.5 rounded flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>{planSrc ? 'Replace' : 'Upload'}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {planSrc ? (
                            <div
                              onClick={() => {
                                setEnlargedPlanUrl(planSrc);
                                setEnlargedPlanTitle(`${building.name} — ${flr.label}`);
                              }}
                              className="relative border border-brand-border rounded bg-slate-50 overflow-hidden cursor-pointer group"
                            >
                              <img
                                src={planSrc}
                                alt={`Plan for ${flr.label}`}
                                className="w-full h-auto max-h-[220px] object-contain mx-auto group-hover:scale-[1.01] transition-transform"
                              />
                              <div className="p-1.5 bg-brand-graphite-100 text-center text-[10px] font-mono text-brand-graphite-600 border-t border-brand-border">
                                {flr.floorPlanDisclaimer || DISCLAIMER_TEXT}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center border border-dashed border-brand-border rounded bg-brand-graphite-50/50">
                              <ImageIcon className="w-6 h-6 text-brand-graphite-300 mx-auto mb-1" />
                              <span className="text-xs text-brand-graphite-500 block">
                                No evacuation blueprint uploaded.
                              </span>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  icon={Upload}
                                  onClick={() => handleOpenPlanUpload(flr)}
                                  className="mt-2 text-xs"
                                >
                                  Upload Plan
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Exits for this floor */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono flex items-center gap-1.5">
                              <DoorOpen className="w-3.5 h-3.5 text-brand-graphite-600" />
                              <span>Egress Exits ({flr.exits?.length || 0})</span>
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => handleOpenAddExit(flr.id)}
                                className="text-[11px] font-mono font-semibold text-brand-red hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Exit</span>
                              </button>
                            )}
                          </div>

                          {(!flr.exits || flr.exits.length === 0) ? (
                            <p className="text-xs text-brand-graphite-500 italic p-3 bg-brand-graphite-50 rounded">
                              No exits registered for this floor.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {flr.exits.map((exit) => (
                                <div
                                  key={exit.id}
                                  className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                                    exit.status === 'clear'
                                      ? 'bg-emerald-50/50 border-emerald-200'
                                      : exit.status === 'partially_obstructed'
                                      ? 'bg-amber-50/70 border-amber-300'
                                      : 'bg-red-50/70 border-red-300'
                                  }`}
                                >
                                  <div>
                                    <span className="font-bold text-brand-graphite-900 block">
                                      {exit.name}
                                    </span>
                                    <span className="text-[10px] text-brand-graphite-500 font-mono capitalize">
                                      {exit.type.replace(/_/g, ' ')} {exit.isAccessible && '• ADA Ramp'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                        exit.status === 'clear'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : exit.status === 'partially_obstructed'
                                          ? 'bg-amber-100 text-amber-900'
                                          : 'bg-red-100 text-red-900'
                                      }`}
                                    >
                                      {exit.status === 'clear' ? 'CLEAR' : exit.status === 'partially_obstructed' ? 'OBSTRUCTED' : 'BLOCKED'}
                                    </span>

                                    {isAdmin && (
                                      <button
                                        onClick={() => handleOpenEditExit(exit, flr.id)}
                                        className="p-1 text-brand-graphite-500 hover:text-brand-graphite-800 rounded"
                                        title="Edit Exit"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY EXITS */}
      {activeTab === 'exits' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Emergency Exits Directory (Grouped by Floor)
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Maintain stairwell corridors, fire doors, obstruction states, and evacuation instructions.
                </p>
              </div>

              {isAdmin && buildingFloors.length > 0 && (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => handleOpenAddExit()}>
                  Add Emergency Exit
                </Button>
              )}
            </div>

            {buildingFloors.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-brand-border rounded bg-brand-graphite-50">
                <DoorOpen className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
                <p className="text-xs text-brand-graphite-600">
                  Please add a floor level first before configuring emergency exits.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {buildingFloors.map((flr) => (
                  <div key={flr.id} className="border border-brand-border rounded overflow-hidden">
                    <div className="p-3 bg-brand-graphite-50 border-b border-brand-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-red uppercase">
                          {flr.label}
                        </span>
                        <span className="text-[11px] font-mono text-brand-graphite-500">
                          ({flr.exits?.length || 0} designated exits)
                        </span>
                      </div>

                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Plus}
                          onClick={() => handleOpenAddExit(flr.id)}
                          className="text-xs py-1"
                        >
                          Add Exit to {flr.label}
                        </Button>
                      )}
                    </div>

                    {(!flr.exits || flr.exits.length === 0) ? (
                      <div className="p-4 text-xs text-brand-graphite-400 italic">
                        No exits configured on this level.
                      </div>
                    ) : (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {flr.exits.map((exit) => (
                          <div
                            key={exit.id}
                            className={`p-3.5 rounded border text-xs flex flex-col justify-between ${
                              exit.status === 'clear'
                                ? 'bg-emerald-50/40 border-emerald-300 text-emerald-950'
                                : exit.status === 'partially_obstructed'
                                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                                : 'bg-red-50/70 border-red-300 text-red-950'
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
                                      onClick={() => handleOpenEditExit(exit, flr.id)}
                                      className="p-1 text-brand-graphite-600 hover:text-brand-graphite-900 rounded hover:bg-white/80"
                                      title="Edit Exit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExit(flr.id, exit.id, exit.name)}
                                      className="p-1 text-brand-graphite-400 hover:text-red-600 rounded hover:bg-white/80"
                                      title="Delete Exit"
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
                                <p className="text-[11px] text-brand-graphite-700 font-sans leading-relaxed mb-1">
                                  <span className="font-semibold text-brand-graphite-800">Loc:</span> {exit.locationDescription}
                                </p>
                              )}

                              {exit.instructions && (
                                <p className="text-[11px] text-brand-graphite-600 font-sans italic">
                                  &ldquo;{exit.instructions}&rdquo;
                                </p>
                              )}
                            </div>

                            {/* Obstruction status selector */}
                            <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-brand-graphite-500">Clearance:</span>
                              {isAdmin ? (
                                <select
                                  value={exit.status}
                                  onChange={(e) =>
                                    updateFloorExit(flr.id, exit.id, {
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
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    exit.status === 'clear'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : exit.status === 'partially_obstructed'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {exit.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ASSEMBLY POINTS */}
      {activeTab === 'assembly' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Muster Zones & Assembly Points
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Designated exterior muster locations clear of building collapse perimeter.
                </p>
              </div>

              {isAdmin && (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setApModalOpen(true)}>
                  Add Assembly Point
                </Button>
              )}
            </div>

            {(!building.assemblyPoints || building.assemblyPoints.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-brand-border rounded bg-brand-graphite-50">
                <MapPin className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
                <p className="text-xs text-brand-graphite-600">
                  No assembly points designated for this building yet.
                </p>
                {isAdmin && (
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => setApModalOpen(true)} className="mt-3">
                    Designate Assembly Point
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {building.assemblyPoints.map((ap) => (
                  <div
                    key={ap.id}
                    className={`p-4 rounded border text-xs flex flex-col justify-between ${
                      ap.isPrimary ? 'border-emerald-400 bg-emerald-50/40' : 'border-brand-border bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-mono text-xs font-bold text-brand-red uppercase mr-2">
                            {ap.code}
                          </span>
                          <span className="font-bold text-brand-graphite-900 text-sm">
                            {ap.name}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete assembly point "${ap.name}"?`)) {
                                deleteAssemblyPoint(building.id, ap.id);
                              }
                            }}
                            className="p-1 text-brand-graphite-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-brand-graphite-700 mt-1 leading-relaxed">
                        {ap.locationDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] font-mono">
                      <span>Safety Capacity: {ap.capacity}</span>
                      {ap.isPrimary && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          PRIMARY MUSTER
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Building Emergency Contacts Directory
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Direct dial contacts for appointed wardens, security desks, and emergency responders.
                </p>
              </div>

              {isAdmin && (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setContactModalOpen(true)}>
                  Add Emergency Contact
                </Button>
              )}
            </div>

            {(!building.emergencyContacts || building.emergencyContacts.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-brand-border rounded bg-brand-graphite-50">
                <Phone className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
                <p className="text-xs text-brand-graphite-600">
                  No emergency contacts configured for this facility yet.
                </p>
                {isAdmin && (
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => setContactModalOpen(true)} className="mt-3">
                    Add First Contact
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-brand-border border border-brand-border rounded overflow-hidden">
                {building.emergencyContacts.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-brand-graphite-50/50">
                    <div>
                      <span className="font-bold text-brand-graphite-900 block sm:inline mr-2">
                        {c.role}
                      </span>
                      <span className="text-brand-graphite-500 font-sans">
                        ({c.name}) {c.isExternal && '• External Service'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 bg-brand-graphite-100 hover:bg-brand-red hover:text-white text-brand-graphite-900 px-3 py-1.5 rounded font-mono font-bold text-xs transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </a>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete contact "${c.role}"?`)) {
                              deleteEmergencyContact(building.id, c.id);
                            }
                          }}
                          className="p-1 text-brand-graphite-400 hover:text-red-600"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: WARDENS & STAFF */}
      {activeTab === 'wardens' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Assigned Wardens & Responsible Staff
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Floor-by-floor safety roster and responsible evacuation team leads.
                </p>
              </div>
            </div>

            <div className="divide-y divide-brand-border border border-brand-border rounded overflow-hidden">
              {buildingFloors.length === 0 ? (
                <div className="p-6 text-center text-xs text-brand-graphite-500">
                  No floors registered yet.
                </div>
              ) : (
                buildingFloors.map((flr) => (
                  <div key={flr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-red block">
                        {flr.label}
                      </span>
                      <span className="text-brand-graphite-700 font-medium">
                        {flr.primaryWardens.length > 0
                          ? flr.primaryWardens.map(getWardenName).join(', ')
                          : 'No warden assigned yet'}
                      </span>
                    </div>

                    {isAdmin && (
                      <Button size="sm" variant="outline" icon={Edit3} onClick={() => handleOpenEditFloor(flr)}>
                        Assign Warden
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: HAZARD PROTOCOLS */}
      {activeTab === 'instructions' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-brand-graphite-900">
                  Emergency Hazard Protocols
                </h2>
                <p className="text-xs text-brand-graphite-500 mt-0.5">
                  Operational action steps and restrictions displayed to occupants on the Emergency Passport.
                </p>
              </div>

              {isAdmin && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={Edit3}
                  onClick={() => handleOpenEditInstruction(activeHazard)}
                >
                  Edit {formatHazardName(activeHazard)} Protocol
                </Button>
              )}
            </div>

            {/* Hazard Selector */}
            <div className="flex overflow-x-auto border-b border-brand-border bg-brand-graphite-50 rounded-t divide-x divide-brand-border mb-4">
              {(['fire', 'earthquake', 'flood', 'medical', 'severe_weather', 'chemical'] as HazardType[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setActiveHazard(hz)}
                  className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeHazard === hz
                      ? 'bg-brand-red text-white'
                      : 'text-brand-graphite-700 hover:bg-brand-graphite-100'
                  }`}
                >
                  {formatHazardName(hz)}
                </button>
              ))}
            </div>

            {currentHazardInstruction ? (
              <div className="space-y-4 p-4 border border-brand-border rounded bg-white">
                <h3 className="text-sm font-bold text-brand-graphite-900">
                  {currentHazardInstruction.title}
                </h3>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono mb-2">
                    Immediate Action Steps
                  </h4>
                  <ul className="list-decimal list-inside space-y-1 text-xs text-brand-graphite-800 leading-relaxed font-medium">
                    {currentHazardInstruction.immediateActions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {currentHazardInstruction.evacuationRouteNote && (
                  <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-700">
                    <span className="font-bold text-brand-graphite-900 block font-mono uppercase text-[10px]">
                      Route Egress Note:
                    </span>
                    {currentHazardInstruction.evacuationRouteNote}
                  </div>
                )}

                {currentHazardInstruction.doNotDo?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 font-mono mb-1">
                      Strict Prohibitions
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-red-700">
                      {currentHazardInstruction.doNotDo.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-brand-border rounded text-xs text-brand-graphite-500">
                No protocol configured yet for {formatHazardName(activeHazard)}. Click "Edit Protocol" to add action steps.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: PASSPORT QR & PUBLIC LINK */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded p-6 shadow-xs max-w-xl mx-auto text-center">
            <h2 className="text-base font-bold text-brand-graphite-900 mb-1">
              Public Emergency Passport & QR Code
            </h2>
            <p className="text-xs text-brand-graphite-500 mb-6">
              Affix this code to building foyers and stairwells. Opens without administrator login.
            </p>

            <div className="p-6 bg-white border-2 border-brand-graphite-950 rounded shadow-md inline-block mb-4">
              <QRCodeSVG value={publicPassportUrl} size={220} level="M" />
            </div>

            <span className="font-mono text-xs font-bold text-brand-graphite-800 bg-brand-graphite-100 px-3 py-1 rounded block w-fit mx-auto mb-2">
              PASSPORT CODE: {building.code}
            </span>

            <p className="text-xs font-mono text-brand-graphite-700 break-all select-all px-4 py-2 bg-brand-graphite-50 rounded border border-brand-border mb-6">
              {publicPassportUrl}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                icon={copiedUrl ? Check : Copy}
                onClick={() => handleCopyUrl(publicPassportUrl)}
              >
                {copiedUrl ? 'Copied to Clipboard!' : 'Copy Passport URL'}
              </Button>

              <Link to={publicPassportUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="primary" icon={ExternalLink}>
                  Open Public Passport
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Edit Facility Profile"
        description="Update core identity, address, capacity, and construction year."
        maxWidth="md"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Facility Name"
            value={bldName}
            onChange={(e) => setBldName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Facility Code"
              value={bldCode}
              onChange={(e) => setBldCode(e.target.value)}
              required
            />

            <Select
              label="Classification"
              value={bldType}
              onChange={(e) => setBldType(e.target.value as any)}
            >
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="residential">Residential</option>
              <option value="laboratory">Laboratory</option>
              <option value="healthcare">Healthcare</option>
              <option value="assembly">Assembly</option>
            </Select>
          </div>

          <Input
            label="Address / Location"
            value={bldAddress}
            onChange={(e) => setBldAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Safety Occupancy"
              type="number"
              value={bldCapacity}
              onChange={(e) => setBldCapacity(Number(e.target.value))}
            />

            <Input
              label="Year Built"
              type="number"
              value={bldYear}
              onChange={(e) => setBldYear(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Description
            </label>
            <textarea
              rows={2}
              value={bldDesc}
              onChange={(e) => setBldDesc(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Floor Modal */}
      <Modal
        isOpen={addFloorModalOpen}
        onClose={() => setAddFloorModalOpen(false)}
        title="Add Floor Level"
        description="Register a new floor level or basement zone."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFloorSubmit} className="space-y-3.5">
          <Input
            label="Floor Number"
            type="number"
            value={floorNumber}
            onChange={(e) => setFloorNumber(Number(e.target.value))}
            required
          />

          <Input
            label="Floor Label / Name"
            placeholder="e.g. Ground Floor (Main Entrance)"
            value={floorLabel}
            onChange={(e) => setFloorLabel(e.target.value)}
            required
          />

          <Input
            label="Occupancy Capacity"
            type="number"
            value={floorCapacity}
            onChange={(e) => setFloorCapacity(Number(e.target.value))}
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
      {selectedFloorForEdit && (
        <Modal
          isOpen={editFloorModalOpen}
          onClose={() => {
            setEditFloorModalOpen(false);
            setSelectedFloorForEdit(null);
          }}
          title={`Edit Floor: ${selectedFloorForEdit.label}`}
          description="Update floor occupancy and assign designated warden."
          maxWidth="sm"
        >
          <form onSubmit={handleSaveFloorSubmit} className="space-y-3.5">
            <Input
              label="Floor Label"
              value={floorLabel}
              onChange={(e) => setFloorLabel(e.target.value)}
              required
            />

            <Input
              label="Occupancy Capacity"
              type="number"
              value={floorCapacity}
              onChange={(e) => setFloorCapacity(Number(e.target.value))}
              required
            />

            <Select
              label="Assign Primary Floor Warden"
              value={floorWardenId}
              onChange={(e) => setFloorWardenId(e.target.value)}
            >
              <option value="">-- Select from Staff Directory --</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.emergencyRole})
                </option>
              ))}
            </Select>

            <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditFloorModalOpen(false);
                  setSelectedFloorForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Floor Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Floor Plan Upload Modal */}
      <Modal
        isOpen={planUploadModalOpen}
        onClose={() => {
          setPlanUploadModalOpen(false);
          setSelectedFloorForPlan(null);
        }}
        title={`Upload Floor Plan • ${selectedFloorForPlan?.label}`}
        description="Upload an architectural schematic (PNG, JPG, SVG, WebP, PDF up to 5MB)."
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
              Select Image or PDF File
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
              onChange={handleFileChange}
              className="w-full text-xs text-brand-graphite-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border file:border-brand-border file:text-xs file:font-semibold file:bg-brand-graphite-100 hover:file:bg-brand-graphite-200 cursor-pointer"
            />
          </div>

          {planPreview && (
            <div className="border border-brand-border rounded p-2 bg-slate-900">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                Preview Before Saving:
              </span>
              <img
                src={planPreview}
                alt="Upload preview"
                className="w-full h-auto max-h-[220px] object-contain rounded"
              />
            </div>
          )}

          <div className="pt-2 border-t border-brand-border flex items-center justify-between">
            {selectedFloorForPlan?.floorPlanUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => selectedFloorForPlan && handleRemoveFloorPlan(selectedFloorForPlan)}
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
                onClick={() => {
                  setPlanUploadModalOpen(false);
                  setSelectedFloorForPlan(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={!planPreview}>
                Save Floor Plan
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Enlarged Floor Plan Modal */}
      {enlargedPlanUrl && (
        <Modal
          isOpen={!!enlargedPlanUrl}
          onClose={() => setEnlargedPlanUrl(null)}
          title={enlargedPlanTitle || 'Floor Plan Full View'}
          description={DISCLAIMER_TEXT}
          maxWidth="2xl"
        >
          <div className="p-3 bg-slate-900 rounded overflow-auto max-h-[75vh] flex items-center justify-center">
            <img
              src={enlargedPlanUrl}
              alt="Enlarged floor plan"
              className="w-full h-auto max-w-4xl object-contain rounded"
            />
          </div>
          <div className="pt-3 border-t border-brand-border flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setEnlargedPlanUrl(null)}>
              Close Full View
            </Button>
          </div>
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
        <form onSubmit={handleCreateExitSubmit} className="space-y-3.5">
          <Select
            label="Floor Level"
            value={targetFloorId}
            onChange={(e) => setTargetFloorId(e.target.value)}
          >
            {buildingFloors.map((flr) => (
              <option key={flr.id} value={flr.id}>
                {flr.label}
              </option>
            ))}
          </Select>

          <Input
            label="Exit Name / Label"
            placeholder="e.g. North Stairwell Fire Door"
            value={exitName}
            onChange={(e) => setExitName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
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
              label="Clearance Status"
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
            placeholder="e.g. North corridor landing outside Room 102"
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
      {selectedExitForEdit && (
        <Modal
          isOpen={editExitModalOpen}
          onClose={() => {
            setEditExitModalOpen(false);
            setSelectedExitForEdit(null);
          }}
          title={`Edit Exit: ${selectedExitForEdit.exit.name}`}
          description="Update exit attributes, obstruction status, and instructions."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditExit} className="space-y-3.5">
            <Input
              label="Exit Name / Label"
              value={exitName}
              onChange={(e) => setExitName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
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
                label="Obstruction Status"
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
              value={exitLocation}
              onChange={(e) => setExitLocation(e.target.value)}
            />

            <Input
              label="Evacuation Instructions"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditExitModalOpen(false);
                  setSelectedExitForEdit(null);
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

      {/* Add Assembly Point Modal */}
      <Modal
        isOpen={apModalOpen}
        onClose={() => setApModalOpen(false)}
        title="Add Designated Assembly Point"
        description="Designate a clear exterior muster zone with verified distance from facade."
        maxWidth="sm"
      >
        <form onSubmit={handleAddApSubmit} className="space-y-3.5">
          <Input
            label="Assembly Point Name"
            placeholder="e.g. Assembly Point A (North Turf Lawn)"
            value={apName}
            onChange={(e) => setApName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Muster Code"
              placeholder="e.g. AP-A"
              value={apCode}
              onChange={(e) => setApCode(e.target.value)}
            />

            <Input
              label="Estimated Capacity"
              type="number"
              value={apCapacity}
              onChange={(e) => setApCapacity(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Exact Physical Location & Perimeter Distance"
            placeholder="e.g. Open lawn 50m north of main building line."
            value={apLocation}
            onChange={(e) => setApLocation(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={apIsPrimary}
              onChange={(e) => setApIsPrimary(e.target.checked)}
              className="rounded text-brand-red focus:ring-brand-red"
            />
            <span>Set as Primary Facility Muster Area</span>
          </label>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setApModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Designate Point
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Add Emergency Contact"
        description="Register a building lead, security desk, or external first responder."
        maxWidth="sm"
      >
        <form onSubmit={handleAddContactSubmit} className="space-y-3.5">
          <Input
            label="Role / Title"
            placeholder="e.g. Chief Building Warden"
            value={cRole}
            onChange={(e) => setCRole(e.target.value)}
            required
          />

          <Input
            label="Contact Person Name"
            placeholder="e.g. Dr. Arthur Campbell"
            value={cName}
            onChange={(e) => setCName(e.target.value)}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +91 98450 11000"
            value={cPhone}
            onChange={(e) => setCPhone(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={cIsExternal}
              onChange={(e) => setCIsExternal(e.target.checked)}
              className="rounded text-brand-red focus:ring-brand-red"
            />
            <span>External Municipal / Emergency Agency</span>
          </label>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Register Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Hazard Instruction Modal */}
      <Modal
        isOpen={instructionModalOpen}
        onClose={() => setInstructionModalOpen(false)}
        title={`Edit ${formatHazardName(activeHazard)} Protocol`}
        description="Update actionable steps, route notes, and prohibitions displayed to building occupants."
        maxWidth="md"
      >
        <form onSubmit={handleSaveInstructionSubmit} className="space-y-4">
          <Input
            label="Protocol Title"
            value={instTitle}
            onChange={(e) => setInstTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-graphite-700 font-mono mb-1">
              Immediate Action Steps (One per line)
            </label>
            <textarea
              rows={4}
              value={instActionsText}
              onChange={(e) => setInstActionsText(e.target.value)}
              placeholder="Sound the nearest alarm pull station...&#10;Evacuate via marked emergency stairwells...&#10;Report to assembly point..."
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red font-sans leading-relaxed"
            />
          </div>

          <Input
            label="Evacuation Route Egress Note"
            placeholder="e.g. Follow lit green signage to primary external stairs."
            value={instRouteNote}
            onChange={(e) => setInstRouteNote(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-red-700 font-mono mb-1">
              Strict Prohibitions (One per line)
            </label>
            <textarea
              rows={2}
              value={instDoNotDoText}
              onChange={(e) => setInstDoNotDoText(e.target.value)}
              placeholder="Do not use elevators...&#10;Do not stop to collect heavy personal items..."
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setInstructionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Hazard Protocol
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
