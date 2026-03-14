import axios, { AxiosRequestConfig } from 'axios';
import type {
  AssignLeadRequest,
  AuditListResponse,
  CreateUserRequest,
  CustomerPortalOverviewResponse,
  CustomerTicket,
  DashboardSummaryResponse,
  Lead,
  LeadUpsertRequest,
  LoginRequest,
  LoginResponse,
  Permission,
  PermissionMutationRequest,
  ReportOverviewResponse,
  RefreshResponse,
  SettingsResponse,
  Task,
  TaskUpsertRequest,
  User,
  UserPermissionsResponse,
  UserStatus,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const ACCESS_TOKEN_KEY = 'access_token';

function isBrowser() {
  return typeof window !== 'undefined';
}
  
export function getStoredAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string) {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const canRetry =
      !!original &&
      err.response?.status === 401 &&
      !original._retry &&
      !String(original.url || '').includes('/auth/refresh');

    if (canRetry && original) {
      original._retry = true;
      try {
        const { data } = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        setStoredAccessToken(data.accessToken);
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${data.accessToken}`,
        };
        return api(original);
      } catch {
        clearStoredAccessToken();
        if (isBrowser() && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  },
);

export const authApi = {
  async login(payload: LoginRequest) {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    setStoredAccessToken(data.accessToken);
    return data;
  },
  async refresh() {
    const { data } = await api.post<RefreshResponse>('/auth/refresh');
    setStoredAccessToken(data.accessToken);
    return data;
  },
  async logout() {
    await api.post('/auth/logout');
    clearStoredAccessToken();
  },
  async me(accessToken?: string) {
    const { data } = await api.get<User>('/auth/me', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return data;
  },
};

export const usersApi = {
  async list() {
    const { data } = await api.get<User[]>('/users');
    return data;
  },
  async create(payload: CreateUserRequest) {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  async createUser(payload: CreateUserRequest) {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  async getById(userId: string) {
    const { data } = await api.get<User>(`/users/${userId}`);
    return data;
  },
  async updateStatus(userId: string, status: UserStatus) {
    const { data } = await api.patch<User>(`/users/${userId}/status`, { status });
    return data;
  },
};

export const permissionsApi = {
  async my(accessToken?: string) {
    const { data } = await api.get<string[]>('/permissions/my', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return data;
  },
  async listAll() {
    const { data } = await api.get<Permission[]>('/permissions');
    return data;
  },
  async listUserPermissions(targetUserId: string) {
    const { data } = await api.get<UserPermissionsResponse>(`/permissions/user/${targetUserId}`);
    return data;
  },
  async grant(payload: PermissionMutationRequest) {
    const { data } = await api.post('/permissions/grant', payload);
    return data;
  },
  async grantPermission(payload: PermissionMutationRequest) {
    const { data } = await api.post('/permissions/grant', payload);
    return data;
  },
  async revoke(payload: PermissionMutationRequest) {
    const { data } = await api.delete('/permissions/revoke', { data: payload });
    return data;
  },
};

export const auditApi = {
  async list(params?: { page?: number; limit?: number }) {
    const { data } = await api.get<AuditListResponse>('/audit', { params });
    return data;
  },
};

function unwrapList<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  return [];
}

export const tasksApi = {
  async list() {
    const { data } = await api.get('/tasks');
    return unwrapList<Task>(data, ['tasks', 'items', 'data']);
  },
  async create(payload: TaskUpsertRequest) {
    const { data } = await api.post<Task>('/tasks', payload);
    return data;
  },
  async update(taskId: string, payload: TaskUpsertRequest) {
    const { data } = await api.patch<Task>(`/tasks/${taskId}`, payload);
    return data;
  },
  async complete(taskId: string) {
    const { data } = await api.patch<Task>(`/tasks/${taskId}/complete`);
    return data;
  },
};

export const leadsApi = {
  async list() {
    const { data } = await api.get('/leads');
    return unwrapList<Lead>(data, ['leads', 'items', 'data']);
  },
  async create(payload: LeadUpsertRequest) {
    const { data } = await api.post<Lead>('/leads', payload);
    return data;
  },
  async update(leadId: string, payload: LeadUpsertRequest) {
    const { data } = await api.patch<Lead>(`/leads/${leadId}`, payload);
    return data;
  },
  async assign(leadId: string, payload: AssignLeadRequest) {
    const { data } = await api.patch<Lead>(`/leads/${leadId}/assign`, payload);
    return data;
  },
};

export const dashboardApi = {
  async summary() {
    const { data } = await api.get<DashboardSummaryResponse>('/dashboard/summary');
    return data;
  },
};

export const reportsApi = {
  async overview() {
    const { data } = await api.get<ReportOverviewResponse>('/reports/overview');
    return data;
  },
};

export const customerPortalApi = {
  async overview() {
    const { data } = await api.get<CustomerPortalOverviewResponse>('/customer-portal/overview');
    return data;
  },
  async tickets() {
    const { data } = await api.get('/customer-portal/tickets');
    return unwrapList<CustomerTicket>(data, ['tickets', 'items', 'data']);
  },
};

export const settingsApi = {
  async get() {
    const { data } = await api.get<SettingsResponse>('/settings');
    return data;
  },
  async update(payload: Record<string, unknown>) {
    const { data } = await api.patch<SettingsResponse>('/settings', payload);
    return data;
  },
};

// Convenience groups when you only want explicit POST/PATCH endpoints.
export const postApi = {
  login: (payload: LoginRequest) => authApi.login(payload),
  refresh: () => authApi.refresh(),
  logout: () => authApi.logout(),
  createUser: (payload: CreateUserRequest) => usersApi.createUser(payload),
  grantPermission: (payload: PermissionMutationRequest) => permissionsApi.grantPermission(payload),
  createTask: (payload: TaskUpsertRequest) => tasksApi.create(payload),
  createLead: (payload: LeadUpsertRequest) => leadsApi.create(payload),
};

export const patchApi = {
  updateUserStatus: (userId: string, status: UserStatus) => usersApi.updateStatus(userId, status),
  updateTask: (taskId: string, payload: TaskUpsertRequest) => tasksApi.update(taskId, payload),
  completeTask: (taskId: string) => tasksApi.complete(taskId),
  updateLead: (leadId: string, payload: LeadUpsertRequest) => leadsApi.update(leadId, payload),
  assignLead: (leadId: string, payload: AssignLeadRequest) => leadsApi.assign(leadId, payload),
  updateSettings: (payload: Record<string, unknown>) => settingsApi.update(payload),
};

export default api;