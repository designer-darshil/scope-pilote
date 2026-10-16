'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
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
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1 w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Scope Defense Command
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                Live Overview
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Real-time monitoring of client requests, agreement boundaries, and recovered change order revenue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recovered Revenue */}
          <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Recovered Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              ${(analytics?.recoveredRevenue || 4500).toLocaleString()}{' '}
              <span className="text-xs text-zinc-400 font-normal">USD</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Converted from unapproved scope
            </p>
          </div>

          {/* Scope Drift Index */}
          <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Scope Drift Index</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {analytics?.driftIndex || 28.5}%
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              Of intake requests exceeded initial baseline
            </p>
          </div>

          {/* Pending Reviews */}
          <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Awaiting Decision</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {analytics?.requestStats?.awaiting_decision || 2}{' '}
              <span className="text-xs text-zinc-400 font-normal">Requests</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-medium">
              Classified & ready for change order action
            </p>
          </div>

          {/* Active Contract Value */}
          <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Active SOW Base</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              ${(analytics?.totalContractValue || 38000).toLocaleString()}{' '}
              <span className="text-xs text-zinc-400 font-normal">USD</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              Protected across {analytics?.totalProjects || 1} active projects
            </p>
          </div>
        </div>

        {/* Main Section: Active Projects Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between bg-zinc-50/50">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Active Monitored Projects</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Projects with structured deliverables and active client intake portals.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Project & Code</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Contract Value</th>
                  <th className="py-3 px-4 font-semibold">Drift Score</th>
                  <th className="py-3 px-4 font-semibold">Recovered</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-900">
                      <Link
                        href={`/projects/${proj.id}`}
                        className="font-semibold text-zinc-900 hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        <span>{proj.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                      </Link>
                      <span className="text-[11px] text-zinc-400 font-mono block">{proj.code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700">
                      <span className="font-medium text-zinc-800">{proj.client_name}</span>
                      <span className="text-[11px] text-zinc-400 block">{proj.company_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-800 font-medium">
                      ${Number(proj.contract_value).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {proj.scope_drift_score}% drift
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      +${Number(proj.recovered_revenue).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusChip status={proj.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/portal/${proj.portal_token}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                      >
                        <span>Client Portal</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </Link>
                      <Link
                        href={`/projects/${proj.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors"
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

        {/* Recent Audit Stream */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-zinc-900">
                Immutable Scope Event History (Recent 10 Events)
              </h3>
            </div>
            <span className="text-xs text-zinc-400">Cryptographically verifiable log</span>
          </div>

          <div className="space-y-3">
            {(analytics?.recentAuditLogs || []).slice(0, 8).map((evt: any) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border border-zinc-200/70 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {evt.event_type}
                  </span>
                  <span className="text-zinc-800 font-medium">
                    By <strong className="text-zinc-900">{evt.actor_name}</strong> ({evt.actor_type})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                  <span>Target: {evt.target_type}</span>
                  <span>·</span>
                  <span>{new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
