'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasksApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

type ReminderItem = {
  id: string;
  title: string;
  dueDate: Date | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function TaskRemindersPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [nowMs] = useState(() => Date.now());
  const [items, setItems] = useState<ReminderItem[]>([]);
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
            dueDate: parseDate(raw.dueDate || raw.deadline || raw.date || raw.createdAt),
          };
        });
        setItems(mapped);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  const upcoming = useMemo(() => {
    const in7Days = nowMs + 7 * 24 * 60 * 60 * 1000;
    return items
      .filter((item) => item.dueDate && item.dueDate.getTime() >= nowMs && item.dueDate.getTime() <= in7Days)
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }, [items, nowMs]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Task Reminders</h1>
      <p className="mt-1 text-gray-500">Upcoming reminders from server tasks (next 7 days)</p>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {loading && <div className="text-gray-400">Loading reminders...</div>}

        {!loading && upcoming.length === 0 && (
          <div className="text-gray-400">No upcoming reminders in the next 7 days.</div>
        )}

        <div className="space-y-2">
          {upcoming.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-100 px-3 py-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">{item.title}</span>
              <span className="text-gray-500">
                {item.dueDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
