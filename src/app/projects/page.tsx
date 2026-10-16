'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
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
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Projects & Scope Baselines
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Structured scopes, versioned SOW agreements, and active client request portals.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-zinc-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by project, client, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                    {proj.code}
                  </span>
                  <StatusChip status={proj.status} />
                </div>

                <Link
                  href={`/projects/${proj.id}`}
                  className="text-base font-bold text-zinc-900 hover:text-indigo-600 transition-colors block"
                >
                  {proj.name}
                </Link>

                <p className="text-xs text-zinc-500 mt-1">
                  Client: <strong className="text-zinc-700">{proj.client_name}</strong> ({proj.company_name})
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[10px] block uppercase font-medium">Original Contract</span>
                    <span className="font-bold text-zinc-800">
                      ${Number(proj.contract_value).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] block uppercase font-medium">Recovered Revenue</span>
                    <span className="font-bold text-emerald-600">
                      +${Number(proj.recovered_revenue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <Link
                  href={`/portal/${proj.portal_token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
                >
                  <span>Client Portal</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </Link>

                <Link
                  href={`/projects/${proj.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  <span>Manage Scope</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
