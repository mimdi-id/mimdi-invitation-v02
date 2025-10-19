'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PartnerProfile = {
  id: string;
  remainingQuota: number;
  status: string;
  user: { name: string; email: string; };
};

type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerDashboardPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [profileRes, invRes] = await Promise.all([
        fetch(`${API_URL}/partners/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/partners/invitations`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!profileRes.ok) throw new Error('Gagal mengambil profil mitra.');
      if (!invRes.ok) throw new Error('Gagal mengambil daftar undangan.');
      
      const profileData: PartnerProfile = await profileRes.json();
      const invData: Invitation[] = await invRes.json();
      
      setProfile(profileData);
      setInvitations(invData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'PARTNER') {
      fetchData();
    }
  }, [token, isAuthLoading, user]);
  
  const handleBuyQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/partners/buy-quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Gagal membeli kuota.');
      
      await fetchData();
      alert(`${quantity} kuota berhasil ditambahkan!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Memuat dashboard mitra...</p>
      </div>
    );
  }
  
  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Dashboard Mitra</h1>
        <p className="mt-1 text-muted-foreground">Selamat datang, {profile?.user.name}!</p>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="md:col-span-1 flex flex-col justify-center items-center text-center">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Sisa Kuota Undangan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-extrabold text-slate-900 dark:text-slate-50">{profile?.remainingQuota}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Beli Kuota Tambahan</CardTitle>
              <CardDescription>Setiap kuota dapat digunakan untuk membuat satu undangan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBuyQuota} className="flex items-end gap-4">
                <div className='flex-1'>
                  <Label htmlFor="quantity" className="sr-only">Jumlah Kuota</Label>
                  <Input
                    type="number" id="quantity" value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1" required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Beli Sekarang'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Undangan yang Dibuat Mitra */}
        <div className="mt-10">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Undangan Klien Saya</h2>
                <p className="text-muted-foreground text-sm">Kelola semua undangan yang Anda buat untuk klien.</p>
             </div>
             {/* --- UBAH TAUTAN INI --- */}
             <Button asChild>
                <Link href="/partner/clients/create">
                  + Buat untuk Klien Baru
                </Link>
             </Button>
          </div>
           <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.length > 0 ? (
                invitations.map((inv) => (
                  <Card key={inv.id}>
                    <CardHeader>
                      <CardTitle className="truncate">{inv.title}</CardTitle>
                      <CardDescription>/u/{inv.slug}</CardDescription>
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
                        <Link href={`/partner/invitation/rsvp/${inv.id}`}>Lihat RSVP</Link>
                      </Button>
                      <Button size="sm" asChild>
                         <Link href={`/partner/invitation/edit/${inv.id}`}>Edit</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">Anda belum membuat undangan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Gunakan kuota Anda untuk membuat undangan pertama bagi klien!</p>
                   <Button className="mt-4" asChild>
                     <Link href="/partner/clients/create">
                      Buat untuk Klien Baru
                    </Link>
                  </Button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

