'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, PartyPopper } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createWhatsAppLink } from '@/lib/whatsapp';
import { toast } from 'sonner';

// Tipe data untuk Package
type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: any;
  isActive: boolean;
};

// Tipe data untuk Invoice/Transaksi
type Transaction = {
  id: string;
  invoiceId: string;
  amount: number;
  status: string;
  uniqueCode: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function Pricing() {
  const [packages, setPackages] = useState<Package[]>([]);
  const { user, token } = useAuth();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [invoice, setInvoice] = useState<Transaction | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_URL}/packages`);
        if (response.ok) {
          const data = await response.json();
          setPackages(data.filter((p: Package) => p.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch packages', error);
        toast.error('Gagal memuat daftar paket.');
      }
    };
    fetchPackages();
  }, []);

  // --- PERUBAHAN: Logika handleOrder diperkuat dengan debugging ---
  const handleOrder = async (pkg: Package) => {
    if (!user) {
      router.push('/login?redirect=/undangan');
      return;
    }

    setIsOrdering(true);
    setSelectedPackage(pkg);
    setInvoice(null);
    setIsInvoiceDialogOpen(true);

    try {
      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: pkg.id,
          itemType: 'PACKAGE',
        }),
      });

      const result = await response.json();
      
      // --- DEBUGGING: Tampilkan respons mentah dari API di konsol browser ---
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat pesanan.');
      }
      
      // --- PENGECEKAN EKSPLISIT: Pastikan 'transaction' ada di dalam respons ---
      if (result && result.transaction) {
        setInvoice(result.transaction);
      } else {
        console.error("Struktur respons API tidak sesuai. Properti 'transaction' tidak ditemukan.", result);
        throw new Error("Gagal memproses respons dari server.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
      toast.error('Gagal Membuat Pesanan', { description: errorMessage });
      setIsInvoiceDialogOpen(false);
    } finally {
      setIsOrdering(false);
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    if (isOrdering) return; 
    
    setIsInvoiceDialogOpen(open);
    if (!open) {
      setInvoice(null);
      setSelectedPackage(null);
    }
  };

  return (
    <>
      <AnimatedSection id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold mb-2 block">
              Harga Paket
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pilih Paket yang Tepat
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Harga terjangkau dengan fitur lengkap. Semua paket sudah termasuk
              hosting dan maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg, index) => (
              <AnimatedSection key={pkg.id} delay={index * 0.2}>
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-8 pt-8">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      Rp {pkg.price.toLocaleString('id-ID')} /{' '}
                      {pkg.durationDays} hari
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <ul className="space-y-4 mb-8">
                      {Object.entries(pkg.features).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-3">
                          <Check
                            size={20}
                            className="flex-shrink-0 mt-0.5 text-green-500"
                          />
                          <span className="text-slate-700">{`${key.replace(
                            /_/g,
                            ' ',
                          )}: ${String(value)}`}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleOrder(pkg)}
                      disabled={isOrdering}
                    >
                      {isOrdering && selectedPackage?.id === pkg.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Pilih Paket'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
            {isOrdering || !invoice ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                 <DialogHeader>
                    <DialogTitle className="text-center sr-only">Memuat</DialogTitle>
                    <DialogDescription className="text-center sr-only">Membuat invoice</DialogDescription>
                 </DialogHeader>
                <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                <p className="text-muted-foreground">Membuat invoice Anda...</p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <div className="mx-auto bg-green-100 text-green-700 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <PartyPopper className="h-8 w-8" />
                  </div>
                  <DialogTitle className="text-center text-2xl">
                    Pesanan Dibuat!
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Silakan selesaikan pembayaran untuk mengaktifkan kuota undangan
                    Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pembeli</span>
                      <span className="font-medium text-right">{user?.name}<br />{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paket</span>
                      <span className="font-medium">{selectedPackage?.name}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice ID</span>
                      <span className="font-mono">{invoice.invoiceId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Tagihan</span>
                      <span className="font-medium text-lg text-orange-600">
                        Rp {invoice.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <hr />
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      Mohon transfer sesuai jumlah di atas (termasuk kode unik)
                      untuk proses verifikasi ke rekening berikut:
                    </p>
                    <div className="text-center font-semibold">
                      <p>BCA: 1234567890</p>
                      <p>a.n. Mimdi Indonesia</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full" size="lg" asChild>
                    <a
                      href={createWhatsAppLink(
                        '6285242195923', // Ganti dengan nomor WA Admin
                        `Halo Admin Mimdi, saya ingin konfirmasi pembayaran untuk Invoice ID: ${
                          invoice.invoiceId
                        } (a.n. ${user?.name}) sejumlah Rp ${
                          invoice.amount.toLocaleString('id-ID')
                        }. Berikut saya lampirkan bukti transfer. Terima kasih.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kirim Bukti Pembayaran via WhatsApp
                    </a>
                  </Button>
                </DialogFooter>
              </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}

