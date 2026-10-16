import React from 'react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const normalized = status.toLowerCase();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (normalized) {
    case 'in_scope':
    case 'accepted_in_scope':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          In Scope
        </span>
      );
    case 'out_of_scope':
    case 'change_order_created':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-amber-50 text-amber-900 border border-amber-200/80 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />
          Out of Scope
        </span>
      );
    case 'needs_review':
    case 'pending_classification':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-blue-50 text-blue-800 border border-blue-200/80 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
          Needs Review
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-emerald-50 text-emerald-900 border border-emerald-300 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-rose-50 text-rose-800 border border-rose-200/80 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
          Rejected
        </span>
      );
    case 'sent_to_client':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-zinc-100 text-zinc-800 border border-zinc-200 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mr-1.5" />
          Sent to Client
        </span>
      );
    case 'draft':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-zinc-100 text-zinc-700 border border-zinc-200 tracking-tight ${padding}`}>
          Draft
        </span>
      );
    case 'active':
      return (
        <span className={`inline-flex items-center font-medium rounded bg-zinc-100 text-zinc-800 border border-zinc-200 tracking-tight ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          Active
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded bg-zinc-100 text-zinc-700 border border-zinc-200 tracking-tight ${padding}`}>
          {status.replace(/_/g, ' ')}
        </span>
      );
  }
}
