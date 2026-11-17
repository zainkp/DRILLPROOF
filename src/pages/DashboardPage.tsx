import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Building2,
  ClipboardCheck,
  Flame,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  formatDateString,
  formatSecondsToTime,
  formatPriority,
  formatActionStatus,
} from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const {
    institution,
    buildings,
    inspections,
    drills,
    issues,
    activities,
    readinessSummary,
  } = useData();

  const navigate = useNavigate();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const pendingInspections = inspections.filter(
    (i) => i.status === 'needs_attention' || i.status === 'pending'
  );
  const openIssues = issues.filter((i) => i.status !== 'resolved');
  const recentDrills = drills.slice(0, 3);
  const completedDrills = drills.filter((d) => d.status === 'completed');

  return (
    <div>
      <PageHeader
        title="Institutional Readiness Operations"
        description={`${institution.name} — Real-time emergency readiness posture across registered campus facilities.`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/drills">
              <Button size="sm" variant="primary" icon={Flame}>
                Launch Mock Drill
              </Button>
            </Link>
            <Link to="/inspections">
              <Button size="sm" variant="outline" icon={ClipboardCheck}>
                New Inspection
              </Button>
            </Link>
          </div>
        }
      />

      {/* Honest Demo Notice Banner */}
      <div className="mb-6 p-3 bg-brand-graphite-100/70 border border-brand-border rounded flex items-center justify-between text-xs text-brand-graphite-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span>
            <strong>Operational Prototype:</strong> Data reflects simulated facility records for Northstar Campus. Check-ins and checklists are manually verifiable.
          </span>
        </div>
        <button
          onClick={() => setShowFormulaModal(!showFormulaModal)}
          className="text-brand-graphite-700 hover:text-brand-red font-medium underline flex items-center gap-1 flex-shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Readiness Score Formula</span>
        </button>
      </div>

      {/* Readiness Formula Tooltip Card */}
      {showFormulaModal && (
        <div className="mb-6 p-4 bg-white border border-brand-red/30 rounded shadow-xs text-xs text-brand-graphite-700">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-brand-graphite-900 uppercase font-mono tracking-wider">
              Illustrative Readiness Score Methodology
            </span>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-brand-graphite-400 hover:text-brand-graphite-700"
            >
              &times;
            </button>
          </div>
          <p className="mb-2">
            The readiness metric is a weighted composite score designed to encourage proactive inspection and issue closure:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-brand-graphite-600">
            <li>Base Score: 100%</li>
            <li>Deduction: -8% per unresolved High/Critical Corrective Action</li>
            <li>Deduction: -3% per Medium/Low Open Issue</li>
            <li>Deduction: -4% per Overdue or Needs-Attention Inspection Checklist</li>
            <li>Current Campus Composite Score: <strong>{readinessSummary.overallReadinessScore}%</strong></li>
          </ul>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Buildings Registered */}
        <div className="bg-white border border-brand-border rounded p-5 shadow-xs">
          <div className="flex items-center justify-between text-brand-graphite-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Registered Facilities
            </span>
            <Building2 className="w-4 h-4 text-brand-graphite-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-brand-graphite-900">
              {readinessSummary.registeredBuildingsCount}
            </span>
            <span className="text-xs text-brand-graphite-500">
              ({readinessSummary.totalFloorsCount} total floors)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-[11px]">
            <span className="text-brand-graphite-500">100% digital QR active</span>
            <Link to="/buildings" className="text-brand-red font-semibold hover:underline">
              View All &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Inspections */}
        <div className="bg-white border border-brand-border rounded p-5 shadow-xs">
          <div className="flex items-center justify-between text-brand-graphite-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Inspections Due / Flagged
            </span>
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-brand-graphite-900">
              {readinessSummary.pendingInspectionsCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">Needs Attention</span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-[11px]">
            <span className="text-brand-graphite-500">{inspections.length} total logged</span>
            <Link to="/inspections" className="text-brand-red font-semibold hover:underline">
              Run Audit &rarr;
            </Link>
          </div>
        </div>

        {/* Drills Completed */}
        <div className="bg-white border border-brand-border rounded p-5 shadow-xs">
          <div className="flex items-center justify-between text-brand-graphite-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Drills
            </span>
            <Flame className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-brand-graphite-900">
              {readinessSummary.completedDrillsCount}
            </span>
            <span className="text-xs text-brand-graphite-500">
              ({readinessSummary.plannedDrillsCount} scheduled)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-[11px]">
            <span className="text-brand-graphite-500">Avg evacuation: 4m 37s</span>
            <Link to="/drills" className="text-brand-red font-semibold hover:underline">
              Drill Logs &rarr;
            </Link>
          </div>
        </div>

        {/* Outstanding Corrective Actions */}
        <div className="bg-white border border-brand-border rounded p-5 shadow-xs">
          <div className="flex items-center justify-between text-brand-graphite-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Open Corrective Actions
            </span>
            <AlertTriangle className="w-4 h-4 text-brand-red" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-brand-red">
              {readinessSummary.openIssuesCount}
            </span>
            <span className="text-xs text-red-600 font-medium">
              ({readinessSummary.criticalIssuesCount} High/Critical)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-[11px]">
            <span className="text-brand-graphite-500">Assigned to Facilities</span>
            <Link to="/issues" className="text-brand-red font-semibold hover:underline">
              Resolve Issues &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Buildings Readiness Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-brand-graphite-900 tracking-tight uppercase font-mono">
              Campus Facilities & Readiness Posture
            </h2>
            <p className="text-xs text-brand-graphite-500">
              Physical buildings registered under Northstar Campus emergency response oversight.
            </p>
          </div>
          <Link
            to="/buildings"
            className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
          >
            <span>Manage All Buildings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-brand-border rounded p-5 shadow-xs flex flex-col justify-between hover:border-brand-graphite-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-brand-graphite-600 bg-brand-graphite-100 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-brand-graphite-400">
                      Readiness:
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        b.readinessScore >= 85
                          ? 'text-emerald-700'
                          : b.readinessScore >= 75
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {b.readinessScore}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-brand-graphite-900 mb-1">
                  {b.name}
                </h3>
                <p className="text-xs text-brand-graphite-500 mb-3">{b.address}</p>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-brand-border/70 text-brand-graphite-600 mb-4">
                  <div>
                    <span className="text-brand-graphite-400 block text-[10px] uppercase">
                      Total Floors
                    </span>
                    <span className="font-bold text-brand-graphite-800">{b.totalFloors} Levels</span>
                  </div>
                  <div>
                    <span className="text-brand-graphite-400 block text-[10px] uppercase">
                      Capacity
                    </span>
                    <span className="font-bold text-brand-graphite-800">{b.occupancyCapacity} Max</span>
                  </div>
                  <div>
                    <span className="text-brand-graphite-400 block text-[10px] uppercase">
                      Last Mock Drill
                    </span>
                    <span className="font-semibold text-brand-graphite-800">
                      {b.lastDrillDate ? formatDateString(b.lastDrillDate) : 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-graphite-400 block text-[10px] uppercase">
                      Active Issues
                    </span>
                    <span
                      className={`font-bold ${
                        b.activeIssuesCount > 0 ? 'text-brand-red' : 'text-emerald-600'
                      }`}
                    >
                      {b.activeIssuesCount} open
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Link
                  to={`/buildings/${b.id}`}
                  className="text-xs font-semibold text-brand-graphite-800 hover:text-brand-red inline-flex items-center gap-1"
                >
                  <span>Building Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <Link
                  to={`/building/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-brand-graphite-500 hover:text-brand-red inline-flex items-center gap-1 bg-brand-graphite-50 px-2 py-1 rounded border border-brand-border"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Public QR</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Operations Layout: Left = Drills & Inspections, Right = Issues & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Drills & Scheduled Activity */}
        <div className="space-y-6">
          {/* Drills Section */}
          <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-graphite-50/50">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-orange" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                  Mock Drill Performance & Schedule
                </h3>
              </div>
              <Link to="/drills" className="text-xs text-brand-red font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-brand-border">
              {recentDrills.map((drill) => (
                <div key={drill.id} className="p-4 hover:bg-brand-graphite-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-brand-graphite-500 uppercase mr-2">
                        {drill.code}
                      </span>
                      <span className="text-xs font-bold text-brand-graphite-900">
                        {drill.title}
                      </span>
                    </div>
                    <Badge
                      variant={
                        drill.status === 'completed'
                          ? 'success'
                          : drill.status === 'in_progress'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {drill.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-brand-graphite-500 mb-2 leading-relaxed">
                    {drill.scenarioNotes}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-brand-graphite-500">
                    <div className="flex items-center gap-3">
                      <span>Target: {formatSecondsToTime(drill.targetDurationSeconds)}</span>
                      {drill.durationSeconds && (
                        <span className="font-semibold text-brand-graphite-800">
                          Actual: {formatSecondsToTime(drill.durationSeconds)}
                        </span>
                      )}
                      <span>
                        Accounted: {drill.participantsAccountedFor}/{drill.participantsExpected}
                      </span>
                    </div>
                    <Link
                      to={`/drills/${drill.id}`}
                      className="text-brand-red font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Open Drill &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Inspection Checklists */}
          <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-graphite-50/50">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                  Recent Facility Inspections
                </h3>
              </div>
              <Link to="/inspections" className="text-xs text-brand-red font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-brand-border">
              {inspections.slice(0, 3).map((insp) => (
                <div key={insp.id} className="p-4 hover:bg-brand-graphite-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-brand-graphite-900">
                      {insp.buildingName}
                    </span>
                    <Badge
                      variant={insp.status === 'passed' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {insp.status === 'passed' ? 'PASSED (100%)' : `NEEDS ATTENTION (${insp.score}%)`}
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-graphite-500 mb-1.5">{insp.notes}</p>
                  <div className="flex items-center justify-between text-[11px] text-brand-graphite-400">
                    <span>Inspector: {insp.inspectorName}</span>
                    <span>{formatDateString(insp.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Outstanding Safety Issues & Activity Feed */}
        <div className="space-y-6">
          {/* Outstanding Safety Issues */}
          <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-graphite-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                  Corrective Actions Requiring Resolution
                </h3>
              </div>
              <Link to="/issues" className="text-xs text-brand-red font-semibold hover:underline">
                View All ({openIssues.length})
              </Link>
            </div>

            <div className="divide-y divide-brand-border">
              {openIssues.length === 0 ? (
                <div className="p-6 text-center text-xs text-brand-graphite-500">
                  No open corrective actions. Campus equipment & egress clear.
                </div>
              ) : (
                openIssues.slice(0, 4).map((issue) => {
                  const p = formatPriority(issue.priority);
                  const st = formatActionStatus(issue.status);
                  return (
                    <div
                      key={issue.id}
                      className="p-4 hover:bg-brand-graphite-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1">
                          <span className="font-mono text-[10px] font-bold text-brand-graphite-500 mr-2">
                            {issue.code}
                          </span>
                          <span className="text-xs font-bold text-brand-graphite-900">
                            {issue.title}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${p.bg} ${p.border}`}>
                          {p.label}
                        </span>
                      </div>
                      <p className="text-xs text-brand-graphite-500 mb-2 leading-relaxed">
                        {issue.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-brand-graphite-500">
                        <span>Assigned: {issue.assignedToName}</span>
                        <span className="font-mono text-red-600">Due: {issue.dueDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Institutional Activity Stream */}
          <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-graphite-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-graphite-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                  Recent Institutional Activity
                </h3>
              </div>
              <span className="text-[11px] text-brand-graphite-400 font-mono">Live Feed</span>
            </div>

            <div className="divide-y divide-brand-border">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="p-3.5 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-graphite-900 truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-brand-graphite-400 font-mono">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-brand-graphite-500 text-[11px] mt-0.5">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-brand-graphite-400 mt-1 block">
                      Actor: {act.actorName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
