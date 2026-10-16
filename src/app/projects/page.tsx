'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ExternalLink,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusChip } from '@/components/StatusChip';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>Apex Digital</span>
              <span>/</span>
              <span className="text-zinc-700 font-sans font-semibold">Projects</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
              Projects & Scope Baselines
            </h1>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded border border-[#E5E5E0]">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search project, code, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-zinc-500 font-mono">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-[#E5E5E0] rounded px-2 py-1 bg-white text-zinc-700 focus:outline-hidden"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="rounded border border-[#E5E5E0] bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] text-zinc-500 border-b border-[#E5E5E0] font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4 w-28">Code</th>
                <th className="py-2.5 px-4">Project Title</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-3">Fixed Baseline</th>
                <th className="py-2.5 px-3">Recovered</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-500 font-semibold text-xs">
                    {proj.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    <Link href={`/projects/${proj.id}`} className="hover:text-[#2547D0] transition-colors">
                      {proj.name}
                    </Link>
                    <span className="text-[11px] text-zinc-400 block font-mono font-normal">
                      Baseline Scope v{proj.active_scope_version}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700">
                    <span className="font-medium text-zinc-900">{proj.client_name}</span>
                    <span className="text-[11px] text-zinc-500 block">{proj.company_name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-800 tabular-nums">
                    ${Number(proj.contract_value).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 tabular-nums">
                    +${Number(proj.recovered_revenue).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <StatusChip status={proj.status} />
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
                      <span>Manage</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
