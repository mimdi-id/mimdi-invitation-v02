'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PartnerRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Memproses...');

    try {
      const response = await fetch(`${API_URL}/partners/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal untuk mendaftar');
      }

      setMessage('Pendaftaran berhasil! Akun Anda sedang ditinjau oleh Admin. Silakan login setelah akun disetujui.');
      // Kita tidak redirect otomatis, biarkan user melihat pesannya
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-6 dark:bg-slate-950 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="Mimdi Invitation Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Daftar sebagai Mitra</CardTitle>
          <CardDescription>
            Isi data di bawah ini untuk menjadi bagian dari Mimdi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Usaha/Pribadi</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nama Anda atau Usaha Anda"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             {message && (
              <p className={`text-sm ${message.startsWith('Pendaftaran berhasil') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
           <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-orange-600 hover:underline">
              Login di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
