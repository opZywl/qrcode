import { LOCALE_TAGS, type AppLanguage } from "@/lib/i18n"
import { buildPixPayload, type PixError } from "./pix"
import type { CupomTipo, NivelCorrecaoErro, QrContentFields, TipoConteudoQR } from "./types"
import { isValidEmail, normalizePhone, normalizeUrlInput, normalizeWhatsAppGroupLink, toHttpUrl } from "./url"

export type PayloadError =
  | "urlRequired"
  | "wifiSsidRequired"
  | "vcardNameRequired"
  | "eventRequired"
  | "eventDateInvalid"
  | "eventEndBeforeStart"
  | "emailRequired"
  | "emailInvalid"
  | "smsRequired"
  | "smsInvalid"
  | "geoRequired"
  | "geoInvalid"
  | "whatsappRequired"
  | "whatsappInvalid"
  | "whatsappGroupRequired"
  | "whatsappGroupInvalid"
  | "phoneRequired"
  | "phoneInvalid"
  | PixError
  | "appstoreIosRequired"
  | "appstoreAndroidRequired"
  | "appstoreUrlInvalid"
  | "mediaUrlRequired"
  | "mediaUrlInvalid"
  | "meetingUrlRequired"
  | "meetingUrlInvalid"
  | "menuNameRequired"
  | "couponCodeRequired"

export type PayloadResult = { ok: true; value: string; label: string } | { ok: false; error: PayloadError }

export const QR_BYTE_CAPACITY: Record<NivelCorrecaoErro, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
}

const TEXT_LABELS: Record<
  AppLanguage,
  {
    restaurant: string
    category: string
    description: string
    items: string
    prices: string
    coupon: string
    type: string
    value: string
    validUntil: string
    couponTypes: Record<CupomTipo, string>
  }
> = {
  pt: {
    restaurant: "RESTAURANTE",
    category: "CATEGORIA",
    description: "DESCRIÇÃO",
    items: "ITENS",
    prices: "PREÇOS",
    coupon: "CUPOM",
    type: "TIPO",
    value: "VALOR",
    validUntil: "VÁLIDO ATÉ",
    couponTypes: { desconto: "DESCONTO", frete: "FRETE GRÁTIS", produto: "PRODUTO GRÁTIS" },
  },
  en: {
    restaurant: "RESTAURANT",
    category: "CATEGORY",
    description: "DESCRIPTION",
    items: "ITEMS",
    prices: "PRICES",
    coupon: "COUPON",
    type: "TYPE",
    value: "VALUE",
    validUntil: "VALID UNTIL",
    couponTypes: { desconto: "DISCOUNT", frete: "FREE SHIPPING", produto: "FREE PRODUCT" },
  },
  es: {
    restaurant: "RESTAURANTE",
    category: "CATEGORÍA",
    description: "DESCRIPCIÓN",
    items: "ÍTEMS",
    prices: "PRECIOS",
    coupon: "CUPÓN",
    type: "TIPO",
    value: "VALOR",
    validUntil: "VÁLIDO HASTA",
    couponTypes: { desconto: "DESCUENTO", frete: "ENVÍO GRATIS", produto: "PRODUCTO GRATIS" },
  },
}

export function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length
}

export function fitsInQr(value: string, level: NivelCorrecaoErro): boolean {
  return utf8Length(value) <= QR_BYTE_CAPACITY[level]
}

export function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1")
}

export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n")
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function parseDateInput(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return null
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const check = new Date(Date.UTC(year, month - 1, day))
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null
  }
  return { year, month, day }
}

function parseTimeInput(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})/.exec(value.trim())
  if (!match) {
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours < 24 && minutes < 60 ? { hours, minutes } : null
}

function formatUtcDateTime(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`
}

function formatUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
}

function lines(entries: Array<string | false | null | undefined>): string {
  return entries.filter(Boolean).join("\n")
}

function buildWifi(fields: QrContentFields): PayloadResult {
  const ssid = fields.wifiSsid.trim()
  if (!ssid) {
    return { ok: false, error: "wifiSsidRequired" }
  }
  let value = `WIFI:T:${fields.wifiEncriptacao};S:${escapeWifi(ssid)};`
  if (fields.wifiEncriptacao !== "nopass") {
    value += `P:${escapeWifi(fields.wifiSenha)};`
  }
  if (fields.wifiOculto) {
    value += "H:true;"
  }
  return { ok: true, value: `${value};`, label: ssid }
}

function buildVCard(fields: QrContentFields): PayloadResult {
  const firstName = fields.vcardNome.trim()
  const lastName = fields.vcardSobrenome.trim()
  const organization = fields.vcardOrganizacao.trim()
  if (!firstName && !lastName && !organization) {
    return { ok: false, error: "vcardNameRequired" }
  }

  const fullName = `${firstName} ${lastName}`.trim() || organization
  const address = [fields.vcardEndereco, fields.vcardCidade, fields.vcardEstado, fields.vcardCep, fields.vcardPais].map(
    (part) => escapeText(part.trim()),
  )
  const website = fields.vcardWebsite.trim() ? normalizeUrlInput(fields.vcardWebsite) : ""

  const value = lines([
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeText(lastName)};${escapeText(firstName)};;;`,
    `FN:${escapeText(fullName)}`,
    organization && `ORG:${escapeText(organization)}`,
    fields.vcardTitulo.trim() && `TITLE:${escapeText(fields.vcardTitulo.trim())}`,
    fields.vcardTelefone.trim() && `TEL;TYPE=WORK,VOICE:${normalizePhone(fields.vcardTelefone)}`,
    fields.vcardEmail.trim() && `EMAIL:${escapeText(fields.vcardEmail.trim())}`,
    website && `URL:${website.replace(/\s+/g, "")}`,
    address.some(Boolean) && `ADR;TYPE=WORK:;;${address.join(";")}`,
    "END:VCARD",
  ])

  return { ok: true, value, label: fullName }
}

function buildEvent(fields: QrContentFields): PayloadResult {
  const summary = fields.veventResumo.trim()
  if (!summary || !fields.veventDataInicio.trim()) {
    return { ok: false, error: "eventRequired" }
  }

  const startDate = parseDateInput(fields.veventDataInicio)
  const endDate = fields.veventDataFim.trim() ? parseDateInput(fields.veventDataFim) : startDate
  if (!startDate || !endDate) {
    return { ok: false, error: "eventDateInvalid" }
  }

  const allDay = fields.veventDiaTodo || !fields.veventHoraInicio.trim()
  let dtStart: string
  let dtEnd: string

  if (allDay) {
    const start = new Date(Date.UTC(startDate.year, startDate.month - 1, startDate.day))
    const end = new Date(Date.UTC(endDate.year, endDate.month - 1, endDate.day + 1))
    if (end <= start) {
      return { ok: false, error: "eventEndBeforeStart" }
    }
    dtStart = `DTSTART;VALUE=DATE:${formatUtcDate(start)}`
    dtEnd = `DTEND;VALUE=DATE:${formatUtcDate(end)}`
  } else {
    const startTime = parseTimeInput(fields.veventHoraInicio)
    const endTime = fields.veventHoraFim.trim() ? parseTimeInput(fields.veventHoraFim) : null
    if (!startTime || (fields.veventHoraFim.trim() && !endTime)) {
      return { ok: false, error: "eventDateInvalid" }
    }

    const start = new Date(startDate.year, startDate.month - 1, startDate.day, startTime.hours, startTime.minutes)
    const end = endTime
      ? new Date(endDate.year, endDate.month - 1, endDate.day, endTime.hours, endTime.minutes)
      : new Date(
          new Date(endDate.year, endDate.month - 1, endDate.day, startTime.hours, startTime.minutes).getTime() +
            60 * 60 * 1000,
        )

    if (end <= start) {
      return { ok: false, error: "eventEndBeforeStart" }
    }
    dtStart = `DTSTART:${formatUtcDateTime(start)}`
    dtEnd = `DTEND:${formatUtcDateTime(end)}`
  }

  const value = lines([
    "BEGIN:VEVENT",
    `SUMMARY:${escapeText(summary)}`,
    fields.veventDescricao.trim() && `DESCRIPTION:${escapeText(fields.veventDescricao.trim())}`,
    fields.veventLocalizacao.trim() && `LOCATION:${escapeText(fields.veventLocalizacao.trim())}`,
    dtStart,
    dtEnd,
    "END:VEVENT",
  ])

  return { ok: true, value, label: summary }
}

function buildEmail(fields: QrContentFields): PayloadResult {
  const to = fields.emailPara.trim()
  if (!to) {
    return { ok: false, error: "emailRequired" }
  }
  if (!isValidEmail(to)) {
    return { ok: false, error: "emailInvalid" }
  }
  const params = [
    fields.emailAssunto.trim() && `subject=${encodeURIComponent(fields.emailAssunto.trim())}`,
    fields.emailCorpo.trim() && `body=${encodeURIComponent(fields.emailCorpo)}`,
  ].filter(Boolean)
  const value = `mailto:${encodeURI(to)}${params.length ? `?${params.join("&")}` : ""}`
  return { ok: true, value, label: to }
}

function buildSms(fields: QrContentFields): PayloadResult {
  if (!fields.smsPara.trim()) {
    return { ok: false, error: "smsRequired" }
  }
  const number = normalizePhone(fields.smsPara)
  if (number.replace("+", "").length < 3) {
    return { ok: false, error: "smsInvalid" }
  }
  return { ok: true, value: `SMSTO:${number}:${fields.smsCorpo}`, label: fields.smsPara.trim() }
}

function parseCoordinate(value: string, limit: number): number | null {
  const normalized = value.trim().replace(",", ".")
  if (!/^-?\d{1,3}(\.\d+)?$/.test(normalized)) {
    return null
  }
  const number = Number(normalized)
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null
}

function buildGeo(fields: QrContentFields): PayloadResult {
  if (!fields.geoLatitude.trim() || !fields.geoLongitude.trim()) {
    return { ok: false, error: "geoRequired" }
  }
  const latitude = parseCoordinate(fields.geoLatitude, 90)
  const longitude = parseCoordinate(fields.geoLongitude, 180)
  if (latitude === null || longitude === null) {
    return { ok: false, error: "geoInvalid" }
  }
  return {
    ok: true,
    value: `geo:${latitude},${longitude}`,
    label: `Lat: ${latitude}, Lon: ${longitude}`,
  }
}

function buildWhatsApp(fields: QrContentFields): PayloadResult {
  if (!fields.whatsappPara.trim()) {
    return { ok: false, error: "whatsappRequired" }
  }
  const digits = fields.whatsappPara.replace(/\D/g, "")
  if (digits.length < 8 || digits.length > 15) {
    return { ok: false, error: "whatsappInvalid" }
  }
  const message = fields.whatsappMensagem.trim() ? `?text=${encodeURIComponent(fields.whatsappMensagem)}` : ""
  return { ok: true, value: `https://wa.me/${digits}${message}`, label: fields.whatsappPara.trim() }
}

function buildWhatsAppGroup(fields: QrContentFields): PayloadResult {
  if (!fields.whatsappGroupLink.trim()) {
    return { ok: false, error: "whatsappGroupRequired" }
  }
  const link = normalizeWhatsAppGroupLink(fields.whatsappGroupLink)
  if (!link) {
    return { ok: false, error: "whatsappGroupInvalid" }
  }
  return { ok: true, value: link, label: link }
}

function buildPhone(fields: QrContentFields): PayloadResult {
  if (!fields.telefonePara.trim()) {
    return { ok: false, error: "phoneRequired" }
  }
  const number = normalizePhone(fields.telefonePara)
  if (number.replace("+", "").length < 3) {
    return { ok: false, error: "phoneInvalid" }
  }
  return { ok: true, value: `tel:${number}`, label: fields.telefonePara.trim() }
}

function buildPix(fields: QrContentFields): PayloadResult {
  const result = buildPixPayload({
    key: fields.pixChave,
    name: fields.pixNome,
    city: fields.pixCidade,
    amount: fields.pixValor,
    description: fields.pixDescricao,
  })
  if (!result.ok) {
    return result
  }
  return { ok: true, value: result.payload, label: fields.pixChave.trim() }
}

function buildAppStore(fields: QrContentFields): PayloadResult {
  const needsIos = fields.appstorePlataforma !== "android"
  const needsAndroid = fields.appstorePlataforma !== "ios"

  if (needsIos && !fields.appstoreIosUrl.trim()) {
    return { ok: false, error: "appstoreIosRequired" }
  }
  if (needsAndroid && !fields.appstoreAndroidUrl.trim()) {
    return { ok: false, error: "appstoreAndroidRequired" }
  }

  const ios = needsIos ? toHttpUrl(fields.appstoreIosUrl) : null
  const android = needsAndroid ? toHttpUrl(fields.appstoreAndroidUrl) : null
  if ((needsIos && !ios) || (needsAndroid && !android)) {
    return { ok: false, error: "appstoreUrlInvalid" }
  }

  const label = fields.appstoreNome.trim() || "App"
  if (fields.appstorePlataforma === "ios" && ios) {
    return { ok: true, value: ios.href, label }
  }
  if (fields.appstorePlataforma === "android" && android) {
    return { ok: true, value: android.href, label }
  }
  return {
    ok: true,
    value: `APP:${fields.appstoreNome.trim()}|iOS:${ios?.href ?? ""}|Android:${android?.href ?? ""}`,
    label,
  }
}

function buildMedia(fields: QrContentFields): PayloadResult {
  if (!fields.spotifyUrl.trim()) {
    return { ok: false, error: "mediaUrlRequired" }
  }
  const url = toHttpUrl(fields.spotifyUrl)
  if (!url) {
    return { ok: false, error: "mediaUrlInvalid" }
  }
  return { ok: true, value: url.href, label: fields.spotifyTitulo.trim() || url.href }
}

function buildMeeting(fields: QrContentFields): PayloadResult {
  if (!fields.zoomUrl.trim()) {
    return { ok: false, error: "meetingUrlRequired" }
  }
  const url = toHttpUrl(fields.zoomUrl)
  if (!url) {
    return { ok: false, error: "meetingUrlInvalid" }
  }
  return { ok: true, value: url.href, label: fields.zoomTitulo.trim() || url.href }
}

function buildMenu(fields: QrContentFields, language: AppLanguage): PayloadResult {
  const name = fields.menuNome.trim()
  if (!name) {
    return { ok: false, error: "menuNameRequired" }
  }
  const labels = TEXT_LABELS[language]
  const value = [
    `${labels.restaurant}: ${name}`,
    fields.menuCategoria.trim() && `${labels.category}: ${fields.menuCategoria.trim()}`,
    fields.menuDescricao.trim() && `${labels.description}: ${fields.menuDescricao.trim()}`,
    fields.menuItens.trim() && `${labels.items}:\n${fields.menuItens.trim()}`,
    fields.menuPreco.trim() && `${labels.prices}: ${fields.menuPreco.trim()}`,
  ]
    .filter(Boolean)
    .join("\n\n")
  return { ok: true, value, label: name }
}

function buildCoupon(fields: QrContentFields, language: AppLanguage): PayloadResult {
  const code = fields.cupomCodigo.trim()
  if (!code) {
    return { ok: false, error: "couponCodeRequired" }
  }
  const labels = TEXT_LABELS[language]
  const validity = parseDateInput(fields.cupomValidade)
  const validityLabel = validity
    ? new Date(validity.year, validity.month - 1, validity.day).toLocaleDateString(LOCALE_TAGS[language])
    : ""
  const value = lines([
    `${labels.coupon}: ${code}`,
    `${labels.type}: ${labels.couponTypes[fields.cupomTipo]}`,
    fields.cupomValor.trim() && `${labels.value}: ${fields.cupomValor.trim()}`,
    fields.cupomDescricao.trim() && `${labels.description}: ${fields.cupomDescricao.trim()}`,
    validityLabel && `${labels.validUntil}: ${validityLabel}`,
  ])
  return { ok: true, value, label: code }
}

export function buildQrPayload(tipo: TipoConteudoQR, fields: QrContentFields, language: AppLanguage = "pt"): PayloadResult {
  switch (tipo) {
    case "url": {
      const value = normalizeUrlInput(fields.inputUrl)
      return value ? { ok: true, value, label: fields.inputUrl.trim() } : { ok: false, error: "urlRequired" }
    }
    case "wifi":
      return buildWifi(fields)
    case "vcard":
      return buildVCard(fields)
    case "vevent":
      return buildEvent(fields)
    case "email":
      return buildEmail(fields)
    case "sms":
      return buildSms(fields)
    case "geo":
      return buildGeo(fields)
    case "whatsapp":
      return buildWhatsApp(fields)
    case "whatsappGroup":
      return buildWhatsAppGroup(fields)
    case "phone":
      return buildPhone(fields)
    case "pix":
      return buildPix(fields)
    case "appstore":
      return buildAppStore(fields)
    case "spotify":
      return buildMedia(fields)
    case "zoom":
      return buildMeeting(fields)
    case "menu":
      return buildMenu(fields, language)
    case "cupom":
      return buildCoupon(fields, language)
  }
}

export function hasRequiredContent(tipo: TipoConteudoQR, fields: QrContentFields): boolean {
  switch (tipo) {
    case "url":
      return !!fields.inputUrl.trim()
    case "wifi":
      return !!fields.wifiSsid.trim()
    case "vcard":
      return !!(fields.vcardNome.trim() || fields.vcardSobrenome.trim() || fields.vcardOrganizacao.trim())
    case "vevent":
      return !!(fields.veventResumo.trim() && fields.veventDataInicio.trim())
    case "email":
      return !!fields.emailPara.trim()
    case "sms":
      return !!fields.smsPara.trim()
    case "geo":
      return !!(fields.geoLatitude.trim() && fields.geoLongitude.trim())
    case "whatsapp":
      return !!fields.whatsappPara.trim()
    case "whatsappGroup":
      return !!fields.whatsappGroupLink.trim()
    case "phone":
      return !!fields.telefonePara.trim()
    case "pix":
      return !!(fields.pixChave.trim() && fields.pixNome.trim() && fields.pixCidade.trim())
    case "appstore":
      return fields.appstorePlataforma === "ios"
        ? !!fields.appstoreIosUrl.trim()
        : fields.appstorePlataforma === "android"
          ? !!fields.appstoreAndroidUrl.trim()
          : !!(fields.appstoreIosUrl.trim() && fields.appstoreAndroidUrl.trim())
    case "spotify":
      return !!fields.spotifyUrl.trim()
    case "zoom":
      return !!fields.zoomUrl.trim()
    case "menu":
      return !!fields.menuNome.trim()
    case "cupom":
      return !!fields.cupomCodigo.trim()
  }
}
