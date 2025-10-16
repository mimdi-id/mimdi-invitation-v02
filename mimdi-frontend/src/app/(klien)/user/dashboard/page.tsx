'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { user, logout, isLoading, token } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Hapus semua state dan fungsi yang berhubungan dengan modal lama
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [newTitle, setNewTitle] = useState('');
  // const [newSlug, setNewSlug] = useState('');
  // const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      const fetchInvitations = async () => {
        try {
          const response = await fetch(`${API_URL}/invitations`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Gagal mengambil data undangan');
          }
          const data: Invitation[] = await response.json();
          setInvitations(data);
        } catch (error) {
          console.error(error);
          setFetchError(
            error instanceof Error ? error.message : 'Terjadi kesalahan',
          );
        }
      };
      fetchInvitations();
    }
  }, [user, token]);

  // Hapus fungsi handleCreateSubmit yang lama

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    user && (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-900">
              Selamat datang, {user.name}!
            </h1>
            <button
              onClick={logout}
              className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
            >
              Logout
            </button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Undangan Saya
              </h2>
              {/* --- UBAH TOMBOL INI MENJADI LINK --- */}
              <Link
                href="/user/invitation/create"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                + Buat Undangan Baru
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.length > 0 ? (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="overflow-hidden rounded-lg bg-white shadow"
                  >
                    <div className="p-5">
                      <h3 className="truncate text-lg font-medium text-slate-900">
                        {inv.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        URL: mimdi.id/u/{inv.slug}
                      </p>
                    </div>
                    <div className="flex divide-x divide-slate-200 bg-slate-50">
                      <Link
                        href={`/user/invitation/edit/${inv.id}`}
                        className="flex-1 px-5 py-3 text-center text-sm font-semibold text-orange-600 hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/user/invitation/rsvp/${inv.id}`}
                        className="flex-1 px-5 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-100"
                      >
                        Lihat RSVP
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">
                  Anda belum memiliki undangan.
                </p>
              )}
            </div>
            {fetchError && <p className="text-red-500 mt-4">{fetchError}</p>}
          </div>
        </main>
        
        {/* Hapus semua kode modal yang lama */}
      </div>
    )
  );
}

