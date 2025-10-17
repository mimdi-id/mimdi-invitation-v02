'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
// Impor komponen-komponen baru dari Shadcn UI
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { user, logout, isLoading: isAuthLoading, token } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

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


  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  return (
    user && (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="bg-white dark:bg-slate-900 border-b">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
              Selamat datang, {user.name}!
            </h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Undangan Saya
                </h2>
                <p className="text-muted-foreground text-sm">Kelola semua undangan yang telah Anda buat.</p>
              </div>
              <Button asChild>
                <Link href="/user/invitation/create">
                  + Buat Undangan Baru
                </Link>
              </Button>
            </div>

            {fetchError && <p className="text-red-500">{fetchError}</p>}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.length > 0 ? (
                invitations.map((inv) => (
                  <Card key={inv.id}>
                    <CardHeader>
                      <CardTitle className="truncate">{inv.title}</CardTitle>
                      <CardDescription>
                        /u/{inv.slug}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                         inv.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                       }`}>
                          {inv.status}
                        </span>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                       <Button variant="outline" size="sm" asChild>
                        <Link href={`/user/invitation/rsvp/${inv.id}`}>Lihat RSVP</Link>
                      </Button>
                      <Button size="sm" asChild>
                         <Link href={`/user/invitation/edit/${inv.id}`}>Edit</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">Anda belum memiliki undangan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Mulai buat undangan pertama Anda sekarang!</p>
                  <Button className="mt-4" asChild>
                     <Link href="/user/invitation/create">
                      Buat Undangan Baru
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  );
}

