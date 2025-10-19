'use client';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-orange-100 via-white to-amber-100">
       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div 
          className="flex items-center justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <Sparkles className="text-orange-500" size={24} />
          <span className="text-slate-600 font-semibold">Undangan Digital Modern</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        >
          Buat Undangan Pernikahan Digital yang Berkesan
        </motion.h1>
        
        <motion.p 
          className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
        >
          Ciptakan momen istimewa dengan undangan digital yang elegan dan interaktif. 
          Lebih dari 50+ tema premium siap untuk pernikahan Anda.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button onClick={() => scrollToSection('themes')} size="lg" className="px-8 py-6 text-lg">
            <Heart className="mr-2" size={20} />
            Lihat Katalog Tema
          </Button>
          <Button onClick={() => scrollToSection('pricing')} variant="outline" size="lg" className="px-8 py-6 text-lg">
            Cek Harga Paket
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
