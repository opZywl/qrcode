export const SITE_NAME = "QR Code Studio"

export const SITE_DESCRIPTION = "Create polished QR codes in seconds."

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/+$/, "")
  }
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProduction) {
    return `https://${vercelProduction}`
  }
  return "http://localhost:3000"
}
