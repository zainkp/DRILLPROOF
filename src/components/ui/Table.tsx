import React from 'react';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto border border-brand-border rounded bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`bg-brand-graphite-50/80 border-b border-brand-border text-[11px] font-semibold tracking-wider text-brand-graphite-600 uppercase ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <tbody className={`divide-y divide-brand-border text-brand-graphite-800 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}> = ({ children, className = '', onClick, isClickable = false }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        isClickable || onClick
          ? 'cursor-pointer hover:bg-brand-graphite-50/80 active:bg-brand-graphite-100/50'
          : 'hover:bg-brand-graphite-50/40'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <th className={`px-4 py-3 font-semibold text-brand-graphite-700 select-none ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({
  children,
  className = '',
  colSpan,
}) => {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 text-sm leading-normal ${className}`}>
      {children}
    </td>
  );
};
