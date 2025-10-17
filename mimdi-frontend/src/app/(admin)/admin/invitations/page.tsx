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

type DisplayInvitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminInvitationsPage() {
  const { token } = useAuth();
  const [invitations, setInvitations] = useState<DisplayInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchInvitations = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/admin/invitations`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Gagal mengambil daftar undangan.');
          const data: DisplayInvitation[] = await response.json();
          setInvitations(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvitations();
    }
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Undangan</CardTitle>
        <CardDescription>Daftar semua undangan yang dibuat di platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul & Slug</TableHead>
              <TableHead>Pembuat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : invitations.length > 0 ? (
              invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-medium">{inv.title}</div>
                    <div className="text-xs text-muted-foreground">/u/{inv.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.author.name}</div>
                    <div className="text-xs text-muted-foreground">{inv.author.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inv.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(inv.createdAt).toLocaleDateString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Belum ada undangan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

