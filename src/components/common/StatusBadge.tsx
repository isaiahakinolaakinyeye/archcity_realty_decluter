import React from 'react';

type StatusType =
  | 'AVAILABLE'
  | 'PARTIALLY SOLD'
  | 'SOLD OUT'
  | 'PAID'
  | 'PARTIALLY PAID'
  | 'UNPAID'
  | 'BUYER'
  | 'SELLER'
  | 'BOTH'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'AVAILABLE':
      styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
      dotColor = 'bg-blue-500';
      break;

    case 'PARTIALLY SOLD':
      styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
      dotColor = 'bg-amber-500';
      break;

    // Section 8 & 59: Completely sold items should have a subtle green background/tint
    case 'SOLD OUT':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300/80';
      dotColor = 'bg-emerald-500';
      break;

    case 'PAID':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;

    case 'PARTIALLY PAID':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'UNPAID':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;

    case 'BUYER':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      dotColor = 'bg-purple-500';
      break;

    case 'SELLER':
      styles = 'bg-teal-50 text-teal-700 border-teal-200';
      dotColor = 'bg-teal-500';
      break;

    case 'BOTH':
      styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
  }

  const sizeStyles =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold tracking-wide';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${styles} ${sizeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {normalized}
    </span>
  );
};
