// Ini adalah komponen khusus untuk tema "Klasik Elegan"

// Definisikan tipe data yang dibutuhkan oleh komponen ini
type InvitationFile = {
  id: string;
  presignedUrl: string;
};

type Event = {
  name: string;
  date: string;
  location: string;
};

type StoryPart = {
  title: string;
  content: string;
};

type GiftAccount = {
  type: 'Bank' | 'E-Wallet';
  name: string;
  accountNumber: string;
  accountHolder: string;
};

type InvitationDetails = {
  bride: { name: string; father: string; mother: string };
  groom: { name: string; father: string; mother: string };
  events: Event[];
  story?: StoryPart[];
  gifts?: GiftAccount[];
};

type Invitation = {
  id: string;
  title: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
  files: InvitationFile[];
  template: { name: string };
};

type ThemeProps = {
  invitation: Invitation;
  // Kita juga akan meneruskan fungsi-fungsi interaktif dari halaman utama
  handleRsvpSubmit: (e: React.FormEvent) => Promise<void>;
  handleCopy: (text: string) => void;
  // dan state yang dibutuhkan
  rsvpName: string; setRsvpName: (value: string) => void;
  rsvpStatus: string; setRsvpStatus: (value: string) => void;
  rsvpMessage: string; setRsvpMessage: (value: string) => void;
  isSubmitting: boolean;
  submitMessage: string | null;
  copiedText: string | null;
};

function formatDate(dateString: string) {
  if (!dateString) return 'Tanggal belum diatur';
  return new Date(dateString).toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function KlasikEleganTheme({
  invitation,
  handleRsvpSubmit,
  handleCopy,
  rsvpName, setRsvpName,
  rsvpStatus, setRsvpStatus,
  rsvpMessage, setRsvpMessage,
  isSubmitting,
  submitMessage,
  copiedText,
}: ThemeProps) {
  if (!invitation.details) return null; // Pengaman jika detail tidak ada

  const { bride, groom, events, story, gifts } = invitation.details;
  const sections = invitation.activeSections || {};

  return (
    <div className="min-h-screen bg-gray-50 font-serif text-gray-800">
      <div className="mx-auto max-w-3xl p-6 sm:p-12">
        <header className="text-center">
          <p className="text-lg text-orange-700">The Wedding Of</p>
          <h1 className="my-4 text-6xl font-extrabold tracking-tight text-slate-900">
            {invitation.title}
          </h1>
        </header>

        <section className="my-16 flex flex-col items-center justify-center gap-12 md:flex-row md:gap-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-800">{groom.name}</h2>
            <p className="mt-2 text-slate-600">Putra dari</p>
            <p className="text-sm text-slate-500">
              Bapak {groom.father} & Ibu {groom.mother}
            </p>
          </div>
          <div className="text-5xl font-light text-orange-400">&</div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-800">{bride.name}</h2>
            <p className="mt-2 text-slate-600">Putri dari</p>
            <p className="text-sm text-slate-500">
              Bapak {bride.father} & Ibu {bride.mother}
            </p>
          </div>
        </section>

        {(sections.countdown ?? true) && events && events.length > 0 && (
          <section className="my-16 text-center">
            {/* CountdownTimer akan kita tambahkan lagi nanti jika diperlukan */}
            <p className='text-slate-500'>[Countdown Timer akan muncul di sini]</p>
          </section>
        )}

        <section className="my-16 text-center">
          <h3 className="mb-8 text-3xl font-bold text-slate-800">Save the Date</h3>
          <div className="flex flex-col gap-8 md:flex-row md:justify-center">
            {events.map((event, index) => (
              <div
                key={index}
                className="flex-1 rounded-lg border border-orange-200 bg-white p-6 shadow-sm"
              >
                <h4 className="text-2xl font-semibold text-orange-800">{event.name}</h4>
                <p className="mt-4 text-slate-600">{formatDate(event.date)}</p>
                <p className="mt-2 text-sm text-slate-500">{event.location}</p>
              </div>
            ))}
          </div>
        </section>

        {(sections.story ?? true) && story && story.length > 0 && (
           <section className="my-16">
            <h3 className="mb-8 text-center text-3xl font-bold text-slate-800">Our Love Story</h3>
            <div className="space-y-8">
              {story.map((storyPart, index) => (
                storyPart.title && storyPart.content && (
                  <div key={index}>
                    <h4 className="text-2xl font-semibold text-orange-800">{storyPart.title}</h4>
                    <p className="mt-2 whitespace-pre-line text-slate-600">{storyPart.content}</p>
                  </div>
                )
              ))}
            </div>
           </section>
        )}

        {(sections.gallery ?? true) && invitation.files && invitation.files.length > 0 && (
           <section className="my-16">
            <h3 className="mb-8 text-center text-3xl font-bold text-slate-800">Galeri Foto</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {invitation.files.map((file) => (
                <div key={file.id} className="aspect-square">
                  <img
                    src={file.presignedUrl}
                    alt="Foto galeri"
                    className="h-full w-full rounded-lg object-cover shadow-md"
                  />
                </div>
              ))}
            </div>
           </section>
        )}

        {(sections.gift ?? true) && gifts && gifts.length > 0 && (
           <section className="my-16 text-center">
            <h3 className="mb-8 text-3xl font-bold text-slate-800">Amplop Digital</h3>
            <p className="mb-8 text-slate-600">
              Bagi Anda yang ingin memberikan tanda kasih, dapat mengirimkannya melalui:
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {gifts.map((gift, index) => (
                <div key={index} className="rounded-lg border border-orange-200 bg-white p-6 text-left shadow-sm">
                  <p className="font-semibold text-orange-800">{gift.name}</p>
                  <p className="mt-2 text-lg font-bold text-slate-800">{gift.accountNumber}</p>
                  <p className="text-sm text-slate-500">a.n. {gift.accountHolder}</p>
                  <button
                    onClick={() => handleCopy(gift.accountNumber)}
                    className="mt-4 w-full rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {copiedText === gift.accountNumber ? 'Nomor Tersalin!' : 'Salin Nomor'}
                  </button>
                </div>
              ))}
            </div>
           </section>
        )}
        
        {(sections.rsvp ?? true) && (
           <section className="my-16 rounded-lg border border-orange-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-center text-3xl font-bold text-slate-800">
              Konfirmasi Kehadiran
            </h3>
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label htmlFor="rsvpName" className="block text-sm font-medium text-slate-700">Nama Anda</label>
                <input
                  type="text" id="rsvpName" value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Tulis nama Anda di sini"
                />
              </div>
              <div>
                <label htmlFor="rsvpStatus" className="block text-sm font-medium text-slate-700">Konfirmasi</label>
                <select
                  id="rsvpStatus" value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  <option value="ATTENDING">Insya Allah, Hadir</option>
                  <option value="NOT_ATTENDING">Mohon Maaf, Berhalangan</option>
                </select>
              </div>
              <div>
                <label htmlFor="rsvpMessage" className="block text-sm font-medium text-slate-700">Ucapan & Doa (Opsional)</label>
                <textarea
                  id="rsvpMessage" value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Tulis ucapan dan doa Anda untuk kami"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-orange-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:bg-slate-400"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                </button>
              </div>
            </form>
            {submitMessage && (
              <p className="mt-4 text-center text-sm text-green-700 bg-green-100 p-3 rounded-md">
                {submitMessage}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
