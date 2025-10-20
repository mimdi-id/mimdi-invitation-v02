'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Eye, 
  FilePlus2, 
  Gift, 
  Share2, 
  Trash2, 
  ExternalLink,
  Mail,
  Edit,
  MoreVertical,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Tipe data untuk undangan
type Invitation = {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  coverImageUrl: string | null;
  userPackage: {
    expiresAt: string;
  } | null;
  template: {
    name: string;
  };
  _count: {
    guests: number;
  };
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper untuk format tanggal
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};


export default function DashboardPage() {
  const { user, isLoading: isAuthLoading, token, refreshUser } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isFetchingInvitations, setIsFetchingInvitations] = useState(true);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);


  useEffect(() => {
    if (user && token) {
      const fetchInvitations = async () => {
        setIsFetchingInvitations(true);
        try {
          const response = await fetch(`${API_URL}/invitations`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data undangan');
          }
          const data: Invitation[] = await response.json();
          setInvitations(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
          toast.error('Gagal Memuat Undangan', { description: errorMessage });
        } finally {
          setIsFetchingInvitations(false);
        }
      };
      fetchInvitations();
    }
  }, [user, token]);

  const openDeleteDialog = (invitation: Invitation) => {
    setInvitationToDelete(invitation);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteInvitation = async () => {
    if (!invitationToDelete || !token) return;

    try {
      const response = await fetch(`${API_URL}/invitations/${invitationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus undangan.');
      }

      toast.success('Undangan Berhasil Dihapus');
      setInvitations(prev => prev.filter(inv => inv.id !== invitationToDelete.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast.error('Gagal Menghapus Undangan', { description: errorMessage });
    } finally {
      setIsDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link Undangan Disalin!', {
      description: 'Anda sekarang dapat membagikan link tersebut.',
    });
  };

  if (isAuthLoading || !user) {
    return <div className="p-10 text-center">Memuat data pengguna...</div>;
  }

  const hasQuota = user.invitationQuota > 0;

  return (
    <>
      <div className="space-y-8">
        {/* --- PERUBAHAN: Menghapus CardHeader dan memindahkan konten ke CardContent --- */}
        <Card>
          <CardContent className="p-6">
            {hasQuota ? (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Kuota Undangan</p>
                  {/* --- PERUBAHAN: Memperbesar ukuran teks angka kuota --- */}
                  <div className="text-5xl font-bold text-primary">{user.invitationQuota}</div>
                </div>
                <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0">
                  <Link href="/user/invitation/create">
                    <FilePlus2 className="mr-2 h-4 w-4" /> Buat Undangan Baru
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold">Kuota Anda habis!</h3>
                  <p className="text-sm text-muted-foreground">
                    Silakan beli paket untuk dapat membuat undangan baru.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/undangan">
                    <Gift className="mr-2 h-4 w-4" /> Beli Paket Baru
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BAGIAN 2: Daftar Undangan */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Undangan Saya</h3>
          {isFetchingInvitations ? (
            <div className="text-center p-10">Memuat undangan...</div>
          ) : invitations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.map((inv) => {
                const startDate = formatDate(inv.createdAt);
                const endDate = inv.userPackage?.expiresAt ? formatDate(inv.userPackage.expiresAt) : 'N/A';
                return (
                  <Link href={`/user/invitation/edit/${inv.id}`} key={inv.id} className="block group">
                    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="relative h-28 w-28 flex-shrink-0">
                           <img 
                            src={inv.coverImageUrl || 'https://placehold.co/300x300/EEE/333?text=No+Cover'} 
                            alt={inv.title}
                            className="h-full w-full rounded-md object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold truncate pr-2">{inv.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 flex-shrink-0 -mr-2 -mt-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuLabel>{inv.title}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/user/invitation/edit/${inv.id}`}><Edit className="mr-2 h-4 w-4" />Kelola</Link>
                                  </DropdownMenuItem>
                                   <DropdownMenuItem asChild>
                                    <Link href={`/u/${inv.slug}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Lihat</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleShare(inv.slug)}>
                                    <Share2 className="mr-2 h-4 w-4" />Bagikan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                   <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={(e) => { e.preventDefault(); openDeleteDialog(inv); }}>
                                     <Trash2 className="mr-2 h-4 w-4" />Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1">
                              Masa Aktif: {startDate} - {endDate}
                           </p>
                           <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <Badge 
                               className={`border-transparent text-xs ${
                                inv.status === 'PUBLISHED'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                               }`}
                             >
                               {inv.status}
                             </Badge>
                             <div className="flex items-center gap-1.5">
                               <Eye className="h-4 w-4" />
                               <span>{inv.viewCount}</span>
                             </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4" />
                                <span>{inv._count.guests}</span>
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">Anda belum memiliki undangan</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasQuota 
                  ? "Gunakan kuota Anda untuk mulai membuat undangan pertama sekarang!"
                  : "Beli paket terlebih dahulu untuk dapat membuat undangan."}
              </p>
            </div>
          )}
        </div>
        
        {user.role === 'CLIENT' && (
          <div>
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                       <div className="bg-white/20 rounded-full p-3">
                           <Users className="h-8 w-8" />
                       </div>
                       <div>
                           <h3 className="text-xl font-bold">Gabung Jadi Mitra!</h3>
                           <p className="text-sm opacity-90">Dapatkan penghasilan tambahan dengan menjual undangan digital.</p>
                       </div>
                    </div>
                    <Button asChild variant="secondary" className="w-full sm:w-auto flex-shrink-0">
                        <Link href="/partners/register">Daftar Jadi Mitra</Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        )}

      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Ini akan menghapus undangan
              "{invitationToDelete?.title}" secara permanen beserta semua datanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvitation}>
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

