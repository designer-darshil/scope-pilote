'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Send,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle2,
  XCircle,
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

  // New deliverable state
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
    setTimeout(() => setCopiedPortal(false), 1500);
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
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
            <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#2547D0]" />
            <span>Loading project scope environment...</span>
          </div>
        </div>
      </div>
    );
  }

  const { project, deliverables, requests, changeOrders, stats, documents } = projectData;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans selection:bg-[#EFF3FE] selection:text-[#2547D0]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* Project Header Banner */}
        <div className="p-5 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                  {project.code}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                  Scope Baseline v{project.active_scope_version}
                </span>
                <StatusChip status={project.status} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                {project.name}
              </h1>

              <div className="text-xs text-zinc-500 font-mono">
                Client: <strong className="text-zinc-800 font-sans">{project.client_name}</strong> · {project.company_name} ({project.contact_email}) · Base Rate: ${project.client_hourly_rate}/hr
              </div>
            </div>

            {/* Metrics & Client Portal link */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1.5 rounded bg-[#FBFBFA] border border-[#E5E5E0] text-right font-mono">
                <span className="text-[10px] text-zinc-400 uppercase font-sans block">SOW Baseline</span>
                <span className="text-sm font-bold text-zinc-900 tabular-nums">
                  ${Number(project.contract_value).toLocaleString()}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-right font-mono">
                <span className="text-[10px] text-emerald-800 uppercase font-sans block">Recovered</span>
                <span className="text-sm font-bold text-emerald-800 tabular-nums">
                  +${Number(stats.recoveredRevenue).toLocaleString()}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded bg-amber-50 border border-amber-200 text-right font-mono">
                <span className="text-[10px] text-amber-800 uppercase font-sans block">Drift Rate</span>
                <span className="text-sm font-bold text-amber-900 tabular-nums">
                  {stats.driftScore}%
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/portal/${project.portal_token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded transition-colors"
                >
                  <span>Client Portal</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </Link>

                <button
                  onClick={copyPortalLink}
                  className="p-1 text-zinc-500 hover:text-zinc-800 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
                  title="Copy client portal URL"
                >
                  {copiedPortal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E5E5E0] flex flex-wrap gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'requests'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Requests & Scope Comparison ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scope')}
            className={`px-3.5 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'scope'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contract SOW & Deliverables ({deliverables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('changeOrders')}
            className={`px-3.5 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'changeOrders'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Change Orders & Sign-offs ({changeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Scope Drift Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* TAB 1: Intake Requests & Side-by-Side Comparison */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Client Requests & Scope Decision Engine
                </h2>
                <p className="text-xs text-zinc-500">
                  Incoming requests are cited against the active agreement baseline.
                </p>
              </div>

              <button
                onClick={() => setNewRequestOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Request (Email / Slack)</span>
              </button>
            </div>

            {/* Manual request logger dialog */}
            {newRequestOpen && (
              <form onSubmit={handleManualCreateRequest} className="p-4 bg-white rounded border border-[#E5E5E0] shadow-sm space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900">Log Client Request Manually</h3>
                  <button type="button" onClick={() => setNewRequestOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Request Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Export transaction logs to CSV"
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Urgency</label>
                    <select
                      value={reqUrgency}
                      onChange={(e: any) => setReqUrgency(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Raw Client Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Paste the verbatim client request..."
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    className="w-full p-2 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs"
                  >
                    <span>Save & Run AI Classifier</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of side-by-side requests */}
            <div className="space-y-4">
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Agreed Deliverables Checklist (Baseline Scope v{project.active_scope_version})
                </h2>
                <p className="text-xs text-zinc-500">
                  Explicit boundaries and core deliverables preventing unbilled revisions.
                </p>
              </div>

              <button
                onClick={() => setNewDelivOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deliverable / Exclusion</span>
              </button>
            </div>

            {/* Add Deliverable Form */}
            {newDelivOpen && (
              <form onSubmit={handleCreateDeliverable} className="p-4 bg-white rounded border border-[#E5E5E0] shadow-sm space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900">Add Scope Item</h3>
                  <button type="button" onClick={() => setNewDelivOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Automated PDF Receipt Generation"
                      value={delivTitle}
                      onChange={(e) => setDelivTitle(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Category</label>
                    <select
                      value={delivCategory}
                      onChange={(e) => setDelivCategory(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden bg-white"
                    >
                      <option value="Core Feature">Core Feature</option>
                      <option value="Design/UI">Design/UI</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Out of Scope Boundary">Out of Scope Boundary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Description & Acceptance Boundary</label>
                  <textarea
                    rows={2}
                    placeholder="Details about what is included or excluded..."
                    value={delivDesc}
                    onChange={(e) => setDelivDesc(e.target.value)}
                    className="w-full p-2 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-rose-800 cursor-pointer">
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
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded"
                  >
                    Save Deliverable
                  </button>
                </div>
              </form>
            )}

            {/* Checklist items */}
            <div className="bg-white rounded border border-[#E5E5E0] overflow-hidden shadow-2xs">
              <div className="divide-y divide-zinc-200">
                {deliverables.map((deliv: any) => (
                  <div
                    key={deliv.id}
                    className={`p-3.5 flex items-start justify-between gap-3 text-xs ${
                      deliv.is_explicitly_excluded ? 'bg-rose-50/20' : 'hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {deliv.is_explicitly_excluded ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-semibold text-zinc-900">{deliv.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium uppercase tracking-wider ${
                            deliv.is_explicitly_excluded
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {deliv.is_explicitly_excluded ? 'Exclusion Boundary' : deliv.category}
                        </span>
                      </div>
                      <p className="text-zinc-600 pl-5 leading-relaxed">{deliv.description}</p>
                      {deliv.acceptance_criteria && (
                        <p className="text-[11px] text-zinc-400 pl-5 italic font-serif">
                          Acceptance Criteria: {deliv.acceptance_criteria}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteDeliverable(deliv.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                      title="Remove deliverable"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents index */}
            <div className="p-4 bg-white rounded border border-[#E5E5E0] space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                Source Agreement Document
              </span>
              {documents.map((doc: any) => (
                <div key={doc.id} className="p-2.5 rounded bg-[#FBFBFA] border border-[#E5E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-medium text-zinc-900">{doc.title}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">Version {doc.version}</span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Indexed for AI citation
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Change Orders & Approvals */}
        {activeTab === 'changeOrders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Executed & Pending Change Orders
                </h2>
                <p className="text-xs text-zinc-500">
                  Formal contract amendments with itemized fees and digital signatures.
                </p>
              </div>

              <button
                onClick={() => setManualCoOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Draft Change Order</span>
              </button>
            </div>

            <div className="space-y-4">
              {changeOrders.map((co: any) => {
                const approvalUrl = `/portal/${project.portal_token}/change-orders/${co.id}?token=${co.client_access_token}`;

                return (
                  <div
                    key={co.id}
                    className="p-5 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                          {co.order_number}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900">{co.title}</h3>
                        <StatusChip status={co.status} />
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-zinc-400 font-sans">Total:</span>
                        <span className="text-sm font-bold text-zinc-900 tabular-nums">
                          ${Number(co.total_amount).toLocaleString()} {co.currency}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-zinc-700">+{co.schedule_delay_days} days</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{co.description}</p>

                    {/* Table of line items */}
                    <div className="border border-[#E5E5E0] rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FBFBFA] border-b border-[#E5E5E0] text-zinc-500 font-semibold text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-2 w-16">Hours</th>
                            <th className="py-2 px-2 w-20">Rate</th>
                            <th className="py-2 px-3 text-right w-24">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white font-mono text-xs">
                          {(co.line_items || []).map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-sans text-zinc-800">{item.description}</td>
                              <td className="py-2 px-2 text-zinc-600">{item.hours}h</td>
                              <td className="py-2 px-2 text-zinc-600">${item.rate}/hr</td>
                              <td className="py-2 px-3 text-right font-medium text-zinc-900">
                                ${(item.amount || item.hours * item.rate).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                      {co.approval ? (
                        <div className="text-[11px] text-emerald-800 font-mono">
                          Signed by <strong>{co.approval.approver_name}</strong> on {new Date(co.approval.decided_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500 font-mono">
                          Status: {co.status.toUpperCase()}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {co.status === 'draft' && (
                          <button
                            onClick={() => handleSendChangeOrder(co.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send to Client</span>
                          </button>
                        )}

                        <Link
                          href={approvalUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded"
                        >
                          <span>Sign-off View</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </Link>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 bg-white rounded border border-[#E5E5E0] space-y-1">
                <span className="text-[10px] font-sans font-semibold text-zinc-400 uppercase">Drift Index</span>
                <div className="text-2xl font-bold text-zinc-900 tabular-nums">{stats.driftScore}%</div>
                <p className="text-[11px] font-sans text-zinc-500">
                  {stats.outOfScopeRequests} of {stats.totalRequests} intake requests exceeded baseline
                </p>
              </div>

              <div className="p-4 bg-white rounded border border-[#E5E5E0] space-y-1">
                <span className="text-[10px] font-sans font-semibold text-zinc-400 uppercase">Recovered Revenue</span>
                <div className="text-2xl font-bold text-emerald-700 tabular-nums">+${stats.recoveredRevenue.toLocaleString()}</div>
                <p className="text-[11px] font-sans text-zinc-500">
                  From {stats.approvedChangeOrders} approved change orders
                </p>
              </div>

              <div className="p-4 bg-white rounded border border-[#E5E5E0] space-y-1">
                <span className="text-[10px] font-sans font-semibold text-zinc-400 uppercase">Schedule Extension</span>
                <div className="text-2xl font-bold text-zinc-900 tabular-nums">+{stats.totalScheduleDelayDays} Days</div>
                <p className="text-[11px] font-sans text-zinc-500">
                  Milestone buffer added to project delivery
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded border border-[#E5E5E0] space-y-3 text-xs">
              <h3 className="font-bold text-zinc-900 text-xs">Request Disposition Breakdown</h3>
              <div className="space-y-3 font-mono">
                <div>
                  <div className="flex justify-between mb-1 font-sans text-xs">
                    <span>Out-of-Scope (Converted to Change Order)</span>
                    <span className="font-mono font-bold">{stats.outOfScopeRequests}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{
                        width: `${stats.totalRequests ? (stats.outOfScopeRequests / stats.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-sans text-xs">
                    <span>In-Scope (Covered without revision)</span>
                    <span className="font-mono font-bold">{stats.inScopeRequests}</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${stats.totalRequests ? (stats.inScopeRequests / stats.totalRequests) * 100 : 0}%`,
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
          <div className="p-5 bg-white rounded border border-[#E5E5E0] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Immutable Project Event History
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">Cryptographic audit log</span>
            </div>

            <div className="relative pl-5 border-l border-zinc-200 space-y-4">
              {requests.map((r: any) => (
                <div key={r.id} className="relative space-y-0.5">
                  <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#2547D0]" />
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <span className="font-semibold text-zinc-800 font-sans">Client Request #{r.request_number} Logged</span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-zinc-700">
                    &ldquo;{r.title}&rdquo; by {r.submitted_by_name}
                  </p>
                  {r.classification && (
                    <div className="text-[11px] font-mono text-zinc-500">
                      Outcome: <strong className="uppercase text-zinc-800">{r.classification.outcome.replace('_', ' ')}</strong> ({(r.classification.confidence_score * 100).toFixed(0)}% confidence)
                    </div>
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
