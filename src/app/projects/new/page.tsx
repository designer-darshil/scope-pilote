'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  Check,
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
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Wizard Header & Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>Apex Digital</span>
              <span>/</span>
              <span className="text-zinc-700 font-sans font-semibold">New Project</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
              Index Agreement & Baseline Scope
            </h1>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className={`px-2 py-0.5 rounded ${step === 1 ? 'bg-zinc-900 text-white font-bold' : 'bg-zinc-100 text-zinc-500'}`}>
              01 Details
            </span>
            <span className="text-zinc-300">/</span>
            <span className={`px-2 py-0.5 rounded ${step === 2 ? 'bg-zinc-900 text-white font-bold' : 'bg-zinc-100 text-zinc-500'}`}>
              02 SOW Text
            </span>
            <span className="text-zinc-300">/</span>
            <span className={`px-2 py-0.5 rounded ${step === 3 ? 'bg-zinc-900 text-white font-bold' : 'bg-zinc-100 text-zinc-500'}`}>
              03 Scope Checklist
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-mono">
            {error}
          </div>
        )}

        {/* Step 1: Project & Client Details */}
        {step === 1 && (
          <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-5 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">
              1.0 Project & Commercial Baseline
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Project Code / Reference
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Fixed Fee Baseline ($ USD)
                </label>
                <input
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Change Order Hourly Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <h3 className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                Client Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">Organization</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs"
              >
                <span>Continue to SOW Upload</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload or Paste Statement of Work */}
        {step === 2 && (
          <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                2.0 Agreement Document & SOW Content
              </h2>
              <span className="font-mono text-[11px] text-zinc-400">
                Indexed for Scope Citations
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={sowTitle}
                onChange={(e) => setSowTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Agreement Text (Include Section 4 Boundary Exclusions)
              </label>
              <textarea
                rows={10}
                value={sowText}
                onChange={(e) => setSowText(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-[#E5E5E0] rounded bg-[#FBFBFA] focus:outline-hidden focus:border-[#2547D0] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleExtractScope}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract Scope Checklist</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Scope Review & Checklist Customization */}
        {step === 3 && (
          <div className="p-6 bg-white rounded border border-[#E5E5E0] shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  3.0 Review Extracted Deliverables & Boundary Exclusions
                </h2>
                <p className="text-[11px] text-zinc-500">
                  These items serve as the baseline checklist against which new requests are classified.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddDeliverable}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2547D0] hover:text-[#1D3BB3]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border text-xs space-y-2 ${
                    item.isExplicitlyExcluded
                      ? 'bg-rose-50/30 border-rose-200/70'
                      : 'bg-[#FBFBFA] border-[#E5E5E0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateDeliverable(idx, 'title', e.target.value)}
                      placeholder="Deliverable Title"
                      className="font-semibold text-zinc-900 bg-transparent border-b border-transparent focus:border-[#2547D0] focus:outline-hidden w-2/3"
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isExplicitlyExcluded}
                          onChange={(e) =>
                            handleUpdateDeliverable(idx, 'isExplicitlyExcluded', e.target.checked)
                          }
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className={item.isExplicitlyExcluded ? 'text-rose-800 font-mono' : 'text-zinc-500 font-mono'}>
                          Out-of-Scope Boundary
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateDeliverable(idx, 'description', e.target.value)}
                    placeholder="Description and boundary notes"
                    className="w-full px-2 py-1 text-xs border border-[#E5E5E0] rounded bg-white focus:outline-hidden"
                  />
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-zinc-50 border border-[#E5E5E0] text-[11px] text-zinc-600 font-mono">
              * Upon creation, a dedicated client portal token will be provisioned. Client requests will cite against this baseline.
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{submitting ? 'Creating Project...' : 'Launch Project Baseline'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
