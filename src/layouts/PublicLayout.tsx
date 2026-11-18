import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { LogIn, Menu, X } from 'lucide-react';
import { useData } from '../hooks/useData';

export const PublicLayout: React.FC = () => {
  const { user } = useData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-graphite-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-brand-border bg-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] md:h-20 flex items-center justify-between">
          <BrandLogo
            variant="full"
            size="header"
            linkTo="/"
            ariaLabel="DRILLPROOF home"
            onClick={handleHomeClick}
          />

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              to="/"
              onClick={handleHomeClick}
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={`text-sm py-1 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded ${
                location.pathname === '/'
                  ? 'font-bold text-brand-graphite-950 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-red'
                  : 'font-medium text-brand-graphite-600 hover:text-brand-graphite-950'
              }`}
            >
              Home
            </Link>

            <Link
              to={user ? "/dashboard" : "/login"}
              aria-current={location.pathname.startsWith('/dashboard') ? 'page' : undefined}
              className={`text-sm py-1 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded ${
                location.pathname.startsWith('/dashboard')
                  ? 'font-bold text-brand-graphite-950 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-red'
                  : 'font-medium text-brand-graphite-600 hover:text-brand-graphite-950'
              }`}
            >
              Operations Dashboard
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-brand-graphite-950 text-white hover:bg-black text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
              <span>Administrator Login</span>
            </Link>
          </nav>

          {/* Mobile Menu Button (< md) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-brand-graphite-700 hover:text-brand-graphite-950 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav-menu"
            aria-label="Main"
            className="md:hidden border-t border-brand-border bg-white px-4 py-3 space-y-1 shadow-subtle"
          >
            <Link
              to="/"
              onClick={handleHomeClick}
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={`flex items-center min-h-[44px] px-3 py-2 text-sm rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                location.pathname === '/'
                  ? 'font-bold text-brand-graphite-950 border-l-2 border-brand-red pl-2.5 bg-brand-graphite-50/70'
                  : 'font-medium text-brand-graphite-700 hover:bg-brand-graphite-50'
              }`}
            >
              Home
            </Link>

            <Link
              to={user ? "/dashboard" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={location.pathname.startsWith('/dashboard') ? 'page' : undefined}
              className={`flex items-center min-h-[44px] px-3 py-2 text-sm rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                location.pathname.startsWith('/dashboard')
                  ? 'font-bold text-brand-graphite-950 border-l-2 border-brand-red pl-2.5 bg-brand-graphite-50/70'
                  : 'font-medium text-brand-graphite-700 hover:bg-brand-graphite-50'
              }`}
            >
              Operations Dashboard
            </Link>

            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 min-h-[44px] w-full bg-brand-graphite-950 text-white hover:bg-black text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
                <span>Administrator Login</span>
              </Link>
            </div>
          </nav>
        )}
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
