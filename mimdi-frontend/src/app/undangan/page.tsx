// Halaman ini adalah landing page khusus untuk layanan Undangan Digital.
// URL: mimdi.id/undangan

export default function InvitationLandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Mimdi Invitation
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Bagikan momen bersama dengan undangan digital yang elegan dan praktis.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/login"
            className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Masuk
          </a>
          <a href="/register" className="text-sm font-semibold leading-6 text-slate-900">
            Daftar Gratis <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
