'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  ExternalLink,
  Shield,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, projectsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/projects'),
      ]);
      const aData = await analyticsRes.json();
      const pData = await projectsRes.json();
      setAnalytics(aData);
      setProjects(pData.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col lg:flex-row gap-6">
        {/* Compact Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          <div className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Workspace</span>
              <div className="text-xs font-semibold text-zinc-900 truncate">Apex Digital Studio</div>
              <div className="text-[11px] text-zinc-500 font-mono">Plan: Growth ($79/mo)</div>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Status</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Active
              </span>
            </div>
          </div>

          <nav className="space-y-0.5 text-xs">
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded bg-zinc-200/70 text-zinc-900 font-semibold"
            >
              <span>Workspace Overview</span>
              <span className="text-[11px] font-mono text-zinc-500">{projects.length}</span>
            </Link>

            <Link
              href="/projects"
              className="flex items-center justify-between px-3 py-2 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
            >
              <span>All Projects</span>
            </Link>

            <Link
              href="/clients"
              className="flex items-center justify-between px-3 py-2 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
            >
              <span>Client Accounts</span>
            </Link>

            <Link
              href="/pricing"
              className="flex items-center justify-between px-3 py-2 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
            >
              <span>Subscription & Limits</span>
            </Link>
          </nav>

          <div className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Quick Client Portal
            </span>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Meridian Retail verified portal link:
            </p>
            <Link
              href="/portal/portal_meridian_live_demo"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] text-[#2547D0] hover:underline font-mono"
            >
              <span>portal_meridian_live_demo</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Breadcrumb & Contextual Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E0] pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>Apex Digital Studio</span>
                <span>/</span>
                <span className="text-zinc-700 font-sans font-semibold">Workspace Overview</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                Scope Defense & Project Operations
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-1.5 text-zinc-500 hover:text-zinc-800 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
                title="Refresh Data"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/projects/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Link>
            </div>
          </div>

          {/* Contextual Scope Exposure & Recovered Revenue Bar */}
          <div className="p-4 rounded border border-[#E5E5E0] bg-white grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Agreed SOW Base
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 tabular-nums">
                ${(analytics?.totalContractValue || 38000).toLocaleString()}
              </div>
              <span className="text-[11px] text-zinc-500">Across {analytics?.totalProjects || 1} active contract</span>
            </div>

            <div className="space-y-0.5 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Recovered Revenue
              </span>
              <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                +${(analytics?.recoveredRevenue || 7500).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-800 font-medium">From approved change orders</span>
            </div>

            <div className="space-y-0.5 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Scope Drift Rate
              </span>
              <div className="text-lg font-bold font-mono text-amber-800 tabular-nums">
                {analytics?.driftIndex || 40}%
              </div>
              <span className="text-[11px] text-zinc-500">Intake requests beyond baseline</span>
            </div>

            <div className="space-y-0.5 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Triage Queue
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 tabular-nums">
                {analytics?.requestStats?.awaiting_decision || 2} Pending
              </div>
              <span className="text-[11px] text-zinc-500">Requires review / change order</span>
            </div>
          </div>

          {/* Active Projects Table */}
          <div className="rounded border border-[#E5E5E0] bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-[#E5E5E0] bg-[#FBFBFA] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Active Monitored Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-[#2547D0] hover:text-[#1D3BB3] flex items-center gap-1"
              >
                <span>View Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFA] text-zinc-500 border-b border-[#E5E5E0] font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Project Name</th>
                    <th className="py-2.5 px-4">Client Organization</th>
                    <th className="py-2.5 px-3">Base Contract</th>
                    <th className="py-2.5 px-3">Scope Drift</th>
                    <th className="py-2.5 px-3">Recovered</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-zinc-500 font-semibold text-xs">
                        {proj.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900">
                        <Link href={`/projects/${proj.id}`} className="hover:text-[#2547D0] transition-colors">
                          {proj.name}
                        </Link>
                        <span className="text-[11px] text-zinc-400 block font-normal">
                          Scope Version v{proj.active_scope_version}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        <span className="font-medium text-zinc-900">{proj.client_name}</span>
                        <span className="text-[11px] text-zinc-500 block">{proj.company_name}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-800 tabular-nums">
                        ${Number(proj.contract_value).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-800 tabular-nums">
                        {proj.scope_drift_score}%
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 tabular-nums">
                        +${Number(proj.recovered_revenue).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/portal/${proj.portal_token}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-600 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                        </Link>
                        <Link
                          href={`/projects/${proj.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded transition-colors"
                        >
                          Manage Scope
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Request Triage Queue */}
          <div className="rounded border border-[#E5E5E0] bg-white overflow-hidden shadow-2xs space-y-0">
            <div className="px-4 py-3 border-b border-[#E5E5E0] bg-[#FBFBFA] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Incoming Client Scope Requests Requiring Action
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Cited against active SOW
              </span>
            </div>

            <div className="divide-y divide-zinc-200 text-xs">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                      REQ #103
                    </span>
                    <span className="font-semibold text-zinc-900">
                      Loyalty Reward Points & Crypto Checkout via BitPay
                    </span>
                    <StatusChip status="out_of_scope" />
                  </div>
                  <p className="text-xs text-zinc-600">
                    &quot;Alex, our CMO wants customers to earn 5 points per dollar spent... Also accept Bitcoin via BitPay.&quot;
                  </p>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Cited: Section 4.1 & 4.3 (Negative Boundary) · Proposed Change Order: <strong>$5,100.00</strong> (+10 business days)
                  </div>
                </div>

                <Link
                  href="/projects/prj_meridian_store"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded transition-colors shrink-0 self-start sm:self-auto"
                >
                  <span>Review & Decide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                      REQ #104
                    </span>
                    <span className="font-semibold text-zinc-900">
                      Automated Scheduled CSV Export for Daily Warehouse Shipments
                    </span>
                    <StatusChip status="needs_review" />
                  </div>
                  <p className="text-xs text-zinc-600">
                    &quot;Can you add an automated nightly cron job that emails a formatted CSV to our 3PL logistics provider?&quot;
                  </p>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Cited: Section 2.4 (Partial match) · Confidence: 62% (Human review required)
                  </div>
                </div>

                <Link
                  href="/projects/prj_meridian_store"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-[#E5E5E0] hover:bg-zinc-50 rounded transition-colors shrink-0 self-start sm:self-auto"
                >
                  <span>Analyze Scope</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Compact Activity Ledger */}
          <div className="rounded border border-[#E5E5E0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Immutable Project Event Ledger
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Cryptographically verifiable</span>
            </div>

            <div className="space-y-2">
              {(analytics?.recentAuditLogs || []).slice(0, 5).map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded bg-[#FBFBFA] border border-[#E5E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-600 bg-zinc-200/80 px-1.5 py-0.2 rounded">
                      {evt.event_type}
                    </span>
                    <span className="text-zinc-800 font-medium">
                      By <strong>{evt.actor_name}</strong> ({evt.actor_type})
                    </span>
                  </div>

                  <span className="text-zinc-400 font-mono text-[11px]">
                    {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
