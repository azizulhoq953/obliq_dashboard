'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { User, UserStatus } from '../../../types';

const STATUS_OPTIONS: UserStatus[] = ['active', 'suspended', 'banned'];

function statusClass(status: UserStatus) {
	if (status === 'active') return 'bg-green-100 text-green-700';
	if (status === 'suspended') return 'bg-amber-100 text-amber-700';
	return 'bg-red-100 text-red-700';
}

export default function UsersPage() {
	const router = useRouter();
	const { hasPermission } = useAuthStore();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const canUpdateStatus = hasPermission('users:update');

	useEffect(() => {
		if (!hasPermission('users:read')) {
			router.push('/forbidden');
			return;
		}

		usersApi
			.list()
			.then((data) => setUsers(data))
			.catch(() => setError('Failed to load users.'))
			.finally(() => setLoading(false));
	}, [hasPermission, router]);

	async function handleStatusChange(userId: string, status: UserStatus) {
		setUpdatingId(userId);
		setError('');
		try {
			const updated = await usersApi.updateStatus(userId, status);
			setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
		} catch {
			setError('Failed to update user status.');
		} finally {
			setUpdatingId(null);
		}
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">Users</h1>
				<p className="text-gray-500 mt-1">Manage users and account statuses</p>
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
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{users.map((user) => (
							<tr key={user.id} className="hover:bg-gray-50 transition">
								<td className="px-6 py-4 text-sm text-gray-800 font-medium">
									{user.firstName} {user.lastName}
								</td>
								<td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
								<td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.role?.name}</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<span className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${statusClass(user.status)}`}>
											{user.status}
										</span>
										<select
											value={user.status}
											onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
											disabled={!canUpdateStatus || updatingId === user.id}
											className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{STATUS_OPTIONS.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</select>
									</div>
								</td>
								<td className="px-6 py-4">
									<Link href={`/users/${user.id}`} className="text-sm font-medium text-orange-600 hover:text-orange-700">
										View details
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{!loading && users.length === 0 && (
					<div className="py-16 text-center text-gray-400">No users found.</div>
				)}

				{loading && (
					<div className="py-16 flex items-center justify-center">
						<div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>
		</div>
	);
}
