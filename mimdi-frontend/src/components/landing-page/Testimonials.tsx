'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedSection } from './AnimatedSection';

export function Testimonials() {
  const testimonials = [
    { name: 'Andi & Siti', role: 'Pernikahan 15 Jan 2025', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andi', text: 'Undangan digital dari Mimdi sangat membantu! Tampilannya elegan, fiturnya lengkap, dan tamu-tamu kami mudah mengakses.' },
    { name: 'Budi & Rina', role: 'Pernikahan 8 Feb 2025', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi', text: 'Pelayanan cepat dan responsif! Undangan siap dalam sehari. Tema yang kami pilih sangat cantik. Highly recommended!' },
    { name: 'Dimas & Maya', role: 'Pernikahan 20 Mar 2025', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dimas', text: 'Harga terjangkau dengan kualitas premium! Fitur RSVP sangat membantu kami mengatur acara. Admin juga sabar banget.' },
  ];

  return (
    <AnimatedSection id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">Testimoni</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Apa Kata Mereka?</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Ribuan pasangan telah mempercayai kami untuk momen spesial mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-slate-50 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="text-orange-500/20 mb-4" size={40} />
                  <p className="text-slate-700 mb-6 leading-relaxed flex-1">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <Avatar>
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ')[0][0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
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
