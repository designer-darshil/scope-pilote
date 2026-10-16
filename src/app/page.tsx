'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState<'comparison' | 'changeOrder'>('comparison');

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans selection:bg-[#EFF3FE] selection:text-[#2547D0]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 border-b border-[#E5E5E0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2547D0]" />
              <span>Scope Verification & Revenue Defense</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#18181B] leading-[1.12]">
              A contract-backed system to prevent unpaid scope changes.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-2xl">
              ScopePilot indexes your agreed Statement of Work, compares incoming client requests against committed deliverables with cited evidence, and generates client-ready change orders in seconds.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Open Workspace Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/projects/prj_meridian_store"
                className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-[#E5E5E0] rounded transition-colors"
              >
                Inspect Meridian Retail Project
              </Link>

              <span className="text-xs text-zinc-400 font-mono ml-1 hidden sm:inline">
                No sign-up required for trial
              </span>
            </div>
          </div>

          {/* Large, Believable Product Interface Preview */}
          <div className="mt-12 rounded-lg border border-[#E5E5E0] bg-white shadow-sm overflow-hidden">
            {/* Window chrome */}
            <div className="px-4 py-2.5 bg-[#FBFBFA] border-b border-[#E5E5E0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
                <span className="text-zinc-400 font-mono text-[11px] ml-2">
                  ScopePilot / Meridian E-Commerce Storefront / REQ #103
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivePreviewTab('comparison')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activePreviewTab === 'comparison'
                      ? 'bg-zinc-200/80 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Scope Comparison
                </button>
                <button
                  onClick={() => setActivePreviewTab('changeOrder')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activePreviewTab === 'changeOrder'
                      ? 'bg-zinc-200/80 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Change Order Document
                </button>
              </div>
            </div>

            {/* Preview Body */}
            {activePreviewTab === 'comparison' ? (
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-zinc-100 rounded text-zinc-700">
                      REQ #103
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      Wholesale B2B Pricing Tier & Company Invoicing
                    </span>
                    <StatusChip status="out_of_scope" />
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Client: <strong className="text-zinc-700 font-sans">Sarah Chen (Meridian Retail)</strong> · Urgency: HIGH
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Scope Baseline */}
                  <div className="p-4 rounded border border-[#E5E5E0] bg-[#FBFBFA] space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Contract Baseline Evidence</span>
                      <span className="font-mono text-zinc-400">SOW v1.0 Signed</span>
                    </div>

                    <div className="p-3 rounded border border-amber-200/80 bg-amber-50/50 space-y-1 text-xs">
                      <div className="text-amber-900 font-semibold text-[11px] flex items-center justify-between">
                        <span>Cited: Section 4.2 — Explicit Exclusions</span>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">
                          Negative Boundary
                        </span>
                      </div>
                      <blockquote className="italic font-serif text-zinc-800 text-xs border-l-2 border-amber-400 pl-2 py-0.5">
                        &ldquo;Wholesale B2B pricing, net-30 terms, and tiered bulk distributor rates are strictly excluded from Phase 1 scope.&rdquo;
                      </blockquote>
                    </div>

                    <div className="text-[11px] text-zinc-500 space-y-1 pt-1">
                      <div className="font-medium text-zinc-700">Matched Agreed Deliverable:</div>
                      <div className="p-2 rounded border border-zinc-200 bg-white text-zinc-700 text-xs">
                        <strong># del_05_ex:</strong> Wholesale B2B Pricing Tiers & Net-30 Terms [Explicit Exclusion Boundary]
                      </div>
                    </div>
                  </div>

                  {/* Right: New Client Request */}
                  <div className="p-4 rounded border border-[#E5E5E0] bg-white space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Client Submission</span>
                      <span className="font-mono text-zinc-400">Via Request Portal</span>
                    </div>

                    <div className="p-3 rounded border border-zinc-200 bg-[#FBFBFA] text-xs text-zinc-800 font-sans leading-relaxed">
                      &ldquo;Hey Alex, our executive board decided we need wholesale distributors to purchase bulk units with net-30 terms before holiday launch. Can we get this added?&rdquo;
                    </div>

                    {/* Classification result */}
                    <div className="p-3 rounded border border-zinc-200 bg-zinc-50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 font-medium">Advisory Classification:</span>
                        <span className="font-mono font-semibold text-zinc-900">98% Confidence</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">
                        The request directly triggers the explicit scope boundary exclusion in Section 4.2. Work requires an authorized Change Order.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-200 text-center font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">EST. HOURS</span>
                          <span className="font-bold text-zinc-900">30 hrs</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">BILLABLE</span>
                          <span className="font-bold text-[#2547D0]">$4,500.00</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">DELIVERY</span>
                          <span className="font-bold text-zinc-900">+8 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500">
                  <span className="text-[11px]">
                    Advisory analysis. Final commercial terms require human authorization.
                  </span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold text-white bg-[#2547D0] rounded">
                      Convert to Change Order
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                      CO-2026-001
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 mt-1">
                      B2B Wholesale Pricing & Net-30 Terms Extension
                    </h3>
                  </div>
                  <StatusChip status="approved" />
                </div>

                <div className="border border-zinc-200 rounded text-xs overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#FBFBFA] border-b border-zinc-200 text-zinc-500 text-[11px] font-semibold">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-2 w-16">Hours</th>
                        <th className="py-2 px-2 w-20">Rate</th>
                        <th className="py-2 px-3 w-24 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white font-mono text-xs">
                      <tr>
                        <td className="py-2 px-3 font-sans text-zinc-800">
                          B2B customer tax-exemption verification & tiered price rules
                        </td>
                        <td className="py-2 px-2 text-zinc-600">16h</td>
                        <td className="py-2 px-2 text-zinc-600">$150/h</td>
                        <td className="py-2 px-3 text-right font-medium text-zinc-900">$2,400.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-sans text-zinc-800">
                          Net-30 invoice order routing and PDF invoice generation
                        </td>
                        <td className="py-2 px-2 text-zinc-600">14h</td>
                        <td className="py-2 px-2 text-zinc-600">$150/h</td>
                        <td className="py-2 px-3 text-right font-medium text-zinc-900">$2,100.00</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-[#FBFBFA] border-t border-zinc-200 font-bold text-zinc-900">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right font-sans text-[11px] text-zinc-500 uppercase">
                          Total Additional Fee:
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-xs text-[#2547D0]">
                          $4,500.00 USD
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Digitally Executed by Sarah Chen (VP Digital Products)</span>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      Timestamp: Oct 14, 2026 · Auth IP: 198.51.100.42
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-emerald-800">
                    +8 Days Schedule Extension
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The 3 Workflow Chapters */}
      <section className="py-16 sm:py-20 border-b border-[#E5E5E0] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
              Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
              How ScopePilot stops scope creep without awkward client negotiations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded border border-[#E5E5E0] bg-[#FBFBFA] space-y-2.5">
              <span className="text-xs font-mono font-bold text-zinc-400">01</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Index Contract & Deliverables
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Upload your signed proposal or Statement of Work. ScopePilot extracts structured deliverables and explicitly defines out-of-scope boundaries to establish a versioned baseline.
              </p>
            </div>

            <div className="p-5 rounded border border-[#E5E5E0] bg-[#FBFBFA] space-y-2.5">
              <span className="text-xs font-mono font-bold text-zinc-400">02</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Cross-Reference Requests with Cited Evidence
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                When a client asks for new work via email or the intake portal, the advisory classifier compares it against the baseline and quotes the exact agreement section as evidence.
              </p>
            </div>

            <div className="p-5 rounded border border-[#E5E5E0] bg-[#FBFBFA] space-y-2.5">
              <span className="text-xs font-mono font-bold text-zinc-400">03</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                Generate & Execute Change Orders
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Convert out-of-scope items into formal change orders with billable rates and revised delivery dates. Clients review and digitally approve via dedicated access links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-16 border-b border-[#E5E5E0] bg-[#FBFBFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                Subscription Plans
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-1">
                Straightforward, Transparent Pricing
              </h2>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-[#2547D0] hover:text-[#1D3BB3] flex items-center gap-1"
            >
              <span>View Full Plan Comparison</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded border border-[#E5E5E0] bg-white space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Starter</h3>
                <p className="text-xs text-zinc-500 mt-0.5">For solo freelancers and consultants.</p>
                <div className="mt-3 text-2xl font-bold font-mono text-zinc-900">
                  $29 <span className="text-xs text-zinc-400 font-sans font-normal">/ month</span>
                </div>
              </div>
              <ul className="text-xs text-zinc-600 space-y-2 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> 3 Active Projects</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> 25 Scope Classifications/mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> SOW Deliverable Extraction</li>
              </ul>
            </div>

            <div className="p-6 rounded border-2 border-[#2547D0] bg-white space-y-4 relative">
              <span className="absolute top-3 right-3 text-[10px] font-mono font-bold uppercase text-[#2547D0] bg-[#EFF3FE] px-2 py-0.5 rounded">
                Recommended
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Growth</h3>
                <p className="text-xs text-zinc-500 mt-0.5">For small studios & development teams.</p>
                <div className="mt-3 text-2xl font-bold font-mono text-zinc-900">
                  $79 <span className="text-xs text-zinc-400 font-sans font-normal">/ month</span>
                </div>
              </div>
              <ul className="text-xs text-zinc-600 space-y-2 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2547D0]" /> Unlimited Active Projects</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2547D0]" /> 200 Scope Classifications/mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2547D0]" /> Tokenized Client Request Portals</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2547D0]" /> Digital Sign-off & Audit Ledger</li>
              </ul>
            </div>

            <div className="p-6 rounded border border-[#E5E5E0] bg-white space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Agency</h3>
                <p className="text-xs text-zinc-500 mt-0.5">For agencies managing high client volume.</p>
                <div className="mt-3 text-2xl font-bold font-mono text-zinc-900">
                  $199 <span className="text-xs text-zinc-400 font-sans font-normal">/ month</span>
                </div>
              </div>
              <ul className="text-xs text-zinc-600 space-y-2 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> Unlimited Projects & Clients</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> 1,000 Classifications/mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> Custom Domains & SLA Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-b border-[#E5E5E0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Contractual & Technical FAQ
            </span>
            <h2 className="text-2xl font-semibold text-zinc-900 mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 pt-4">
            <div className="p-4 rounded border border-[#E5E5E0] bg-[#FBFBFA]">
              <h4 className="text-xs font-bold text-zinc-900">Are ScopePilot AI determinations legally binding?</h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                No. As stated in our business rules, AI scope analysis is advisory. It identifies discrepancies and quotes source clauses from your Statement of Work. Formal change orders require explicit authorization from an authorized human signatory.
              </p>
            </div>

            <div className="p-4 rounded border border-[#E5E5E0] bg-[#FBFBFA]">
              <h4 className="text-xs font-bold text-zinc-900">How do clients access change orders?</h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Clients receive a dedicated, time-limited, token-secured portal link. They do not need to create an account or install software. They can review the itemized scope and approve or decline with a digital confirmation.
              </p>
            </div>

            <div className="p-4 rounded border border-[#E5E5E0] bg-[#FBFBFA]">
              <h4 className="text-xs font-bold text-zinc-900">Can agreements be exported for accounting or legal files?</h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Yes. Every change order, deliverable checklist, and audit event ledger can be printed or exported as a clean PDF document with cryptographic timestamps and IP address records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-[#FBFBFA] text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-800 font-medium">
            <span className="w-4 h-4 rounded bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-[10px]">
              SP
            </span>
            <span>ScopePilot SaaS</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-500 font-normal">Scope Defense & Change Order Protocol</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-900">Workspace</Link>
            <Link href="/pricing" className="hover:text-zinc-900">Pricing</Link>
            <Link href="/portal/portal_meridian_live_demo" target="_blank" className="hover:text-zinc-900">Client Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
