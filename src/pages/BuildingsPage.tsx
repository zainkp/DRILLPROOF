import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Layers,
  MapPin,
  Users,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Building } from '../types';

export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildings, floors, user, createBuilding, deleteBuilding } = useData();

  const isAdmin = user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [qrModalBuilding, setQrModalBuilding] = useState<Building | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Stage A Simple Creation Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Building['type']>('academic');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://drillproof.io';
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Building name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Building address or location is required.');
      return;
    }

    // Stage A: Create Building and navigate directly to its central details configuration page
    const newBld = createBuilding({
      name: name.trim(),
      type,
      address: address.trim(),
      description: description.trim() || undefined,
    });

    // Reset form
    setName('');
    setAddress('');
    setDescription('');
    setRegisterModalOpen(false);

    // Direct navigation to central Stage B configuration
    navigate(`/buildings/${newBld.id}`);
  };

  const handleDelete = (bld: Building) => {
    if (!isAdmin) return;
    if (
      window.confirm(
        `Are you sure you want to remove "${bld.name}" from active facilities? All associated floor rosters and egress plans will be removed.`
      )
    ) {
      deleteBuilding(bld.id);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <PageHeader
        title="Campus Facilities Registry"
        description="Oversee institutional facilities, emergency passports, digital floor maps, and egress corridors."
        breadcrumbs={[{ label: 'Facilities' }]}
        actions={
          isAdmin ? (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => {
                setFormError(null);
                setRegisterModalOpen(true);
              }}
            >
              Add Building
            </Button>
          ) : (
            <span className="text-xs font-mono text-brand-graphite-500 bg-brand-graphite-100 px-3 py-1.5 rounded border border-brand-border">
              Staff View &bull; Read-Only
            </span>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-3 rounded border border-brand-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-brand-graphite-400" />
          <input
            type="text"
            placeholder="Search facility by name, building code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-graphite-500 whitespace-nowrap">Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded border border-brand-border px-2.5 py-1.5 bg-white text-brand-graphite-800 focus:border-brand-red focus:outline-none"
          >
            <option value="all">All Classifications</option>
            <option value="academic">Academic Blocks</option>
            <option value="administrative">Administrative</option>
            <option value="residential">Residential / Hostels</option>
            <option value="laboratory">Laboratories</option>
            <option value="healthcare">Healthcare</option>
            <option value="assembly">Assembly</option>
          </select>
        </div>
      </div>

      {/* Buildings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBuildings.length === 0 ? (
          <div className="col-span-full bg-white border border-brand-border rounded p-12 text-center">
            <Building2 className="w-10 h-10 text-brand-graphite-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-brand-graphite-800">No facilities located</h3>
            <p className="text-xs text-brand-graphite-500 mt-1">
              Try adjusting your search query or add a new building.
            </p>
            {isAdmin && (
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setRegisterModalOpen(true)}
                className="mt-4"
              >
                Add Building
              </Button>
            )}
          </div>
        ) : (
          filteredBuildings.map((building) => {
            const buildingFloors = floors.filter((f) => f.buildingId === building.id);
            const publicUrl = `${getOrigin()}/building/${building.slug || building.id}`;

            return (
              <div
                key={building.id}
                className="bg-white border border-brand-border rounded shadow-xs hover:border-brand-graphite-400 transition-all flex flex-col justify-between"
              >
                <div className="p-5">
                  {/* Top line with code and classification badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-brand-red tracking-wider uppercase">
                      {building.code}
                    </span>
                    <Badge variant="default" size="sm" className="capitalize text-[10px]">
                      {building.type}
                    </Badge>
                  </div>

                  {/* Title & Address */}
                  <h3 className="text-base font-bold text-brand-graphite-900 leading-tight">
                    <Link
                      to={`/buildings/${building.id}`}
                      className="hover:text-brand-red transition-colors"
                    >
                      {building.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-brand-graphite-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-graphite-400 flex-shrink-0" />
                    <span className="truncate">{building.address}</span>
                  </p>

                  {building.description && (
                    <p className="mt-2 text-xs text-brand-graphite-600 line-clamp-2 leading-relaxed">
                      {building.description}
                    </p>
                  )}

                  {/* Facility Quick Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-brand-border text-center font-mono text-xs">
                    <div className="bg-brand-graphite-50 p-2 rounded">
                      <span className="text-[10px] text-brand-graphite-500 uppercase block">Levels</span>
                      <span className="font-bold text-brand-graphite-900">
                        {buildingFloors.length || building.totalFloors}
                      </span>
                    </div>

                    <div className="bg-brand-graphite-50 p-2 rounded">
                      <span className="text-[10px] text-brand-graphite-500 uppercase block">Exits</span>
                      <span className="font-bold text-brand-graphite-900">
                        {buildingFloors.reduce((acc, f) => acc + (f.exits?.length || 0), 0)}
                      </span>
                    </div>

                    <div className="bg-brand-graphite-50 p-2 rounded">
                      <span className="text-[10px] text-brand-graphite-500 uppercase block">Muster</span>
                      <span className="font-bold text-brand-graphite-900">
                        {building.assemblyPoints?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="px-5 py-3 bg-brand-graphite-50/70 border-t border-brand-border flex items-center justify-between text-xs">
                  <Link
                    to={`/buildings/${building.id}`}
                    className="font-semibold text-brand-red hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isAdmin ? 'Manage Details' : 'View Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQrModalBuilding(building)}
                      className="p-1.5 text-brand-graphite-600 hover:text-brand-red rounded hover:bg-white transition-colors"
                      title="Open Emergency Passport QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(building)}
                        className="p-1.5 text-brand-graphite-400 hover:text-red-600 rounded hover:bg-white transition-colors"
                        title="Delete Building"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stage A — Simple Create Building Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New Facility"
        description="Step 1: Enter initial building details. Full configuration (floors, exits, floor plans) is managed on the details page."
        maxWidth="md"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 text-brand-red border border-red-200 rounded text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Building Name"
            placeholder="e.g. Life Sciences Research Block"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Facility Classification"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="academic">Academic Classrooms & Lecture Halls</option>
            <option value="administrative">Administrative & Office HQ</option>
            <option value="residential">Residential Hall / Student Hostel</option>
            <option value="laboratory">Science & Chemical Laboratory</option>
            <option value="healthcare">Health Centre & Clinic</option>
            <option value="assembly">Auditorium & Multi-Purpose Hall</option>
          </Select>

          <Input
            label="Address / Campus Location"
            placeholder="e.g. 14 North Innovation Way, Sector 4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1 font-mono">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of facility operations, occupants, or special hazards..."
              className="w-full text-xs p-2.5 rounded border border-brand-border focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none bg-white text-brand-graphite-900"
            />
          </div>

          <div className="pt-3 border-t border-brand-border flex items-center justify-between">
            <span className="text-[11px] text-brand-graphite-500 font-mono">
              Stage 1 of 2 &bull; Directs to setup page
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegisterModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Create & Configure
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Emergency Passport QR Modal */}
      {qrModalBuilding && (
        <Modal
          isOpen={!!qrModalBuilding}
          onClose={() => setQrModalBuilding(null)}
          title={`Emergency Passport: ${qrModalBuilding.name}`}
          description="Public mobile emergency guide. Print and affix this QR code to entrances, elevator foyers, and stairwells."
          maxWidth="sm"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-4 bg-white border-2 border-brand-graphite-950 rounded shadow-md mb-4 relative">
              <QRCodeSVG
                value={`${getOrigin()}/building/${qrModalBuilding.slug || qrModalBuilding.id}`}
                size={190}
                level="M"
              />
            </div>

            <span className="font-mono text-xs font-bold text-brand-graphite-800 bg-brand-graphite-100 px-2 py-0.5 rounded mb-2">
              PASSPORT ID: {qrModalBuilding.code}
            </span>

            <p className="text-xs font-mono text-brand-graphite-700 text-center break-all mb-4 px-2 select-all">
              {`${getOrigin()}/building/${qrModalBuilding.slug || qrModalBuilding.id}`}
            </p>

            <div className="flex flex-col w-full gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={copiedUrl ? Check : Copy}
                onClick={() =>
                  handleCopyUrl(
                    `${getOrigin()}/building/${qrModalBuilding.slug || qrModalBuilding.id}`
                  )
                }
                className="w-full"
              >
                {copiedUrl ? 'Copied to Clipboard!' : 'Copy Emergency Link'}
              </Button>

              <Link
                to={`/building/${qrModalBuilding.slug || qrModalBuilding.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button size="sm" variant="primary" icon={ExternalLink} className="w-full">
                  Open Public Passport
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
