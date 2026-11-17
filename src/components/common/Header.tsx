import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  Shield,
  RotateCcw,
  LogOut,
  ChevronDown,
  Building2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { NotificationDrawer } from './NotificationDrawer';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenQuickAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenQuickAction,
}) => {
  const {
    institution,
    user,
    readinessSummary,
    activities,
    resetToDefaults,
    loginAsDemoUser,
    logout,
  } = useData();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('build') || q.includes('acad') || q.includes('floor')) {
      navigate('/buildings');
    } else if (q.includes('drill') || q.includes('evac')) {
      navigate('/drills');
    } else if (q.includes('insp') || q.includes('check')) {
      navigate('/inspections');
    } else if (q.includes('issue') || q.includes('action')) {
      navigate('/issues');
    } else if (q.includes('staff') || q.includes('warden')) {
      navigate('/staff');
    } else {
      navigate('/dashboard');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      resetToDefaults();
      setProfileDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-brand-border bg-white px-4 sm:px-6 select-none">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-brand-graphite-600 hover:text-brand-graphite-900 rounded hover:bg-brand-graphite-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Institution Info Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-graphite-800 bg-brand-graphite-50 px-2.5 py-1.5 rounded border border-brand-border/90">
          <Building2 className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[220px]">
            {institution.name}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.2 bg-white text-[10px] font-mono text-brand-graphite-600 rounded border border-brand-border">
            {institution.code}
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-graphite-400" />
          <input
            type="text"
            placeholder="Search buildings, emergency plans, drills, or corrective actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full rounded border py-1.5 pl-9 pr-4 text-xs text-brand-graphite-900 placeholder:text-brand-graphite-400 bg-brand-graphite-50 transition-all ${
              searchFocused
                ? 'border-brand-red bg-white ring-1 ring-brand-red'
                : 'border-brand-border hover:border-brand-graphite-400'
            }`}
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Readiness score pill */}
        <Link
          to="/dashboard"
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-brand-graphite-50 border border-brand-border hover:border-brand-graphite-400 transition-colors"
          title="System Readiness Score (Click to view breakdown)"
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-graphite-500">
            Readiness
          </span>
          <span
            className={`text-xs font-mono font-bold ${
              readinessSummary.overallReadinessScore >= 80
                ? 'text-emerald-700'
                : readinessSummary.overallReadinessScore >= 60
                ? 'text-amber-700'
                : 'text-red-700'
            }`}
          >
            {readinessSummary.overallReadinessScore}%
          </span>
        </Link>

        {/* Public QR Demo Quick Button */}
        <Link
          to="/building/academic-block"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-brand-graphite-600 hover:text-brand-red px-2.5 py-1.5 rounded hover:bg-brand-graphite-50 transition-colors border border-transparent hover:border-brand-border"
          title="Preview public QR mobile emergency page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Public QR Page</span>
        </Link>

        {/* Quick Action Button */}
        {onOpenQuickAction && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onOpenQuickAction}
            className="hidden sm:inline-flex"
          >
            Action
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-brand-graphite-600 hover:text-brand-graphite-900 rounded hover:bg-brand-graphite-100 transition-colors"
            title="Readiness activity updates"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red ring-2 ring-white" />
            )}
          </button>
          <NotificationDrawer
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            activities={activities}
          />
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-brand-graphite-100 text-brand-graphite-800 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-brand-graphite-800 text-white flex items-center justify-center font-bold text-xs uppercase font-mono border border-brand-graphite-700">
              {user ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-brand-graphite-900">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-brand-graphite-500 uppercase font-mono">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-brand-graphite-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-11 w-64 rounded bg-white shadow-xl border border-brand-border py-1.5 z-50 text-left">
              <div className="px-3 py-2 border-b border-brand-border bg-brand-graphite-50/50">
                <p className="text-xs font-bold text-brand-graphite-900">
                  {user?.name}
                </p>
                <p className="text-[11px] text-brand-graphite-500 truncate">
                  {user?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-mono bg-brand-graphite-100 text-brand-graphite-700 px-1.5 py-0.5 rounded">
                  {user?.title}
                </span>
              </div>

              {/* Demo Mode Role Switcher */}
              <div className="px-3 py-2 border-b border-brand-border text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-graphite-400 block mb-1.5">
                  Demo Role Switch
                </span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      loginAsDemoUser('admin');
                      setProfileDropdownOpen(false);
                    }}
                    className={`px-2 py-1 text-[11px] rounded text-center font-medium ${
                      user?.role === 'admin'
                        ? 'bg-brand-red text-white'
                        : 'bg-brand-graphite-100 text-brand-graphite-700 hover:bg-brand-graphite-200'
                    }`}
                  >
                    Admin Mode
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoUser('safety_officer');
                      setProfileDropdownOpen(false);
                    }}
                    className={`px-2 py-1 text-[11px] rounded text-center font-medium ${
                      user?.role === 'safety_officer'
                        ? 'bg-brand-red text-white'
                        : 'bg-brand-graphite-100 text-brand-graphite-700 hover:bg-brand-graphite-200'
                    }`}
                  >
                    Safety Officer
                  </button>
                </div>
              </div>

              {/* Data Reset Button */}
              <button
                onClick={handleResetData}
                className="w-full px-3 py-2 text-left text-xs text-brand-graphite-700 hover:bg-brand-graphite-50 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-graphite-500" />
                <span>Reset Demo Sample Data</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-brand-border mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Demo Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
