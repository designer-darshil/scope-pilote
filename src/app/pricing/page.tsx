'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 29 : 24,
      description: 'Ideal for independent freelancers and solo consultants looking to curb scope creep.',
      features: [
        '3 Active Projects',
        '25 AI Scope Classifications/mo',
        'Standard Statement of Work Extraction',
        'Basic Client Intake Form',
        'Digital Change Order Generator',
        'Email Support',
      ],
      current: false,
      cta: 'Start 14-Day Free Trial',
    },
    {
      name: 'Growth',
      price: billingCycle === 'monthly' ? 79 : 64,
      description: 'For growing design, dev, and marketing studios managing multiple clients concurrently.',
      features: [
        'Unlimited Active Projects',
        '200 AI Scope Classifications/mo',
        'Full SOW & Proposal PDF Parser',
        'White-label Tokenized Client Portals',
        'Client Digital Signature Sign-Off',
        'Printable PDF Change Orders',
        'Scope Drift Analytics & Recovery Metrics',
        '5 Team Member Seats',
      ],
      current: true,
      popular: true,
      cta: 'Current Plan (Active Demo)',
    },
    {
      name: 'Agency Scale',
      price: billingCycle === 'monthly' ? 199 : 159,
      description: 'For established agencies and software houses requiring multi-client audit compliance.',
      features: [
        'Unlimited Projects & Clients',
        '1,000 AI Scope Classifications/mo',
        'Custom Domain for Client Portals',
        'Immutable Cryptographic Audit Export',
        'Webhook & Slack Integration',
        'Unlimited Team Seats & Roles',
        'Dedicated Priority SLA & Onboarding',
      ],
      current: false,
      cta: 'Upgrade to Agency Scale',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>ROI Guaranteed: Pays For Itself On Your First Change Order</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base text-zinc-600">
            Stop losing thousands in free revisions. Recover billable hours with automated scope defense.
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3 text-xs font-semibold">
            <span className={billingCycle === 'monthly' ? 'text-zinc-900' : 'text-zinc-400'}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 bg-zinc-200 rounded-full p-1 transition-colors relative flex items-center"
            >
              <div
                className={`w-4 h-4 rounded-full bg-indigo-600 transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={billingCycle === 'annual' ? 'text-zinc-900' : 'text-zinc-400'}>
              Annual (Save 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-indigo-600 shadow-xl'
                  : 'bg-white border border-zinc-200 shadow-2xs hover:border-zinc-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium ml-1">/ month</span>
                </div>

                <div className="border-t border-zinc-100 pt-6 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                    What&apos;s Included:
                  </span>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100">
                <button
                  disabled={plan.current}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
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
        <div className="max-w-3xl mx-auto pt-12 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-5 bg-white rounded-xl border border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-900">Are AI suggestions legally binding?</h4>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                No. As established in our platform guidelines, ScopePilot AI classification suggestions are strictly advisory and assist in discovering contractual discrepancies. All change orders, prices, and revisions require explicit human authorization from both agency and client.
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-900">Do clients need to create an account?</h4>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Never. Clients access their project intake portal and change order approval links via cryptographically secure, unguessable tokens. This eliminates friction and drastically increases approval speed.
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-900">Can I export Change Orders to PDF?</h4>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Yes. All change orders, statements of work, and scope audit histories can be exported or printed as high-resolution PDF documents with official digital signature stamps and IP logs.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
