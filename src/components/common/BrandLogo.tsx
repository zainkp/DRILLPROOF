import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'symbol-only';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  withTagline?: boolean;
  className?: string;
  linkTo?: string;
  lightBackground?: boolean;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  withTagline = true,
  className = '',
  linkTo = '/',
  lightBackground = true,
  ariaLabel,
  onClick,
}) => {
  const isHeader = size === 'header';

  const content = (
    <div
      className={`inline-flex items-center select-none ${
        isHeader ? 'gap-3' : 'gap-3'
      } ${className}`}
    >
      {/* Brand Logo Symbol */}
      {isHeader ? (
        /* Precision CSS crop of the shield mark (excluding baked-in card text and white padding) */
        <div
          data-testid="brand-logo-mark"
          className="relative flex-shrink-0 overflow-hidden rounded h-[34px] w-[32px] md:h-[42px] md:w-[39px]"
          style={{ aspectRatio: '300 / 323' }}
        >
          <img
            src="/drillproof-logo.jpg"
            alt="DRILLPROOF mark"
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '209.33%',
              height: '193.81%',
              top: '-25.7%',
              left: '-59.33%',
              objectFit: 'fill',
            }}
          />
        </div>
      ) : (
        /* Default rendering preserved exactly for other usages (sidebar, footer, login) */
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
      )}

      {/* Brand Typography */}
      {variant !== 'symbol-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span
              className={`font-black font-sans uppercase leading-none ${
                isHeader
                  ? 'text-lg md:text-[22px] tracking-tight'
                  : size === 'sm'
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
              className={`${
                isHeader
                  ? 'text-[11px] md:text-xs font-medium text-brand-graphite-500 mt-1 leading-none tracking-normal'
                  : `font-semibold tracking-wider uppercase ${
                      size === 'sm'
                        ? 'text-[9px] mt-0.5'
                        : size === 'md'
                        ? 'text-[10px] mt-0.5'
                        : size === 'lg'
                        ? 'text-xs mt-1'
                        : 'text-sm mt-1.5'
                    } ${lightBackground ? 'text-brand-graphite-600' : 'text-brand-graphite-300'}`
              }`}
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
      <Link
        to={linkTo}
        aria-label={ariaLabel}
        onClick={onClick}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded inline-flex items-center"
      >
        {content}
      </Link>
    );
  }

  return content;
};
