'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Send, Check } from 'lucide-react';
import { LineItem } from '@/lib/types';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (changeOrder: any) => void;
  projectId: string;
  requestId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialHours?: number;
  initialHourlyRate?: number;
  initialDelayDays?: number;
}

export function ChangeOrderModal({
  isOpen,
  onClose,
  onSaved,
  projectId,
  requestId,
  initialTitle = '',
  initialDescription = '',
  initialHours = 20,
  initialHourlyRate = 150,
  initialDelayDays = 5,
}: ChangeOrderModalProps) {
  const [title, setTitle] = useState(initialTitle || 'Scope Extension Order');
  const [description, setDescription] = useState(initialDescription || '');
  const [assumptions, setAssumptions] = useState('All work is subject to the terms of the Master Services Agreement. Standard 30-day warranty applies upon deployment.');
  const [scheduleDelayDays, setScheduleDelayDays] = useState(initialDelayDays);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      description: initialTitle || 'Implementation of requested additional capability',
      hours: initialHours,
      rate: initialHourlyRate,
      amount: initialHours * initialHourlyRate,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'hours' || field === 'rate') {
      item.amount = (Number(item.hours) || 0) * (Number(item.rate) || 0);
    }
    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: 'Additional task or technical deliverable',
        hours: 8,
        rate: initialHourlyRate,
        amount: 8 * initialHourlyRate,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = async (sendImmediately: boolean = false) => {
    setSubmitting(true);
    setError('');

    try {
      if (requestId) {
        const res = await fetch(`/api/requests/${requestId}/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'create_change_order',
            orderTitle: title,
            orderDescription: `${description}\n\nAssumptions:\n${assumptions}`,
            lineItems,
            totalAmount,
            scheduleDelayDays,
            currency: 'USD',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create change order');

        if (sendImmediately && data.changeOrder?.id) {
          await fetch(`/api/change-orders/${data.changeOrder.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'sent_to_client' }),
          });
        }

        onSaved(data.changeOrder);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#E5E5E0] max-w-2xl w-full shadow-lg overflow-hidden animate-in fade-in duration-150">
        {/* Document Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E0] flex items-center justify-between bg-[#FBFBFA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Official Contract Addendum
              </span>
              <span className="text-zinc-300">/</span>
              <span className="text-[11px] font-mono text-zinc-600">Drafting</span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 mt-0.5">Generate Scope Change Order</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Change Order Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Scope of Adjustment & Deliverable Boundaries
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical additions, specifications, and scope limits..."
              className="w-full p-2.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0] bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Contractual Assumptions & Exclusions
            </label>
            <textarea
              rows={2}
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              placeholder="State key assumptions or prerequisites..."
              className="w-full p-2.5 text-xs border border-[#E5E5E0] rounded focus:outline-hidden focus:border-[#2547D0] bg-[#FBFBFA] font-mono text-[11px]"
            />
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                Billable Scope Line Items
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2547D0] hover:text-[#1D3BB3]"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="border border-[#E5E5E0] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFA] border-b border-[#E5E5E0] text-zinc-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 w-16">Hours</th>
                    <th className="py-2 px-2 w-20">Rate ($)</th>
                    <th className="py-2 px-3 w-24 text-right">Amount</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white font-mono text-xs">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-[#E5E5E0] rounded focus:border-[#2547D0] focus:outline-hidden text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.hours}
                          onChange={(e) => handleItemChange(idx, 'hours', Number(e.target.value))}
                          className="w-full px-1.5 py-1 border border-[#E5E5E0] rounded focus:border-[#2547D0] focus:outline-hidden text-xs tabular-nums text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-full px-1.5 py-1 border border-[#E5E5E0] rounded focus:border-[#2547D0] focus:outline-hidden text-xs tabular-nums text-center"
                        />
                      </td>
                      <td className="p-2 text-right font-medium text-zinc-900 pr-3 tabular-nums">
                        ${(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            className="text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline Impact & Commercial Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded bg-[#FBFBFA] border border-[#E5E5E0]">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Estimated Delivery Schedule Extension
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={scheduleDelayDays}
                  onChange={(e) => setScheduleDelayDays(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs font-mono border border-[#E5E5E0] rounded bg-white text-center tabular-nums"
                />
                <span className="text-[11px] text-zinc-500">business days added</span>
              </div>
            </div>

            <div className="flex flex-col justify-center sm:items-end font-mono">
              <span className="text-[10px] text-zinc-400 uppercase font-sans">Total Commercial Addition</span>
              <span className="text-xl font-bold text-[#18181B] tabular-nums">
                ${totalAmount.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">USD</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            * Recorded into the immutable audit ledger. Generating a link creates a single-use tokenized sign-off interface.
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-[#E5E5E0] bg-[#FBFBFA] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-[#E5E5E0] rounded hover:bg-zinc-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#2547D0] hover:bg-[#1D3BB3] rounded shadow-2xs transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? 'Creating...' : 'Create & Send to Client'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
