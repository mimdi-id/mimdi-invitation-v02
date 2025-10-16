'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Tipe data untuk undangan yang akan ditampilkan
type DisplayInvitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminInvitationsPage() {
  const { token } = useAuth();

  const [invitations, setInvitations] = useState<DisplayInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect untuk mengambil data undangan
  useEffect(() => {
    if (token) {
      const fetchInvitations = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/admin/invitations`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Gagal mengambil daftar undangan.');
          }

          const data: DisplayInvitation[] = await response.json();
          setInvitations(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };

      fetchInvitations();
    }
  }, [token]);

  if (isLoading) {
    return <div className="p-10 text-center">Memuat daftar undangan...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Manajemen Undangan</h1>
      <p className="mt-1 text-slate-600">Daftar semua undangan yang dibuat di platform.</p>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Judul</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Pembuat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {invitations.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{inv.title}</div>
                  <div className="text-xs text-slate-500">/u/{inv.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{inv.author.name}</div>
                  <div className="text-xs text-slate-500">{inv.author.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                   <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                      {inv.status}
                    </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{new Date(inv.createdAt).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
