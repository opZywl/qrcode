import { detectPixKey } from "./pix"
import {
  CONTENT_TYPES,
  ERROR_LEVELS,
  FRAME_TYPES,
  type EntradaQRCode,
  type NivelCorrecaoErro,
  type TipoConteudoQR,
  type TipoFrame,
} from "./types"
import { LANGUAGES, type AppLanguage } from "@/lib/i18n"

export interface QrEventPayload {
  tipo: TipoConteudoQR
  resumo: string
  tamanho: number
  nivel: NivelCorrecaoErro
  margem: number
  corFrente: string
  corFundo: string
  logo: boolean
  fundo: boolean
  moldura: TipoFrame
  textoMoldura: string
  idioma: AppLanguage
  dispositivo: "mobile" | "desktop"
}

const MAX_SUMMARY = 200
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i

function truncate(value: string, max = MAX_SUMMARY): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim()
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

function maskDigits(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.length <= 4) {
    return "•".repeat(digits.length)
  }
  return `${value.trim().startsWith("+") ? "+" : ""}${"•".repeat(Math.min(8, digits.length - 4))}${digits.slice(-4)}`
}

function maskEmail(value: string): string {
  const [local = "", domain = ""] = value.trim().split("@")
  if (!domain) {
    return "•••"
  }
  return `${local.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, local.length - 2)))}@${domain}`
}

function maskName(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return parts[0] ?? ""
  }
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
}

function summarizeUrl(value: string): string {
  try {
    const url = new URL(value)
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`
  } catch {
    return value
  }
}

export function summarizeForLog(entry: Pick<EntradaQRCode, "tipoConteudo" | "inputOriginal" | "valorQR">): string {
  const original = entry.inputOriginal
  switch (entry.tipoConteudo) {
    case "url":
      return truncate(/^https?:\/\//i.test(entry.valorQR) ? summarizeUrl(entry.valorQR) : original)
    case "whatsappGroup":
    case "spotify":
    case "zoom":
      return truncate(summarizeUrl(entry.valorQR))
    case "appstore":
    case "wifi":
    case "vevent":
    case "menu":
    case "cupom":
      return truncate(original)
    case "vcard":
      return truncate(maskName(original))
    case "email":
      return truncate(maskEmail(original))
    case "sms":
    case "whatsapp":
    case "phone":
      return maskDigits(original)
    case "pix": {
      const key = detectPixKey(original)
      if (!key) {
        return "PIX"
      }
      return `${key.type.toUpperCase()} ${key.type === "email" ? maskEmail(key.value) : key.type === "evp" ? `${key.value.slice(0, 4)}…` : maskDigits(key.value)}`
    }
    case "geo": {
      const [lat, lon] = entry.valorQR.replace(/^geo:/, "").split(",").map(Number)
      return Number.isFinite(lat) && Number.isFinite(lon) ? `${lat.toFixed(2)}, ${lon.toFixed(2)}` : "geo"
    }
  }
}

export function buildQrEventPayload(
  entry: EntradaQRCode,
  idioma: AppLanguage,
  dispositivo: "mobile" | "desktop",
): QrEventPayload {
  return {
    tipo: entry.tipoConteudo,
    resumo: summarizeForLog(entry),
    tamanho: entry.tamanho,
    nivel: entry.nivel,
    margem: entry.margem,
    corFrente: entry.corFrente,
    corFundo: entry.corFundo,
    logo: !!(entry.habilitarCustomizacaoLogo && entry.logoDataUri),
    fundo: !!(entry.habilitarCustomizacaoFundo && entry.imagemFundo),
    moldura: entry.habilitarCustomizacaoFrame ? (entry.tipoFrameSelecionado ?? "none") : "none",
    textoMoldura: truncate(entry.textoFrame ?? "", 40),
    idioma,
    dispositivo,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function inList<T extends string>(value: unknown, list: readonly T[]): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value)
}

export function parseQrEventPayload(raw: unknown): QrEventPayload | null {
  if (!isRecord(raw)) {
    return null
  }
  const { tipo, resumo, tamanho, nivel, margem, corFrente, corFundo, logo, fundo, moldura, textoMoldura, idioma, dispositivo } = raw
  if (
    !inList(tipo, CONTENT_TYPES) ||
    typeof resumo !== "string" ||
    typeof tamanho !== "number" ||
    !Number.isFinite(tamanho) ||
    !inList(nivel, ERROR_LEVELS) ||
    typeof margem !== "number" ||
    !Number.isFinite(margem) ||
    typeof corFrente !== "string" ||
    !HEX_COLOR_RE.test(corFrente) ||
    typeof corFundo !== "string" ||
    !HEX_COLOR_RE.test(corFundo) ||
    typeof logo !== "boolean" ||
    typeof fundo !== "boolean" ||
    !inList(moldura, FRAME_TYPES) ||
    typeof textoMoldura !== "string" ||
    !inList(idioma, LANGUAGES) ||
    (dispositivo !== "mobile" && dispositivo !== "desktop")
  ) {
    return null
  }
  return {
    tipo,
    resumo: truncate(resumo),
    tamanho: Math.min(1000, Math.max(50, Math.round(tamanho))),
    nivel,
    margem: Math.min(40, Math.max(0, Math.round(margem))),
    corFrente,
    corFundo,
    logo,
    fundo,
    moldura,
    textoMoldura: truncate(textoMoldura, 40),
    idioma,
    dispositivo,
  }
}
