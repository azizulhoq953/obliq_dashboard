'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import PermissionEditor from '../../../components/permissions/PermissionEditor';
import { usersApi } from '../../../lib/api';
import { User } from '../../../types';

export default function PermissionsPage() {
  const { hasPermission } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('permissions:read')) {
      router.push('/forbidden');
      return;
    }

    usersApi
      .list()
      .then((data) => setUsers(data))
      .catch(() => setError('Failed to load users.'));
  }, [hasPermission, router]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Permission Manager</h1>
        <p className="text-gray-500 mt-1">Grant or revoke permission atoms per user</p>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Users</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition hover:bg-gray-50 ${selected?.id === u.id ? 'bg-orange-50' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-medium">
                  {u.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-400 capitalize">{u.role?.name}</p>
                </div>
                <span className={`ml-auto w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}/>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <PermissionEditor
              targetUserId={selected.id}
              targetName={`${selected.firstName} ${selected.lastName}`}
            />
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
              Select a user to manage their permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}