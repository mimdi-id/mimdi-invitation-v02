import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Panduan Pengguna</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Temukan jawaban dan panduan untuk menggunakan platform Mimdi Invitation.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Konten Panduan</CardTitle>
                <CardDescription>
                    Halaman ini masih dalam pengembangan. Konten panduan lengkap akan segera tersedia.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                        Panduan penggunaan, tips & trik, serta video tutorial akan ditambahkan di sini.
                    </p>
                </div>
            </CardContent>
        </Card>
        
        <div className="text-center">
             <Button asChild>
                <Link href="/user/dashboard">Kembali ke Dashboard</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
