import { describe, expect, it } from "vitest"
import {
  HISTORY_LIMIT,
  isSafeImageDataUrl,
  normalizeTags,
  sanitizeHistory,
  sanitizeHistoryEntry,
  sanitizeTemplates,
  sanitizeVisibleTypes,
} from "./storage"

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

describe("sanitizeHistoryEntry", () => {
  it("normaliza valores fora do padrão", () => {
    const entry = sanitizeHistoryEntry({
      id: "1",
      tipoConteudo: "url",
      inputOriginal: "a",
      valorQR: "https://a.com",
      corFrente: "red",
      corFundo: "#ABCDEF",
      tamanho: 99999,
      nivel: "Z",
      margem: -5,
      tags: ["  x ", "x", 3, "y"],
      timestamp: 10,
    })
    expect(entry).toMatchObject({
      corFrente: "#000000",
      corFundo: "#ABCDEF",
      tamanho: 1000,
      nivel: "H",
      margem: 0,
      tags: ["x", "y"],
    })
  })

  it("descarta imagens que não são data URL de imagem", () => {
    const entry = sanitizeHistoryEntry({
      id: "1",
      tipoConteudo: "url",
      valorQR: "x",
      logoDataUri: "javascript:alert(1)",
      imagemFundo: "data:text/html;base64,PHNjcmlwdD4=",
      habilitarCustomizacaoLogo: true,
      habilitarCustomizacaoFundo: true,
    })
    expect(entry?.logoDataUri).toBeUndefined()
    expect(entry?.imagemFundo).toBeUndefined()
    expect(entry?.habilitarCustomizacaoLogo).toBe(false)
    expect(entry?.habilitarCustomizacaoFundo).toBe(false)
  })

  it("rejeita tipos desconhecidos e conteúdo maior que a capacidade do QR", () => {
    expect(sanitizeHistoryEntry({ tipoConteudo: "hack", valorQR: "x" })).toBeNull()
    expect(sanitizeHistoryEntry({ tipoConteudo: "url", valorQR: "a".repeat(2000), nivel: "H" })).toBeNull()
    expect(sanitizeHistoryEntry("texto")).toBeNull()
  })
})

describe("sanitizeHistory e templates", () => {
  it("aceita apenas arrays, remove duplicados e respeita o limite", () => {
    expect(sanitizeHistory({})).toEqual([])
    const many = Array.from({ length: 40 }, (_, index) => ({ id: String(index % 30), tipoConteudo: "url", valorQR: "x" }))
    const history = sanitizeHistory(many)
    expect(history).toHaveLength(HISTORY_LIMIT)
    expect(new Set(history.map((entry) => entry.id)).size).toBe(HISTORY_LIMIT)
  })

  it("mantém templates válidos com imagem segura", () => {
    const [template] = sanitizeTemplates([
      { id: "t", name: "  Tema  ", logoDataUri: PNG, habilitarCustomizacaoLogo: true, createdAt: 1, updatedAt: 2 },
      { name: "" },
    ])
    expect(template).toMatchObject({ id: "t", name: "Tema", habilitarCustomizacaoLogo: true, logoDataUri: PNG })
  })
})

describe("utilitários", () => {
  it("valida data URLs de imagem", () => {
    expect(isSafeImageDataUrl(PNG)).toBe(true)
    expect(isSafeImageDataUrl("data:image/svg+xml;utf8,<svg onload=alert(1)>")).toBe(false)
    expect(isSafeImageDataUrl("https://example.com/a.png")).toBe(false)
  })

  it("filtra tipos visíveis e normaliza tags", () => {
    expect(sanitizeVisibleTypes(["url", "hack", "url", "pix"])).toEqual(["url", "pix"])
    expect(sanitizeVisibleTypes([])).toBeNull()
    expect(normalizeTags(["a".repeat(40), "b", "b", "", ...Array(10).fill("c")])).toEqual(["a".repeat(24), "b", "c"])
  })
})
