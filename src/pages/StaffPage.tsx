import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Users2,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserCheck,
} from 'lucide-react';
import { formatDateString } from '../utils/formatters';

export const StaffPage: React.FC = () => {
  const { staff, buildings } = useData();
  const [filterRole, setFilterRole] = useState('all');

  const getBuildingName = (buildingId: string) => {
    const b = buildings.find((bld) => bld.id === buildingId);
    return b ? b.name : 'All Campus Facilities';
  };

  const filteredStaff = staff.filter((s) => {
    if (filterRole === 'all') return true;
    return s.emergencyRole.toLowerCase().includes(filterRole.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="Institutional Wardens & Safety Leadership"
        description="Designated campus safety officers, emergency triage personnel, and floor sweep marshals."
        actions={
          <Button
            size="sm"
            variant="outline"
            icon={UserCheck}
            onClick={() => alert('Warden Onboarding: Assign new staff member to emergency response duty roster.')}
          >
            Assign New Warden
          </Button>
        }
      />

      {/* Role Filter Tabs */}
      <div className="bg-white border border-brand-border rounded p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-brand-graphite-500 uppercase font-mono mr-2">
            Role Filter:
          </span>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'chief', label: 'Chief Safety' },
            { id: 'building', label: 'Building Wardens' },
            { id: 'floor', label: 'Floor Wardens' },
            { id: 'first aid', label: 'First Aid Officers' },
            { id: 'facility', label: 'Facility Managers' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setFilterRole(role.id)}
              className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                filterRole === role.id
                  ? 'bg-brand-red text-white border-brand-red shadow-xs'
                  : 'bg-white border-brand-border text-brand-graphite-700 hover:bg-brand-graphite-50'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-brand-graphite-500 font-mono">
          {filteredStaff.length} active emergency wardens
        </span>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-brand-border rounded p-5 shadow-xs hover:border-brand-graphite-400 transition-colors flex flex-col justify-between"
          >
            <div>
              {/* Role badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded font-mono">
                  {member.emergencyRole}
                </span>

                {member.trainingCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    TRAINED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    REFRESHER DUE
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-brand-graphite-900">
                {member.name}
              </h3>
              <p className="text-xs text-brand-graphite-500 mb-3">
                {member.title} &bull; {member.department}
              </p>

              {/* Assignment details */}
              <div className="p-3 bg-brand-graphite-50 rounded border border-brand-border text-xs space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-brand-graphite-800">
                  <Building2 className="w-3.5 h-3.5 text-brand-graphite-500 flex-shrink-0" />
                  <span className="font-semibold truncate">
                    {getBuildingName(member.assignedBuildingId)}
                  </span>
                </div>
                <div className="text-[11px] text-brand-graphite-500">
                  Last Drill Certification: {formatDateString(member.lastTrainedDate)}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
              <a
                href={`tel:${member.phone}`}
                className="font-mono font-bold text-brand-graphite-700 hover:text-brand-red flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{member.phone}</span>
              </a>

              <a
                href={`mailto:${member.email}`}
                className="text-brand-graphite-500 hover:text-brand-graphite-900"
                title={member.email}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
