// Ini adalah komponen "blok bangunan" yang generik dan dapat digunakan kembali.
// Ia tidak memiliki gaya yang spesifik, melainkan menerima gaya dari luar.

import { cn } from "@/lib/utils";

type CoupleSectionProps = {
  bride: { name: string; father: string; mother: string };
  groom: { name: string; father: string; mother: string };
  // Props baru untuk menerima styling dari komponen tema
  className?: string;
  groomNameClassName?: string;
  brideNameClassName?: string;
  ampersandClassName?: string;
};

export function CoupleSection({ 
  bride, 
  groom, 
  className,
  groomNameClassName,
  brideNameClassName,
  ampersandClassName,
}: CoupleSectionProps) {
  return (
    <section className={cn("my-16 flex flex-col items-center justify-center gap-12 md:flex-row md:gap-24", className)}>
      <div className="text-center">
        <h2 className={cn("text-4xl font-bold", groomNameClassName)}>{groom.name}</h2>
        <p className="mt-2">Putra dari</p>
        <p className="text-sm">
          Bapak {groom.father} & Ibu {groom.mother}
        </p>
      </div>
      <div className={cn("text-5xl font-light", ampersandClassName)}>&</div>
      <div className="text-center">
        <h2 className={cn("text-4xl font-bold", brideNameClassName)}>{bride.name}</h2>
        <p className="mt-2">Putri dari</p>
        <p className="text-sm">
          Bapak {bride.father} & Ibu {bride.mother}
        </p>
      </div>
    </section>
  );
}
