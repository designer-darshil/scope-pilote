'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Printer,
  ArrowLeft,
  AlertTriangle,
  Lock,
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
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-400 font-mono text-xs">Authenticating change order session...</div>
        </div>
      </div>
    );
  }

  if (error || !changeOrder) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 bg-white rounded border border-[#E5E5E0] max-w-md text-center space-y-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
            <h2 className="text-base font-bold text-zinc-900">Change Order Not Found</h2>
            <p className="text-xs text-zinc-500">
              This change order link may have expired or was modified by the issuing agency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = changeOrder.status === 'approved';
  const isRejected = changeOrder.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans selection:bg-[#EFF3FE] selection:text-[#2547D0]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        {/* Navigation back to client intake portal */}
        <div className="flex items-center justify-between no-print">
          <Link
            href={`/portal/${token}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Project Portal</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-700 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>Print or Export PDF</span>
          </button>
        </div>

        {/* Change Order Document Card */}
        <div className="p-8 bg-white rounded border border-[#E5E5E0] shadow-sm space-y-6 print-page">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E5E0] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                  {changeOrder.order_number}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Master SOW Addendum
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                {changeOrder.title}
              </h1>
              <div className="text-xs text-zinc-500 font-mono space-y-0.5 pt-1">
                <div>Project: <strong className="text-zinc-800 font-sans">{changeOrder.project_name}</strong> ({changeOrder.project_code})</div>
                <div>Issued by: <strong className="text-zinc-800 font-sans">{changeOrder.agency_name}</strong> · Recipient: <strong className="text-zinc-800 font-sans">{changeOrder.company_name}</strong></div>
              </div>
            </div>

            <div className="text-right self-start sm:self-auto space-y-1">
              <StatusChip status={changeOrder.status} size="md" />
              <div className="text-[11px] text-zinc-400 font-mono">
                Issued {new Date(changeOrder.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Description / Scope Summary */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              1.0 Scope Specification & Adjustments
            </h3>
            <div className="text-xs text-zinc-800 leading-relaxed bg-[#FBFBFA] p-4 rounded border border-[#E5E5E0] whitespace-pre-wrap font-sans">
              {changeOrder.description}
            </div>
          </div>

          {/* Billable Line Items Table */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              2.0 Deliverable Fee Breakdown
            </h3>
            <div className="border border-[#E5E5E0] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFA] border-b border-[#E5E5E0] text-zinc-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 w-16">Hours</th>
                    <th className="py-2.5 px-2 w-20">Hourly Rate</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-mono text-xs">
                  {(changeOrder.line_items || []).map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-sans text-zinc-900 font-medium">{item.description}</td>
                      <td className="py-2.5 px-2 text-zinc-600">{item.hours}h</td>
                      <td className="py-2.5 px-2 text-zinc-600">${item.rate}/hr</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-zinc-900">
                        ${(item.amount || item.hours * item.rate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#FBFBFA] border-t border-[#E5E5E0] font-bold text-zinc-900">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px] font-sans text-zinc-500">
                      Total Added Scope Investment:
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm font-mono text-[#2547D0]">
                      ${Number(changeOrder.total_amount).toLocaleString()} {changeOrder.currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Schedule Impact Card */}
          <div className="p-3.5 rounded bg-[#FBFBFA] border border-[#E5E5E0] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-zinc-900 block font-mono text-xs">
                3.0 Schedule Adjustment: +{changeOrder.schedule_delay_days} Business Days
              </span>
              <span className="text-zinc-500 text-[11px]">
                Upon digital sign-off, targeted milestone deadlines under the agreement are updated accordingly.
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-zinc-700 bg-white px-2 py-1 rounded border border-[#E5E5E0] shrink-0">
              +{changeOrder.schedule_delay_days} Days
            </span>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-[11px] text-zinc-400 font-mono leading-relaxed border-t border-zinc-100 pt-3">
            * This document amends the active Statement of Work between {changeOrder.agency_name} and {changeOrder.company_name}. Digital confirmation records IP address, user agent, and an immutable cryptographic audit event.
          </div>

          {/* Approved state digital certificate */}
          {isApproved && (
            <div className="p-5 rounded bg-emerald-50 border border-emerald-300 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitally Executed & Bound</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-950 pt-2 border-t border-emerald-200 font-mono text-[11px]">
                <div>
                  <span className="text-emerald-700 text-[10px] block font-sans uppercase">Authorized Signer</span>
                  <strong>{changeOrder.approval?.approver_name || changeOrder.client_name}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] block font-sans uppercase">Timestamp</span>
                  <strong>{new Date(changeOrder.approval?.decided_at || changeOrder.updated_at).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] block font-sans uppercase">Auth Method</span>
                  <span>Token Portal Session</span>
                </div>
              </div>
            </div>
          )}

          {/* Rejected state */}
          {isRejected && (
            <div className="p-4 rounded bg-rose-50 border border-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Change Order Declined</span>
              </div>
              <p className="text-rose-700">
                Reason: {changeOrder.approval?.rejection_reason || 'Declined by client.'}
              </p>
            </div>
          )}

          {/* Client Digital Sign-Off Form */}
          {!isApproved && !isRejected && (
            <form onSubmit={handleApprove} className="p-5 rounded bg-[#FBFBFA] border border-[#E5E5E0] space-y-4 no-print text-xs">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  4.0 Authorization & Digital Sign-off
                </h3>
                <p className="text-zinc-500 mt-0.5">
                  Confirm your details below to execute this scope change order.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded bg-white focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Title / Role</label>
                  <input
                    type="text"
                    required
                    value={approverTitle}
                    onChange={(e) => setApproverTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded bg-white focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Email Confirmation</label>
                  <input
                    type="email"
                    required
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-[#E5E5E0] rounded bg-white focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-zinc-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-[#2547D0] focus:ring-[#2547D0] mt-0.5"
                />
                <span className="leading-relaxed">
                  I confirm that I am an authorized representative of <strong>{changeOrder.company_name}</strong> and agree to the additional scope, fee of <strong>${Number(changeOrder.total_amount).toLocaleString()} {changeOrder.currency}</strong>, and timeline adjustment.
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
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Authenticating...' : 'Authorize & Sign Change Order'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
            <div className="bg-white rounded border border-[#E5E5E0] max-w-md w-full p-5 shadow-lg space-y-3 text-xs">
              <h3 className="text-sm font-bold text-zinc-900">Decline Change Order</h3>
              <p className="text-zinc-600">
                Provide feedback to the agency regarding why this change order cannot be approved:
              </p>
              <textarea
                rows={3}
                placeholder="State the reason or required adjustment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
