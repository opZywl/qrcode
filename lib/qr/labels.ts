import type { TranslationValue } from "@/lib/i18n"
import type { NivelCorrecaoErro, TipoConteudoQR, TipoFrame } from "./types"

export interface ContentTypeMeta {
  icon: string
  advanced: boolean
  name: TranslationValue
  short: TranslationValue
  description: TranslationValue
}

export const CONTENT_TYPE_META: Record<TipoConteudoQR, ContentTypeMeta> = {
  url: {
    icon: "link",
    advanced: false,
    name: { pt: "URL / Texto", en: "URL / Text", es: "URL / Texto" },
    short: { pt: "URL", en: "URL", es: "URL" },
    description: { pt: "Sites, links e texto", en: "Sites, links and text", es: "Sitios, enlaces y texto" },
  },
  wifi: {
    icon: "wifi",
    advanced: false,
    name: { pt: "Wi-Fi", en: "Wi-Fi", es: "Wi-Fi" },
    short: { pt: "Wi-Fi", en: "Wi-Fi", es: "Wi-Fi" },
    description: { pt: "Rede e senha", en: "Network and password", es: "Red y contraseña" },
  },
  whatsapp: {
    icon: "whatsapp",
    advanced: false,
    name: { pt: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
    short: { pt: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
    description: { pt: "Contato direto", en: "Direct contact", es: "Contacto directo" },
  },
  whatsappGroup: {
    icon: "group",
    advanced: false,
    name: { pt: "Grupo WhatsApp", en: "WhatsApp group", es: "Grupo de WhatsApp" },
    short: { pt: "Grupo", en: "Group", es: "Grupo" },
    description: { pt: "Link de grupo", en: "Group invite link", es: "Enlace de grupo" },
  },
  phone: {
    icon: "phone",
    advanced: false,
    name: { pt: "Telefone", en: "Phone", es: "Teléfono" },
    short: { pt: "Telefone", en: "Phone", es: "Teléfono" },
    description: { pt: "Chamada rápida", en: "Quick call", es: "Llamada rápida" },
  },
  vcard: {
    icon: "user",
    advanced: false,
    name: { pt: "Contato", en: "Contact", es: "Contacto" },
    short: { pt: "Contato", en: "Contact", es: "Contacto" },
    description: { pt: "Cartão virtual", en: "Digital card", es: "Tarjeta digital" },
  },
  vevent: {
    icon: "calendar",
    advanced: false,
    name: { pt: "Evento", en: "Event", es: "Evento" },
    short: { pt: "Evento", en: "Event", es: "Evento" },
    description: { pt: "Agenda e data", en: "Schedule and date", es: "Agenda y fecha" },
  },
  email: {
    icon: "email",
    advanced: false,
    name: { pt: "Email", en: "Email", es: "Correo" },
    short: { pt: "Email", en: "Email", es: "Correo" },
    description: { pt: "Mensagem pronta", en: "Pre-filled message", es: "Mensaje listo" },
  },
  sms: {
    icon: "sms",
    advanced: false,
    name: { pt: "SMS", en: "SMS", es: "SMS" },
    short: { pt: "SMS", en: "SMS", es: "SMS" },
    description: { pt: "Texto curto", en: "Short text", es: "Texto corto" },
  },
  geo: {
    icon: "geo",
    advanced: false,
    name: { pt: "Localização", en: "Location", es: "Ubicación" },
    short: { pt: "Local", en: "Location", es: "Ubicación" },
    description: { pt: "Latitude e longitude", en: "Latitude and longitude", es: "Latitud y longitud" },
  },
  pix: {
    icon: "pix",
    advanced: true,
    name: { pt: "PIX", en: "PIX", es: "PIX" },
    short: { pt: "PIX", en: "PIX", es: "PIX" },
    description: { pt: "Pagamento", en: "Payment", es: "Pago" },
  },
  appstore: {
    icon: "app",
    advanced: true,
    name: { pt: "App Store", en: "App Store", es: "App Store" },
    short: { pt: "App", en: "App", es: "App" },
    description: { pt: "iOS e Android", en: "iOS and Android", es: "iOS y Android" },
  },
  spotify: {
    icon: "media",
    advanced: true,
    name: { pt: "Música/Vídeo", en: "Music/Video", es: "Música/Vídeo" },
    short: { pt: "Mídia", en: "Media", es: "Medios" },
    description: { pt: "Música e vídeo", en: "Music and video", es: "Música y vídeo" },
  },
  zoom: {
    icon: "video",
    advanced: true,
    name: { pt: "Videochamada", en: "Video call", es: "Videollamada" },
    short: { pt: "Chamada", en: "Meeting", es: "Reunión" },
    description: { pt: "Reuniões online", en: "Online meetings", es: "Reuniones en línea" },
  },
  menu: {
    icon: "menu",
    advanced: true,
    name: { pt: "Menu", en: "Menu", es: "Menú" },
    short: { pt: "Menu", en: "Menu", es: "Menú" },
    description: { pt: "Catálogo e cardápio", en: "Catalog and menu", es: "Catálogo y carta" },
  },
  cupom: {
    icon: "coupon",
    advanced: true,
    name: { pt: "Cupom", en: "Coupon", es: "Cupón" },
    short: { pt: "Cupom", en: "Coupon", es: "Cupón" },
    description: { pt: "Código promocional", en: "Promo code", es: "Código promocional" },
  },
}

export const ERROR_LEVEL_LABELS: Record<NivelCorrecaoErro, TranslationValue> = {
  L: { pt: "Baixo (~7%)", en: "Low (~7%)", es: "Bajo (~7%)" },
  M: { pt: "Médio (~15%)", en: "Medium (~15%)", es: "Medio (~15%)" },
  Q: { pt: "Alto (~25%)", en: "High (~25%)", es: "Alto (~25%)" },
  H: { pt: "Muito alto (~30%)", en: "Very high (~30%)", es: "Muy alto (~30%)" },
}

export const FRAME_LABELS: Record<TipoFrame, TranslationValue> = {
  none: { pt: "Nenhuma", en: "None", es: "Ninguno" },
  simpleBorder: { pt: "Borda simples", en: "Simple border", es: "Borde simple" },
  textBottom: { pt: "Texto inferior", en: "Bottom text", es: "Texto inferior" },
  scanMeBottom: { pt: "Scan me", en: "Scan me", es: "Scan me" },
  roundedBorderTextBottom: {
    pt: "Borda arredondada com texto",
    en: "Rounded border with text",
    es: "Borde redondeado con texto",
  },
  topBottomText: { pt: "Texto superior e inferior", en: "Top and bottom text", es: "Texto superior e inferior" },
  decorativeBorder: { pt: "Bordas decorativas", en: "Decorative corners", es: "Esquinas decorativas" },
  modernFrame: { pt: "Moldura moderna", en: "Modern frame", es: "Marco moderno" },
  classicFrame: { pt: "Moldura clássica", en: "Classic frame", es: "Marco clásico" },
}
