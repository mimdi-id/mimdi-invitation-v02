'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { useEffect, useState } from 'react';

type Template = {
  id: string;
  name: string;
  category: 'BASIC' | 'PREMIUM';
  previewUrl: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function Themes() {
  const [themes, setThemes] = useState<Template[]>([]);
  
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(`${API_URL}/templates`);
        if (response.ok) {
          const data = await response.json();
          setThemes(data);
        }
      } catch (error) {
        console.error("Failed to fetch themes", error);
      }
    };
    fetchThemes();
  }, []);

  return (
    <AnimatedSection id="themes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">Katalog Tema</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pilih Tema Favorit Anda</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Tema modern dan elegan yang dapat disesuaikan dengan gaya acara Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme, index) => (
            <AnimatedSection key={theme.id} delay={index * 0.1}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={theme.previewUrl || 'https://placehold.co/600x400/EEE/333?text=No+Preview'}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary">
                      <Eye className="mr-2" size={16} />
                      Preview Demo
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{theme.name}</h3>
                    <Badge variant={theme.category === 'PREMIUM' ? 'default' : 'secondary'}>
                      {theme.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
