import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'symbol-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withTagline?: boolean;
  className?: string;
  linkTo?: string;
  lightBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  withTagline = true,
  className = '',
  linkTo = '/',
  lightBackground = true,
}) => {
  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Logo Symbol */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <img
          src="/drillproof-logo.jpg"
          alt="DRILLPROOF Logo"
          className={`object-contain rounded-md ${
            size === 'sm'
              ? 'h-8 w-8'
              : size === 'md'
              ? 'h-10 w-10'
              : size === 'lg'
              ? 'h-14 w-14'
              : 'h-20 w-20'
          }`}
        />
      </div>

      {/* Brand Typography */}
      {variant !== 'symbol-only' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-wider">
            <span
              className={`font-black font-sans uppercase leading-none ${
                size === 'sm'
                  ? 'text-base tracking-widest'
                  : size === 'md'
                  ? 'text-lg tracking-wider'
                  : size === 'lg'
                  ? 'text-2xl tracking-widest'
                  : 'text-3xl tracking-widest'
              } ${lightBackground ? 'text-brand-graphite-900' : 'text-white'}`}
            >
              DRILL<span className="text-brand-red">PROOF</span>
            </span>
          </div>
          {withTagline && variant === 'full' && (
            <span
              className={`font-semibold tracking-wider uppercase ${
                size === 'sm'
                  ? 'text-[9px] mt-0.5'
                  : size === 'md'
                  ? 'text-[10px] mt-0.5'
                  : size === 'lg'
                  ? 'text-xs mt-1'
                  : 'text-sm mt-1.5'
              } ${lightBackground ? 'text-brand-graphite-600' : 'text-brand-graphite-300'}`}
            >
              Prepared. Proven.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded">
        {content}
      </Link>
    );
  }

  return content;
};
