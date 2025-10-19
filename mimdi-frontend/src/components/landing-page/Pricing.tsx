'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from './AnimatedSection';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: any;
  isActive: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function Pricing() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_URL}/packages`);
        if(response.ok) {
          const data = await response.json();
          setPackages(data.filter((p: Package) => p.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch packages", error);
      }
    };
    fetchPackages();
  }, []);

  return (
    <AnimatedSection id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-orange-600 font-semibold mb-2 block">Harga Paket</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pilih Paket yang Tepat</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Harga terjangkau dengan fitur lengkap. Semua paket sudah termasuk hosting dan maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {packages.map((pkg, index) => (
            <AnimatedSection key={pkg.id} delay={index * 0.2}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-8 pt-8">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>Rp {pkg.price.toLocaleString('id-ID')} / {pkg.durationDays} hari</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                   <ul className="space-y-4 mb-8">
                    {Object.entries(pkg.features).map(([key, value]) => (
                      <li key={key} className="flex items-start gap-3">
                        <Check size={20} className="flex-shrink-0 mt-0.5 text-green-500" />
                        <span className="text-slate-700">{`${key.replace(/_/g, ' ')}: ${value}`}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/login">Pilih Paket</Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
