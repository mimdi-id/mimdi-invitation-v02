'use client';
import { Smartphone, Heart, Music, MapPin, Calendar, Gift, Image, Share2, Clock, MessageSquare, Link2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSection } from './AnimatedSection';

export function Features() {
  const features = [
    { icon: <Smartphone size={32} />, title: 'Responsive Design', description: 'Tampil sempurna di semua perangkat, dari smartphone hingga desktop' },
    { icon: <Heart size={32} />, title: 'Desain Elegan', description: 'Tema-tema modern dan elegan yang dapat disesuaikan dengan gaya Anda' },
    { icon: <Music size={32} />, title: 'Background Music', description: 'Tambahkan lagu favorit sebagai musik latar undangan Anda' },
    { icon: <MapPin size={32} />, title: 'Google Maps', description: 'Integrasi peta untuk memudahkan tamu menemukan lokasi acara' },
    { icon: <Calendar size={32} />, title: 'Save The Date', description: 'Fitur reminder dan countdown untuk hari spesial Anda' },
    { icon: <Gift size={32} />, title: 'Amplop Digital', description: 'Opsi e-wallet untuk memudahkan tamu memberikan hadiah' },
    { icon: <Image size={32} />, title: 'Galeri Foto', description: 'Tampilkan momen-momen indah dalam galeri foto yang cantik' },
    { icon: <MessageSquare size={32} />, title: 'Ucapan & RSVP', description: 'Terima ucapan dan konfirmasi kehadiran tamu secara real-time' },
    { icon: <Share2 size={32} />, title: 'Mudah Dibagikan', description: 'Bagikan undangan via WhatsApp, Instagram, dan media sosial lainnya' },
  ];

  return (
    <AnimatedSection id="features" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">Fitur Lengkap</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Semua yang Anda Butuhkan</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Dilengkapi dengan berbagai fitur modern untuk membuat undangan digital yang sempurna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full group">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4 text-orange-600 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
