'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Package,
  Menu,
  CircleUser,
  LogOut,
} from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // --- LOGIKA PERLINDUNGAN TERPUSAT ---
  useEffect(() => {
    // Jika proses loading belum selesai, jangan lakukan apa-apa
    if (isLoading) {
      return;
    }
    
    // Setelah loading selesai, jika tidak ada user, atau rolenya tidak sesuai,
    // baru tendang ke halaman login.
    if (!user || (user.role !== 'CLIENT' && user.role !== 'PARTNER')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const navItems = [
    { href: '/user/dashboard', label: 'Dashboard', icon: Home },
    { href: '/user/packages', label: 'Paket & Pembelian', icon: Package },
  ];

  // Selama loading atau jika user belum terverifikasi, tampilkan pesan loading.
  // Ini mencegah "kedipan" karena komponen anak tidak akan di-render sama sekali.
  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Memverifikasi akses...</div>;
  }

  // Jangan tampilkan sidebar untuk halaman editor
  const isEditPage = pathname.includes('/user/invitation/edit');
  if (isEditPage) {
     return <div className="min-h-screen bg-muted/40">{children}</div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/user/dashboard" className="flex items-center gap-2 font-semibold">
              <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
              <span>Mimdi Klien</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    pathname.startsWith(item.href) ? 'bg-muted text-primary' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button size="sm" className="w-full" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                   <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                   <span>Mimdi Klien</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${
                       pathname.startsWith(item.href) ? 'bg-muted text-foreground' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
               <div className="mt-auto">
                  <Button className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert('Fitur belum tersedia')}>Pengaturan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50 dark:bg-slate-950 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

