import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { User } from '../../types';

interface ClosingCtaProps {
  user: User | null;
}

export const ClosingCta: React.FC<ClosingCtaProps> = ({ user }) => {
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-brand-graphite-950 text-white border-b border-brand-graphite-800 relative overflow-hidden"
      aria-label="Call to action"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Restyled Status Pill in Sentence Case */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-graphite-900 border border-brand-graphite-700 text-xs text-brand-graphite-300 mb-6 font-normal">
          <span>Ready for deployment</span>
          <span className="text-brand-graphite-600">/</span>
          <span className="text-white font-medium">Prepared, proven</span>
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Turn your institution's emergency plans into verified operational readiness.
        </h2>

        {/* Section Lead Copy */}
        <p className="mt-4 text-sm sm:text-base text-brand-graphite-300 max-w-2xl mx-auto leading-relaxed">
          Review live campus facility readiness scores, launch a timed mock evacuation drill, or audit safety assets in the Northstar Campus management system.
        </p>

        {/* Evacuation Route Vector Line drawing into the Primary Button */}
        <div className="relative mt-10 pt-2 pb-2">
          {/* SVG Evacuation Route Line: draws left to right into the muster destination */}
          <div className="hidden sm:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 pointer-events-none">
            <svg
              viewBox="0 0 900 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Route Path (Left margin to button entry at x=310) */}
              <path
                d="M 20,20 L 260,20"
                stroke="#E51C23"
                strokeWidth="2"
                strokeDasharray="300"
                strokeDashoffset={inView || prefersReducedMotion ? 0 : 300}
                style={{
                  transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              {/* Muster point convergence circle right before button */}
              <circle
                cx="260"
                cy="20"
                r="4"
                fill="#E51C23"
                opacity={inView || prefersReducedMotion ? 1 : 0}
                style={{ transition: 'opacity 300ms ease 1.1s' }}
              />
              <circle
                cx="260"
                cy="20"
                r="8"
                stroke="#E51C23"
                strokeWidth="1"
                fill="none"
                opacity={inView || prefersReducedMotion ? 0.6 : 0}
                style={{ transition: 'opacity 300ms ease 1.2s' }}
              />
            </svg>
          </div>

          {/* Three Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary Action Button (Assembly Point Target) */}
            <Link to={user ? '/dashboard' : '/login'} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-graphite-950 focus-visible:ring-brand-red"
              >
                Explore the Platform
              </Button>
            </Link>

            {/* Secondary Action: Administrator Login */}
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto border-brand-graphite-700 bg-brand-graphite-800 text-white hover:bg-brand-graphite-700 font-medium"
              >
                Administrator Login
              </Button>
            </Link>

            {/* Quiet Secondary: Public Building QR Plan */}
            <Link
              to="/building/academic-block"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-brand-graphite-300 border-brand-graphite-700 hover:border-brand-graphite-500 hover:text-white bg-transparent font-normal"
              >
                Inspect Public Building QR Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Restyled Footer Line in Sentence Case */}
        <p className="mt-8 text-xs text-brand-graphite-500 font-normal">
          Interactive prototype, seeded with fictional Northstar Institute campus data
        </p>
      </div>
    </section>
  );
};