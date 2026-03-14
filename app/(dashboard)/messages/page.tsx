'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerPortalApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import type { CustomerTicket } from '../../../types';

type TicketView = {
  id: string;
  title: string;
  status: string;
  priority: string;
  customer: string;
  createdAt: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function s(value: unknown, fallback = '-'): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function fmtDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toTicketView(ticket: CustomerTicket, index: number): TicketView {
  const raw = asRecord(ticket);
  return {
    id: s(raw.id, `ticket-${index}`),
    title: s(raw.title, s(raw.subject, `Ticket ${index + 1}`)),
    status: s(raw.status, 'open'),
    priority: s(raw.priority, 'medium'),
    customer: s(raw.customerName, s(asRecord(raw.customer).name, '-')),
    createdAt: fmtDate(raw.createdAt || raw.updatedAt),
  };
}

function statusClass(status: string) {
  const v = status.toLowerCase();
  if (v.includes('closed') || v.includes('resolved')) return 'bg-green-100 text-green-700';
  if (v.includes('pending')) return 'bg-amber-100 text-amber-700';
  return 'bg-blue-100 text-blue-700';
}

export default function MessagesPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const canRead = hasPermission('customer-portal:read') || hasPermission('messages:read');

  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canRead) {
      router.push('/forbidden');
      return;
    }

    customerPortalApi
      .tickets()
      .then((items) => setTickets(items.map(toTicketView)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load customer tickets.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [canRead, router]);

  const total = useMemo(() => tickets.length, [tickets]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Customer portal tickets from server</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">Total: {total}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{ticket.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{ticket.customer}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${statusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{ticket.priority}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{ticket.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="py-16 text-center text-gray-400">Loading tickets...</div>}
        {!loading && tickets.length === 0 && <div className="py-16 text-center text-gray-400">No tickets found.</div>}
      </div>
    </div>
  );
}
