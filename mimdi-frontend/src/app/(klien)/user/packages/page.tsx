'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipe data untuk sebuah paket
type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: {
    maxPhotos: number;
    maxRevisions: number;
    watermark: boolean;
    qrCode?: boolean;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PackagesPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Menyimpan ID paket yang sedang diproses

  // useEffect untuk mengambil daftar paket
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/packages`);
        if (!response.ok) {
          throw new Error('Gagal mengambil daftar paket.');
        }
        const data: Package[] = await response.json();
        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Fungsi untuk menangani pembelian paket
  const handlePurchase = async (packageId: string) => {
    if (!token) {
      alert('Anda harus login untuk membeli paket.');
      return;
    }

    setIsSubmitting(packageId);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memproses pembelian.');
      }
      
      alert('Pembelian berhasil! Anda sekarang memiliki paket baru.');
      // Arahkan ke dashboard setelah berhasil
      router.push('/user/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(null);
    }
  };


  // useEffect untuk melindungi halaman
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);
  
  if (isLoading || isAuthLoading) {
    return <div className="p-10 text-center">Memuat paket...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.back()} className="mb-6 text-sm font-semibold text-orange-600 hover:text-orange-500">
          &larr; Kembali
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Pilih Paket Undangan</h1>
        <p className="mt-2 text-slate-600">Pilih paket yang paling sesuai dengan kebutuhan Anda.</p>
        
        {error && <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col rounded-lg border bg-white shadow-sm">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800">{pkg.name}</h2>
                <p className="mt-4 text-4xl font-extrabold text-slate-900">
                  Rp {pkg.price.toLocaleString('id-ID')}
                  <span className="text-base font-medium text-slate-500"> / {pkg.durationDays} hari</span>
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-6 bg-slate-50 p-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                    <span>Akses Tema {pkg.name}</span>
                  </li>
                   <li className="flex items-start">
                    <span className="mr-3 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                    <span>Maksimal {pkg.features.maxPhotos} Foto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                    <span>{pkg.features.maxRevisions}x Revisi</span>
                  </li>
                  {pkg.features.qrCode && (
                    <li className="flex items-start">
                      <span className="mr-3 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                      <span>QR Code Tamu</span>
                    </li>
                  )}
                </ul>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isSubmitting === pkg.id}
                  className="w-full rounded-md bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-500 disabled:bg-slate-400"
                >
                  {isSubmitting === pkg.id ? 'Memproses...' : 'Pilih Paket'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
