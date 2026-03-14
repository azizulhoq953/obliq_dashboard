'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { Permission, User, UserStatus } from '../../../../types';

const STATUS_OPTIONS: UserStatus[] = ['active', 'suspended', 'banned'];

function statusClass(status: UserStatus) {
	if (status === 'active') return 'bg-green-100 text-green-700';
	if (status === 'suspended') return 'bg-amber-100 text-amber-700';
	return 'bg-red-100 text-red-700';
}

export default function UserDetailsPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const userId = useMemo(() => params?.id || '', [params]);

	const { hasPermission } = useAuthStore();

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	const mergedPermissions = useMemo<Permission[]>(() => {
		if (!user) {
			return [];
		}

		const fromRole = user.role?.permissions || [];
		const extras = (user.userPermissions || []).map((item) => item.permission);
		const byAtom = new Map<string, Permission>();
		[...fromRole, ...extras].forEach((perm) => byAtom.set(perm.atom, perm));
		return Array.from(byAtom.values());
	}, [user]);

	useEffect(() => {
		if (!hasPermission('users:read')) {
			router.push('/forbidden');
			return;
		}

		if (!userId) {
			setError('Invalid user id.');
			setLoading(false);
			return;
		}

		usersApi
			.getById(userId)
			.then((data) => setUser(data))
			.catch(() => setError('Failed to load user details.'))
			.finally(() => setLoading(false));
	}, [hasPermission, userId, router]);

	async function handleStatusChange(status: UserStatus) {
		if (!user) {
			return;
		}

		setSaving(true);
		setError('');
		try {
			const updated = await usersApi.updateStatus(user.id, status);
			setUser(updated);
		} catch {
			setError('Failed to update status.');
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="p-8">
				<div className="py-24 flex items-center justify-center">
					<div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-8">
				<Link href="/users" className="text-sm font-medium text-orange-600 hover:text-orange-700">
					Back to users
				</Link>
				<div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error || 'User not found.'}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="mb-6">
				<Link href="/users" className="text-sm font-medium text-orange-600 hover:text-orange-700">
					Back to users
				</Link>
			</div>

			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
				<p className="text-gray-500 mt-1">User profile and access details</p>
			</div>

			{error && (
				<div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 lg:col-span-1">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email</p>
						<p className="text-sm text-gray-700 mt-1">{user.email}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Role</p>
						<p className="text-sm text-gray-700 mt-1 capitalize">{user.role?.name}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Created</p>
						<p className="text-sm text-gray-700 mt-1">{new Date(user.createdAt).toLocaleString()}</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Status</p>
						<div className="flex items-center gap-3">
							<span className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${statusClass(user.status)}`}>
								{user.status}
							</span>
							<select
								value={user.status}
								onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
								disabled={saving || !hasPermission('users:update')}
								className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{STATUS_OPTIONS.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
					<h2 className="font-semibold text-gray-900 mb-4">Effective Permissions</h2>
					{mergedPermissions.length === 0 ? (
						<p className="text-sm text-gray-400">No permissions found for this user.</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{mergedPermissions.map((perm) => (
								<span key={perm.atom} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
									{perm.atom}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
