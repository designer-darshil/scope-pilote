'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Shield, X, RotateCcw, Check } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'emails' | 'audit'>('emails');
  const [emails, setEmails] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [emailRes, analyticsRes] = await Promise.all([
        fetch('/api/emails'),
        fetch('/api/analytics'),
      ]);
      const emailData = await emailRes.json();
      const analyticsData = await analyticsRes.json();
      setEmails(emailData.emails || []);
      setAuditLogs(analyticsData.recentAuditLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/25 flex justify-end">
      <div className="w-full max-w-lg bg-[#FFFFFF] h-full shadow-lg flex flex-col border-l border-[#E5E5E0] animate-in slide-in-from-right-4 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E5E0] flex items-center justify-between bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
              Activity & Dispatch Logs
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors"
              title="Refresh"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 border-b border-[#E5E5E0] flex gap-4 bg-[#FFFFFF]">
          <button
            onClick={() => setActiveTab('emails')}
            className={`py-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'emails'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Outgoing Dispatches ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'audit'
                ? 'border-[#2547D0] text-[#2547D0] font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Audit Ledger ({auditLogs.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FBFBFA]">
          {activeTab === 'emails' ? (
            emails.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-xs font-mono">
                No outgoing emails logged in this session.
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="text-zinc-700 font-sans font-medium">To: {email.to}</span>
                    <span>{new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-900">{email.subject}</h4>
                  <div
                    className="text-xs text-zinc-600 bg-[#FBFBFA] p-2.5 rounded border border-[#E5E5E0] font-mono text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                  />
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Delivered via transactional gateway</span>
                  </div>
                </div>
              ))
            )
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-xs font-mono">
              No audit records found.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded bg-white border border-[#E5E5E0] text-xs space-y-1">
                  <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
                    <span className="font-semibold text-[#2547D0] uppercase">
                      {log.event_type}
                    </span>
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-zinc-800 font-medium text-xs">
                    Actor: <span className="font-semibold">{log.actor_name}</span> ({log.actor_type})
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="text-[10px] bg-[#FBFBFA] p-2 rounded border border-[#E5E5E0] overflow-x-auto text-zinc-600 font-mono">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
