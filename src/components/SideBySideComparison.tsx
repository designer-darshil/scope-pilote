'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { ClientRequest, Deliverable, SourceDocument } from '@/lib/types';
import { StatusChip } from './StatusChip';
import { ChangeOrderModal } from './ChangeOrderModal';

interface SideBySideComparisonProps {
  request: ClientRequest;
  deliverables: Deliverable[];
  documents: SourceDocument[];
  hourlyRate: number;
  onUpdated: () => void;
}

export function SideBySideComparison({
  request,
  deliverables,
  documents,
  hourlyRate,
  onUpdated,
}: SideBySideComparisonProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [coModalOpen, setCoModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const cls = request.classification;

  // Run or re-run AI classifier
  const handleClassify = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/classify`, {
        method: 'POST',
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickDecision = async (decision: 'accepted_in_scope' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded border border-[#E5E5E0] shadow-2xs overflow-hidden">
      {/* Top Banner / Request Header */}
      <div className="px-5 py-3 border-b border-[#E5E5E0] bg-[#FBFBFA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-zinc-100 rounded text-zinc-700">
            REQ #{request.request_number}
          </span>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{request.title}</h3>
          <StatusChip status={request.status} />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>Submitted by <strong className="text-zinc-800 font-sans">{request.submitted_by_name}</strong></span>
          <span>·</span>
          <span className="uppercase text-zinc-700 font-semibold">{request.urgency} Urgency</span>
        </div>
      </div>

      {/* Side-by-Side Dual Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E0]">
        {/* Left Column: Original Scope Baseline Evidence */}
        <div className="p-5 space-y-3 bg-[#FBFBFA]/60">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>Contract Baseline Evidence</span>
            </div>
            <span className="font-mono text-zinc-400">Signed SOW Baseline</span>
          </div>

          <div className="space-y-2.5">
            {cls?.cited_source_excerpts && cls.cited_source_excerpts.length > 0 ? (
              cls.cited_source_excerpts.map((excerpt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-[#E5E5E0] bg-white text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-zinc-800 font-medium text-[11px]">
                    <span className="font-semibold text-zinc-900">
                      Cited: {excerpt.document_title} — {excerpt.section}
                    </span>
                    <span className="text-[10px] uppercase font-mono font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded">
                      {excerpt.relevance}
                    </span>
                  </div>
                  <blockquote className="italic text-zinc-700 border-l-2 border-zinc-400 pl-2.5 py-0.5 text-xs font-serif leading-relaxed">
                    &ldquo;{excerpt.excerpt}&rdquo;
                  </blockquote>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded border border-[#E5E5E0]">
                Click &quot;Analyze Scope&quot; to cross-reference with active deliverables.
              </div>
            )}

            {/* Relevant Agreed Deliverables checklist */}
            <div className="pt-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Baseline Scope Checklist ({deliverables.length} Deliverables)
              </span>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {deliverables.map((d) => (
                  <div
                    key={d.id}
                    className={`p-2 rounded border text-xs flex items-start justify-between gap-2 ${
                      d.is_explicitly_excluded
                        ? 'bg-rose-50/40 border-rose-200/80 text-rose-950'
                        : 'bg-white border-[#E5E5E0] text-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1.5 text-xs">
                        {d.is_explicitly_excluded ? (
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                        <span>{d.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{d.description}</p>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                        d.is_explicitly_excluded
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {d.is_explicitly_excluded ? 'Exclusion' : d.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: New Client Request & AI Advisory */}
        <div className="p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span>Incoming Client Request</span>
            </div>
            <button
              onClick={handleClassify}
              disabled={analyzing}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2547D0] hover:text-[#1D3BB3] transition-colors"
            >
              <RotateCcw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{cls ? 'Re-Analyze Scope' : 'Analyze with AI'}</span>
            </button>
          </div>

          {/* Client's verbatim message */}
          <div className="p-3 rounded bg-[#FBFBFA] border border-[#E5E5E0] space-y-1.5">
            <p className="text-xs text-zinc-800 leading-relaxed font-sans">
              &ldquo;{request.raw_message}&rdquo;
            </p>
            <div className="text-[11px] text-zinc-400 font-mono">
              Received {new Date(request.created_at).toLocaleString()}
            </div>
          </div>

          {/* AI Advisory Classification Card */}
          {cls && (
            <div className="p-3.5 rounded border border-[#E5E5E0] bg-[#FBFBFA] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-700">Determination:</span>
                  <StatusChip status={cls.outcome} />
                </div>
                <div className="text-xs font-mono font-semibold text-zinc-800">
                  {(cls.confidence_score * 100).toFixed(0)}% Confidence
                </div>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed">
                {cls.reasoning}
              </p>

              {/* Impact estimates if out of scope or needs review */}
              {cls.outcome !== 'in_scope' && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200 text-center font-mono">
                  <div className="p-1.5 rounded bg-white border border-[#E5E5E0]">
                    <span className="block text-[10px] text-zinc-400 font-sans uppercase">Est. Hours</span>
                    <span className="text-xs font-bold text-zinc-900 tabular-nums">{cls.suggested_hours} hrs</span>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-[#E5E5E0]">
                    <span className="block text-[10px] text-zinc-400 font-sans uppercase">Proposed Price</span>
                    <span className="text-xs font-bold text-[#2547D0] tabular-nums">${cls.suggested_cost}</span>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-[#E5E5E0]">
                    <span className="block text-[10px] text-zinc-400 font-sans uppercase">Schedule Impact</span>
                    <span className="text-xs font-bold text-zinc-900 tabular-nums">+{cls.suggested_schedule_days} days</span>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-zinc-400 font-mono">
                * Advisory suggestion only. Formal commercial adjustments require authorized confirmation.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision Action Bar */}
      <div className="px-5 py-3 border-t border-[#E5E5E0] bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-500 font-mono text-[11px]">
          {request.status === 'change_order_created' ? (
            <span className="text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Change Order created for this request.
            </span>
          ) : request.status === 'accepted_in_scope' ? (
            <span className="text-zinc-700 font-medium">
              Confirmed as covered under baseline agreement.
            </span>
          ) : (
            <span>Select an action to record this scope decision into the immutable audit ledger.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {request.status !== 'accepted_in_scope' && (
            <button
              onClick={() => handleQuickDecision('accepted_in_scope')}
              disabled={actionLoading}
              className="px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded transition-colors"
            >
              Accept as In-Scope
            </button>
          )}

          {request.status !== 'change_order_created' && (
            <button
              onClick={() => setCoModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Convert to Change Order</span>
            </button>
          )}

          {request.status !== 'rejected' && (
            <button
              onClick={() => handleQuickDecision('rejected')}
              disabled={actionLoading}
              className="px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-rose-700 transition-colors"
            >
              Decline
            </button>
          )}
        </div>
      </div>

      {/* Change Order Generator Modal */}
      <ChangeOrderModal
        isOpen={coModalOpen}
        onClose={() => setCoModalOpen(false)}
        onSaved={() => onUpdated()}
        projectId={request.project_id}
        requestId={request.id}
        initialTitle={`Change Order: ${request.title}`}
        initialDescription={`Scope expansion based on Client Request #${request.request_number}: ${request.raw_message}`}
        initialHours={cls?.suggested_hours || 24}
        initialHourlyRate={hourlyRate}
        initialDelayDays={cls?.suggested_schedule_days || 5}
      />
    </div>
  );
}
