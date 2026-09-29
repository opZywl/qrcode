import { describe, expect, it } from "vitest"
import { isValidEmail, normalizePhone, normalizeUrlInput, normalizeWhatsAppGroupLink, toHttpUrl } from "./url"

describe("normalizeUrlInput", () => {
  it("corrige e completa URLs", () => {
    expect(normalizeUrlInput("  https://a.com  ")).toBe("https://a.com")
    expect(normalizeUrlInput("https:example.com")).toBe("https://example.com")
    expect(normalizeUrlInput("http:/example.com")).toBe("http://example.com")
    expect(normalizeUrlInput("www.example.com.br/x")).toBe("https://www.example.com.br/x")
    expect(normalizeUrlInput("localhost:3000/teste")).toBe("http://localhost:3000/teste")
    expect(normalizeUrlInput("192.168.0.1")).toBe("http://192.168.0.1")
  })

  it("mantém textos e outros esquemas intactos", () => {
    expect(normalizeUrlInput("mailto:a@b.com")).toBe("mailto:a@b.com")
    expect(normalizeUrlInput("texto com espaço.com")).toBe("texto com espaço.com")
    expect(normalizeUrlInput("12:30")).toBe("12:30")
  })
})

describe("toHttpUrl", () => {
  it("aceita apenas http(s) sem credenciais", () => {
    expect(toHttpUrl("example.com")?.href).toBe("https://example.com/")
    expect(toHttpUrl("javascript:alert(1)")).toBeNull()
    expect(toHttpUrl("data:text/html,<script>")).toBeNull()
    expect(toHttpUrl("https://google.com@evil.com")).toBeNull()
    expect(toHttpUrl("hello")).toBeNull()
  })
})

describe("auxiliares", () => {
  it("normaliza convites de grupo", () => {
    expect(normalizeWhatsAppGroupLink("https://chat.whatsapp.com/invite/AbCdEfGhIjKlMnOp")).toBe(
      "https://chat.whatsapp.com/AbCdEfGhIjKlMnOp",
    )
    expect(normalizeWhatsAppGroupLink("https://chat.whatsapp.com/")).toBeNull()
  })

  it("normaliza telefone e valida email", () => {
    expect(normalizePhone(" +55 (11) 9 9999-8888 ")).toBe("+5511999998888")
    expect(normalizePhone("(11) 9999-8888")).toBe("1199998888")
    expect(isValidEmail("a@b.co")).toBe(true)
    expect(isValidEmail("a@b")).toBe(false)
  })
})
