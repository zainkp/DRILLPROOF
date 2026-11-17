import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC<{ items?: BreadcrumbItem[] }> = ({ items }) => {
  const location = useLocation();

  // If explicit items provided, use them; otherwise infer from pathname
  const crumbItems: BreadcrumbItem[] = items || (() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/dashboard' }];

    let accPath = '';
    paths.forEach((p, idx) => {
      accPath += `/${p}`;
      if (p === 'dashboard') return;

      const readableLabel = p
        .replace(/-/g, ' ')
        .replace(/^(bld|insp|drl|iss)-/, '')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      crumbs.push({
        label: readableLabel,
        path: idx === paths.length - 1 ? undefined : accPath,
      });
    });

    return crumbs;
  })();

  if (crumbItems.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-brand-graphite-500 mb-2 select-none overflow-x-auto">
      <Link
        to="/dashboard"
        className="flex items-center text-brand-graphite-500 hover:text-brand-graphite-800 transition-colors"
        title="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbItems.slice(1).map((crumb, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-brand-graphite-300 flex-shrink-0" />
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="hover:text-brand-graphite-900 transition-colors truncate max-w-[140px]"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-semibold text-brand-graphite-900 truncate max-w-[200px]">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
