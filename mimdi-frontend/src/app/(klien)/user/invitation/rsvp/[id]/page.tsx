'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Definisikan tipe data untuk tamu (Guest)
type Guest = {
  id: string;
  name: string;
  status: string;
  message: string | null;
  createdAt: string;
};

// Ambil URL API dari variabel lingkungan
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RsvpListPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Ambil ID undangan dari URL

  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect untuk mengambil daftar RSVP saat halaman dimuat
  useEffect(() => {
    if (token && id) {
      const fetchRsvps = async () => {
        try {
          setIsLoading(true);
          // Panggil endpoint pribadi yang aman
          const response = await fetch(`${API_URL}/invitations/${id}/rsvps`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error('Gagal mengambil daftar RSVP atau Anda tidak memiliki akses.');
          }

          const data: Guest[] = await response.json();
          setGuests(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRsvps();
    }
  }, [id, token]);

  // useEffect untuk melindungi halaman
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isLoading || isAuthLoading) {
    return <div className="p-10 text-center">Memuat daftar tamu...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/user/dashboard" className="mb-6 inline-block text-sm font-semibold text-orange-600 hover:text-orange-500">
          &larr; Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Daftar Konfirmasi Kehadiran
        </h1>

        <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nama</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Pesan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {guests.length > 0 ? (
                guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{guest.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {guest.status === 'ATTENDING' ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">Hadir</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">Berhalangan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{guest.message || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">
                    Belum ada tamu yang melakukan konfirmasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
