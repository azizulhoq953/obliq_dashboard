import { authApi, permissionsApi } from './api';
import type { LoginRequest, User } from '../types';

export interface SessionBootstrap {
	user: User;
	accessToken: string;
	permissions: string[];
}

export async function bootstrapSession(): Promise<SessionBootstrap> {
	const refresh = await authApi.refresh();
	const [user, permissions] = await Promise.all([
		authApi.me(refresh.accessToken),
		permissionsApi.my(refresh.accessToken),
	]);

	return {
		user,
		accessToken: refresh.accessToken,
		permissions,
	};
}

export async function loginAndBootstrap(payload: LoginRequest): Promise<SessionBootstrap> {
	const login = await authApi.login(payload);
	const [user, permissions] = await Promise.all([
		authApi.me(login.accessToken),
		permissionsApi.my(login.accessToken),
	]);

	return {
		user,
		accessToken: login.accessToken,
		permissions,
	};
}

export async function logoutSession() {
	await authApi.logout();
}
