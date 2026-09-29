import { describe, expect, it } from "vitest"
import { buildQrPayload, escapeText, escapeWifi, fitsInQr, hasRequiredContent, QR_BYTE_CAPACITY } from "./payload"
import { DEFAULT_CONTENT, type QrContentFields, type TipoConteudoQR } from "./types"

function build(tipo: TipoConteudoQR, patch: Partial<QrContentFields>, language: "pt" | "en" | "es" = "pt") {
  return buildQrPayload(tipo, { ...DEFAULT_CONTENT, ...patch }, language)
}

function valueOf(result: ReturnType<typeof build>): string {
  if (!result.ok) {
    throw new Error(`esperava sucesso, veio ${result.error}`)
  }
  return result.value
}

describe("url", () => {
  it("adiciona https em domínios e mantém texto livre", () => {
    expect(valueOf(build("url", { inputUrl: "example.com/a?b=1" }))).toBe("https://example.com/a?b=1")
    expect(valueOf(build("url", { inputUrl: "Olá mundo" }))).toBe("Olá mundo")
    expect(build("url", { inputUrl: "   " })).toEqual({ ok: false, error: "urlRequired" })
  })
})

describe("wifi", () => {
  it("escapa caracteres especiais e omite senha quando aberta", () => {
    expect(escapeWifi('a;b,c:d"e\\')).toBe('a\\;b\\,c\\:d\\"e\\\\')
    expect(valueOf(build("wifi", { wifiSsid: "Casa;1", wifiSenha: "p:w", wifiEncriptacao: "WPA" }))).toBe(
      "WIFI:T:WPA;S:Casa\\;1;P:p\\:w;;",
    )
    expect(valueOf(build("wifi", { wifiSsid: "Aberta", wifiEncriptacao: "nopass", wifiOculto: true }))).toBe(
      "WIFI:T:nopass;S:Aberta;H:true;;",
    )
  })
})

describe("vcard", () => {
  it("gera vCard 3.0 só com os campos preenchidos", () => {
    const value = valueOf(
      build("vcard", { vcardNome: "Ana", vcardSobrenome: "Souza", vcardTelefone: "+55 (11) 98888-7777", vcardCidade: "São Paulo" }),
    )
    expect(value).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Souza;Ana;;;",
        "FN:Ana Souza",
        "TEL;TYPE=WORK,VOICE:+5511988887777",
        "ADR;TYPE=WORK:;;;São Paulo;;;",
        "END:VCARD",
      ].join("\n"),
    )
  })

  it("escapa texto conforme a RFC", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne")
  })
})

describe("vevent", () => {
  it("converte o horário local para UTC", () => {
    const value = valueOf(
      build("vevent", {
        veventResumo: "Reunião",
        veventDataInicio: "2026-09-29",
        veventHoraInicio: "14:00",
        veventHoraFim: "15:30",
      }),
    )
    expect(value).toContain("DTSTART:20260929T170000Z")
    expect(value).toContain("DTEND:20260929T183000Z")
  })

  it("trata evento de dia inteiro com fim exclusivo", () => {
    const value = valueOf(
      build("vevent", { veventResumo: "Feriado", veventDataInicio: "2026-12-31", veventDiaTodo: true }),
    )
    expect(value).toContain("DTSTART;VALUE=DATE:20261231")
    expect(value).toContain("DTEND;VALUE=DATE:20270101")
  })

  it("assume 1 hora de duração sem hora de fim e valida a ordem", () => {
    expect(
      valueOf(build("vevent", { veventResumo: "A", veventDataInicio: "2026-01-10", veventHoraInicio: "23:30" })),
    ).toContain("DTEND:20260111T033000Z")
    expect(
      build("vevent", {
        veventResumo: "A",
        veventDataInicio: "2026-01-10",
        veventHoraInicio: "10:00",
        veventHoraFim: "09:00",
      }),
    ).toEqual({ ok: false, error: "eventEndBeforeStart" })
    expect(build("vevent", { veventResumo: "A", veventDataInicio: "2026-02-30" })).toEqual({
      ok: false,
      error: "eventDateInvalid",
    })
  })
})

describe("contatos e mensagens", () => {
  it("monta mailto com parâmetros codificados", () => {
    expect(valueOf(build("email", { emailPara: "a@b.com", emailAssunto: "Olá & tchau", emailCorpo: "linha 1\nlinha 2" }))).toBe(
      "mailto:a@b.com?subject=Ol%C3%A1%20%26%20tchau&body=linha%201%0Alinha%202",
    )
    expect(build("email", { emailPara: "invalido" })).toEqual({ ok: false, error: "emailInvalid" })
  })

  it("preserva o + internacional em telefone e SMS", () => {
    expect(valueOf(build("phone", { telefonePara: "+55 (11) 99999-8888" }))).toBe("tel:+5511999998888")
    expect(valueOf(build("sms", { smsPara: "+1 555 0100", smsCorpo: "oi" }))).toBe("SMSTO:+15550100:oi")
  })

  it("monta link do WhatsApp e valida o tamanho do número", () => {
    expect(valueOf(build("whatsapp", { whatsappPara: "+55 11 99999-8888", whatsappMensagem: "Olá!" }))).toBe(
      "https://wa.me/5511999998888?text=Ol%C3%A1!",
    )
    expect(valueOf(build("whatsapp", { whatsappPara: "5511999998888" }))).toBe("https://wa.me/5511999998888")
    expect(build("whatsapp", { whatsappPara: "123" })).toEqual({ ok: false, error: "whatsappInvalid" })
  })

  it("normaliza e valida convites de grupo", () => {
    expect(valueOf(build("whatsappGroup", { whatsappGroupLink: "chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv?mode=r_c" }))).toBe(
      "https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv",
    )
    expect(build("whatsappGroup", { whatsappGroupLink: "https://evil.com/AbCdEfGhIjKlMnOpQrStUv" })).toEqual({
      ok: false,
      error: "whatsappGroupInvalid",
    })
  })
})

describe("geo", () => {
  it("valida faixas de latitude e longitude", () => {
    expect(valueOf(build("geo", { geoLatitude: "-23,5505", geoLongitude: "-46.6333" }))).toBe("geo:-23.5505,-46.6333")
    expect(build("geo", { geoLatitude: "91", geoLongitude: "0" })).toEqual({ ok: false, error: "geoInvalid" })
  })
})

describe("links", () => {
  it("aceita apenas http(s) para mídia, reunião e lojas", () => {
    expect(valueOf(build("spotify", { spotifyUrl: "open.spotify.com/track/1" }))).toBe("https://open.spotify.com/track/1")
    expect(build("zoom", { zoomUrl: "javascript:alert(1)" })).toEqual({ ok: false, error: "meetingUrlInvalid" })
    expect(build("appstore", { appstorePlataforma: "ios", appstoreIosUrl: "" })).toEqual({
      ok: false,
      error: "appstoreIosRequired",
    })
    expect(
      valueOf(build("appstore", { appstorePlataforma: "android", appstoreAndroidUrl: "https://play.google.com/store/apps/details?id=x" })),
    ).toBe("https://play.google.com/store/apps/details?id=x")
  })
})

describe("textos traduzidos", () => {
  it("usa rótulos no idioma escolhido e não desloca a data do cupom", () => {
    const pt = valueOf(build("cupom", { cupomCodigo: "OFF10", cupomTipo: "frete", cupomValidade: "2026-09-30" }))
    expect(pt).toBe("CUPOM: OFF10\nTIPO: FRETE GRÁTIS\nVÁLIDO ATÉ: 30/09/2026")
    const en = valueOf(build("menu", { menuNome: "Casa", menuItens: "Pão" }, "en"))
    expect(en).toBe("RESTAURANT: Casa\n\nITEMS:\nPão")
  })
})

describe("capacidade e campos obrigatórios", () => {
  it("respeita o limite do nível de correção", () => {
    expect(fitsInQr("a".repeat(QR_BYTE_CAPACITY.H), "H")).toBe(true)
    expect(fitsInQr("a".repeat(QR_BYTE_CAPACITY.H + 1), "H")).toBe(false)
    expect(fitsInQr("é".repeat(700), "H")).toBe(false)
  })

  it("considera o grupo do WhatsApp e o PIX", () => {
    expect(hasRequiredContent("whatsappGroup", { ...DEFAULT_CONTENT, whatsappGroupLink: "x" })).toBe(true)
    expect(hasRequiredContent("pix", { ...DEFAULT_CONTENT, pixChave: "x" })).toBe(false)
  })
})
