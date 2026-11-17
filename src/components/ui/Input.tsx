import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, icon: Icon, children, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);
    const hasAddon = Boolean(Icon || children);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-brand-graphite-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded border px-3 py-2 text-sm text-brand-graphite-900 placeholder:text-brand-graphite-400 bg-white transition-colors
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-brand-border hover:border-brand-graphite-400 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none'
              }
              ${hasAddon ? 'pr-9' : ''}
              ${className}`}
            {...props}
          />
          {hasAddon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-graphite-400 flex items-center justify-center">
              {Icon ? <Icon className="w-4 h-4" /> : children}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-brand-graphite-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
