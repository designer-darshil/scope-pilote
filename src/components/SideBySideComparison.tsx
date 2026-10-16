'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
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
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Top Banner / Request Header */}
      <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-zinc-200/60 rounded text-zinc-700">
            REQ #{request.request_number}
          </span>
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">{request.title}</h3>
          <StatusChip status={request.status} />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Submitted by <strong className="text-zinc-700">{request.submitted_by_name}</strong></span>
          <span>·</span>
          <span>Urgency: <strong className="uppercase text-zinc-700 font-semibold">{request.urgency}</strong></span>
        </div>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        {/* Left Column: Original Scope Baseline */}
        <div className="p-6 space-y-4 bg-zinc-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Original Scope Baseline (Signed Agreement)
              </h4>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
              Versioned & Immutable
            </span>
          </div>

          <div className="space-y-3">
            {cls?.cited_source_excerpts && cls.cited_source_excerpts.length > 0 ? (
              cls.cited_source_excerpts.map((excerpt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-indigo-900 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Cited: {excerpt.document_title} — {excerpt.section}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded">
                      {excerpt.relevance}
                    </span>
                  </div>
                  <blockquote className="italic text-zinc-700 border-l-2 border-indigo-400 pl-2.5 py-0.5 text-xs font-serif bg-white/60 rounded-r">
                    &ldquo;{excerpt.excerpt}&rdquo;
                  </blockquote>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic p-3 bg-zinc-100/60 rounded-lg">
                Click &quot;Run AI Analysis&quot; to cross-reference with active deliverables.
              </div>
            )}

            {/* Relevant Agreed Deliverables checklist */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                Agreed Contract Scope Checklist ({deliverables.length} Items)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {deliverables.map((d) => (
                  <div
                    key={d.id}
                    className={`p-2 rounded-lg border text-xs flex items-start justify-between gap-2 transition-colors ${
                      d.is_explicitly_excluded
                        ? 'bg-rose-50/50 border-rose-200/60 text-rose-900'
                        : 'bg-white border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1.5">
                        {d.is_explicitly_excluded ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span>{d.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{d.description}</p>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        d.is_explicitly_excluded
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {d.is_explicitly_excluded ? 'Explicit Exclusion' : d.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: New Request & AI Advisory Classifier */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                New Client Request
              </h4>
            </div>
            <button
              onClick={handleClassify}
              disabled={analyzing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{cls ? 'Re-Analyze Scope' : 'Analyze with AI'}</span>
            </button>
          </div>

          {/* Client's raw message */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-2">
            <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
              &quot;{request.raw_message}&quot;
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
              <Clock className="w-3.5 h-3.5" />
              <span>Received {new Date(request.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* AI Advisory Classification Card */}
          {cls && (
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-600">AI Scope Determination:</span>
                  <StatusChip status={cls.outcome} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                  <span>Confidence:</span>
                  <span className="font-bold text-indigo-600">
                    {(cls.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Confidence progress meter */}
              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cls.confidence_score >= 0.8
                      ? 'bg-emerald-500'
                      : cls.confidence_score >= 0.6
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${cls.confidence_score * 100}%` }}
                />
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                {cls.reasoning}
              </p>

              {/* Impact estimates if out of scope or needs review */}
              {cls.outcome !== 'in_scope' && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200/80 text-center">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Hours</span>
                    <span className="text-sm font-bold text-zinc-900">{cls.suggested_hours}h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Proposed Cost</span>
                    <span className="text-sm font-bold text-indigo-600">${cls.suggested_cost}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Delay</span>
                    <span className="text-sm font-bold text-zinc-900">+{cls.suggested_schedule_days}d</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <span>Advisory suggestion only. Final commitments require explicit human confirmation.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision Action Bar */}
      <div className="px-6 py-4 border-t border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-500">
          {request.status === 'change_order_created' ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Change Order created for this request.
            </span>
          ) : request.status === 'accepted_in_scope' ? (
            <span className="text-zinc-700 font-medium">
              Request marked as included in original scope.
            </span>
          ) : (
            <span>Select an action to record this scope decision into the immutable audit history.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {request.status !== 'accepted_in_scope' && (
            <button
              onClick={() => handleQuickDecision('accepted_in_scope')}
              disabled={actionLoading}
              className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              Accept as In-Scope
            </button>
          )}

          {request.status !== 'change_order_created' && (
            <button
              onClick={() => setCoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convert to Change Order</span>
            </button>
          )}

          {request.status !== 'rejected' && (
            <button
              onClick={() => handleQuickDecision('rejected')}
              disabled={actionLoading}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
            >
              Decline Request
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
