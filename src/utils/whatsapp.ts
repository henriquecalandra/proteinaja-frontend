// Monta link click-to-chat do WhatsApp (wa.me) com mensagem url-encoded.
export function montarLinkWhatsapp(whatsapp: string, mensagem: string): string {
  const numero = (whatsapp || '').replace(/\D/g, '');
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${numero}?text=${texto}`;
}

export function abrirWhatsapp(whatsapp: string, mensagem: string): void {
  window.open(montarLinkWhatsapp(whatsapp, mensagem), '_blank', 'noopener,noreferrer');
}
