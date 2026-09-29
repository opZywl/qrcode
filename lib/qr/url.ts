const HTTP_SCHEME_RE = /^https?:\/\//i
const MALFORMED_HTTP_RE = /^(https?):\/?(?=[^/\s])/i
const LOCAL_HOST_RE = /^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d{1,5})?([/?#]\S*)?$/i
const DOMAIN_RE = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(:\d{1,5})?([/?#]\S*)?$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeUrlInput(raw: string): string {
  const value = raw.trim()
  if (!value || HTTP_SCHEME_RE.test(value)) {
    return value
  }

  if (MALFORMED_HTTP_RE.test(value)) {
    return value.replace(MALFORMED_HTTP_RE, "$1://")
  }

  if (/\s/.test(value)) {
    return value
  }

  if (LOCAL_HOST_RE.test(value)) {
    return `http://${value}`
  }

  if (DOMAIN_RE.test(value)) {
    return `https://${value}`
  }

  return value
}

export function toHttpUrl(raw: string): URL | null {
  const normalized = normalizeUrlInput(raw)
  if (!HTTP_SCHEME_RE.test(normalized)) {
    return null
  }

  try {
    const url = new URL(normalized)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }
    if (!url.hostname || url.username || url.password) {
      return null
    }
    return url
  } catch {
    return null
  }
}

export function normalizeWhatsAppGroupLink(raw: string): string | null {
  const url = toHttpUrl(raw)
  if (!url || url.hostname.toLowerCase() !== "chat.whatsapp.com") {
    return null
  }

  const code = url.pathname.replace(/^\/+|\/+$/g, "").replace(/^invite\//i, "")
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(code)) {
    return null
  }

  return `https://chat.whatsapp.com/${code}`
}

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, "")
  if (!digits) {
    return ""
  }
  return trimmed.startsWith("+") ? `+${digits}` : digits
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}
