'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Mail, Phone, DollarSign, Building, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Clients & Billing Rates
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Manage client organizations, billing currencies, and default hourly rates for change orders.
            </p>
          </div>

          <button
            onClick={() => setNewClientOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* New Client Modal */}
        {newClientOpen && (
          <form
            onSubmit={handleCreateClient}
            className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Create New Client Profile
              </h3>
              <button
                type="button"
                onClick={() => setNewClientOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meridian Retail Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@meridianretail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Billing Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Save Client
              </button>
            </div>
          </form>
        )}

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((cli) => (
            <div
              key={cli.id}
              className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{cli.name}</h3>
                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cli.company_name}</span>
                  </p>
                </div>

                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  ${cli.hourly_rate}/hr
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{cli.contact_email}</span>
                </div>
                {cli.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cli.contact_phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Active Projects</span>
                  <span className="font-bold text-zinc-800">{cli.project_count || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-medium block">Recovered Revenue</span>
                  <span className="font-bold text-emerald-600">
                    +${Number(cli.total_recovered_revenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
