// Fungsi helper untuk membuka WhatsApp
export const openWhatsApp = (message: string = '') => {
  const phoneNumber = '6281234567890'; // GANTI DENGAN NOMOR WA ANDA
  const defaultMessage = message || 'Halo Mimdi, saya tertarik untuk membuat undangan digital. Mohon info lebih lanjut.';
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

export const openWhatsAppOrder = (packageName?: string) => {
  const message = packageName 
    ? `Halo Mimdi, saya tertarik untuk memesan paket ${packageName}. Mohon info lebih lanjut.`
    : 'Halo Mimdi, saya tertarik untuk membuat undangan digital.';
  
  openWhatsApp(message);
};

export const openWhatsAppConsultation = () => {
  const message = 'Halo Mimdi, saya ingin konsultasi gratis mengenai undangan digital untuk acara saya.';
  openWhatsApp(message);
};
