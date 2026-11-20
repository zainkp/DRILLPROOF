import React, { useState, useEffect, useMemo } from 'react';
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
  Printer,
  FileCheck,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Award,
  Layers,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  formatDateString,
  formatSecondsToTime,
  formatHazardName,
  formatPriority,
  formatDrillStatus,
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
    issues,
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
  const [obsLocation, setObsLocation] = useState(
    drill?.floorCheckins[0]?.floorLabel ? `${drill.floorCheckins[0].floorLabel} Egress Corridor` : 'Level 1 West Stairwell'
  );
  const [obsText, setObsText] = useState('');
  const [obsSeverity, setObsSeverity] = useState<PriorityLevel>('high');

  // Convert to Action feedback message
  const [convertedNotice, setConvertedNotice] = useState<string | null>(null);

  // Sync elapsed seconds if drill updates externally
  useEffect(() => {
    if (drill.durationSeconds && !timerRunning && elapsedSeconds === 0) {
      setElapsedSeconds(drill.durationSeconds);
    }
  }, [drill.durationSeconds, timerRunning]);

  // Live Timer ticker
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

  if (!drill) {
    return (
      <div className="p-8 text-center bg-white border border-brand-border rounded">
        <p className="font-semibold text-brand-graphite-800">Drill exercise not found.</p>
        <Link to="/drills" className="text-brand-red font-mono text-xs hover:underline mt-2 block">
          &larr; Back to Mock Drills
        </Link>
      </div>
    );
  }

  const handleStartTimer = () => {
    setTimerRunning(true);
    updateDrill(drill.id, {
      status: 'in_progress',
      startedAt: drill.startedAt || new Date().toISOString(),
    });
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    updateDrill(drill.id, {
      durationSeconds: elapsedSeconds,
    });
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
    updateDrill(drill.id, {
      durationSeconds: 0,
      status: 'planned',
    });
  };

  const handleAbortDrill = () => {
    setTimerRunning(false);
    updateDrill(drill.id, {
      status: 'cancelled',
      durationSeconds: elapsedSeconds,
    });
  };

  const handleCompleteDrill = () => {
    setTimerRunning(false);
    const finalSeconds = elapsedSeconds > 0 ? elapsedSeconds : drill.targetDurationSeconds;
    
    // Auto-tally all accounted if needed
    const updatedCheckins = drill.floorCheckins.map((chk) => ({
      ...chk,
      status: 'cleared' as const,
      accountedCount: chk.accountedCount > 0 ? chk.accountedCount : chk.expectedCount,
      clearedAt: chk.clearedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    const totalAccounted = updatedCheckins.reduce((s, c) => s + c.accountedCount, 0);

    updateDrill(drill.id, {
      status: 'completed',
      durationSeconds: finalSeconds,
      completedAt: new Date().toISOString(),
      participantsAccountedFor: totalAccounted,
      floorCheckins: updatedCheckins,
    });
  };

  // Toggle floor sweep clearance status (synchronized with headcount)
  const handleFloorCycle = (checkinId: string, currentStatus: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCheckins = drill.floorCheckins.map((chk) => {
      if (chk.id === checkinId) {
        let nextStatus: 'pending' | 'in_progress' | 'cleared';
        let nextClearedAt: string | undefined = chk.clearedAt;
        let nextAccounted = chk.accountedCount;

        if (chk.status === 'cleared') {
          // Reopen sweep: switches to in_progress / sweeping, reverses floor headcount to unverified
          nextStatus = 'in_progress';
          nextClearedAt = undefined;
          nextAccounted = 0;
        } else if (chk.status === 'in_progress') {
          // Mark Cleared: switches to cleared with timestamp and marks all floor occupants accounted
          nextStatus = 'cleared';
          nextClearedAt = currentTime;
          nextAccounted = chk.expectedCount;
        } else {
          // pending: switches to in_progress
          nextStatus = 'in_progress';
        }

        return {
          ...chk,
          status: nextStatus,
          clearedAt: nextClearedAt,
          accountedCount: nextAccounted,
        };
      }
      return chk;
    });

    const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    updateDrill(drill.id, {
      floorCheckins: updatedCheckins,
      participantsAccountedFor: newTotal,
    });
  };

  // Adjust floor-specific headcount
  const handleAdjustFloorAccounted = (checkinId: string, delta: number) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCheckins = drill.floorCheckins.map((chk) => {
      if (chk.id === checkinId) {
        const newCount = Math.max(0, Math.min(chk.expectedCount, chk.accountedCount + delta));
        let nextStatus = chk.status;
        let nextClearedAt = chk.clearedAt;

        // When reaching full capacity via manual adjustment, reflect clearance
        if (newCount === chk.expectedCount) {
          nextStatus = 'cleared';
          if (!nextClearedAt) {
            nextClearedAt = currentTime;
          }
        } else if (newCount < chk.expectedCount && chk.status === 'cleared') {
          // When dropping below full capacity, revert from cleared to in-progress
          nextStatus = 'in_progress';
          nextClearedAt = undefined;
        }

        return {
          ...chk,
          accountedCount: newCount,
          status: nextStatus,
          clearedAt: nextClearedAt,
        };
      }
      return chk;
    });
    const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    updateDrill(drill.id, {
      floorCheckins: updatedCheckins,
      participantsAccountedFor: newTotal,
    });
  };

  const handleSetFloorAllAccounted = (checkinId: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCheckins = drill.floorCheckins.map((chk) => {
      if (chk.id === checkinId) {
        return {
          ...chk,
          accountedCount: chk.expectedCount,
          status: 'cleared' as const,
          clearedAt: chk.clearedAt || currentTime,
        };
      }
      return chk;
    });
    const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    updateDrill(drill.id, {
      floorCheckins: updatedCheckins,
      participantsAccountedFor: newTotal,
    });
  };

  // Adjust total accountability count by distributing delta across floors
  const handleAdjustAccountability = (delta: number) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCheckins = drill.floorCheckins.map((c) => ({ ...c }));
    if (delta > 0) {
      let remaining = delta;
      for (const chk of updatedCheckins) {
        if (remaining <= 0) break;
        const available = chk.expectedCount - chk.accountedCount;
        if (available > 0) {
          const toAdd = Math.min(available, remaining);
          chk.accountedCount += toAdd;
          remaining -= toAdd;
        }
        if (chk.accountedCount === chk.expectedCount) {
          chk.status = 'cleared';
          if (!chk.clearedAt) chk.clearedAt = currentTime;
        } else if (chk.status === 'pending') {
          chk.status = 'in_progress';
        }
      }
    } else if (delta < 0) {
      let remaining = Math.abs(delta);
      for (let i = updatedCheckins.length - 1; i >= 0; i--) {
        if (remaining <= 0) break;
        const chk = updatedCheckins[i];
        if (chk.accountedCount > 0) {
          const toSub = Math.min(chk.accountedCount, remaining);
          chk.accountedCount -= toSub;
          remaining -= toSub;
        }
        if (chk.accountedCount < chk.expectedCount && chk.status === 'cleared') {
          chk.status = 'in_progress';
          chk.clearedAt = undefined;
        }
      }
    }

    const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    updateDrill(drill.id, {
      floorCheckins: updatedCheckins,
      participantsAccountedFor: newTotal,
    });
  };

  const handleSetAllAccounted = () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCheckins = drill.floorCheckins.map((chk) => ({
      ...chk,
      accountedCount: chk.expectedCount,
      status: 'cleared' as const,
      clearedAt: chk.clearedAt || currentTime,
    }));
    const newTotal = updatedCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
    updateDrill(drill.id, {
      floorCheckins: updatedCheckins,
      participantsAccountedFor: newTotal,
    });
  };

  // Add observation
  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim()) return;

    addDrillObservation(drill.id, {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      observerName: user?.name || 'Marcus Vance',
      floorOrZone: obsLocation,
      observation: obsText.trim(),
      severity: obsSeverity,
    });

    setObsText('');
    setObservationModalOpen(false);
  };

  // Convert observation to corrective action
  const handleConvertToCorrectiveAction = (
    obsId: string,
    observationText: string,
    location: string,
    severity: PriorityLevel
  ) => {
    const issue = createSafetyIssue({
      institutionId: drill.institutionId,
      buildingId: drill.buildingId,
      buildingName: drill.buildingName,
      sourceType: 'drill',
      sourceId: drill.id,
      title: `${location}: ${observationText.slice(0, 60)}...`,
      description: `Deficiency identified during emergency drill ${drill.code} (${drill.title}):\n"${observationText}"\nZone: ${location}`,
      priority: severity,
      assignedToName: 'Facilities Maintenance Supervisor',
      assignedToRole: 'Facilities Maintenance Supervisor',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'open',
    });

    // Mark observation as converted
    const updatedObs = drill.observations.map((obs) => {
      if (obs.id === obsId) {
        return { ...obs, convertedToIssueId: issue.id };
      }
      return obs;
    });
    updateDrill(drill.id, { observations: updatedObs });

    setConvertedNotice(`Corrective Action #${issue.code} created and assigned to Facilities.`);
    setTimeout(() => setConvertedNotice(null), 6000);
  };

  // Accountability & Clearance metrics
  const totalAccounted = drill.floorCheckins.reduce((s, c) => s + (c.accountedCount || 0), 0);
  const totalExpected =
    drill.participantsExpected ||
    drill.floorCheckins.reduce((s, c) => s + (c.expectedCount || 0), 0);
  const missingCount = Math.max(0, totalExpected - totalAccounted);
  const accountabilityRate =
    totalExpected > 0 ? Math.round((totalAccounted / totalExpected) * 100) : 0;

  const totalFloors = drill.floorCheckins.length;
  const clearedFloors = drill.floorCheckins.filter((c) => c.status === 'cleared').length;
  const floorClearanceRate = totalFloors > 0 ? Math.round((clearedFloors / totalFloors) * 100) : 0;

  // Benchmark pacing
  const targetSeconds = drill.targetDurationSeconds;
  const paceVariance = targetSeconds - elapsedSeconds;
  const isOnPace = paceVariance >= 0;

  // After Action Performance Rating
  const isCompleted = drill.status === 'completed';
  const performanceRating = useMemo(() => {
    if (!isCompleted) return null;
    const timeRatio = (drill.durationSeconds || elapsedSeconds) / targetSeconds;
    if (timeRatio <= 1.0 && accountabilityRate >= 95 && floorClearanceRate === 100) {
      return {
        label: 'EXCELLENT — MEETS REGULATORY BENCHMARK',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
        summary: 'Evacuation executed well within target benchmark. Headcount fully accounted for and all muster zones reported clear.',
      };
    } else if (timeRatio <= 1.25 && accountabilityRate >= 80) {
      return {
        label: 'ACCEPTABLE WITH MINOR PROCEDURAL GAPS',
        color: 'text-amber-800 bg-amber-50 border-amber-300',
        summary: 'Target benchmark exceeded slightly or minor delays recorded in stairwell surge. Remediation items logged.',
      };
    } else {
      return {
        label: 'DEFICIENT — RETEST & SAFETY REMEDIATION REQUIRED',
        color: 'text-red-800 bg-red-50 border-red-300',
        summary: 'Significant egress bottlenecks, unaccounted occupants, or delayed floor sweeps recorded. Corrective actions required before next audit.',
      };
    }
  }, [isCompleted, drill.durationSeconds, elapsedSeconds, targetSeconds, accountabilityRate, floorClearanceRate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={drill.title}
        description={`Exercise Code: ${drill.code} &bull; Facility: ${drill.buildingName} &bull; Hazard: ${formatHazardName(drill.hazardType)}`}
        breadcrumbs={[
          { label: 'Mock Drills', path: '/drills' },
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
          <div className="flex items-center gap-2 print:hidden">
            {drill.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-700 hover:bg-red-50 hover:border-red-300"
                onClick={handleAbortDrill}
              >
                Abort Drill
              </Button>
            )}
            {drill.status !== 'completed' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleCompleteDrill}
                icon={CheckCircle2}
              >
                End & Complete Exercise
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print AAR Report
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

      {/* Converted Action Notification Banner */}
      {convertedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{convertedNotice}</span>
          </div>
          <Link to="/issues" className="font-bold underline text-emerald-900 font-mono">
            View in Corrective Actions &rarr;
          </Link>
        </div>
      )}

      {/* 1. Interactive Command Console: Stopwatch, Accountability & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Evacuation Stopwatch */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono">
                Evacuation Stopwatch
              </span>
              <span className="text-xs font-mono text-brand-graphite-600">
                Target: {formatSecondsToTime(targetSeconds)}
              </span>
            </div>

            {/* Big Stopwatch Display */}
            <div className="my-4 text-center py-5 bg-brand-graphite-900 text-white rounded border border-brand-graphite-800 font-mono shadow-inner">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                {formatSecondsToTime(elapsedSeconds)}
              </span>
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                {timerRunning ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Timer Active &bull; Clock Ticking
                  </span>
                ) : drill.status === 'completed' ? (
                  <span className="text-brand-graphite-300">
                    Drill Completed &bull; Final Time Recorded
                  </span>
                ) : (
                  <span className="text-amber-400">
                    Simulation Paused / Standby
                  </span>
                )}
              </div>
            </div>

            {/* Pacing Indicator */}
            <div className="mb-4 text-xs font-mono flex items-center justify-between p-2 rounded bg-brand-graphite-50 border border-brand-border">
              <span className="text-brand-graphite-500">Benchmark Comparison:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isOnPace ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {isOnPace ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+{paceVariance}s Cushion (On Pace)</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                    <span>+{Math.abs(paceVariance)}s Delay Past Target</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Stopwatch Controls */}
          <div className="flex items-center gap-2 print:hidden">
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
              onClick={handleResetTimer}
              title="Reset Timer"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Participant Accountability Tracker */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono">
                Personnel Accountability
              </span>
              <Users2 className="w-4 h-4 text-brand-graphite-500" />
            </div>

            <div className="my-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-3xl font-bold font-mono text-brand-graphite-900">
                  {totalAccounted}{' '}
                  <span className="text-sm font-normal text-brand-graphite-400">
                    / {totalExpected}
                  </span>
                </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    accountabilityRate >= 95
                      ? 'text-emerald-700'
                      : accountabilityRate >= 75
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {accountabilityRate}% Accounted
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-brand-graphite-100 rounded-full overflow-hidden border border-brand-border">
                <div
                  className={`h-full transition-all duration-300 ${
                    accountabilityRate >= 95
                      ? 'bg-emerald-600'
                      : accountabilityRate >= 75
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(100, accountabilityRate)}%` }}
                />
              </div>
            </div>

            {/* Quick Accountability Sub-counters */}
            <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase block">Accounted</span>
                <strong className="text-emerald-950 text-sm">{totalAccounted}</strong>
              </div>
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <span className="text-[10px] text-red-800 uppercase block">Unaccounted / Missing</span>
                <strong className="text-red-950 text-sm">{missingCount}</strong>
              </div>
            </div>
          </div>

          {/* Quick Headcount Increment / Adjustment Controls */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-brand-border print:hidden">
            <button
              onClick={() => handleAdjustAccountability(10)}
              className="flex-1 py-1 px-2 text-xs font-mono font-semibold rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-800 transition-colors"
            >
              +10
            </button>
            <button
              onClick={() => handleAdjustAccountability(50)}
              className="flex-1 py-1 px-2 text-xs font-mono font-semibold rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-800 transition-colors"
            >
              +50
            </button>
            <button
              onClick={handleSetAllAccounted}
              className="flex-1 py-1 px-2 text-xs font-mono font-semibold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors"
            >
              All (100%)
            </button>
            <button
              onClick={() => handleAdjustAccountability(-10)}
              className="py-1 px-2 text-xs font-mono rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-600 transition-colors"
              title="Decrement 10"
            >
              -10
            </button>
          </div>
        </div>

        {/* Drill Coordination & Facility Profile */}
        <div className="bg-white border border-brand-border rounded p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-500 font-mono block mb-2">
              Exercise Leadership & Facility Profile
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-brand-border">
                <span className="text-brand-graphite-500">Chief Coordinator:</span>
                <span className="font-semibold text-brand-graphite-900">{drill.leadCoordinatorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border">
                <span className="text-brand-graphite-500">Hazard Profile:</span>
                <span className="font-semibold text-brand-graphite-900 capitalize font-mono">
                  {formatHazardName(drill.hazardType)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border">
                <span className="text-brand-graphite-500">Target Facility:</span>
                <span className="font-semibold text-brand-graphite-900">{drill.buildingName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-graphite-500">Floor Sweep Progress:</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {clearedFloors} of {totalFloors} floors cleared ({floorClearanceRate}%)
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-brand-graphite-50 rounded border border-brand-border text-[11px] text-brand-graphite-600 mt-3 leading-relaxed">
            <span className="font-semibold block text-brand-graphite-900 mb-0.5">Scenario Instructions:</span>
            {drill.scenarioNotes}
          </div>
        </div>
      </div>

      {/* 2. After-Action Review (AAR) Report — Displayed when completed or finalized */}
      {isCompleted && performanceRating && (
        <div className="bg-white border-2 border-emerald-600 rounded p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-graphite-500 font-mono tracking-wider block">
                  Official Post-Exercise Evaluation
                </span>
                <h3 className="text-lg font-bold text-brand-graphite-900">
                  After-Action Review (AAR) Dossier
                </h3>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded border text-xs font-mono font-bold ${performanceRating.color}`}>
              {performanceRating.label}
            </div>
          </div>

          <p className="text-xs text-brand-graphite-700 leading-relaxed">
            {performanceRating.summary}
          </p>

          {/* 4 Performance Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
              <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Recorded Time</span>
              <span className="text-lg font-bold font-mono text-brand-graphite-900">
                {formatSecondsToTime(drill.durationSeconds || elapsedSeconds)}
              </span>
              <span className="text-[11px] text-brand-graphite-500 block">
                Target: {formatSecondsToTime(targetSeconds)}
              </span>
            </div>

            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
              <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Accountability</span>
              <span className="text-lg font-bold font-mono text-brand-graphite-900">
                {accountabilityRate}%
              </span>
              <span className="text-[11px] text-brand-graphite-500 block">
                {totalAccounted} of {totalExpected} accounted
              </span>
            </div>

            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
              <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Sweep Coverage</span>
              <span className="text-lg font-bold font-mono text-brand-graphite-900">
                {floorClearanceRate}%
              </span>
              <span className="text-[11px] text-brand-graphite-500 block">
                {clearedFloors} of {totalFloors} floors cleared
              </span>
            </div>

            <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border">
              <span className="text-[10px] font-mono text-brand-graphite-500 uppercase block">Logged Issues</span>
              <span className="text-lg font-bold font-mono text-brand-red">
                {drill.observations.length} Noted
              </span>
              <span className="text-[11px] text-brand-graphite-500 block">
                {drill.observations.filter((o) => o.convertedToIssueId).length} tickets generated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floor Sweep Status & Warden Muster Clearance Table */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Floor Sweep & Muster Clearance Registry ({clearedFloors} of {totalFloors} cleared)
            </h3>
          </div>
          <span className="text-xs text-brand-graphite-500 font-mono">
            Interactive warden clearance checkpoints
          </span>
        </div>

        <div className="divide-y divide-brand-border">
          {drill.floorCheckins.map((chk) => (
            <div
              key={chk.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-graphite-50/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-brand-graphite-900">
                    {chk.floorLabel}
                  </span>
                  <Badge
                    variant={
                      chk.status === 'cleared'
                        ? 'success'
                        : chk.status === 'in_progress'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {chk.status === 'in_progress'
                      ? 'SWEEP IN PROGRESS'
                      : chk.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-brand-graphite-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-brand-graphite-700">
                    <UserCheck className="w-3.5 h-3.5 text-brand-graphite-400" />
                    <span>Warden: <strong>{chk.wardenName}</strong></span>
                  </span>
                  {chk.clearedAt && (
                    <span className="font-mono text-emerald-700 font-semibold">
                      Cleared at {chk.clearedAt}
                    </span>
                  )}
                  {chk.notes && (
                    <span className="text-amber-800 italic bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      "{chk.notes}"
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-brand-graphite-400 block font-mono">
                    Floor Muster
                  </span>
                  <span className="font-mono font-bold text-xs text-brand-graphite-900 block">
                    {chk.accountedCount} / {chk.expectedCount}{' '}
                    <span className="text-[10px] font-normal text-brand-graphite-500">
                      ({chk.expectedCount > 0 ? Math.round((chk.accountedCount / chk.expectedCount) * 100) : 0}%)
                    </span>
                  </span>
                  {/* Floor-level Headcount Adjusters */}
                  <div className="flex items-center gap-1 mt-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => handleAdjustFloorAccounted(chk.id, 10)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-800 transition-colors"
                      title="Add 10 accounted occupants"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustFloorAccounted(chk.id, 50)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-800 transition-colors"
                      title="Add 50 accounted occupants"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetFloorAllAccounted(chk.id)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors"
                      title="Mark all floor occupants accounted"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustFloorAccounted(chk.id, -10)}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-brand-graphite-100 hover:bg-brand-graphite-200 text-brand-graphite-600 transition-colors"
                      title="Subtract 10 occupants"
                    >
                      -10
                    </button>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-1">
                  <Button
                    size="sm"
                    variant={
                      chk.status === 'cleared'
                        ? 'outline'
                        : chk.status === 'in_progress'
                        ? 'primary'
                        : 'outline'
                    }
                    onClick={() => handleFloorCycle(chk.id, chk.status)}
                    className="w-full"
                  >
                    {chk.status === 'cleared'
                      ? 'Reopen Sweep'
                      : chk.status === 'in_progress'
                      ? 'Mark Cleared'
                      : 'Start Sweep'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Drill Observations & Corrective Actions Loop */}
      <div className="bg-white border border-brand-border rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-graphite-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-graphite-900 font-mono">
              Drill Observations & Corrective Action Closure Loop
            </h3>
            <p className="text-xs text-brand-graphite-500">
              Convert observed bottlenecks, locked exits, or delayed evacuations directly into tracked remediation tickets.
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
            <div className="p-8 text-center text-xs text-brand-graphite-500">
              <FileCheck className="w-8 h-8 text-brand-graphite-300 mx-auto mb-2" />
              <p className="font-semibold text-brand-graphite-700">No operational bottlenecks observed yet.</p>
              <p className="text-[11px] text-brand-graphite-500 mt-1">
                Click &quot;Add Observation&quot; to log stairwell congestion, alarm volume issues, or egress delays.
              </p>
            </div>
          ) : (
            drill.observations.map((obs) => {
              const p = formatPriority(obs.severity);
              const isConverted = !!obs.convertedToIssueId;
              const linkedIssue = isConverted
                ? issues.find((i) => i.id === obs.convertedToIssueId)
                : null;

              return (
                <div key={obs.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
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

                    <p className="text-xs text-brand-graphite-700 leading-relaxed mb-2.5">
                      {obs.observation}
                    </p>

                    {isConverted && (
                      <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Linked Corrective Action Ticket: {linkedIssue?.code || 'Assigned'} ({linkedIssue?.status.toUpperCase() || 'OPEN'})
                        </span>
                      </div>
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
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Detailed Observation Note
            </label>
            <textarea
              rows={3}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              placeholder="e.g. West stairwell door was partially hindered by storage boxes, slowing down occupants during evacuation surge..."
              className="w-full text-xs p-2.5 rounded border border-brand-border bg-white text-brand-graphite-900 focus:outline-none focus:border-brand-red font-sans"
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
