'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipe data untuk sebuah tema/template
type Template = {
  id: string;
  name: string;
  category: 'BASIC' | 'PREMIUM';
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateClientAndInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk form gabungan
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [invitationTitle, setInvitationTitle] = useState('');
  const [invitationSlug, setInvitationSlug] = useState('');
  const [templateId, setTemplateId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect untuk mengambil daftar tema
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/templates`);
        if (!response.ok) throw new Error('Gagal mengambil daftar tema.');
        const data: Template[] = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !templateId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/partners/create-client-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          clientName, 
          clientEmail, 
          invitationTitle, 
          invitationSlug, 
          templateId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat akun klien.');
      }
      
      const result = await response.json();
      // Tampilkan informasi penting kepada Mitra
      alert(`Berhasil! Akun klien telah dibuat.\n\nEmail: ${result.clientEmail}\nPassword Sementara: ${result.clientTemporaryPassword}\n\nHarap simpan dan berikan informasi ini kepada klien Anda.`);
      router.push('/partner/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'PARTNER')) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || isLoading) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.back()} className="mb-6 text-sm font-semibold text-orange-600 hover:text-orange-500">
          &larr; Kembali ke Dashboard
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Buat Klien & Undangan Baru</CardTitle>
            <CardDescription>
              Isi form di bawah ini untuk mendaftarkan klien baru dan membuatkan undangan pertama untuk mereka. Satu kuota akan digunakan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">Data Klien Baru</legend>
                 <div className="space-y-2">
                  <Label htmlFor="clientName">Nama Klien</Label>
                  <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Nama lengkap klien" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email Klien</Label>
                  <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required placeholder="Email aktif klien" />
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">Data Undangan</legend>
                 <div className="space-y-2">
                  <Label htmlFor="invitationTitle">Judul Undangan</Label>
                  <Input id="invitationTitle" value={invitationTitle} onChange={(e) => setInvitationTitle(e.target.value)} required placeholder="Contoh: Pernikahan Klien Anda"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invitationSlug">URL Undangan</Label>
                   <div className="flex items-center">
                    <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">mimdi.id/u/</span>
                    <Input id="invitationSlug" value={invitationSlug} onChange={(e) => setInvitationSlug(e.target.value)} required className="rounded-l-none" placeholder="klien-bahagia"/>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="templateId">Pilih Tema</Label>
                   <Select onValueChange={setTemplateId} value={templateId} required>
                    <SelectTrigger><SelectValue placeholder="Pilih tema yang akan digunakan..." /></SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </fieldset>

              {error && <p className="pt-2 text-sm text-red-600">{error}</p>}
              
              <div className="text-right pt-4">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? 'Memproses...' : 'Buat & Gunakan Kuota'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
