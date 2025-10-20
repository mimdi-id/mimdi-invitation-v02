'use client';
import { useState } from 'react';
import { Menu, X, CircleUser, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // --- PERUBAHAN: Menggunakan useAuth untuk mendapatkan status login ---
  const { user, logout, isLoading } = useAuth();

  const navLinks = [
    { label: 'Beranda', sectionId: 'hero' },
    { label: 'Fitur', sectionId: 'features' },
    { label: 'Katalog Tema', sectionId: 'themes' },
    { label: 'Harga', sectionId: 'pricing' },
    { label: 'Testimoni', sectionId: 'testimonials' },
    { label: 'FAQ', sectionId: 'faq' },
  ];

  const scrollToSection = (id: string) => {
    // Cek jika kita berada di halaman utama sebelum scroll
    if (window.location.pathname === '/undangan' || window.location.pathname === '/') {
       const element = document.getElementById(id);
       if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
         setIsOpen(false);
       }
    } else {
      // Jika di halaman lain, arahkan ke halaman utama dengan hash
      window.location.href = `/#${id}`;
    }
  };

  // --- PERUBAHAN: Fungsi untuk mendapatkan path dashboard dinamis ---
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/users';
      case 'PARTNER':
        return '/partner/dashboard';
      case 'CLIENT':
        return '/user/dashboard';
      default:
        return '/login';
    }
  };

  // Komponen kecil untuk menampilkan tombol Login/Daftar atau menu pengguna
  const AuthNav = () => {
    if (isLoading) {
      // Tampilkan placeholder loading agar layout tidak bergeser
      return <div className="h-10 w-28 animate-pulse rounded-md bg-slate-200" />;
    }

    if (user) {
      // Tampilan jika pengguna sudah login
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Buka menu pengguna</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={getDashboardPath()}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Tampilan jika pengguna belum login
    return (
      <Button asChild>
        <Link href="/login">Login / Daftar</Link>
      </Button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Mimdi Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold text-slate-800">
                Mimdi
              </span>
            </Link>
          </div>

          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <button key={link.sectionId} onClick={() => scrollToSection(link.sectionId)} className="text-gray-700 hover:text-orange-600 transition-colors">
                {link.label}
              </button>
            ))}
            {/* --- PERUBAHAN: Menggunakan komponen AuthNav dinamis --- */}
            <AuthNav />
          </div>

          {/* Tombol Menu Mobile */}
          <div className="md:hidden flex items-center gap-4">
             {/* --- PERUBAHAN: Tampilkan AuthNav juga di mobile --- */}
            <AuthNav />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map(link => (
              <button key={link.sectionId} onClick={() => scrollToSection(link.sectionId)} className="block w-full text-left py-2 text-gray-700 hover:text-orange-600 transition-colors">
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
