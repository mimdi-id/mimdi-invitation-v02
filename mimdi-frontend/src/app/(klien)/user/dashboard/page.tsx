'use client';

// FIX: Menggunakan path relatif yang benar dari /src/app/(klien)/user/dashboard
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="text-2xl font-bold">Selamat Datang di Dashboard!</h1>
        <p className="mt-2 text-slate-600">
          Anda login sebagai: <strong>{user.email}</strong>
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

