import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
// --- PERUBAHAN: Impor Toaster dari sonner ---
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mimdi Invitation',
  description: 'Bagikan Momen Bersama',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {/* --- PERUBAHAN: Tambahkan komponen Toaster dari sonner --- */}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

