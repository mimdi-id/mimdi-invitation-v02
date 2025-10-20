'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PartyPopper, Search } from 'lucide-react';
import { createWhatsAppLink } from '@/lib/whatsapp';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tipe data untuk transaksi
type TransactionStatus = 'WAITING_VERIFICATION' | 'SUCCESS' | 'FAILED';
type Transaction = {
  id: string;
  invoiceId: string;
  amount: number;
  status: TransactionStatus;
  itemType: string;
  createdAt: string;
  Package: {
    name: string;
  } | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TransactionsHistoryPage() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // --- PERUBAHAN: State untuk filter dan pencarian ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (token) {
      const fetchTransactions = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/payments/my-transactions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.message || 'Gagal mengambil riwayat transaksi.');
          }

          const data: Transaction[] = await response.json();
          setTransactions(data);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
          toast.error('Gagal Memuat Data', { description: errorMessage });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTransactions();
    }
  }, [token]);
  
  // --- PERUBAHAN: Logika untuk memfilter transaksi ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((trx) => {
        if (statusFilter === 'ALL') return true;
        return trx.status === statusFilter;
      })
      .filter((trx) => {
        if (!searchTerm) return true;
        return trx.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [transactions, statusFilter, searchTerm]);

  // --- PERUBAHAN: Fungsi untuk mendapatkan warna badge yang lebih jelas ---
  const getBadgeClass = (status: Transaction['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-transparent hover:bg-green-100';
      case 'WAITING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-100';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-transparent hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 border-transparent hover:bg-gray-100';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>
            Cari dan filter semua transaksi yang pernah Anda lakukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- PERUBAHAN: Menambahkan baris untuk filter dan pencarian --- */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Invoice ID..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: TransactionStatus | 'ALL') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="WAITING_VERIFICATION">Menunggu Verifikasi</SelectItem>
                <SelectItem value="FAILED">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Memuat riwayat transaksi...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell className="font-mono">{trx.invoiceId}</TableCell>
                      <TableCell>{trx.Package?.name || trx.itemType}</TableCell>
                      <TableCell>Rp {trx.amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeClass(trx.status)}>
                          {trx.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(trx.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(trx)}
                        >
                          Lihat Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada transaksi yang cocok dengan kriteria Anda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent>
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className="mx-auto bg-blue-100 text-blue-700 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                  <PartyPopper className="h-8 w-8" />
                </div>
                <DialogTitle className="text-center text-2xl">
                  Detail Invoice
                </DialogTitle>
                 <DialogDescription className="text-center">
                  #{selectedInvoice.invoiceId}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pembeli</span>
                    <span className="font-medium text-right">{user?.name}<br />{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item</span>
                    <span className="font-medium">{selectedInvoice.Package?.name || selectedInvoice.itemType}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status Pembayaran</span>
                    <Badge className={getBadgeClass(selectedInvoice.status)}>
                      {selectedInvoice.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Jumlah Tagihan</span>
                    <span className="font-medium text-lg text-orange-600">
                      Rp {selectedInvoice.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <hr />
                   <p className="text-xs text-center text-muted-foreground pt-2">
                      {selectedInvoice.status === 'WAITING_VERIFICATION' 
                        ? 'Silakan selesaikan pembayaran dan lakukan konfirmasi.'
                        : 'Terima kasih atas pembayaran Anda.'}
                    </p>
                    {selectedInvoice.status === 'WAITING_VERIFICATION' && (
                       <div className="text-center font-semibold">
                          <p>BCA: 1234567890</p>
                          <p>a.n. Mimdi Indonesia</p>
                        </div>
                    )}
                </div>
              </div>
              {selectedInvoice.status === 'WAITING_VERIFICATION' && (
                <DialogFooter>
                  <Button className="w-full" size="lg" asChild>
                    <a
                      href={createWhatsAppLink(
                        '6285242195923', // Ganti dengan nomor WA Admin
                        `Halo Admin Mimdi, saya ingin konfirmasi pembayaran untuk Invoice ID: ${
                          selectedInvoice.invoiceId
                        } (a.n. ${user?.name}) sejumlah Rp ${
                          selectedInvoice.amount.toLocaleString('id-ID')
                        }. Berikut saya lampirkan bukti transfer. Terima kasih.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kirim Bukti Pembayaran via WhatsApp
                    </a>
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

