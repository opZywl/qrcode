import { fitsInQr } from "./payload"
import {
  APPSTORE_PLATFORMS,
  COUPON_TYPES,
  DEFAULT_CONTENT,
  ERROR_LEVELS,
  FRAME_TYPES,
  MEDIA_TYPES,
  MEETING_TYPES,
  WIFI_ENCRYPTIONS,
  isContentType,
  type EntradaQRCode,
  type QrContentFields,
  type TipoConteudoQR,
  type VisualTemplateQRCode,
} from "./types"

export const STORAGE_KEYS = {
  history: "qrCodeHistorico",
  templates: "qrCodeVisualTemplates",
  visibleTypes: "qr_visible_types",
  legacyVisibleTypes: "qrCodeTiposVisiveis",
} as const

export const HISTORY_LIMIT = 24
export const TEMPLATE_LIMIT = 12
export const MAX_TAGS = 8
export const MAX_TAG_LENGTH = 24

export type PersistStatus = "saved" | "savedWithoutImages" | "failed"

const MAX_IMAGE_DATA_URL_LENGTH = 3_500_000
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i
const IMAGE_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|gif|avif|bmp|svg\+xml);base64,[a-z0-9+/]+=*$/i

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.slice(0, maxLength) : ""
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function isSafeColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_RE.test(value)
}

export function isSafeImageDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_IMAGE_DATA_URL_LENGTH && IMAGE_DATA_URL_RE.test(value)
}

function asImage(value: unknown): string | undefined {
  return isSafeImageDataUrl(value) ? value : undefined
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeTags(tags: readonly string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, MAX_TAG_LENGTH)),
    ),
  ).slice(0, MAX_TAGS)
}

function sanitizeContentDetails(record: UnknownRecord): Partial<QrContentFields> {
  const details: Partial<QrContentFields> = {}

  for (const key of Object.keys(DEFAULT_CONTENT) as (keyof QrContentFields)[]) {
    const raw = record[key]
    if (typeof DEFAULT_CONTENT[key] === "boolean") {
      if (typeof raw === "boolean") {
        Object.assign(details, { [key]: raw })
      }
    } else if (typeof raw === "string") {
      Object.assign(details, { [key]: raw.slice(0, 4000) })
    }
  }

  if (details.wifiEncriptacao !== undefined) {
    details.wifiEncriptacao = asEnum(details.wifiEncriptacao, WIFI_ENCRYPTIONS, "WPA")
  }
  if (details.appstorePlataforma !== undefined) {
    details.appstorePlataforma = asEnum(details.appstorePlataforma, APPSTORE_PLATFORMS, "ambos")
  }
  if (details.spotifyTipo !== undefined) {
    details.spotifyTipo = asEnum(details.spotifyTipo, MEDIA_TYPES, "track")
  }
  if (details.zoomTipo !== undefined) {
    details.zoomTipo = asEnum(details.zoomTipo, MEETING_TYPES, "zoom")
  }
  if (details.cupomTipo !== undefined) {
    details.cupomTipo = asEnum(details.cupomTipo, COUPON_TYPES, "desconto")
  }

  return details
}

export function sanitizeHistoryEntry(raw: unknown): EntradaQRCode | null {
  if (!isRecord(raw) || !isContentType(raw.tipoConteudo)) {
    return null
  }

  const valorQR = asString(raw.valorQR, 4000)
  const nivel = asEnum(raw.nivel, ERROR_LEVELS, "H")
  if (!valorQR || !fitsInQr(valorQR, nivel)) {
    return null
  }

  const logoDataUri = asImage(raw.logoDataUri)
  const imagemFundo = asImage(raw.imagemFundo)
  const tipoFrameSelecionado = asEnum(raw.tipoFrameSelecionado, FRAME_TYPES, "none")
  const textoFrame = asString(raw.textoFrame, 40)

  return {
    ...sanitizeContentDetails(raw),
    id: asString(raw.id, 64) || createId(),
    tipoConteudo: raw.tipoConteudo,
    inputOriginal: asString(raw.inputOriginal, 500),
    valorQR,
    favorite: asBoolean(raw.favorite),
    tags: Array.isArray(raw.tags) ? normalizeTags(raw.tags.filter((tag): tag is string => typeof tag === "string")) : [],
    corFrente: isSafeColor(raw.corFrente) ? raw.corFrente : "#000000",
    corFundo: isSafeColor(raw.corFundo) ? raw.corFundo : "#FFFFFF",
    tamanho: asNumber(raw.tamanho, 50, 1000, 256),
    nivel,
    margem: asNumber(raw.margem, 0, 40, 4),
    habilitarCustomizacaoLogo: asBoolean(raw.habilitarCustomizacaoLogo) && !!logoDataUri,
    logoDataUri,
    logoTamanhoRatio: logoDataUri ? asNumber(raw.logoTamanhoRatio, 0.05, 0.4, 0.2) : undefined,
    escavarLogo: logoDataUri ? asBoolean(raw.escavarLogo, true) : undefined,
    habilitarCustomizacaoFundo: asBoolean(raw.habilitarCustomizacaoFundo) && !!imagemFundo,
    imagemFundo,
    habilitarCustomizacaoFrame: asBoolean(raw.habilitarCustomizacaoFrame) && tipoFrameSelecionado !== "none",
    tipoFrameSelecionado,
    textoFrame: textoFrame || undefined,
    timestamp: asNumber(raw.timestamp, 0, Number.MAX_SAFE_INTEGER, 0),
  }
}

export function sanitizeHistory(raw: unknown): EntradaQRCode[] {
  if (!Array.isArray(raw)) {
    return []
  }
  const seen = new Set<string>()
  return raw
    .map(sanitizeHistoryEntry)
    .filter((entry): entry is EntradaQRCode => {
      if (!entry || seen.has(entry.id)) {
        return false
      }
      seen.add(entry.id)
      return true
    })
    .slice(0, HISTORY_LIMIT)
}

export function sanitizeTemplate(raw: unknown): VisualTemplateQRCode | null {
  if (!isRecord(raw)) {
    return null
  }

  const name = asString(raw.name, 60).trim()
  if (!name) {
    return null
  }

  const logoDataUri = asImage(raw.logoDataUri)
  const imagemFundo = asImage(raw.imagemFundo)
  const tipoFrameSelecionado = asEnum(raw.tipoFrameSelecionado, FRAME_TYPES, "none")
  const createdAt = asNumber(raw.createdAt, 0, Number.MAX_SAFE_INTEGER, 0)

  return {
    id: asString(raw.id, 64) || createId(),
    name,
    createdAt,
    updatedAt: asNumber(raw.updatedAt, 0, Number.MAX_SAFE_INTEGER, createdAt),
    corFrente: isSafeColor(raw.corFrente) ? raw.corFrente : "#000000",
    corFundo: isSafeColor(raw.corFundo) ? raw.corFundo : "#FFFFFF",
    tamanho: asNumber(raw.tamanho, 50, 1000, 256),
    nivel: asEnum(raw.nivel, ERROR_LEVELS, "H"),
    margem: asNumber(raw.margem, 0, 40, 4),
    habilitarCustomizacaoLogo: asBoolean(raw.habilitarCustomizacaoLogo) && !!logoDataUri,
    logoDataUri,
    logoTamanhoRatio: logoDataUri ? asNumber(raw.logoTamanhoRatio, 0.05, 0.4, 0.2) : undefined,
    escavarLogo: logoDataUri ? asBoolean(raw.escavarLogo, true) : undefined,
    habilitarCustomizacaoFundo: asBoolean(raw.habilitarCustomizacaoFundo) && !!imagemFundo,
    imagemFundo,
    habilitarCustomizacaoFrame: asBoolean(raw.habilitarCustomizacaoFrame) && tipoFrameSelecionado !== "none",
    tipoFrameSelecionado,
    textoFrame: asString(raw.textoFrame, 40) || undefined,
  }
}

export function sanitizeTemplates(raw: unknown): VisualTemplateQRCode[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw
    .map(sanitizeTemplate)
    .filter((template): template is VisualTemplateQRCode => template !== null)
    .slice(0, TEMPLATE_LIMIT)
}

export function sanitizeVisibleTypes(raw: unknown): TipoConteudoQR[] | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const types = Array.from(new Set(raw.filter(isContentType)))
  return types.length > 0 ? types : null
}

export function readStorage<T>(key: string, parse: (raw: unknown) => T): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : parse(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {}
}

function withoutImages<T extends { logoDataUri?: string; imagemFundo?: string }>(entry: T): T {
  return {
    ...entry,
    logoDataUri: undefined,
    imagemFundo: undefined,
    habilitarCustomizacaoLogo: false,
    habilitarCustomizacaoFundo: false,
  }
}

export function persistHistory(entries: EntradaQRCode[]): PersistStatus {
  if (entries.length === 0) {
    removeStorage(STORAGE_KEYS.history)
    return "saved"
  }
  if (writeStorage(STORAGE_KEYS.history, entries)) {
    return "saved"
  }
  const [latest, ...older] = entries
  if (writeStorage(STORAGE_KEYS.history, [latest, ...older.map(withoutImages)])) {
    return "savedWithoutImages"
  }
  if (writeStorage(STORAGE_KEYS.history, entries.map(withoutImages))) {
    return "savedWithoutImages"
  }
  return "failed"
}

export function persistTemplates(templates: VisualTemplateQRCode[]): PersistStatus {
  if (templates.length === 0) {
    removeStorage(STORAGE_KEYS.templates)
    return "saved"
  }
  return writeStorage(STORAGE_KEYS.templates, templates) ? "saved" : "failed"
}
