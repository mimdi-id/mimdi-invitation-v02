'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from './AnimatedSection';
import { openWhatsAppConsultation } from '@/lib/whatsapp';

export function FAQ() {
  const faqs = [
    { question: 'Berapa lama proses pembuatan undangan?', answer: 'Proses pembuatan sangat cepat, hanya 1x24 jam setelah semua data lengkap kami terima.' },
    { question: 'Apakah bisa revisi undangan setelah jadi?', answer: 'Tentu! Setiap paket memiliki kuota revisi yang berbeda. Kami akan merevisi sampai Anda puas.' },
    { question: 'Bagaimana cara pembayaran?', answer: 'Pembayaran dilakukan 100% di muka melalui transfer bank atau e-wallet. Kami akan mengirimkan detailnya via WhatsApp.' },
    { question: 'Berapa lama undangan akan aktif?', answer: 'Masa aktif undangan tergantung pada paket yang Anda pilih, mulai dari 30 hari hingga selamanya.' },
    { question: 'Apakah bisa menambahkan video atau musik sendiri?', answer: 'Sangat bisa! Anda bisa menyematkan video dari YouTube dan menambahkan link musik latar favorit Anda.' },
  ];

  return (
    <AnimatedSection id="faq" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pertanyaan Umum</h2>
          <p className="text-lg text-slate-600">Temukan jawaban untuk pertanyaan yang sering diajukan.</p>
        </div>

        <Card className="border-0 shadow-xl p-4 md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-orange-600">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
        
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-8 text-center">
            <MessageCircle className="mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-white mb-4">Masih Ada Pertanyaan?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Tim kami siap membantu Anda! Jangan ragu untuk menghubungi kami via WhatsApp untuk konsultasi gratis.
            </p>
            <Button onClick={openWhatsAppConsultation} variant="secondary" size="lg">
              Hubungi via WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedSection>
  );
}
