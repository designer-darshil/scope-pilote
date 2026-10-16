'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, DollarSign, Clock, FileText, Send, Check } from 'lucide-react';
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
        // If linked to a request, use decision endpoint
        const res = await fetch(`/api/requests/${requestId}/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'create_change_order',
            orderTitle: title,
            orderDescription: description,
            lineItems,
            totalAmount,
            scheduleDelayDays,
            currency: 'USD',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create change order');

        if (sendImmediately && data.changeOrder?.id) {
          // Immediately trigger sent status
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Formal Change Order
              </span>
              <span className="text-xs text-zinc-500 font-medium">Drafting</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mt-1">Generate Scope Change Order</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Change Order Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Scope of Adjustment / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the new deliverable and technical boundary..."
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Billable Scope Line Items
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-2 font-semibold w-20">Hours</th>
                    <th className="py-2.5 px-2 font-semibold w-24">Rate ($)</th>
                    <th className="py-2.5 px-3 font-semibold w-28 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-zinc-200 rounded focus:border-indigo-600 focus:outline-hidden text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.hours}
                          onChange={(e) => handleItemChange(idx, 'hours', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-zinc-200 rounded focus:border-indigo-600 focus:outline-hidden text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-zinc-200 rounded focus:border-indigo-600 focus:outline-hidden text-xs"
                        />
                      </td>
                      <td className="p-2 text-right font-medium text-zinc-900 pr-3">
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

          {/* Timeline & Total summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Estimated Delivery Delay
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={scheduleDelayDays}
                  onChange={(e) => setScheduleDelayDays(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
                />
                <span className="text-xs text-zinc-500">business days added</span>
              </div>
            </div>

            <div className="flex flex-col justify-center sm:items-end">
              <span className="text-xs text-zinc-500 font-medium">Total Additional Price</span>
              <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                ${totalAmount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">USD</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic">
            * This document serves as an official scope adjustment. When sent to the client, a secure sign-off link with cryptographic timestamping will be generated.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-xs transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating...' : 'Create & Send to Client'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
