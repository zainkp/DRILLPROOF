import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const base =
    'inline-flex items-center font-medium border select-none rounded';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 leading-tight',
    md: 'text-xs px-2.5 py-1 gap-2 leading-tight',
  };

  const variantStyles = {
    default: 'bg-brand-graphite-100 text-brand-graphite-700 border-brand-graphite-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    outline: 'bg-white text-brand-graphite-700 border-brand-border',
  };

  const dotColors = {
    default: 'bg-brand-graphite-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    info: 'bg-blue-500',
    outline: 'bg-brand-graphite-500',
  };

  return (
    <span className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
