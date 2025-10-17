'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

type Commission = {
  id: string;
  amount: number;
  status: string;
  transaction: {
    createdAt: string;
    user: {
      name: string;
    };
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerCommissionsPage() {
  const { token } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchCommissions = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/partners/commissions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Gagal mengambil laporan komisi.');
          const data: Commission[] = await response.json();
          setCommissions(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCommissions();
    }
  }, [token]);

  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Laporan Pendapatan</h1>
        <p className="mt-1 text-muted-foreground">Daftar semua komisi yang Anda peroleh dari referral klien.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Total Komisi (Pending)</CardTitle>
            <CardDescription className="text-3xl font-bold">
              Rp {totalCommission.toLocaleString('id-ID')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Transaksi</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>Jumlah Komisi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
                  </TableRow>
                ) : commissions.length > 0 ? (
                  commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{new Date(c.transaction.createdAt).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{c.transaction.user.name}</TableCell>
                      <TableCell className="font-medium">Rp {c.amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{c.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Belum ada komisi yang diperoleh.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
