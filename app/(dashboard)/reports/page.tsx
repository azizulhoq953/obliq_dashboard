'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

type Row = { key: string; value: string };

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `${value.length} items`;
  if (value && typeof value === 'object') return JSON.stringify(value);
  return '-';
}

export default function ReportsPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('reports:read')) {
      router.push('/forbidden');
      return;
    }

    reportsApi
      .overview()
      .then((res) => setData(asRecord(res)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load reports overview.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  const rows = useMemo<Row[]>(() => {
    return Object.entries(data).map(([key, value]) => ({
      key,
      value: stringifyValue(value),
    }));
  }, [data]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Live report overview from server</p>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.key}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="py-16 text-center text-gray-400">Loading report overview...</div>}
        {!loading && rows.length === 0 && <div className="py-16 text-center text-gray-400">No overview metrics returned.</div>}
      </div>
    </div>
  );
}
