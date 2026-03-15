import { authApi, permissionsApi } from './api';
import type { LoginRequest, User } from '../types';

export interface SessionBootstrap {
	user: User;
	accessToken: string;
	permissions: string[];
}

function normalizePermissionAtom(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[._\s]+/g, ':')
		.replace(/:+/g, ':');
}

function extractAtomCandidate(value: unknown): string | null {
	if (typeof value === 'string') {
		return normalizePermissionAtom(value);
	}

	if (!value || typeof value !== 'object') {
		return null;
	}

	const record = value as Record<string, unknown>;
	if (typeof record.atom === 'string') {
		return normalizePermissionAtom(record.atom);
	}
	if (typeof record.permissionAtom === 'string') {
		return normalizePermissionAtom(record.permissionAtom);
	}

	return null;
}

function collectPermissionAtoms(payload: unknown, bag: Set<string>) {
	const atom = extractAtomCandidate(payload);
	if (atom) {
		bag.add(atom);
	}

	if (Array.isArray(payload)) {
		for (const item of payload) {
			collectPermissionAtoms(item, bag);
		}
		return;
	}

	if (!payload || typeof payload !== 'object') {
		return;
	}

	const record = payload as Record<string, unknown>;
	for (const key of ['permissions', 'atoms', 'data', 'items', 'role', 'extra', 'userPermissions', 'permission']) {
		if (key in record) {
			collectPermissionAtoms(record[key], bag);
		}
	}
}

function normalizePermissionPayload(payload: unknown): string[] {
	const bag = new Set<string>();
	collectPermissionAtoms(payload, bag);
	return [...bag];
}

function getPermissionsFromUser(user: User): string[] {
	const bag = new Set<string>();
	collectPermissionAtoms(user.role?.permissions, bag);
	collectPermissionAtoms(user.userPermissions, bag);
	return [...bag];
}

function mergePermissions(user: User, payload: unknown): string[] {
	const bag = new Set<string>();

	for (const atom of getPermissionsFromUser(user)) {
		bag.add(atom);
	}

	for (const atom of normalizePermissionPayload(payload)) {
		bag.add(atom);
	}

	return [...bag];
}

export async function bootstrapSession(): Promise<SessionBootstrap> {
	const refresh = await authApi.refresh();
	const [user, rawPermissions] = await Promise.all([
		authApi.me(refresh.accessToken),
		permissionsApi.my(refresh.accessToken),
	]);

	return {
		user,
		accessToken: refresh.accessToken,
		permissions: mergePermissions(user, rawPermissions),
	};
}

export async function loginAndBootstrap(payload: LoginRequest): Promise<SessionBootstrap> {
	const login = await authApi.login(payload);
	const [user, rawPermissions] = await Promise.all([
		authApi.me(login.accessToken),
		permissionsApi.my(login.accessToken),
	]);

	return {
		user,
		accessToken: login.accessToken,
		permissions: mergePermissions(user, rawPermissions),
	};
}

export async function logoutSession() {
	await authApi.logout();
}
