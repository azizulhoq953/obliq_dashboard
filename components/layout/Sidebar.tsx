'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { logoutSession } from '../../lib/auth';

type NavItem = {
  label: string;
  href: string;
  permissions: string[];
  section?: 'users' | 'other';
  badge?: string;
  expandable?: boolean;
  children?: Array<{ label: string; href: string; permissions: string[] }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', permissions: ['dashboard:read'] },
  { label: 'Leads', href: '/leads', permissions: ['leads:read'] },
  { label: 'Opportunities', href: '/opportunities', permissions: ['opportunities:read'] },
  {
    label: 'Tasks',
    href: '/tasks',
    permissions: ['tasks:read'],
    expandable: true,
    children: [
      { label: 'Assignments', href: '/tasks/assignments', permissions: ['tasks:read'] },
      { label: 'Calendar', href: '/tasks/calendar', permissions: ['tasks:read'] },
      { label: 'Reminders', href: '/tasks/reminders', permissions: ['tasks:read'] },
    ],
  },
  { label: 'Reports', href: '/reports', permissions: ['reports:read'], expandable: true },
  { label: 'Contacts', href: '/contacts', permissions: ['customer-portal:read', 'contacts:read'], section: 'users', badge: '+' },
  { label: 'Messages', href: '/messages', permissions: ['customer-portal:read', 'messages:read'], section: 'users', badge: '6' },
  { label: 'Configuration', href: '/configuration', permissions: ['settings:read', 'configuration:read'], section: 'other' },
  { label: 'Invoice', href: '/invoice', permissions: ['invoice:read'], section: 'other' },
];

function DotIcon() {
  return <span className="obliq-nav-dot" aria-hidden="true" />;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, permissions, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hasAnyPermission = (required: string[]) => required.some((p) => permissions.includes(p));

  const visibleItems = NAV_ITEMS.filter((item) => hasAnyPermission(item.permissions));
  const topItems = visibleItems.filter((item) => !item.section);
  const userItems = visibleItems.filter((item) => item.section === 'users');
  const otherItems = visibleItems.filter((item) => item.section === 'other');

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const workspaceId = `#WD${user?.id?.slice(0, 8).toUpperCase() || '12446875'}`;

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logoutSession();
    } catch {
      // Still clear local session and navigate out even if server logout fails.
    } finally {
      clearAuth();
      router.replace('/login');
    }
  }

  return (
    <aside className="obliq-sidebar" aria-label="Workspace Sidebar">
      <div className="obliq-sidebar-brand">Overlay</div>

      <div className="obliq-workspace-card">
        <div className="obliq-workspace-avatar">W</div>
        <div className="obliq-workspace-info">
          <p className="obliq-workspace-name">{user ? `${user.firstName}'s workspace` : "John's workspace"}</p>
          <p className="obliq-workspace-id">{workspaceId}</p>
        </div>
        <span className="obliq-workspace-caret" aria-hidden="true">^</span>
      </div>

      <nav className="obliq-nav" aria-label="Main Navigation">
        {topItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.href}>
              <Link href={item.href} className={`obliq-nav-item ${active ? 'active' : ''}`}>
                <span className="obliq-nav-left">
                  <DotIcon />
                  <span>{item.label}</span>
                </span>
                {item.expandable && <span className="obliq-nav-trailing">v</span>}
              </Link>
              {item.children && active && (
                <div className="obliq-nav-children">
                  {item.children
                    .filter((child) => hasAnyPermission(child.permissions))
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`obliq-nav-child ${pathname === child.href ? 'active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          );
        })}

        {userItems.length > 0 && <p className="obliq-nav-section">Users</p>}
        {userItems.map((item) => (
          <Link key={item.href} href={item.href} className={`obliq-nav-item ${isActive(item.href) ? 'active' : ''}`}>
            <span className="obliq-nav-left">
              <DotIcon />
              <span>{item.label}</span>
            </span>
            {item.badge && <span className="obliq-nav-badge">{item.badge}</span>}
          </Link>
        ))}

        {otherItems.length > 0 && <p className="obliq-nav-section">Other</p>}
        {otherItems.map((item) => (
          <Link key={item.href} href={item.href} className={`obliq-nav-item ${isActive(item.href) ? 'active' : ''}`}>
            <span className="obliq-nav-left">
              <DotIcon />
              <span>{item.label}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="obliq-sidebar-footer">
        <button type="button" className="obliq-footer-btn">
          <DotIcon />
          Help center
        </button>
        <button
          type="button"
          className="obliq-footer-btn obliq-footer-btn-danger"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <DotIcon />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
