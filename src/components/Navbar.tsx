'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ExternalLink,
  RotateCcw,
  Bell,
  Plus,
} from 'lucide-react';
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
        setResetMessage('Reset');
        setTimeout(() => {
          setResetMessage('');
          window.location.reload();
        }, 800);
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
      <header className="border-b border-[#E5E5E0] bg-[#FFFFFF] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#18181B] flex items-center justify-center text-white font-mono font-bold text-xs">
              SP
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-900 tracking-tight">ScopePilot</span>
              <span className="text-zinc-300">/</span>
              <span className="text-zinc-500 font-normal">Client Verification Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>256-Bit Authenticated Session</span>
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
      <header className="border-b border-[#E5E5E0] bg-[#FBFBFA]/90 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          {/* Brand & Workspace Context */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded bg-[#18181B] flex items-center justify-center text-white font-mono font-bold text-xs tracking-tighter group-hover:bg-[#2547D0] transition-colors">
                SP
              </div>
              <span className="font-semibold text-zinc-900 text-[13px] tracking-tight">
                ScopePilot
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span>/</span>
              <span className="text-zinc-700 font-sans text-xs font-medium">Apex Digital</span>
            </div>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 pl-2 border-l border-zinc-200">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-200/60 text-zinc-900 font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Direct jump to client portal */}
            <Link
              href="/portal/portal_meridian_live_demo"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
            >
              <span>Client Portal</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>

            {/* Reset Demo button */}
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
              title="Reset sample data"
            >
              <RotateCcw className={`w-3 h-3 text-zinc-400 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[11px]">{resetMessage || 'Reset'}</span>
            </button>

            {/* Activity Drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
              title="Activity & Emails"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2547D0]" />
            </button>

            {/* New Project CTA */}
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
