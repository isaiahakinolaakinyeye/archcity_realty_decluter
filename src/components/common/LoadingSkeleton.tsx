import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100/70 border-b border-slate-100 px-6 flex items-center">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        </div>
      ))}
    </div>
  </div>
);
