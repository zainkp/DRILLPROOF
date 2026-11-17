import React from 'react';

export const LoadingState: React.FC<{ message?: string; count?: number }> = ({
  message = 'Loading data...',
  count = 3,
}) => {
  return (
    <div className="space-y-3 p-4">
      {message && (
        <div className="flex items-center gap-2 text-xs font-medium text-brand-graphite-500 mb-2">
          <div className="w-3.5 h-3.5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-14 bg-brand-graphite-100/70 animate-pulse rounded border border-brand-border/60"
        />
      ))}
    </div>
  );
};
