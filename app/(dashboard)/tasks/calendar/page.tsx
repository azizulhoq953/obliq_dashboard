'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasksApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

type CalendarItem = {
  id: string;
  title: string;
  dueLabel: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function dateKey(value: unknown): string {
  if (typeof value !== 'string' || !value) return 'No date';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No date';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskCalendarPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [items, setItems] = useState<CalendarItem[]>([]);
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
          const dueValue = raw.dueDate || raw.deadline || raw.date || raw.createdAt;
          return {
            id: typeof raw.id === 'string' ? raw.id : `task-${idx}`,
            title:
              (typeof raw.title === 'string' && raw.title) ||
              (typeof raw.name === 'string' && raw.name) ||
              `Task ${idx + 1}`,
            dueLabel: dateKey(dueValue),
          };
        });
        setItems(mapped);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    items.forEach((item) => {
      const existing = map.get(item.dueLabel) || [];
      existing.push(item);
      map.set(item.dueLabel, existing);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Task Calendar</h1>
      <p className="mt-1 text-gray-500">Grouped by due date from server data</p>

      <div className="mt-6 space-y-4">
        {loading && <div className="text-gray-400">Loading calendar...</div>}

        {!loading && grouped.length === 0 && <div className="text-gray-400">No task dates found.</div>}

        {grouped.map(([label, rows]) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{label}</h2>
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">
                  {row.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
