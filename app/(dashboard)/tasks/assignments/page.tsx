'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasksApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

type Item = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function fmtDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskAssignmentsPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPermission('tasks:read')) {
      router.push('/forbidden');
      return;
    }

    tasksApi
      .list()
      .then((tasks) => {
        const mapped = tasks.map((task, idx) => {
          const raw = asRecord(task);
          return {
            id: typeof raw.id === 'string' ? raw.id : `task-${idx}`,
            title:
              (typeof raw.title === 'string' && raw.title) ||
              (typeof raw.name === 'string' && raw.name) ||
              `Task ${idx + 1}`,
            status: (typeof raw.status === 'string' && raw.status) || 'backlog',
            priority: (typeof raw.priority === 'string' && raw.priority) || 'medium',
            due: fmtDate(raw.dueDate || raw.deadline || raw.date || raw.createdAt),
          };
        });
        setItems(mapped);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Task Assignments</h1>
      <p className="mt-1 text-gray-500">Live assignments from server</p>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{item.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.status}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.priority}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{item.due}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="py-16 text-center text-gray-400">Loading assignments...</div>}
        {!loading && items.length === 0 && <div className="py-16 text-center text-gray-400">No assignments found.</div>}
      </div>
    </div>
  );
}
