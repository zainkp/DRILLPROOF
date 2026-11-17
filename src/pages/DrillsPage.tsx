import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import {
  Flame,
  Clock,
  CheckCircle2,
  Users2,
  Plus,
  Play,
  ArrowRight,
  ShieldAlert,
  Activity,
  Waves,
  HeartPulse,
  AlertTriangle,
  Building2,
  Calendar,
  Search,
  Edit3,
  Trash2,
  CheckSquare,
  Square as SquareIcon,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  formatDateString,
  formatSecondsToTime,
  formatHazardName,
  formatDrillStatus,
} from '../utils/formatters';
import { HazardType, DrillStatus, Drill } from '../types';

export const DrillsPage: React.FC = () => {
  const { drills, buildings, floors, staff, createDrill, updateDrill, deleteDrill, user } = useData();

  const isAdmin = user?.role === 'admin';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazard, setSelectedHazard] = useState<'all' | HazardType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | DrillStatus>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalDrill, setEditModalDrill] = useState<Drill | null>(null);

  // Create Drill Form State
  const [createBuildingId, setCreateBuildingId] = useState(buildings[0]?.id || '');
  const [hazardType, setHazardType] = useState<HazardType>('fire');
  const [drillTitle, setDrillTitle] = useState('Scheduled Fire Evacuation Drill');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [targetSeconds, setTargetSeconds] = useState(300);
  const [scenarioNotes, setScenarioNotes] = useState(
    'Standard synchronized building evacuation drill to designated assembly post. Floor wardens sweep corridors and report muster count.'
  );
  const [leadStaffId, setLeadStaffId] = useState(staff[0]?.id || 'stf-01');
  const [selectedFloorIds, setSelectedFloorIds] = useState<string[]>([]);

  // Edit Drill Form State
  const [editTitle, setEditTitle] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editTargetSeconds, setEditTargetSeconds] = useState(300);
  const [editScenarioNotes, setEditScenarioNotes] = useState('');
  const [editStatus, setEditStatus] = useState<DrillStatus>('planned');

  // Floors for selected creation building
  const availableFloors = useMemo(() => {
    return floors.filter((f) => f.buildingId === createBuildingId);
  }, [floors, createBuildingId]);

  // Keep selected floors in sync when facility changes
  const handleFacilityChange = (bldId: string) => {
    setCreateBuildingId(bldId);
    const newFloors = floors.filter((f) => f.buildingId === bldId);
    setSelectedFloorIds(newFloors.map((f) => f.id));
  };

  // Helper for hazard icon and badge style
  const getHazardMeta = (type: HazardType) => {
    switch (type) {
      case 'fire':
        return {
          icon: Flame,
          color: 'text-red-700 bg-red-50 border-red-200',
          dot: 'bg-red-500',
        };
      case 'earthquake':
        return {
          icon: Activity,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'flood':
      case 'severe_weather':
        return {
          icon: Waves,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'chemical':
        return {
          icon: AlertTriangle,
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'medical':
        return {
          icon: HeartPulse,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'security':
      default:
        return {
          icon: ShieldAlert,
          color: 'text-slate-700 bg-slate-100 border-slate-300',
          dot: 'bg-slate-500',
        };
    }
  };

  // Filtered Drills
  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      if (selectedHazard !== 'all' && drill.hazardType !== selectedHazard) return false;
      if (selectedStatus !== 'all' && drill.status !== selectedStatus) return false;
      if (selectedFacility !== 'all' && drill.buildingId !== selectedFacility) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = drill.title.toLowerCase().includes(q);
        const matchesCode = drill.code.toLowerCase().includes(q);
        const matchesBuilding = drill.buildingName.toLowerCase().includes(q);
        const matchesNotes = (drill.scenarioNotes || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesBuilding && !matchesNotes) return false;
      }

      return true;
    });
  }, [drills, selectedHazard, selectedStatus, selectedFacility, searchQuery]);

  // Overall Metrics
  const totalDrillsCount = drills.length;
  const scheduledCount = drills.filter((d) => d.status === 'planned').length;
  const inProgressCount = drills.filter((d) => d.status === 'in_progress').length;
  const completedCount = drills.filter((d) => d.status === 'completed').length;

  const completedWithTime = drills.filter((d) => d.status === 'completed' && d.durationSeconds);
  const avgEvacSeconds =
    completedWithTime.length > 0
      ? Math.round(
          completedWithTime.reduce((sum, d) => sum + (d.durationSeconds || 0), 0) /
            completedWithTime.length
        )
      : 277;

  // Handle Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === createBuildingId) || buildings[0];
    const lead = staff.find((s) => s.id === leadStaffId) || staff[0];

    // Participating floors
    const targetFloors =
      selectedFloorIds.length > 0
        ? availableFloors.filter((f) => selectedFloorIds.includes(f.id))
        : availableFloors;

    const floorCheckins = targetFloors.map((flr, idx) => {
      const assignedWarden =
        staff.find((s) => s.assignedBuildingId === bld.id && s.assignedFloorId === flr.id) ||
        staff[idx % staff.length];

      return {
        id: `c-${Date.now()}-${idx}`,
        floorId: flr.id,
        floorLabel: flr.label,
        wardenName: assignedWarden ? `${assignedWarden.name} (${assignedWarden.emergencyRole})` : 'Floor Warden Lead',
        accountedCount: 0,
        expectedCount: flr.occupancyCapacity || Math.round(bld.occupancyCapacity / (targetFloors.length || 1)),
        status: 'pending' as const,
      };
    });

    const totalExpected = floorCheckins.reduce((sum, c) => sum + c.expectedCount, 0);

    createDrill({
      institutionId: bld.institutionId,
      buildingId: bld.id,
      buildingName: bld.name,
      hazardType,
      title: drillTitle.trim(),
      scenarioNotes: scenarioNotes.trim(),
      scheduledAt: new Date(scheduledDate).toISOString(),
      targetDurationSeconds: Number(targetSeconds),
      status: 'planned',
      participantsExpected: totalExpected || bld.occupancyCapacity,
      participantsAccountedFor: 0,
      leadCoordinatorId: lead.id,
      leadCoordinatorName: lead.name,
      isDemo: false,
      floorCheckins,
      observations: [],
    });

    setCreateModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (drill: Drill) => {
    setEditModalDrill(drill);
    setEditTitle(drill.title);
    setEditScheduledAt(drill.scheduledAt ? drill.scheduledAt.slice(0, 16) : '');
    setEditTargetSeconds(drill.targetDurationSeconds);
    setEditScenarioNotes(drill.scenarioNotes || '');
    setEditStatus(drill.status);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalDrill) return;

    updateDrill(editModalDrill.id, {
      title: editTitle.trim(),
      scheduledAt: new Date(editScheduledAt).toISOString(),
      targetDurationSeconds: Number(editTargetSeconds),
      scenarioNotes: editScenarioNotes.trim(),
      status: editStatus,
    });

    setEditModalDrill(null);
  };

  // Handle Delete
  const handleDelete = (drill: Drill) => {
    if (window.confirm(`Are you sure you want to cancel and remove drill "${drill.code}: ${drill.title}"?`)) {
      deleteDrill(drill.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mock Emergency Drills & Evacuation Exercises"
        description="Plan multi-hazard simulation drills, time live evacuation routes, coordinate floor wardens, and generate after-action remediation reports."
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Mock Drills' },
        ]}
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => {
              const defaultBld = buildings[0];
              setCreateBuildingId(defaultBld?.id || '');
              const bldFloors = floors.filter((f) => f.buildingId === defaultBld?.id);
              setSelectedFloorIds(bldFloors.map((f) => f.id));
              setHazardType('fire');
              setDrillTitle('Scheduled Fire & Smoke Evacuation Drill');
              setTargetSeconds(300);
              setCreateModalOpen(true);
            }}
          >
            Schedule Drill Exercise
          </Button>
        }
      />

      {/* 1. Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-white border-brand-red shadow-xs ring-1 ring-brand-red'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
            Total Exercises
          </span>
          <span className="text-2xl font-bold font-mono text-brand-graphite-900">
            {totalDrillsCount}
          </span>
          <span className="text-[11px] text-brand-graphite-500 block mt-0.5">All scenarios</span>
        </div>

        <div
          onClick={() => setSelectedStatus('planned')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            selectedStatus === 'planned'
              ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono block mb-1">
            Scheduled / Upcoming
          </span>
          <span className="text-2xl font-bold font-mono text-blue-700">
            {scheduledCount}
          </span>
          <span className="text-[11px] text-blue-600 block mt-0.5">Pending execution</span>
        </div>

        <div
          onClick={() => setSelectedStatus('in_progress')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            selectedStatus === 'in_progress'
              ? 'bg-amber-50/70 border-amber-600 shadow-xs ring-1 ring-amber-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              Active Sessions
            </span>
            {inProgressCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <span className="text-2xl font-bold font-mono text-amber-700">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-amber-600 block mt-0.5">Clock ticking</span>
        </div>

        <div
          onClick={() => setSelectedStatus('completed')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            selectedStatus === 'completed'
              ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono block mb-1">
            Completed Drills
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {completedCount}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">After-action verified</span>
        </div>

        <div className="p-4 rounded border bg-white border-brand-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
            Avg Evac Benchmark
          </span>
          <span className="text-2xl font-bold font-mono text-brand-graphite-900">
            {formatSecondsToTime(avgEvacSeconds)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
            Institutional target: 5m 00s
          </span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white border border-brand-border rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drills by code (e.g. DRL-001), exercise title, facility, or scenario notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red"
            />
          </div>

          <span className="text-xs font-mono text-brand-graphite-500 whitespace-nowrap">
            Showing {filteredDrills.length} of {drills.length} mock drills
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded border border-brand-border bg-brand-graphite-50 p-0.5 text-xs">
            {(['all', 'planned', 'in_progress', 'completed', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 font-semibold rounded capitalize transition-colors ${
                  selectedStatus === st
                    ? 'bg-white text-brand-graphite-900 shadow-xs'
                    : 'text-brand-graphite-600 hover:text-brand-graphite-900'
                }`}
              >
                {st === 'planned' ? 'Scheduled' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Hazard Dropdown */}
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value as any)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-graphite-800 bg-white focus:outline-none"
          >
            <option value="all">All Hazard Scenarios</option>
            <option value="fire">Fire & Smoke Evacuation</option>
            <option value="earthquake">Earthquake — Drop, Cover & Hold</option>
            <option value="flood">Flood & Severe Weather</option>
            <option value="chemical">Hazardous Chemical / Gas Leak</option>
            <option value="medical">Mass Casualty Medical Triage</option>
            <option value="security">Security Evacuation</option>
          </select>

          {/* Facility Dropdown */}
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-graphite-800 bg-white focus:outline-none"
          >
            <option value="all">All Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {(selectedHazard !== 'all' || selectedStatus !== 'all' || selectedFacility !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedHazard('all');
                setSelectedStatus('all');
                setSelectedFacility('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-brand-red hover:underline font-mono ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Drills List */}
      <div className="space-y-4">
        {filteredDrills.length === 0 ? (
          <div className="bg-white border border-dashed border-brand-border rounded p-12 text-center text-xs text-brand-graphite-500">
            <Flame className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-graphite-800">No mock drill exercises match your filters.</p>
            <p className="text-[11px] text-brand-graphite-500 mt-1">
              Adjust filters or click "Schedule Drill Exercise" to set up a new scenario.
            </p>
          </div>
        ) : (
          filteredDrills.map((drill) => {
            const st = formatDrillStatus(drill.status);
            const hazardMeta = getHazardMeta(drill.hazardType);
            const HazardIcon = hazardMeta.icon;

            const totalAccounted = drill.participantsAccountedFor;
            const totalExpected = drill.participantsExpected;
            const percentAccounted =
              totalExpected > 0 ? Math.round((totalAccounted / totalExpected) * 100) : 0;

            const clearedFloorsCount = drill.floorCheckins.filter((c) => c.status === 'cleared').length;
            const totalFloorsCount = drill.floorCheckins.length;

            return (
              <div
                key={drill.id}
                className={`bg-white border rounded p-5 shadow-xs transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  drill.status === 'in_progress'
                    ? 'border-amber-400 ring-1 ring-amber-400/50'
                    : 'border-brand-border hover:border-brand-graphite-400'
                }`}
              >
                <div className="flex-1">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-brand-graphite-700 bg-brand-graphite-100 px-2 py-0.5 rounded border border-brand-border/60">
                      {drill.code}
                    </span>

                    {/* Hazard Pill */}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1 font-mono ${hazardMeta.color}`}
                    >
                      <HazardIcon className="w-3 h-3" />
                      <span>{formatHazardName(drill.hazardType)}</span>
                    </span>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        drill.status === 'completed'
                          ? 'success'
                          : drill.status === 'in_progress'
                          ? 'warning'
                          : drill.status === 'cancelled'
                          ? 'default'
                          : 'info'
                      }
                      size="sm"
                    >
                      {st.label.toUpperCase()}
                    </Badge>

                    {drill.isDemo && (
                      <span className="text-[10px] text-brand-graphite-400 font-mono uppercase bg-brand-graphite-50 px-1.5 py-0.5 rounded border border-brand-border">
                        Preloaded
                      </span>
                    )}

                    {drill.status === 'in_progress' && (
                      <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>LIVE TIMER ACTIVE</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Scenario */}
                  <h3 className="text-base font-bold text-brand-graphite-900 tracking-tight mb-1">
                    {drill.title}
                  </h3>
                  <p className="text-xs text-brand-graphite-600 mb-3 max-w-2xl leading-relaxed">
                    {drill.scenarioNotes}
                  </p>

                  {/* Details metadata */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-brand-graphite-500 font-mono">
                    <span className="flex items-center gap-1 text-brand-graphite-800">
                      <Building2 className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>{drill.buildingName}</span>
                    </span>

                    <span className="flex items-center gap-1 text-brand-graphite-800">
                      <Users2 className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>Lead: <strong>{drill.leadCoordinatorName}</strong></span>
                    </span>

                    <span className="flex items-center gap-1 text-brand-graphite-700">
                      <Calendar className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>{formatDateString(drill.scheduledAt)}</span>
                    </span>

                    <span className="text-brand-graphite-600">
                      {clearedFloorsCount > 0 ? (
                        <strong className="text-emerald-700">{clearedFloorsCount} of {totalFloorsCount} floors cleared</strong>
                      ) : (
                        <span>{totalFloorsCount} muster sectors</span>
                      )}
                    </span>

                    {drill.observations && drill.observations.length > 0 && (
                      <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {drill.observations.length} observation{drill.observations.length > 1 ? 's' : ''} logged
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side stats & actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-brand-border/60 flex-shrink-0">
                  <div className="text-left md:text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                          Target Benchmark
                        </span>
                        <span className="font-mono font-bold text-xs text-brand-graphite-800">
                          {formatSecondsToTime(drill.targetDurationSeconds)}
                        </span>
                      </div>
                      {drill.durationSeconds ? (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                            Recorded Evac Time
                          </span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              drill.durationSeconds <= drill.targetDurationSeconds
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {formatSecondsToTime(drill.durationSeconds)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-1 text-[11px] text-brand-graphite-500 font-mono">
                      Accountability: {drill.participantsAccountedFor}/{drill.participantsExpected} ({percentAccounted}%)
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link to={`/drills/${drill.id}`}>
                      <Button
                        size="sm"
                        variant={drill.status === 'in_progress' ? 'primary' : drill.status === 'completed' ? 'outline' : 'primary'}
                        icon={drill.status === 'in_progress' ? Play : drill.status === 'completed' ? FileText : ArrowRight}
                        iconPosition="right"
                        className={drill.status === 'in_progress' ? 'animate-pulse' : ''}
                      >
                        {drill.status === 'completed'
                          ? 'After-Action Report'
                          : drill.status === 'in_progress'
                          ? 'Active Session'
                          : 'Launch Session'}
                      </Button>
                    </Link>

                    <button
                      onClick={() => handleOpenEdit(drill)}
                      className="p-1.5 text-brand-graphite-500 hover:text-brand-graphite-900 rounded hover:bg-brand-graphite-100 transition-colors"
                      title="Edit drill configuration"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(drill)}
                        className="p-1.5 text-brand-graphite-400 hover:text-red-600 rounded hover:bg-brand-graphite-100 transition-colors"
                        title="Cancel & Delete Drill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Schedule Drill Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Institutional Mock Drill"
        description="Configure hazard scenario parameters, target evacuation benchmark, participating floors, and warden assignments."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Target Facility"
              value={createBuildingId}
              onChange={(e) => handleFacilityChange(e.target.value)}
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </Select>

            <Select
              label="Hazard Simulation Type"
              value={hazardType}
              onChange={(e) => {
                const h = e.target.value as HazardType;
                setHazardType(h);
                if (h === 'fire') {
                  setDrillTitle('Scheduled Fire & Smoke Evacuation Drill');
                  setTargetSeconds(300);
                  setScenarioNotes('Standard synchronized fire drill. Audible sirens simulated, stairwells cleared, muster at Assembly Point A.');
                } else if (h === 'earthquake') {
                  setDrillTitle('Campus Earthquake Drill — Drop, Cover & Hold On');
                  setTargetSeconds(360);
                  setScenarioNotes('Simulated ground tremors. Occupants shelter beneath sturdy furniture for 60s, then conduct structured evacuation avoiding glass facades.');
                } else if (h === 'chemical') {
                  setDrillTitle('Laboratory Chemical Spill & Containment Drill');
                  setTargetSeconds(240);
                  setScenarioNotes('Simulated solvent container rupture on upper lab levels. Immediate HVAC shutdown, isolation damper verification, cross-breeze evacuation.');
                } else if (h === 'flood') {
                  setDrillTitle('Severe Weather & Ground-Level Ingress Drill');
                  setTargetSeconds(420);
                  setScenarioNotes('Simulated flash flooding / utility basement ingress. Vertical evacuation to upper levels and dry muster points.');
                } else if (h === 'medical') {
                  setDrillTitle('Mass Casualty Medical Response & Triage Exercise');
                  setTargetSeconds(300);
                  setScenarioNotes('Simulated multi-victim incident. Deployment of automated external defibrillator (AED) and primary triage staging.');
                } else {
                  setDrillTitle('Institutional Security Lockdown & Perimeter Drill');
                  setTargetSeconds(240);
                  setScenarioNotes('Perimeter shelter-in-place, active ingress locking, silence protocols, and secondary evacuation corridors.');
                }
              }}
            >
              <option value="fire">Fire & Smoke Evacuation</option>
              <option value="earthquake">Earthquake — Drop, Cover & Hold On</option>
              <option value="flood">Flood & Severe Weather Ingress</option>
              <option value="chemical">Hazardous Chemical / Gas Leak</option>
              <option value="medical">Mass Casualty Medical Triage</option>
              <option value="security">Security Lockdown & Evacuation</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Exercise Title"
              value={drillTitle}
              onChange={(e) => setDrillTitle(e.target.value)}
              required
            />

            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Target Evacuation Benchmark (Seconds)"
              type="number"
              value={targetSeconds}
              onChange={(e) => setTargetSeconds(Number(e.target.value))}
              min={60}
              max={1800}
              helperText={`Benchmark: ${formatSecondsToTime(targetSeconds)} to achieve all-clear`}
              required
            />

            <Select
              label="Chief Drill Coordinator"
              value={leadStaffId}
              onChange={(e) => setLeadStaffId(e.target.value)}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.emergencyRole})
                </option>
              ))}
            </Select>
          </div>

          {/* Participating Floors Multi-check */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider font-mono">
                Participating Floors & Muster Sectors ({selectedFloorIds.length} of {availableFloors.length} selected)
              </label>
              <div className="space-x-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedFloorIds(availableFloors.map((f) => f.id))}
                  className="text-brand-red hover:underline"
                >
                  Select All
                </button>
                <span className="text-brand-graphite-300">&bull;</span>
                <button
                  type="button"
                  onClick={() => setSelectedFloorIds([])}
                  className="text-brand-graphite-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-brand-graphite-50 rounded border border-brand-border max-h-36 overflow-y-auto">
              {availableFloors.map((flr) => {
                const isChecked = selectedFloorIds.includes(flr.id);
                return (
                  <label
                    key={flr.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFloorIds([...selectedFloorIds, flr.id]);
                        } else {
                          setSelectedFloorIds(selectedFloorIds.filter((id) => id !== flr.id));
                        }
                      }}
                      className="rounded border-brand-border text-brand-red focus:ring-brand-red"
                    />
                    <span className="font-semibold text-brand-graphite-800">{flr.label}</span>
                    <span className="text-[10px] text-brand-graphite-500 font-mono">
                      (Cap: {flr.occupancyCapacity || 100})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Scenario Briefing & Instructions for Wardens
            </label>
            <textarea
              rows={3}
              value={scenarioNotes}
              onChange={(e) => setScenarioNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              required
            />
          </div>

          <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Flame}>
              Schedule Exercise
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Edit Drill Modal */}
      {editModalDrill && (
        <Modal
          isOpen={!!editModalDrill}
          onClose={() => setEditModalDrill(null)}
          title={`Edit Exercise: ${editModalDrill.code}`}
          description="Update exercise title, scheduled timing, target benchmark, or status."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5">
            <Input
              label="Exercise Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Scheduled Timing"
                type="datetime-local"
                value={editScheduledAt}
                onChange={(e) => setEditScheduledAt(e.target.value)}
                required
              />

              <Input
                label="Target Evacuation (Seconds)"
                type="number"
                value={editTargetSeconds}
                onChange={(e) => setEditTargetSeconds(Number(e.target.value))}
                min={60}
                max={1800}
                required
              />
            </div>

            <Select
              label="Exercise Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as DrillStatus)}
            >
              <option value="planned">Scheduled (Planned)</option>
              <option value="in_progress">In Progress (Active)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Scenario Description
              </label>
              <textarea
                rows={3}
                value={editScenarioNotes}
                onChange={(e) => setEditScenarioNotes(e.target.value)}
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalDrill(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Drill Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
