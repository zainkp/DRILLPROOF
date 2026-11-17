import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ActivityItem } from '../../types';
import { CheckCircle2, AlertTriangle, Flame, ShieldAlert, ArrowRight, Bell } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'inspection':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'drill':
        return <Flame className="w-4 h-4 text-brand-orange" />;
      case 'issue':
        return <AlertTriangle className="w-4 h-4 text-brand-red" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-brand-graphite-600" />;
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded bg-white shadow-xl border border-brand-border z-50 overflow-hidden text-left"
    >
      <div className="px-4 py-3 bg-brand-graphite-50 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-graphite-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-graphite-800">
            Readiness & Safety Feed
          </span>
        </div>
        <span className="text-[11px] font-medium text-brand-graphite-500 bg-white px-1.5 py-0.5 rounded border border-brand-border">
          {activities.length} updates
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-brand-border">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-brand-graphite-500">
            No recent activity logged.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="p-3.5 hover:bg-brand-graphite-50/70 transition-colors flex gap-3 text-xs"
            >
              <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-semibold text-brand-graphite-900 truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-brand-graphite-400 whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-brand-graphite-600 line-clamp-2 leading-relaxed text-[11px]">
                  {item.description}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-brand-graphite-400">
                  <span>By {item.actorName}</span>
                  {item.targetUrl && (
                    <Link
                      to={item.targetUrl}
                      onClick={onClose}
                      className="text-brand-red font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      View <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-brand-graphite-50 border-t border-brand-border text-center">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="text-xs font-semibold text-brand-graphite-700 hover:text-brand-red transition-colors inline-block"
        >
          View Full Dashboard Operations
        </Link>
      </div>
    </div>
  );
};
