'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Compass,
  Send,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  Paperclip,
  ExternalLink,
  ShieldCheck,
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
        setAssignedReqNumber(data.request?.request_number || 105);
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
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Authenticating secure client portal...</div>
        </div>
      </div>
    );
  }

  if (!portalData?.project) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm max-w-md text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-lg font-bold text-zinc-900">Portal Inactive or Link Expired</h2>
            <p className="text-xs text-zinc-600">
              This request portal link has either expired or was revoked by your project lead. Please contact your agency project manager for an updated access link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { project, requests = [], changeOrders = [] } = portalData;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 flex-1 w-full">
        {/* Project Branding & Portal Header */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {project.agencyName} · Client Intake Portal
              </span>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mt-0.5">
                {project.name}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Authorized Organization: <strong className="text-zinc-800">{project.companyName}</strong> (Project Ref: {project.code})
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Scope Portal</span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Welcome, <strong>{project.clientName}</strong>. Use this portal to submit new feature requests, revisions, or technical adjustments. Every request is formally logged and cited against your agreement baseline.
          </p>
        </div>

        {/* Submit Request Box */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Submit a Project Request / Modification</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Please describe your requirements clearly. Our engineering team reviews all requests within 1 business day.
            </p>
          </div>

          {submittedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Request #{assignedReqNumber} Logged Successfully!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Your request has been recorded into the project decision engine. The engineering team has been notified and is cross-referencing your request with the contract baseline.
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-2 text-xs font-semibold text-emerald-800 underline"
                >
                  Submit another request
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  value={submitterEmail}
                  placeholder="name@company.com"
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Request Title / Feature Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add Multi-Currency Switcher and Apple Pay checkout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden bg-white"
                >
                  <option value="low">Low (Next milestone)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Required for launch)</option>
                  <option value="critical">Critical (Blocking work)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Detailed Description & Context
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain the background, goals, user workflow, and any deadlines..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 text-xs border border-zinc-200 rounded-xl focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>SSL Encrypted & Recorded in Project History</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting & Classifying...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Previous Requests & Change Orders Status */}
        <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Submitted Requests & Change Orders</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Track the official review status of all items submitted under this agreement.
            </p>
          </div>

          {/* Change Orders Ready for Review */}
          {changeOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Official Change Orders
              </h3>
              <div className="space-y-2">
                {changeOrders.map((co: any) => (
                  <div
                    key={co.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-600">{co.order_number}</span>
                        <span className="font-semibold text-zinc-900">{co.title}</span>
                        <StatusChip status={co.status} />
                      </div>
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        Amount: <strong>${Number(co.total_amount).toLocaleString()} {co.currency}</strong> · Delivery Impact: +{co.schedule_delay_days} days
                      </span>
                    </div>

                    <Link
                      href={`/portal/${token}/change-orders/${co.id}?token=${co.client_access_token}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs self-start sm:self-auto"
                    >
                      <span>Review & Sign</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requests History List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Intake History
            </h3>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden">
              {requests.map((r: any) => (
                <div key={r.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 font-bold">#{r.request_number}</span>
                      <span className="font-semibold text-zinc-900">{r.title}</span>
                      <StatusChip status={r.status} />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                      &quot;{r.raw_message}&quot;
                    </p>
                  </div>

                  <span className="text-[11px] text-zinc-400 shrink-0">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
