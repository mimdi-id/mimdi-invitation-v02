'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
// Impor komponen Shadcn UI
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
import { Loader2 } from 'lucide-react';
// --- PERUBAHAN: Impor useToast diganti dengan toast dari sonner ---
import { toast } from "sonner"


// Tipe data tetap sama
type DisplayTransaction = {
  id: string;
  invoiceId: string;
  amount: number;
  status: string;
  itemType: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminTransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  // --- PERUBAHAN: hook useToast() dihapus ---

  const fetchTransactions = async () => {
    // ... (fungsi ini tetap sama)
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error('Gagal mengambil daftar transaksi.');
      const data: DisplayTransaction[] = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const handleVerify = async (transactionId: string) => {
    setVerifyingId(transactionId);
    try {
      const response = await fetch(
        `${API_URL}/admin/transactions/${transactionId}/verify`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Gagal memverifikasi transaksi.');
      }

      setTransactions((prev) =>
        prev.map((trx) =>
          trx.id === transactionId ? { ...trx, status: 'SUCCESS' } : trx,
        ),
      );
      
      // --- PERUBAHAN: Menggunakan toast.success dari Sonner ---
      toast.success("Verifikasi Berhasil", {
        description: "Kuota undangan telah ditambahkan ke akun klien.",
      });

    } catch (err) {
      // --- PERUBAHAN: Menggunakan toast.error dari Sonner ---
       toast.error("Verifikasi Gagal", {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'WAITING_VERIFICATION':
        return 'warning';
      case 'FAILED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Transaksi</CardTitle>
        <CardDescription>
          Verifikasi pembayaran yang masuk untuk memberikan kuota kepada klien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Pengguna</TableHead>
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
                  Memuat...
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell className="font-mono">{trx.invoiceId}</TableCell>
                  <TableCell>
                    <div className="font-medium">{trx.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {trx.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {trx.amount.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(trx.status) as any}>
                      {trx.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(trx.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {trx.status === 'WAITING_VERIFICATION' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(trx.id)}
                        disabled={verifyingId === trx.id}
                      >
                        {verifyingId === trx.id && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Verifikasi
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

