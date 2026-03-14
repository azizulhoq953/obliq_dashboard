'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerPortalApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export default function ContactsPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const canRead = hasPermission('customer-portal:read') || hasPermission('contacts:read');

  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canRead) {
      router.push('/forbidden');
      return;
    }

    customerPortalApi
      .overview()
      .then((res) => setOverview(asRecord(res)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load customer portal overview.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [canRead, router]);

  const statCards = useMemo(() => {
    const cards: Array<{ label: string; value: number }> = [];
    const root = asRecord(overview);

    Object.entries(root).forEach(([key, value]) => {
      if (typeof value === 'number') {
        cards.push({ label: key, value: asNumber(value) });
      }
    });

    return cards;
  }, [overview]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-500 mt-1">Customer portal overview from server</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-900">{loading ? '--' : card.value}</p>
            <p className="text-sm text-gray-500 mt-1 capitalize">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Raw Overview Payload</h2>
        {loading ? (
          <div className="text-gray-400">Loading overview...</div>
        ) : (
          <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 overflow-auto">
            {JSON.stringify(overview, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
