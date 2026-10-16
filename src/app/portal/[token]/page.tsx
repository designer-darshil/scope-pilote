'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  Lock,
  ExternalLink,
  Shield,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function ClientIntakePortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [assignedReqNumber, setAssignedReqNumber] = useState<number | null>(null);

  const loadPortal = async () => {
    try {
      const res = await fetch(`/api/portal/${token}`);
      if (!res.ok) throw new Error('Portal link invalid or expired');
      const data = await res.json();
      setPortalData(data);
      if (data.project?.clientName && !submitterName) {
        setSubmitterName(data.project.clientName);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !submitterName) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          submitterName,
          submitterEmail: submitterEmail || `${submitterName.toLowerCase().replace(/\s+/g, '')}@client.com`,
          urgency,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAssignedReqNumber(data.request?.request_number || 106);
        setSubmittedSuccess(true);
        setTitle('');
        setMessage('');
        loadPortal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-400 font-mono text-xs">Authenticating client portal session...</div>
        </div>
      </div>
    );
  }

  if (!portalData?.project) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 bg-white rounded border border-[#E5E5E0] shadow-sm max-w-md text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <h2 className="text-base font-bold text-zinc-900">Portal Inactive or Expired</h2>
            <p className="text-xs text-zinc-500">
              This request portal link has expired or was revoked. Please contact your agency project manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { project, requests = [], changeOrders = [] } = portalData;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans selection:bg-[#EFF3FE] selection:text-[#2547D0]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        {/* Project Branding & Portal Header */}
        <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                {project.agencyName} · Client Request Intake
              </span>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight mt-0.5">
                {project.name}
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Authorized Organization: <strong className="text-zinc-800 font-sans">{project.companyName}</strong> (Project Ref: {project.code})
              </p>
            </div>

            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
              Verified Session
            </span>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Welcome, <strong>{project.clientName}</strong>. Use this portal to submit new requests, feature additions, or modifications. Every request is cross-referenced against your signed Statement of Work.
          </p>
        </div>

        {/* Submit Request Box */}
        <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 pb-2.5">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#2547D0]" />
              <span>Submit a Project Request or Revision</span>
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Please provide clear requirements. Requests are analyzed against agreement deliverables within 1 business day.
            </p>
          </div>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Request #{assignedReqNumber} Logged Successfully</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Your request has been recorded into the project decision engine. The engineering team has been notified.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="text-[11px] font-semibold text-emerald-900 underline mt-1"
              >
                Submit another request
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  value={submitterEmail}
                  placeholder="name@company.com"
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Request Title / Feature Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add Multi-Currency Switcher for European customers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden bg-white"
                >
                  <option value="low">Low (Next milestone)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Required for launch)</option>
                  <option value="critical">Critical (Blocking work)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Detailed Description & Context
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the background, user workflow, and target goals..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400 font-mono">
                SSL Encrypted & Recorded in Project History
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Orders Ready for Review */}
        {changeOrders.length > 0 && (
          <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Formal Change Orders Pending Review
            </h3>
            <div className="space-y-2">
              {changeOrders.map((co: any) => (
                <div
                  key={co.id}
                  className="p-3.5 rounded bg-[#FBFBFA] border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-700">{co.order_number}</span>
                      <span className="font-semibold text-zinc-900">{co.title}</span>
                      <StatusChip status={co.status} />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">
                      Fee: <strong>${Number(co.total_amount).toLocaleString()} {co.currency}</strong> · Delivery Impact: +{co.schedule_delay_days} days
                    </span>
                  </div>

                  <Link
                    href={`/portal/${token}/change-orders/${co.id}?token=${co.client_access_token}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs self-start sm:self-auto"
                  >
                    <span>Review & Authorize</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Requests Table */}
        <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Intake Request History
          </h3>
          <div className="divide-y divide-zinc-200 border border-[#E5E5E0] rounded overflow-hidden">
            {requests.map((r: any) => (
              <div key={r.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 font-bold">#{r.request_number}</span>
                    <span className="font-semibold text-zinc-900">{r.title}</span>
                    <StatusChip status={r.status} />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                    &ldquo;{r.raw_message}&rdquo;
                  </p>
                </div>

                <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
