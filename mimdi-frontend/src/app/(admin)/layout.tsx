'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  FileText,
  CreditCard,
  Handshake,
  Menu,
  CircleUser,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  DollarSign, // <-- Impor ikon baru
  LogOut, // <-- Impor ikon baru
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const navItems = [
    { href: '/admin/users', label: 'Pengguna', icon: Users },
    { href: '/admin/invitations', label: 'Undangan', icon: FileText },
    { href: '/admin/transactions', label: 'Transaksi', icon: CreditCard },
    { href: '/admin/partners', label: 'Mitra', icon: Handshake },
    { href: '/admin/packages', label: 'Paket', icon: Package },
    { href: '/admin/commissions', label: 'Komisi', icon: DollarSign }, // <-- Tambahkan ini

  ];

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Memverifikasi akses admin...</div>;
  }

  return (
    <TooltipProvider>
       <div className={`grid min-h-screen w-full ${isCollapsed ? 'md:grid-cols-[5rem_1fr]' : 'md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'} transition-all duration-300 ease-in-out`}>
        <aside className="relative hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin/users" className="flex items-center gap-2 font-semibold">
                <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                {!isCollapsed && <span className="transition-opacity duration-300">Mimdi Admin</span>}
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                  isCollapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary md:h-8 md:w-8 ${
                            pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
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
                  )
                ))}
              </nav>
            </div>
             <div className="mt-auto p-4">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="w-full" variant="ghost" onClick={logout}>
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Logout</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              ) : (
                <Button size="sm" className="w-full" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
          <Button variant="outline" size="icon" className="absolute top-5 -right-5 h-8 w-8 rounded-full" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
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
                     <span>Mimdi Admin</span>
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
    </TooltipProvider>
  );
}

