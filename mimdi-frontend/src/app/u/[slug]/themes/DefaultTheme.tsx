// Ini adalah komponen tema default, jika tema lain tidak ditemukan

// Tipe data ini sama dengan di KlasikEleganTheme.tsx
type InvitationFile = {
  id: string;
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
};
type Invitation = {
  id: string;
  title: string;
  details: InvitationDetails | null;
  activeSections: Record<string, boolean> | null;
  files: InvitationFile[];
  template: { name: string };
};
type ThemeProps = {
  invitation: Invitation;
};

// Tema default ini akan menampilkan pesan sederhana
export default function DefaultTheme({ invitation }: ThemeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">
          Undangan: {invitation.title}
        </h1>
        <p className="mt-4 text-slate-600">
          Komponen tema untuk "{invitation.template.name}" belum dibuat. Ini adalah tampilan default.
        </p>
      </div>
    </div>
  );
}
