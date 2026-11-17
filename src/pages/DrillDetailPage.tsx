import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  Flame,
  Clock,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Users2,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  formatDateString,
  formatSecondsToTime,
  formatHazardName,
  formatPriority,
} from '../utils/formatters';
import { PriorityLevel } from '../types';

export const DrillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    drills,
    updateDrill,
    updateDrillCheckin,
    addDrillObservation,
    createSafetyIssue,
    user,
  } = useData();

  const drill = drills.find((d) => d.id === id) || drills[0];

  // Timer state
  const [timerRunning, setTimerRunning] = useState(drill.status === 'in_progress');
  const [elapsedSeconds, setElapsedSeconds] = useState(
    drill.durationSeconds || 0
  );

  // New Observation Modal state
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [obsLocation, setObsLocation] = useState('Level 1 West Stairwell');
  const [obsText, setObsText] = useState('');
  const [obsSeverity, setObsSeverity] = useState<PriorityLevel>('high');

  // Convert to Action feedback message
  const [convertedNotice, setConvertedNotice] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const handleStartTimer = () => {
    setTimerRunning(true);
    updateDrill(drill.id, {
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    });
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    updateDrill(drill.id, {
      durationSeconds: elapsedSeconds,
    });
  };

  const handleCompleteDrill = () => {
    setTimerRunning(false);
    updateDrill(drill.id, {
      status: 'completed',
      durationSeconds: elapsedSeconds,
      completedAt: new Date().toISOString(),
    });
  };

  const handleFloorClearToggle = (checkinId: string, currentStatus: string) => {
    const isClearing = currentStatus !== 'cleared';
    const checkin = drill.floorCheckins.find((c) => c.id === checkinId);
    if (!checkin) return;

    updateDrillCheckin(drill.id, checkinId, {
      status: isClearing ? 'cleared' : 'in_progress',
      clearedAt: isClearing ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      accountedCount: isClearing ? checkin.expectedCount : 0,
    });
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim()) return;

    addDrillObservation(drill.id, {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      observerName: user?.name || 'Marcus Vance',
      floorOrZone: obsLocation,
      observation: obsText,
      severity: obsSeverity,
    });

    setObsText('');
    setObservationModalOpen(false);
  };

  const handleConvertToCorrectiveAction = (obsId: string, observationText: string, location: string, severity: PriorityLevel) => {
    const issue = createSafetyIssue({
      institutionId: drill.institutionId,
      buildingId: drill.buildingId,
      buildingName: drill.buildingName,
      sourceType: 'drill',
      sourceId: drill.id,
      title: `${location}: ${observationText.slice(0, 60)}...`,
      description: `Discovered during drill ${drill.code} (${drill.title}):\n"${observationText}"\nZone: ${location}`,
      priority: severity,
      assignedToName: 'Facilities Maintenance Supervisor',
      assignedToRole: 'Facilities Maintenance Supervisor',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'open',
    });

    // mark observation as converted
    const updatedObs = drill.observations.map((obs) => {
      if (obs.id === obsId) {
        return { ...obs, convertedToIssueId: issue.id };
      }
      return obs;
    });
    updateDrill(drill.id, { observations: updatedObs });

    setConvertedNotice(`Corrective Action #${issue.code} created and assigned to Facilities.`);
    setTimeout(() => setConvertedNotice(null), 5000);
  };

  const totalAccounted = drill.participantsAccountedFor;
  const totalExpected = drill.participantsExpected;
  const accountabilityRate =
    totalExpected > 0 ? Math.round((totalAccounted / totalExpected) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={drill.title}
        description={`Exercise Code: ${drill.code} &bull; Facility: ${drill.buildingName} &bull; Hazard: ${formatHazardName(drill.hazardType)}`}
        breadcrumbs={[
          { label: 'Drills', path: '/drills' },
          { label: drill.code },
        ]}
        badge={
          <Badge
            variant={
              drill.status === 'completed'
                ? 'success'
                : drill.status === 'in_progress'
                ? 'warning'
                : 'info'
            }
            size="md"
          >
            {drill.status.toUpperCase()}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {drill.status !== 'completed' && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleCompleteDrill}
                icon={CheckCircle2}
              >
                End & Complete Exercise
              </Button>
            )}
            <Link to="/drills">
              <Button size="sm" variant="outline">
                Back to Drills
              </Button>
            </Link>
          </div>
        }
      />

      {/* Converted Action Notice Banner */}
      {convertedNotice && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{convertedNotice}</span>
          </div>
          <Link to="/issues" className="font-bold underline text-emerald-900">
            View in Corrective Actions &rarr;
          </Link>
        </div>
      )}

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Timer Card */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono">
                Evacuation Stopwatch
              </span>
              <span className="text-xs text-brand-graphite-500 font-mono">
                Target: {formatSecondsToTime(drill.targetDurationSeconds)}
              </span>
            </div>

            <div className="my-4 text-center py-4 bg-brand-graphite-900 text-white rounded border border-brand-graphite-800 font-mono">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                {formatSecondsToTime(elapsedSeconds)}
              </span>
              <span className="block text-[10px] text-brand-graphite-400 uppercase tracking-widest mt-1">
                {timerRunning ? 'Timer Active &bull; Clock Ticking' : 'Simulation Paused / Finished'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            {!timerRunning ? (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                icon={Play}
                onClick={handleStartTimer}
              >
                {elapsedSeconds === 0 ? 'Start Drill Timer' : 'Resume Timer'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                icon={Square}
                onClick={handleStopTimer}
              >
                Pause Timer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setTimerRunning(false);
                setElapsedSeconds(0);
              }}
              title="Reset Timer"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Accountability Meter */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono">
                Personnel Accountability
              </span>
              <Users2 className="w-4 h-4 text-brand-graphite-500" />
            </div>

            <div className="my-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-3xl font-bold font-mono text-brand-graphite-900">
                  {totalAccounted}{' '}
                  <span className="text-sm font-normal text-brand-graphite-400">
                    / {totalExpected}
                  </span>
                </span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {accountabilityRate}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-brand-graphite-100 rounded-full overflow-hidden border border-brand-border">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, accountabilityRate)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-graphite-50 rounded text-xs text-brand-graphite-600">
            <span>Floor sweeps logged: </span>
            <strong className="text-brand-graphite-900">
              {drill.floorCheckins.filter((c) => c.status === 'cleared').length} of {drill.floorCheckins.length} floors cleared
            </strong>
          </div>
        </div>

        {/* Lead Coordinator Profile */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-2">
              Exercise Leadership & Safety Notice
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-brand-border">
                <span className="text-brand-graphite-500">Chief Coordinator:</span>
                <span className="font-semibold text-brand-graphite-900">{drill.leadCoordinatorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border">
                <span className="text-brand-graphite-500">Hazard Profile:</span>
                <span className="font-semibold text-brand-graphite-900 capitalize">{drill.hazardType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-graphite-500">Target Assembly:</span>
                <span className="font-semibold text-brand-graphite-900">Assembly Point A</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-brand-graphite-100/60 rounded text-[11px] text-brand-graphite-500">
            Manual sweep verification prototype. No biometric or RFID automated tracking.
          </div>
        </div>
      </div>

      {/* Floor Sweep Status Table */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden mb-8">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Floor Sweep & Muster Clearance Check-ins
            </h3>
          </div>
          <span className="text-xs text-brand-graphite-500">
            Warden manual clearance controls
          </span>
        </div>

        <div className="divide-y divide-brand-border">
          {drill.floorCheckins.map((chk) => (
            <div
              key={chk.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-graphite-50/40"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-brand-graphite-900">
                    {chk.floorLabel}
                  </span>
                  <Badge
                    variant={chk.status === 'cleared' ? 'success' : 'default'}
                    size="sm"
                  >
                    {chk.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-brand-graphite-500 flex items-center gap-3">
                  <span>Warden: {chk.wardenName}</span>
                  {chk.clearedAt && (
                    <span className="font-mono text-emerald-700">
                      Cleared at {chk.clearedAt}
                    </span>
                  )}
                  {chk.notes && (
                    <span className="text-amber-800 italic">"{chk.notes}"</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-brand-graphite-400 block font-mono">
                    Accounted
                  </span>
                  <span className="font-mono font-bold text-xs text-brand-graphite-900">
                    {chk.accountedCount} / {chk.expectedCount}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant={chk.status === 'cleared' ? 'outline' : 'primary'}
                  onClick={() => handleFloorClearToggle(chk.id, chk.status)}
                >
                  {chk.status === 'cleared' ? 'Mark In Progress' : 'Confirm Floor Cleared'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observations & Corrective Actions Loop */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Drill Observations & Corrective Action Closure
            </h3>
            <p className="text-xs text-brand-graphite-500">
              Convert observed bottlenecks or obstructed routes directly into assigned facility tickets.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={() => setObservationModalOpen(true)}
          >
            Add Observation
          </Button>
        </div>

        <div className="divide-y divide-brand-border">
          {drill.observations.length === 0 ? (
            <div className="p-6 text-center text-xs text-brand-graphite-500">
              No observations recorded yet. Click "Add Observation" to log drill bottlenecks.
            </div>
          ) : (
            drill.observations.map((obs) => {
              const p = formatPriority(obs.severity);
              const isConverted = !!obs.convertedToIssueId;

              return (
                <div key={obs.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-brand-graphite-900">
                        {obs.floorOrZone}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${p.bg} ${p.border}`}>
                        {p.label}
                      </span>
                      <span className="text-[10px] font-mono text-brand-graphite-400">
                        {obs.timestamp} by {obs.observerName}
                      </span>
                    </div>

                    <p className="text-xs text-brand-graphite-700 leading-relaxed mb-2">
                      {obs.observation}
                    </p>

                    {isConverted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Converted into assigned Corrective Action ticket
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isConverted ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={AlertTriangle}
                        onClick={() =>
                          handleConvertToCorrectiveAction(
                            obs.id,
                            obs.observation,
                            obs.floorOrZone,
                            obs.severity
                          )
                        }
                      >
                        Convert to Corrective Action
                      </Button>
                    ) : (
                      <Link to="/issues">
                        <Button size="sm" variant="outline">
                          View in Action Log &rarr;
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Observation Modal */}
      <Modal
        isOpen={observationModalOpen}
        onClose={() => setObservationModalOpen(false)}
        title="Record Drill Observation"
        description="Log an operational issue, egress delay, or communication breakdown noted during the exercise."
        maxWidth="md"
      >
        <form onSubmit={handleAddObservation} className="space-y-3.5">
          <Input
            label="Location / Floor / Egress Point"
            value={obsLocation}
            onChange={(e) => setObsLocation(e.target.value)}
            placeholder="e.g. Level 1 West Stairwell landing"
            required
          />

          <Select
            label="Observed Severity"
            value={obsSeverity}
            onChange={(e) => setObsSeverity(e.target.value as PriorityLevel)}
          >
            <option value="critical">Critical (Completely blocked egress / panic hazard)</option>
            <option value="high">High (Delay or bottleneck in evacuation flow)</option>
            <option value="medium">Medium (Unclear signage / low volume alarm)</option>
            <option value="low">Low (Minor procedural deviation)</option>
          </Select>

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1.5">
              Detailed Observation Note
            </label>
            <textarea
              rows={3}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              placeholder="e.g. West stairwell door was partially propped or hindered by storage boxes, slowing down occupants during evacuation surge..."
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              required
            />
          </div>

          <div className="pt-2 border-t border-brand-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setObservationModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Observation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
