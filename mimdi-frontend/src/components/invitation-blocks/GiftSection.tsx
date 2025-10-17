// Blok generik untuk menampilkan amplop digital

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GiftAccount = {
  type: 'Bank' | 'E-Wallet';
  name: string;
  accountNumber: string;
  accountHolder: string;
};

type GiftSectionProps = {
  gifts: GiftAccount[];
  handleCopy: (text: string) => void;
  copiedText: string | null;
  className?: string;
  cardClassName?: string;
  providerClassName?: string;
};

export function GiftSection({ gifts, handleCopy, copiedText, className, cardClassName, providerClassName }: GiftSectionProps) {
  return (
    <section className={cn("my-16 text-center", className)}>
      <h3 className="mb-8 text-3xl font-bold">Amplop Digital</h3>
      <p className="mb-8">
        Bagi Anda yang ingin memberikan tanda kasih, dapat mengirimkannya melalui:
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {gifts.map((gift, index) => (
          <div key={index} className={cn("rounded-lg border bg-white p-6 text-left shadow-sm", cardClassName)}>
            <p className={cn("font-semibold", providerClassName)}>{gift.name}</p>
            <p className="mt-2 text-lg font-bold">{gift.accountNumber}</p>
            <p className="text-sm">a.n. {gift.accountHolder}</p>
            <Button
              variant="outline"
              onClick={() => handleCopy(gift.accountNumber)}
              className="mt-4 w-full"
            >
              {copiedText === gift.accountNumber ? 'Nomor Tersalin!' : 'Salin Nomor'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
