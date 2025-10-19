'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openWhatsApp } from '@/lib/whatsapp';
import Link from 'next/link';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', sectionId: 'hero' },
    { label: 'Fitur', sectionId: 'features' },
    { label: 'Katalog Tema', sectionId: 'themes' },
    { label: 'Harga', sectionId: 'pricing' },
    { label: 'Testimoni', sectionId: 'testimonials' },
    { label: 'FAQ', sectionId: 'faq' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
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

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
               <button key={link.sectionId} onClick={() => scrollToSection(link.sectionId)} className="text-gray-700 hover:text-orange-600 transition-colors">
                {link.label}
              </button>
            ))}
            <Button asChild>
              <Link href="/login">Login / Daftar</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map(link => (
              <button key={link.sectionId} onClick={() => scrollToSection(link.sectionId)} className="block w-full text-left py-2 text-gray-700 hover:text-orange-600 transition-colors">
                {link.label}
              </button>
            ))}
            <Button className="w-full" asChild>
              <Link href="/login">Login / Daftar</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
