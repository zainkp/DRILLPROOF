import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useData } from '../../hooks/useData';
import { Flame, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { HazardType, PriorityLevel } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const { buildings, createDrill, createSafetyIssue } = useData();
  const [tab, setTab] = useState<'drill' | 'issue'>('drill');

  // Drill form state
  const [drillBuildingId, setDrillBuildingId] = useState(buildings[0]?.id || '');
  const [drillHazard, setDrillHazard] = useState<HazardType>('fire');
  const [drillTitle, setDrillTitle] = useState('Scheduled Fire Evacuation Drill');
  const [drillTargetTime, setDrillTargetTime] = useState(300);

  // Issue form state
  const [issueBuildingId, setIssueBuildingId] = useState(buildings[0]?.id || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [issuePriority, setIssuePriority] = useState<PriorityLevel>('high');
  const [issueAssignedTo, setIssueAssignedTo] = useState('Facilities Supervisor');

  const handleCreateDrillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBuilding = buildings.find((b) => b.id === drillBuildingId) || buildings[0];

    createDrill({
      institutionId: selectedBuilding.institutionId,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      hazardType: drillHazard,
      title: drillTitle,
      scenarioNotes: `Simulated ${drillHazard} emergency response procedure. Complete evacuation to primary assembly point.`,
      scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      targetDurationSeconds: Number(drillTargetTime),
      status: 'planned',
      participantsExpected: selectedBuilding.occupancyCapacity || 500,
      participantsAccountedFor: 0,
      leadCoordinatorId: 'stf-01',
      leadCoordinatorName: 'Marcus Vance',
      isDemo: true,
      floorCheckins: [
        { id: `chk-${Date.now()}-1`, floorId: 'f1', floorLabel: 'Ground Floor', wardenName: 'Assigned Warden', accountedCount: 0, expectedCount: 200, status: 'pending' },
        { id: `chk-${Date.now()}-2`, floorId: 'f2', floorLabel: 'Level 1', wardenName: 'Assigned Warden', accountedCount: 0, expectedCount: 180, status: 'pending' },
      ],
      observations: [],
    });

    onClose();
  };

  const handleCreateIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;
    const selectedBuilding = buildings.find((b) => b.id === issueBuildingId) || buildings[0];

    createSafetyIssue({
      institutionId: selectedBuilding.institutionId,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      sourceType: 'manual',
      title: issueTitle,
      description: 'Reported via Quick Action. Verification and remedial work required immediately.',
      priority: issuePriority,
      assignedToName: issueAssignedTo,
      assignedToRole: 'Assigned Lead',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      status: 'open',
    });

    setIssueTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Safety Action"
      description="Record a new mock emergency drill or flag an outstanding safety corrective action."
      maxWidth="md"
    >
      <div className="flex border-b border-brand-border mb-4">
        <button
          type="button"
          onClick={() => setTab('drill')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'drill'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-graphite-500 hover:text-brand-graphite-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Schedule Mock Drill
        </button>
        <button
          type="button"
          onClick={() => setTab('issue')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'issue'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-graphite-500 hover:text-brand-graphite-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Report Safety Issue
        </button>
      </div>

      {tab === 'drill' ? (
        <form onSubmit={handleCreateDrillSubmit} className="space-y-3.5">
          <Select
            label="Target Building"
            value={drillBuildingId}
            onChange={(e) => setDrillBuildingId(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </Select>

          <Select
            label="Hazard Type"
            value={drillHazard}
            onChange={(e) => {
              const h = e.target.value as HazardType;
              setDrillHazard(h);
              setDrillTitle(`Scheduled ${h.charAt(0).toUpperCase() + h.slice(1)} Response Simulation`);
            }}
          >
            <option value="fire">Fire & Smoke Evacuation</option>
            <option value="earthquake">Earthquake — Drop, Cover & Hold</option>
            <option value="flood">Flood & Severe Weather Ingress</option>
            <option value="chemical">Hazardous Material / Lab Chemical Leak</option>
            <option value="medical">Mass Casualty / Medical Emergency</option>
          </Select>

          <Input
            label="Drill Title"
            value={drillTitle}
            onChange={(e) => setDrillTitle(e.target.value)}
            required
          />

          <Input
            label="Target Evacuation Time (Seconds)"
            type="number"
            value={drillTargetTime}
            onChange={(e) => setDrillTargetTime(Number(e.target.value))}
            min={60}
            max={1800}
            helperText="e.g. 300 seconds (5 minutes) for multi-floor evacuation"
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Flame}>
              Create Drill
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateIssueSubmit} className="space-y-3.5">
          <Select
            label="Target Building"
            value={issueBuildingId}
            onChange={(e) => setIssueBuildingId(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </Select>

          <Input
            label="Issue Title / Observation"
            placeholder="e.g. South egress corridor emergency sign light defective"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={issuePriority}
              onChange={(e) => setIssuePriority(e.target.value as PriorityLevel)}
            >
              <option value="critical">Critical (Immediate safety hazard)</option>
              <option value="high">High (Address within 48h)</option>
              <option value="medium">Medium (Scheduled maintenance)</option>
              <option value="low">Low (Cosmetic / Informational)</option>
            </Select>

            <Input
              label="Assignee"
              value={issueAssignedTo}
              onChange={(e) => setIssueAssignedTo(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={AlertTriangle}>
              Record Corrective Action
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
