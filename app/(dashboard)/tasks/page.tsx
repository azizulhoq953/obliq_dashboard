'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasksApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import type { Task } from '../../../types';

type TaskView = {
  id: string;
  title: string;
  client: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  priorityLabel: string;
  date: string;
  checked?: boolean;
  status: 'backlog' | 'in_progress' | 'review';
  progress: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function pickString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizePriority(value: string): 'urgent' | 'high' | 'medium' | 'low' {
  const v = value.toLowerCase();
  if (v.includes('urgent') || v.includes('critical')) return 'urgent';
  if (v.includes('high')) return 'high';
  if (v.includes('low')) return 'low';
  return 'medium';
}

function normalizeStatus(value: string): 'backlog' | 'in_progress' | 'review' {
  const v = value.toLowerCase();
  if (v.includes('progress') || v.includes('doing') || v.includes('active')) return 'in_progress';
  if (v.includes('review') || v.includes('verify') || v.includes('qa') || v.includes('done') || v.includes('complete')) return 'review';
  return 'backlog';
}

function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function toTaskView(task: Task, index: number): TaskView {
  const raw = asRecord(task);
  const title =
    pickString(raw.title) ||
    pickString(raw.name) ||
    pickString(raw.subject) ||
    `Task ${index + 1}`;

  const client =
    pickString(raw.clientName) ||
    pickString(asRecord(raw.client).name) ||
    pickString(asRecord(raw.lead).name) ||
    pickString(raw.leadName) ||
    'Unassigned';

  const priorityRaw =
    pickString(raw.priority) ||
    pickString(raw.priorityLevel) ||
    'medium';
  const priority = normalizePriority(priorityRaw);
  const status = normalizeStatus(pickString(raw.status) || pickString(raw.stage));

  const progressValue = typeof raw.progress === 'number'
    ? raw.progress
    : typeof raw.completion === 'number'
      ? raw.completion
      : status === 'review'
        ? 100
        : status === 'in_progress'
          ? 50
          : 0;

  const progress = Math.min(100, Math.max(0, Math.round(progressValue)));

  return {
    id: pickString(raw.id) || `task-${index}`,
    title,
    client,
    priority,
    priorityLabel: priority.charAt(0).toUpperCase() + priority.slice(1),
    date: formatDate(raw.dueDate || raw.deadline || raw.date || raw.createdAt),
    checked: Boolean(raw.completed || raw.isCompleted),
    status,
    progress,
  };
}

export default function TasksPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('tasks:read')) {
      router.push('/forbidden');
      return;
    }

    tasksApi
      .list()
      .then((items) => setTasks(items.map(toTaskView)))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load tasks.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [hasPermission, router]);

  const listRows = useMemo(() => tasks.slice(0, 8), [tasks]);

  const kanbanColumns = useMemo(() => {
    const groups: Record<'backlog' | 'in_progress' | 'review', TaskView[]> = {
      backlog: [],
      in_progress: [],
      review: [],
    };

    tasks.forEach((task) => {
      groups[task.status].push(task);
    });

    return [
      { key: 'backlog', title: 'Backlog', rows: groups.backlog },
      { key: 'in_progress', title: 'In progress', rows: groups.in_progress },
      { key: 'review', title: 'Review', rows: groups.review },
    ] as const;
  }, [tasks]);

  return (
    <div className="obliq-content-wrap">
      <header className="obliq-content-header">
        <div className="obliq-content-title-wrap">
          <button type="button" className="obliq-back-btn" aria-label="Go Back">
            <span aria-hidden="true">&larr;</span>
          </button>
          <h1 className="obliq-content-title">Tasks</h1>
        </div>

        <div className="obliq-top-search" role="search">
          <span className="obliq-search-icon" aria-hidden="true">o</span>
          <span className="obliq-search-placeholder">Search</span>
        </div>
      </header>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="obliq-board-section">
        <div className="obliq-board-toolbar">
          <div className="obliq-board-search">
            <span className="obliq-search-icon" aria-hidden="true">o</span>
            <span className="obliq-search-placeholder">Search table</span>
          </div>
          <div className="obliq-board-tabs" role="tablist" aria-label="Task Views">
            <button type="button" className="obliq-board-tab active">List</button>
            <button type="button" className="obliq-board-tab">Kanban</button>
            <button type="button" className="obliq-board-tab">Calendar</button>
          </div>
        </div>

        <div className="obliq-group-card">
          <div className="obliq-group-head">
            <span className="obliq-group-pill blue" aria-hidden="true" />
            <span>Group 1</span>
          </div>

          <div className="obliq-list-head">
            <span>Title</span>
            <span>Client name</span>
            <span>Priority</span>
            <span>Date</span>
          </div>

          {loading && <div className="p-4 text-sm text-[#8a7f74]">Loading tasks...</div>}

          {!loading && listRows.length === 0 && (
            <div className="p-4 text-sm text-[#8a7f74]">No tasks found from server.</div>
          )}

          {listRows.map((row) => (
            <div key={row.id} className="obliq-list-row">
              <div className="obliq-list-title-col">
                <span className={`obliq-check ${row.checked ? 'checked' : ''}`} aria-hidden="true" />
                <span className="obliq-list-title">{row.title}</span>
              </div>
              <span className="obliq-list-client">{row.client}</span>
              <span className={`obliq-priority ${row.priority}`}>
                <span className="obliq-priority-mark">P</span>
                {row.priorityLabel}
              </span>
              <span className="obliq-list-date">{row.date}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="obliq-board-section">
        <div className="obliq-board-toolbar">
          <div className="obliq-board-search">
            <span className="obliq-search-icon" aria-hidden="true">o</span>
            <span className="obliq-search-placeholder">Search board</span>
          </div>
          <div className="obliq-board-tabs" role="tablist" aria-label="Task Board Views">
            <button type="button" className="obliq-board-tab">List</button>
            <button type="button" className="obliq-board-tab active">Kanban</button>
            <button type="button" className="obliq-board-tab">Calendar</button>
          </div>
        </div>

        <div className="obliq-kanban-row">
          {kanbanColumns.map((column) => (
            <article key={column.key} className="obliq-kanban-col">
              <header className="obliq-kanban-col-head">
                <span className="obliq-kanban-dot" aria-hidden="true" />
                <span>{column.title}</span>
                <span className="obliq-kanban-ellipsis" aria-hidden="true">:</span>
              </header>

              <div className="obliq-kanban-stack">
                {column.rows.length === 0 && (
                  <div className="obliq-kanban-card">
                    <p className="obliq-kanban-client">No tasks in this column.</p>
                  </div>
                )}

                {column.rows.map((row) => (
                  <div key={row.id} className="obliq-kanban-card">
                    <div className="obliq-list-title-col">
                      <span className="obliq-check" aria-hidden="true" />
                      <span className="obliq-list-title">{row.title}</span>
                    </div>

                    <p className="obliq-kanban-client">Client name : {row.client}</p>

                    <div className="obliq-kanban-meta">
                      <span className={`obliq-priority ${row.priority}`}>
                        <span className="obliq-priority-mark">P</span>
                        {row.priorityLabel}
                      </span>
                      <span className="obliq-due">Due : {row.date}</span>
                    </div>

                    <div className="obliq-avatar-row" aria-hidden="true">
                      <span className="obliq-avatar red" />
                      <span className="obliq-avatar blue" />
                      <span className="obliq-avatar green" />
                    </div>

                    <div className="obliq-progress-head">
                      <span>Project completion :</span>
                      <span>{row.progress}%</span>
                    </div>
                    <div className="obliq-progress-track" aria-hidden="true">
                      <span className="obliq-progress-fill" style={{ width: `${row.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
