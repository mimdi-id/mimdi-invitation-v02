'use client';

import { Navbar } from '@/components/landing-page/Navbar';
import { Hero } from '@/components/landing-page/Hero';
import { Features } from '@/components/landing-page/Features';
import { Themes } from '@/components/landing-page/Themes';
import { Pricing } from '@/components/landing-page/Pricing';
import { Testimonials } from '@/components/landing-page/Testimonials';
import { ContactInfo } from '@/components/landing-page/ContactInfo';
import { FAQ } from '@/components/landing-page/FAQ';
import { Footer } from '@/components/landing-page/Footer';

export default function UndanganLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Themes />
        <Pricing />
        <Testimonials />
        <ContactInfo />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

