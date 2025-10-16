'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Ini adalah komponen Layout khusus untuk semua halaman di dalam /admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // useEffect untuk melindungi seluruh bagian admin
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      }
    }
  }, [isLoading, user, router]);

  const navItems = [
    { href: '/admin/users', label: 'Pengguna' },
    { href: '/admin/invitations', label: 'Undangan' },
    // Tambahkan item navigasi lain di sini nanti
  ];

  if (isLoading || !user) {
    return <div className="p-10 text-center">Memverifikasi akses admin...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 bg-slate-800 p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-4 py-2 text-sm font-medium ${
                pathname === item.href
                  ? 'bg-slate-900'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold hover:bg-orange-500"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 bg-slate-100 p-8">
        {children}
      </main>
    </div>
  );
}
