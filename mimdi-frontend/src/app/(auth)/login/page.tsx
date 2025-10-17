'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Memuat...');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal untuk login');
      }

      login(data.access_token);
    } catch (error) {
      console.error('Error saat login:', error);
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
          <CardTitle className="text-2xl">Login ke Akun Anda</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className={`text-sm ${message.startsWith('Memuat') ? 'text-slate-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">Belum punya akun?</p>
          <div className="w-full space-y-2">
             <Button variant="outline" className="w-full" asChild>
              <Link href="/register">Daftar sebagai Klien</Link>
            </Button>
             <Button variant="outline" className="w-full" asChild>
              <Link href="/partners/register">Daftar sebagai Mitra</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

