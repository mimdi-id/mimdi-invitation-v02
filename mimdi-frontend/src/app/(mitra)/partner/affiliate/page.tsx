'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PartnerProfile = {
  id: string;
  affiliateCode: string | null;
  user: { name: string; email: string; };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = "http://localhost:3000"; // Nanti ini akan diganti dengan mimdi.id

export default function PartnerAffiliatePage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [affiliateCode, setAffiliateCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/partners/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil profil mitra.');
      const data: PartnerProfile = await response.json();
      setProfile(data);
      setAffiliateCode(data.affiliateCode || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'PARTNER') {
      fetchProfile();
    }
  }, [token, isAuthLoading, user]);

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !affiliateCode.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/partners/affiliate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: affiliateCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan kode.');
      }
      
      setMessage('Kode afiliasi berhasil disimpan!');
      await fetchProfile(); // Ambil ulang data untuk memperbarui tampilan
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fullAffiliateLink = profile?.affiliateCode 
    ? `${BASE_URL}/register?ref=${profile.affiliateCode}`
    : '';
  
  const handleCopyLink = () => {
    if (!fullAffiliateLink) return;
    navigator.clipboard.writeText(fullAffiliateLink).then(() => {
      alert('Link afiliasi berhasil disalin!');
    }).catch(err => {
      console.error('Gagal menyalin link', err);
    });
  };

  if (isAuthLoading || isLoading) {
    return <div className="flex h-full items-center justify-center"><p>Memuat halaman afiliasi...</p></div>;
  }
  
  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Pengaturan Afiliasi</h1>
          <p className="mt-1 text-muted-foreground">Kelola link unik Anda untuk mengundang klien baru.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Link Afiliasi Anda</CardTitle>
            <CardDescription>
              Bagikan link ini kepada calon klien. Setiap pendaftaran melalui link ini akan tercatat sebagai klien Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fullAffiliateLink ? (
              <div className="flex items-center gap-2">
                <Input value={fullAffiliateLink} readOnly />
                <Button onClick={handleCopyLink}>Salin Link</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda belum mengatur kode afiliasi. Silakan atur di bawah ini untuk mendapatkan link.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atur Kode Afiliasi</CardTitle>
            <CardDescription>
              Buat kode yang unik dan mudah diingat. Hanya bisa diatur satu kali jika belum ada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCode} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="affiliate-code">Kode Unik Anda</Label>
                <Input
                  id="affiliate-code"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  placeholder="Contoh: SUKSES-BERSAMA"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kode'}
              </Button>
            </form>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
