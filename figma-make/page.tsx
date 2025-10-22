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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Users,
  Calendar,
  Image as ImageIcon,
  Music,
  Copy,
  Eye,
  Trash2,
  Upload,
  Share2,
  ExternalLink,
  MessageSquare,
  Gift,
  Quote,
  Video,
  MapPin,
  ChevronLeft,
  GripVertical,
  Settings,
  Sparkles,
  Loader2,
  PlusCircle,
  BookText,
  Palette,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";




// --- Tipe Data ---
type InvitationFile = {
  id: string;
  fileKey: string;
  presignedUrl: string;
};


type SocialMedia = {
  facebook: string;
  instagram: string;
  tiktok: string;
}


type CoupleDetails = {
  name: string;
  initial: string;
  nickname: string;
  father: string;
  mother: string;
  childOrder: string;
  socials: SocialMedia;
}


type Event = {
  id?: string;
  name: string;
  date: string;
  location: string;
  googleMapsUrl: string;
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
  bride: CoupleDetails;
  groom: CoupleDetails;
  events: Event[];
  story?: StoryPart[];
  gifts?: GiftAccount[];
  quote?: string;
  musicUrl?: string;
  videoUrl?: string;
  invitedBy?: string[];
  locationMapsUrl?: string;
};


type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  templateId: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
  coverImageUrl?: string | null;
  addOns?: { addOn: { id: string, code: string } }[];
  viewCount: number;
  createdAt: string;
  packageName: string | null;
  packageFeatures?: { [key: string]: any };
  templateName?: string | null;
  expiresAt: string | null;
  rsvpCount: number;
  wishCount: number;
};
type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
  code: string;
};


type Template = {
  id: string;
  name: string;
  category: 'BASIC' | 'PREMIUM';
  previewUrl: string | null;
};


// --- TIPE DATA BARU ---
type Rsvp = {
  id: string;
  name: string;
  status: 'ATTENDING' | 'NOT_ATTENDING';
  message: string;
  createdAt: string;
}




const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";


const editorSections = [
  { id: 'story', label: 'Cerita Cinta', icon: Heart, color: 'bg-red-500' },
  { id: 'quote', label: 'Quote / Doa', icon: Quote, color: 'bg-orange-500' },
  { id: 'invitedBy', label: 'Turut Mengundang', icon: BookText, color: 'bg-green-500' },
  { id: 'gifts', label: 'Amplop Digital', icon: Gift, color: 'bg-yellow-500' },
];


const mediaSections = [
  { id: 'gallery', label: 'Galeri Foto', icon: ImageIcon, color: 'bg-blue-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'bg-teal-500' },
  { id: 'music', label: 'Musik Latar', icon: Music, color: 'bg-gray-500' },
];


export default function EditInvitationPage() {
  const { token, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;


  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('konten');
  const [activeEditor, setActiveEditor] = useState<string | null>(null);


  const [details, setDetails] = useState<Partial<InvitationDetails>>({});
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<InvitationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);


  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [allAddOns, setAllAddOns] = useState<AddOn[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]); // State baru untuk RSVP
 
  const fetchAllData = async () => {
    if (!token || !id) return;
    try {
      setIsLoading(true);
      const [invResponse, filesResponse, templatesResponse, addOnsResponse, rsvpsResponse] = await Promise.all([
        fetch(`${API_URL}/invitations/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/files/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/templates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/add-ons`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/invitations/${id}/rsvps`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
     
      if (!invResponse.ok) throw new Error('Gagal mengambil data undangan.');
      if (!filesResponse.ok) throw new Error('Gagal mengambil daftar foto.');
      if (!templatesResponse.ok) throw new Error('Gagal mengambil daftar tema.');
      if (!addOnsResponse.ok) throw new Error('Gagal mengambil daftar add-on.');
      if (!rsvpsResponse.ok) throw new Error('Gagal mengambil data RSVP.');




      const invData: Invitation = await invResponse.json();
      const filesData: InvitationFile[] = await filesResponse.json();
      const templatesData: Template[] = await templatesResponse.json();
      const addOnsData: AddOn[] = await addOnsResponse.json();
      const rsvpsData: Rsvp[] = await rsvpsResponse.json();
     
      setInvitation(invData);
      setEditableTitle(invData.title);
      setSelectedTemplateId(invData.templateId);
      setFiles(filesData);
      setAllTemplates(templatesData);
      setAllAddOns(addOnsData);
      setRsvps(rsvpsData);
     
      const defaultCoupleDetails: CoupleDetails = {
        name: '', initial: '', nickname: '', father: '', mother: '', childOrder: '',
        socials: { facebook: '', instagram: '', tiktok: '' }
      };


      const defaultDetails: Partial<InvitationDetails> = {
        bride: defaultCoupleDetails,
        groom: defaultCoupleDetails,
        events: [{ name: 'Akad Nikah', date: '', location: '', googleMapsUrl: '' }],
        story: [{ title: '', content: '' }],
        gifts: [],
        invitedBy: [''],
        quote: '',
        musicUrl: '',
        videoUrl: '',
        locationMapsUrl: '',
      };
     
      const currentDetails = invData.details || {};
      let storyData = Array.isArray(currentDetails.story) && currentDetails.story.length > 0 ? currentDetails.story : defaultDetails.story;
      let invitedByData = Array.isArray(currentDetails.invitedBy) && currentDetails.invitedBy.length > 0 ? currentDetails.invitedBy : defaultDetails.invitedBy;
      let eventsData = Array.isArray(currentDetails.events) && currentDetails.events.length > 0 ? currentDetails.events : defaultDetails.events;


      const mergeCoupleDetails = (current?: Partial<CoupleDetails>): CoupleDetails => ({
        ...defaultCoupleDetails,
        ...current,
        socials: { ...defaultCoupleDetails.socials, ...current?.socials }
      });


      setDetails({
        ...defaultDetails,
        ...currentDetails,
        bride: mergeCoupleDetails(currentDetails.bride),
        groom: mergeCoupleDetails(currentDetails.groom),
        story: storyData,
        invitedBy: invitedByData,
        events: eventsData,
      });


      const initialActiveSections: Record<string, boolean> = {};
      [...editorSections, ...mediaSections].forEach(sec => {
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
 
  const handleStatusToggle = (isPublished: boolean) => {
    if (!invitation) return;
    const newStatus = isPublished ? 'PUBLISHED' : 'DRAFT';
    setInvitation(prev => prev ? { ...prev, status: newStatus } : null);
  };
 
  const handleSaveChanges = async () => {
    if (!token || !id) return;
    setIsSaving(true);
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
        body: JSON.stringify({
          title: editableTitle,
          details: cleanedDetails,
          activeSections,
          status: invitation?.status,
          templateId: selectedTemplateId
        }),
      });
      toast.success('Perubahan berhasil disimpan!');
      await fetchAllData();
    } catch (err) {
      toast.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
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
      toast.success('Foto berhasil diunggah!');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah.');
      toast.error(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };


    const handleDeleteFile = async (fileId: string, fileKey: string) => {
    if (!token || !id) return;
    try {
      await fetch(`${API_URL}/files/${id}/${fileId}?fileKey=${encodeURIComponent(fileKey)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Foto berhasil dihapus!');
      await fetchAllData();
    } catch (error) {
      toast.error('Gagal menghapus foto.');
    }
  };




  const handleDeleteInvitation = async () => {
    if (!token || !id) return;
    try {
      await fetch(`${API_URL}/invitations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Undangan berhasil dihapus.');
      handleBackToDashboard();
    } catch (err) {
      toast.error('Gagal menghapus undangan.');
    }
  };
 
  const handleDetailChange = (field: keyof InvitationDetails, value: any) => setDetails(p => ({ ...p, [field]: value }));
 
  const handleNestedChange = (part: 'bride' | 'groom' | 'events' | 'story' | 'gifts' | 'invitedBy', index: number, field: string, value: any) => {
    setDetails(prev => {
      const list = (prev[part] as any[] | undefined) || [];
      const newList = [...list];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [part]: newList };
    });
  };


  const handleCoupleChange = (part: 'bride' | 'groom', field: keyof Omit<CoupleDetails, 'socials'>, value: any) => {
    setDetails(prev => ({
      ...prev,
      [part]: { ...(prev[part] as CoupleDetails), [field]: value }
    }));
  };
 
  const handleSocialChange = (part: 'bride' | 'groom', socialField: keyof SocialMedia, value: string) => {
    setDetails(prev => ({
      ...prev,
      [part]: {
        ...(prev[part] as CoupleDetails),
        socials: {
          ...(prev[part] as CoupleDetails).socials,
          [socialField]: value,
        }
      }
    }));
  };


  const addListItem = (part: keyof InvitationDetails, newItem: any) => setDetails(p => ({ ...p, [part]: [...(p[part] as any[] || []), newItem] }));
  const removeListItem = (part: keyof InvitationDetails, indexToRemove: number) => {
    setDetails(prev => {
      const list = (prev[part] as any[] | undefined) || [];
      if ((part === 'story' || part === 'invitedBy' || part === 'events') && list.length <= 1) return prev;
      if (part === 'gifts' && list.length < 1) return prev;
      return { ...prev, [part]: list.filter((_, index) => index !== indexToRemove) };
    });
  };
  const handleToggleSection = (id: string) => setActiveSections(p => ({ ...p, [id]: !p[id] }));


  if (isLoading || isAuthLoading || !invitation) {
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    return <div className="p-10 text-center flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
 
  const { slug, status, coverImageUrl, viewCount, rsvpCount, wishCount, createdAt, packageName, expiresAt } = invitation;
  const currentlySelectedTemplateName = allTemplates.find(t => t.id === selectedTemplateId)?.name;
  const fullInvitationLink = `${BASE_URL}/u/${slug}`;
  const isPublished = status === 'PUBLISHED';
 
  const hasPremiumPackage = invitation.packageName === 'Premium';
  const availableTemplates = allTemplates.filter(template => {
    if (hasPremiumPackage) {
      return true;
    }
    return template.category !== 'PREMIUM';
  });


  const userAddOnCodes = invitation.addOns?.map(a => a.addOn.code) || [];


  const renderEditorContent = () => {
    switch (activeEditor) {
      case 'story':
        return (
          <div className="space-y-4">
            {details.story?.map((storyPart, index) => (
              <div key={index} className="relative rounded-md border p-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('story', index)} className="absolute top-2 right-2 h-6 w-6 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                <div className="space-y-2"><Label>Judul</Label><Input value={storyPart.title} onChange={(e) => handleNestedChange('story', index, 'title', e.target.value)} /></div>
                <div className="mt-4 space-y-2"><Label>Konten</Label><Textarea value={storyPart.content} onChange={(e) => handleNestedChange('story', index, 'content', e.target.value)} rows={5}/></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('story', {title: '', content: ''})}><PlusCircle className="h-4 w-4 mr-2" /> Tambah Cerita</Button>
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
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('invitedBy', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('invitedBy', '')}><PlusCircle className="h-4 w-4 mr-2" /> Tambah Nama</Button>
          </div>
        );
      case 'gifts':
          return (
          <div className="space-y-4">
            {details.gifts?.map((gift, index) => (
              <div key={index} className="relative rounded-md border p-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('gifts', index)} className="absolute top-2 right-2 h-6 w-6 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Tipe</Label><Select value={gift.type} onValueChange={(value) => handleNestedChange('gifts', index, 'type', value as any)}><SelectTrigger><SelectValue placeholder="Pilih Tipe"/></SelectTrigger><SelectContent><SelectItem value="Bank">Bank</SelectItem><SelectItem value="E-Wallet">E-Wallet</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Nama {gift.type}</Label><Input value={gift.name} onChange={(e) => handleNestedChange('gifts', index, 'name', e.target.value)} placeholder={`Contoh: BCA / GoPay`}/></div>
                </div>
                <div className="mt-4 space-y-2"><Label>Nomor Rekening/Telepon</Label><Input value={gift.accountNumber} onChange={(e) => handleNestedChange('gifts', index, 'accountNumber', e.target.value)} placeholder={`Contoh: 1234567890`}/></div>
                <div className="mt-4 space-y-2"><Label>Atas Nama</Label><Input value={gift.accountHolder} onChange={(e) => handleNestedChange('gifts', index, 'accountHolder', e.target.value)} placeholder="Contoh: Nama Pemilik"/></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('gifts', {type: 'Bank', name: '', accountNumber: '', accountHolder: ''})}><PlusCircle className="h-4 w-4 mr-2" /> Tambah Akun</Button>
          </div>
          );
      default: return null;
    }
  };
 
  const currentEditorTitle = [...editorSections, ...mediaSections].find(s => s.id === activeEditor)?.label || 'Edit';


  return (
    <div className="w-full">
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
                <Badge variant={isPublished ? "success" : "secondary"}>
                    {isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Switch checked={isPublished} onCheckedChange={handleStatusToggle} />
            </div>
        </CardHeader>
        <CardContent className="p-4 md:p-0">
          <div className="flex flex-col md:flex-row">
            <div className="flex-shrink-0 w-full md:w-56 md:p-4">
              <div className="aspect-[9/16] md:aspect-auto md:h-72 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={coverImageUrl || 'https://placehold.co/400x600/EEE/333?text=No+Cover'}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4">
              <div>
                <h2 className="text-2xl mb-1 font-bold">{editableTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{details.events?.[0]?.location || 'Lokasi Belum Diatur'} • Dibuat {new Date(createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-slate-100 rounded-lg p-3">
                  <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xl font-bold">{viewCount}</div>
                  <div className="text-xs text-muted-foreground">Pengunjung</div>
                </div>
                <div className="text-center bg-slate-100 rounded-lg p-3">
                  <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xl font-bold">{wishCount}</div>
                  <div className="text-xs text-muted-foreground">Ucapan</div>
                </div>
                <div className="text-center bg-slate-100 rounded-lg p-3">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xl font-bold">{rsvpCount}</div>
                  <div className="text-xs text-muted-foreground">RSVP</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none" onClick={() => { navigator.clipboard.writeText(fullInvitationLink); toast.success('Link disalin!'); }}>
                  <Share2 className="h-4 w-4 mr-2" /> Bagikan
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                  <a href={fullInvitationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Lihat
                  </a>
                </Button>
                <div className="flex gap-2 flex-1">
                  <Input value={fullInvitationLink} readOnly className="text-sm flex-1"/>
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(fullInvitationLink); toast.success('Link disalin!'); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="konten"><BookText className="h-4 w-4 mr-2"/>Konten</TabsTrigger>
            <TabsTrigger value="tema"><Palette className="h-4 w-4 mr-2"/>Tema</TabsTrigger>
          <TabsTrigger value="media"><ImageIcon className="h-4 w-4 mr-2"/>Media</TabsTrigger>
            <TabsTrigger value="rsvp"><Users className="h-4 w-4 mr-2"/>RSVP</TabsTrigger>
          <TabsTrigger value="pengaturan"><Settings className="h-4 w-4 mr-2"/>Pengaturan</TabsTrigger>
        </TabsList>
         
          <TabsContent value="konten">
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Umum</CardTitle>
                <CardDescription>Detail dasar undangan Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className="space-y-2">
                    <Label>Judul Undangan</Label>
                    <Input value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} placeholder="Contoh: The Wedding of Rina & Budi" />
                  </div>
                  <div className="space-y-2">
                    <Label>Paket Aktif</Label>
                    <Input value={packageName || 'N/A'} disabled />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>Tema Digunakan</Label>
                    <Input value={currentlySelectedTemplateName || 'Belum dipilih'} disabled />
                  </div>
              </CardContent>
            </Card>


              <Card>
                <CardHeader><CardTitle>Data Mempelai</CardTitle><CardDescription>Informasi lengkap mempelai wanita dan pria</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4 rounded-lg border p-4 bg-pink-50/50">
                      <h3 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-pink-500" />Mempelai Wanita</h3>
                          <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={details.bride?.name || ''} onChange={(e) => handleCoupleChange('bride', 'name', e.target.value)} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Inisial</Label><Input value={details.bride?.initial || ''} onChange={(e) => handleCoupleChange('bride', 'initial', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Panggilan</Label><Input value={details.bride?.nickname || ''} onChange={(e) => handleCoupleChange('bride', 'nickname', e.target.value)} /></div>
                          </div>
                          <div className="space-y-2"><Label>Anak Ke-</Label><Input value={details.bride?.childOrder || ''} onChange={(e) => handleCoupleChange('bride', 'childOrder', e.target.value)} placeholder="Anak pertama dari 2 bersaudara"/></div>
                        <div className="space-y-2"><Label>Nama Ayah</Label><Input value={details.bride?.father || ''} onChange={(e) => handleCoupleChange('bride', 'father', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Nama Ibu</Label><Input value={details.bride?.mother || ''} onChange={(e) => handleCoupleChange('bride', 'mother', e.target.value)} /></div>
                          <Separator/>
                          <h4 className="font-medium text-sm">Sosial Media</h4>
                          <div className="space-y-2"><Label>Facebook</Label><Input value={details.bride?.socials?.facebook || ''} onChange={(e) => handleSocialChange('bride', 'facebook', e.target.value)} placeholder="URL profil Facebook"/></div>
                          <div className="space-y-2"><Label>Instagram</Label><Input value={details.bride?.socials?.instagram || ''} onChange={(e) => handleSocialChange('bride', 'instagram', e.target.value)} placeholder="URL profil Instagram"/></div>
                          <div className="space-y-2"><Label>TikTok</Label><Input value={details.bride?.socials?.tiktok || ''} onChange={(e) => handleSocialChange('bride', 'tiktok', e.target.value)} placeholder="URL profil TikTok"/></div>
                    </div>
                    <div className="space-y-4 rounded-lg border p-4 bg-blue-50/50">
                      <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" />Mempelai Pria</h3>
                          <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={details.groom?.name || ''} onChange={(e) => handleCoupleChange('groom', 'name', e.target.value)} /></div>
                           <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Inisial</Label><Input value={details.groom?.initial || ''} onChange={(e) => handleCoupleChange('groom', 'initial', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Panggilan</Label><Input value={details.groom?.nickname || ''} onChange={(e) => handleCoupleChange('groom', 'nickname', e.target.value)} /></div>
                          </div>
                          <div className="space-y-2"><Label>Anak Ke-</Label><Input value={details.groom?.childOrder || ''} onChange={(e) => handleCoupleChange('groom', 'childOrder', e.target.value)} placeholder="Anak kedua dari 3 bersaudara"/></div>
                        <div className="space-y-2"><Label>Nama Ayah</Label><Input value={details.groom?.father || ''} onChange={(e) => handleCoupleChange('groom', 'father', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Nama Ibu</Label><Input value={details.groom?.mother || ''} onChange={(e) => handleCoupleChange('groom', 'mother', e.target.value)} /></div>
                          <Separator/>
                          <h4 className="font-medium text-sm">Sosial Media</h4>
                          <div className="space-y-2"><Label>Facebook</Label><Input value={details.groom?.socials?.facebook || ''} onChange={(e) => handleSocialChange('groom', 'facebook', e.target.value)} placeholder="URL profil Facebook"/></div>
                          <div className="space-y-2"><Label>Instagram</Label><Input value={details.groom?.socials?.instagram || ''} onChange={(e) => handleSocialChange('groom', 'instagram', e.target.value)} placeholder="URL profil Instagram"/></div>
                          <div className="space-y-2"><Label>TikTok</Label><Input value={details.groom?.socials?.tiktok || ''} onChange={(e) => handleSocialChange('groom', 'tiktok', e.target.value)} placeholder="URL profil TikTok"/></div>
                    </div>
                  </div>
                </CardContent>
                </Card>
               
                <Card>
                  <CardHeader><CardTitle>Jadwal Acara</CardTitle><CardDescription>Detail waktu dan lokasi acara pernikahan</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    {details.events?.map((event, index) => (
                      <div key={index} className="relative space-y-4 rounded-lg border p-4 bg-slate-50">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('events', index)} className="absolute top-2 right-2 h-6 w-6 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label>Nama Acara</Label><Input value={event.name} onChange={(e) => handleNestedChange('events', index, 'name', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Tanggal & Waktu</Label><Input type="datetime-local" value={event.date ? event.date.substring(0, 16) : ''} onChange={(e) => handleNestedChange('events', index, 'date', e.target.value)} /></div>
                        </div>
                        <div className="space-y-2"><Label>Lokasi</Label><Input value={event.location} onChange={(e) => handleNestedChange('events', index, 'location', e.target.value)} /></div>
                        <div className="space-y-2"><Label>URL Google Maps</Label><Input value={event.googleMapsUrl || ''} onChange={(e) => handleNestedChange('events', index, 'googleMapsUrl', e.target.value)} placeholder="https://maps.app.goo.gl/..." /></div>
                      </div>
                    ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem('events', {name: '', date: '', location: '', googleMapsUrl: ''})}><PlusCircle className="h-4 w-4 mr-2" /> Tambah Acara</Button>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>
         
          <TabsContent value="tema">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Tema Undangan</CardTitle>
                <CardDescription>Pilih desain yang paling sesuai dengan gaya pernikahan Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {availableTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer group ${selectedTemplateId === template.id ? 'border-orange-500' : 'border-transparent'}`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <img src={template.previewUrl || 'https://placehold.co/400x600/EEE/333?text=Tema'} alt={template.name} className="w-full h-full object-cover aspect-[9/16]"/>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-semibold text-center text-xs">{template.name}</p>
                      </div>
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-orange-500 p-1 rounded-full text-white">
                          <CheckCircle2 className="h-4 w-4"/>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {availableTemplates.length === 0 && (
                  <p className='text-center text-muted-foreground'>Tidak ada tema yang tersedia untuk paket Anda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="media">
            {/* --- KONTEN MEDIA DIPINDAHKAN DARI TAB KONTEN UTAMA --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Card untuk Foto Sampul */}
                <Card className="bg-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Foto Sampul</CardTitle>
                    <CardDescription className="text-xs">Foto utama yang tampil saat undangan dibuka.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={coverImageUrl || 'https://placehold.co/400x600/EEE/333?text=Cover'}
                        alt="Pratinjau Foto Sampul"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {uploadError && <p className="text-sm text-red-500 text-center">{uploadError}</p>}
                    <Label htmlFor="cover-upload" className={`w-full ${isUploading ? 'cursor-not-allowed' : ''}`}>
                      <Button asChild className="w-full" variant="outline" disabled={isUploading}>
                        <div>
                          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          {isUploading ? 'Mengunggah...' : 'Unggah Foto Sampul Baru'}
                        </div>
                      </Button>
                    </Label>
                    <Input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={isUploading}/>
                  </CardContent>
                </Card>


                {/* Card untuk Video */}
                 <Card className="bg-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Video YouTube</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="videoUrl">URL Video YouTube</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={details.videoUrl || ''}
                      onChange={(e) => handleDetailChange('videoUrl', e.target.value)}
                    />
                  </CardContent>
                </Card>
                 {/* Card untuk Musik Latar */}
                <Card className="bg-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Musik Latar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                      <Label htmlFor="musicUrl">URL Musik Latar (MP3)</Label>
                      <Input
                        id="musicUrl"
                        placeholder="https://.../lagu-pernikahan.mp3"
                        value={details.musicUrl || ''}
                        onChange={(e) => handleDetailChange('musicUrl', e.target.value)}
                      />
                  </CardContent>
                </Card>
              </div>


              {/* Card untuk Galeri Foto */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Galeri Foto</CardTitle>
                    <CardDescription className="text-xs">Unggah beberapa foto untuk ditampilkan di galeri.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {files.map(file => (
                        <div key={file.id} className="relative group aspect-square">
                          <img src={file.presignedUrl} alt="Gallery photo" className="w-full h-full object-cover rounded-md" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteFile(file.id, file.fileKey)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Label htmlFor="gallery-upload" className={`w-full ${isUploading ? 'cursor-not-allowed' : ''}`}>
                      <Button asChild className="w-full" variant="secondary" disabled={isUploading}>
                        <div>
                          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                          {isUploading ? 'Mengunggah...' : 'Tambah Foto Galeri'}
                        </div>
                      </Button>
                    </Label>
                    <Input id="gallery-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)} disabled={isUploading}/>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          {/* --- KONTEN TAB RSVP BARU --- */}
          <TabsContent value="rsvp">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Konfirmasi Kehadiran</CardTitle>
                <CardDescription>Lihat siapa saja tamu yang telah memberikan respons pada undangan Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pesan</TableHead>
                      <TableHead className="text-right">Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rsvps.length > 0 ? (
                      rsvps.map((rsvp) => (
                        <TableRow key={rsvp.id}>
                          <TableCell className="font-medium">{rsvp.name}</TableCell>
                          <TableCell>
                            <Badge variant={rsvp.status === 'ATTENDING' ? 'success' : 'destructive'}>
                              {rsvp.status === 'ATTENDING' ? 'Hadir' : 'Berhalangan'}
                            </Badge>
                          </TableCell>
                          <TableCell>{rsvp.message || '-'}</TableCell>
                          <TableCell className="text-right">{new Date(rsvp.createdAt).toLocaleDateString('id-ID')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Belum ada tamu yang melakukan konfirmasi.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           
            <TabsContent value="pengaturan">
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Tampilan Bagian</CardTitle>
                    <CardDescription>Aktifkan atau nonaktifkan bagian yang akan tampil di undangan publik Anda.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...editorSections, ...mediaSections].map((section) => {
                    const Icon = section.icon;
                    const isEnabled = activeSections[section.id] ?? true;
                   
                    const isClickable = isEnabled && editorSections.some(es => es.id === section.id);




                    return (
                        <Card
                        key={section.id}
                        className={`flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${!isEnabled && 'opacity-50 bg-slate-50'} ${isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-default'}`}
                        onClick={() => isClickable && setActiveEditor(section.id)}
                        >
                        <div className={`p-3 rounded-full ${section.color} bg-opacity-10 mb-2`}>
                            <Icon className={`h-6 w-6 ${section.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{section.label}</h3>
                       
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggleSection(section.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        </Card>
                    );
                    })}
                </CardContent>
                </Card>
            <Card>
              <CardHeader>
                  <CardTitle>Toko Add-On</CardTitle>
                  <CardDescription>Tingkatkan fitur undangan Anda dengan membeli add-on tambahan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {allAddOns.map(addOn => {
                    const isOwned = userAddOnCodes.includes(addOn.code);
                    return (
                      <div key={addOn.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <h4 className="font-semibold">{addOn.name}</h4>
                          <p className="text-sm text-muted-foreground">{addOn.description}</p>
                          <p className="text-sm font-medium mt-1">Rp {addOn.price.toLocaleString('id-ID')}</p>
                        </div>
                        {isOwned ? (
                          <Badge variant="success">Sudah Dimiliki</Badge>
                        ) : (
                          <Button size="sm">Beli</Button>
                        )}
                      </div>
                    )
                  })}
                  {allAddOns.length === 0 && (
                     <p className='text-center text-muted-foreground'>Tidak ada add-on yang tersedia saat ini.</p>
                  )}
              </CardContent>
            </Card>
            <Card className="border-red-500 bg-red-50/50">
              <CardHeader><CardTitle className="text-red-600">Zona Berbahaya</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <p className="font-semibold">Hapus Undangan Ini</p>
                  <p className="text-sm text-muted-foreground">Tindakan ini tidak dapat diurungkan.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive">Hapus Undangan</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus undangan "{invitation?.title}" secara permanen.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteInvitation}>Ya, Hapus</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>

        <div className="sticky bottom-4 mt-8 flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving} className="shadow-lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Semua Perubahan
        </Button>
        </div>

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





