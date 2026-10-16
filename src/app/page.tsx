'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function LandingPage() {
  const [demoInput, setDemoInput] = useState(
    'Can we add wholesale B2B pricing with Net-30 invoice terms for distributors before launch?'
  );
  const [demoResult, setDemoResult] = useState<{
    outcome: string;
    confidence: number;
    citation: string;
    suggestedPrice: number;
    delayDays: number;
  } | null>({
    outcome: 'out_of_scope',
    confidence: 0.98,
    citation: 'SOW Section 4.2: "Wholesale B2B pricing, net-30 terms, and tiered bulk distributor rates are strictly excluded from Phase 1."',
    suggestedPrice: 4500,
    delayDays: 8,
  });

  const testSamples = [
    {
      label: 'Wholesale B2B Pricing',
      text: 'Can we add wholesale B2B pricing with Net-30 invoice terms for distributors before launch?',
      outcome: 'out_of_scope',
      confidence: 0.98,
      citation: 'SOW Section 4.2: "Wholesale B2B pricing, net-30 terms, and tiered bulk distributor rates are strictly excluded."',
      suggestedPrice: 4500,
      delayDays: 8,
    },
    {
      label: 'Typo-Tolerant Search',
      text: 'When testing product search, searching "addidas" with two d\'s should still match Adidas products.',
      outcome: 'in_scope',
      confidence: 0.95,
      citation: 'SOW Section 2.1: "Responsive catalog with faceted category filtering, keyword search, brand tags."',
      suggestedPrice: 0,
      delayDays: 0,
    },
    {
      label: 'Crypto Payments via BitPay',
      text: 'We want to accept Bitcoin and Ethereum at checkout before the holiday rush.',
      outcome: 'out_of_scope',
      confidence: 0.97,
      citation: 'SOW Section 4.1: "Cryptocurrency, BitPay, or secondary gateways are excluded."',
      suggestedPrice: 5100,
      delayDays: 10,
    },
  ];

  const handleSelectSample = (sample: typeof testSamples[0]) => {
    setDemoInput(sample.text);
    setDemoResult({
      outcome: sample.outcome,
      confidence: sample.confidence,
      citation: sample.citation,
      suggestedPrice: sample.suggestedPrice,
      delayDays: sample.delayDays,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-full shadow-2xs text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scope Defense & Revenue Recovery for Agencies & Freelancers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
            Turn informal client requests into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              approved change orders.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-600 font-normal leading-relaxed">
            Stop absorbing free scope creep. ScopePilot compares new client messages against your original agreement, provides instant cited evidence, and generates digital change orders in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Live Dashboard Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/projects/prj_meridian_store"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <span>View Meridian Retail Case Study</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Versioned Scope SOW
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cited Source Excerpts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Immutable Event Audit Trail
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Legally Disclaimed Advisory
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Hero Widget: Live Scope Classifier Demo */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Interactive Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Experience the AI Scope Classifier
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Select a sample client request to see how ScopePilot cites agreement clauses and proposes billable change orders:
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {testSamples.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => handleSelectSample(sample)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    demoInput === sample.text
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Card */}
          <div className="p-6 rounded-2xl border border-zinc-200 bg-[#FAFAF8] shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                Incoming Client Request
              </label>
              <div className="p-3.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-800 shadow-2xs font-mono">
                &quot;{demoInput}&quot;
              </div>
            </div>

            {demoResult && (
              <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-600">Scope Determination:</span>
                    <StatusChip status={demoResult.outcome} />
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    Confidence: {(demoResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-zinc-800">
                  <span className="font-semibold text-indigo-900 block mb-1">
                    Cited Evidence from Agreement:
                  </span>
                  <p className="italic font-serif text-zinc-700">{demoResult.citation}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Outcome</span>
                    <span className="text-xs font-bold text-zinc-800 uppercase">
                      {demoResult.outcome.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Revenue Recovered</span>
                    <span className="text-sm font-bold text-emerald-600">
                      ${demoResult.suggestedPrice.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-zinc-400 font-medium uppercase">Schedule Impact</span>
                    <span className="text-sm font-bold text-zinc-800">
                      +{demoResult.delayDays} business days
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The 3-Step Scope Protocol */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Engineered For Frictionless Client Approvals
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900">
            How ScopePilot Protects Your Profitability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-zinc-900">Upload SOW & Extract Checklist</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Upload your signed statement of work or proposal. ScopePilot extracts clear deliverables, acceptance criteria, and explicit boundary exclusions.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-zinc-900">Intake & Cited AI Classification</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Clients submit requests through a branded, token-secured portal. The classifier compares the request against the baseline and cites exact agreement clauses.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-zinc-900">1-Click Change Orders & Digital Sign-off</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Convert out-of-scope requests into a clean change order with editable hours, rates, and schedule adjustments. Clients review and approve digitally in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 font-medium text-zinc-800">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>ScopePilot SaaS — Freelance & Agency Scope Defense System</span>
          </div>
          <div>
            Built with Next.js App Router, Supabase PostgreSQL, and Server-Side LLM Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}
