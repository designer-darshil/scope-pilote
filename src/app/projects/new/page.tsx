'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { extractDeliverablesFromText, ExtractedDeliverable } from '@/lib/ai/extractor';

export default function NewProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [projectName, setProjectName] = useState('Fintech Mobile App & Payment Gateway');
  const [projectCode, setProjectCode] = useState('PRJ-FIN-2026');
  const [contractValue, setContractValue] = useState(42000);
  const [clientName, setClientName] = useState('David Miller');
  const [companyName, setCompanyName] = useState('Starlight Financial Inc.');
  const [contactEmail, setContactEmail] = useState('david@starlightfin.com');
  const [hourlyRate, setHourlyRate] = useState(165);

  // SOW text state
  const [sowTitle, setSowTitle] = useState('Starlight-Fintech-Proposal-v1.0');
  const [sowText, setSowText] = useState(`STATEMENT OF WORK (SOW) - STARLIGHT FINANCIAL
1.0 PROJECT OVERVIEW
Design and engineering of an iOS & Android client onboarding mobile portal with Plaid bank connection and KYC identity verification.

2.0 IN-SCOPE DELIVERABLES
2.1 Mobile Application Screens: React Native cross-platform app for account registration, biometric login, and portfolio balance view.
2.2 Plaid Account Linking: Secure OAuth bank account connection using Plaid Link API.
2.3 KYC Document Upload: Integration with Persona or Jumio for automated passport/ID verification.
2.4 Admin Compliance Dashboard: Web-based portal for compliance officers to view verification logs.

3.0 FIXED PRICING & TIMELINE
Fixed scope fee: $42,000 USD. Delivery timeframe: 8 weeks.

4.0 OUT OF SCOPE BOUNDARIES & EXCLUSIONS
4.1 Trading & Securities: Direct stock trading, market execution engines, or SEC broker-dealer integration are strictly excluded.
4.2 Multi-Tenant White-Labeling: Re-branding the app for third-party affiliate partners is excluded and requires a separate agreement.
4.3 24/7 Production Support: Post-launch on-call SLA beyond standard 30-day bug warranty is not included.`);

  // Extracted deliverables
  const [deliverables, setDeliverables] = useState<ExtractedDeliverable[]>([]);

  const handleProceedToStep2 = () => {
    if (!projectName || !clientName || !contactEmail) {
      setError('Please fill in project name, client name, and client email.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleExtractScope = () => {
    if (!sowText.trim()) {
      setError('Please enter or paste your statement of work text.');
      return;
    }
    setError('');
    const extracted = extractDeliverablesFromText(sowText);
    setDeliverables(extracted);
    setStep(3);
  };

  const handleUpdateDeliverable = (index: number, field: keyof ExtractedDeliverable, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const handleAddDeliverable = () => {
    setDeliverables([
      ...deliverables,
      {
        title: 'New Custom Scope Item',
        category: 'Core Feature',
        description: 'Specify details and boundaries here',
        acceptanceCriteria: 'Meets specification',
        isExplicitlyExcluded: false,
      },
    ]);
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          code: projectCode,
          contractValue,
          clientName,
          companyName,
          contactEmail,
          hourlyRate,
          sowTitle,
          sowText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        {/* Wizard Stepper */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Create New Project & Baseline Scope
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Lock in your signed agreement to prevent unbilled revisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Project & Client Details */}
        {step === 1 && (
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Step 1: Project & Client Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Project Code / Identifier
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Fixed Fee Contract Baseline ($ USD)
                </label>
                <input
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Billable Hourly Rate for Change Orders ($/hr)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
                Client Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <span>Continue to SOW Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload or Paste Statement of Work */}
        {step === 2 && (
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900">
                Step 2: Enter Proposal or Statement of Work (SOW)
              </h2>
              <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Scope Parser Ready
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={sowTitle}
                onChange={(e) => setSowTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  SOW Agreement Text (Include Deliverables & Explicit Exclusions)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSowText(
                      `1.0 IN-SCOPE DELIVERABLES\n1.1 Custom Dashboard: Metrics, user tables, and filters.\n1.2 Stripe Subscriptions: Monthly billing integration.\n\n2.0 OUT OF SCOPE BOUNDARIES\n2.1 Mobile Apps: Native iOS and Android builds are excluded.\n2.2 Data Migration: Legacy database migration requires separate change order.`
                    )
                  }
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load Minimal Template
                </button>
              </div>
              <textarea
                rows={12}
                value={sowText}
                onChange={(e) => setSowText(e.target.value)}
                className="w-full p-4 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-hidden focus:border-indigo-600 bg-zinc-50/50 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleExtractScope}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract Scope Checklist</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Scope Review & Checklist Customization */}
        {step === 3 && (
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Step 3: Review Structured Scope Baseline
                </h2>
                <p className="text-xs text-zinc-500">
                  These items form the reference checklist for AI classification and change orders.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddDeliverable}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-3 transition-colors ${
                    item.isExplicitlyExcluded
                      ? 'bg-rose-50/40 border-rose-200/80'
                      : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateDeliverable(idx, 'title', e.target.value)}
                      placeholder="Deliverable Title"
                      className="font-bold text-sm text-zinc-900 bg-transparent border-b border-transparent focus:border-indigo-600 focus:outline-hidden w-2/3"
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.isExplicitlyExcluded}
                          onChange={(e) =>
                            handleUpdateDeliverable(idx, 'isExplicitlyExcluded', e.target.checked)
                          }
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className={item.isExplicitlyExcluded ? 'text-rose-700' : 'text-zinc-500'}>
                          Explicit Out-of-Scope Exclusion
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateDeliverable(idx, 'description', e.target.value)}
                      placeholder="Description of item"
                      className="w-full px-2.5 py-1 text-xs border border-zinc-200 rounded focus:outline-hidden bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                Once locked, ScopePilot generates a <strong>secure client request portal URL</strong>. New client requests will be cited directly against this baseline.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Creating Project...' : 'Launch Project Scope'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
