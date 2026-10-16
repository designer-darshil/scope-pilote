'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 29 : 24,
      description: 'For solo freelancers and consultants managing 1–3 active client contracts.',
      features: [
        '3 Active Monitored Projects',
        '25 Scope Classifications / month',
        'SOW Deliverable & Boundary Extraction',
        'Tokenized Client Request Intake',
        'Digital Change Order Generator',
        'Immutable Event History',
      ],
      current: false,
      cta: 'Select Starter',
    },
    {
      name: 'Growth',
      price: billingCycle === 'monthly' ? 79 : 64,
      description: 'For small development and design studios requiring full scope defense across all accounts.',
      features: [
        'Unlimited Active Projects',
        '200 Scope Classifications / month',
        'Full PDF SOW & Agreement Parser',
        'Tokenized Client Portal with SSL Sign-off',
        'Printable / PDF Change Order Export',
        'Scope Drift Analytics & Recovery Metrics',
        '5 Team Member Seats',
      ],
      current: true,
      popular: true,
      cta: 'Current Plan (Active)',
    },
    {
      name: 'Agency',
      price: billingCycle === 'monthly' ? 199 : 159,
      description: 'For digital agencies requiring dedicated SLAs, webhooks, and compliance ledgers.',
      features: [
        'Unlimited Projects & Clients',
        '1,000 Scope Classifications / month',
        'Custom Domain for Client Intake Portals',
        'Cryptographic Audit Ledger Export',
        'Webhook & Slack Integration',
        'Unlimited Seats & Role Permissions',
        'Dedicated Onboarding & Priority SLA',
      ],
      current: false,
      cta: 'Upgrade to Agency',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans selection:bg-[#EFF3FE] selection:text-[#2547D0]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 flex-1 w-full">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
            Commercial Plans
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Predictable, Transparent Pricing
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Stop absorbing free scope creep. One approved change order typically covers an entire year of ScopePilot.
          </p>

          {/* Billing Switcher */}
          <div className="pt-3 flex items-center justify-center gap-3 text-xs font-mono">
            <span className={billingCycle === 'monthly' ? 'text-zinc-900 font-bold' : 'text-zinc-400'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-10 h-5 bg-zinc-200 rounded-full p-0.5 transition-colors relative flex items-center"
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#2547D0] transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={billingCycle === 'annual' ? 'text-zinc-900 font-bold' : 'text-zinc-400'}>
              Annual (20% off)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded p-6 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-[#2547D0] shadow-sm'
                  : 'bg-white border border-[#E5E5E0] shadow-2xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded bg-[#2547D0] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  Active Demo Plan
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-zinc-900">{plan.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="mt-4 mb-5 font-mono">
                  <span className="text-3xl font-bold tracking-tight text-zinc-900">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-zinc-400 font-sans ml-1">/ month</span>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Plan Specifications:
                  </span>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-zinc-700">
                      <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <button
                  disabled={plan.current}
                  className={`w-full py-1.5 px-3 rounded text-xs font-semibold transition-all ${
                    plan.popular
                      ? 'bg-[#2547D0] text-white hover:bg-[#1D3BB3] shadow-2xs'
                      : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto pt-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded border border-[#E5E5E0]">
              <h4 className="text-xs font-bold text-zinc-900">Are AI suggestions legally binding?</h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                No. As established in our platform guidelines, ScopePilot AI classification suggestions are strictly advisory and identify discrepancies. All change orders, prices, and revisions require explicit human authorization.
              </p>
            </div>
            <div className="p-4 bg-white rounded border border-[#E5E5E0]">
              <h4 className="text-xs font-bold text-zinc-900">Do clients need to create an account?</h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Never. Clients access their project intake portal and change order approval links via cryptographically secure, unguessable tokens. This eliminates friction and drastically increases approval speed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
