'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';

type Partner = {
  id: string;
  status: string;
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPartnersPage() {
  const { token } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingPartners = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/partners?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil daftar pendaftar mitra.');
      const data: Partner[] = await response.json();
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPartners();
  }, [token]);

  const handleApprove = async (partnerId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal menyetujui mitra.');
      fetchPendingPartners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Mitra</CardTitle>
        <CardDescription>Daftar pendaftar Mitra baru yang menunggu persetujuan.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Mitra</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : partners.length > 0 ? (
              partners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.user.name}</div>
                    <div className="text-xs text-muted-foreground">{p.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{p.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(p.user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleApprove(p.id)}>
                      Setujui
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada pendaftar baru.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
