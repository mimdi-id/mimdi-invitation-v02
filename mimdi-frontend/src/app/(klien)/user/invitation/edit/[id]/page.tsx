'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2, Upload, CheckCircle, Eye, Copy, Heart, Users, Calendar, Image as ImageIcon, Music, Video, Sparkles, Gift, BookText, Settings, ChevronLeft, Quote } from 'lucide-react';
import Link from 'next/link';

// --- Tipe Data ---
type InvitationFile = {
  id: string;
  fileKey: string;
  presignedUrl: string;
};
type Event = {
  id?: string;
  name: string;
  date: string;
  location: string;
};
type StoryPart = {
  id?: string;
  title: string;
  content: string;
};
type GiftAccount = {
  id?: string;
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
  addOns?: { addOnId: string }[];
  viewCount: number;
  createdAt: string;
  guests?: { _count: { id: number } }[];
};
type AddOn = {
  id: string;
  name: string;
  price: number;
  code: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// --- Daftar Bagian Editor dengan Ikon & Warna ---
const editorSections = [
  { id: 'coverImage', label: 'Foto Sampul', icon: ImageIcon, color: 'bg-indigo-500' },
  { id: 'mempelai', label: 'Data Mempelai', icon: Users, color: 'bg-pink-500' },
  { id: 'acara', label: 'Jadwal Acara', icon: Calendar, color: 'bg-purple-500' },
  { id: 'story', label: 'Cerita Cinta', icon: Heart, color: 'bg-red-500' },
  { id: 'quote', label: 'Quote / Doa', icon: Quote, color: 'bg-orange-500' },
  { id: 'invitedBy', label: 'Turut Mengundang', icon: BookText, color: 'bg-green-500' },
  { id: 'gifts', label: 'Amplop Digital', icon: Gift, color: 'bg-yellow-500' },
  { id: 'gallery', label: 'Galeri Foto', icon: ImageIcon, color: 'bg-blue-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'bg-teal-500' },
  { id: 'music', label: 'Musik Latar', icon: Music, color: 'bg-gray-500' },
  { id: 'addOns', label: 'Toko Add-On', icon: Sparkles, color: 'bg-orange-600' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'bg-red-600' },
];

export default function EditInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  const [details, setDetails] = useState<Partial<InvitationDetails>>({});
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<InvitationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [purchasedAddOnIds, setPurchasedAddOnIds] = useState<Set<string>>(new Set());
  const [isBuying, setIsBuying] = useState<string | null>(null);
  
  const fetchAllData = async () => {
    if (!token || !id) return;
    try {
      setIsLoading(true);
      const [invResponse, addOnsResponse, filesResponse] = await Promise.all([
        fetch(`${API_URL}/invitations/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/add-ons`),
        fetch(`${API_URL}/files/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (!invResponse.ok) throw new Error('Gagal mengambil data undangan.');
      if (!addOnsResponse.ok) throw new Error('Gagal mengambil daftar add-on.');
      if (!filesResponse.ok) throw new Error('Gagal mengambil daftar foto.');

      const invData: Invitation = await invResponse.json();
      const addOnsData: AddOn[] = await addOnsResponse.json();
      const filesData: InvitationFile[] = await filesResponse.json();
      
      setInvitation(invData);
      setAvailableAddOns(addOnsData);
      setFiles(filesData);
      const purchasedIds = new Set(invData.addOns?.map(ia => ia.addOnId) || []);
      setPurchasedAddOnIds(purchasedIds);
      
      const defaultDetails: Partial<InvitationDetails> = {
        bride: { name: '', father: '', mother: '' },
        groom: { name: '', father: '', mother: '' },
        events: [{ name: 'Akad Nikah', date: '', location: '' }],
        story: [{ title: '', content: '' }],
        gifts: [],
        invitedBy: [''],
        quote: '',
        musicUrl: '',
        videoUrl: '',
      };

      setDetails({ ...defaultDetails, ...invData.details });

      const initialActiveSections: Record<string, boolean> = {};
      editorSections.forEach(sec => {
        initialActiveSections[sec.id] = invData.activeSections?.[sec.id] ?? true;
      });
      setActiveSections(initialActiveSections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [id, token]);
  
  const handleBackToDashboard = () => router.push(user?.role === 'PARTNER' ? '/partner/dashboard' : '/user/dashboard');
  
  const handleStatusToggle = async (isPublished: boolean) => {
    if (!token || !invitation) return;
    const newStatus = isPublished ? 'PUBLISHED' : 'DRAFT';
    setInvitation(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      await fetch(`${API_URL}/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      alert('Gagal mengubah status.');
      setInvitation(prev => prev ? { ...prev, status: invitation.status } : null);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!token || !id) return;
    const cleanedDetails = {
      ...details,
      story: details.story?.filter(s => s.title || s.content),
      gifts: details.gifts?.filter(g => g.accountNumber),
      invitedBy: details.invitedBy?.filter(n => n && n.trim()),
    };
    try {
      await fetch(`${API_URL}/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ details: cleanedDetails, activeSections: activeSections }),
      });
      alert('Perubahan berhasil disimpan!');
      await fetchAllData();
    } catch (err) {
      alert('Gagal menyimpan perubahan.');
    }
  };
  
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
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
      if (!presignedUrlResponse.ok) throw new Error((await presignedUrlResponse.json()).message);
      const { uploadUrl, fileKey } = await presignedUrlResponse.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      const completeEndpoint = isCover ? 'cover-image-complete' : 'upload-complete';
      await fetch(`${API_URL}/files/${completeEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileKey, invitationId: id }),
      });
      await fetchAllData();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteInvitation = async () => {
    if (!token || !id) return;
    try {
      await fetch(`${API_URL}/invitations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      alert('Undangan berhasil dihapus.');
      handleBackToDashboard();
    } catch (err) {
      alert('Gagal menghapus undangan.');
    }
  };

  const handlePurchaseAddOn = async (addOnId: string) => {
    if (!token || !id) return;
    setIsBuying(addOnId);
    try {
      await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemType: 'ADD_ON', itemId: addOnId, invitationId: id }),
      });
      alert('Pembelian Add-On berhasil!');
      await fetchAllData();
    } catch (err) {
      alert('Gagal memproses pembelian.');
    } finally {
      setIsBuying(null);
    }
  };
  
  const handleDetailChange = (field: keyof InvitationDetails, value: any) => setDetails(p => ({ ...p, [field]: value }));
  const handleNestedChange = (part: keyof InvitationDetails, index: number, field: string, value: any) => {
    setDetails(prev => {
      const list = (prev[part] as any[] | undefined) || [];
      const newList = [...list];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [part]: newList };
    });
  };
  const addListItem = (part: keyof InvitationDetails, newItem: any) => setDetails(p => ({ ...p, [part]: [...(p[part] as any[] || []), newItem] }));
  const removeListItem = (part: keyof InvitationDetails, indexToRemove: number) => {
    setDetails(prev => {
      const list = (prev[part] as any[] | undefined) || [];
      if ((part === 'story' || part === 'invitedBy') && list.length <= 1) return prev;
      if (part === 'gifts' && list.length < 1) return prev;
      return { ...prev, [part]: list.filter((_, index) => index !== indexToRemove) };
    });
  };
  const handleToggleSection = (id: string) => setActiveSections(p => ({ ...p, [id]: !p[id] }));

  if (isLoading || isAuthLoading) return <div className="p-10 text-center">Memuat data editor...</div>;
  
  const fullInvitationLink = `${BASE_URL}/u/${invitation?.slug}`;
  const totalRsvp = invitation?.guests?.[0]?._count?.id || 0;

  const renderEditorContent = () => {
    switch (activeEditor) {
      case 'coverImage':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <img src={invitation?.coverImageUrl || 'https://placehold.co/400x200/E2E8F0/A0AEC0?text=Preview'} alt="Cover Preview" className="rounded-lg object-cover w-full aspect-video"/>
            <Button asChild><label htmlFor="cover-edit-upload" className="cursor-pointer"><Upload className="h-4 w-4 mr-2"/> Unggah Foto Baru</label></Button>
            <input id="cover-edit-upload" type="file" className="sr-only" onChange={(e) => handleFileUpload(e, true)}/>
          </div>
        );
      case 'mempelai':
        return (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-md border p-4"><h3 className="font-semibold text-lg">Mempelai Wanita</h3>
              <div className="space-y-2"><Label>Nama</Label><Input value={details.bride?.name || ''} onChange={(e) => setDetails(p => ({...p, bride: {...p.bride!, name: e.target.value}}))} /></div>
              <div className="space-y-2"><Label>Ayah</Label><Input value={details.bride?.father || ''} onChange={(e) => setDetails(p => ({...p, bride: {...p.bride!, father: e.target.value}}))} /></div>
              <div className="space-y-2"><Label>Ibu</Label><Input value={details.bride?.mother || ''} onChange={(e) => setDetails(p => ({...p, bride: {...p.bride!, mother: e.target.value}}))} /></div>
            </div>
            <div className="space-y-4 rounded-md border p-4"><h3 className="font-semibold text-lg">Mempelai Pria</h3>
              <div className="space-y-2"><Label>Nama</Label><Input value={details.groom?.name || ''} onChange={(e) => setDetails(p => ({...p, groom: {...p.groom!, name: e.target.value}}))} /></div>
              <div className="space-y-2"><Label>Ayah</Label><Input value={details.groom?.father || ''} onChange={(e) => setDetails(p => ({...p, groom: {...p.groom!, father: e.target.value}}))} /></div>
              <div className="space-y-2"><Label>Ibu</Label><Input value={details.groom?.mother || ''} onChange={(e) => setDetails(p => ({...p, groom: {...p.groom!, mother: e.target.value}}))} /></div>
            </div>
          </div>
        );
      case 'acara':
        return (
          <div className="space-y-4">
            {details.events?.map((event, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Nama Acara</Label><Input value={event.name} onChange={(e) => handleNestedChange('events', index, 'name', e.target.value)}/></div>
                <div className="space-y-2"><Label>Tanggal & Waktu</Label><Input type="datetime-local" value={event.date} onChange={(e) => handleNestedChange('events', index, 'date', e.target.value)}/></div>
                <div className="space-y-2"><Label>Lokasi</Label><Input value={event.location} onChange={(e) => handleNestedChange('events', index, 'location', e.target.value)} /></div>
              </div></div>
            ))}
          </div>
        );
      case 'story':
        return (
          <div className="space-y-4">
            {details.story?.map((storyPart, index) => (
              <div key={index} className="relative rounded-md border p-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('story', index)} disabled={(details.story?.length || 0) <= 1} className="absolute top-2 right-2 h-6 w-6"><Trash2 className="h-4 w-4" /></Button>
                <div className="space-y-2"><Label>Judul</Label><Input value={storyPart.title} onChange={(e) => handleNestedChange('story', index, 'title', e.target.value)} /></div>
                <div className="mt-4 space-y-2"><Label>Konten</Label><Textarea value={storyPart.content} onChange={(e) => handleNestedChange('story', index, 'content', e.target.value)} /></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('story', {title: '', content: ''})} disabled={(details.story?.length || 0) >= 4}>+ Tambah Cerita</Button>
          </div>
        );
      case 'quote':
        return <div className="space-y-2"><Label>Quote / Doa</Label><Textarea value={details.quote || ''} onChange={(e) => handleDetailChange('quote', e.target.value)} rows={5}/></div>;
      case 'invitedBy':
        return (
          <div className="space-y-2">
            {details.invitedBy?.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={name} onChange={(e) => { const newList = [...(details.invitedBy || [])]; newList[index] = e.target.value; handleDetailChange('invitedBy', newList); }}/>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('invitedBy', index)} disabled={(details.invitedBy?.length || 0) <= 1}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('invitedBy', '')}>+ Tambah Nama</Button>
          </div>
        );
      case 'gifts':
         return (
          <div className="space-y-4">
            {details.gifts?.map((gift, index) => (
              <div key={index} className="relative rounded-md border p-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('gifts', index)} className="absolute top-2 right-2 h-6 w-6"><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Tipe</Label><Select value={gift.type} onValueChange={(value) => handleNestedChange('gifts', index, 'type', value as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Bank">Bank</SelectItem><SelectItem value="E-Wallet">E-Wallet</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Nama {gift.type}</Label><Input value={gift.name} onChange={(e) => handleNestedChange('gifts', index, 'name', e.target.value)} /></div>
                </div>
                <div className="mt-4 space-y-2"><Label>Nomor Rekening/Telepon</Label><Input value={gift.accountNumber} onChange={(e) => handleNestedChange('gifts', index, 'accountNumber', e.target.value)} /></div>
                <div className="mt-4 space-y-2"><Label>Atas Nama</Label><Input value={gift.accountHolder} onChange={(e) => handleNestedChange('gifts', index, 'accountHolder', e.target.value)} /></div>
              </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => addListItem('gifts', {type: 'Bank', name: '', accountNumber: '', accountHolder: ''})}>+ Tambah Akun</Button>
          </div>
         );
      case 'gallery':
        return (
          <div>
            <div className="flex justify-end mb-4">
              <Button asChild variant="outline" size="sm"><label htmlFor="gallery-upload" className="cursor-pointer">+ Unggah</label></Button>
              <input id="gallery-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileUpload(e, false)} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {files.map((file) => (
                <div key={file.id} className="relative aspect-square group">
                  <img src={file.presignedUrl} alt="Foto Galeri" className="h-full w-full rounded-md object-cover"/>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'video':
        return <div className="space-y-2"><Label>URL YouTube</Label><p className="text-xs text-muted-foreground">Tempel tautan "Share" dari YouTube.</p><Input value={details.videoUrl || ''} onChange={(e) => handleDetailChange('videoUrl', e.target.value)} /></div>;
      case 'music':
        return <div className="space-y-2"><Label>URL Musik (MP3)</Label><p className="text-xs text-muted-foreground">Tempel tautan langsung ke file .mp3.</p><Input value={details.musicUrl || ''} onChange={(e) => handleDetailChange('musicUrl', e.target.value)} /></div>;
      case 'addOns':
        return (
          <div className="space-y-4">
            {availableAddOns.map((addOn) => {
              const isPurchased = purchasedAddOnIds.has(addOn.id);
              return (
                <div key={addOn.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div><h4 className="font-semibold">{addOn.name}</h4><p className="text-sm text-muted-foreground">Rp {addOn.price.toLocaleString('id-ID')}</p></div>
                  {isPurchased ? (<div className="flex items-center gap-2 text-sm font-semibold text-green-600"><CheckCircle className="h-5 w-5" /><span>Dimiliki</span></div>) : (<Button onClick={() => handlePurchaseAddOn(addOn.id)} disabled={isBuying === addOn.id}>{isBuying === addOn.id ? 'Memproses...' : 'Beli'}</Button>)}
                </div>
              )
            })}
          </div>
        );
      case 'settings':
        return (
           <Card className="border-red-500">
            <CardHeader><CardTitle className="text-red-600">Zona Berbahaya</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="font-semibold">Hapus Undangan Ini</p>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive">Hapus</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus undangan "{invitation?.title}" secara permanen.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteInvitation}>Ya, Hapus</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        );
      default: return null;
    }
  };
  
  const currentEditorTitle = editorSections.find(s => s.id === activeEditor)?.label || 'Edit';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center justify-between mt-4">
          <Button onClick={handleBackToDashboard} variant="outline">&larr; Kembali</Button>
          <div className="flex items-center space-x-3">
            <Label htmlFor="publish-switch" className="font-semibold text-sm">{invitation?.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}</Label>
            <Switch id="publish-switch" checked={invitation?.status === 'PUBLISHED'} onCheckedChange={handleStatusToggle}/>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={invitation?.coverImageUrl || 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Cover'} alt="Cover" className="h-20 w-20 rounded-lg object-cover"/>
              <div>
                <CardTitle>{invitation?.title}</CardTitle>
                <CardDescription className="mt-1">Oleh {user?.name} • Dibuat {invitation && new Date(invitation.createdAt).toLocaleDateString('id-ID')}</CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground"><Eye className="h-4 w-4 mr-1" /> {invitation?.viewCount || 0}</div>
                  <div className="flex items-center text-sm text-muted-foreground"><Heart className="h-4 w-4 mr-1" /> {totalRsvp}</div>
                </div>
              </div>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
               <div className="flex-1"><Input value={fullInvitationLink} readOnly /></div>
               <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(fullInvitationLink)}><Copy className="h-4 w-4" /></Button>
               <Button asChild><Link href={fullInvitationLink} target="_blank">Buka</Link></Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editorSections.map((section) => {
            const Icon = section.icon;
            const isEnabled = activeSections[section.id] ?? true;
            return (
              <Card key={section.id} className={`flex flex-col justify-between transition-all ${isEnabled ? '' : 'bg-slate-50 opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.color} bg-opacity-10`}><Icon className={`h-5 w-5 ${section.color.replace('bg-', 'text-')}`} /></div>
                      <CardTitle className="text-lg">{section.label}</CardTitle>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={() => handleToggleSection(section.id)} aria-label={`Toggle ${section.label}`} />
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button type="button" variant="outline" size="sm" className="w-full" disabled={!isEnabled} onClick={() => setActiveEditor(section.id)}>
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <footer className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 text-right rounded-lg shadow-lg border -mx-4 -mb-4 sm:-mx-6">
          <Button size="lg" onClick={handleSaveChanges}>Simpan Perubahan</Button>
        </footer>
      </main>

      <Dialog open={!!activeEditor} onOpenChange={(open) => !open && setActiveEditor(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{currentEditorTitle}</DialogTitle>
            <DialogDescription>
              Buat perubahan pada bagian ini. Klik selesai jika sudah.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {renderEditorContent()}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Selesai</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

