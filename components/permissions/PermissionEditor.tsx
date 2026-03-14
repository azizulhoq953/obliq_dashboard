'use client';

import { useState, useEffect } from 'react';
import { permissionsApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Permission, UserPermissionsResponse } from '../../types';

interface Props {
  targetUserId: string;
  targetName: string;
}

export default function PermissionEditor({ targetUserId, targetName }: Props) {
  const { permissions: myPerms } = useAuthStore();
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [userPerms, setUserPerms] = useState<UserPermissionsResponse>({ role: [], extra: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      permissionsApi.listAll(),
      permissionsApi.listUserPermissions(targetUserId),
    ]).then(([all, user]) => {
      setAllPerms(all);
      setUserPerms(user);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load permissions.');
      setLoading(false);
    });
  }, [targetUserId]);

  const resolvedAtoms = [
    ...userPerms.role.map((p) => p.atom),
    ...userPerms.extra.map((p) => p.atom),
  ];

  const modules = [...new Set(allPerms.map((p) => p.module))];

  async function toggle(atom: string, currentlyHas: boolean) {
    if (!myPerms.includes(atom)) return; // grant ceiling
    setSaving(atom);
    try {
      if (currentlyHas && !userPerms.role.find((p) => p.atom === atom)) {
        await permissionsApi.revoke({ targetUserId, permissionAtom: atom });
        setUserPerms((prev) => ({
          ...prev,
          extra: prev.extra.filter((p) => p.atom !== atom),
        }));
      } else if (!currentlyHas) {
        await permissionsApi.grant({ targetUserId, permissionAtom: atom });
        const perm = allPerms.find((p) => p.atom === atom)!;
        setUserPerms((prev) => ({ ...prev, extra: [...prev.extra, perm] }));
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading permissions...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Permissions for {targetName}</h2>
        <p className="text-xs text-gray-400 mt-0.5">You can only grant permissions you hold yourself.</p>
      </div>
      <div className="p-6 space-y-6">
        {modules.map((mod) => {
          const modPerms = allPerms.filter((p) => p.module === mod);
          return (
            <div key={mod}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 capitalize">{mod}</h3>
              <div className="space-y-2">
                {modPerms.map((perm) => {
                  const has = resolvedAtoms.includes(perm.atom);
                  const fromRole = userPerms.role.some((p) => p.atom === perm.atom);
                  const canGrant = myPerms.includes(perm.atom);
                  const isSaving = saving === perm.atom;

                  return (
                    <div key={perm.atom} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{perm.description}</p>
                        <p className="text-xs text-gray-400 font-mono">{perm.atom}</p>
                        {fromRole && (
                          <span className="text-[10px] text-blue-500 font-medium">From role</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!canGrant && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                        )}
                        <button
                          onClick={() => !fromRole && toggle(perm.atom, has)}
                          disabled={!canGrant || fromRole || isSaving}
                          className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                            has
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          } ${!canGrant || fromRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${has ? 'translate-x-5' : 'translate-x-0'}`}/>
                          {isSaving && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                              </svg>
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}