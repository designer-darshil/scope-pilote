import React from 'react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const normalized = status.toLowerCase();
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (normalized) {
    case 'in_scope':
    case 'accepted_in_scope':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          In Scope
        </span>
      );
    case 'out_of_scope':
    case 'change_order_created':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Out of Scope
        </span>
      );
    case 'needs_review':
    case 'pending_classification':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5" />
          Needs Review
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${padding}`}>
          <svg className="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Rejected
        </span>
      );
    case 'sent_to_client':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
          Sent to Client
        </span>
      );
    case 'draft':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${padding}`}>
          Draft
        </span>
      );
    case 'active':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 ${padding}`}>
          Active
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${padding}`}>
          {status.replace(/_/g, ' ')}
        </span>
      );
  }
}
