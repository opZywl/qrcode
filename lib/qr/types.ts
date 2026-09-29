export const CONTENT_TYPES = [
  "url",
  "wifi",
  "whatsapp",
  "whatsappGroup",
  "phone",
  "vcard",
  "vevent",
  "email",
  "sms",
  "geo",
  "pix",
  "appstore",
  "spotify",
  "zoom",
  "menu",
  "cupom",
] as const

export type TipoConteudoQR = (typeof CONTENT_TYPES)[number]

export const ERROR_LEVELS = ["L", "M", "Q", "H"] as const
export type NivelCorrecaoErro = (typeof ERROR_LEVELS)[number]

export const WIFI_ENCRYPTIONS = ["WPA", "WEP", "nopass"] as const
export type TipoEncriptacaoWifi = (typeof WIFI_ENCRYPTIONS)[number]

export const FRAME_TYPES = [
  "none",
  "textBottom",
  "scanMeBottom",
  "simpleBorder",
  "roundedBorderTextBottom",
  "topBottomText",
  "decorativeBorder",
  "modernFrame",
  "classicFrame",
] as const
export type TipoFrame = (typeof FRAME_TYPES)[number]

export const FRAMES_WITH_CUSTOM_TEXT: readonly TipoFrame[] = [
  "textBottom",
  "roundedBorderTextBottom",
  "topBottomText",
  "decorativeBorder",
]

export const FRAMES_WITH_TEXT_AREA: readonly TipoFrame[] = [
  "textBottom",
  "scanMeBottom",
  "roundedBorderTextBottom",
  "topBottomText",
]

export const APPSTORE_PLATFORMS = ["ios", "android", "ambos"] as const
export type AppstorePlataforma = (typeof APPSTORE_PLATFORMS)[number]

export const MEDIA_TYPES = ["track", "album", "playlist", "artist", "youtube"] as const
export type SpotifyTipo = (typeof MEDIA_TYPES)[number]

export const MEETING_TYPES = ["zoom", "meet", "teams"] as const
export type ZoomTipo = (typeof MEETING_TYPES)[number]

export const COUPON_TYPES = ["desconto", "frete", "produto"] as const
export type CupomTipo = (typeof COUPON_TYPES)[number]

export const ACCORDION_SECTIONS = ["appearance", "logo", "background", "frame", "templates"] as const

export const DEFAULT_VISIBLE_TYPES: TipoConteudoQR[] = [
  "url",
  "wifi",
  "whatsapp",
  "whatsappGroup",
  "phone",
  "vcard",
  "vevent",
  "email",
  "sms",
  "geo",
]

export interface QrContentFields {
  inputUrl: string
  wifiSsid: string
  wifiSenha: string
  wifiEncriptacao: TipoEncriptacaoWifi
  wifiOculto: boolean
  vcardNome: string
  vcardSobrenome: string
  vcardOrganizacao: string
  vcardTitulo: string
  vcardTelefone: string
  vcardEmail: string
  vcardWebsite: string
  vcardEndereco: string
  vcardCidade: string
  vcardEstado: string
  vcardCep: string
  vcardPais: string
  veventResumo: string
  veventDescricao: string
  veventLocalizacao: string
  veventDataInicio: string
  veventHoraInicio: string
  veventDataFim: string
  veventHoraFim: string
  veventDiaTodo: boolean
  emailPara: string
  emailAssunto: string
  emailCorpo: string
  smsPara: string
  smsCorpo: string
  geoLatitude: string
  geoLongitude: string
  whatsappPara: string
  whatsappMensagem: string
  whatsappGroupLink: string
  whatsappGroupMensagem: string
  telefonePara: string
  pixChave: string
  pixNome: string
  pixCidade: string
  pixValor: string
  pixDescricao: string
  appstorePlataforma: AppstorePlataforma
  appstoreIosUrl: string
  appstoreAndroidUrl: string
  appstoreNome: string
  spotifyTipo: SpotifyTipo
  spotifyUrl: string
  spotifyTitulo: string
  spotifyArtista: string
  zoomTipo: ZoomTipo
  zoomUrl: string
  zoomId: string
  zoomSenha: string
  zoomTitulo: string
  menuNome: string
  menuDescricao: string
  menuItens: string
  menuPreco: string
  menuCategoria: string
  cupomCodigo: string
  cupomDescricao: string
  cupomValor: string
  cupomValidade: string
  cupomTipo: CupomTipo
}

export interface QrAppearance {
  corFrente: string
  corFundo: string
  tamanho: number
  nivelCorrecaoErro: NivelCorrecaoErro
  zonaQuieta: number
  logoDataUri: string
  logoTamanhoRatio: number
  escavarLogo: boolean
  imagemFundo: string
  tipoFrameSelecionado: TipoFrame
  textoFrame: string
  habilitarCustomizacaoLogo: boolean
  habilitarCustomizacaoFundo: boolean
  habilitarCustomizacaoFrame: boolean
}

export interface EntradaQRCode extends Partial<QrContentFields> {
  id: string
  tipoConteudo: TipoConteudoQR
  inputOriginal: string
  valorQR: string
  favorite?: boolean
  tags?: string[]
  corFrente: string
  corFundo: string
  tamanho: number
  nivel: NivelCorrecaoErro
  margem: number
  logoDataUri?: string
  logoTamanhoRatio?: number
  escavarLogo?: boolean
  imagemFundo?: string
  timestamp: number
  habilitarCustomizacaoLogo?: boolean
  habilitarCustomizacaoFundo?: boolean
  habilitarCustomizacaoFrame?: boolean
  tipoFrameSelecionado?: TipoFrame
  textoFrame?: string
}

export interface VisualTemplateQRCode {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  corFrente: string
  corFundo: string
  tamanho: number
  nivel: NivelCorrecaoErro
  margem: number
  habilitarCustomizacaoLogo: boolean
  logoDataUri?: string
  logoTamanhoRatio?: number
  escavarLogo?: boolean
  habilitarCustomizacaoFundo: boolean
  imagemFundo?: string
  habilitarCustomizacaoFrame: boolean
  tipoFrameSelecionado?: TipoFrame
  textoFrame?: string
}

export const DEFAULT_APPEARANCE: QrAppearance = {
  corFrente: "#000000",
  corFundo: "#FFFFFF",
  tamanho: 256,
  nivelCorrecaoErro: "H",
  zonaQuieta: 4,
  logoDataUri: "",
  logoTamanhoRatio: 0.2,
  escavarLogo: true,
  imagemFundo: "",
  tipoFrameSelecionado: "none",
  textoFrame: "",
  habilitarCustomizacaoLogo: false,
  habilitarCustomizacaoFundo: false,
  habilitarCustomizacaoFrame: false,
}

export const DEFAULT_CONTENT: QrContentFields = {
  inputUrl: "",
  wifiSsid: "",
  wifiSenha: "",
  wifiEncriptacao: "WPA",
  wifiOculto: false,
  vcardNome: "",
  vcardSobrenome: "",
  vcardOrganizacao: "",
  vcardTitulo: "",
  vcardTelefone: "",
  vcardEmail: "",
  vcardWebsite: "",
  vcardEndereco: "",
  vcardCidade: "",
  vcardEstado: "",
  vcardCep: "",
  vcardPais: "",
  veventResumo: "",
  veventDescricao: "",
  veventLocalizacao: "",
  veventDataInicio: "",
  veventHoraInicio: "",
  veventDataFim: "",
  veventHoraFim: "",
  veventDiaTodo: false,
  emailPara: "",
  emailAssunto: "",
  emailCorpo: "",
  smsPara: "",
  smsCorpo: "",
  geoLatitude: "",
  geoLongitude: "",
  whatsappPara: "",
  whatsappMensagem: "",
  whatsappGroupLink: "",
  whatsappGroupMensagem: "",
  telefonePara: "",
  pixChave: "",
  pixNome: "",
  pixCidade: "",
  pixValor: "",
  pixDescricao: "",
  appstorePlataforma: "ambos",
  appstoreIosUrl: "",
  appstoreAndroidUrl: "",
  appstoreNome: "",
  spotifyTipo: "track",
  spotifyUrl: "",
  spotifyTitulo: "",
  spotifyArtista: "",
  zoomTipo: "zoom",
  zoomUrl: "",
  zoomId: "",
  zoomSenha: "",
  zoomTitulo: "",
  menuNome: "",
  menuDescricao: "",
  menuItens: "",
  menuPreco: "",
  menuCategoria: "",
  cupomCodigo: "",
  cupomDescricao: "",
  cupomValor: "",
  cupomValidade: "",
  cupomTipo: "desconto",
}

export const CONTENT_FIELDS_BY_TYPE: Record<TipoConteudoQR, readonly (keyof QrContentFields)[]> = {
  url: ["inputUrl"],
  wifi: ["wifiSsid", "wifiSenha", "wifiEncriptacao", "wifiOculto"],
  vcard: [
    "vcardNome",
    "vcardSobrenome",
    "vcardOrganizacao",
    "vcardTitulo",
    "vcardTelefone",
    "vcardEmail",
    "vcardWebsite",
    "vcardEndereco",
    "vcardCidade",
    "vcardEstado",
    "vcardCep",
    "vcardPais",
  ],
  vevent: [
    "veventResumo",
    "veventDescricao",
    "veventLocalizacao",
    "veventDataInicio",
    "veventHoraInicio",
    "veventDataFim",
    "veventHoraFim",
    "veventDiaTodo",
  ],
  email: ["emailPara", "emailAssunto", "emailCorpo"],
  sms: ["smsPara", "smsCorpo"],
  geo: ["geoLatitude", "geoLongitude"],
  whatsapp: ["whatsappPara", "whatsappMensagem"],
  whatsappGroup: ["whatsappGroupLink", "whatsappGroupMensagem"],
  phone: ["telefonePara"],
  pix: ["pixChave", "pixNome", "pixCidade", "pixValor", "pixDescricao"],
  appstore: ["appstorePlataforma", "appstoreIosUrl", "appstoreAndroidUrl", "appstoreNome"],
  spotify: ["spotifyTipo", "spotifyUrl", "spotifyTitulo", "spotifyArtista"],
  zoom: ["zoomTipo", "zoomUrl", "zoomId", "zoomSenha", "zoomTitulo"],
  menu: ["menuNome", "menuDescricao", "menuItens", "menuPreco", "menuCategoria"],
  cupom: ["cupomCodigo", "cupomDescricao", "cupomValor", "cupomValidade", "cupomTipo"],
}

export function isContentType(value: unknown): value is TipoConteudoQR {
  return typeof value === "string" && (CONTENT_TYPES as readonly string[]).includes(value)
}

export function pickContentFields(tipo: TipoConteudoQR, source: QrContentFields): Partial<QrContentFields> {
  const picked: Partial<QrContentFields> = {}
  for (const field of CONTENT_FIELDS_BY_TYPE[tipo]) {
    Object.assign(picked, { [field]: source[field] })
  }
  return picked
}

export function contentDefaultsFor(tipo?: TipoConteudoQR): Partial<QrContentFields> {
  if (!tipo) {
    return { ...DEFAULT_CONTENT }
  }
  return pickContentFields(tipo, DEFAULT_CONTENT)
}
