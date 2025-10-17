'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Tipe Data
type InvitationFile = {
  id: string;
  fileKey: string;
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
  quote?: string;
  // musicUrl?: string; // <-- Dihapus
  invitedBy?: string[];
};
type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const availableSections = [
  { key: 'story', label: 'Cerita Cinta' },
  { key: 'gallery', label: 'Galeri Foto' },
  { key: 'countdown', label: 'Hitung Mundur' },
  { key: 'gift', label: 'Amplop Digital' },
  { key: 'rsvp', label: 'Konfirmasi Hadir' },
  { key: 'quote', label: 'Quote/Doa' },
  // { key: 'music', label: 'Musik Latar' }, // <-- Dihapus
  { key: 'invitedBy', label: 'Turut Mengundang' },
];

export default function EditInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States untuk Form
  const [brideName, setBrideName] = useState('');
  const [brideFather, setBrideFather] = useState('');
  const [brideMother, setBrideMother] = useState('');
  const [groomName, setGroomName] = useState('');
  const [groomFather, setGroomFather] = useState('');
  const [groomMother, setGroomMother] = useState('');
  const [events, setEvents] = useState<Event[]>([
    { name: 'Akad Nikah', date: '', location: '' },
    { name: 'Resepsi', date: '', location: '' },
  ]);
  const [story, setStory] = useState<StoryPart[]>([{ title: '', content: '' }]);
  const [gifts, setGifts] = useState<GiftAccount[]>([]);
  const [quote, setQuote] = useState('');
  // const [musicUrl, setMusicUrl] = useState(''); // <-- Dihapus
  const [invitedBy, setInvitedBy] = useState<string[]>(['']);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    story: true,
    gallery: true,
    countdown: true,
    gift: true,
    rsvp: true,
    quote: true,
    // music: true, // <-- Dihapus
    invitedBy: true,
  });
  const [files, setFiles] = useState<InvitationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Mengambil data undangan saat halaman dimuat
  useEffect(() => {
    if (token && id) {
      const fetchInvitationData = async () => {
        try {
          setIsLoading(true);
          const invResponse = await fetch(`${API_URL}/invitations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!invResponse.ok) throw new Error('Gagal mengambil data undangan.');
          const invData: Invitation = await invResponse.json();
          setInvitation(invData);
          const details = invData.details;
          setBrideName(details?.bride?.name || '');
          setBrideFather(details?.bride?.father || '');
          setBrideMother(details?.bride?.mother || '');
          setGroomName(details?.groom?.name || '');
          setGroomFather(details?.groom?.father || '');
          setGroomMother(details?.groom?.mother || '');
          setEvents(details?.events || [{ name: 'Akad Nikah', date: '', location: '' },{ name: 'Resepsi', date: '', location: '' }]);
          if (details?.story && Array.isArray(details.story) && details.story.length > 0) {
            setStory(details.story);
          } else {
            setStory([{ title: '', content: '' }]);
          }
          setGifts(details?.gifts || []);
          setQuote(details?.quote || '');
          // setMusicUrl(details?.musicUrl || ''); // <-- Dihapus
          setInvitedBy(details?.invitedBy || ['']);
          if (invData.activeSections) {
            setActiveSections(invData.activeSections);
          }
          const filesResponse = await fetch(`${API_URL}/files/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!filesResponse.ok) throw new Error('Gagal mengambil daftar foto.');
          const filesData: InvitationFile[] = await filesResponse.json();
          setFiles(filesData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvitationData();
    }
  }, [id, token]);

  // Melindungi halaman dari akses tidak sah
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  // Handler untuk mengubah status publikasi
  const handleStatusToggle = async (isPublished: boolean) => {
    if (!token || !invitation) return;
    const newStatus = isPublished ? 'PUBLISHED' : 'DRAFT';
    setInvitation({ ...invitation, status: newStatus });
    try {
      const response = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Gagal mengubah status.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setInvitation({ ...invitation, status: invitation.status });
    }
  };
  
    // Handler untuk menyimpan semua perubahan
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    const updatedDetails: InvitationDetails = {
      bride: { name: brideName, father: brideFather, mother: brideMother },
      groom: { name: groomName, father: groomFather, mother: groomMother },
      events: events,
      story: story,
      gifts: gifts,
      quote: quote,
      // musicUrl: musicUrl, // <-- Dihapus
      invitedBy: invitedBy.filter(name => name.trim() !== ''),
    };
    try {
      const response = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          details: updatedDetails,
          activeSections: activeSections,
        }),
      });
      if (!response.ok) throw new Error('Gagal menyimpan perubahan.');
      alert('Perubahan berhasil disimpan!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  // Handler untuk mengunggah file
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const presignedUrlResponse = await fetch(`${API_URL}/files/presigned-url/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      if (!presignedUrlResponse.ok) {
        const errorData = await presignedUrlResponse.json();
        throw new Error(errorData.message || 'Gagal mendapatkan URL unggahan.');
      }
      const { uploadUrl, fileKey } = await presignedUrlResponse.json();
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadResponse.ok) throw new Error('Gagal mengunggah file.');
      const completeResponse = await fetch(`${API_URL}/files/upload-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileKey, invitationId: id }),
      });
      if (!completeResponse.ok) throw new Error('Gagal memproses file di server.');
      const filesResponse = await fetch(`${API_URL}/files/${id}`, {
         headers: { Authorization: `Bearer ${token}` },
      });
      if (!filesResponse.ok) throw new Error('Gagal memuat ulang daftar foto.');
      const updatedFiles: InvitationFile[] = await filesResponse.json();
      setFiles(updatedFiles);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // Handler dinamis untuk form
  const handleEventChange = (index: number, field: keyof Event, value: string) => {
    const newEvents = [...events];
    newEvents[index][field] = value;
    setEvents(newEvents);
  };
  const handleStoryChange = (index: number, field: keyof StoryPart, value: string) => {
    const newStory = [...story];
    newStory[index][field] = value;
    setStory(newStory);
  };
  const handleAddStory = () => {
    if (story.length < 4) setStory([...story, { title: '', content: '' }]);
  };
  const handleRemoveStory = (indexToRemove: number) => {
    if (story.length > 1) setStory(story.filter((_, index) => index !== indexToRemove));
  };
  const handleAddGift = () => {
    setGifts([...gifts, { type: 'Bank', name: '', accountNumber: '', accountHolder: '' }]);
  };
  const handleRemoveGift = (indexToRemove: number) => {
    setGifts(gifts.filter((_, index) => index !== indexToRemove));
  };
  const handleGiftChange = (index: number, field: keyof GiftAccount, value: string) => {
    const newGifts = [...gifts];
    newGifts[index][field] = value;
    setGifts(newGifts);
  };
  const handleInvitedByChange = (index: number, value: string) => {
    const newInvitedBy = [...invitedBy];
    newInvitedBy[index] = value;
    setInvitedBy(newInvitedBy);
  };
  const handleAddInvitedBy = () => {
    setInvitedBy([...invitedBy, '']);
  };
  const handleRemoveInvitedBy = (indexToRemove: number) => {
    if (invitedBy.length > 1) {
      setInvitedBy(invitedBy.filter((_, index) => index !== indexToRemove));
    }
  };
  const handleSectionToggle = (key: string) => {
    setActiveSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading || isAuthLoading) {
    return <div className="p-10 text-center">Memuat data editor...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <div>
             <button onClick={() => router.push('/user/dashboard')} className="mb-2 text-sm font-semibold text-orange-600 hover:text-orange-500">
              &larr; Kembali ke Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Edit Undangan: {invitation?.title}
            </h1>
            <p className="mt-1 text-slate-600">
              Isi dan simpan semua detail undangan Anda di bawah ini.
            </p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="publish-switch"
              checked={invitation?.status === 'PUBLISHED'}
              onCheckedChange={handleStatusToggle}
            />
            <Label htmlFor="publish-switch" className="font-semibold">
              {invitation?.status === 'PUBLISHED' ? 'Telah Terbit' : 'Draf'}
            </Label>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-8">
          <div className="rounded-lg bg-white p-8 shadow-md space-y-8">
            {/* Bagian Data Mempelai */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="space-y-4 rounded-md border p-4">
                <h2 className="text-xl font-semibold text-slate-800">Data Mempelai Wanita</h2>
                <div>
                  <Label htmlFor="brideName">Nama Mempelai Wanita</Label>
                  <Input type="text" id="brideName" value={brideName} onChange={(e) => setBrideName(e.target.value)} placeholder="Nama Lengkap"/>
                </div>
                <div>
                  <Label htmlFor="brideFather">Nama Ayah</Label>
                  <Input type="text" id="brideFather" value={brideFather} onChange={(e) => setBrideFather(e.target.value)} placeholder="Nama Ayah"/>
                </div>
                <div>
                  <Label htmlFor="brideMother">Nama Ibu</Label>
                  <Input type="text" id="brideMother" value={brideMother} onChange={(e) => setBrideMother(e.target.value)} placeholder="Nama Ibu"/>
                </div>
              </div>
              <div className="space-y-4 rounded-md border p-4">
                <h2 className="text-xl font-semibold text-slate-800">Data Mempelai Pria</h2>
                <div>
                  <Label htmlFor="groomName">Nama Mempelai Pria</Label>
                  <Input type="text" id="groomName" value={groomName} onChange={(e) => setGroomName(e.target.value)} placeholder="Nama Lengkap"/>
                </div>
                <div>
                  <Label htmlFor="groomFather">Nama Ayah</Label>
                  <Input type="text" id="groomFather" value={groomFather} onChange={(e) => setGroomFather(e.target.value)} placeholder="Nama Ayah"/>
                </div>
                <div>
                  <Label htmlFor="groomMother">Nama Ibu</Label>
                  <Input type="text" id="groomMother" value={groomMother} onChange={(e) => setGroomMother(e.target.value)} placeholder="Nama Ibu"/>
                </div>
              </div>
            </div>
            {/* Bagian Acara */}
            <div className="space-y-6 rounded-md border p-4">
              <h2 className="text-xl font-semibold text-slate-800">Data Acara</h2>
              {events.map((event, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label>Nama Acara</Label>
                    <Input type="text" value={event.name} onChange={(e) => handleEventChange(index, 'name', e.target.value)}/>
                  </div>
                  <div>
                    <Label>Tanggal & Waktu</Label>
                    <Input type="datetime-local" value={event.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)}/>
                  </div>
                  <div>
                    <Label>Lokasi</Label>
                    <Input type="text" value={event.location} onChange={(e) => handleEventChange(index, 'location', e.target.value)} placeholder="Nama Gedung & Alamat"/>
                  </div>
                </div>
              ))}
            </div>
            {/* Bagian Cerita Cinta */}
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Cerita Cinta</h2>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStory} disabled={story.length >= 4}>+ Tambah Cerita</Button>
              </div>
              <div className="space-y-6">
                {story.map((storyPart, index) => (
                  <div key={index} className="relative rounded-md border p-4 pt-8">
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStory(index)} disabled={story.length <= 1} className="absolute top-1 right-1 h-6 w-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                    <div>
                      <Label htmlFor={`storyTitle${index}`}>Judul Cerita</Label>
                      <Input type="text" id={`storyTitle${index}`} value={storyPart.title} onChange={(e) => handleStoryChange(index, 'title', e.target.value)} placeholder="Contoh: Pertemuan Awal"/>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`storyContent${index}`}>Konten Cerita</Label>
                      <Textarea id={`storyContent${index}`} value={storyPart.content} onChange={(e) => handleStoryChange(index, 'content', e.target.value)} rows={4} placeholder="Ceritakan..."/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bagian Quote/Doa */}
            <div className="space-y-4 rounded-md border p-4">
              <h2 className="text-xl font-semibold text-slate-800">Quote / Doa</h2>
               <div>
                  <Label htmlFor="quote">
                    Tuliskan kutipan atau doa (opsional)
                  </Label>
                  <Textarea
                    id="quote"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="Contoh: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...'"
                  />
                </div>
            </div>
            {/* Bagian Turut Mengundang */}
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Turut Mengundang</h2>
                <Button type="button" variant="outline" size="sm" onClick={handleAddInvitedBy}>+ Tambah Nama</Button>
              </div>
              <div className="space-y-2">
                {invitedBy.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => handleInvitedByChange(index, e.target.value)}
                      placeholder={`Nama ${index + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveInvitedBy(index)} disabled={invitedBy.length <= 1}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {/* Bagian Amplop Digital */}
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Amplop Digital</h2>
                <Button type="button" variant="outline" size="sm" onClick={handleAddGift}>+ Tambah Akun</Button>
              </div>
              <div className="space-y-6">
                {gifts.map((gift, index) => (
                  <div key={index} className="relative rounded-md border p-4 pt-8">
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveGift(index)} className="absolute top-1 right-1 h-6 w-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Tipe</Label>
                        <select value={gift.type} onChange={(e) => handleGiftChange(index, 'type', e.target.value as any)} className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option>Bank</option>
                          <option>E-Wallet</option>
                        </select>
                      </div>
                      <div>
                        <Label>Nama {gift.type}</Label>
                        <Input type="text" value={gift.name} onChange={(e) => handleGiftChange(index, 'name', e.target.value)} placeholder={gift.type === 'Bank' ? 'Contoh: BCA' : 'Contoh: OVO'}/>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Nomor Rekening/Telepon</Label>
                      <Input type="text" value={gift.accountNumber} onChange={(e) => handleGiftChange(index, 'accountNumber', e.target.value)} placeholder="0123456789"/>
                    </div>
                    <div className="mt-4">
                      <Label>Atas Nama</Label>
                      <Input type="text" value={gift.accountHolder} onChange={(e) => handleGiftChange(index, 'accountHolder', e.target.value)} placeholder="Nama Pemilik Akun"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bagian Galeri Foto */}
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Galeri Foto</h2>
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="file-upload" className="cursor-pointer">+ Unggah Foto</label>
                </Button>
                <input id="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} />
              </div>
              {isUploading && <p className="text-sm text-slate-500">Mengunggah dan memproses file...</p>}
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {files.map((file) => (
                  <div key={file.id} className="relative aspect-square">
                    <img src={file.presignedUrl} alt="Foto Galeri" className="h-full w-full rounded-md object-cover"/>
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </div>
                ))}
              </div>
              {files.length === 0 && !isUploading && <p className="text-sm text-slate-400">Belum ada foto yang diunggah.</p>}
            </div>
            {/* Bagian Tampilan Bagian */}
            <div className="space-y-4 rounded-md border p-4">
              <h2 className="text-xl font-semibold text-slate-800">Tampilan Bagian</h2>
              <p className="text-sm text-slate-500">Pilih bagian mana saja yang ingin Anda tampilkan di halaman undangan publik.</p>
              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
                {availableSections.map((section) => (
                  <label key={section.key} className="flex items-center space-x-3">
                    <Switch id={`section-${section.key}`} checked={activeSections[section.key] || false} onCheckedChange={() => handleSectionToggle(section.key)}/>
                    <Label htmlFor={`section-${section.key}`}>{section.label}</Label>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 text-right rounded-lg shadow-lg border">
            <Button type="submit" size="lg">Simpan Semua Perubahan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

