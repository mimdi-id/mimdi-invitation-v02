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

type Client = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerClientsPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchClients = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/partners/clients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Gagal mengambil daftar klien.');
          const data: Client[] = await response.json();
          setClients(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchClients();
    }
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Klien Saya</CardTitle>
        <CardDescription>
          Daftar semua klien yang mendaftar melalui link afiliasi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Klien</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Belum ada klien yang mendaftar melalui link Anda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
