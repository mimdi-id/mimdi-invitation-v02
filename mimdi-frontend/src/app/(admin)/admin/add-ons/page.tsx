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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddOn = {
  id: string;
  name: string;
  price: number;
  code: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminAddOnsPage() {
  const { token } = useAuth();
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    code: '',
  });

  const fetchAddOns = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/add-ons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil daftar add-on.');
      const data: AddOn[] = await response.json();
      setAddOns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddOns();
  }, [token]);
  
  const handleOpenDialog = (addOn: AddOn | null) => {
    setEditingAddOn(addOn);
    if (addOn) {
      // Mode Edit
      setFormData({
        name: addOn.name,
        price: addOn.price,
        code: addOn.code,
      });
    } else {
      // Mode Buat Baru
      setFormData({ name: '', price: 0, code: '' });
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload = { ...formData };
    const url = editingAddOn
      ? `${API_URL}/admin/add-ons/${editingAddOn.id}`
      : `${API_URL}/admin/add-ons`;
    const method = editingAddOn ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan add-on.');
      }
      
      setIsDialogOpen(false);
      fetchAddOns(); // Muat ulang data setelah berhasil
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manajemen Add-On</CardTitle>
          <CardDescription>Tambah atau edit fitur tambahan yang bisa dibeli klien.</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog(null)}>+ Tambah Add-On</Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Add-On</TableHead>
              <TableHead>Kode Unik</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell></TableRow>
            ) : addOns.map((addOn) => (
              <TableRow key={addOn.id}>
                <TableCell className="font-medium">{addOn.name}</TableCell>
                <TableCell><code>{addOn.code}</code></TableCell>
                <TableCell>Rp {addOn.price.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(addOn)}>
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
            <DialogTitle>{editingAddOn ? 'Edit Add-On' : 'Buat Add-On Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nama</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Kode</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_')})} className="col-span-3" placeholder="misal: REMOVE_WATERMARK" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Harga (Rp)</Label>
              <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="col-span-3" required />
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
