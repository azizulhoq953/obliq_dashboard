'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/authStore';
import { bootstrapSession } from '../../lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setAuth, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken || user) {
      return;
    }

    bootstrapSession()
      .then((session) => {
        setAuth(session.user, session.accessToken, session.permissions);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [accessToken, user, setAuth, router]);

  if (!user && !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6efe7]">
        <div className="w-8 h-8 border-2 border-[#e86132] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="obliq-stage">
      <div className="obliq-stage-glow" aria-hidden="true" />
      <div className="obliq-dashboard-shell">
        <Sidebar />
        <main className="obliq-dashboard-main">{children}</main>
      </div>
    </div>
  );
}