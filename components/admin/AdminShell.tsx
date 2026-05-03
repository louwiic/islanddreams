'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return (
      <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-body)]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-body)]">
      <Sidebar />
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
