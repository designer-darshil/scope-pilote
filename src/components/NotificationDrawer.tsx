'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Shield, X, Bell, RefreshCw, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-zinc-900">Activity & Transactional Events</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-md hover:bg-zinc-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-zinc-200 flex gap-4">
          <button
            onClick={() => setActiveTab('emails')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'emails'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Outgoing Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Immutable Audit Log ({auditLogs.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'emails' ? (
            emails.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-sm">
                No outgoing emails sent yet in this session.
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-xs transition-all">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                    <span className="font-medium text-zinc-800">To: {email.to}</span>
                    <span>{new Date(email.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 mb-2">{email.subject}</h4>
                  <div
                    className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 whitespace-pre-wrap font-sans"
                    dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                  />
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered via Transactional Mailer
                  </div>
                </div>
              ))
            )
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No audit records found.
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[10px]">
                      {log.event_type}
                    </span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-zinc-800 font-medium">
                    Actor: <span className="font-semibold">{log.actor_name}</span> ({log.actor_type})
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="text-[11px] bg-white p-2 rounded border border-zinc-200/60 overflow-x-auto text-zinc-600">
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
