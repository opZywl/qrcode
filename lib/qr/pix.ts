export type PixKeyType = "cpf" | "cnpj" | "phone" | "email" | "evp"

export interface PixKey {
  type: PixKeyType
  value: string
}

export interface PixInput {
  key: string
  name: string
  city: string
  amount?: string
  description?: string
  txid?: string
}

export type PixError = "pixKeyRequired" | "pixKeyInvalid" | "pixNameRequired" | "pixCityRequired" | "pixAmountInvalid"

export type PixResult = { ok: true; payload: string; key: PixKey } | { ok: false; error: PixError }

const GUI = "br.gov.bcb.pix"
const EVP_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CPF_MASK_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const CNPJ_MASK_RE = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`
}

export function crc16(payload: string): string {
  let crc = 0xffff
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function toAscii(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function allSameDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits)
}

export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || allSameDigits(digits)) {
    return false
  }
  const calc = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i)
    }
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10])
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || allSameDigits(digits)) {
    return false
  }
  const calc = (length: number) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, weight, index) => acc + Number(digits[index]) * weight, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13])
}

export function detectPixKey(raw: string): PixKey | null {
  const value = raw.trim()
  if (!value) {
    return null
  }

  if (EVP_RE.test(value)) {
    return { type: "evp", value: value.toLowerCase() }
  }

  if (value.includes("@")) {
    const email = value.toLowerCase()
    return EMAIL_RE.test(email) && email.length <= 77 && toAscii(email) === email ? { type: "email", value: email } : null
  }

  const digits = value.replace(/\D/g, "")
  if (!digits || /[^\d\s().+/-]/.test(value)) {
    return null
  }

  if (value.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? { type: "phone", value: `+${digits}` } : null
  }

  if (CPF_MASK_RE.test(value)) {
    return isValidCpf(digits) ? { type: "cpf", value: digits } : null
  }

  if (CNPJ_MASK_RE.test(value) || digits.length === 14) {
    return isValidCnpj(digits) ? { type: "cnpj", value: digits } : null
  }

  if (digits.length === 11 && !/[()]/.test(value) && isValidCpf(digits)) {
    return { type: "cpf", value: digits }
  }

  if (digits.length === 10 || digits.length === 11) {
    return { type: "phone", value: `+55${digits}` }
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return { type: "phone", value: `+${digits}` }
  }

  return null
}

export function parsePixAmount(raw: string): string | null {
  const value = raw.trim().replace(/\s/g, "").replace(/^R\$/i, "")
  if (!value) {
    return null
  }

  let normalized = value
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".")
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".")
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  const formatted = amount.toFixed(2)
  return formatted.length <= 13 ? formatted : null
}

export function buildPixPayload(input: PixInput): PixResult {
  if (!input.key.trim()) {
    return { ok: false, error: "pixKeyRequired" }
  }

  const key = detectPixKey(input.key)
  if (!key) {
    return { ok: false, error: "pixKeyInvalid" }
  }

  const name = toAscii(input.name).slice(0, 25).trim()
  if (!name) {
    return { ok: false, error: "pixNameRequired" }
  }

  const city = toAscii(input.city).slice(0, 15).trim()
  if (!city) {
    return { ok: false, error: "pixCityRequired" }
  }

  let amount: string | null = null
  if (input.amount && input.amount.trim()) {
    amount = parsePixAmount(input.amount)
    if (!amount) {
      return { ok: false, error: "pixAmountInvalid" }
    }
  }

  const keyField = tlv("01", key.value)
  const maxDescription = 99 - tlv("00", GUI).length - keyField.length - 4
  const description = toAscii(input.description ?? "").slice(0, Math.max(0, maxDescription)).trim()
  const merchantAccount = tlv("00", GUI) + keyField + (description ? tlv("02", description) : "")

  const txid = toAscii(input.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***"

  const body =
    tlv("00", "01") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (amount ? tlv("54", amount) : "") +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    tlv("62", tlv("05", txid)) +
    "6304"

  return { ok: true, payload: body + crc16(body), key }
}
