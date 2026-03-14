export type RoleName = 'admin' | 'manager' | 'agent' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface Permission {
  id: string;
  atom: string;
  module: string;
  action: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: { id: string; name: RoleName; permissions: Permission[] };
  userPermissions: { permission: Permission }[];
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: RoleName;
  managerId: string | null;
}

export interface UserPermissionsResponse {
  role: Permission[];
  extra: Permission[];
}

export interface PermissionMutationRequest {
  targetUserId: string;
  permissionAtom: string;
}

export interface AuditActor {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor?: AuditActor | null;
  metadata?: unknown;
  createdAt: string;
}

export interface AuditListResponse {
  logs: AuditLog[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface Task {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  clientName?: string;
  progress?: number;
  completed?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  createdAt?: string;
}

export interface LeadUpsertRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  notes?: string;
}

export interface AssignLeadRequest {
  assigneeId: string;
}

export interface TaskUpsertRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  clientName?: string;
  leadId?: string;
}

export interface DashboardSummaryResponse {
  totalUsers?: number;
  activeTasks?: number;
  openLeads?: number;
  auditEvents?: number;
  [key: string]: unknown;
}

export interface ReportOverviewResponse {
  [key: string]: unknown;
}

export interface CustomerPortalOverviewResponse {
  [key: string]: unknown;
}

export interface CustomerTicket {
  id: string;
  title?: string;
  subject?: string;
  status?: string;
  priority?: string;
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SettingsResponse {
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  isLoading: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission: string;
  children?: NavItem[];
}