import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

// Toutes les pages admin sont dynamiques (pas de prerender au build)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Island Dreams',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
