import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  ClipboardCheck,
} from 'lucide-react';
import {
  formatDateString,
  formatPriority,
  formatActionStatus,
} from '../utils/formatters';
import { ActionStatus, PriorityLevel, SafetyIssue, Inspection } from '../types';

export const IssuesPage: React.FC = () => {
  const {
    issues,
    buildings,
    floors,
    staff,
    inspections,
    createSafetyIssue,
    updateSafetyIssue,
    deleteSafetyIssue,
    resolveSafetyIssue,
    user,
  } = useData();

  const isAdmin = user?.role === 'admin';
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [buildingFilter, setFilterBuilding] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveModalIssue, setResolveModalIssue] = useState<SafetyIssue | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [editModalIssue, setEditModalIssue] = useState<SafetyIssue | null>(null);
  const [viewInspection, setViewInspection] = useState<Inspection | null>(null);

  // Create issue form state
  const [createBuildingId, setCreateBuildingId] = useState(buildings[0]?.id || '');
  const [createFloorId, setCreateFloorId] = useState<string>('all');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState<PriorityLevel>('high');
  const [assignedStaffId, setAssignedStaffId] = useState(staff[0]?.id || 'stf-08');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  );

  // Edit issue form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('high');
  const [editStaffId, setEditStaffId] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<ActionStatus>('open');

  // Available floors for selected building in creation form
  const availableFloorsForCreate = useMemo(() => {
    return floors.filter((f) => f.buildingId === createBuildingId);
  }, [floors, createBuildingId]);

  // Helper to check if an issue is overdue
  const isOverdue = (iss: SafetyIssue) => {
    return iss.status !== 'resolved' && iss.dueDate < todayStr;
  };

  // Filtered Issues List
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      // Status filter
      if (statusFilter === 'overdue') {
        if (!isOverdue(iss)) return false;
      } else if (statusFilter !== 'all') {
        if (iss.status !== statusFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && iss.priority !== priorityFilter) return false;

      // Building filter
      if (buildingFilter !== 'all' && iss.buildingId !== buildingFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = iss.title.toLowerCase().includes(query);
        const matchesCode = iss.code.toLowerCase().includes(query);
        const matchesDesc = (iss.description || '').toLowerCase().includes(query);
        const matchesAssignee = iss.assignedToName.toLowerCase().includes(query);
        const matchesBuilding = iss.buildingName.toLowerCase().includes(query);
        const matchesItem = (iss.checklistItemLabel || '').toLowerCase().includes(query);
        if (
          !matchesTitle &&
          !matchesCode &&
          !matchesDesc &&
          !matchesAssignee &&
          !matchesBuilding &&
          !matchesItem
        ) {
          return false;
        }
      }

      return true;
    });
  }, [issues, statusFilter, priorityFilter, buildingFilter, searchQuery, todayStr]);

  // Overall Statistics Derived From Actual Data
  const totalActionsCount = issues.length;
  const openActionsCount = issues.filter((i) => i.status === 'open').length;
  const inProgressActionsCount = issues.filter((i) => i.status === 'in_progress').length;
  const overdueActionsCount = issues.filter((i) => isOverdue(i)).length;
  const resolvedActionsCount = issues.filter((i) => i.status === 'resolved').length;

  // Handle Create Action Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;
    const bld = buildings.find((b) => b.id === createBuildingId) || buildings[0];
    const targetFloor =
      createFloorId !== 'all'
        ? availableFloorsForCreate.find((f) => f.id === createFloorId)
        : undefined;

    const assignedStaff = staff.find((s) => s.id === assignedStaffId) || staff[0];

    createSafetyIssue({
      institutionId: bld.institutionId,
      buildingId: bld.id,
      buildingName: bld.name,
      floorId: targetFloor?.id,
      floorLabel: targetFloor ? targetFloor.label : 'General Facility',
      sourceType: 'manual',
      title: issueTitle.trim(),
      description: issueDesc.trim() || 'Manual corrective action registered for facilities team.',
      priority: issuePriority,
      assignedToName: assignedStaff?.name || 'Facilities Maintenance Supervisor',
      assignedToRole: assignedStaff?.emergencyRole || 'Facility Manager',
      assignedToId: assignedStaff?.id,
      dueDate,
      status: 'open',
    });

    setIssueTitle('');
    setIssueDesc('');
    setCreateModalOpen(false);
  };

  // Open Edit Action Modal
  const handleOpenEdit = (iss: SafetyIssue) => {
    setEditModalIssue(iss);
    setEditTitle(iss.title);
    setEditDesc(iss.description);
    setEditPriority(iss.priority);
    setEditStaffId(iss.assignedToId || staff.find((s) => s.name === iss.assignedToName)?.id || staff[0]?.id || '');
    setEditDueDate(iss.dueDate);
    setEditStatus(iss.status);
  };

  // Submit Edit Action
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalIssue || !editTitle.trim()) return;

    const assignedStaff = staff.find((s) => s.id === editStaffId);

    updateSafetyIssue(editModalIssue.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      assignedToName: assignedStaff ? assignedStaff.name : editModalIssue.assignedToName,
      assignedToRole: assignedStaff ? assignedStaff.emergencyRole : editModalIssue.assignedToRole,
      assignedToId: assignedStaff ? assignedStaff.id : editModalIssue.assignedToId,
      dueDate: editDueDate,
      status: editStatus,
    });

    setEditModalIssue(null);
  };

  // Handle Quick Status Change
  const handleStatusQuickChange = (id: string, newStatus: ActionStatus) => {
    updateSafetyIssue(id, { status: newStatus });
  };

  // Handle Resolve Action Submit
  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalIssue || !resolutionText.trim()) return;

    resolveSafetyIssue(resolveModalIssue.id, resolutionText.trim());
    setResolveModalIssue(null);
    setResolutionText('');
  };

  // Handle Reopen Action
  const handleReopenAction = (iss: SafetyIssue) => {
    if (window.confirm(`Reopen action "${iss.code}: ${iss.title}"?`)) {
      updateSafetyIssue(iss.id, {
        status: 'open',
        resolutionNote: undefined,
        resolvedAt: undefined,
        resolvedBy: undefined,
      });
    }
  };

  // Handle Delete Action
  const handleDeleteAction = (iss: SafetyIssue) => {
    if (!isAdmin) return;
    if (window.confirm(`Permanently remove corrective action "${iss.code}"?`)) {
      deleteSafetyIssue(iss.id);
    }
  };

  // Open Source Inspection details modal
  const handleOpenSourceInspection = (inspectionId: string) => {
    const found = inspections.find((i) => i.id === inspectionId);
    if (found) {
      setViewInspection(found);
    } else {
      alert(`Source inspection "${inspectionId}" could not be located.`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety Corrective Actions & Closure Tracking"
        description="Verify that every hazard, inspection deficiency, and drill finding is assigned, remediated, and verified to closure."
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Corrective Actions' },
        ]}
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => {
              setCreateBuildingId(buildings[0]?.id || '');
              setCreateFloorId('all');
              setIssueTitle('');
              setIssueDesc('');
              setIssuePriority('high');
              setAssignedStaffId(staff.find(s => s.emergencyRole === 'Facility Manager')?.id || staff[0]?.id || '');
              setDueDate(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);
              setCreateModalOpen(true);
            }}
          >
            Create Action Item
          </Button>
        }
      />

      {/* 1. Corrective Actions Dashboard Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white border-brand-red shadow-xs ring-1 ring-brand-red'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-1">
            Total Actions
          </span>
          <span className="text-2xl font-bold font-mono text-brand-graphite-900">
            {totalActionsCount}
          </span>
          <span className="text-[11px] text-brand-graphite-500 block mt-0.5">All tickets</span>
        </div>

        <div
          onClick={() => setStatusFilter('open')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            statusFilter === 'open'
              ? 'bg-white border-red-600 shadow-xs ring-1 ring-red-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red font-mono block mb-1">
            Open / Pending
          </span>
          <span className="text-2xl font-bold font-mono text-brand-red">
            {openActionsCount}
          </span>
          <span className="text-[11px] text-red-600 block mt-0.5">Awaiting work</span>
        </div>

        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-white border-amber-600 shadow-xs ring-1 ring-amber-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono block mb-1">
            In Progress
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700">
            {inProgressActionsCount}
          </span>
          <span className="text-[11px] text-amber-600 block mt-0.5">Under remediation</span>
        </div>

        <div
          onClick={() => setStatusFilter('overdue')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'bg-red-50/70 border-red-600 shadow-xs ring-1 ring-red-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 font-mono">
              Past Due Date
            </span>
            <AlertCircle className="w-3 h-3 text-brand-red" />
          </div>
          <span className="text-2xl font-bold font-mono text-red-700">
            {overdueActionsCount}
          </span>
          <span className="text-[11px] text-red-600 block mt-0.5">Immediate follow-up</span>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded border transition-all cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600'
              : 'bg-white border-brand-border hover:border-brand-graphite-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono block mb-1">
            Resolved & Closed
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {resolvedActionsCount}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Closure verified</span>
        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="bg-white border border-brand-border rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action title, code (e.g. ACT-102), assignee, facility, or defect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red"
            />
          </div>

          <span className="text-xs font-mono text-brand-graphite-500 whitespace-nowrap">
            Showing {filteredIssues.length} of {issues.length} action items
          </span>
        </div>

        {/* Filter Pills and Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded border border-brand-border bg-brand-graphite-50 p-0.5 text-xs">
            {(['all', 'open', 'in_progress', 'overdue', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-semibold rounded capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-brand-graphite-900 shadow-xs'
                    : 'text-brand-graphite-600 hover:text-brand-graphite-900'
                }`}
              >
                {st === 'overdue' ? 'Overdue' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-graphite-800 bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Building filter */}
          <select
            value={buildingFilter}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="rounded border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-graphite-800 bg-white focus:outline-none"
          >
            <option value="all">All Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || buildingFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setFilterBuilding('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-brand-red hover:underline font-mono ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Corrective Actions List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-dashed border-brand-border rounded p-12 text-center text-xs text-brand-graphite-500">
            <ShieldCheck className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-graphite-800">No corrective actions match your filters.</p>
            <p className="text-[11px] text-brand-graphite-500 mt-1">
              Select &quot;All&quot; status or create a new corrective action item.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const p = formatPriority(issue.priority);
            const st = formatActionStatus(issue.status);
            const overdue = isOverdue(issue);

            return (
              <div
                key={issue.id}
                className={`bg-white border rounded p-5 shadow-xs transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  overdue ? 'border-red-300 ring-1 ring-red-300/60' : 'border-brand-border hover:border-brand-graphite-400'
                }`}
              >
                <div className="flex-1">
                  {/* Top line badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-brand-graphite-700 bg-brand-graphite-100 px-2 py-0.5 rounded border border-brand-border/60">
                      {issue.code}
                    </span>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${p.bg} ${p.border}`}>
                      {p.label}
                    </span>

                    {/* Source Badge with link to Inspection */}
                    {issue.sourceType === 'inspection' && issue.sourceId ? (
                      <button
                        onClick={() => handleOpenSourceInspection(issue.sourceId!)}
                        className="text-[10px] uppercase font-mono text-brand-red hover:underline bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 font-semibold"
                        title="Click to view original inspection audit record"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Source: Inspection #{issue.sourceId.replace('insp-', '')}</span>
                      </button>
                    ) : issue.sourceType === 'drill' && issue.sourceId ? (
                      <Link
                        to={`/drills/${issue.sourceId}`}
                        className="text-[10px] uppercase font-mono text-orange-700 hover:underline bg-orange-50 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1 font-semibold"
                      >
                        <span>Source: Mock Drill</span>
                      </Link>
                    ) : (
                      <span className="text-[10px] uppercase font-mono text-brand-graphite-500 bg-brand-graphite-50 px-2 py-0.5 rounded border border-brand-border">
                        Source: Manual Entry
                      </span>
                    )}

                    {/* Status Badge */}
                    <Badge
                      variant={
                        issue.status === 'resolved'
                          ? 'success'
                          : issue.status === 'in_progress'
                          ? 'warning'
                          : 'critical'
                      }
                      size="sm"
                    >
                      {st.label.toUpperCase()}
                    </Badge>

                    {overdue && (
                      <span className="text-[10px] font-bold font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        <span>OVERDUE</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-brand-graphite-900 mb-1 leading-snug">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-brand-graphite-600 leading-relaxed mb-3">
                    {issue.description}
                  </p>

                  {/* Checklist item reference callout if present */}
                  {issue.checklistItemLabel && (
                    <div className="mb-3 p-2 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-700 flex items-center gap-1.5 font-mono text-[11px]">
                      <ClipboardCheck className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                      <span>
                        Audited Item: <strong>{issue.checklistItemLabel}</strong>
                      </span>
                    </div>
                  )}

                  {/* Resolution Note if resolved */}
                  {issue.status === 'resolved' && issue.resolutionNote && (
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-950 mb-3 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Remediation & Closure Verified:</span>
                      </div>
                      <p className="leading-relaxed pl-5">{issue.resolutionNote}</p>
                      <div className="pl-5 text-[10px] text-emerald-800 font-mono">
                        Verified by <strong>{issue.resolvedBy || 'Authorized Lead'}</strong> on{' '}
                        {issue.resolvedAt ? formatDateString(issue.resolvedAt) : 'Recently'}
                      </div>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-brand-graphite-500 font-mono">
                    <span className="flex items-center gap-1 text-brand-graphite-800">
                      <Building2 className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>{issue.buildingName}</span>
                      {issue.floorLabel && <span className="text-brand-graphite-400 font-normal">({issue.floorLabel})</span>}
                    </span>

                    <span className="flex items-center gap-1 text-brand-graphite-800">
                      <UserCheck className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>
                        Assigned: <strong>{issue.assignedToName}</strong>
                      </span>
                    </span>

                    <span className={`flex items-center gap-1 ${overdue ? 'text-red-700 font-bold' : 'text-brand-graphite-700'}`}>
                      <Calendar className="w-3.5 h-3.5 text-brand-graphite-400" />
                      <span>Due: {issue.dueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                  {issue.status !== 'resolved' ? (
                    <>
                      <div className="flex items-center gap-2">
                        {issue.status === 'open' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusQuickChange(issue.id, 'in_progress')}
                          >
                            Mark In Progress
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusQuickChange(issue.id, 'open')}
                          >
                            Mark Open
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle2}
                          onClick={() => {
                            setResolveModalIssue(issue);
                            setResolutionText(
                              issue.title.toLowerCase().includes('extinguisher')
                                ? 'Cylinder inspected, pressure verified in green operating zone, and service tag re-certified.'
                                : issue.title.toLowerCase().includes('stairwell') || issue.title.toLowerCase().includes('egress')
                                ? 'Obstruction cleared completely. Corridor and stair landing restored to minimum 1.5m clearance.'
                                : 'Corrective remediation completed and verified operational.'
                            );
                          }}
                        >
                          Resolve & Close
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleOpenEdit(issue)}
                          className="p-1.5 text-brand-graphite-500 hover:text-brand-graphite-900 rounded hover:bg-brand-graphite-100 transition-colors flex items-center gap-1 text-xs"
                          title="Edit action assignment or priority"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px] font-mono">Edit</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAction(issue)}
                            className="p-1.5 text-brand-graphite-400 hover:text-red-600 rounded hover:bg-brand-graphite-100 transition-colors"
                            title="Delete Action Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={RotateCcw}
                        onClick={() => handleReopenAction(issue)}
                        className="text-xs"
                      >
                        Reopen Action
                      </Button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteAction(issue)}
                          className="p-1.5 text-brand-graphite-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Action Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Create Corrective Action Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Corrective Action Item"
        description="Register a tracked safety action item with clear assignment, priority, and remediation deadline."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5">
          <Input
            label="Action Item Title"
            placeholder="e.g. Replace discharged fire extinguisher cylinder in corridor"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Problem Description & Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Detail the hazard condition, exact physical location, and required corrective work..."
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              required
              className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Facility Location"
              value={createBuildingId}
              onChange={(e) => {
                setCreateBuildingId(e.target.value);
                setCreateFloorId('all');
              }}
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>

            <Select
              label="Level / Floor"
              value={createFloorId}
              onChange={(e) => setCreateFloorId(e.target.value)}
            >
              <option value="all">All Floors / General</option>
              {availableFloorsForCreate.map((flr) => (
                <option key={flr.id} value={flr.id}>
                  {flr.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={issuePriority}
              onChange={(e) => setIssuePriority(e.target.value as PriorityLevel)}
            >
              <option value="critical">Critical (Immediate Hazard)</option>
              <option value="high">High (Address within 72h)</option>
              <option value="medium">Medium (Scheduled servicing)</option>
              <option value="low">Low (Cosmetic/housekeeping)</option>
            </Select>

            <Select
              label="Assign Responsibility"
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.emergencyRole})
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Target Remediation Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          >
            <Calendar className="w-4 h-4 text-brand-graphite-400" />
          </Input>

          <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={ShieldCheck}>
              Assign & Create Action
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Resolve & Close Action Modal */}
      {resolveModalIssue && (
        <Modal
          isOpen={!!resolveModalIssue}
          onClose={() => setResolveModalIssue(null)}
          title={`Resolve Action: ${resolveModalIssue.code}`}
          description={`Record physical remediation details before closing "${resolveModalIssue.title}".`}
          maxWidth="md"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-700">
              <span className="font-bold text-brand-graphite-900 block mb-0.5">
                Defect Reported:
              </span>
              <p>{resolveModalIssue.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Resolution Notes & Corrective Steps Taken (Required)
              </label>
              <textarea
                rows={3}
                placeholder="Describe how the hazard was remediated, replacement part numbers, certification test results..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                required
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolveModalIssue(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={CheckCircle2}>
                Confirm Resolution & Close
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Edit Action Modal */}
      {editModalIssue && (
        <Modal
          isOpen={!!editModalIssue}
          onClose={() => setEditModalIssue(null)}
          title={`Edit Action Item: ${editModalIssue.code}`}
          description="Update task assignment, priority, remediation target date, or status."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5">
            <Input
              label="Action Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Description & Instructions
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Priority Level"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>

              <Select
                label="Assignee"
                value={editStaffId}
                onChange={(e) => setEditStaffId(e.target.value)}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.emergencyRole})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Due Date"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                required
              />

              <Select
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ActionStatus)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalIssue(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. View Source Inspection Review Modal */}
      {viewInspection && (
        <Modal
          isOpen={!!viewInspection}
          onClose={() => setViewInspection(null)}
          title={`Originating Inspection: ${viewInspection.buildingName}`}
          description={`Conducted on ${formatDateString(viewInspection.date)} by ${viewInspection.inspectorName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-brand-graphite-900">
                  {viewInspection.buildingName} &bull; {viewInspection.floorLabel || 'All Floors'}
                </span>
                <p className="text-brand-graphite-500 mt-0.5">{viewInspection.notes}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg text-brand-graphite-900">
                  {viewInspection.score}%
                </span>
                <Badge
                  variant={
                    viewInspection.status === 'passed'
                      ? 'success'
                      : viewInspection.status === 'needs_attention'
                      ? 'critical'
                      : 'warning'
                  }
                  size="sm"
                >
                  {viewInspection.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono block">
                Audit Checklist Items
              </span>
              <div className="divide-y divide-brand-border border border-brand-border rounded max-h-[45vh] overflow-y-auto">
                {viewInspection.items.map((item, idx) => (
                  <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-brand-graphite-900">
                        {idx + 1}. {item.label}
                      </span>
                      {item.notes && (
                        <p className="text-red-800 text-[11px] mt-1 bg-red-50 p-1.5 rounded border border-red-200">
                          Deficiency Finding: {item.notes}
                        </p>
                      )}
                    </div>
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
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <Link to="/inspections" className="text-xs text-brand-red font-semibold hover:underline">
                Open in Full Inspections Hub &rarr;
              </Link>
              <Button size="sm" variant="outline" onClick={() => setViewInspection(null)}>
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
