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
  Home,
  Menu,
  CircleUser,
  LogOut,
  History,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
} from 'lucide-react';
import { openWhatsApp } from '@/lib/whatsapp';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    if (!user || (user.role !== 'CLIENT' && user.role !== 'PARTNER')) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const navItems = [
    { href: '/user/dashboard', label: 'Dashboard', icon: Home },
    { href: '/user/transactions', label: 'Riwayat Transaksi', icon: History },
    { href: '/panduan', label: 'Panduan', icon: BookOpen },
  ];

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Memverifikasi akses...</div>;
  }

  const isEditPage = pathname.includes('/user/invitation/edit');
  if (isEditPage) {
      return <div className="min-h-screen bg-muted/40">{children}</div>;
  }

  return (
    <TooltipProvider>
      <div className={`grid min-h-screen w-full ${isCollapsed ? 'md:grid-cols-[5.5rem_1fr]' : 'md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'} transition-all duration-300 ease-in-out`}>
        <aside className="relative hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              {/* --- PERUBAHAN: Logo dan Nama diperbesar --- */}
              <Link href="/user/dashboard" className="flex items-center gap-3 font-bold text-lg">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                {!isCollapsed && <span className="transition-opacity duration-300">Mimdi</span>}
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
              {/* --- PERUBAHAN: Menambah gap-3 untuk jarak dan memperbesar teks --- */}
              <nav className="grid items-start px-4 text-base font-medium gap-3">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return isCollapsed ? (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          {/* --- PERUBAHAN: Ikon diperbesar --- */}
                          <item.icon className="h-6 w-6" />
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {/* --- PERUBAHAN: Ikon diperbesar --- */}
                      <item.icon className="h-6 w-6" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="mt-auto border-t p-4 space-y-2">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="w-full" variant="outline" onClick={() => openWhatsApp('Halo Admin Mimdi, saya butuh bantuan.')}>
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Chat Admin</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Chat Admin</TooltipContent>
                </Tooltip>
              ) : (
                <Button size="sm" className="w-full" variant="outline" onClick={() => openWhatsApp('Halo Admin Mimdi, saya butuh bantuan.')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Admin
                </Button>
              )}
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="w-full" variant="outline" onClick={logout}>
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
                    <span>Mimdi</span>
                  </Link>
                  {navItems.map((item) => {
                     const isActive = pathname.startsWith(item.href);
                     return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                     )
                    })}
                </nav>
                <div className="mt-auto space-y-2">
                   <Button variant="outline" className="w-full" onClick={() => openWhatsApp('Halo Admin Mimdi, saya butuh bantuan.')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat Admin
                    </Button>
                  <Button className="w-full" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
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

