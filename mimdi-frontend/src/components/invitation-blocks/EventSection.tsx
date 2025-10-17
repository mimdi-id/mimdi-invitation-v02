// Blok generik untuk menampilkan detail acara

import { cn } from "@/lib/utils";

type Event = {
  name: string;
  date: string;
  location: string;
};

type EventSectionProps = {
  events: Event[];
  className?: string;
  cardClassName?: string;
  titleClassName?: string;
};

function formatDate(dateString: string) {
  if (!dateString) return 'Tanggal belum diatur';
  return new Date(dateString).toLocaleString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function EventSection({ events, className, cardClassName, titleClassName }: EventSectionProps) {
  return (
    <section className={cn("my-16 text-center", className)}>
      <h3 className="mb-8 text-3xl font-bold">Save the Date</h3>
      <div className="flex flex-col gap-8 md:flex-row md:justify-center">
        {events.map((event, index) => (
          <div key={index} className={cn("flex-1 rounded-lg border bg-white p-6 shadow-sm", cardClassName)}>
            <h4 className={cn("text-2xl font-semibold", titleClassName)}>{event.name}</h4>
            <p className="mt-4">{formatDate(event.date)}</p>
            <p className="mt-2 text-sm">{event.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
