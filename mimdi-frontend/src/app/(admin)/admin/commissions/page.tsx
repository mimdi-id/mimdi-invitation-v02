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
import { Button } from '@/components/ui/button';

type Commission = {
  id: string;
  amount: number;
  status: string;
  partner: { user: { name: string } };
  transaction: { createdAt: string; user: { name: string } };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCommissionsPage() {
  const { token } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/commissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil daftar komisi.');
      const data: Commission[] = await response.json();
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [token]);

  const handleClearCommission = async (commissionId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/admin/commissions/${commissionId}/clear`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal menyetujui komisi.');
      // Muat ulang data setelah berhasil
      fetchCommissions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Komisi</CardTitle>
        <CardDescription>Kelola dan setujui komisi yang diperoleh oleh Mitra.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mitra</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : commissions.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.partner.user.name}</TableCell>
                <TableCell>{c.transaction.user.name}</TableCell>
                <TableCell className="font-medium">Rp {c.amount.toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'PENDING' ? 'destructive' : 'secondary'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {c.status === 'PENDING' && (
                    <Button size="sm" onClick={() => handleClearCommission(c.id)}>
                      Setujui
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
