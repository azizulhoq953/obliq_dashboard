'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import type { Lead } from '../../../types';

type LeadView = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
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

function toLeadView(lead: Lead, index: number): LeadView {
  const raw = asRecord(lead);
  const first = s(raw.firstName, '').trim();
  const last = s(raw.lastName, '').trim();
  const fullName = `${first} ${last}`.trim();

  return {
    id: s(raw.id, `lead-${index}`),
    name: s(raw.name, fullName || `Lead ${index + 1}`),
    email: s(raw.email),
    phone: s(raw.phone),
    status: s(raw.status, 'new'),
    source: s(raw.source),
    createdAt: fmtDate(raw.createdAt),
  };
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes('won') || value.includes('qualified') || value.includes('active')) return 'bg-green-100 text-green-700';
  if (value.includes('lost') || value.includes('closed') || value.includes('rejected')) return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}

export default function LeadsPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const [leads, setLeads] = useState<LeadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('leads:read')) {
      router.push('/forbidden');
      return;
    }

    leadsApi
      .list()
      .then((items) => setLeads(items.map(toLeadView)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load leads.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  const totalLeads = useMemo(() => leads.length, [leads]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 mt-1">Server-synced lead records</p>
      </div>

      <div className="mb-4 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
        Total leads: {totalLeads}
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{lead.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{lead.phone}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${statusClass(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{lead.source}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-16 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && leads.length === 0 && (
          <div className="py-16 text-center text-gray-400">No leads found from server.</div>
        )}
      </div>
    </div>
  );
}
