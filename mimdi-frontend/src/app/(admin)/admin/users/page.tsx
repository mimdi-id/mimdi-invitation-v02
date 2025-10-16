'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipe data untuk pengguna yang akan ditampilkan di tabel
type DisplayUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect untuk melindungi halaman dan mengambil data
  useEffect(() => {
    // Pertama, pastikan proses loading otentikasi selesai
    if (!isAuthLoading) {
      // Jika tidak ada user atau user bukan admin, tendang keluar
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }

      // Jika user adalah admin, ambil data pengguna
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Gagal mengambil daftar pengguna.');
          }

          const data: DisplayUser[] = await response.json();
          setUsers(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };

      fetchUsers();
    }
  }, [user, token, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return <div className="p-10 text-center">Memuat halaman admin...</div>;
  }
  
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">Manajemen Pengguna</h1>
        <p className="mt-1 text-slate-600">Daftar semua pengguna yang terdaftar di platform.</p>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nama</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Peran</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{u.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                     <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${u.role === 'ADMIN' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                        {u.role}
                      </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
