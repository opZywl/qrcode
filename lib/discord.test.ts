import { describe, expect, it } from "vitest"
import { buildDiscordMessage, formatBrasilia, isDiscordWebhookUrl } from "./discord"
import type { QrEventPayload } from "./qr/monitoring"

const EVENT: QrEventPayload = {
  tipo: "url",
  resumo: "site.com/`x` @everyone",
  tamanho: 256,
  nivel: "H",
  margem: 4,
  corFrente: "#000000",
  corFundo: "#FFFFFF",
  logo: true,
  fundo: false,
  moldura: "textBottom",
  textoMoldura: "**Promo** @here",
  idioma: "pt",
  dispositivo: "mobile",
}

describe("formatBrasilia", () => {
  it("usa o horário de Brasília independentemente do fuso do servidor", () => {
    const formatted = formatBrasilia(new Date("2026-09-29T16:59:16Z"))
    expect(formatted).toContain("29/09/2026")
    expect(formatted).toContain("13:59:16")
  })
})

describe("buildDiscordMessage", () => {
  it("monta o embed com timestamp nativo do Discord e sem menções", () => {
    const now = new Date("2026-09-29T16:59:16Z")
    const message = buildDiscordMessage(EVENT, "BR", now)
    const fields = Object.fromEntries(message.embeds[0].fields.map((field) => [field.name, field.value]))

    expect(message.allowed_mentions).toEqual({ parse: [] })
    expect(fields["Criado em"]).toContain("13:59:16 (horário de Brasília)")
    expect(fields["Criado em"]).toContain(`<t:${Math.floor(now.getTime() / 1000)}:F>`)
    expect(fields["Conteúdo"]).toBe("```site.com/'x' @everyone```")
    expect(fields["Personalizações"]).toBe('Logo\nMoldura: Texto inferior ("Promo here")')
    expect(fields["Origem"]).toBe("BR • Mobile • PT")
    expect(message.embeds[0].timestamp).toBe("2026-09-29T16:59:16.000Z")
  })
})

describe("isDiscordWebhookUrl", () => {
  it("aceita apenas URLs de webhook do Discord", () => {
    expect(isDiscordWebhookUrl("https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz_-0123456789")).toBe(true)
    expect(isDiscordWebhookUrl("https://discordapp.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz")).toBe(true)
    expect(isDiscordWebhookUrl("http://discord.com/api/webhooks/1/abc")).toBe(false)
    expect(isDiscordWebhookUrl("https://evil.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz")).toBe(false)
    expect(isDiscordWebhookUrl(undefined)).toBe(false)
  })
})
