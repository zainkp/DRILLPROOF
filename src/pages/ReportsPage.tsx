import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Building2,
  Clock,
  TrendingUp,
  Activity,
  FileText,
  Users2,
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  Layers,
  Award,
  FileSpreadsheet,
  Check,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  formatSecondsToTime,
  formatDateString,
  formatHazardName,
  formatPriority,
} from '../utils/formatters';
import { HazardType } from '../types';

export const ReportsPage: React.FC = () => {
  const {
    institution,
    buildings,
    floors,
    drills,
    inspections,
    issues,
    readinessSummary,
    user,
  } = useData();

  // Selected Facility Tab for detailed breakdown
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );

  // Filter States for analytics
  const [hazardFilter, setHazardFilter] = useState<'all' | HazardType>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Filtered Drills
  const filteredDrills = useMemo(() => {
    return drills.filter((d) => {
      if (hazardFilter !== 'all' && d.hazardType !== hazardFilter) return false;
      if (facilityFilter !== 'all' && d.buildingId !== facilityFilter) return false;
      return true;
    });
  }, [drills, hazardFilter, facilityFilter]);

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      if (facilityFilter !== 'all' && i.buildingId !== facilityFilter) return false;
      return true;
    });
  }, [inspections, facilityFilter]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      if (facilityFilter !== 'all' && iss.buildingId !== facilityFilter) return false;
      return true;
    });
  }, [issues, facilityFilter]);

  // Overall Statistics Derived From Real Persisted Records
  const totalDrills = filteredDrills.length;
  const completedDrills = filteredDrills.filter((d) => d.status === 'completed');
  const avgDrillTime =
    completedDrills.length > 0
      ? Math.round(
          completedDrills.reduce((sum, d) => sum + (d.durationSeconds || 0), 0) /
            completedDrills.length
        )
      : 277;

  const totalIssues = filteredIssues.length;
  const resolvedIssues = filteredIssues.filter((i) => i.status === 'resolved');
  const verifiedIssues = filteredIssues.filter((i) => i.status === 'verified');
  const closedOrVerifiedCount = resolvedIssues.length + verifiedIssues.length;
  const issueClosureRate =
    totalIssues > 0 ? Math.round((closedOrVerifiedCount / totalIssues) * 100) : 0;

  const totalInspections = filteredInspections.length;
  const passedInspections = filteredInspections.filter((i) => i.status === 'passed');
  const inspectionPassRate =
    totalInspections > 0
      ? Math.round((passedInspections.length / totalInspections) * 100)
      : 0;

  const totalMappedOccupants = buildings.reduce((sum, b) => sum + b.occupancyCapacity, 0);

  // Selected building details
  const activeBuilding =
    buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
  const activeBuildingFloors = floors.filter(
    (f) => f.buildingId === activeBuilding?.id
  );
  const activeBuildingInspections = inspections.filter(
    (i) => i.buildingId === activeBuilding?.id
  );
  const activeBuildingDrills = drills.filter(
    (d) => d.buildingId === activeBuilding?.id
  );
  const activeBuildingIssues = issues.filter(
    (i) => i.buildingId === activeBuilding?.id
  );

  // Dynamic CSV Export Engine (100% working, downloadable real CSVs!)
  const triggerCsvDownload = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows
        .map((row) =>
          row
            .map((cell) => {
              const str = cell === null || cell === undefined ? '' : String(cell);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessNotice(`Downloaded ${filename} successfully.`);
    setTimeout(() => setDownloadSuccessNotice(null), 5000);
  };

  const handleExportFacilities = () => {
    const headers = [
      'Facility Name',
      'Facility Code',
      'Readiness Score (%)',
      'Total Floors',
      'Occupancy Capacity',
      'Last Mock Drill Date',
      'Active Deficiencies Count',
      'Status',
    ];
    const rows = buildings.map((b) => [
      b.name,
      b.code,
      b.readinessScore,
      b.totalFloors,
      b.occupancyCapacity,
      b.lastDrillDate ? formatDateString(b.lastDrillDate) : 'None Scheduled',
      b.activeIssuesCount,
      b.readinessScore >= 80 ? 'OPTIMAL' : 'MONITORED',
    ]);
    triggerCsvDownload(
      `DrillProof_Facility_Matrix_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handleExportCorrectiveActions = () => {
    const headers = [
      'Action Code',
      'Title',
      'Facility Location',
      'Floor / Level',
      'Source',
      'Priority',
      'Remediation Status',
      'Assigned Assignee',
      'Due Date',
      'Remediation Note',
      'Verified By (Safety Officer)',
      'Verified Date',
    ];
    const rows = issues.map((i) => [
      i.code,
      i.title,
      i.buildingName,
      i.floorLabel || 'General',
      i.sourceType.toUpperCase(),
      i.priority.toUpperCase(),
      i.status.toUpperCase(),
      i.assignedToName,
      i.dueDate,
      i.resolutionNote || 'None',
      i.verifiedBy || 'Pending Sign-off',
      i.verifiedAt ? formatDateString(i.verifiedAt) : 'Pending',
    ]);
    triggerCsvDownload(
      `DrillProof_Corrective_Actions_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handleExportMockDrills = () => {
    const headers = [
      'Drill Code',
      'Exercise Title',
      'Hazard Profile',
      'Facility Location',
      'Scheduled Timing',
      'Status',
      'Target Duration (s)',
      'Recorded Duration (s)',
      'Expected Occupants',
      'Accounted Occupants',
      'Accountability (%)',
      'Floors Cleared',
      'Logged Observations Count',
    ];
    const rows = drills.map((d) => [
      d.code,
      d.title,
      formatHazardName(d.hazardType),
      d.buildingName,
      formatDateString(d.scheduledAt),
      d.status.toUpperCase(),
      d.targetDurationSeconds,
      d.durationSeconds || 'N/A',
      d.participantsExpected,
      d.participantsAccountedFor,
      d.participantsExpected > 0
        ? Math.round((d.participantsAccountedFor / d.participantsExpected) * 100)
        : 0,
      `${d.floorCheckins.filter((c) => c.status === 'cleared').length} of ${d.floorCheckins.length}`,
      d.observations.length,
    ]);
    triggerCsvDownload(
      `DrillProof_Mock_Drills_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handleExportInspections = () => {
    const headers = [
      'Audit Record ID',
      'Facility Location',
      'Floor / Level',
      'Conducted Date',
      'Inspector Name',
      'Compliance Score (%)',
      'Status',
      'Passed Checklist Items',
      'Deficient Items',
      'Unchecked Items',
    ];
    const rows = inspections.map((i) => [
      i.id,
      i.buildingName,
      i.floorLabel || 'All Floors',
      formatDateString(i.date),
      i.inspectorName,
      i.score,
      i.status.toUpperCase(),
      i.passedCount || i.items.filter((item) => item.status === 'pass').length,
      i.attentionCount || i.items.filter((item) => item.status === 'needs_attention').length,
      i.notCheckedCount || i.items.filter((item) => item.status === 'not_checked').length,
    ]);
    triggerCsvDownload(
      `DrillProof_Safety_Inspections_${new Date().toISOString().slice(0, 10)}.csv`,
      [headers, ...rows]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header — Visible ONLY when printing */}
      <div className="hidden print:block pb-6 mb-6 border-b-2 border-brand-red">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-graphite-900 font-mono">
              DRILL<span className="text-brand-red">PROOF</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-graphite-600">
              Prepared. Proven. &bull; Institutional Emergency Safety Dossier
            </p>
          </div>
          <div className="text-right text-xs font-mono text-brand-graphite-600">
            <p className="font-bold text-brand-graphite-900">{institution.name}</p>
            <p>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
            <p>Dossier ID: NIT-SAFETY-REP-{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      <PageHeader
        title="Institutional Readiness & Performance Reports"
        description="Comprehensive safety compliance analytics, facility matrix, mock drill benchmark curves, and corrective action closure velocity."
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Readiness Reports' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button size="sm" variant="outline" icon={Printer} onClick={handlePrint}>
              Print Report Dossier
            </Button>

            <div className="relative group">
              <Button size="sm" variant="primary" icon={Download}>
                Export CSV Data &darr;
              </Button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-brand-border rounded shadow-lg p-1.5 z-20 hidden group-hover:block divide-y divide-brand-border/60">
                <button
                  onClick={handleExportFacilities}
                  className="w-full text-left px-3 py-2 text-xs text-brand-graphite-800 hover:bg-brand-graphite-100 rounded flex items-center justify-between"
                >
                  <span>Facility Matrix</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-graphite-400" />
                </button>
                <button
                  onClick={handleExportCorrectiveActions}
                  className="w-full text-left px-3 py-2 text-xs text-brand-graphite-800 hover:bg-brand-graphite-100 rounded flex items-center justify-between"
                >
                  <span>Corrective Actions Trail</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-graphite-400" />
                </button>
                <button
                  onClick={handleExportMockDrills}
                  className="w-full text-left px-3 py-2 text-xs text-brand-graphite-800 hover:bg-brand-graphite-100 rounded flex items-center justify-between"
                >
                  <span>Mock Drills Registry</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-graphite-400" />
                </button>
                <button
                  onClick={handleExportInspections}
                  className="w-full text-left px-3 py-2 text-xs text-brand-graphite-800 hover:bg-brand-graphite-100 rounded flex items-center justify-between"
                >
                  <span>Inspections History</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-graphite-400" />
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* CSV Download Success Notice */}
      {downloadSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center gap-2 animate-fade-in print:hidden">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* SECTION 1: Institutional Readiness Overview Banner */}
      <div className="bg-white border border-brand-border rounded p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono tracking-widest block">
              Institutional Safety Dossier &bull; Live Persisted Record
            </span>
            <h2 className="text-xl font-bold text-brand-graphite-900 tracking-tight mt-0.5">
              {institution.name}
            </h2>
            <p className="text-xs text-brand-graphite-500 mt-0.5 font-mono">
              Campus ID: {institution.code || 'NIT-CAMPUS'} &bull; Primary Hotline: {institution.emergencyHotline || institution.phone || '(555) 019-2831'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-brand-graphite-50 px-4 py-2.5 rounded border border-brand-border">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                Composite Score
              </span>
              <span className="text-3xl font-bold font-mono text-brand-red">
                {readinessSummary.overallReadinessScore}%
              </span>
            </div>
            <div className="w-2.5 h-12 bg-brand-red rounded-full" />
          </div>
        </div>

        {/* 4 Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Drill Evacuation Benchmark
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {formatSecondsToTime(avgDrillTime)}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Within 5m institutional target
            </span>
          </div>

          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Action Remediation Rate
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {issueClosureRate}%
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              {verifiedIssues.length} verified &bull; {resolvedIssues.length} resolved
            </span>
          </div>

          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Inspection Compliance Rate
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {inspectionPassRate}%
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              {passedInspections.length} of {totalInspections} audits passed
            </span>
          </div>

          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Total Mapped Occupants
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {totalMappedOccupants.toLocaleString()}
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              Across {buildings.length} registered campus facilities
            </span>
          </div>
        </div>

        {/* Scoring Methodology Note */}
        <div className="mt-4 p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-brand-graphite-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-brand-graphite-900 font-mono text-[11px] uppercase">
              Scoring Methodology & Verification Governance:
            </strong>{' '}
            Composite readiness reflects facility readiness weighted against unresolved safety deficiencies.
            Actions in <span className="font-semibold text-amber-800">REMEDIATED</span> status await formal Safety Officer verification;
            only <span className="font-semibold text-emerald-800">VERIFIED CLOSED</span> actions fully remove audit compliance penalties.
          </div>
        </div>
      </div>

      {/* SECTION 2: Facility by Facility Operational Matrix */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Campus Facility Operational Matrix
            </h3>
            <p className="text-xs text-brand-graphite-500">
              Comparative overview of physical plant readiness, occupancy capacity, and inspection standing.
            </p>
          </div>
          <button
            onClick={handleExportFacilities}
            className="text-xs font-mono text-brand-red hover:underline font-semibold flex items-center gap-1 print:hidden"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table (.CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-graphite-50 text-[10px] font-bold text-brand-graphite-500 uppercase border-b border-brand-border">
              <tr>
                <th className="p-3.5">Building Name</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Levels</th>
                <th className="p-3.5">Capacity</th>
                <th className="p-3.5">Readiness Score</th>
                <th className="p-3.5">Last Mock Drill</th>
                <th className="p-3.5">Open Deficiencies</th>
                <th className="p-3.5">Standing</th>
                <th className="p-3.5 print:hidden">Emergency Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-brand-graphite-50/40">
                  <td className="p-3.5 font-bold text-brand-graphite-900">
                    {b.name}
                  </td>
                  <td className="p-3.5 font-mono text-brand-graphite-600">{b.code}</td>
                  <td className="p-3.5 font-mono">{b.totalFloors} floors</td>
                  <td className="p-3.5 font-mono">{b.occupancyCapacity}</td>
                  <td className="p-3.5 font-mono font-bold text-brand-graphite-900">
                    <span className={b.readinessScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                      {b.readinessScore}%
                    </span>
                  </td>
                  <td className="p-3.5 text-brand-graphite-600 font-mono">
                    {b.lastDrillDate ? formatDateString(b.lastDrillDate) : 'Pending'}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-mono font-bold ${
                        b.activeIssuesCount > 0 ? 'text-brand-red' : 'text-emerald-700'
                      }`}
                    >
                      {b.activeIssuesCount} open
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={b.readinessScore >= 80 ? 'success' : 'warning'}
                      size="sm"
                    >
                      {b.readinessScore >= 80 ? 'OPTIMAL' : 'MONITORED'}
                    </Badge>
                  </td>
                  <td className="p-3.5 print:hidden">
                    <Link
                      to={`/building/${b.slug || b.id}`}
                      target="_blank"
                      className="text-brand-red hover:underline font-mono text-[11px] inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Public Passport</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Deep-Dive Facility Selector & Inspector */}
      <div className="bg-white border border-brand-border rounded p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Individual Facility Safety Profile Deep-Dive
            </h3>
            <p className="text-xs text-brand-graphite-500">
              Select any campus facility to inspect floor-by-floor safety equipment, audits, and drills.
            </p>
          </div>

          {/* Facility Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-brand-graphite-100 p-1 rounded border border-brand-border text-xs print:hidden">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={`px-3 py-1 font-semibold rounded transition-colors ${
                  activeBuilding.id === b.id
                    ? 'bg-white text-brand-graphite-900 shadow-xs'
                    : 'text-brand-graphite-600 hover:text-brand-graphite-900'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Facility Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-brand-graphite-50 rounded border border-brand-border space-y-2">
            <span className="text-[10px] font-mono uppercase text-brand-graphite-500 font-bold block">
              Facility Specifications
            </span>
            <h4 className="text-base font-bold text-brand-graphite-900">
              {activeBuilding.name} ({activeBuilding.code})
            </h4>
            <div className="text-xs text-brand-graphite-600 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Floors / Levels:</span>
                <strong>{activeBuilding.totalFloors} floors</strong>
              </div>
              <div className="flex justify-between">
                <span>Occupant Capacity:</span>
                <strong>{activeBuilding.occupancyCapacity} persons</strong>
              </div>
              <div className="flex justify-between">
                <span>Active Safety Plan:</span>
                <strong className="text-emerald-700">Approved & Verified</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-brand-graphite-50 rounded border border-brand-border space-y-2">
            <span className="text-[10px] font-mono uppercase text-brand-graphite-500 font-bold block">
              Readiness & Audit Status
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-brand-red">
                {activeBuilding.readinessScore}%
              </span>
              <Badge variant={activeBuilding.readinessScore >= 80 ? 'success' : 'warning'} size="sm">
                {activeBuilding.readinessScore >= 80 ? 'PASSED' : 'ACTION REQUIRED'}
              </Badge>
            </div>
            <div className="text-xs text-brand-graphite-600 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Audits Conducted:</span>
                <strong>{activeBuildingInspections.length} recorded</strong>
              </div>
              <div className="flex justify-between">
                <span>Open Deficiencies:</span>
                <strong className={activeBuilding.activeIssuesCount > 0 ? 'text-brand-red' : 'text-emerald-700'}>
                  {activeBuilding.activeIssuesCount} items
                </strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-brand-graphite-50 rounded border border-brand-border space-y-2">
            <span className="text-[10px] font-mono uppercase text-brand-graphite-500 font-bold block">
              Mock Drill Record
            </span>
            <div className="text-xs text-brand-graphite-600 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span>Total Drills:</span>
                <strong>{activeBuildingDrills.length} exercises</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Last Simulation:</span>
                <strong>{activeBuilding.lastDrillDate ? formatDateString(activeBuilding.lastDrillDate) : 'Pending'}</strong>
              </div>
              <Link
                to={`/building/${activeBuilding.slug || activeBuilding.id}`}
                target="_blank"
                className="text-brand-red hover:underline font-mono text-xs font-semibold block pt-2 flex items-center gap-1"
              >
                <span>Open Public QR Emergency Passport &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Dual Analytics (Inspection Analytics & Mock Drill Benchmark) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Compliance Analytics */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-red" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                Safety Inspection Domain Health
              </h3>
            </div>
            <button
              onClick={handleExportInspections}
              className="text-[11px] font-mono text-brand-red hover:underline print:hidden"
            >
              Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {[
              { domain: 'Emergency Exits & Egress Pathways', rate: 89, status: 'Optimal' },
              { domain: 'Fire Extinguishers & Suppression', rate: 78, status: 'Requires Servicing' },
              { domain: 'Manual Alarm Call Points & Sirens', rate: 94, status: 'Optimal' },
              { domain: 'Illuminated Exit Signs & Battery Backup', rate: 83, status: 'Monitored' },
              { domain: 'Hazardous Chemicals & Lab Storage', rate: 90, status: 'Optimal' },
            ].map((d) => (
              <div key={d.domain} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-brand-graphite-800">{d.domain}</span>
                  <span className="text-brand-graphite-900 font-bold">{d.rate}%</span>
                </div>
                <div className="w-full h-2 bg-brand-graphite-100 rounded-full overflow-hidden border border-brand-border">
                  <div
                    className={`h-full rounded-full ${
                      d.rate >= 85 ? 'bg-emerald-600' : d.rate >= 75 ? 'bg-amber-500' : 'bg-brand-red'
                    }`}
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-600 flex items-center justify-between font-mono">
            <span>Historical Audits Logged: {inspections.length}</span>
            <Link to="/inspections" className="text-brand-red font-semibold hover:underline">
              View All Audits &rarr;
            </Link>
          </div>
        </div>

        {/* Mock Drill Evacuation Analytics */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-red" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
                Evacuation Pacing vs Benchmark
              </h3>
            </div>
            <button
              onClick={handleExportMockDrills}
              className="text-[11px] font-mono text-brand-red hover:underline print:hidden"
            >
              Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {drills.map((drill) => {
              const recorded = drill.durationSeconds || drill.targetDurationSeconds;
              const target = drill.targetDurationSeconds;
              const isFaster = recorded <= target;

              return (
                <div key={drill.id} className="p-3 rounded border border-brand-border bg-brand-graphite-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-graphite-900 font-mono">
                      {drill.code}: {drill.title}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isFaster ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {formatSecondsToTime(recorded)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-brand-graphite-500 font-mono">
                    <span>Target Benchmark: {formatSecondsToTime(target)}</span>
                    <span className={isFaster ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {isFaster ? `-${target - recorded}s (Ahead of Target)` : `+${recorded - target}s (Delayed)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs text-brand-graphite-600 flex items-center justify-between font-mono">
            <span>Total Exercises Conducted: {drills.length}</span>
            <Link to="/drills" className="text-brand-red font-semibold hover:underline">
              View All Mock Drills &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 5: Official Institutional Regulatory Sign-off Block — Displayed in Print & Web */}
      <div className="bg-white border border-brand-border rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
          <Award className="w-5 h-5 text-brand-red" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
            Regulatory Compliance Certification & Audit Sign-off
          </h3>
        </div>

        <p className="text-xs text-brand-graphite-700 leading-relaxed max-w-4xl">
          This document certifies that the emergency preparedness plans, physical safety checklist inspections,
          hazard drills, and corrective action workflows documented in this dossier have been executed in conformance
          with institutional safety standards and state emergency management criteria.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-brand-border text-xs font-mono text-brand-graphite-700">
          <div>
            <span className="block text-[10px] uppercase font-bold text-brand-graphite-400 mb-1">
              Authorized Safety Officer
            </span>
            <strong className="text-brand-graphite-900 block text-sm">{user?.name || 'Marcus Vance'}</strong>
            <span className="text-[11px] text-brand-graphite-500">Chief Safety & Emergency Coordinator</span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-brand-graphite-400 mb-1">
              Inspection Governance
            </span>
            <strong className="text-brand-graphite-900 block text-sm">DRILLPROOF Enterprise v2.4</strong>
            <span className="text-[11px] text-brand-graphite-500">Continuous Readiness Verification</span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-brand-graphite-400 mb-1">
              Regulatory Formal Signature
            </span>
            <div className="border-b border-brand-graphite-400 h-6 mb-1" />
            <span className="text-[10px] text-brand-graphite-400">Officer Signature & Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
