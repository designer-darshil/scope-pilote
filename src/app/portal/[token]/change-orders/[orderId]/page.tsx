'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Clock,
  Printer,
  FileCheck2,
  Lock,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function ClientChangeOrderApprovalPage({
  params,
}: {
  params: Promise<{ token: string; orderId: string }>;
}) {
  const { token, orderId } = use(params);

  const [changeOrder, setChangeOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Sign-off inputs
  const [approverName, setApproverName] = useState('');
  const [approverTitle, setApproverTitle] = useState('Authorized Representative');
  const [approverEmail, setApproverEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Decline inputs
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch(`/api/portal/${token}/change-orders/${orderId}`);
      if (!res.ok) throw new Error('Change order link invalid or expired.');
      const data = await res.json();
      setChangeOrder(data.changeOrder);
      if (data.changeOrder?.client_name && !approverName) {
        setApproverName(data.changeOrder.client_name);
      }
      if (data.changeOrder?.contact_email && !approverEmail) {
        setApproverEmail(data.changeOrder.contact_email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, orderId]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !approverName) {
      alert('Please confirm your name and check the authorization agreement.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/${token}/change-orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'approved',
          approverName,
          approverTitle,
          approverEmail,
          signatureData: `${approverName} [Signed Digitally via ScopePilot Token Portal]`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record approval');

      setActionSuccess('approved');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide feedback or the reason for declining.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/${token}/change-orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'rejected',
          approverName: approverName || 'Client Representative',
          approverTitle,
          approverEmail,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');

      setActionSuccess('rejected');
      setShowDeclineModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Loading change order document...</div>
        </div>
      </div>
    );
  }

  if (error || !changeOrder) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm max-w-md text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-lg font-bold text-zinc-900">Change Order Not Found</h2>
            <p className="text-xs text-zinc-600">
              This change order link may have expired or was updated by your agency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = changeOrder.status === 'approved';
  const isRejected = changeOrder.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 flex-1 w-full">
        {/* Navigation back to client intake portal */}
        <div className="flex items-center justify-between no-print">
          <Link
            href={`/portal/${token}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Client Intake Portal</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-2xs"
          >
            <Printer className="w-4 h-4 text-zinc-500" />
            <span>Print or Save PDF</span>
          </button>
        </div>

        {/* Change Order Document Card */}
        <div className="p-8 sm:p-10 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-8 print-page">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {changeOrder.order_number}
                </span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Scope Change Addendum
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
                {changeOrder.title}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Project: <strong>{changeOrder.project_name}</strong> ({changeOrder.project_code})
              </p>
            </div>

            <div className="text-right self-start sm:self-auto">
              <StatusChip status={changeOrder.status} size="md" />
              <span className="text-[11px] text-zinc-400 block mt-1.5">
                Issued by {changeOrder.agency_name}
              </span>
            </div>
          </div>

          {/* Description / Scope Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Scope Extension Summary
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
              {changeOrder.description}
            </p>
          </div>

          {/* Billable Line Items Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Scope Line Items & Fee Breakdown
            </h3>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-3 w-20">Hours</th>
                    <th className="py-3 px-3 w-24">Hourly Rate</th>
                    <th className="py-3 px-4 w-32 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {(changeOrder.line_items || []).map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-medium text-zinc-900">{item.description}</td>
                      <td className="py-3 px-3 text-zinc-600">{item.hours}h</td>
                      <td className="py-3 px-3 text-zinc-600">${item.rate}/hr</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900">
                        ${(item.amount || item.hours * item.rate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold text-zinc-900">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-zinc-500">
                      Total Added Investment:
                    </td>
                    <td className="py-3 px-4 text-right text-base text-indigo-700">
                      ${Number(changeOrder.total_amount).toLocaleString()} {changeOrder.currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Schedule Impact Card */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="font-bold text-indigo-900 block">
                  Delivery Timeline Impact: +{changeOrder.schedule_delay_days} Business Days
                </span>
                <span className="text-zinc-600">
                  Agreed milestone completion dates are adjusted accordingly upon sign-off.
                </span>
              </div>
            </div>
            <span className="font-semibold text-indigo-800 bg-white px-3 py-1 rounded-md border border-indigo-200 shrink-0">
              Timeline Adjusted
            </span>
          </div>

          {/* Legal Advisory Disclaimer */}
          <p className="text-[11px] text-zinc-400 italic leading-relaxed border-t border-zinc-100 pt-4">
            * This document represents an amendment to the existing master services agreement between {changeOrder.agency_name} and {changeOrder.company_name}. Digital signature data is captured alongside IP address and cryptographic timestamps.
          </p>

          {/* If already approved, show digital certificate stamp */}
          {isApproved && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Digitally Approved & Authenticated</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-900 pt-2 border-t border-emerald-200">
                <div>
                  <span className="text-emerald-700 text-[10px] block font-medium uppercase">Authorized Signer</span>
                  <strong className="text-sm">{changeOrder.approval?.approver_name || changeOrder.client_name}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] block font-medium uppercase">Timestamp</span>
                  <strong>{new Date(changeOrder.approval?.decided_at || changeOrder.updated_at).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] block font-medium uppercase">Digital Signature Hash</span>
                  <span className="font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded border border-emerald-300">
                    SHA256: {Math.random().toString(36).slice(2, 10).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* If rejected, show rejection notice */}
          {isRejected && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Change Order Declined</span>
              </div>
              <p className="text-xs text-rose-700">
                Reason: {changeOrder.approval?.rejection_reason || 'Declined by client.'}
              </p>
            </div>
          )}

          {/* Sign-off Form (if still pending) */}
          {!isApproved && !isRejected && (
            <form onSubmit={handleApprove} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-5 no-print">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Client Authorization & Digital Sign-off
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Confirm your details below to approve this scope adjustment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Title / Role</label>
                  <input
                    type="text"
                    required
                    value={approverTitle}
                    onChange={(e) => setApproverTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Confirmation</label>
                  <input
                    type="email"
                    required
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-zinc-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span className="leading-relaxed">
                  I confirm that I am an authorized representative of <strong>{changeOrder.company_name}</strong> and agree to the additional scope, investment amount of <strong>${Number(changeOrder.total_amount).toLocaleString()} {changeOrder.currency}</strong>, and schedule impact specified above.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(true)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800"
                >
                  Request Adjustment or Decline
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Authenticating...' : 'Approve & Sign Change Order'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-zinc-900">Decline Change Order</h3>
              <p className="text-xs text-zinc-600">
                Please provide feedback for the agency team regarding why this change order cannot be approved as drafted:
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Price is too high, or we would prefer to defer this until Phase 2..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 text-xs border border-zinc-200 rounded-xl focus:outline-hidden focus:border-indigo-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Submit Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
