'use client';

import { useEffect, useState } from 'react';

// Impor komponen tema yang baru kita buat
import KlasikEleganTheme from './themes/KlasikEleganTheme';
import DefaultTheme from './themes/DefaultTheme';

// Tipe data untuk file, acara, cerita, hadiah, detail, dan undangan lengkap
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
  template: { name: string }; // <-- Tambahkan informasi tema
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Komponen "Manajer Tema"
export default function InvitationPage({ params }: { params: { slug: string } }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk interaktivitas (RSVP & Copy)
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('ATTENDING');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitationData = async () => {
      const fetchUrl = `${API_URL}/public/invitations/${params.slug}`;
      try {
        const response = await fetch(fetchUrl, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setInvitation(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data undangan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvitationData();
  }, [params.slug]);

  // Fungsi-fungsi interaktif
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

  // --- Logika Inti Pemilih Tema ---
  const renderTheme = () => {
    if (!invitation) return null;

    // Kumpulkan semua props yang dibutuhkan oleh komponen tema
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
    };

    // Tentukan komponen tema mana yang akan dirender berdasarkan nama tema
    switch (invitation.template.name) {
      case 'Klasik Elegan':
        return <KlasikEleganTheme {...themeProps} />;
      // Nanti kita bisa tambahkan case lain di sini, misal:
      // case 'Modern Minimalis':
      //   return <ModernMinimalisTheme {...themeProps} />;
      default:
        // Jika tidak ada tema yang cocok, tampilkan tema default
        return <DefaultTheme invitation={invitation} />;
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Memuat undangan...</div>;
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

  // Sekarang, komponen ini hanya merender hasil dari fungsi pemilih tema
  return renderTheme();
}

