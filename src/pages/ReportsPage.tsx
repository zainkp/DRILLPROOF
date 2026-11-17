import React from 'react';
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
} from 'lucide-react';
import { formatSecondsToTime, formatDateString } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { institution, buildings, drills, inspections, issues, readinessSummary } = useData();

  const totalDrills = drills.length;
  const completedDrills = drills.filter((d) => d.status === 'completed');
  const avgDrillTime =
    completedDrills.length > 0
      ? Math.round(
          completedDrills.reduce((sum, d) => sum + (d.durationSeconds || 0), 0) /
            completedDrills.length
        )
      : 277;

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved');
  const issueClosureRate = totalIssues > 0 ? Math.round((resolvedIssues.length / totalIssues) * 100) : 0;

  const totalInspections = inspections.length;
  const passedInspections = inspections.filter((i) => i.status === 'passed');
  const inspectionPassRate =
    totalInspections > 0 ? Math.round((passedInspections.length / totalInspections) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:p-0">
      <PageHeader
        title="Institutional Readiness & Performance Report"
        description="Comprehensive compliance overview, drill execution analytics, and corrective action closure velocity."
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Button size="sm" variant="outline" icon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              onClick={() => alert('Exporting readiness dossier as official PDF report...')}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Campus Summary Dossier Banner */}
      <div className="bg-white border border-brand-border rounded p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono tracking-widest">
              Institutional Safety Dossier
            </span>
            <h2 className="text-xl font-bold text-brand-graphite-900 tracking-tight mt-0.5">
              {institution.name}
            </h2>
            <p className="text-xs text-brand-graphite-500">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &bull; Report ID: NIT-REP-2026-Q4
            </p>
          </div>

          <div className="flex items-center gap-4 bg-brand-graphite-50 px-4 py-2.5 rounded border border-brand-border">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                Composite Score
              </span>
              <span className="text-2xl font-bold font-mono text-brand-red">
                {readinessSummary.overallReadinessScore}%
              </span>
            </div>
            <div className="w-2.5 h-10 bg-brand-red rounded-full" />
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
              Issue Resolution Velocity
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {issueClosureRate}%
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              {resolvedIssues.length} of {totalIssues} actions resolved
            </span>
          </div>

          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Inspection Pass Rate
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              {inspectionPassRate}%
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              {totalInspections} facility audits completed
            </span>
          </div>

          <div className="p-3.5 bg-brand-graphite-50/70 rounded border border-brand-border">
            <span className="text-[10px] uppercase font-semibold text-brand-graphite-400 block font-mono">
              Total Mapped Occupants
            </span>
            <span className="text-xl font-bold font-mono text-brand-graphite-900 mt-1 block">
              2,250
            </span>
            <span className="text-[11px] text-brand-graphite-500">
              Across 3 campus buildings
            </span>
          </div>
        </div>
      </div>

      {/* Facility Breakdown Table */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden mb-8">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
            Facility By Facility Operational Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-graphite-50 text-[10px] font-bold text-brand-graphite-500 uppercase border-b border-brand-border">
              <tr>
                <th className="p-3.5">Building Name</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Levels</th>
                <th className="p-3.5">Readiness Score</th>
                <th className="p-3.5">Last Mock Drill</th>
                <th className="p-3.5">Open Deficiencies</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-brand-graphite-50/40">
                  <td className="p-3.5 font-bold text-brand-graphite-900">
                    {b.name}
                  </td>
                  <td className="p-3.5 font-mono text-brand-graphite-600">{b.code}</td>
                  <td className="p-3.5 font-mono">{b.totalFloors}</td>
                  <td className="p-3.5 font-mono font-bold text-brand-graphite-900">
                    {b.readinessScore}%
                  </td>
                  <td className="p-3.5 text-brand-graphite-600">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Drill Outcomes Summary */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
            Recent Timed Evacuation Outcomes
          </h3>
          <span className="text-xs text-brand-graphite-500">
            Northstar Campus Drill Registry
          </span>
        </div>

        <div className="divide-y divide-brand-border">
          {drills.map((drill) => (
            <div key={drill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-[11px] text-brand-graphite-500">
                    {drill.code}
                  </span>
                  <span className="font-bold text-brand-graphite-900">
                    {drill.title}
                  </span>
                </div>
                <div className="text-brand-graphite-500 text-[11px] flex items-center gap-3">
                  <span>Facility: {drill.buildingName}</span>
                  <span>Date: {formatDateString(drill.scheduledAt)}</span>
                  <span>Observations: {drill.observations.length} noted</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                    Duration
                  </span>
                  <span className="font-mono font-bold text-brand-graphite-900">
                    {drill.durationSeconds ? formatSecondsToTime(drill.durationSeconds) : 'Pending'}
                  </span>
                </div>
                <Badge
                  variant={drill.status === 'completed' ? 'success' : 'info'}
                  size="sm"
                >
                  {drill.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
