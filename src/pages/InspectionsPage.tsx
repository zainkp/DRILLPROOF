import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  Layers,
  ChevronDown,
  Building2,
  Calendar,
  UserCheck,
  Search,
  ExternalLink,
  Trash2,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { formatDateString, formatPriority, formatActionStatus } from '../utils/formatters';
import { ChecklistItem, InspectionStatus, Inspection, PriorityLevel, SafetyIssue } from '../types';
import { INSPECTION_CATEGORIES, getChecklistForCategory } from '../data/inspectionChecklists';

export const InspectionsPage: React.FC = () => {
  const {
    inspections,
    buildings,
    floors,
    staff,
    issues,
    createInspection,
    updateInspection,
    deleteInspection,
    createSafetyIssue,
    user,
  } = useData();

  const isAdmin = user?.role === 'admin';

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [createActionModalItem, setCreateActionModalItem] = useState<{
    inspection: Inspection;
    item: ChecklistItem;
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuildingId, setFilterBuildingId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Inspection Form state
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('comprehensive');
  const [inspectorName, setInspectorName] = useState<string>(user?.name || 'Marcus Vance');
  const [inspectorId, setInspectorId] = useState<string>(user?.id || 'usr-admin-01');
  const [inspectionDate, setInspectionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [inspectorNotes, setInspectorNotes] = useState('');

  // Checklist state for new inspection — initialized to 'not_checked'
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    getChecklistForCategory('comprehensive')
  );

  // Quick Action form state inside New Inspection form
  const [itemActionConfigs, setItemActionConfigs] = useState<
    Record<
      string,
      {
        enabled: boolean;
        priority: PriorityLevel;
        assignedStaffId: string;
        dueDate: string;
      }
    >
  >({});

  // Inline "Create Action for Reviewed Item" form state
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionPriority, setActionPriority] = useState<PriorityLevel>('high');
  const [actionStaffId, setActionStaffId] = useState(staff[0]?.id || 'stf-08');
  const [actionDueDate, setActionDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  // Available floors for selected building
  const availableFloors = useMemo(() => {
    return floors.filter((f) => f.buildingId === selectedBuildingId);
  }, [floors, selectedBuildingId]);

  // Handle building change in form
  const handleBuildingChange = (bldId: string) => {
    setSelectedBuildingId(bldId);
    setSelectedFloorId('all');
  };

  // Handle category change in form
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setChecklist(getChecklistForCategory(catId));
    setItemActionConfigs({});
  };

  // Handle checklist status toggle
  const handleStatusChange = (id: string, newStatus: InspectionStatus) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    // If changing away from needs_attention, turn off auto-action toggle
    if (newStatus !== 'needs_attention') {
      setItemActionConfigs((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || { priority: 'high', assignedStaffId: staff[0]?.id || '', dueDate: '' }), enabled: false },
      }));
    }
  };

  const handleItemNoteChange = (id: string, note: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: note } : item))
    );
  };

  const handleActionToggle = (id: string, enabled: boolean) => {
    setItemActionConfigs((prev) => ({
      ...prev,
      [id]: {
        enabled,
        priority: prev[id]?.priority || 'high',
        assignedStaffId: prev[id]?.assignedStaffId || (staff.find(s => s.emergencyRole === 'Facility Manager')?.id || staff[0]?.id || ''),
        dueDate: prev[id]?.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      },
    }));
  };

  const handleActionConfigChange = (
    id: string,
    field: 'priority' | 'assignedStaffId' | 'dueDate',
    val: any
  ) => {
    setItemActionConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  // Live Checklist Counts
  const passCount = checklist.filter((item) => item.status === 'pass').length;
  const attentionCount = checklist.filter((item) => item.status === 'needs_attention').length;
  const notCheckedCount = checklist.filter((item) => item.status === 'not_checked').length;
  const evaluatedCount = passCount + attentionCount;
  const liveScore = evaluatedCount > 0 ? Math.round((passCount / evaluatedCount) * 100) : 0;
  const liveStatus =
    attentionCount > 0
      ? 'needs_attention'
      : notCheckedCount === 0 && passCount > 0
      ? 'passed'
      : 'pending';

  // Submit New Inspection
  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBld = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
    const targetFloor =
      selectedFloorId !== 'all' ? availableFloors.find((f) => f.id === selectedFloorId) : undefined;

    const floorLabel = targetFloor ? targetFloor.label : 'All Floors / Full Facility';

    // 1. Create the Inspection record
    const newInsp = createInspection({
      institutionId: targetBld.institutionId,
      buildingId: targetBld.id,
      buildingName: targetBld.name,
      floorId: targetFloor?.id,
      floorLabel,
      category: selectedCategory,
      inspectorId: inspectorId || user?.id || 'usr-admin-01',
      inspectorName: inspectorName || user?.name || 'Marcus Vance',
      date: inspectionDate,
      status: liveStatus,
      score: liveScore,
      items: checklist,
      notes:
        inspectorNotes.trim() ||
        `${INSPECTION_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Routine Safety'} inspection completed (${passCount} passed, ${attentionCount} attention, ${notCheckedCount} unchecked).`,
    });

    // 2. Process immediate corrective actions for flagged items
    const updatedChecklist = [...newInsp.items];
    let checklistUpdated = false;

    checklist.forEach((item, idx) => {
      const cfg = itemActionConfigs[item.id];
      if (item.status === 'needs_attention' && cfg?.enabled) {
        const assignedStaff = staff.find((s) => s.id === cfg.assignedStaffId) || staff[0];
        const newIssue = createSafetyIssue({
          institutionId: targetBld.institutionId,
          buildingId: targetBld.id,
          buildingName: targetBld.name,
          floorId: targetFloor?.id,
          floorLabel: targetFloor?.label || 'General Facility',
          sourceType: 'inspection',
          sourceId: newInsp.id,
          checklistItemId: item.id,
          checklistItemLabel: item.label,
          title: `Inspection Defect: ${item.label}`,
          description:
            item.notes?.trim() ||
            `Identified during safety inspection on ${inspectionDate} by ${inspectorName}. Remediate immediately.`,
          priority: cfg.priority || 'high',
          assignedToName: assignedStaff?.name || 'Facilities Maintenance Supervisor',
          assignedToRole: assignedStaff?.emergencyRole || 'Facility Manager',
          assignedToId: assignedStaff?.id,
          dueDate: cfg.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          status: 'open',
        });

        updatedChecklist[idx] = {
          ...item,
          flaggedAsIssue: true,
          linkedIssueId: newIssue.id,
        };
        checklistUpdated = true;
      }
    });

    if (checklistUpdated) {
      updateInspection(newInsp.id, { items: updatedChecklist });
    }

    // Reset and close
    setCreateModalOpen(false);
    setChecklist(getChecklistForCategory('comprehensive'));
    setSelectedCategory('comprehensive');
    setInspectorNotes('');
    setItemActionConfigs({});
  };

  // Open "Create Action from Reviewed Item" modal
  const handleOpenCreateActionForItem = (inspection: Inspection, item: ChecklistItem) => {
    setCreateActionModalItem({ inspection, item });
    setActionTitle(`Deficiency: ${item.label}`);
    setActionDescription(
      item.notes?.trim() ||
        `Identified during safety inspection of ${inspection.buildingName} on ${formatDateString(
          inspection.date
        )}. Corrective repair or servicing required.`
    );
    setActionPriority('high');
    const defaultStaff = staff.find((s) => s.emergencyRole === 'Facility Manager') || staff[0];
    setActionStaffId(defaultStaff?.id || '');
    setActionDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  };

  // Submit "Create Action from Reviewed Item"
  const handleSaveActionForItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createActionModalItem) return;

    const { inspection, item } = createActionModalItem;
    const assignedStaff = staff.find((s) => s.id === actionStaffId) || staff[0];

    const newIssue = createSafetyIssue({
      institutionId: inspection.institutionId,
      buildingId: inspection.buildingId,
      buildingName: inspection.buildingName,
      floorId: inspection.floorId,
      floorLabel: inspection.floorLabel || 'General Facility',
      sourceType: 'inspection',
      sourceId: inspection.id,
      checklistItemId: item.id,
      checklistItemLabel: item.label,
      title: actionTitle.trim(),
      description: actionDescription.trim(),
      priority: actionPriority,
      assignedToName: assignedStaff?.name || 'Facilities Maintenance Supervisor',
      assignedToRole: assignedStaff?.emergencyRole || 'Facility Manager',
      assignedToId: assignedStaff?.id,
      dueDate: actionDueDate,
      status: 'open',
    });

    // Link this issue to the inspection item without modifying historical inspection score/status
    const updatedItems = inspection.items.map((it) =>
      it.id === item.id ? { ...it, linkedIssueId: newIssue.id, flaggedAsIssue: true } : it
    );
    updateInspection(inspection.id, { items: updatedItems });

    setCreateActionModalItem(null);
  };

  // Delete Inspection handler
  const handleDeleteInspection = (insp: Inspection) => {
    if (!isAdmin) return;
    if (window.confirm(`Permanently remove inspection audit record for "${insp.buildingName}" (${formatDateString(insp.date)})?`)) {
      deleteInspection(insp.id);
      if (selectedInspectionId === insp.id) {
        setSelectedInspectionId(null);
      }
    }
  };

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      // Building filter
      if (filterBuildingId !== 'all' && insp.buildingId !== filterBuildingId) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'passed' && insp.status !== 'passed') return false;
        if (filterStatus === 'needs_attention' && insp.status !== 'needs_attention') return false;
        if (filterStatus === 'pending' && insp.status !== 'pending') return false;
      }
      // Category filter
      if (filterCategory !== 'all' && insp.category !== filterCategory) {
        return false;
      }
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesBuilding = insp.buildingName.toLowerCase().includes(query);
        const matchesInspector = insp.inspectorName.toLowerCase().includes(query);
        const matchesNotes = (insp.notes || '').toLowerCase().includes(query);
        const matchesFloor = (insp.floorLabel || '').toLowerCase().includes(query);
        if (!matchesBuilding && !matchesInspector && !matchesNotes && !matchesFloor) {
          return false;
        }
      }
      return true;
    });
  }, [inspections, filterBuildingId, filterStatus, filterCategory, searchQuery]);

  // Overall Statistics Derived From Actual Data
  const totalInspectionsCount = inspections.length;
  const passedInspectionsCount = inspections.filter((i) => i.status === 'passed').length;
  const attentionInspectionsCount = inspections.filter((i) => i.status === 'needs_attention').length;
  const pendingInspectionsCount = inspections.filter((i) => i.status === 'pending').length;

  const selectedInspection = inspections.find((i) => i.id === selectedInspectionId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety & Compliance Inspections"
        description="Execute structured checklists for egress routes, fire barriers, suppression assets, and electrical safety."
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Safety Inspections' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => {
                setSelectedBuildingId(buildings[0]?.id || '');
                setSelectedFloorId('all');
                setSelectedCategory('comprehensive');
                setChecklist(getChecklistForCategory('comprehensive'));
                setItemActionConfigs({});
                setInspectorNotes('');
                setCreateModalOpen(true);
              }}
            >
              Record New Inspection
            </Button>
          </div>
        }
      />

      {/* 1. Transparent Summary Metrics Derived From Actual Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border rounded p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
            Total Inspections
          </span>
          <span className="text-2xl font-bold font-mono text-brand-graphite-900">
            {totalInspectionsCount}
          </span>
          <span className="text-[11px] text-brand-graphite-500 block mt-1">Across all facilities</span>
        </div>

        <div className="bg-white border border-brand-border rounded p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono block mb-1">
            Passed / Compliant
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {passedInspectionsCount}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1">Zero unresolved defects</span>
        </div>

        <div className="bg-white border border-brand-border rounded p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red font-mono block mb-1">
            Needs Attention
          </span>
          <span className="text-2xl font-bold font-mono text-brand-red">
            {attentionInspectionsCount}
          </span>
          <span className="text-[11px] text-red-600 block mt-1">Deficiencies flagged</span>
        </div>

        <div className="bg-white border border-brand-border rounded p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono block mb-1">
            Incomplete / Pending
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700">
            {pendingInspectionsCount}
          </span>
          <span className="text-[11px] text-amber-600 block mt-1">Unchecked audit items</span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white border border-brand-border rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by facility, inspector, or observations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red"
            />
          </div>

          <span className="text-xs font-mono text-brand-graphite-500 whitespace-nowrap">
            Showing {filteredInspections.length} of {inspections.length} audit logs
          </span>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-brand-graphite-600 font-mono font-semibold text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Building Filter */}
          <select
            value={filterBuildingId}
            onChange={(e) => setFilterBuildingId(e.target.value)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs text-brand-graphite-800 bg-white font-medium focus:outline-none"
          >
            <option value="all">All Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs text-brand-graphite-800 bg-white font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed (100% Clear)</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="pending">Incomplete / Pending</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs text-brand-graphite-800 bg-white font-medium focus:outline-none"
          >
            <option value="all">All Inspection Domains</option>
            {INSPECTION_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {(filterBuildingId !== 'all' || filterStatus !== 'all' || filterCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterBuildingId('all');
                setFilterStatus('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-brand-red hover:underline font-mono ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Inspections List / Register */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
            Recorded Inspection Registers ({filteredInspections.length})
          </span>
          <span className="text-xs text-brand-graphite-500 hidden sm:inline">
            Click any entry to inspect itemized checklist findings and linked corrective actions
          </span>
        </div>

        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-graphite-500">
            <ClipboardCheck className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-graphite-800">No inspections match current criteria.</p>
            <p className="text-[11px] text-brand-graphite-500 mt-1">
              Adjust your filters or record a new facility inspection.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {filteredInspections.map((insp) => {
              const pass = insp.items.filter((i) => i.status === 'pass').length;
              const attn = insp.items.filter((i) => i.status === 'needs_attention').length;
              const unchk = insp.items.filter((i) => i.status === 'not_checked').length;

              return (
                <div
                  key={insp.id}
                  onClick={() => setSelectedInspectionId(insp.id)}
                  className="p-4 sm:p-5 hover:bg-brand-graphite-50/70 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-sm text-brand-graphite-900 group-hover:text-brand-red transition-colors">
                        {insp.buildingName}
                      </span>
                      {insp.floorLabel && (
                        <span className="text-xs font-mono text-brand-graphite-600 bg-brand-graphite-100 px-2 py-0.5 rounded border border-brand-border/60">
                          {insp.floorLabel}
                        </span>
                      )}
                      <Badge
                        variant={
                          insp.status === 'passed'
                            ? 'success'
                            : insp.status === 'needs_attention'
                            ? 'critical'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {insp.status === 'passed'
                          ? 'PASSED'
                          : insp.status === 'needs_attention'
                          ? 'NEEDS ATTENTION'
                          : 'INCOMPLETE'}
                      </Badge>

                      {insp.category && (
                        <span className="text-[10px] font-mono text-brand-graphite-500 bg-white px-1.5 py-0.5 rounded border border-brand-border">
                          {INSPECTION_CATEGORIES.find((c) => c.id === insp.category)?.name || 'Custom'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-brand-graphite-600 line-clamp-1 leading-relaxed mb-2">
                      {insp.notes || 'Inspection findings recorded.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-brand-graphite-400 font-mono">
                      <span>Auditor: <strong className="text-brand-graphite-700">{insp.inspectorName}</strong></span>
                      <span>Date: <strong className="text-brand-graphite-700">{formatDateString(insp.date)}</strong></span>
                      <span>
                        Results: <strong className="text-emerald-700">{pass} Pass</strong> &bull;{' '}
                        <strong className="text-red-600">{attn} Defect{attn !== 1 ? 's' : ''}</strong>
                        {unchk > 0 && <span> &bull; <strong className="text-amber-600">{unchk} Unchecked</strong></span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-brand-graphite-400 block font-mono">
                        Audit Score
                      </span>
                      <span
                        className={`text-xl font-mono font-bold ${
                          insp.score >= 90
                            ? 'text-emerald-700'
                            : insp.score >= 70
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {insp.score}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View Audit
                      </Button>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInspection(insp);
                          }}
                          className="p-1.5 text-brand-graphite-400 hover:text-red-600 transition-colors rounded"
                          title="Delete Inspection Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Record Inspection Modal (The Dynamic Inspection Runner) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Safety & Compliance Inspection"
        description="Complete the structured verification checklist. Evaluate each item honestly; do not leave attention items unresolved."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitInspection} className="space-y-4">
          {/* Facility & Floor Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Facility"
              value={selectedBuildingId}
              onChange={(e) => handleBuildingChange(e.target.value)}
              required
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </Select>

            <Select
              label="Level / Floor Scope"
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
            >
              <option value="all">All Floors / Entire Facility</option>
              {availableFloors.map((flr) => (
                <option key={flr.id} value={flr.id}>
                  {flr.label} (Level {flr.floorNumber})
                </option>
              ))}
            </Select>
          </div>

          {/* Inspection Category, Inspector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Inspection Category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              {INSPECTION_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Inspector Name
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                required
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <Input
              label="Inspection Date"
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              required
            >
              <Calendar className="w-4 h-4 text-brand-graphite-400" />
            </Input>
          </div>

          {/* Structured Verification Checklist */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-brand-graphite-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-brand-red" />
                <span>Verification Checklist Items ({checklist.length})</span>
              </label>
              <span className="text-[11px] text-brand-graphite-500 font-mono">
                {notCheckedCount} remaining unchecked
              </span>
            </div>

            <div className="space-y-3 divide-y divide-brand-border border border-brand-border rounded p-3 bg-brand-graphite-50/50 max-h-[50vh] overflow-y-auto">
              {checklist.map((item, idx) => {
                const actionCfg = itemActionConfigs[item.id];
                return (
                  <div key={item.id} className={`${idx !== 0 ? 'pt-3' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-brand-graphite-900 leading-snug block">
                          {idx + 1}. {item.label}
                        </span>
                        <span className="text-[10px] font-mono text-brand-graphite-500 uppercase mt-0.5 block">
                          Domain: {item.category.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* 3 Practical Status Radios: Pass / Needs Attention / Not Checked */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'pass')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors flex items-center gap-1 ${
                            item.status === 'pass'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border border-brand-border text-brand-graphite-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'needs_attention')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors flex items-center gap-1 ${
                            item.status === 'needs_attention'
                              ? 'bg-brand-red text-white shadow-xs'
                              : 'bg-white border border-brand-border text-brand-graphite-600 hover:bg-red-50'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Needs Attention</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'not_checked')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                            item.status === 'not_checked'
                              ? 'bg-brand-graphite-800 text-white shadow-xs'
                              : 'bg-white border border-brand-border text-brand-graphite-500 hover:bg-brand-graphite-100'
                          }`}
                        >
                          Not Checked
                        </button>
                      </div>
                    </div>

                    {/* Expandable Deficiency Observation & Action Config */}
                    {item.status === 'needs_attention' && (
                      <div className="mt-2.5 p-3 bg-red-50/70 border border-red-200 rounded space-y-2.5 animate-fadeIn">
                        <div>
                          <label className="text-[11px] font-bold text-red-950 block mb-1">
                            Deficiency Observation & Finding Notes:
                          </label>
                          <input
                            type="text"
                            placeholder="Detail observation (e.g. pressure gauge needle in red, boxes blocking stair landing)..."
                            value={item.notes || ''}
                            onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                            required
                            className="w-full text-xs p-1.5 rounded border border-red-300 bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red"
                          />
                        </div>

                        {/* Immediate Action Generation Affordance */}
                        <div className="pt-2 border-t border-red-200/60">
                          <label className="flex items-center gap-2 text-xs font-semibold text-red-900 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={!!actionCfg?.enabled}
                              onChange={(e) => handleActionToggle(item.id, e.target.checked)}
                              className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                            />
                            <span>Create Corrective Action ticket immediately for this deficiency</span>
                          </label>

                          {actionCfg?.enabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/80 p-2.5 rounded border border-red-200 text-xs">
                              <div>
                                <label className="block text-[10px] font-mono text-brand-graphite-600 uppercase mb-0.5">
                                  Priority
                                </label>
                                <select
                                  value={actionCfg.priority}
                                  onChange={(e) =>
                                    handleActionConfigChange(item.id, 'priority', e.target.value)
                                  }
                                  className="w-full text-xs p-1 border border-brand-border rounded bg-white"
                                >
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                  <option value="critical">Critical</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-brand-graphite-600 uppercase mb-0.5">
                                  Assignee
                                </label>
                                <select
                                  value={actionCfg.assignedStaffId}
                                  onChange={(e) =>
                                    handleActionConfigChange(item.id, 'assignedStaffId', e.target.value)
                                  }
                                  className="w-full text-xs p-1 border border-brand-border rounded bg-white"
                                >
                                  {staff.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} ({s.emergencyRole})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-brand-graphite-600 uppercase mb-0.5">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  value={actionCfg.dueDate}
                                  onChange={(e) =>
                                    handleActionConfigChange(item.id, 'dueDate', e.target.value)
                                  }
                                  className="w-full text-xs p-1 border border-brand-border rounded bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Inspector Notes */}
          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Overall Audit Summary Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Ambient facility conditions, weather, key remarks, or follow-up timelines..."
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
            />
          </div>

          {/* Live Result Outcome Preview */}
          <div className="p-3 bg-brand-graphite-100 rounded border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-700 font-bold">{passCount} Pass</span>
              <span>&bull;</span>
              <span className="text-brand-red font-bold">{attentionCount} Attention</span>
              <span>&bull;</span>
              <span className="text-brand-graphite-600">{notCheckedCount} Unchecked</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-brand-graphite-500">Calculated Outcome:</span>
              <Badge
                variant={
                  liveStatus === 'passed'
                    ? 'success'
                    : liveStatus === 'needs_attention'
                    ? 'critical'
                    : 'warning'
                }
                size="sm"
              >
                {liveStatus === 'passed'
                  ? 'PASSED'
                  : liveStatus === 'needs_attention'
                  ? 'NEEDS ATTENTION'
                  : 'INCOMPLETE'}
              </Badge>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={ClipboardCheck}>
              Save Inspection Audit
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Review Details & Audit History Modal */}
      {selectedInspection && (
        <Modal
          isOpen={!!selectedInspection}
          onClose={() => setSelectedInspectionId(null)}
          title={`Audit Record: ${selectedInspection.buildingName}`}
          description={`Conducted by ${selectedInspection.inspectorName} on ${formatDateString(
            selectedInspection.date
          )}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Header Result Card */}
            <div className="p-4 bg-brand-graphite-50 rounded border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-brand-graphite-900">
                    {selectedInspection.buildingName}
                  </span>
                  <span className="text-xs font-mono text-brand-graphite-600 bg-white px-1.5 py-0.5 rounded border border-brand-border">
                    {selectedInspection.floorLabel || 'All Floors'}
                  </span>
                  <Badge
                    variant={
                      selectedInspection.status === 'passed'
                        ? 'success'
                        : selectedInspection.status === 'needs_attention'
                        ? 'critical'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {selectedInspection.status === 'passed'
                      ? 'PASSED'
                      : selectedInspection.status === 'needs_attention'
                      ? 'NEEDS ATTENTION'
                      : 'INCOMPLETE'}
                  </Badge>
                </div>
                <p className="text-xs text-brand-graphite-600 leading-relaxed font-sans">
                  {selectedInspection.notes || 'Inspection findings recorded.'}
                </p>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-[10px] uppercase font-mono font-bold text-brand-graphite-400 block">
                  Compliance Score
                </span>
                <span
                  className={`text-2xl font-mono font-bold ${
                    selectedInspection.score >= 90
                      ? 'text-emerald-700'
                      : selectedInspection.score >= 70
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {selectedInspection.score}%
                </span>
              </div>
            </div>

            {/* Checklist Results Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono">
                  Itemized Verification Log ({selectedInspection.items.length} items)
                </span>
                <div className="text-[11px] font-mono text-brand-graphite-500">
                  <span className="text-emerald-700 font-bold">
                    {selectedInspection.items.filter((i) => i.status === 'pass').length} Pass
                  </span>{' '}
                  &bull;{' '}
                  <span className="text-red-600 font-bold">
                    {selectedInspection.items.filter((i) => i.status === 'needs_attention').length} Attention
                  </span>
                </div>
              </div>

              <div className="divide-y divide-brand-border border border-brand-border rounded max-h-[55vh] overflow-y-auto">
                {selectedInspection.items.map((item, idx) => {
                  // Check if a linked corrective action exists in the data model
                  const linkedAction = issues.find(
                    (iss) =>
                      (item.linkedIssueId && iss.id === item.linkedIssueId) ||
                      (iss.sourceId === selectedInspection.id &&
                        (iss.checklistItemId === item.id || iss.title.includes(item.label)))
                  );

                  return (
                    <div key={item.id} className="p-3.5 text-xs hover:bg-brand-graphite-50/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-brand-graphite-400 flex-shrink-0 mt-0.5">
                              {idx + 1}.
                            </span>
                            <div>
                              <span className="font-semibold text-brand-graphite-900 leading-snug block">
                                {item.label}
                              </span>
                              <span className="text-[10px] font-mono text-brand-graphite-400 uppercase">
                                Domain: {item.category.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Finding Note */}
                          {item.notes && (
                            <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Observation:</span> {item.notes}
                              </div>
                            </div>
                          )}

                          {/* Linked Action Status or Creation Affordance */}
                          {item.status === 'needs_attention' && (
                            <div className="mt-2.5 pt-2 border-t border-brand-border/60">
                              {linkedAction ? (
                                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded">
                                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-950 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                                    <span>
                                      Corrective Action <strong>{linkedAction.code}</strong>: Assigned to{' '}
                                      <strong>{linkedAction.assignedToName}</strong>
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      linkedAction.status === 'resolved'
                                        ? 'success'
                                        : linkedAction.status === 'in_progress'
                                        ? 'warning'
                                        : 'critical'
                                    }
                                    size="sm"
                                  >
                                    {linkedAction.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2 p-2 bg-red-50/70 border border-red-200 rounded">
                                  <span className="text-[11px] text-red-900 font-medium">
                                    Defect identified &bull; No active corrective action ticket linked yet
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Plus}
                                    onClick={() => handleOpenCreateActionForItem(selectedInspection, item)}
                                    className="text-xs bg-white"
                                  >
                                    Create Action
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <Badge
                            variant={
                              item.status === 'pass'
                                ? 'success'
                                : item.status === 'needs_attention'
                                ? 'critical'
                                : 'default'
                            }
                            size="sm"
                          >
                            {item.status === 'pass'
                              ? 'PASS'
                              : item.status === 'needs_attention'
                              ? 'ATTENTION'
                              : 'NOT CHECKED'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono text-brand-graphite-400">
                Audit Record ID: {selectedInspection.id}
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedInspectionId(null)}>
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Inline "Create Corrective Action from Reviewed Item" Sub-Modal */}
      {createActionModalItem && (
        <Modal
          isOpen={!!createActionModalItem}
          onClose={() => setCreateActionModalItem(null)}
          title="Create Linked Corrective Action"
          description={`Attach a tracked remediation ticket for: "${createActionModalItem.item.label}"`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveActionForItem} className="space-y-3.5">
            <Input
              label="Action Title"
              value={actionTitle}
              onChange={(e) => setActionTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Defect Description & Task Instructions
              </label>
              <textarea
                rows={3}
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                required
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Priority Level"
                value={actionPriority}
                onChange={(e) => setActionPriority(e.target.value as PriorityLevel)}
              >
                <option value="critical">Critical (Immediate Hazard)</option>
                <option value="high">High (Address within 72h)</option>
                <option value="medium">Medium (Scheduled servicing)</option>
                <option value="low">Low (Cosmetic/housekeeping)</option>
              </Select>

              <Select
                label="Assign Responsibility"
                value={actionStaffId}
                onChange={(e) => setActionStaffId(e.target.value)}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.emergencyRole})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Target Due Date"
              type="date"
              value={actionDueDate}
              onChange={(e) => setActionDueDate(e.target.value)}
              required
            >
              <Calendar className="w-4 h-4 text-brand-graphite-400" />
            </Input>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateActionModalItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={ShieldCheck}>
                Assign & Create Action
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
