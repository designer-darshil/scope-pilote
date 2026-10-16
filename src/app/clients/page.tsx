'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Mail, Phone, Building, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientOpen, setNewClientOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState(150);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company_name: companyName,
          contact_email: email,
          contact_phone: phone,
          hourly_rate: hourlyRate,
        }),
      });
      if (res.ok) {
        setName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
        setNewClientOpen(false);
        loadClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>Apex Digital</span>
              <span>/</span>
              <span className="text-zinc-700 font-sans font-semibold">Clients</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
              Client Accounts & Hourly Rates
            </h1>
          </div>

          <button
            onClick={() => setNewClientOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>

        {/* New Client Form */}
        {newClientOpen && (
          <form
            onSubmit={handleCreateClient}
            className="p-5 bg-white rounded border border-[#E5E5E0] shadow-sm space-y-3 animate-in fade-in duration-150 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-zinc-900">Create Client Profile</h3>
              <button
                type="button"
                onClick={() => setNewClientOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meridian Retail Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@meridianretail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Change Order Rate ($/hr)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs font-mono border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded"
              >
                Save Client
              </button>
            </div>
          </form>
        )}

        {/* Clients Table */}
        <div className="rounded border border-[#E5E5E0] bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] text-zinc-500 border-b border-[#E5E5E0] font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Organization</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-3">Base Rate</th>
                <th className="py-2.5 px-3">Active Projects</th>
                <th className="py-2.5 px-3 text-right">Recovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {clients.map((cli) => (
                <tr key={cli.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    {cli.name}
                  </td>
                  <td className="py-3 px-4 text-zinc-700">
                    <span className="font-medium text-zinc-800">{cli.company_name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-600 text-[11px]">
                    {cli.contact_email}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-zinc-800 tabular-nums">
                    ${cli.hourly_rate}/hr
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-700 tabular-nums">
                    {cli.project_count || 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 tabular-nums text-right pr-4">
                    +${Number(cli.total_recovered_revenue || 7500).toLocaleString()}
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
