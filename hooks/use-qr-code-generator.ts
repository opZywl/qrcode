"use client"

import type React from "react"
import { useCallback, useRef } from "react"
import { useLanguage } from "@/components/language-provider"
import { toast } from "@/hooks/use-toast"
import { MESSAGES, PAYLOAD_ERROR_MESSAGES } from "@/lib/messages"
import {
  BACKGROUND_LIMITS,
  ImageReadFailure,
  LOGO_LIMITS,
  readImageFile,
  type ReadImageOptions,
} from "@/lib/qr/image"
import { buildQrEventPayload, type QrEventPayload } from "@/lib/qr/monitoring"
import { QR_BYTE_CAPACITY, buildQrPayload, fitsInQr, utf8Length } from "@/lib/qr/payload"
import { HISTORY_LIMIT, TEMPLATE_LIMIT, createId, normalizeTags } from "@/lib/qr/storage"
import {
  DEFAULT_APPEARANCE,
  DEFAULT_CONTENT,
  FRAMES_WITH_CUSTOM_TEXT,
  FRAMES_WITH_TEXT_AREA,
  contentDefaultsFor,
  pickContentFields,
  type EntradaQRCode,
  type NivelCorrecaoErro,
  type QrContentFields,
  type TipoConteudoQR,
  type TipoFrame,
  type VisualTemplateQRCode,
} from "@/lib/qr/types"
import type { QrState, QrStateApi } from "./use-qr-code-state"

const FRAME_TEXT_AREA_HEIGHT = 40
const FRAME_PADDING = 10
const FRAME_BORDER_RADIUS = 8

export type ResetKind = "content" | "appearance" | "basic" | "logo" | "background" | "frame" | "all"

interface VisualSource {
  corFrente: string
  corFundo: string
  tamanho: number
  nivel: NivelCorrecaoErro
  margem: number
  habilitarCustomizacaoLogo?: boolean
  logoDataUri?: string
  logoTamanhoRatio?: number
  escavarLogo?: boolean
  habilitarCustomizacaoFundo?: boolean
  imagemFundo?: string
  habilitarCustomizacaoFrame?: boolean
  tipoFrameSelecionado?: TipoFrame
  textoFrame?: string
}

interface GeneratorOptions {
  isMobile: boolean
  onGenerated?: () => void
}

function reportQrGenerated(payload: QrEventPayload) {
  try {
    void fetch("/api/qr-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {})
  } catch {}
}

function formattedNow() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("image"))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), type)
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function copyImageToClipboard(blob: Blob) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("clipboard")
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
}

function hasNonDefaultAppearance(source: VisualSource) {
  return (
    source.corFrente !== DEFAULT_APPEARANCE.corFrente ||
    source.corFundo !== DEFAULT_APPEARANCE.corFundo ||
    source.tamanho !== DEFAULT_APPEARANCE.tamanho ||
    source.nivel !== DEFAULT_APPEARANCE.nivelCorrecaoErro ||
    source.margem !== DEFAULT_APPEARANCE.zonaQuieta
  )
}

function contentFromEntry(entry: EntradaQRCode): Partial<QrContentFields> {
  const picked: Partial<QrContentFields> = {}
  for (const key of Object.keys(DEFAULT_CONTENT) as (keyof QrContentFields)[]) {
    if (entry[key] !== undefined) {
      Object.assign(picked, { [key]: entry[key] })
    }
  }
  return picked
}

export function useQRCodeGenerator(qrState: QrStateApi, { isMobile, onGenerated }: GeneratorOptions) {
  const { t, language } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundImageInputRef = useRef<HTMLInputElement>(null)
  const { updateFields } = qrState

  const clearFileInputs = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = ""
    }
  }, [])

  const applyVisualConfiguration = useCallback(
    (source: VisualSource) => {
      const hasLogo = !!(source.habilitarCustomizacaoLogo && source.logoDataUri)
      const hasBackground = !!(source.habilitarCustomizacaoFundo && source.imagemFundo)
      const hasFrame = !!(source.habilitarCustomizacaoFrame && source.tipoFrameSelecionado && source.tipoFrameSelecionado !== "none")
      const sections = [
        hasNonDefaultAppearance(source) && "appearance",
        hasLogo && "logo",
        hasBackground && "background",
        hasFrame && "frame",
      ].filter((section): section is string => Boolean(section))

      updateFields({
        corFrente: source.corFrente,
        corFundo: source.corFundo,
        tamanho: source.tamanho,
        nivelCorrecaoErro: source.nivel,
        zonaQuieta: source.margem,
        habilitarCustomizacaoLogo: hasLogo,
        habilitarCustomizacaoFundo: hasBackground,
        habilitarCustomizacaoFrame: hasFrame,
        logoDataUri: hasLogo ? (source.logoDataUri ?? "") : "",
        logoTamanhoRatio: hasLogo ? (source.logoTamanhoRatio ?? 0.2) : 0.2,
        escavarLogo: hasLogo ? (source.escavarLogo ?? true) : true,
        imagemFundo: hasBackground ? (source.imagemFundo ?? "") : "",
        tipoFrameSelecionado: hasFrame ? (source.tipoFrameSelecionado ?? "none") : "none",
        textoFrame: hasFrame ? (source.textoFrame ?? "") : "",
      })
      updateFields({ valoresAccordionMobile: sections })
      clearFileInputs()
    },
    [clearFileInputs, updateFields],
  )

  const handleGenerateQRCode = useCallback(() => {
    const tipo = qrState.tipoConteudoAtivo
    const result = buildQrPayload(tipo, qrState, language)
    if (!result.ok) {
      toast({ variant: "destructive", title: t(MESSAGES.checkFields), description: t(PAYLOAD_ERROR_MESSAGES[result.error]) })
      return
    }

    const level = qrState.nivelCorrecaoErro
    if (!fitsInQr(result.value, level)) {
      toast({
        variant: "destructive",
        title: t(MESSAGES.payloadTooLongTitle),
        description: t(MESSAGES.payloadTooLong(utf8Length(result.value), level, QR_BYTE_CAPACITY[level])),
      })
      return
    }

    const existing = qrState.historico.find(
      (entry) => entry.tipoConteudo === tipo && entry.valorQR === result.value && entry.inputOriginal === result.label,
    )
    const logoActive = qrState.habilitarCustomizacaoLogo && !!qrState.logoDataUri
    const backgroundActive = qrState.habilitarCustomizacaoFundo && !!qrState.imagemFundo
    const frameActive = qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"

    const entry: EntradaQRCode = {
      ...pickContentFields(tipo, qrState),
      id: existing?.id ?? createId(),
      tipoConteudo: tipo,
      inputOriginal: result.label,
      valorQR: result.value,
      favorite: existing?.favorite ?? false,
      tags: existing?.tags ?? [],
      corFrente: qrState.corFrente,
      corFundo: qrState.corFundo,
      tamanho: qrState.tamanho,
      nivel: level,
      margem: qrState.zonaQuieta,
      habilitarCustomizacaoLogo: logoActive,
      logoDataUri: logoActive ? qrState.logoDataUri : undefined,
      logoTamanhoRatio: logoActive ? qrState.logoTamanhoRatio : undefined,
      escavarLogo: logoActive ? qrState.escavarLogo : undefined,
      habilitarCustomizacaoFundo: backgroundActive,
      imagemFundo: backgroundActive ? qrState.imagemFundo : undefined,
      habilitarCustomizacaoFrame: frameActive,
      tipoFrameSelecionado: frameActive ? qrState.tipoFrameSelecionado : "none",
      textoFrame: frameActive && FRAMES_WITH_CUSTOM_TEXT.includes(qrState.tipoFrameSelecionado) ? qrState.textoFrame : undefined,
      timestamp: Date.now(),
    }

    updateFields({
      qrValue: result.value,
      qrTipo: tipo,
      ...(tipo === "url" ? { inputUrl: result.value } : {}),
      historico: [entry, ...qrState.historico.filter((item) => item.id !== entry.id)].slice(0, HISTORY_LIMIT),
    })

    toast({ title: t(MESSAGES.generatedTitle), description: t(MESSAGES.generated) })
    reportQrGenerated(buildQrEventPayload(entry, language, isMobile ? "mobile" : "desktop"))
    onGenerated?.()
  }, [isMobile, language, onGenerated, qrState, t, updateFields])

  const handleContentTypeChange = useCallback(
    (tipo: TipoConteudoQR) => {
      updateFields({ tipoConteudoAtivo: tipo })
    },
    [updateFields],
  )

  const resetGranular = useCallback(
    (kind: ResetKind = "all") => {
      const sections = qrState.valoresAccordionMobile
      switch (kind) {
        case "content":
          updateFields({ ...contentDefaultsFor(qrState.tipoConteudoAtivo), qrValue: "", qrTipo: null })
          toast({ title: t(MESSAGES.contentClearedTitle), description: t(MESSAGES.contentCleared) })
          return
        case "appearance":
        case "basic":
          updateFields({
            corFrente: DEFAULT_APPEARANCE.corFrente,
            corFundo: DEFAULT_APPEARANCE.corFundo,
            tamanho: DEFAULT_APPEARANCE.tamanho,
            nivelCorrecaoErro: DEFAULT_APPEARANCE.nivelCorrecaoErro,
            zonaQuieta: DEFAULT_APPEARANCE.zonaQuieta,
          })
          toast({ title: t(MESSAGES.appearanceResetTitle), description: t(MESSAGES.appearanceReset) })
          return
        case "logo":
          updateFields({ logoDataUri: "", logoTamanhoRatio: 0.2, escavarLogo: true, habilitarCustomizacaoLogo: false })
          updateFields({ valoresAccordionMobile: sections.filter((section) => section !== "logo") })
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          toast({ title: t(MESSAGES.logoRemovedTitle), description: t(MESSAGES.logoRemoved) })
          return
        case "background":
          updateFields({ imagemFundo: "", habilitarCustomizacaoFundo: false })
          updateFields({ valoresAccordionMobile: sections.filter((section) => section !== "background") })
          if (backgroundImageInputRef.current) {
            backgroundImageInputRef.current.value = ""
          }
          toast({ title: t(MESSAGES.backgroundRemovedTitle), description: t(MESSAGES.backgroundRemoved) })
          return
        case "frame":
          updateFields({ tipoFrameSelecionado: "none", textoFrame: "", habilitarCustomizacaoFrame: false })
          updateFields({ valoresAccordionMobile: sections.filter((section) => section !== "frame") })
          toast({ title: t(MESSAGES.frameRemovedTitle), description: t(MESSAGES.frameRemoved) })
          return
        case "all":
          updateFields({ ...DEFAULT_CONTENT, ...DEFAULT_APPEARANCE, qrValue: "", qrTipo: null })
          updateFields({ valoresAccordionMobile: [] })
          clearFileInputs()
          toast({ title: t(MESSAGES.allResetTitle), description: t(MESSAGES.allReset) })
      }
    },
    [clearFileInputs, qrState.tipoConteudoAtivo, qrState.valoresAccordionMobile, t, updateFields],
  )

  const resetAppearanceCustomization = useCallback(() => resetGranular("all"), [resetGranular])

  const loadFromHistory = useCallback(
    (entry: EntradaQRCode) => {
      updateFields({
        ...DEFAULT_CONTENT,
        ...contentFromEntry(entry),
        ...(entry.tipoConteudo === "url" ? { inputUrl: entry.inputOriginal } : {}),
        tipoConteudoAtivo: entry.tipoConteudo,
        qrValue: entry.valorQR,
        qrTipo: entry.tipoConteudo,
      })
      if (!qrState.tiposVisiveis.includes(entry.tipoConteudo)) {
        updateFields({ tiposVisiveis: [...qrState.tiposVisiveis, entry.tipoConteudo] })
      }
      applyVisualConfiguration(entry)
      toast({ title: t(MESSAGES.historyLoadedTitle), description: t(MESSAGES.historyLoaded) })
    },
    [applyVisualConfiguration, qrState.tiposVisiveis, t, updateFields],
  )

  const clearHistory = useCallback(() => {
    updateFields({ historico: [] })
    toast({ title: t(MESSAGES.historyClearedTitle), description: t(MESSAGES.historyCleared) })
  }, [t, updateFields])

  const toggleHistoryFavorite = useCallback(
    (entryId: string) => {
      const target = qrState.historico.find((entry) => entry.id === entryId)
      if (!target) {
        return
      }
      updateFields({
        historico: qrState.historico.map((entry) => (entry.id === entryId ? { ...entry, favorite: !entry.favorite } : entry)),
      })
      toast(
        target.favorite
          ? { title: t(MESSAGES.favoriteRemovedTitle), description: t(MESSAGES.favoriteRemoved) }
          : { title: t(MESSAGES.favoriteAddedTitle), description: t(MESSAGES.favoriteAdded) },
      )
    },
    [qrState.historico, t, updateFields],
  )

  const updateHistoryTags = useCallback(
    (entryId: string, tags: string[]) => {
      updateFields({
        historico: qrState.historico.map((entry) => (entry.id === entryId ? { ...entry, tags: normalizeTags(tags) } : entry)),
      })
    },
    [qrState.historico, updateFields],
  )

  const removeHistoryEntry = useCallback(
    (entryId: string) => {
      updateFields({ historico: qrState.historico.filter((entry) => entry.id !== entryId) })
      toast({ title: t(MESSAGES.historyItemRemovedTitle), description: t(MESSAGES.historyItemRemoved) })
    },
    [qrState.historico, t, updateFields],
  )

  const saveVisualTemplate = useCallback(
    (name: string, templateId?: string) => {
      const existing = templateId ? qrState.templatesVisuais.find((template) => template.id === templateId) : undefined
      const logoActive = qrState.habilitarCustomizacaoLogo && !!qrState.logoDataUri
      const backgroundActive = qrState.habilitarCustomizacaoFundo && !!qrState.imagemFundo
      const frameActive = qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
      const timestamp = Date.now()
      const template: VisualTemplateQRCode = {
        id: existing?.id ?? createId(),
        name:
          name.trim().slice(0, 60) ||
          existing?.name ||
          t(MESSAGES.templateName(Math.min(qrState.templatesVisuais.length + 1, TEMPLATE_LIMIT))),
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        corFrente: qrState.corFrente,
        corFundo: qrState.corFundo,
        tamanho: qrState.tamanho,
        nivel: qrState.nivelCorrecaoErro,
        margem: qrState.zonaQuieta,
        habilitarCustomizacaoLogo: logoActive,
        logoDataUri: logoActive ? qrState.logoDataUri : undefined,
        logoTamanhoRatio: logoActive ? qrState.logoTamanhoRatio : undefined,
        escavarLogo: logoActive ? qrState.escavarLogo : undefined,
        habilitarCustomizacaoFundo: backgroundActive,
        imagemFundo: backgroundActive ? qrState.imagemFundo : undefined,
        habilitarCustomizacaoFrame: frameActive,
        tipoFrameSelecionado: frameActive ? qrState.tipoFrameSelecionado : "none",
        textoFrame: frameActive ? qrState.textoFrame : undefined,
      }

      updateFields({
        templatesVisuais: [template, ...qrState.templatesVisuais.filter((item) => item.id !== template.id)].slice(0, TEMPLATE_LIMIT),
      })
      toast({
        title: t(existing ? MESSAGES.templateUpdatedTitle : MESSAGES.templateSavedTitle),
        description: t(MESSAGES.templateReady(template.name)),
      })
    },
    [qrState, t, updateFields],
  )

  const applyVisualTemplate = useCallback(
    (template: VisualTemplateQRCode) => {
      applyVisualConfiguration(template)
      toast({ title: t(MESSAGES.templateAppliedTitle), description: t(MESSAGES.templateApplied(template.name)) })
    },
    [applyVisualConfiguration, t],
  )

  const deleteVisualTemplate = useCallback(
    (templateId: string) => {
      updateFields({ templatesVisuais: qrState.templatesVisuais.filter((template) => template.id !== templateId) })
      toast({ title: t(MESSAGES.templateRemovedTitle), description: t(MESSAGES.templateRemoved) })
    },
    [qrState.templatesVisuais, t, updateFields],
  )

  const getFrameMeta = useCallback(() => {
    const frameActive = qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
    const frameHeight = frameActive && FRAMES_WITH_TEXT_AREA.includes(qrState.tipoFrameSelecionado) ? FRAME_TEXT_AREA_HEIGHT : 0
    const padding = frameActive ? FRAME_PADDING : 0
    return {
      frameActive,
      frameHeight,
      totalWidth: qrState.tamanho + padding * 2,
      totalHeight: qrState.tamanho + frameHeight + padding * 2,
      qrX: padding,
      qrY: padding,
    }
  }, [qrState.habilitarCustomizacaoFrame, qrState.tamanho, qrState.tipoFrameSelecionado])

  const buildExportCanvas = useCallback(async () => {
    const source = document.getElementById("qr-export-canvas")
    if (!(source instanceof HTMLCanvasElement)) {
      throw new Error("canvas")
    }

    const meta = getFrameMeta()
    const canvas = document.createElement("canvas")
    canvas.width = meta.totalWidth
    canvas.height = meta.totalHeight
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("context")
    }

    context.fillStyle = qrState.corFundo
    context.fillRect(0, 0, meta.totalWidth, meta.totalHeight)

    if (qrState.habilitarCustomizacaoFundo && qrState.imagemFundo) {
      try {
        context.drawImage(await loadImage(qrState.imagemFundo), 0, 0, meta.totalWidth, meta.totalHeight)
      } catch {}
    }

    context.drawImage(source, meta.qrX, meta.qrY, qrState.tamanho, qrState.tamanho)

    if (meta.frameActive) {
      const size = qrState.tamanho
      const { qrX: x, qrY: y } = meta
      context.strokeStyle = qrState.corFrente
      context.lineWidth = 2

      if (qrState.tipoFrameSelecionado === "roundedBorderTextBottom") {
        context.beginPath()
        context.roundRect(x, y, size, size, FRAME_BORDER_RADIUS)
        context.stroke()
      } else if (qrState.tipoFrameSelecionado === "decorativeBorder") {
        const corner = 20
        context.lineWidth = 3
        const corners: Array<[number, number, number, number, number, number]> = [
          [x, y + corner, x, y, x + corner, y],
          [x + size - corner, y, x + size, y, x + size, y + corner],
          [x, y + size - corner, x, y + size, x + corner, y + size],
          [x + size - corner, y + size, x + size, y + size, x + size, y + size - corner],
        ]
        for (const [ax, ay, bx, by, cx, cy] of corners) {
          context.beginPath()
          context.moveTo(ax, ay)
          context.lineTo(bx, by)
          context.lineTo(cx, cy)
          context.stroke()
        }
      } else {
        context.strokeRect(x, y, size, size)
      }

      if (meta.frameHeight > 0) {
        const label = qrState.tipoFrameSelecionado === "scanMeBottom" ? "SCAN ME" : qrState.textoFrame || "QR CODE"
        context.fillStyle = qrState.corFrente
        context.font = "bold 16px Arial, sans-serif"
        context.textAlign = "center"
        context.textBaseline = "middle"
        if (qrState.tipoFrameSelecionado === "topBottomText") {
          context.fillText("QR CODE", meta.totalWidth / 2, FRAME_PADDING / 2)
        }
        context.fillText(label, meta.totalWidth / 2, y + size + FRAME_PADDING + meta.frameHeight / 2)
      }
    }

    return canvas
  }, [getFrameMeta, qrState])

  const buildExportSvgBlob = useCallback(async () => {
    const meta = getFrameMeta()
    const svg = document.getElementById("qr-export-svg")
    if (svg instanceof SVGSVGElement && !meta.frameActive && !(qrState.habilitarCustomizacaoFundo && qrState.imagemFundo)) {
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      return new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" })
    }

    const canvas = await buildExportCanvas()
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.totalWidth}" height="${meta.totalHeight}" viewBox="0 0 ${meta.totalWidth} ${meta.totalHeight}"><image href="${canvas.toDataURL("image/png")}" width="100%" height="100%"/></svg>`
    return new Blob([markup], { type: "image/svg+xml;charset=utf-8" })
  }, [buildExportCanvas, getFrameMeta, qrState.habilitarCustomizacaoFundo, qrState.imagemFundo])

  const handleDownloadQRCode = useCallback(
    async (format: "png" | "svg" = "png") => {
      if (!qrState.qrValue) {
        toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.nothingGenerated) })
        return
      }
      try {
        const filename = `qrcode_${formattedNow()}.${format}`
        const blob = format === "png" ? await canvasToBlob(await buildExportCanvas(), "image/png") : await buildExportSvgBlob()
        downloadBlob(blob, filename)
        toast({ title: t(MESSAGES.downloadDoneTitle), description: t(MESSAGES.downloadDone(filename)) })
      } catch {
        toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.downloadFailed) })
      }
    },
    [buildExportCanvas, buildExportSvgBlob, qrState.qrValue, t],
  )

  const handleCopyQRCodeImage = useCallback(async (): Promise<boolean> => {
    if (!qrState.qrValue) {
      toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.nothingGenerated) })
      return false
    }
    try {
      await copyImageToClipboard(await canvasToBlob(await buildExportCanvas(), "image/png"))
      toast({ title: t(MESSAGES.imageCopiedTitle), description: t(MESSAGES.imageCopied) })
      return true
    } catch {}
    try {
      await navigator.clipboard.writeText(qrState.qrValue)
      toast({ title: t(MESSAGES.textCopiedTitle), description: t(MESSAGES.textCopiedFallback) })
      return true
    } catch {
      toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.copyFailed) })
      return false
    }
  }, [buildExportCanvas, qrState.qrValue, t])

  const handleShareQRCode = useCallback(async () => {
    if (!qrState.qrValue) {
      toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.nothingGenerated) })
      return
    }
    let blob: Blob
    try {
      blob = await canvasToBlob(await buildExportCanvas(), "image/png")
    } catch {
      toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.shareFailed) })
      return
    }

    if (typeof navigator.share === "function") {
      const file = new File([blob], `qrcode_${formattedNow()}.png`, { type: "image/png" })
      const data: ShareData =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })
          ? { title: t(MESSAGES.shareTitle), text: t(MESSAGES.shareText), files: [file] }
          : { title: t(MESSAGES.shareTitle), text: qrState.qrValue }
      try {
        await navigator.share(data)
        toast({ title: t(MESSAGES.sharedTitle), description: t(MESSAGES.shared) })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    try {
      await copyImageToClipboard(blob)
      toast({ title: t(MESSAGES.imageCopiedTitle), description: t(MESSAGES.shareFallbackImage) })
      return
    } catch {}
    try {
      await navigator.clipboard.writeText(qrState.qrValue)
      toast({ title: t(MESSAGES.textCopiedTitle), description: t(MESSAGES.shareFallbackText) })
    } catch {
      toast({ variant: "destructive", title: t(MESSAGES.error), description: t(MESSAGES.shareFailed) })
    }
  }, [buildExportCanvas, qrState.qrValue, t])

  const readUpload = useCallback(
    async (file: File, limits: ReadImageOptions): Promise<string | null> => {
      try {
        return await readImageFile(file, limits)
      } catch (error) {
        const reason = error instanceof ImageReadFailure ? error.reason : "decode"
        toast({
          variant: "destructive",
          title: t(MESSAGES.uploadErrorTitle),
          description: t(
            reason === "unsupported"
              ? MESSAGES.uploadUnsupported
              : reason === "tooLarge"
                ? MESSAGES.uploadTooLarge(Math.round(limits.maxBytes / (1024 * 1024)))
                : MESSAGES.uploadDecode,
          ),
        })
        return null
      }
    },
    [t],
  )

  const uploadLogoFile = useCallback(
    async (file: File) => {
      const dataUrl = await readUpload(file, LOGO_LIMITS)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (!dataUrl) {
        return
      }
      updateFields({ logoDataUri: dataUrl, habilitarCustomizacaoLogo: true })
      toast({ title: t(MESSAGES.logoLoadedTitle), description: t(MESSAGES.logoLoaded) })
    },
    [readUpload, t, updateFields],
  )

  const uploadBackgroundFile = useCallback(
    async (file: File) => {
      const dataUrl = await readUpload(file, BACKGROUND_LIMITS)
      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = ""
      }
      if (!dataUrl) {
        return
      }
      updateFields({ imagemFundo: dataUrl, habilitarCustomizacaoFundo: true })
      toast({ title: t(MESSAGES.backgroundLoadedTitle), description: t(MESSAGES.backgroundLoaded) })
    },
    [readUpload, t, updateFields],
  )

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        void uploadLogoFile(file)
      }
    },
    [uploadLogoFile],
  )

  const handleBackgroundImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        void uploadBackgroundFile(file)
      }
    },
    [uploadBackgroundFile],
  )

  const removeBackgroundImageFile = useCallback(() => {
    updateFields({ imagemFundo: "" })
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = ""
    }
    toast({ title: t(MESSAGES.backgroundRemovedTitle), description: t(MESSAGES.backgroundRemoved) })
  }, [t, updateFields])

  return {
    fileInputRef,
    backgroundImageInputRef,
    handleGenerateQRCode,
    handleContentTypeChange,
    resetAppearanceCustomization,
    resetGranular,
    loadFromHistory,
    clearHistory,
    toggleHistoryFavorite,
    updateHistoryTags,
    removeHistoryEntry,
    saveVisualTemplate,
    applyVisualTemplate,
    deleteVisualTemplate,
    handleDownloadQRCode,
    handleCopyQRCodeImage,
    handleShareQRCode,
    handleLogoUpload,
    handleBackgroundImageUpload,
    uploadLogoFile,
    uploadBackgroundFile,
    removeBackgroundImageFile,
  }
}

export type QrGeneratorApi = ReturnType<typeof useQRCodeGenerator>
export type { QrState }
