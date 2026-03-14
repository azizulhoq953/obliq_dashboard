'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { settingsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

function pretty(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

export default function ConfigurationPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const canRead = hasPermission('settings:read') || hasPermission('configuration:read');
  const canWrite = hasPermission('settings:write') || hasPermission('configuration:write');

  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [editorText, setEditorText] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!canRead) {
      router.push('/forbidden');
      return;
    }

    settingsApi
      .get()
      .then((res) => {
        const record = (res || {}) as Record<string, unknown>;
        setSettings(record);
        setEditorText(pretty(record));
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load settings.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [canRead, router]);

  async function handleSave() {
    setError('');
    setSuccess('');

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(editorText) as Record<string, unknown>;
    } catch {
      setError('Invalid JSON format.');
      return;
    }

    setSaving(true);
    try {
      const updated = await settingsApi.update(parsed);
      const record = (updated || {}) as Record<string, unknown>;
      setSettings(record);
      setEditorText(pretty(record));
      setSuccess('Settings saved successfully.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save settings.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-500 mt-1">Live settings from server</p>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loading ? (
          <div className="text-gray-400">Loading settings...</div>
        ) : (
          <>
            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              className="w-full h-[420px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-700 outline-none focus:border-orange-300"
              readOnly={!canWrite}
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canWrite || saving}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {!canWrite && <span className="text-xs text-gray-400">You have read-only access.</span>}
            </div>

            <pre className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 overflow-auto">
              {pretty(settings)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
