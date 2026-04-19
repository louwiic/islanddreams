import type { Metadata } from 'next';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Admin — Island Dreams',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
