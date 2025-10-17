'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipe data ini sama seperti di halaman create klien
type Template = {
  id: string;
  name: string;
  category: 'BASIC' | 'PREMIUM';
  previewUrl: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerCreateInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTemplateId || !title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Panggil endpoint khusus mitra
      const response = await fetch(`${API_URL}/partners/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, slug, templateId: selectedTemplateId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat undangan');
      }
      
      alert('Undangan berhasil dibuat! Kuota Anda telah berkurang 1.');
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

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  if (isAuthLoading || isLoading) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button 
          onClick={() => selectedTemplateId ? setSelectedTemplateId(null) : router.back()} 
          className="mb-6 text-sm font-semibold text-orange-600 hover:text-orange-500"
        >
          &larr; Kembali
        </button>
        
        {!selectedTemplateId ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">Pilih Tema untuk Klien</h1>
            <p className="mt-2 text-slate-600">Semua tema tersedia untuk Anda.</p>
            
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  onClick={() => setSelectedTemplateId(template.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {template.category === 'PREMIUM' && (
                    <div className="absolute top-2 right-2 z-10 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                      Premium
                    </div>
                  )}
                  <img
                    src={template.previewUrl || 'https://placehold.co/600x400/EEE/333?text=No+Preview'}
                    alt={template.name}
                    className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800">{template.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Buat Undangan untuk Klien</h1>
            <p className="mt-2 text-slate-600">Isi detail dasar untuk undangan klien Anda.</p>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                 <div className="overflow-hidden rounded-lg bg-white shadow">
                  <img
                    src={selectedTemplate?.previewUrl || ''}
                    alt={selectedTemplate?.name}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800">{selectedTemplate?.name}</h3>
                    <p className="text-sm text-slate-500">Tema yang dipilih</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                 <form onSubmit={handleCreateInvitation} className="space-y-4 rounded-lg bg-white p-8 shadow">
                   <div>
                      <label htmlFor="title" className="block text-sm font-medium text-slate-700">Judul Undangan Klien</label>
                      <input
                        type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder="Contoh: Pernikahan Klien Anda"
                      />
                    </div>
                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-slate-700">URL Undangan</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">mimdi.id/u/</span>
                        <input
                          type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required
                          className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                          placeholder="klien-bahagia"
                        />
                      </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="text-right pt-4">
                       <button
                        type="submit" disabled={isSubmitting}
                        className="rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400"
                       >
                        {isSubmitting ? 'Membuat...' : 'Gunakan Kuota & Buat'}
                      </button>
                    </div>
                 </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
