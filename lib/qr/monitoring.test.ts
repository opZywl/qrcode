import { describe, expect, it } from "vitest"
import { buildQrEventPayload, parseQrEventPayload, summarizeForLog } from "./monitoring"
import type { EntradaQRCode } from "./types"

function entry(patch: Partial<EntradaQRCode>): EntradaQRCode {
  return {
    id: "1",
    tipoConteudo: "url",
    inputOriginal: "",
    valorQR: "",
    corFrente: "#000000",
    corFundo: "#FFFFFF",
    tamanho: 256,
    nivel: "H",
    margem: 4,
    timestamp: 0,
    ...patch,
  }
}

describe("summarizeForLog", () => {
  it("mascara dados pessoais", () => {
    expect(summarizeForLog(entry({ tipoConteudo: "email", inputOriginal: "fulano@gmail.com" }))).toBe("fu••••@gmail.com")
    expect(summarizeForLog(entry({ tipoConteudo: "phone", inputOriginal: "+55 11 99999-8888" }))).toBe("+••••••••8888")
    expect(summarizeForLog(entry({ tipoConteudo: "vcard", inputOriginal: "Ana Maria Souza" }))).toBe("Ana S.")
    expect(summarizeForLog(entry({ tipoConteudo: "pix", inputOriginal: "529.982.247-25" }))).toBe("CPF •••••••4725")
    expect(summarizeForLog(entry({ tipoConteudo: "geo", valorQR: "geo:-23.550520,-46.633308" }))).toBe("-23.55, -46.63")
  })

  it("remove query string de URLs e nunca inclui a senha do Wi-Fi", () => {
    expect(summarizeForLog(entry({ tipoConteudo: "url", valorQR: "https://site.com/p?token=abc", inputOriginal: "x" }))).toBe(
      "site.com/p",
    )
    expect(
      summarizeForLog(entry({ tipoConteudo: "wifi", inputOriginal: "MinhaRede", valorQR: "WIFI:T:WPA;S:MinhaRede;P:segredo;;" })),
    ).toBe("MinhaRede")
  })
})

describe("payload do evento", () => {
  it("é validado de ponta a ponta", () => {
    const payload = buildQrEventPayload(
      entry({ tipoConteudo: "wifi", inputOriginal: "Rede", valorQR: "WIFI:T:WPA;S:Rede;P:x;;" }),
      "pt",
      "desktop",
    )
    expect(parseQrEventPayload(JSON.parse(JSON.stringify(payload)))).toEqual(payload)
  })

  it("rejeita campos inválidos", () => {
    const payload = buildQrEventPayload(entry({ valorQR: "https://a.com" }), "pt", "mobile")
    expect(parseQrEventPayload({ ...payload, tipo: "hack" })).toBeNull()
    expect(parseQrEventPayload({ ...payload, corFrente: "red" })).toBeNull()
    expect(parseQrEventPayload(null)).toBeNull()
    expect(parseQrEventPayload({ ...payload, resumo: "x".repeat(5000) })?.resumo.length).toBe(200)
  })
})
