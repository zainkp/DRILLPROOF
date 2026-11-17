import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Flame,
  AlertTriangle,
  BarChart3,
  Users2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { readinessSummary, buildings } = useData();

  const primaryBuilding = buildings[0] || { slug: 'academic-block' };

  const navItems = [
    {
      label: 'Readiness Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Buildings & Plans',
      path: '/buildings',
      icon: Building2,
      badge: buildings.length.toString(),
    },
    {
      label: 'Safety Inspections',
      path: '/inspections',
      icon: ClipboardCheck,
      badge: readinessSummary.pendingInspectionsCount > 0 ? readinessSummary.pendingInspectionsCount : null,
      badgeVariant: 'warning',
    },
    {
      label: 'Mock Drills',
      path: '/drills',
      icon: Flame,
      badge: readinessSummary.plannedDrillsCount > 0 ? `${readinessSummary.plannedDrillsCount} due` : null,
      badgeVariant: 'info',
    },
    {
      label: 'Corrective Actions',
      path: '/issues',
      icon: AlertTriangle,
      badge: readinessSummary.openIssuesCount > 0 ? readinessSummary.openIssuesCount : null,
      badgeVariant: 'critical',
    },
    {
      label: 'Readiness Reports',
      path: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      label: 'Staff & Wardens',
      path: '/staff',
      icon: Users2,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-graphite-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-brand-border bg-white transition-all duration-200 select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'w-64'}
        `}
      >
        {/* Brand Area */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-brand-border bg-white">
          {isCollapsed ? (
            <div className="mx-auto">
              <BrandLogo variant="symbol-only" size="sm" linkTo="/dashboard" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <BrandLogo variant="compact" size="sm" withTagline={false} linkTo="/dashboard" />
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 text-brand-graphite-400 hover:text-brand-graphite-800 rounded hover:bg-brand-graphite-100 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-graphite-400">
            {!isCollapsed && 'Operations'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-colors group relative ${
                    isActive
                      ? 'bg-brand-red text-white shadow-xs'
                      : 'text-brand-graphite-700 hover:bg-brand-graphite-100/80 hover:text-brand-graphite-900'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-brand-graphite-500 group-hover:text-brand-graphite-800'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeVariant === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : item.badgeVariant === 'info'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-brand-graphite-100 text-brand-graphite-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-graphite-400">
            {!isCollapsed && 'Occupant Portal'}
          </div>

          {/* Direct link to public emergency building page */}
          <NavLink
            to={`/building/${primaryBuilding.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded text-brand-graphite-600 hover:bg-brand-graphite-100 hover:text-brand-red transition-colors group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Open Public QR Emergency Page"
          >
            <ExternalLink className="w-4 h-4 text-brand-graphite-400 group-hover:text-brand-red flex-shrink-0" />
            {!isCollapsed && (
              <span className="flex-1 truncate">Public QR Page</span>
            )}
          </NavLink>
        </div>

        {/* Footer / System Status */}
        <div className="border-t border-brand-border p-3 bg-brand-graphite-50/50">
          {isCollapsed ? (
            <div className="flex justify-center">
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 text-brand-graphite-400 hover:text-brand-graphite-800 rounded hover:bg-brand-graphite-200 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="rounded border border-brand-border bg-white p-2.5">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-brand-graphite-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
                  Readiness Engine
                </span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">ONLINE</span>
              </div>
              <p className="text-[10px] text-brand-graphite-500 leading-tight">
                Simulated institutional readiness engine.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
