'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail, Heart } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { openWhatsApp, openWhatsAppConsultation } from '@/lib/whatsapp';

export function ContactInfo() {
  return (
    <AnimatedSection id="contact" className="py-20 bg-gradient-to-br from-orange-50/50 to-red-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">Hubungi Kami</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Siap Membuat Undangan Impian?</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Tim kami siap membantu mewujudkan undangan digital yang sempurna untuk hari spesial Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white h-full">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Kenapa Pilih Mimdi?</h3>
                <ul className="space-y-4">
                  {[
                    { title: "Proses Cepat 1x24 Jam", desc: "Undangan siap setelah data lengkap diterima." },
                    { title: "Harga Terjangkau", desc: "Mulai dari harga promo dengan fitur lengkap." },
                    { title: "Revisi Gratis", desc: "Revisi sampai Anda puas dengan hasilnya." },
                    { title: "Customer Support 24/7", desc: "Admin siap membantu kapan saja." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-white/80">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-8 border-t border-white/20">
                  <Button onClick={() => openWhatsApp()} size="lg" className="w-full bg-white text-orange-600 hover:bg-gray-100 py-6 text-lg">
                    <Heart className="mr-2" size={20} />
                    Mulai Buat Undangan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-8">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Hubungi Kami Langsung</h3>
                <div className="space-y-4">
                  <a href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><Phone className="text-white" size={24} /></div>
                    <div><div className="text-sm text-gray-600">WhatsApp</div><div className="font-semibold text-gray-900">+62 812-3456-7890</div></div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center"><MessageCircle className="text-white" size={24} /></div>
                    <div><div className="text-sm text-gray-600">Instagram</div><div className="font-semibold text-gray-900">@mimdi.id</div></div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"><Mail className="text-white" size={24} /></div>
                    <div><div className="text-sm text-gray-600">Email</div><div className="font-semibold text-gray-900">halo@mimdi.id</div></div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </AnimatedSection>
  );
}
