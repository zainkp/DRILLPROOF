import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { ShieldCheck, LogIn, ExternalLink, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useData } from '../hooks/useData';

export const PublicLayout: React.FC = () => {
  const { user } = useData();

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-graphite-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-brand-border bg-white/95 backdrop-blur-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo variant="full" size="md" linkTo="/" />

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="text-xs font-semibold text-brand-graphite-700 hover:text-brand-red px-3 py-1.5 rounded transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>Operations Dashboard</span>
            </Link>

            <Link
              to="/building/academic-block"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-graphite-700 hover:text-brand-red px-3 py-1.5 rounded transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Demo QR Plan</span>
              <ExternalLink className="w-3.5 h-3.5 text-brand-graphite-400" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-brand-graphite-950 text-white hover:bg-black text-xs font-semibold px-4 py-2 rounded transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:outline-none"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-red" />
              <span>Administrator Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-brand-border bg-white py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-brand-border">
            <div>
              <BrandLogo variant="full" size="md" linkTo="/" />
              <p className="mt-2 text-xs text-brand-graphite-600 max-w-md leading-relaxed">
                Institutional Emergency Readiness & Verification Platform. Bridging the operational gap between documented safety plans and actual emergency execution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-brand-graphite-700 font-medium font-mono">
              <Link to={user ? "/dashboard" : "/login"} className="hover:text-brand-red transition-colors">
                Platform Operations
              </Link>
              <Link to="/login" className="hover:text-brand-red transition-colors">
                Administrator Sign In
              </Link>
              <Link to="/building/academic-block" className="hover:text-brand-red transition-colors">
                Academic Block QR Plan
              </Link>
              <Link to="/building/student-residence" className="hover:text-brand-red transition-colors">
                Hostel Residence QR Plan
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-brand-graphite-500 font-mono">
            <p>
              &copy; {new Date().getFullYear()} DRILLPROOF. Prepared. Proven. Prototype v0.1.0.
            </p>
            <p className="max-w-xl text-left sm:text-right font-sans text-brand-graphite-400 text-[11px] leading-relaxed">
              Disclaimer: DRILLPROOF is an institutional readiness and drill management tool. It complements local emergency services and trained emergency personnel; it does not provide automated sensor dispatch or certification of statutory compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
