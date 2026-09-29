import { after, NextResponse, type NextRequest } from "next/server"
import { buildDiscordMessage, isDiscordWebhookUrl } from "@/lib/discord"
import { parseQrEventPayload } from "@/lib/qr/monitoring"

const MAX_BODY_BYTES = 4096
const WINDOW_MS = 60_000
const PER_IP_LIMIT = 10
const GLOBAL_LIMIT = 25

const hits = new Map<string, number[]>()

function allow(key: string, limit: number, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) {
    for (const [entryKey, times] of hits) {
      if (!times.some((time) => now - time < WINDOW_MS)) {
        hits.delete(entryKey)
      }
    }
  }
  return true
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

function isSameOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin") {
    return false
  }
  const origin = request.headers.get("origin")
  if (!origin) {
    return fetchSite === "same-origin"
  }
  try {
    return new URL(origin).host === request.headers.get("host")
  } catch {
    return false
  }
}

async function sendToDiscord(webhook: string, body: unknown): Promise<void> {
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    if (!response.ok) {
      console.error(`[qr-events] Discord respondeu HTTP ${response.status}`)
    }
  } catch (error) {
    console.error(`[qr-events] falha ao enviar para o Discord: ${error instanceof Error ? error.name : "erro"}`)
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new NextResponse(null, { status: 403 })
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return new NextResponse(null, { status: 415 })
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 })
  }

  let raw: unknown
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 })
    }
    raw = JSON.parse(text)
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const event = parseQrEventPayload(raw)
  if (!event) {
    return new NextResponse(null, { status: 400 })
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim()
  if (!isDiscordWebhookUrl(webhook)) {
    return new NextResponse(null, { status: 204 })
  }

  const now = Date.now()
  if (!allow(`ip:${clientIp(request)}`, PER_IP_LIMIT, now) || !allow("global", GLOBAL_LIMIT, now)) {
    return new NextResponse(null, { status: 429, headers: { "Retry-After": "60" } })
  }

  const message = buildDiscordMessage(event, request.headers.get("x-vercel-ip-country"), new Date(now))
  after(() => sendToDiscord(webhook, message))

  return new NextResponse(null, { status: 204 })
}
