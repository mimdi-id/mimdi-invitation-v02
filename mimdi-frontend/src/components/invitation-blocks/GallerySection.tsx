// Blok generik untuk menampilkan galeri foto

import { cn } from "@/lib/utils";

type InvitationFile = {
  id: string;
  presignedUrl: string;
};

type GallerySectionProps = {
  files: InvitationFile[];
  className?: string;
};

export function GallerySection({ files, className }: GallerySectionProps) {
  return (
    <section className={cn("my-16", className)}>
      <h3 className="mb-8 text-center text-3xl font-bold">Galeri Foto</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {files.map((file) => (
          <div key={file.id} className="aspect-square">
            <img
              src={file.presignedUrl}
              alt="Foto galeri"
              className="h-full w-full rounded-lg object-cover shadow-md"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
