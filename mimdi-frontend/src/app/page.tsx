'use client';

import { Instagram, Facebook, Music, Pin, ScrollText, MessageCircle, Package, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

type ThemeType = 'default' | 'orange' | 'purple' | 'blue' | 'green';

export default function HomePage() {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('default');
  const [hoveredTheme, setHoveredTheme] = useState<ThemeType | null>(null);

  const menuItems = [
    {
      title: 'Undangan Digital',
      icon: ScrollText,
      gradient: 'from-orange-500 to-amber-500',
      href: '/undangan', // Mengarah ke halaman layanan undangan
      theme: 'orange' as ThemeType,
    },
    {
      title: 'Ucapan Digital',
      icon: MessageCircle,
      gradient: 'from-purple-500 to-violet-500',
      href: '#', // Placeholder
      theme: 'purple' as ThemeType,
    },
    {
      title: 'Undangan Fisik',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      href: '#', // Placeholder
      theme: 'blue' as ThemeType,
    },
    {
      title: 'Hubungi Kami',
      icon: MessageSquare,
      gradient: 'from-green-500 to-emerald-500',
      href: 'https://wa.me/6281234567890', // Nomor WA Anda
      theme: 'green' as ThemeType,
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/mimdi.id/', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/mimdi.id/', label: 'Facebook' },
    { icon: Music, href: 'https://www.tiktok.com/@mimdi.id', label: 'TikTok' },
    { icon: Pin, href: 'https://id.pinterest.com/mimdidesign/', label: 'Pinterest' },
  ];

  const getBackgroundGradient = () => {
    const theme = hoveredTheme || activeTheme;
    switch (theme) {
      case 'orange': return 'from-orange-900/30 via-black to-amber-900/30';
      case 'purple': return 'from-purple-900/30 via-black to-violet-900/30';
      case 'blue': return 'from-blue-900/30 via-black to-cyan-900/30';
      case 'green': return 'from-green-900/30 via-black to-emerald-900/30';
      default: return 'from-slate-900/20 via-black to-slate-900/20';
    }
  };

  const getRadialGradient = () => {
    const theme = hoveredTheme || activeTheme;
    const intensity = hoveredTheme ? 0.5 : 0.15;
    
    switch (theme) {
      case 'orange': return `bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,${intensity}),transparent_50%)]`;
      case 'purple': return `bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,${intensity}),transparent_50%)]`;
      case 'blue': return `bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,${intensity}),transparent_50%)]`;
      case 'green': return `bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,${intensity}),transparent_50%)]`;
      default: return `bg-[radial-gradient(circle_at_50%_50%,rgba(100,116,139,${intensity}),transparent_50%)]`;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background effects */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-700`} />
      <div className={`absolute inset-0 ${getRadialGradient()} transition-all duration-700`} />
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-xl">
        {/* Header */}
        <header className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-slate-500/30 shadow-lg shadow-slate-500/20">
              <AvatarImage src="/logo.svg" alt="Mimdi Logo" />
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-2xl">
                M
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-4xl font-bold text-white tracking-tight">Mimdi.id</h1>
          <p className="text-muted-foreground text-slate-400">Bagikan Momen Bersama</p>
        </header>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-3 mb-10">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full border border-gray-700 bg-black/50 backdrop-blur-sm hover:bg-slate-600/20 hover:border-slate-500 transition-all duration-300 hover:scale-110 flex items-center justify-center"
              aria-label={social.label}
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-4 mb-12">
          {menuItems.map((item, index) => {
            const isExternal = item.href.startsWith('http');
            const isPlaceholder = item.href === '#';
            
            const commonProps = {
              onMouseEnter: () => setHoveredTheme(item.theme),
              onMouseLeave: () => setHoveredTheme(null),
              className: "group w-full block relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer p-5 shadow-lg",
            };

            const content = (
              <>
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative flex items-center justify-center">
                  <div className="absolute left-4 bg-gray-100 group-hover:bg-black/20 rounded-xl p-2.5 transition-all duration-300">
                    <item.icon className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-black group-hover:text-white transition-colors duration-300">{item.title}</h3>
                </div>
              </>
            );

            if (isExternal || isPlaceholder) {
              return <a key={index} href={item.href} {...commonProps} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>{content}</a>;
            }
            
            return <Link key={index} href={item.href} passHref legacyBehavior><a {...commonProps}>{content}</a></Link>;
          })}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 space-y-2">
          <p>dibuat dengan ❤️ oleh Mimdi</p>
          <p>© 2025 mimdi.id</p>
        </footer>
      </div>
    </div>
  );
}

