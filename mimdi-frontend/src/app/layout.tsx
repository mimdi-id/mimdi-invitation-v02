import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// FIX: Menggunakan path relatif yang benar dari /src/app
import { AuthProvider } from '../contexts/AuthContext';

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

