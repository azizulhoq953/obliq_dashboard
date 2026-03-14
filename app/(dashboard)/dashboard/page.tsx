'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import type { DashboardSummaryResponse } from '../../../types';

type DashboardStats = {
  totalUsers: number;
  activeTasks: number;
  openLeads: number;
  auditEvents: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function n(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseSummary(payload: DashboardSummaryResponse): DashboardStats {
  const root = asRecord(payload);
  const metrics = asRecord(root.metrics);
  const counts = asRecord(root.counts);

  return {
    totalUsers: n(root.totalUsers) || n(metrics.totalUsers) || n(counts.users),
    activeTasks: n(root.activeTasks) || n(metrics.activeTasks) || n(counts.tasks),
    openLeads: n(root.openLeads) || n(metrics.openLeads) || n(counts.leads),
    auditEvents: n(root.auditEvents) || n(metrics.auditEvents) || n(counts.auditEvents),
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, permissions, hasPermission } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTasks: 0,
    openLeads: 0,
    auditEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('dashboard:read')) {
      router.push('/forbidden');
      return;
    }

    dashboardApi
      .summary()
      .then((summary) => setStats(parseSummary(summary)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load dashboard summary.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.firstName} 👋</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'bg-orange-500' },
          { label: 'Active Tasks', value: stats.activeTasks, color: 'bg-blue-500' },
          { label: 'Open Leads', value: stats.openLeads, color: 'bg-green-500' },
          { label: 'Audit Events', value: stats.auditEvents, color: 'bg-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${stat.color} rounded-xl mb-3 opacity-90`} />
            <p className="text-2xl font-bold text-gray-900">{loading ? '--' : stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            <span className="text-xs text-gray-500 font-medium">Live from /dashboard/summary</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Your Access</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg capitalize">
            {user?.role?.name}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {permissions.map((p) => (
            <span key={p} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
