'use client';
import { Heart, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Mimdi Logo" className="h-8 w-8" />
              <h3 className="text-white text-2xl font-bold">Mimdi</h3>
            </Link>
            <p className="text-gray-400 mb-6">Platform undangan digital terpercaya untuk momen spesial Anda.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Instagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Facebook size={24} /></a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4 font-semibold">Menu</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('hero')} className="text-gray-400 hover:text-orange-500 transition-colors">Beranda</button></li>
              <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-orange-500 transition-colors">Fitur</button></li>
              <li><button onClick={() => scrollToSection('themes')} className="text-gray-400 hover:text-orange-500 transition-colors">Katalog Tema</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-orange-500 transition-colors">Harga</button></li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="text-white mb-4 font-semibold">Bantuan</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-orange-500 transition-colors">FAQ</button></li>
              <li><Link href="/login" className="text-gray-400 hover:text-orange-500 transition-colors">Login Klien</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white mb-4 font-semibold">Kontak</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                <div className="text-gray-400">+62 812-3456-7890</div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                <div className="text-gray-400">halo@mimdi.id</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-400 text-sm text-center">
            © 2025 Mimdi.id. Dibuat dengan <Heart size={14} className="inline text-orange-500" /> untuk momen spesial Anda.
          </p>
        </div>
      </div>
    </footer>
  );
}
