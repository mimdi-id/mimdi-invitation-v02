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

type DisplayUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Gagal mengambil daftar pengguna.');
          const data: DisplayUser[] = await response.json();
          setUsers(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [token]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Pengguna</CardTitle>
        <CardDescription>Daftar semua pengguna yang terdaftar di platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                     <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                        {u.role}
                      </Badge>
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Belum ada pengguna.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

