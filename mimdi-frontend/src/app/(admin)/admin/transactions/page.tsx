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
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


type DisplayTransaction = {
  id: string;
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

  useEffect(() => {
    if (token) {
      const fetchTransactions = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/admin/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Gagal mengambil daftar transaksi.');
          const data: DisplayTransaction[] = await response.json();
          setTransactions(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Transaksi</CardTitle>
        <CardDescription>Daftar semua transaksi yang terjadi di platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell>
                    <div className="font-medium">{trx.user.name}</div>
                    <div className="text-xs text-muted-foreground">{trx.user.email}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {trx.amount.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trx.itemType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trx.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {trx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(trx.createdAt).toLocaleString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Belum ada transaksi.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

