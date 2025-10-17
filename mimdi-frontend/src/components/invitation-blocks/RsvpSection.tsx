// Blok generik untuk buku tamu dan form RSVP

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Guest = {
  id: string;
  name: string;
  message: string | null;
}

type RsvpSectionProps = {
  guestMessages: Guest[];
  handleRsvpSubmit: (e: React.FormEvent) => Promise<void>;
  rsvpName: string; setRsvpName: (value: string) => void;
  rsvpStatus: string; setRsvpStatus: (value: string) => void;
  rsvpMessage: string; setRsvpMessage: (value: string) => void;
  isSubmitting: boolean;
  submitMessage: string | null;
  className?: string;
};

export function RsvpSection({
  guestMessages,
  handleRsvpSubmit,
  rsvpName, setRsvpName,
  rsvpStatus, setRsvpStatus,
  rsvpMessage, setRsvpMessage,
  isSubmitting,
  submitMessage,
  className,
}: RsvpSectionProps) {
  return (
    <div className={cn("my-16", className)}>
      {guestMessages.filter(g => g.message).length > 0 && (
        <section className="mb-16">
          <h3 className="mb-8 text-center text-3xl font-bold">Ucapan & Doa</h3>
          <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border bg-white p-6 shadow-sm">
            {guestMessages.map((guest) => (
              guest.message && (
                <div key={guest.id} className="border-b pb-3">
                  <p className="font-semibold">{guest.name}</p>
                  <p className="mt-1 text-sm">{guest.message}</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-center text-3xl font-bold">
          Konfirmasi Kehadiran
        </h3>
        <form onSubmit={handleRsvpSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rsvpName">Nama Anda</Label>
            <Input
              type="text" id="rsvpName" value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              required
              className="mt-1"
              placeholder="Tulis nama Anda di sini"
            />
          </div>
          <div>
            <Label htmlFor="rsvpStatus">Konfirmasi</Label>
            <select
              id="rsvpStatus" value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value)}
              className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ATTENDING">Insya Allah, Hadir</option>
              <option value="NOT_ATTENDING">Mohon Maaf, Berhalangan</option>
            </select>
          </div>
          <div>
            <Label htmlFor="rsvpMessage">Ucapan & Doa (Opsional)</Label>
            <Textarea
              id="rsvpMessage" value={rsvpMessage}
              onChange={(e) => setRsvpMessage(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Tulis ucapan dan doa Anda untuk kami"
            />
          </div>
          <div className="text-center pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
            </Button>
          </div>
        </form>
        {submitMessage && (
          <p className="mt-4 text-center text-sm text-green-700 bg-green-100 p-3 rounded-md">
            {submitMessage}
          </p>
        )}
      </section>
    </div>
  );
}
