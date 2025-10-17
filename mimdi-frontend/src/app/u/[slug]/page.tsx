'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import KlasikEleganTheme from './themes/KlasikEleganTheme';
import DefaultTheme from './themes/DefaultTheme';
import { Button } from '@/components/ui/button'; // <-- FIX: Impor komponen Button

// ... (semua tipe data tetap sama)
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


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen Halaman Sampul (Cover)
function CoverPage({ guestName, brideName, groomName, onOpen }: { guestName: string, brideName: string, groomName: string, onOpen: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-gray-800 bg-cover bg-center text-white" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1525972457018-b8c106a7aaa4?q=80&w=1974&auto=format&fit=crop)' }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 text-center font-serif">
        <p className="text-lg">The Wedding Of</p>
        <h1 className="my-4 text-6xl font-bold">{brideName} & {groomName}</h1>
        <div className="mt-8">
          <p className="text-sm">Kepada Yth.</p>
          <p className="mt-1 text-2xl font-semibold">{guestName}</p>
        </div>
        <Button onClick={onOpen} className="mt-10 animate-pulse">
          Buka Undangan
        </Button>
      </div>
    </div>
  );
}


export default function InvitationPage({ params }: { params: { slug: string } }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestMessages, setGuestMessages] = useState<Guest[]>([]);
  
  // --- State & Logika Baru ---
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan'; // Ambil nama dari URL, atau gunakan default
  
  // ... (State lain untuk interaktivitas tetap sama)
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('ATTENDING');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    // Isi nama di form RSVP secara otomatis jika ada nama tamu di URL
    if (searchParams.get('to')) {
      setRsvpName(searchParams.get('to') || '');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [invitationRes, guestsRes] = await Promise.all([
          fetch(`${API_URL}/public/invitations/${params.slug}`, { cache: 'no-store' }),
          fetch(`${API_URL}/public/invitations/${params.slug}/rsvps`, { cache: 'no-store' })
        ]);

        if (invitationRes.ok) {
          const data = await invitationRes.json();
          setInvitation(data);
        }
        if (guestsRes.ok) {
          const data = await guestsRes.json();
          setGuestMessages(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.slug]);

  // ... (semua fungsi handle lainnya tetap sama) ...
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await fetch(
        `${API_URL}/public/invitations/${params.slug}/rsvp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: rsvpName,
            status: rsvpStatus,
            message: rsvpMessage,
          }),
        },
      );
      if (!response.ok) {
        throw new Error('Gagal mengirim konfirmasi. Silakan coba lagi.');
      }
      const guestsRes = await fetch(`${API_URL}/public/invitations/${params.slug}/rsvps`, { cache: 'no-store' });
      if (guestsRes.ok) {
        const data = await guestsRes.json();
        setGuestMessages(data);
      }
      
      setSubmitMessage('Terima kasih! Konfirmasi Anda telah kami terima.');
      setRsvpName('');
      setRsvpStatus('ATTENDING');
      setRsvpMessage('');
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks', err);
    }
    document.body.removeChild(textArea);
  };

  const renderTheme = () => {
    if (!invitation) return null;
    const themeProps = {
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
    };

    switch (invitation.template.name) {
      case 'Klasik Elegan':
        return <KlasikEleganTheme {...themeProps} />;
      default:
        return <DefaultTheme invitation={invitation} />;
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center">Memuat undangan...</div>;
  }
  
  if (!invitation) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">404</h1>
          <p className="mt-2 text-slate-600">
            Oops! Undangan yang Anda cari tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {!isCoverOpen && (
        <CoverPage 
          guestName={guestName}
          brideName={invitation.details?.bride?.name || ''}
          groomName={invitation.details?.groom?.name || ''}
          onOpen={() => setIsCoverOpen(true)}
        />
      )}
      {renderTheme()}
    </div>
  );
}

