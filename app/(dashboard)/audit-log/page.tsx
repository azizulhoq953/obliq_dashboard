'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { auditApi } from '../../../lib/api';
import { AuditLog } from '../../../types';

export default function AuditLogPage() {
  const { hasPermission } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('audit:read')) {
      router.push('/forbidden');
      return;
    }

    auditApi
      .list({ page: 1, limit: 50 })
      .then((data) => setLogs(data.logs || []))
      .catch(() => setError('Failed to load audit records.'));
  }, [hasPermission, router]);

  const actionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700';
    if (action.includes('CREATED')) return 'bg-green-100 text-green-700';
    if (action.includes('GRANTED')) return 'bg-orange-100 text-orange-700';
    if (action.includes('REVOKED') || action.includes('BANNED')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 mt-1">Append-only record of all system actions</p>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {log.actor?.firstName} {log.actor?.lastName}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 font-mono max-w-xs truncate">
                  {JSON.stringify(log.metadata)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="py-16 text-center text-gray-400">No audit records yet</div>
        )}
      </div>
    </div>
  );
}