'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, Bell, ExternalLink, RefreshCw, FolderGit2, CheckCircle2 } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

export function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const isPortal = pathname.startsWith('/portal');

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo projects, change orders, and requests back to initial state?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Demo restored!');
        setTimeout(() => {
          setResetMessage('');
          window.location.reload();
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  // If in client-facing portal, show minimal, trustworthy header with no agency clutter
  if (isPortal) {
    return (
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              SP
            </div>
            <div>
              <span className="font-semibold text-zinc-900 tracking-tight text-sm">ScopePilot</span>
              <span className="text-xs text-zinc-400 block font-normal leading-none">Verified Client Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            256-bit Encrypted Token Access
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Clients', href: '/clients' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      <header className="border-b border-zinc-200/70 bg-[#FAFAF8]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand & Tenant */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-zinc-900 tracking-tight text-base flex items-center gap-1.5">
                  ScopePilot
                  <span className="text-[10px] font-medium tracking-normal px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded">
                    SaaS
                  </span>
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">Scope Defense Platform</span>
              </div>
            </Link>

            {/* Tenant switcher badge */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg shadow-xs text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-zinc-800">Apex Digital Studio</span>
              <span className="text-zinc-400">·</span>
              <span className="text-indigo-600 font-medium">Growth Plan</span>
            </div>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-200/60 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Live Client Portal direct jump */}
            <Link
              href="/portal/portal_meridian_live_demo"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 shadow-xs transition-colors"
            >
              <span>View Client Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            {/* Demo Reset button */}
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              title="Reset sample data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{resetMessage || 'Reset Demo'}</span>
            </button>

            {/* Notifications / Activity Drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-xs transition-colors"
              title="Activity & Transactional Emails"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            </button>

            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
