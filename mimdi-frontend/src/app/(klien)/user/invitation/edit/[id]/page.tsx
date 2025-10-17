'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Upload } from 'lucide-react';

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
  musicUrl?: string;
  videoUrl?: string;
  invitedBy?: string[];
};
type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
  coverImageUrl?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const availableSections = [
  { key: 'story', label: 'Cerita Cinta' },
  { key: 'gallery', label: 'Galeri Foto' },
  { key: 'countdown', label: 'Hitung Mundur' },
  { key: 'gift', label: 'Amplop Digital' },
  { key: 'rsvp', label: 'Konfirmasi Hadir' },
  { key: 'quote', label: 'Quote/Doa' },
  { key: 'music', label: 'Musik Latar' },
  { key: 'video', label: 'Video' },
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
  const [musicUrl, setMusicUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [invitedBy, setInvitedBy] = useState<string[]>(['']);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    story: true,
    gallery: true,
    countdown: true,
    gift: true,
    rsvp: true,
    quote: true,
    music: false,
    video: true,
    invitedBy: true,
  });
  const [files, setFiles] = useState<InvitationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fungsi untuk memuat ulang semua data undangan
  const fetchInvitationData = async () => {
    if (!token || !id) return;
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
      setMusicUrl(details?.musicUrl || '');
      setVideoUrl(details?.videoUrl || '');
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

  useEffect(() => {
    fetchInvitationData();
  }, [id, token]);
  
  // Melindungi halaman dari akses tidak sah
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  // Handler untuk navigasi kembali yang dinamis
  const handleBackToDashboard = () => {
    if (user?.role === 'PARTNER') {
      router.push('/partner/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  };

  // --- FUNGSI BARU UNTUK MENGHAPUS UNDANGAN ---
  const handleDeleteInvitation = async () => {
    if (!token || !id) return;
    try {
      const response = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Gagal menghapus undangan.');
      }
      alert('Undangan berhasil dihapus.');
      handleBackToDashboard(); // Kembali ke dashboard setelah berhasil
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

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
      musicUrl: musicUrl,
      videoUrl: videoUrl,
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

  // Handler untuk unggah foto sampul
  const handleCoverImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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
      if (!presignedUrlResponse.ok) throw new Error('Gagal mendapatkan URL unggahan.');
      const { uploadUrl, fileKey } = await presignedUrlResponse.json();
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadResponse.ok) throw new Error('Gagal mengunggah foto sampul.');
      await fetch(`${API_URL}/files/cover-image-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileKey, invitationId: id }),
      });
      await fetchInvitationData();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handler untuk unggah foto galeri
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
    <div className="min-h-screen bg-slate-100 dark:bg-background p-4 md:p-8">
      <form onSubmit={handleSaveChanges} className="mx-auto max-w-4xl space-y-8">
        <header className="flex justify-between items-start mb-6">
          <div>
             <Button onClick={handleBackToDashboard} variant="link" className="p-0 mb-2 h-auto">&larr; Kembali ke Dashboard</Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Edit Undangan: {invitation?.title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Isi dan simpan semua detail undangan Anda di bawah ini.
            </p>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="publish-switch"
              checked={invitation?.status === 'PUBLISHED'}
              onCheckedChange={handleStatusToggle}
            />
            <Label htmlFor="publish-switch" className="font-semibold text-sm">
              {invitation?.status === 'PUBLISHED' ? 'Telah Terbit' : 'Draf'}
            </Label>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Foto Sampul</CardTitle>
            <CardDescription>Gambar ini akan muncul di halaman pembuka undangan Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center relative group">
              {invitation?.coverImageUrl ? (
                <img src={invitation.coverImageUrl} alt="Foto Sampul" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <p className="text-muted-foreground">Belum ada foto sampul</p>
              )}
              <label htmlFor="cover-upload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-lg text-white">
                <Upload className="h-8 w-8 mb-2" />
                <span>{invitation?.coverImageUrl ? 'Ubah Foto' : 'Unggah Foto'}</span>
              </label>
              <input id="cover-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleCoverImageUpload} />
            </div>
            {isUploading && <p className="text-sm text-slate-500 text-center mt-2">Mengunggah foto sampul...</p>}
            {uploadError && <p className="text-sm text-red-600 text-center mt-2">{uploadError}</p>}
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Data Mempelai</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Mempelai Wanita</h3>
                <div className="space-y-2"><Label htmlFor="brideName">Nama Lengkap</Label><Input id="brideName" value={brideName} onChange={(e) => setBrideName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="brideFather">Nama Ayah</Label><Input id="brideFather" value={brideFather} onChange={(e) => setBrideFather(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="brideMother">Nama Ibu</Label><Input id="brideMother" value={brideMother} onChange={(e) => setBrideMother(e.target.value)} /></div>
              </div>
               <div className="space-y-4">
                <h3 className="font-semibold text-lg">Mempelai Pria</h3>
                <div className="space-y-2"><Label htmlFor="groomName">Nama Lengkap</Label><Input id="groomName" value={groomName} onChange={(e) => setGroomName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="groomFather">Nama Ayah</Label><Input id="groomFather" value={groomFather} onChange={(e) => setGroomFather(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="groomMother">Nama Ibu</Label><Input id="groomMother" value={groomMother} onChange={(e) => setGroomMother(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Data Acara</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {events.map((event, index) => (
                <div key={index} className="space-y-4 rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2"><Label>Nama Acara</Label><Input value={event.name} onChange={(e) => handleEventChange(index, 'name', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Tanggal & Waktu</Label><Input type="datetime-local" value={event.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Lokasi</Label><Input value={event.location} onChange={(e) => handleEventChange(index, 'location', e.target.value)} placeholder="Nama Gedung & Alamat"/></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Cerita Cinta</CardTitle><CardDescription>Bagikan perjalanan cinta Anda.</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStory} disabled={story.length >= 4}>+ Tambah Cerita</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {story.map((storyPart, index) => (
                <div key={index} className="relative rounded-md border p-4">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStory(index)} disabled={story.length <= 1} className="absolute top-2 right-2 h-6 w-6"><Trash2 className="h-4 w-4" /></Button>
                  <div className="space-y-2"><Label htmlFor={`storyTitle${index}`}>Judul</Label><Input id={`storyTitle${index}`} value={storyPart.title} onChange={(e) => handleStoryChange(index, 'title', e.target.value)} placeholder="Contoh: Pertemuan Awal"/></div>
                  <div className="mt-4 space-y-2"><Label htmlFor={`storyContent${index}`}>Konten</Label><Textarea id={`storyContent${index}`} value={storyPart.content} onChange={(e) => handleStoryChange(index, 'content', e.target.value)} rows={4} placeholder="Ceritakan..."/></div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card><CardHeader><CardTitle>Quote / Doa</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label htmlFor="quote" className="sr-only">Quote / Doa</Label><Textarea id="quote" value={quote} onChange={(e) => setQuote(e.target.value)} rows={4} placeholder="Contoh: 'Dan di antara tanda-tanda kekuasaan-Nya...'"/></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Musik Latar</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label htmlFor="musicUrl" className="sr-only">URL Musik</Label><p className="text-xs text-muted-foreground mb-1">Tempel tautan ke file .mp3 atau dari YouTube Audio Library.</p><Input id="musicUrl" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="https://..."/></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Video</CardTitle><CardDescription>Sematkan video dari YouTube.</CardDescription></CardHeader><CardContent><div className="space-y-2"><Label htmlFor="videoUrl">URL Video YouTube</Label><p className="text-xs text-muted-foreground mb-1">Tempel tautan "Share" dari YouTube.</p><Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/..."/></div></CardContent></Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Turut Mengundang</CardTitle><CardDescription>Daftar nama keluarga yang turut mengundang.</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddInvitedBy}>+ Tambah Nama</Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {invitedBy.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={name} onChange={(e) => handleInvitedByChange(index, e.target.value)} placeholder={`Nama ${index + 1}`}/>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveInvitedBy(index)} disabled={invitedBy.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Amplop Digital</CardTitle><CardDescription>Tambahkan rekening bank atau e-wallet.</CardDescription></div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddGift}>+ Tambah Akun</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {gifts.map((gift, index) => (
                <div key={index} className="relative rounded-md border p-4">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveGift(index)} className="absolute top-2 right-2 h-6 w-6"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Tipe</Label><Select value={gift.type} onValueChange={(value) => handleGiftChange(index, 'type', value as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Bank">Bank</SelectItem><SelectItem value="E-Wallet">E-Wallet</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Nama {gift.type}</Label><Input value={gift.name} onChange={(e) => handleGiftChange(index, 'name', e.target.value)} placeholder={gift.type === 'Bank' ? 'Contoh: BCA' : 'Contoh: OVO'}/></div>
                  </div>
                  <div className="mt-4 space-y-2"><Label>Nomor Rekening/Telepon</Label><Input value={gift.accountNumber} onChange={(e) => handleGiftChange(index, 'accountNumber', e.target.value)} placeholder="0123456789"/></div>
                  <div className="mt-4 space-y-2"><Label>Atas Nama</Label><Input value={gift.accountHolder} onChange={(e) => handleGiftChange(index, 'accountHolder', e.target.value)} placeholder="Nama Pemilik Akun"/></div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Galeri Foto</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild variant="outline" size="sm"><label htmlFor="file-upload" className="cursor-pointer">+ Unggah Foto</label></Button>
                <input id="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} />
              </div>
              {isUploading && <p className="text-sm text-slate-500 text-center">Mengunggah dan memproses file...</p>}
              {uploadError && <p className="text-sm text-red-600 text-center">{uploadError}</p>}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {files.map((file) => (
                  <div key={file.id} className="relative aspect-square group">
                    <img src={file.presignedUrl} alt="Foto Galeri" className="h-full w-full rounded-md object-cover"/>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              {files.length === 0 && !isUploading && <p className="text-sm text-center text-muted-foreground py-4">Belum ada foto.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tampilan Bagian</CardTitle><CardDescription>Pilih bagian mana saja yang ingin Anda tampilkan di halaman undangan publik.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
              {availableSections.map((section) => (
                <div key={section.key} className="flex items-center space-x-2">
                  <Switch id={`section-${section.key}`} checked={activeSections[section.key] ?? true} onCheckedChange={(checked) => setActiveSections(prev => ({...prev, [section.key]: checked}))}/>
                  <Label htmlFor={`section-${section.key}`}>{section.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* --- BAGIAN BARU: ZONA BERBAHAYA (HAPUS) --- */}
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
            <CardDescription>
              Tindakan di bawah ini tidak dapat diurungkan. Pastikan Anda yakin sebelum melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="font-semibold">Hapus Undangan Ini</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Hapus</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus undangan "{invitation?.title}" secara permanen beserta semua data terkaitnya (foto, RSVP, dll). Data yang sudah dihapus tidak dapat dipulihkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteInvitation}>
                    Ya, Hapus Undangan Ini
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        {/* --- END BAGIAN BARU --- */}
        </div>

        <footer className="sticky bottom-0 mt-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 text-right rounded-lg shadow-lg border">
          <Button type="submit" size="lg">Simpan Semua Perubahan</Button>
        </footer>
      </form>
    </div>
  );
}

