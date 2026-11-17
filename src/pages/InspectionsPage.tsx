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
    updateChecklistItem,
    deleteInspection,
    createSafetyIssue,
    verifySafetyIssue,
    user,
  } = useData();

  const isAdmin = user?.role === 'admin';

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [reviewItemFilter, setReviewItemFilter] = useState<
    'all' | 'pending' | 'active_defects' | 'remediated' | 'needs_attention' | 'pass'
  >('all');
  const [createActionModalItem, setCreateActionModalItem] = useState<{
    inspection: Inspection;
    item: ChecklistItem;
  } | null>(null);
  const [createTicketImmediately, setCreateTicketImmediately] = useState(true);

  // Inspection Continuation State
  const [continueModalInspection, setContinueModalInspection] = useState<Inspection | null>(null);
  const [continueChecklist, setContinueChecklist] = useState<ChecklistItem[]>([]);
  const [continueNotes, setContinueNotes] = useState('');
  const [continueActionConfigs, setContinueActionConfigs] = useState<
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

  // Inline Admin Verification Modal State
  const [verifyModalAction, setVerifyModalAction] = useState<{
    inspection: Inspection;
    item: ChecklistItem;
    issue: SafetyIssue;
  } | null>(null);
  const [verifyNote, setVerifyNote] = useState('');

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
  // Incomplete audits with unchecked items are always 'pending'
  const liveStatus: Inspection['status'] =
    notCheckedCount > 0
      ? 'pending'
      : attentionCount > 0
      ? 'needs_attention'
      : 'passed';

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

  // Helper to find linked corrective action for a checklist item
  const getLinkedIssue = (item: ChecklistItem, inspectionId: string) => {
    return issues.find(
      (iss) =>
        (item.linkedIssueId && iss.id === item.linkedIssueId) ||
        (iss.sourceId === inspectionId &&
          (iss.checklistItemId === item.id || iss.title.includes(item.label)))
    );
  };

  // Helper to check if an item's defect has been remediated (resolved or verified)
  const isItemRemediated = (item: ChecklistItem, inspectionId: string) => {
    const issue = getLinkedIssue(item, inspectionId);
    return !!(issue && (issue.status === 'resolved' || issue.status === 'verified'));
  };

  // Helper to determine if all defects for an inspection are resolved/verified
  const areAllDefectsResolved = (insp: Inspection) => {
    const defects = insp.items.filter((i) => i.status === 'needs_attention');
    if (defects.length === 0) return true;
    return defects.every((item) => isItemRemediated(item, insp.id));
  };

  // Dynamic count helpers
  const getInspectionPendingCount = (insp: Inspection) =>
    insp.items.filter((i) => i.status === 'not_checked').length;
  const getInspectionAttentionCount = (insp: Inspection) =>
    insp.items.filter((i) => i.status === 'needs_attention').length;
  const getInspectionPassedCount = (insp: Inspection) =>
    insp.items.filter((i) => i.status === 'pass').length;
  const isAuditIncomplete = (insp: Inspection) =>
    getInspectionPendingCount(insp) > 0 || insp.status === 'pending';
  const getInspectionRemediatedCount = (insp: Inspection) =>
    insp.items.filter((i) => i.status === 'needs_attention' && isItemRemediated(i, insp.id)).length;
  const getInspectionActiveDefectsCount = (insp: Inspection) =>
    insp.items.filter((i) => i.status === 'needs_attention' && !isItemRemediated(i, insp.id)).length;

  // Open inspection modal with specific tab
  const handleOpenAudit = (
    insp: Inspection,
    tab: 'all' | 'pending' | 'active_defects' | 'remediated' | 'needs_attention' | 'pass' = 'all'
  ) => {
    setSelectedInspectionId(insp.id);
    setReviewItemFilter(tab);
  };

  // Mark an unchecked item directly as Passed
  const handleMarkItemPassed = (inspectionId: string, itemId: string) => {
    updateChecklistItem(inspectionId, itemId, {
      status: 'pass',
    });
  };

  // Change item status (e.g. from pass back to not_checked)
  const handleSetItemStatus = (
    inspectionId: string,
    itemId: string,
    newStatus: InspectionStatus
  ) => {
    updateChecklistItem(inspectionId, itemId, {
      status: newStatus,
    });
  };

  // Open Continuation Runner for Incomplete Inspection
  const handleStartContinueInspection = (insp: Inspection) => {
    setContinueModalInspection(insp);
    setContinueChecklist([...insp.items]);
    setContinueNotes(insp.notes || '');
    setContinueActionConfigs({});
  };

  const handleContinueStatusChange = (id: string, newStatus: InspectionStatus) => {
    setContinueChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleContinueItemNoteChange = (id: string, note: string) => {
    setContinueChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: note } : item))
    );
  };

  const handleContinueActionToggle = (id: string, enabled: boolean) => {
    setContinueActionConfigs((prev) => ({
      ...prev,
      [id]: {
        enabled,
        priority: prev[id]?.priority || 'high',
        assignedStaffId:
          prev[id]?.assignedStaffId ||
          staff.find((s) => s.emergencyRole === 'Facility Manager')?.id ||
          staff[0]?.id ||
          '',
        dueDate:
          prev[id]?.dueDate ||
          new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      },
    }));
  };

  const handleContinueActionConfigChange = (
    id: string,
    field: 'priority' | 'assignedStaffId' | 'dueDate',
    val: any
  ) => {
    setContinueActionConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleSaveContinueProgress = (finalize: boolean) => {
    if (!continueModalInspection) return;

    let updatedChecklist = [...continueChecklist];

    // Create tickets for newly enabled action configs on needs_attention items
    continueChecklist.forEach((item, idx) => {
      const cfg = continueActionConfigs[item.id];
      if (item.status === 'needs_attention' && cfg?.enabled && !item.linkedIssueId) {
        const assignedStaff = staff.find((s) => s.id === cfg.assignedStaffId) || staff[0];
        const newIssue = createSafetyIssue({
          institutionId: continueModalInspection.institutionId,
          buildingId: continueModalInspection.buildingId,
          buildingName: continueModalInspection.buildingName,
          floorId: continueModalInspection.floorId,
          floorLabel: continueModalInspection.floorLabel || 'General Facility',
          sourceType: 'inspection',
          sourceId: continueModalInspection.id,
          checklistItemId: item.id,
          checklistItemLabel: item.label,
          title: `Inspection Defect: ${item.label}`,
          description:
            item.notes?.trim() ||
            `Identified during inspection continuation on ${new Date().toISOString().split('T')[0]}. Remediate immediately.`,
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
      }
    });

    const pCount = updatedChecklist.filter((i) => i.status === 'pass').length;
    const aCount = updatedChecklist.filter((i) => i.status === 'needs_attention').length;
    const uCount = updatedChecklist.filter((i) => i.status === 'not_checked').length;
    const evalCount = pCount + aCount;
    const newScore = evalCount > 0 ? Math.round((pCount / evalCount) * 100) : 0;

    let finalStatus: InspectionStatus | 'passed' | 'needs_attention' | 'pending';
    if (!finalize) {
      finalStatus = 'pending';
    } else {
      finalStatus = uCount > 0 ? 'pending' : aCount > 0 ? 'needs_attention' : 'passed';
    }

    updateInspection(continueModalInspection.id, {
      items: updatedChecklist,
      notes: continueNotes.trim() || continueModalInspection.notes,
      passedCount: pCount,
      attentionCount: aCount,
      notCheckedCount: uCount,
      score: newScore,
      status: finalStatus as any,
    });

    setContinueModalInspection(null);
  };

  // Open Verify Modal from inside Inspection
  const handleOpenVerifyModal = (
    insp: Inspection,
    item: ChecklistItem,
    action: SafetyIssue
  ) => {
    setVerifyModalAction({ inspection: insp, item, issue: action });
    setVerifyNote('Remediation verified on site and approved compliant.');
  };

  const handleConfirmVerifyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalAction) return;

    verifySafetyIssue(
      verifyModalAction.issue.id,
      verifyNote.trim() || 'Remediation verified on site and approved compliant.',
      user?.name || 'Marcus Vance'
    );

    setVerifyModalAction(null);
  };

  // Open "Create Action from Reviewed Item / Flag Defect" modal
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
    setCreateTicketImmediately(true);
  };

  // Submit "Create Action / Flag Defect"
  const handleSaveActionForItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createActionModalItem) return;

    const { inspection, item } = createActionModalItem;
    const assignedStaff = staff.find((s) => s.id === actionStaffId) || staff[0];

    let linkedIssueId: string | undefined = item.linkedIssueId;
    let flaggedAsIssue = item.flaggedAsIssue || false;

    if (createTicketImmediately) {
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
      linkedIssueId = newIssue.id;
      flaggedAsIssue = true;
    }

    // Update this item in the inspection: set status to 'needs_attention', update notes, link ticket
    const updatedItems = inspection.items.map((it) =>
      it.id === item.id
        ? {
            ...it,
            status: 'needs_attention' as InspectionStatus,
            notes: actionDescription.trim(),
            linkedIssueId,
            flaggedAsIssue,
          }
        : it
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
        const isIncomplete = isAuditIncomplete(insp);
        const allResolved = areAllDefectsResolved(insp);
        const hasDefects = getInspectionAttentionCount(insp) > 0;

        if (filterStatus === 'pending' && !isIncomplete) return false;
        if (filterStatus === 'passed' && (isIncomplete || hasDefects)) return false;
        if (filterStatus === 'needs_attention' && (isIncomplete || !hasDefects || allResolved)) return false;
        if (filterStatus === 'actions_resolved' && (isIncomplete || !hasDefects || !allResolved)) return false;
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
  }, [inspections, filterBuildingId, filterStatus, filterCategory, searchQuery, issues]);

  // Overall Statistics Derived From Actual Data
  const totalInspectionsCount = inspections.length;
  const pendingInspectionsCount = inspections.filter((i) => isAuditIncomplete(i)).length;
  const attentionInspectionsCount = inspections.filter(
    (i) => !isAuditIncomplete(i) && getInspectionAttentionCount(i) > 0 && !areAllDefectsResolved(i)
  ).length;
  const passedInspectionsCount = inspections.filter(
    (i) => !isAuditIncomplete(i) && getInspectionAttentionCount(i) === 0
  ).length;
  const resolvedInspectionsCount = inspections.filter(
    (i) => !isAuditIncomplete(i) && getInspectionAttentionCount(i) > 0 && areAllDefectsResolved(i)
  ).length;

  const selectedInspection = inspections.find((i) => i.id === selectedInspectionId);

  // Filtered items inside the Review Modal
  const reviewItems = useMemo(() => {
    if (!selectedInspection) return [];
    if (reviewItemFilter === 'pending') {
      return selectedInspection.items.filter((i) => i.status === 'not_checked');
    }
    if (reviewItemFilter === 'active_defects') {
      return selectedInspection.items.filter(
        (i) => i.status === 'needs_attention' && !isItemRemediated(i, selectedInspection.id)
      );
    }
    if (reviewItemFilter === 'remediated') {
      return selectedInspection.items.filter(
        (i) => i.status === 'needs_attention' && isItemRemediated(i, selectedInspection.id)
      );
    }
    if (reviewItemFilter === 'needs_attention') {
      return selectedInspection.items.filter((i) => i.status === 'needs_attention');
    }
    if (reviewItemFilter === 'pass') {
      return selectedInspection.items.filter((i) => i.status === 'pass');
    }
    return selectedInspection.items;
  }, [selectedInspection, reviewItemFilter, issues]);

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
              Create Inspection
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
            <option value="passed">Passed (100% Compliant)</option>
            <option value="needs_attention">Needs Attention (Open Defects)</option>
            <option value="actions_resolved">Actions Resolved (Defects Remediated)</option>
            <option value="pending">Incomplete / Pending Verification</option>
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
              const pass = getInspectionPassedCount(insp);
              const attn = getInspectionAttentionCount(insp);
              const unchk = getInspectionPendingCount(insp);
              const isIncomplete = isAuditIncomplete(insp);
              const allResolved = areAllDefectsResolved(insp);
              const remediatedCount = getInspectionRemediatedCount(insp);
              const activeCount = getInspectionActiveDefectsCount(insp);

              // Dual score calculation
              const historicalScore = insp.score;
              const evalCount = pass + attn;
              const remediatedScore =
                evalCount > 0 ? Math.round(((pass + remediatedCount) / evalCount) * 100) : 0;

              return (
                <div
                  key={insp.id}
                  onClick={() => handleOpenAudit(insp, 'all')}
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
                      {isIncomplete ? (
                        <Badge variant="warning" size="sm">
                          INCOMPLETE ({unchk} PENDING)
                        </Badge>
                      ) : attn > 0 ? (
                        allResolved ? (
                          <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                            ALL DEFICIENCIES REMEDIATED
                          </Badge>
                        ) : (
                          <Badge variant="critical" size="sm">
                            NEEDS ATTENTION ({activeCount} ACTIVE)
                          </Badge>
                        )
                      ) : (
                        <Badge variant="success" size="sm">
                          PASSED
                        </Badge>
                      )}

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
                        {attn > 0 && (
                          allResolved ? (
                            <strong className="text-emerald-700">{attn} Remediated</strong>
                          ) : (
                            <strong className="text-red-600">{activeCount} Defect{activeCount !== 1 ? 's' : ''} Active</strong>
                          )
                        )}
                        {unchk > 0 && <span> &bull; <strong className="text-amber-600">{unchk} Pending Verification</strong></span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-brand-graphite-400 block font-mono">
                        {allResolved && attn > 0 ? 'Remediated Score' : 'Audit Score'}
                      </span>
                      <div className="flex items-baseline md:justify-end gap-1.5 font-mono">
                        <span
                          className={`text-xl font-bold ${
                            remediatedScore >= 90
                              ? 'text-emerald-700'
                              : remediatedScore >= 70
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {allResolved && attn > 0 ? `${remediatedScore}%` : `${historicalScore}%`}
                        </span>
                        {allResolved && attn > 0 && (
                          <span className="text-[11px] text-brand-graphite-400 line-through" title="Historical audit score">
                            {historicalScore}%
                          </span>
                        )}
                      </div>
                      {isIncomplete ? (
                        <span className="text-[10px] text-amber-600 block font-mono">
                          {unchk} unchecked
                        </span>
                      ) : allResolved && attn > 0 ? (
                        <span className="text-[10px] text-emerald-700 block font-mono">
                          all defects closed
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {isIncomplete && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={ClipboardCheck}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartContinueInspection(insp);
                          }}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white border-none font-medium shadow-xs"
                        >
                          Continue Inspection ({unchk})
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAudit(insp, 'all');
                        }}
                      >
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
              icon={Calendar}
              required
            />
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
                          Domain: {(item.category || 'general_safety').replace(/_/g, ' ')}
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
            {(() => {
              const modalPassedCount = getInspectionPassedCount(selectedInspection);
              const modalAttentionCount = getInspectionAttentionCount(selectedInspection);
              const modalNotCheckedCount = getInspectionPendingCount(selectedInspection);
              const modalIsIncomplete = isAuditIncomplete(selectedInspection);
              const modalAllResolved = areAllDefectsResolved(selectedInspection);
              const modalActiveDefects = selectedInspection.items.filter(
                (i) => i.status === 'needs_attention' && !isItemRemediated(i, selectedInspection.id)
              );
              const modalRemediatedDefects = selectedInspection.items.filter(
                (i) => i.status === 'needs_attention' && isItemRemediated(i, selectedInspection.id)
              );
              const modalEvaluatedCount = modalPassedCount + modalAttentionCount;
              const historicalScore = selectedInspection.score;
              const currentRemediatedScore =
                modalEvaluatedCount > 0
                  ? Math.round(((modalPassedCount + modalRemediatedDefects.length) / modalEvaluatedCount) * 100)
                  : 0;

              return (
                <>
                  <div className="p-4 bg-brand-graphite-50 rounded border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-brand-graphite-900">
                          {selectedInspection.buildingName}
                        </span>
                        <span className="text-xs font-mono text-brand-graphite-600 bg-white px-1.5 py-0.5 rounded border border-brand-border">
                          {selectedInspection.floorLabel || 'All Floors / Full Facility'}
                        </span>
                        {modalIsIncomplete ? (
                          <Badge variant="warning" size="sm">
                            INCOMPLETE &bull; PENDING VERIFICATION ({modalNotCheckedCount} UNCHECKED)
                          </Badge>
                        ) : modalAttentionCount > 0 ? (
                          modalAllResolved ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="default" size="sm">
                                AUDIT FINDING: DEFICIENCIES RECORDED
                              </Badge>
                              <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                ALL DEFICIENCIES REMEDIATED
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="critical" size="sm">
                                AUDIT FINDING: NEEDS ATTENTION
                              </Badge>
                              <Badge variant="critical" size="sm">
                                {modalActiveDefects.length} ACTIVE DEFECTS
                              </Badge>
                            </div>
                          )
                        ) : (
                          <Badge variant="success" size="sm">
                            PASSED &bull; 100% COMPLIANT
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-brand-graphite-600 leading-relaxed font-sans">
                        {selectedInspection.notes || 'Inspection findings recorded.'}
                      </p>
                      {modalIsIncomplete && (
                        <p className="text-[11px] font-mono text-amber-800 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Verification in progress: {modalEvaluatedCount} of {selectedInspection.items.length} checklist items verified.
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-mono font-bold text-brand-graphite-400 block">
                        {modalAllResolved && modalAttentionCount > 0 ? 'Remediated Score' : 'Compliance Score'}
                      </span>
                      <div className="flex items-baseline sm:justify-end gap-1.5 font-mono">
                        <span
                          className={`text-2xl font-bold ${
                            (modalAllResolved && modalAttentionCount > 0 ? currentRemediatedScore : historicalScore) >= 90
                              ? 'text-emerald-700'
                              : (modalAllResolved && modalAttentionCount > 0 ? currentRemediatedScore : historicalScore) >= 70
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {modalAllResolved && modalAttentionCount > 0 ? `${currentRemediatedScore}%` : `${historicalScore}%`}
                        </span>
                        {modalAllResolved && modalAttentionCount > 0 && (
                          <span className="text-xs text-brand-graphite-400 line-through" title="Historical audit score">
                            {historicalScore}%
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] block font-mono text-brand-graphite-500">
                        {modalIsIncomplete
                          ? `Evaluated on ${modalEvaluatedCount} of ${selectedInspection.items.length} items checked`
                          : modalAllResolved && modalAttentionCount > 0
                          ? `Historical audit: ${historicalScore}%`
                          : modalAttentionCount > 0
                          ? `${modalActiveDefects.length} active defects pending`
                          : 'Final compliance score'}
                      </span>
                    </div>
                  </div>

                  {/* Context Alert Banners */}
                  {modalIsIncomplete && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 animate-fadeIn">
                      <div className="flex items-start sm:items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span>
                          <strong>Pending Verification:</strong> {modalNotCheckedCount} item(s) have not been checked yet. Complete the remaining items to finish this audit.
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ClipboardCheck}
                        onClick={() => {
                          const cur = selectedInspection;
                          setSelectedInspectionId(null);
                          handleStartContinueInspection(cur);
                        }}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white border-none font-medium shadow-xs"
                      >
                        Continue Inspection ({modalNotCheckedCount}) &rarr;
                      </Button>
                    </div>
                  )}

                  {!modalIsIncomplete && modalAttentionCount > 0 && modalAllResolved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-xs text-emerald-950 animate-fadeIn">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>
                        <strong>All Deficiencies Remediated:</strong> All corrective actions linked to this audit have been verified and signed off. The historical inspection record remains intact for audit compliance.
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Checklist Results Log */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800 font-mono">
                  Itemized Verification Log ({selectedInspection.items.length} items)
                </span>
                <div className="text-[11px] font-mono text-brand-graphite-500">
                  <span className="text-emerald-700 font-bold">
                    {getInspectionPassedCount(selectedInspection)} Pass
                  </span>{' '}
                  &bull;{' '}
                  {getInspectionRemediatedCount(selectedInspection) > 0 ? (
                    <>
                      <span className="text-emerald-700 font-bold">
                        {getInspectionRemediatedCount(selectedInspection)} Remediated
                      </span>
                      {getInspectionActiveDefectsCount(selectedInspection) > 0 && (
                        <>
                          {' '}&bull;{' '}
                          <span className="text-red-600 font-bold">
                            {getInspectionActiveDefectsCount(selectedInspection)} Active Defect{getInspectionActiveDefectsCount(selectedInspection) !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-red-600 font-bold">
                      {getInspectionAttentionCount(selectedInspection)} Attention
                    </span>
                  )}{' '}
                  &bull;{' '}
                  <span className="text-amber-600 font-bold">
                    {getInspectionPendingCount(selectedInspection)} Unchecked
                  </span>
                </div>
              </div>

              {/* Item Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-brand-border/70 pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setReviewItemFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold ${
                    reviewItemFilter === 'all'
                      ? 'bg-brand-graphite-900 text-white'
                      : 'text-brand-graphite-600 hover:bg-brand-graphite-100'
                  }`}
                >
                  All Items ({selectedInspection.items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewItemFilter('pending')}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1 ${
                    reviewItemFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Pending Verification ({getInspectionPendingCount(selectedInspection)})</span>
                </button>

                {getInspectionActiveDefectsCount(selectedInspection) > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewItemFilter('active_defects')}
                    className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1 ${
                      reviewItemFilter === 'active_defects'
                        ? 'bg-brand-red text-white'
                        : 'text-brand-red hover:bg-red-50'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Active Deficiencies ({getInspectionActiveDefectsCount(selectedInspection)})</span>
                  </button>
                )}

                {getInspectionRemediatedCount(selectedInspection) > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewItemFilter('remediated')}
                    className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1 ${
                      reviewItemFilter === 'remediated'
                        ? 'bg-emerald-700 text-white'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Remediated ({getInspectionRemediatedCount(selectedInspection)})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setReviewItemFilter('pass')}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1 ${
                    reviewItemFilter === 'pass'
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Passed ({getInspectionPassedCount(selectedInspection)})</span>
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-brand-border border border-brand-border rounded max-h-[55vh] overflow-y-auto">
                {reviewItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-brand-graphite-500 bg-brand-graphite-50/50">
                    No items in this inspection match the current filter.
                  </div>
                ) : (
                  reviewItems.map((item) => {
                    const originalIdx = selectedInspection.items.findIndex((i) => i.id === item.id);
                    const linkedAction = getLinkedIssue(item, selectedInspection.id);
                    const isVerified = linkedAction && (linkedAction.status === 'verified' || (linkedAction.status === 'resolved' && !!linkedAction.verificationNote));
                    const isResolved = linkedAction && linkedAction.status === 'resolved' && !linkedAction.verificationNote;
                    const isInProgress = linkedAction && linkedAction.status === 'in_progress';

                    return (
                      <div key={item.id} className="p-3.5 text-xs hover:bg-brand-graphite-50/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-brand-graphite-400 flex-shrink-0 mt-0.5">
                                {originalIdx + 1}.
                              </span>
                              <div>
                                <span className="font-semibold text-brand-graphite-900 leading-snug block">
                                  {item.label}
                                </span>
                                <span className="text-[10px] font-mono text-brand-graphite-400 uppercase">
                                  Domain: {(item.category || 'general_safety').replace(/_/g, ' ')}
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

                            {/* Unchecked Item Verification Action Box */}
                            {item.status === 'not_checked' && (
                              <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
                                <span className="text-xs text-amber-950 font-medium flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                  <span>Pending verification check. Record outcome:</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMarkItemPassed(selectedInspection.id, item.id)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Mark Passed</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCreateActionForItem(selectedInspection, item)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded bg-brand-red hover:bg-red-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Flag Defect</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Passed Item Follow-up Indicator */}
                            {item.status === 'pass' && (
                              <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 font-mono">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Verified Compliant
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreateActionForItem(selectedInspection, item)}
                                  className="text-[10px] text-brand-graphite-400 hover:text-brand-red underline"
                                >
                                  Flag Defect
                                </button>
                              </div>
                            )}

                            {/* Linked Action Status or Creation Affordance */}
                            {item.status === 'needs_attention' && (
                              <div className="mt-2.5 pt-2 border-t border-brand-border/60">
                                {linkedAction ? (
                                  <div
                                    className={`p-2.5 rounded border space-y-1.5 ${
                                      isVerified
                                        ? 'bg-emerald-50/80 border-emerald-300'
                                        : isResolved
                                        ? 'bg-amber-50/80 border-amber-300'
                                        : isInProgress
                                        ? 'bg-blue-50/80 border-blue-300'
                                        : 'bg-red-50/80 border-red-300'
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-graphite-900">
                                        <ShieldCheck
                                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                                            isVerified ? 'text-emerald-700' : isResolved ? 'text-amber-700' : 'text-brand-red'
                                          }`}
                                        />
                                        <span>
                                          Corrective Action <strong>{linkedAction.code}</strong>: Assigned to{' '}
                                          <strong>{linkedAction.assignedToName}</strong>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={isVerified ? 'success' : isResolved ? 'warning' : isInProgress ? 'warning' : 'critical'}
                                          size="sm"
                                        >
                                          {isVerified
                                            ? 'STATUS: VERIFIED & CLOSED'
                                            : isResolved
                                            ? 'STATUS: RESOLVED (AWAITING SIGN-OFF)'
                                            : `ACTION: ${(linkedAction.status || 'open').replace('_', ' ').toUpperCase()}`}
                                        </Badge>
                                        {/* Inline Administrator Sign-Off Button */}
                                        {(isResolved || linkedAction.status === 'resolved') && !isVerified && (isAdmin || user?.role === 'safety_officer') && (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenVerifyModal(selectedInspection, item, linkedAction)}
                                            className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                                          >
                                            <Check className="w-3 h-3" />
                                            <span>Verify & Sign Off</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Resolution note from worker */}
                                    {linkedAction.resolutionNote && (
                                      <div className="text-[11px] text-brand-graphite-800 bg-white/80 p-2 rounded border border-brand-border">
                                        <span className="font-bold text-brand-graphite-900">Remediation Completed:</span>{' '}
                                        {linkedAction.resolutionNote}
                                        {linkedAction.resolvedBy && (
                                          <span className="block text-[10px] text-brand-graphite-500 font-mono mt-0.5">
                                            Submitted by {linkedAction.resolvedBy} on{' '}
                                            {linkedAction.resolvedAt ? formatDateString(linkedAction.resolvedAt) : 'Recently'}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Verification note from safety officer */}
                                    {isVerified && (
                                      <div className="text-[11px] text-emerald-950 bg-emerald-100/60 p-2 rounded border border-emerald-300">
                                        <span className="font-bold text-emerald-900">Official Verification & Sign-off:</span>{' '}
                                        {linkedAction.verificationNote || 'Remediation inspected on site and verified operational.'}
                                        {linkedAction.verifiedBy && (
                                          <span className="block text-[10px] text-emerald-800 font-mono mt-0.5">
                                            Signed off by {linkedAction.verifiedBy} on{' '}
                                            {linkedAction.verifiedAt ? formatDateString(linkedAction.verifiedAt) : 'Recently'}
                                          </span>
                                        )}
                                      </div>
                                    )}
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
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {item.status === 'pass' ? (
                              <Badge variant="success" size="sm">
                                PASS
                              </Badge>
                            ) : item.status === 'not_checked' ? (
                              <Badge variant="warning" size="sm">
                                NOT CHECKED
                              </Badge>
                            ) : isVerified ? (
                              <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                                <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                                RESOLVED & VERIFIED
                              </Badge>
                            ) : isResolved ? (
                              <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-900 border-amber-300 font-semibold">
                                <Clock className="w-3 h-3 mr-1 inline" />
                                AWAITING VERIFICATION
                              </Badge>
                            ) : isInProgress ? (
                              <Badge variant="warning" size="sm" className="bg-blue-100 text-blue-900 border-blue-300 font-semibold">
                                IN PROGRESS
                              </Badge>
                            ) : (
                              <Badge variant="critical" size="sm">
                                ATTENTION
                              </Badge>
                            )}
                            {item.status === 'needs_attention' && (
                              <span className="text-[10px] font-mono text-brand-graphite-400">
                                Audit Finding: Defect
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono text-brand-graphite-400">
                Audit Record ID: {selectedInspection.id}
              </span>
              <div className="flex items-center gap-2">
                {isAuditIncomplete(selectedInspection) && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={ClipboardCheck}
                    onClick={() => {
                      const cur = selectedInspection;
                      setSelectedInspectionId(null);
                      handleStartContinueInspection(cur);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white border-none text-xs"
                  >
                    Continue Inspection ({getInspectionPendingCount(selectedInspection)} unchecked)
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedInspectionId(null)}>
                  Close Audit View
                </Button>
              </div>
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

            {/* Immediate ticket toggle */}
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
              <label className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createTicketImmediately}
                  onChange={(e) => setCreateTicketImmediately(e.target.checked)}
                  className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                />
                <span>Generate tracked Corrective Action ticket immediately</span>
              </label>
              <p className="text-[11px] text-brand-graphite-500 mt-1 pl-6">
                {createTicketImmediately
                  ? 'Assigns this defect to facilities personnel and tracks remediation through to closure.'
                  : 'Records this defect in the audit register. A ticket can be assigned later.'}
              </p>
            </div>

            {createTicketImmediately && (
              <>
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
                  icon={Calendar}
                  required
                />
              </>
            )}

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
                {createTicketImmediately ? 'Assign & Create Action' : 'Save Deficiency Finding'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Continue Inspection Runner Modal */}
      {continueModalInspection && (
        <Modal
          isOpen={!!continueModalInspection}
          onClose={() => setContinueModalInspection(null)}
          title={`Continue Inspection: ${continueModalInspection.buildingName}`}
          description={`Resume verification for ${continueModalInspection.floorLabel || 'Full Facility'} &bull; Started by ${continueModalInspection.inspectorName} on ${formatDateString(continueModalInspection.date)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Verification Progress Tracker */}
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-brand-graphite-900 block">
                  Checklist Verification Progress
                </span>
                <span className="text-brand-graphite-500 font-mono text-[11px]">
                  {continueChecklist.filter((i) => i.status !== 'not_checked').length} of {continueChecklist.length} items checked
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-emerald-700 font-bold">
                  {continueChecklist.filter((i) => i.status === 'pass').length} Pass
                </span>
                <span>&bull;</span>
                <span className="text-brand-red font-bold">
                  {continueChecklist.filter((i) => i.status === 'needs_attention').length} Attention
                </span>
                <span>&bull;</span>
                <span className="text-amber-700 font-bold">
                  {continueChecklist.filter((i) => i.status === 'not_checked').length} Unchecked
                </span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3 divide-y divide-brand-border border border-brand-border rounded p-3 bg-white max-h-[50vh] overflow-y-auto">
              {continueChecklist.map((item, idx) => {
                const actionCfg = continueActionConfigs[item.id];
                const alreadyLinked = !!item.linkedIssueId;

                return (
                  <div key={item.id} className={`${idx !== 0 ? 'pt-3' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-brand-graphite-900 leading-snug block">
                          {idx + 1}. {item.label}
                        </span>
                        <span className="text-[10px] font-mono text-brand-graphite-500 uppercase mt-0.5 block">
                          Domain: {(item.category || 'general_safety').replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* 3 Status Radios */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleContinueStatusChange(item.id, 'pass')}
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
                          onClick={() => handleContinueStatusChange(item.id, 'needs_attention')}
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
                          onClick={() => handleContinueStatusChange(item.id, 'not_checked')}
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

                    {/* Defect Observation & Action Config */}
                    {item.status === 'needs_attention' && (
                      <div className="mt-2.5 p-3 bg-red-50/70 border border-red-200 rounded space-y-2.5 animate-fadeIn">
                        <div>
                          <label className="text-[11px] font-bold text-red-950 block mb-1">
                            Deficiency Observation & Finding Notes:
                          </label>
                          <input
                            type="text"
                            placeholder="Detail observation..."
                            value={item.notes || ''}
                            onChange={(e) => handleContinueItemNoteChange(item.id, e.target.value)}
                            className="w-full text-xs p-1.5 rounded border border-red-300 bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red"
                          />
                        </div>

                        {!alreadyLinked && (
                          <div className="pt-2 border-t border-red-200/60">
                            <label className="flex items-center gap-2 text-xs font-semibold text-red-900 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={!!actionCfg?.enabled}
                                onChange={(e) => handleContinueActionToggle(item.id, e.target.checked)}
                                className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                              />
                              <span>Create Corrective Action ticket for this deficiency</span>
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
                                      handleContinueActionConfigChange(item.id, 'priority', e.target.value)
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
                                      handleContinueActionConfigChange(item.id, 'assignedStaffId', e.target.value)
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
                                      handleContinueActionConfigChange(item.id, 'dueDate', e.target.value)
                                    }
                                    className="w-full text-xs p-1 border border-brand-border rounded bg-white"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Inspector Notes */}
            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Overall Audit Summary Notes
              </label>
              <textarea
                rows={2}
                value={continueNotes}
                onChange={(e) => setContinueNotes(e.target.value)}
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setContinueModalInspection(null)}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveContinueProgress(false)}
                >
                  Save Progress (Draft / In-Progress)
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={ClipboardCheck}
                  onClick={() => handleSaveContinueProgress(true)}
                >
                  Complete & Finalize Inspection
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Inline Administrator Verification Sign-Off Modal */}
      {verifyModalAction && (
        <Modal
          isOpen={!!verifyModalAction}
          onClose={() => setVerifyModalAction(null)}
          title={`Verify Remediation: ${verifyModalAction.issue.code}`}
          description={`Sign off on verified corrective repair for "${verifyModalAction.item.label}"`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmVerifyAction} className="space-y-3.5">
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border space-y-1.5 text-xs">
              <div>
                <span className="font-mono text-brand-graphite-500 uppercase text-[10px] block">Facility</span>
                <span className="font-semibold text-brand-graphite-900">
                  {verifyModalAction.inspection.buildingName} ({verifyModalAction.inspection.floorLabel || 'General'})
                </span>
              </div>
              <div>
                <span className="font-mono text-brand-graphite-500 uppercase text-[10px] block">Defect</span>
                <span className="text-brand-graphite-800">{verifyModalAction.item.label}</span>
              </div>
              {verifyModalAction.issue.resolutionNote && (
                <div className="pt-1.5 border-t border-brand-border">
                  <span className="font-mono text-brand-graphite-500 uppercase text-[10px] block">Worker Resolution Report</span>
                  <p className="text-brand-graphite-900 italic font-sans">{verifyModalAction.issue.resolutionNote}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
                Administrator Sign-Off & Verification Note
              </label>
              <textarea
                rows={3}
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                required
                placeholder="Detail physical inspection observations, compliance confirmation, and approval..."
                className="w-full text-xs p-2 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVerifyModalAction(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={ShieldCheck}>
                Sign Off & Close Remediation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
