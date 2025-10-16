'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';

// Tipe data untuk satu file/foto, sekarang menyertakan URL-nya
type InvitationFile = {
  id: string;
  fileKey: string;
  presignedUrl: string; // URL aman untuk menampilkan gambar
};

// Tipe data untuk satu acara
type Event = {
  name: string;
  date: string;
  location: string;
};

// Tipe data untuk satu bagian cerita
type StoryPart = {
  title: string;
  content: string;
};

// Tipe data untuk satu akun hadiah
type GiftAccount = {
  type: 'Bank' | 'E-Wallet';
  name: string;
  accountNumber: string;
  accountHolder: string;
};

// Tipe data untuk detail undangan yang akan kita edit
type InvitationDetails = {
  bride: { name: string; father: string; mother: string };
  groom: { name: string; father: string; mother: string };
  events: Event[];
  story?: StoryPart[];
  gifts?: GiftAccount[];
};

// Tipe data untuk keseluruhan objek undangan
type Invitation = {
  id: string;
  title: string;
  slug: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Definisikan bagian-bagian yang bisa diatur oleh klien
const availableSections = [
  { key: 'story', label: 'Cerita Cinta' },
  { key: 'gallery', label: 'Galeri Foto' },
  { key: 'countdown', label: 'Hitung Mundur Acara' },
  { key: 'gift', label: 'Amplop Digital' },
  { key: 'rsvp', label: 'Konfirmasi Kehadiran' },
];

export default function EditInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State untuk semua field di form ---
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
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    story: true,
    gallery: true,
    countdown: true,
    gift: true,
    rsvp: true,
  });

  // --- State untuk galeri foto ---
  const [files, setFiles] = useState<InvitationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // useEffect untuk mengambil data undangan (termasuk daftar file)
  useEffect(() => {
    if (token && id) {
      const fetchInvitationData = async () => {
        try {
          setIsLoading(true);
          // Ambil data utama undangan
          const invResponse = await fetch(`${API_URL}/invitations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!invResponse.ok) throw new Error('Gagal mengambil data undangan.');
          const invData: Invitation = await invResponse.json();
          setInvitation(invData);
          
          // Isi semua form
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
          if (invData.activeSections) {
            setActiveSections(invData.activeSections);
          }

          // Ambil daftar file/foto untuk undangan ini
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
  
  // useEffect untuk melindungi halaman
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  // --- Fungsi untuk menangani unggahan file ---
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Langkah 1: Minta presigned URL dari backend
      const presignedUrlResponse = await fetch(`${API_URL}/files/presigned-url/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });
      if (!presignedUrlResponse.ok) {
        const errorData = await presignedUrlResponse.json();
        throw new Error(errorData.message || 'Gagal mendapatkan URL unggahan.');
      }
      const { uploadUrl, fileKey } = await presignedUrlResponse.json();

      // Langkah 2: Unggah file langsung ke MinIO menggunakan URL tersebut
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadResponse.ok) throw new Error('Gagal mengunggah file.');
      
      // Langkah 3: Konfirmasi ke backend bahwa unggahan selesai untuk diproses
      const completeResponse = await fetch(`${API_URL}/files/upload-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileKey, invitationId: id }),
      });
      if (!completeResponse.ok) throw new Error('Gagal memproses file di server.');
      
      // Langkah 4: Ambil kembali daftar file yang sudah ter-update
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
      // Reset input file agar bisa mengunggah file yang sama lagi
      event.target.value = '';
    }
  };

  // --- Fungsi-fungsi Handler Lainnya ---
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    const updatedDetails: InvitationDetails = {
      bride: { name: brideName, father: brideFather, mother: brideMother },
      groom: { name: groomName, father: groomFather, mother: groomMother },
      events: events,
      story: story,
      gifts: gifts,
    };
    try {
      const response = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
    if (story.length < 4) {
      setStory([...story, { title: '', content: '' }]);
    }
  };
  const handleRemoveStory = (indexToRemove: number) => {
    if (story.length > 1) {
      setStory(story.filter((_, index) => index !== indexToRemove));
    }
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
  const handleSectionToggle = (key: string) => {
    setActiveSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        <button
          onClick={() => router.push('/user/dashboard')}
          className="mb-6 text-sm font-semibold text-orange-600 hover:text-orange-500"
        >
          &larr; Kembali ke Dashboard
        </button>
        <h1 className="text-3xl font-bold text-slate-900">
          Edit Undangan: {invitation?.title}
        </h1>
        <p className="mt-1 text-slate-600">
          Isi detail undangan Anda di bawah ini.
        </p>

        <form
          onSubmit={handleSaveChanges}
          className="mt-8 space-y-8 rounded-lg bg-white p-8 shadow-md"
        >
          {/* Bagian Data Mempelai */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {/* Kolom Mempelai Wanita */}
            <div className="space-y-4 rounded-md border p-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Data Mempelai Wanita
              </h2>
              <div>
                <label
                  htmlFor="brideName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Mempelai Wanita
                </label>
                <input
                  type="text" id="brideName" value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label
                  htmlFor="brideFather"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Ayah
                </label>
                <input
                  type="text" id="brideFather" value={brideFather}
                  onChange={(e) => setBrideFather(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Ayah"
                />
              </div>
              <div>
                <label
                  htmlFor="brideMother"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Ibu
                </label>
                <input
                  type="text" id="brideMother" value={brideMother}
                  onChange={(e) => setBrideMother(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Ibu"
                />
              </div>
            </div>

            {/* Kolom Mempelai Pria */}
            <div className="space-y-4 rounded-md border p-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Data Mempelai Pria
              </h2>
              <div>
                <label
                  htmlFor="groomName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Mempelai Pria
                </label>
                <input
                  type="text" id="groomName" value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label
                  htmlFor="groomFather"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Ayah
                </label>
                <input
                  type="text" id="groomFather" value={groomFather}
                  onChange={(e) => setGroomFather(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Ayah"
                />
              </div>
              <div>
                <label
                  htmlFor="groomMother"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nama Ibu
                </label>
                <input
                  type="text" id="groomMother" value={groomMother}
                  onChange={(e) => setGroomMother(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Nama Ibu"
                />
              </div>
            </div>
          </div>

          {/* Bagian Acara */}
          <div className="space-y-6 rounded-md border p-4">
            <h2 className="text-xl font-semibold text-slate-800">Data Acara</h2>
            {events.map((event, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nama Acara
                  </label>
                  <input
                    type="text"
                    value={event.name}
                    onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tanggal & Waktu
                  </label>
                  <input
                    type="datetime-local"
                    value={event.date}
                    onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) => handleEventChange(index, 'location', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Nama Gedung & Alamat"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bagian Cerita Cinta */}
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Cerita Cinta</h2>
              <button
                type="button"
                onClick={handleAddStory}
                disabled={story.length >= 4}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Tambah Cerita
              </button>
            </div>
             <div className="space-y-6">
              {story.map((storyPart, index) => (
                <div key={index} className="relative rounded-md border p-4 pt-8">
                   <button
                    type="button"
                    onClick={() => handleRemoveStory(index)}
                    disabled={story.length <= 1}
                    className="absolute top-2 right-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div>
                    <label
                      htmlFor={`storyTitle${index}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Judul Cerita
                    </label>
                    <input
                      type="text"
                      id={`storyTitle${index}`}
                      value={storyPart.title}
                      onChange={(e) => handleStoryChange(index, 'title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder={`Contoh: Pertemuan Awal`}
                    />
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor={`storyContent${index}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Konten Cerita
                    </label>
                    <textarea
                      id={`storyContent${index}`}
                      value={storyPart.content}
                      onChange={(e) => handleStoryChange(index, 'content', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Ceritakan..."
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bagian Amplop Digital */}
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Amplop Digital</h2>
              <button
                type="button"
                onClick={handleAddGift}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                + Tambah Akun
              </button>
            </div>
             <div className="space-y-6">
              {gifts.map((gift, index) => (
                <div key={index} className="relative rounded-md border p-4 pt-8">
                   <button
                    type="button"
                    onClick={() => handleRemoveGift(index)}
                    className="absolute top-2 right-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Tipe</label>
                      <select
                        value={gift.type}
                        onChange={(e) => handleGiftChange(index, 'type', e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      >
                        <option>Bank</option>
                        <option>E-Wallet</option>
                      </select>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700">Nama {gift.type}</label>
                      <input
                        type="text"
                        value={gift.name}
                        onChange={(e) => handleGiftChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder={gift.type === 'Bank' ? 'Contoh: BCA' : 'Contoh: OVO'}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">Nomor Rekening/Telepon</label>
                     <input
                        type="text"
                        value={gift.accountNumber}
                        onChange={(e) => handleGiftChange(index, 'accountNumber', e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder="0123456789"
                      />
                  </div>
                   <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">Atas Nama</label>
                     <input
                        type="text"
                        value={gift.accountHolder}
                        onChange={(e) => handleGiftChange(index, 'accountHolder', e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder="Nama Pemilik Akun"
                      />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian Galeri Foto */}
          <div className="space-y-4 rounded-md border p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Galeri Foto</h2>
              <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                + Unggah Foto
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} />
            </div>
            
            {isUploading && <p className="text-sm text-slate-500">Mengunggah dan memproses file...</p>}
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {files.map((file) => (
                <div key={file.id} className="relative aspect-square">
                  <img
                    src={file.presignedUrl}
                    alt="Foto Galeri"
                    className="h-full w-full rounded-md object-cover"
                  />
                  <button type="button" className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/75">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
                </div>
              ))}
            </div>
            {files.length === 0 && !isUploading && <p className="text-sm text-slate-400">Belum ada foto yang diunggah.</p>}
          </div>
          
          {/* Bagian Tampilan Bagian */}
          <div className="space-y-4 rounded-md border p-4">
            <h2 className="text-xl font-semibold text-slate-800">Tampilan Bagian</h2>
            <p className="text-sm text-slate-500">
              Pilih bagian mana saja yang ingin Anda tampilkan di halaman undangan publik.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
              {availableSections.map((section) => (
                <label key={section.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={activeSections[section.key] || false}
                    onChange={() => handleSectionToggle(section.key)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 text-right">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

