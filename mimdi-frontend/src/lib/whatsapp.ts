/**
 * Fungsi dasar untuk membuat link WhatsApp "wa.me".
 * Fungsi ini adalah "pure function", hanya mengembalikan string URL,
 * sehingga bisa digunakan di mana saja (misal: href pada tag <a>).
 * @param phone Nomor telepon tujuan (format internasional tanpa '+', misal: 6281234567890)
 * @param message Pesan yang ingin dikirim
 * @returns URL lengkap untuk link WhatsApp
 */
export const createWhatsAppLink = (phone: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * Fungsi helper spesifik untuk MEMBUKA tab baru ke WhatsApp.
 * Fungsi ini memiliki "side effect" (window.open) dan cocok untuk event onClick.
 * @param message Pesan yang ingin dikirim (opsional)
 */
export const openWhatsApp = (message: string = '') => {
  const phoneNumber = '6285242195923'; // --- GANTI DENGAN NOMOR WA ADMIN ---
  const defaultMessage =
    message ||
    'Halo Mimdi, saya tertarik untuk membuat undangan digital. Mohon info lebih lanjut.';
  
  // Menggunakan fungsi dasar createWhatsAppLink
  const whatsappUrl = createWhatsAppLink(phoneNumber, defaultMessage);

  window.open(whatsappUrl, '_blank');
};

/**
 * Membuka WhatsApp dengan pesan pre-filled untuk memesan paket tertentu.
 * @param packageName Nama paket yang dipesan (opsional)
 */
export const openWhatsAppOrder = (packageName?: string) => {
  const message = packageName
    ? `Halo Mimdi, saya tertarik untuk memesan paket ${packageName}. Mohon info lebih lanjut.`
    : 'Halo Mimdi, saya tertarik untuk membuat undangan digital.';

  openWhatsApp(message);
};

/**
 * Membuka WhatsApp dengan pesan pre-filled untuk konsultasi.
 */
export const openWhatsAppConsultation = () => {
  const message =
    'Halo Mimdi, saya ingin konsultasi gratis mengenai undangan digital untuk acara saya.';
  openWhatsApp(message);
};

