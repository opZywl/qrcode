import { describe, expect, it } from "vitest"
import { buildPixPayload, crc16, detectPixKey, isValidCnpj, isValidCpf, parsePixAmount } from "./pix"

const BACEN_EXAMPLE =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D"

describe("crc16", () => {
  it("calcula o CRC16-CCITT do exemplo do manual do BR Code", () => {
    expect(crc16(BACEN_EXAMPLE.slice(0, -4))).toBe("1D3D")
  })
})

describe("buildPixPayload", () => {
  it("gera exatamente o payload do exemplo oficial", () => {
    const result = buildPixPayload({
      key: "123e4567-e12b-12d1-a456-426655440000",
      name: "Fulano de Tal",
      city: "BRASILIA",
    })
    expect(result).toEqual({ ok: true, payload: BACEN_EXAMPLE, key: { type: "evp", value: "123e4567-e12b-12d1-a456-426655440000" } })
  })

  it("inclui valor, remove acentos e respeita os limites de nome e cidade", () => {
    const result = buildPixPayload({
      key: "529.982.247-25",
      name: "José da Conceição Albuquerque Filho",
      city: "São José dos Campos",
      amount: "10,5",
      description: "Pedido #123",
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload).toContain("540510.50")
    expect(result.payload).toContain("5925Jose da Conceicao Albuque60")
    expect(result.payload).toContain("6015Sao Jose dos Ca62")
    expect(result.payload).toContain("0211Pedido #123")
    expect(result.payload).toContain("011152998224725")
    expect(result.payload.slice(-4)).toBe(crc16(result.payload.slice(0, -4)))
  })

  it("mantém o campo 26 dentro de 99 caracteres com descrição longa", () => {
    const result = buildPixPayload({
      key: "123e4567-e12b-12d1-a456-426655440000",
      name: "Fulano",
      city: "Recife",
      description: "x".repeat(200),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const length = Number(result.payload.slice(result.payload.indexOf("26") + 2, result.payload.indexOf("26") + 4))
    expect(length).toBeLessThanOrEqual(99)
  })

  it("valida campos obrigatórios e valor", () => {
    expect(buildPixPayload({ key: "", name: "A", city: "B" })).toEqual({ ok: false, error: "pixKeyRequired" })
    expect(buildPixPayload({ key: "abc", name: "A", city: "B" })).toEqual({ ok: false, error: "pixKeyInvalid" })
    expect(buildPixPayload({ key: "fulano@exemplo.com", name: " ", city: "B" })).toEqual({ ok: false, error: "pixNameRequired" })
    expect(buildPixPayload({ key: "fulano@exemplo.com", name: "A", city: "" })).toEqual({ ok: false, error: "pixCityRequired" })
    expect(buildPixPayload({ key: "fulano@exemplo.com", name: "A", city: "B", amount: "-1" })).toEqual({
      ok: false,
      error: "pixAmountInvalid",
    })
  })
})

describe("detectPixKey", () => {
  it("detecta cada tipo de chave", () => {
    expect(detectPixKey("529.982.247-25")).toEqual({ type: "cpf", value: "52998224725" })
    expect(detectPixKey("52998224725")).toEqual({ type: "cpf", value: "52998224725" })
    expect(detectPixKey("11.222.333/0001-81")).toEqual({ type: "cnpj", value: "11222333000181" })
    expect(detectPixKey("Fulano@Exemplo.com")).toEqual({ type: "email", value: "fulano@exemplo.com" })
    expect(detectPixKey("+55 (11) 99999-8888")).toEqual({ type: "phone", value: "+5511999998888" })
    expect(detectPixKey("(11) 99999-8888")).toEqual({ type: "phone", value: "+5511999998888" })
    expect(detectPixKey("123E4567-E12B-12D1-A456-426655440000")?.type).toBe("evp")
  })

  it("rejeita CPF/CNPJ com dígito verificador errado e texto livre", () => {
    expect(detectPixKey("123.456.789-00")).toBeNull()
    expect(detectPixKey("11.222.333/0001-00")).toBeNull()
    expect(detectPixKey("minha chave")).toBeNull()
  })
})

describe("validação de documentos e valor", () => {
  it("valida CPF e CNPJ", () => {
    expect(isValidCpf("52998224725")).toBe(true)
    expect(isValidCpf("11111111111")).toBe(false)
    expect(isValidCnpj("11222333000181")).toBe(true)
    expect(isValidCnpj("00000000000000")).toBe(false)
  })

  it("normaliza valores em formato brasileiro e internacional", () => {
    expect(parsePixAmount("10")).toBe("10.00")
    expect(parsePixAmount("10,5")).toBe("10.50")
    expect(parsePixAmount("1.234,56")).toBe("1234.56")
    expect(parsePixAmount("R$ 99.90")).toBe("99.90")
    expect(parsePixAmount("0")).toBeNull()
    expect(parsePixAmount("1,234")).toBeNull()
    expect(parsePixAmount("abc")).toBeNull()
  })
})
