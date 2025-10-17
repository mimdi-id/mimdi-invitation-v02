'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: any;
  isActive: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPackagesPage() {
  const { token } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationDays: 30,
    features: '{}',
    isActive: true,
  });

  const fetchPackages = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil daftar paket.');
      const data: Package[] = await response.json();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [token]);
  
  const handleOpenDialog = (pkg: Package | null) => {
    setEditingPackage(pkg);
    if (pkg) {
      // Mode Edit: isi form dengan data paket
      setFormData({
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        features: JSON.stringify(pkg.features, null, 2), // Format JSON agar mudah dibaca
        isActive: pkg.isActive,
      });
    } else {
      // Mode Buat Baru: reset form
      setFormData({
        name: '', price: 0, durationDays: 30, features: '{\n  "maxPhotos": 0\n}', isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    let parsedFeatures;
    try {
      parsedFeatures = JSON.parse(formData.features);
    } catch (e) {
      alert('Format JSON pada fitur tidak valid.');
      return;
    }

    const payload = { ...formData, features: parsedFeatures };
    const url = editingPackage
      ? `${API_URL}/admin/packages/${editingPackage.id}`
      : `${API_URL}/admin/packages`;
    const method = editingPackage ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan paket.');
      }
      
      setIsDialogOpen(false);
      fetchPackages(); // Muat ulang data setelah berhasil
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manajemen Paket</CardTitle>
          <CardDescription>Tambah, edit, atau nonaktifkan paket yang ditawarkan.</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog(null)}>+ Tambah Paket</Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">Memuat...</TableCell></TableRow>
            ) : packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>Rp {pkg.price.toLocaleString('id-ID')}</TableCell>
                <TableCell>{pkg.durationDays} hari</TableCell>
                <TableCell>
                  <Badge variant={pkg.isActive ? 'default' : 'destructive'}>
                    {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(pkg)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Edit Paket' : 'Buat Paket Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail paket di bawah ini. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nama</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Harga (Rp)</Label>
              <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Durasi (Hari)</Label>
              <Input id="duration" type="number" value={formData.durationDays} onChange={(e) => setFormData({...formData, durationDays: Number(e.target.value)})} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="features" className="text-right">Fitur (JSON)</Label>
              <Textarea id="features" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="col-span-3" rows={5} required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">Aktif</Label>
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} />
            </div>
            <DialogFooter>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
