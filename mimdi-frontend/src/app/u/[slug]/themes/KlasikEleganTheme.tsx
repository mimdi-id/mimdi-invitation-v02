// File tema ini sekarang bertindak sebagai "Sutradara" dan "Pemberi Gaya"

// import MusicPlayer from '@/components/features/MusicPlayer'; // <-- Dihapus
// Impor semua "blok bangunan" generik
import { CoupleSection } from '@/components/invitation-blocks/CoupleSection';
import { EventSection } from '@/components/invitation-blocks/EventSection';
import { StorySection } from '@/components/invitation-blocks/StorySection';
import { GallerySection } from '@/components/invitation-blocks/GallerySection';
import { GiftSection } from '@/components/invitation-blocks/GiftSection';
import { RsvpSection } from '@/components/invitation-blocks/RsvpSection';

// Tipe data diperbarui
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
type Guest = {
  id: string;
  name: string;
  message: string | null;
  createdAt: string;
}
type InvitationDetails = {
  bride: { name: string; father: string; mother: string };
  groom: { name: string; father: string; mother: string };
  events: Event[];
  story?: StoryPart[];
  gifts?: GiftAccount[];
  quote?: string;
  // musicUrl?: string; // <-- Dihapus
  invitedBy?: string[];
};
type Invitation = {
  id: string;
  title: string;
  slug: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
  files: InvitationFile[];
  template: { name: string };
};
type ThemeProps = {
  invitation: Invitation;
  handleRsvpSubmit: (e: React.FormEvent) => Promise<void>;
  handleCopy: (text: string) => void;
  rsvpName: string; setRsvpName: (value: string) => void;
  rsvpStatus: string; setRsvpStatus: (value: string) => void;
  rsvpMessage: string; setRsvpMessage: (value: string) => void;
  isSubmitting: boolean;
  submitMessage: string | null;
  copiedText: string | null;
  guestMessages: Guest[];
};


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
  guestMessages,
}: ThemeProps) {
  if (!invitation.details) return null;

  const { bride, groom, events, story, gifts, quote, invitedBy } = invitation.details;
  const sections = invitation.activeSections || {};

  return (
    <div className="min-h-screen bg-gray-50 font-serif text-gray-800">
       {/* {(sections.music ?? true) && musicUrl && <MusicPlayer src={musicUrl} />} // <-- Dihapus */}

      <div className="mx-auto max-w-3xl p-6 sm:p-12">
        <header className="text-center">
          <p className="text-lg text-orange-700">The Wedding Of</p>
          <h1 className="my-4 text-6xl font-extrabold tracking-tight text-slate-900">
            {invitation.title}
          </h1>
        </header>

        <CoupleSection 
          bride={bride} 
          groom={groom} 
          className="text-slate-600"
          groomNameClassName="text-slate-800"
          brideNameClassName="text-slate-800"
          ampersandClassName="text-orange-400"
        />

        {(sections.quote ?? true) && quote && (
          <section className="my-16 text-center">
            <blockquote className="border-l-4 border-orange-400 pl-6 italic text-slate-600">
              {quote}
            </blockquote>
          </section>
        )}
        
        <EventSection
          events={events}
          cardClassName="border-orange-200"
          titleClassName="text-orange-800"
        />

        {(sections.story ?? true) && story && story.length > 0 && (
          <StorySection story={story} titleClassName="text-orange-800" />
        )}

        {(sections.gallery ?? true) && invitation.files && invitation.files.length > 0 && (
          <GallerySection files={invitation.files} />
        )}

        {(sections.gift ?? true) && gifts && gifts.length > 0 && (
          <GiftSection 
            gifts={gifts} 
            handleCopy={handleCopy} 
            copiedText={copiedText} 
            className="text-slate-600"
            cardClassName="border-orange-200"
            providerClassName="text-orange-800"
          />
        )}
        
        {(sections.invitedBy ?? true) && invitedBy && invitedBy.length > 0 && (
          <section className="my-16 text-center">
            <h3 className="mb-4 text-xl font-semibold text-slate-800">Turut Mengundang:</h3>
            <div className="text-slate-600">
              {invitedBy.map((name, index) => (
                name && <p key={index}>{name}</p>
              ))}
            </div>
          </section>
        )}

        {(sections.rsvp ?? true) && (
          <RsvpSection 
            guestMessages={guestMessages}
            handleRsvpSubmit={handleRsvpSubmit}
            rsvpName={rsvpName} setRsvpName={setRsvpName}
            rsvpStatus={rsvpStatus} setRsvpStatus={setRsvpStatus}
            rsvpMessage={rsvpMessage} setRsvpMessage={setRsvpMessage}
            isSubmitting={isSubmitting}
            submitMessage={submitMessage}
          />
        )}
      </div>
    </div>
  );
}

