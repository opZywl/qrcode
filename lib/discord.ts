import type { QrEventPayload } from "@/lib/qr/monitoring"
import type { TipoConteudoQR, TipoFrame } from "@/lib/qr/types"

export const DISCORD_TIMEZONE = "America/Sao_Paulo"

const WEBHOOK_RE = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api\/webhooks\/\d{5,30}\/[\w-]{20,200}$/

const TYPE_META: Record<TipoConteudoQR, { label: string; emoji: string; color: number }> = {
  url: { label: "URL/Texto", emoji: "🔗", color: 0x3b82f6 },
  wifi: { label: "Wi-Fi", emoji: "📶", color: 0x10b981 },
  vcard: { label: "Contato", emoji: "👤", color: 0x8b5cf6 },
  vevent: { label: "Evento", emoji: "📅", color: 0xf59e0b },
  email: { label: "Email", emoji: "📧", color: 0xef4444 },
  sms: { label: "SMS", emoji: "💬", color: 0x06b6d4 },
  geo: { label: "Localização", emoji: "📍", color: 0x84cc16 },
  whatsapp: { label: "WhatsApp", emoji: "📱", color: 0x22c55e },
  whatsappGroup: { label: "Grupo WhatsApp", emoji: "👥", color: 0x16a34a },
  phone: { label: "Telefone", emoji: "☎️", color: 0x6366f1 },
  pix: { label: "PIX", emoji: "💠", color: 0x14b8a6 },
  appstore: { label: "App Store", emoji: "📲", color: 0x0ea5e9 },
  spotify: { label: "Música/Vídeo", emoji: "🎵", color: 0x1db954 },
  zoom: { label: "Videochamada", emoji: "🎥", color: 0x2d8cff },
  menu: { label: "Menu", emoji: "🍽️", color: 0xf97316 },
  cupom: { label: "Cupom", emoji: "🎟️", color: 0xec4899 },
}

const FRAME_LABELS: Record<TipoFrame, string> = {
  none: "Nenhuma",
  simpleBorder: "Borda simples",
  textBottom: "Texto inferior",
  scanMeBottom: "Scan me",
  roundedBorderTextBottom: "Borda arredondada com texto",
  topBottomText: "Texto superior e inferior",
  decorativeBorder: "Bordas decorativas",
  modernFrame: "Moldura moderna",
  classicFrame: "Moldura clássica",
}

export function isDiscordWebhookUrl(value: string | undefined): value is string {
  return typeof value === "string" && WEBHOOK_RE.test(value)
}

export function formatBrasilia(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: DISCORD_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

function codeBlock(value: string): string {
  return `\`\`\`${value.replace(/`/g, "'") || "—"}\`\`\``
}

function plain(value: string): string {
  return value.replace(/[\\`*_~|>@#<]/g, "")
}

export function buildDiscordMessage(event: QrEventPayload, country: string | null, now: Date) {
  const meta = TYPE_META[event.tipo]
  const unix = Math.floor(now.getTime() / 1000)
  const customizations = [
    event.logo && "Logo",
    event.fundo && "Fundo",
    event.moldura !== "none" &&
      `Moldura: ${FRAME_LABELS[event.moldura]}${event.textoMoldura ? ` ("${plain(event.textoMoldura)}")` : ""}`,
  ].filter(Boolean)

  return {
    username: "QR Code Studio",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `${meta.emoji} Novo QR Code gerado`,
        color: meta.color,
        fields: [
          { name: "Tipo", value: meta.label, inline: true },
          {
            name: "Origem",
            value: `${country ? plain(country).slice(0, 8) : "??"} • ${event.dispositivo === "mobile" ? "Mobile" : "Desktop"} • ${event.idioma.toUpperCase()}`,
            inline: true,
          },
          { name: "Conteúdo", value: codeBlock(event.resumo), inline: false },
          {
            name: "Visual",
            value: `${event.tamanho}px • Correção ${event.nivel} • Margem ${event.margem}\nCores \`${event.corFrente}\` / \`${event.corFundo}\``,
            inline: true,
          },
          { name: "Personalizações", value: customizations.length ? customizations.join("\n") : "Nenhuma", inline: true },
          { name: "Criado em", value: `${formatBrasilia(now)} (horário de Brasília)\n<t:${unix}:F> • <t:${unix}:R>`, inline: false },
        ],
        footer: { text: "QR Code Studio • Monitoramento" },
        timestamp: now.toISOString(),
      },
    ],
  }
}
