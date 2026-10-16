'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Compass,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Send,
  Printer,
  Copy,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';
import { SideBySideComparison } from '@/components/SideBySideComparison';
import { ChangeOrderModal } from '@/components/ChangeOrderModal';

export default function ProjectCommandCenter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'scope' | 'changeOrders' | 'analytics' | 'timeline'>('requests');
  const [copiedPortal, setCopiedPortal] = useState(false);

  // New deliverable modal/form state
  const [newDelivOpen, setNewDelivOpen] = useState(false);
  const [delivTitle, setDelivTitle] = useState('');
  const [delivDesc, setDelivDesc] = useState('');
  const [delivCategory, setDelivCategory] = useState('Core Feature');
  const [delivExcluded, setDelivExcluded] = useState(false);

  // New request manual intake state
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Change order modal
  const [manualCoOpen, setManualCoOpen] = useState(false);

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();
      setProjectData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const copyPortalLink = () => {
    if (!projectData?.project?.portal_token) return;
    const url = `${window.location.origin}/portal/${projectData.project.portal_token}`;
    navigator.clipboard.writeText(url);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivTitle) return;
    try {
      await fetch(`/api/projects/${projectId}/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: delivTitle,
          description: delivDesc,
          category: delivCategory,
          is_explicitly_excluded: delivExcluded,
        }),
      });
      setDelivTitle('');
      setDelivDesc('');
      setDelivExcluded(false);
      setNewDelivOpen(false);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!confirm('Remove this deliverable from the baseline scope?')) return;
    try {
      await fetch(`/api/projects/${projectId}/deliverables?deliverableId=${deliverableId}`, {
        method: 'DELETE',
      });
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqMessage) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reqTitle,
          raw_message: reqMessage,
          urgency: reqUrgency,
          submitted_by_name: projectData?.project?.client_name || 'Client Contact',
          submitted_by_email: projectData?.project?.contact_email || 'client@example.com',
        }),
      });
      const data = await res.json();
      if (res.ok && data.request?.id) {
        // Auto-run AI classifier
        await fetch(`/api/requests/${data.request.id}/classify`, { method: 'POST' });
      }
      setReqTitle('');
      setReqMessage('');
      setNewRequestOpen(false);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChangeOrder = async (changeOrderId: string) => {
    try {
      await fetch(`/api/change-orders/${changeOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent_to_client' }),
      });
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !projectData) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading Project Scope Command Center...</span>
          </div>
        </div>
      </div>
    );
  }

  const { project, deliverables, requests, changeOrders, stats, documents } = projectData;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        {/* Project Header Banner */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded">
                  {project.code}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Scope Baseline v{project.active_scope_version}
                </span>
                <StatusChip status={project.status} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {project.name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-500">
                Client: <strong className="text-zinc-800">{project.client_name}</strong> · {project.company_name} ({project.contact_email}) · Base Rate: ${project.client_hourly_rate}/hr
              </p>
            </div>

            {/* Quick Metrics & Portal Link */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Fixed Baseline</span>
                <span className="text-base font-bold text-zinc-900">
                  ${Number(project.contract_value).toLocaleString()}
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Recovered Revenue</span>
                <span className="text-base font-bold text-emerald-700">
                  +${Number(stats.recoveredRevenue).toLocaleString()}
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 uppercase font-semibold block">Scope Drift</span>
                <span className="text-base font-bold text-amber-800">
                  {stats.driftScore}%
                </span>
              </div>

              {/* Client Portal Quick Access button */}
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/portal/${project.portal_token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl shadow-2xs hover:bg-zinc-50 transition-colors"
                >
                  <span>Open Client Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <button
                  onClick={copyPortalLink}
                  className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 shadow-2xs transition-colors"
                  title="Copy secret client portal link"
                >
                  {copiedPortal ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Intake Requests & AI Comparisons ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scope')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'scope'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Agreed SOW & Deliverables ({deliverables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('changeOrders')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'changeOrders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Change Orders & Approvals ({changeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Scope Drift Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit History</span>
          </button>
        </div>

        {/* TAB 1: Intake Requests & Side-by-Side Comparison */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Client Requests & Scope Decision Engine
                </h2>
                <p className="text-xs text-zinc-500">
                  Incoming requests from the client portal are cited against the active agreement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewRequestOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Request (Email / Slack)</span>
                </button>
              </div>
            </div>

            {/* Manual request logger dialog */}
            {newRequestOpen && (
              <form onSubmit={handleManualCreateRequest} className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                    Log Informal Client Request (Slack / Email)
                  </h3>
                  <button type="button" onClick={() => setNewRequestOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-xs">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Request Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Export transaction logs to CSV"
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Urgency</label>
                    <select
                      value={reqUrgency}
                      onChange={(e: any) => setReqUrgency(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Client&apos;s Message or Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Paste the raw message from the client..."
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save & Run AI Scope Classifier</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of side-by-side requests */}
            <div className="space-y-6">
              {requests.map((request: any) => (
                <SideBySideComparison
                  key={request.id}
                  request={request}
                  deliverables={deliverables}
                  documents={documents}
                  hourlyRate={Number(project.client_hourly_rate || 150)}
                  onUpdated={loadProject}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Scope & Deliverables Checklist */}
        {activeTab === 'scope' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Agreed Deliverables Checklist (Baseline Scope v{project.active_scope_version})
                </h2>
                <p className="text-xs text-zinc-500">
                  Clear boundaries prevent disputes. Mark items that are explicitly excluded.
                </p>
              </div>

              <button
                onClick={() => setNewDelivOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deliverable / Exclusion</span>
              </button>
            </div>

            {/* Add Deliverable Form */}
            {newDelivOpen && (
              <form onSubmit={handleCreateDeliverable} className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                    Add Scope Deliverable or Boundary
                  </h3>
                  <button type="button" onClick={() => setNewDelivOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-xs">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Deliverable Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Automated PDF Receipt Generation"
                      value={delivTitle}
                      onChange={(e) => setDelivTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
                    <select
                      value={delivCategory}
                      onChange={(e) => setDelivCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden bg-white"
                    >
                      <option value="Core Feature">Core Feature</option>
                      <option value="Design/UI">Design/UI</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Out of Scope Boundary">Out of Scope Boundary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Description & Acceptance Criteria</label>
                  <textarea
                    rows={2}
                    placeholder="Details about what is included or excluded..."
                    value={delivDesc}
                    onChange={(e) => setDelivDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-rose-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={delivExcluded}
                      onChange={(e) => setDelivExcluded(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Mark as Explicit Out-of-Scope Exclusion</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Save Deliverable
                  </button>
                </div>
              </form>
            )}

            {/* Checklist items */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
              <div className="divide-y divide-zinc-200">
                {deliverables.map((deliv: any) => (
                  <div
                    key={deliv.id}
                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                      deliv.is_explicitly_excluded ? 'bg-rose-50/30' : 'hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {deliv.is_explicitly_excluded ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span className="text-sm font-bold text-zinc-900">{deliv.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            deliv.is_explicitly_excluded
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {deliv.is_explicitly_excluded ? 'Explicit Exclusion' : deliv.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 pl-6">{deliv.description}</p>
                      {deliv.acceptance_criteria && (
                        <p className="text-[11px] text-zinc-400 pl-6 italic">
                          Acceptance: {deliv.acceptance_criteria}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteDeliverable(deliv.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-zinc-100"
                      title="Remove deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Saved Agreement Documents
              </h3>
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-semibold text-zinc-900">{doc.title}</span>
                        <span className="text-zinc-400 ml-2">Version {doc.version} · {doc.document_type}</span>
                      </div>
                    </div>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      {doc.extracted_text.length} chars indexed for AI citation
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Change Orders & Approvals */}
        {activeTab === 'changeOrders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Formal Change Orders & Approvals
                </h2>
                <p className="text-xs text-zinc-500">
                  Turn out-of-scope work into billable addendums with digital signatures.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualCoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft Change Order</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {changeOrders.map((co: any) => {
                const approvalUrl = `/portal/${project.portal_token}/change-orders/${co.id}?token=${co.client_access_token}`;

                return (
                  <div
                    key={co.id}
                    className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded">
                          {co.order_number}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900">{co.title}</h3>
                        <StatusChip status={co.status} />
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-zinc-400">Total:</span>
                        <span className="text-lg font-extrabold text-zinc-900">
                          ${Number(co.total_amount).toLocaleString()} {co.currency}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="font-semibold text-zinc-700">+{co.schedule_delay_days} days</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{co.description}</p>

                    {/* Line items breakdown */}
                    <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-2">Hours</th>
                            <th className="py-2 px-2">Rate</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white">
                          {(co.line_items || []).map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 px-3 text-zinc-800">{item.description}</td>
                              <td className="py-2 px-2 text-zinc-600">{item.hours}h</td>
                              <td className="py-2 px-2 text-zinc-600">${item.rate}/h</td>
                              <td className="py-2 px-3 text-right font-medium text-zinc-900">
                                ${(item.amount || item.hours * item.rate).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Approval or Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      {co.approval ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Digitally Signed by <strong>{co.approval.approver_name}</strong> on{' '}
                            {new Date(co.approval.decided_at).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500">
                          Status: <strong className="text-zinc-700 capitalize">{co.status.replace(/_/g, ' ')}</strong>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {co.status === 'draft' && (
                          <button
                            onClick={() => handleSendChangeOrder(co.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send to Client for Sign-off</span>
                          </button>
                        )}

                        <Link
                          href={approvalUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors"
                        >
                          <span>Client Sign-off Page</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </Link>

                        <button
                          onClick={() => window.print()}
                          className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-lg border border-zinc-200 hover:bg-zinc-50"
                          title="Print / Export to PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <ChangeOrderModal
              isOpen={manualCoOpen}
              onClose={() => setManualCoOpen(false)}
              onSaved={loadProject}
              projectId={projectId}
              initialHourlyRate={Number(project.client_hourly_rate || 150)}
            />
          </div>
        )}

        {/* TAB 4: Scope Drift Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Scope Drift Score
                </span>
                <div className="text-3xl font-extrabold text-zinc-900">{stats.driftScore}%</div>
                <p className="text-xs text-zinc-500">
                  {stats.outOfScopeRequests} of {stats.totalRequests} client requests were out of scope
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Recovered Revenue
                </span>
                <div className="text-3xl font-extrabold text-emerald-600">
                  +${stats.recoveredRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-zinc-500">
                  From {stats.approvedChangeOrders} approved change orders
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Schedule Extension
                </span>
                <div className="text-3xl font-extrabold text-zinc-900">
                  +{stats.totalScheduleDelayDays} Days
                </div>
                <p className="text-xs text-zinc-500">
                  Officially agreed buffer added to completion date
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">
                Scope Defense Protection Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-zinc-700">Out of Scope Requests (Flagged & Quoted)</span>
                    <span className="font-bold text-zinc-900">{stats.outOfScopeRequests}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${stats.totalRequests ? (stats.outOfScopeRequests / stats.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-zinc-700">In Scope Requests (Covered without surcharge)</span>
                    <span className="font-bold text-zinc-900">{stats.inScopeRequests}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${stats.totalRequests ? (stats.inScopeRequests / stats.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-zinc-700">Pending Review / Ambiguous</span>
                    <span className="font-bold text-zinc-900">{stats.needsReviewRequests}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${stats.totalRequests ? (stats.needsReviewRequests / stats.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Timeline & Audit History */}
        {activeTab === 'timeline' && (
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Immutable Project Event History
                </h2>
                <p className="text-xs text-zinc-500">
                  Chronological audit trail of all scope modifications, SOW uploads, classifications, and approvals.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
              {requests.map((r: any) => (
                <div key={r.id} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-zinc-800">Client Request #{r.request_number} Submitted</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-400">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    &quot;{r.title}&quot; by {r.submitted_by_name}
                  </p>
                  {r.classification && (
                    <div className="text-[11px] text-indigo-600 font-medium">
                      Classified as <strong className="uppercase">{r.classification.outcome.replace('_', ' ')}</strong> (Confidence: {(r.classification.confidence_score * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              ))}

              {changeOrders.map((co: any) => (
                <div key={co.id} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-zinc-800">Change Order {co.order_number} ({co.status.toUpperCase()})</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-400">{new Date(co.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Amount: ${Number(co.total_amount).toLocaleString()} USD · Delay: +{co.schedule_delay_days} days
                  </p>
                  {co.approval && (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Approved by {co.approval.approver_name} on {new Date(co.approval.decided_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
