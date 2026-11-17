import React, { useState } from 'react';
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
  Compass,
} from 'lucide-react';
import {
  formatDateString,
  formatSecondsToTime,
  formatHazardName,
  formatDrillStatus,
} from '../utils/formatters';
import { HazardType } from '../types';

export const DrillsPage: React.FC = () => {
  const { drills, buildings, createDrill } = useData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id || '');
  const [hazardType, setHazardType] = useState<HazardType>('fire');
  const [drillTitle, setDrillTitle] = useState('Scheduled Fire Evacuation Drill');
  const [scenarioNotes, setScenarioNotes] = useState('Standard synchronized building evacuation drill to designated assembly post.');
  const [targetSeconds, setTargetSeconds] = useState(300);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

    createDrill({
      institutionId: bld.institutionId,
      buildingId: bld.id,
      buildingName: bld.name,
      hazardType,
      title: drillTitle,
      scenarioNotes,
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      targetDurationSeconds: targetSeconds,
      status: 'planned',
      participantsExpected: bld.occupancyCapacity,
      participantsAccountedFor: 0,
      leadCoordinatorId: 'stf-01',
      leadCoordinatorName: 'Marcus Vance',
      isDemo: true,
      floorCheckins: [
        { id: `c-1`, floorId: 'f-0', floorLabel: 'Ground Floor', wardenName: 'Assigned Warden', accountedCount: 0, expectedCount: Math.round(bld.occupancyCapacity * 0.4), status: 'pending' },
        { id: `c-2`, floorId: 'f-1', floorLabel: 'Level 1', wardenName: 'Assigned Warden', accountedCount: 0, expectedCount: Math.round(bld.occupancyCapacity * 0.3), status: 'pending' },
        { id: `c-3`, floorId: 'f-2', floorLabel: 'Level 2', wardenName: 'Assigned Warden', accountedCount: 0, expectedCount: Math.round(bld.occupancyCapacity * 0.3), status: 'pending' },
      ],
      observations: [],
    });

    setCreateModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Mock Emergency Drills"
        description="Plan, execute, time, and evaluate institutional evacuation and protective shelter exercises."
        actions={
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Schedule Drill Exercise
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {drills.map((drill) => {
          const st = formatDrillStatus(drill.status);
          const percentAccounted =
            drill.participantsExpected > 0
              ? Math.round((drill.participantsAccountedFor / drill.participantsExpected) * 100)
              : 0;

          return (
            <div
              key={drill.id}
              className="bg-white border border-brand-border rounded p-5 shadow-xs hover:border-brand-graphite-400 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-brand-graphite-600 bg-brand-graphite-100 px-2 py-0.5 rounded">
                    {drill.code}
                  </span>
                  <span className="text-xs font-semibold text-brand-graphite-600 uppercase font-mono">
                    {formatHazardName(drill.hazardType)}
                  </span>
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
                    {st.label}
                  </Badge>
                  {drill.isDemo && (
                    <span className="text-[10px] text-brand-graphite-400 font-mono uppercase bg-brand-graphite-50 px-1.5 py-0.5 rounded border border-brand-border">
                      Simulated
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-brand-graphite-900 tracking-tight mb-1">
                  {drill.title}
                </h3>
                <p className="text-xs text-brand-graphite-600 mb-3 max-w-2xl leading-relaxed">
                  {drill.scenarioNotes}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-brand-graphite-500">
                  <span>Facility: <strong className="text-brand-graphite-800">{drill.buildingName}</strong></span>
                  <span>Lead: <strong className="text-brand-graphite-800">{drill.leadCoordinatorName}</strong></span>
                  <span>Scheduled: {formatDateString(drill.scheduledAt)}</span>
                  <span>{drill.floorCheckins.length} floor muster sectors</span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-brand-border flex-shrink-0">
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                        Target Time
                      </span>
                      <span className="font-mono font-bold text-xs text-brand-graphite-800">
                        {formatSecondsToTime(drill.targetDurationSeconds)}
                      </span>
                    </div>
                    {drill.durationSeconds && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-graphite-400 font-mono block">
                          Recorded Time
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-700">
                          {formatSecondsToTime(drill.durationSeconds)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-brand-graphite-500 font-mono">
                    Accountability: {drill.participantsAccountedFor}/{drill.participantsExpected} ({percentAccounted}%)
                  </div>
                </div>

                <Link to={`/drills/${drill.id}`}>
                  <Button
                    size="sm"
                    variant={drill.status === 'in_progress' ? 'primary' : 'outline'}
                    icon={drill.status === 'in_progress' ? Play : ArrowRight}
                    iconPosition="right"
                  >
                    {drill.status === 'completed'
                      ? 'Review After-Action'
                      : drill.status === 'in_progress'
                      ? 'Active Session'
                      : 'Launch Drill Session'}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Drill Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Institutional Mock Drill"
        description="Configure scenario parameters, target evacuation benchmark, and floor sweep assignments."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5">
          <Select
            label="Target Facility"
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </Select>

          <Select
            label="Hazard Type"
            value={hazardType}
            onChange={(e) => {
              const h = e.target.value as HazardType;
              setHazardType(h);
              setDrillTitle(`Scheduled ${formatHazardName(h)} Simulation Exercise`);
            }}
          >
            <option value="fire">Fire & Smoke Evacuation</option>
            <option value="earthquake">Earthquake — Drop, Cover & Hold</option>
            <option value="flood">Flood & Severe Weather Ingress</option>
            <option value="chemical">Hazardous Chemical / Gas Leak</option>
            <option value="medical">Mass Casualty Medical Triage</option>
          </Select>

          <Input
            label="Exercise Title"
            value={drillTitle}
            onChange={(e) => setDrillTitle(e.target.value)}
            required
          />

          <Input
            label="Target Evacuation Duration (Seconds)"
            type="number"
            value={targetSeconds}
            onChange={(e) => setTargetSeconds(Number(e.target.value))}
            min={60}
            max={1800}
            helperText="Benchmark for all floors to fully report all-clear at muster posts"
          />

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1.5">
              Scenario Description & Briefing Notes
            </label>
            <textarea
              rows={3}
              value={scenarioNotes}
              onChange={(e) => setScenarioNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Flame}>
              Schedule Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
