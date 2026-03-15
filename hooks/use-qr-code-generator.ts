"use client"

import type React from "react"

import { useState, useCallback, useRef, useMemo } from "react"
import type { AppLanguage } from "@/components/language-provider"
import type { useQRCodeState, TipoConteudoQR, EntradaQRCode, VisualTemplateQRCode } from "./use-qr-code-state"

const FRAME_TEXT_AREA_HEIGHT = 40
const FRAME_PADDING = 10
const FRAME_BORDER_RADIUS = 8
const HISTORY_LIMIT = 24
const TEMPLATE_LIMIT = 12

// Cache para otimizaÃ§Ã£o de performance
const urlValidationCache = new Map<string, string>()
const MAX_CACHE_SIZE = 100

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 24)),
    ),
  ).slice(0, 8)
}

type VisualSource = Pick<
  EntradaQRCode,
  | "corFrente"
  | "corFundo"
  | "tamanho"
  | "nivel"
  | "margem"
  | "habilitarCustomizacaoLogo"
  | "logoDataUri"
  | "logoTamanhoRatio"
  | "escavarLogo"
  | "habilitarCustomizacaoFundo"
  | "imagemFundo"
  | "habilitarCustomizacaoFrame"
  | "tipoFrameSelecionado"
  | "textoFrame"
> &
  Partial<VisualTemplateQRCode>

export function useQRCodeGenerator(
    qrState: ReturnType<typeof useQRCodeState>,
    toast: any,
    language: AppLanguage = "pt",
    isMobile?: boolean,
    onCloseControls?: () => void,
) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundImageInputRef = useRef<HTMLInputElement>(null)
  const localeTag = language === "en" ? "en-US" : "pt-BR"
  const text = useCallback(
    (pt: string, en: string) => (language === "en" ? en : pt),
    [language],
  )

  const hasNonDefaultAppearance = useCallback((source: VisualSource) => {
    return (
      source.corFrente !== "#000000" ||
      source.corFundo !== "#FFFFFF" ||
      source.tamanho !== 256 ||
      source.nivel !== "H" ||
      source.margem !== 4
    )
  }, [])

  const buildAccordionValuesFromAppearance = useCallback(
    (source: VisualSource) => {
      const nextValues: string[] = []

      if (hasNonDefaultAppearance(source)) {
        nextValues.push("appearance")
      }

      if (source.habilitarCustomizacaoLogo && source.logoDataUri) {
        nextValues.push("logo")
      }

      if (source.habilitarCustomizacaoFundo && source.imagemFundo) {
        nextValues.push("background")
      }

      if (source.habilitarCustomizacaoFrame && source.tipoFrameSelecionado && source.tipoFrameSelecionado !== "none") {
        nextValues.push("frame")
      }

      return nextValues
    },
    [hasNonDefaultAppearance],
  )

  const applyVisualConfiguration = useCallback(
    (source: VisualSource) => {
      qrState.updateField("corFrente", source.corFrente)
      qrState.updateField("corFundo", source.corFundo)
      qrState.updateField("tamanho", source.tamanho)
      qrState.updateField("nivelCorrecaoErro", source.nivel)
      qrState.updateField("zonaQuieta", source.margem)

      const hasLogo = !!(source.habilitarCustomizacaoLogo && source.logoDataUri)
      const hasBackground = !!(source.habilitarCustomizacaoFundo && source.imagemFundo)
      const hasFrame = !!(
        source.habilitarCustomizacaoFrame &&
        source.tipoFrameSelecionado &&
        source.tipoFrameSelecionado !== "none"
      )

      qrState.updateField("habilitarCustomizacaoLogo", hasLogo)
      qrState.updateField("habilitarCustomizacaoFundo", hasBackground)
      qrState.updateField("habilitarCustomizacaoFrame", hasFrame)
      qrState.updateField("valoresAccordionMobile", buildAccordionValuesFromAppearance(source))

      qrState.updateField("logoDataUri", hasLogo ? source.logoDataUri : "")
      qrState.updateField("logoTamanhoRatio", hasLogo ? source.logoTamanhoRatio || 0.2 : 0.2)
      qrState.updateField("escavarLogo", hasLogo ? source.escavarLogo ?? true : true)

      qrState.updateField("imagemFundo", hasBackground ? source.imagemFundo : "")
      qrState.updateField("tipoFrameSelecionado", hasFrame ? source.tipoFrameSelecionado : "none")
      qrState.updateField("textoFrame", hasFrame ? source.textoFrame || "" : "")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = ""
      }
    },
    [buildAccordionValuesFromAppearance, qrState],
  )

  const applyContentFromHistory = useCallback(
    (entrada: EntradaQRCode) => {
      qrState.resetCamposEspecificos()
      qrState.updateField("tipoConteudoAtivo", entrada.tipoConteudo)

      if (entrada.tipoConteudo === "url") {
        qrState.updateField("inputUrl", entrada.inputOriginal)
      }

      qrState.updateField("wifiSsid", entrada.wifiSsid || "")
      qrState.updateField("wifiSenha", entrada.wifiSenha || "")
      qrState.updateField("wifiEncriptacao", entrada.wifiEncriptacao || "WPA")
      qrState.updateField("wifiOculto", entrada.wifiOculto || false)

      qrState.updateField("vcardNome", entrada.vcardNome || "")
      qrState.updateField("vcardSobrenome", entrada.vcardSobrenome || "")
      qrState.updateField("vcardOrganizacao", entrada.vcardOrganizacao || "")
      qrState.updateField("vcardTitulo", entrada.vcardTitulo || "")
      qrState.updateField("vcardTelefone", entrada.vcardTelefone || "")
      qrState.updateField("vcardEmail", entrada.vcardEmail || "")
      qrState.updateField("vcardWebsite", entrada.vcardWebsite || "")
      qrState.updateField("vcardEndereco", entrada.vcardEndereco || "")
      qrState.updateField("vcardCidade", entrada.vcardCidade || "")
      qrState.updateField("vcardEstado", entrada.vcardEstado || "")
      qrState.updateField("vcardCep", entrada.vcardCep || "")
      qrState.updateField("vcardPais", entrada.vcardPais || "")

      qrState.updateField("veventResumo", entrada.veventResumo || "")
      qrState.updateField("veventDescricao", entrada.veventDescricao || "")
      qrState.updateField("veventLocalizacao", entrada.veventLocalizacao || "")
      qrState.updateField("veventDataInicio", entrada.veventDataInicio || "")
      qrState.updateField("veventHoraInicio", entrada.veventHoraInicio || "")
      qrState.updateField("veventDataFim", entrada.veventDataFim || "")
      qrState.updateField("veventHoraFim", entrada.veventHoraFim || "")
      qrState.updateField("veventDiaTodo", entrada.veventDiaTodo || false)

      qrState.updateField("emailPara", entrada.emailPara || "")
      qrState.updateField("emailAssunto", entrada.emailAssunto || "")
      qrState.updateField("emailCorpo", entrada.emailCorpo || "")

      qrState.updateField("smsPara", entrada.smsPara || "")
      qrState.updateField("smsCorpo", entrada.smsCorpo || "")

      qrState.updateField("geoLatitude", entrada.geoLatitude || "")
      qrState.updateField("geoLongitude", entrada.geoLongitude || "")

      qrState.updateField("whatsappPara", entrada.whatsappPara || "")
      qrState.updateField("whatsappMensagem", entrada.whatsappMensagem || "")
      qrState.updateField("whatsappGroupLink", entrada.whatsappGroupLink || "")
      qrState.updateField("whatsappGroupMensagem", entrada.whatsappGroupMensagem || "")

      qrState.updateField("telefonePara", entrada.telefonePara || "")

      qrState.updateField("pixChave", entrada.pixChave || "")
      qrState.updateField("pixNome", entrada.pixNome || "")
      qrState.updateField("pixCidade", entrada.pixCidade || "")
      qrState.updateField("pixValor", entrada.pixValor || "")
      qrState.updateField("pixDescricao", entrada.pixDescricao || "")

      qrState.updateField("appstorePlataforma", entrada.appstorePlataforma || "ambos")
      qrState.updateField("appstoreIosUrl", entrada.appstoreIosUrl || "")
      qrState.updateField("appstoreAndroidUrl", entrada.appstoreAndroidUrl || "")
      qrState.updateField("appstoreNome", entrada.appstoreNome || "")

      qrState.updateField("spotifyTipo", entrada.spotifyTipo || "track")
      qrState.updateField("spotifyUrl", entrada.spotifyUrl || "")
      qrState.updateField("spotifyTitulo", entrada.spotifyTitulo || "")
      qrState.updateField("spotifyArtista", entrada.spotifyArtista || "")

      qrState.updateField("zoomTipo", entrada.zoomTipo || "zoom")
      qrState.updateField("zoomUrl", entrada.zoomUrl || "")
      qrState.updateField("zoomId", entrada.zoomId || "")
      qrState.updateField("zoomSenha", entrada.zoomSenha || "")
      qrState.updateField("zoomTitulo", entrada.zoomTitulo || "")

      qrState.updateField("menuNome", entrada.menuNome || "")
      qrState.updateField("menuDescricao", entrada.menuDescricao || "")
      qrState.updateField("menuItens", entrada.menuItens || "")
      qrState.updateField("menuPreco", entrada.menuPreco || "")
      qrState.updateField("menuCategoria", entrada.menuCategoria || "")

      qrState.updateField("cupomCodigo", entrada.cupomCodigo || "")
      qrState.updateField("cupomDescricao", entrada.cupomDescricao || "")
      qrState.updateField("cupomValor", entrada.cupomValor || "")
      qrState.updateField("cupomValidade", entrada.cupomValidade || "")
      qrState.updateField("cupomTipo", entrada.cupomTipo || "desconto")

      qrState.updateField("qrValue", entrada.valorQR)
    },
    [qrState],
  )

  // MemoizaÃ§Ã£o da validaÃ§Ã£o de URL para performance
  const sanitizeAndValidateUrl = useMemo(() => {
    return (inputUrl: string): string => {
      const currentUrl = inputUrl.trim()
      if (!currentUrl) return ""

      // Verificar cache primeiro
      if (urlValidationCache.has(currentUrl)) {
        return urlValidationCache.get(currentUrl)!
      }

      let result = currentUrl

      // Corrigir protocolos malformados
      if (/^https?:[^/][^/]/i.test(currentUrl) && !/^https?:\/\//i.test(currentUrl)) {
        result = currentUrl.replace(/^(https?:)/i, "$1//")
      }

      // Protocolos jÃ¡ vÃ¡lidos
      const protocolRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|mailto:|tel:|geo:|sms:|smsto:|vcard:|vevent:|whatsapp:)/i
      if (protocolRegex.test(result)) {
        // Adicionar ao cache
        if (urlValidationCache.size >= MAX_CACHE_SIZE) {
          const firstKey = urlValidationCache.keys().next().value
          if (firstKey) {
            urlValidationCache.delete(firstKey)
          }
        }
        urlValidationCache.set(currentUrl, result)
        return result
      }

      // Localhost e IPs
      const localhostRegex = /^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/
      if (localhostRegex.test(result)) {
        result = `http://${result}`
        urlValidationCache.set(currentUrl, result)
        return result
      }

      // DomÃ­nios vÃ¡lidos
      const domainLikeRegex = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}(:\d+)?(\/.*)?$/
      if (domainLikeRegex.test(result) || (result.includes(".") && !result.includes(" ") && !result.startsWith("/"))) {
        result = `https://${result}`
        urlValidationCache.set(currentUrl, result)
        return result
      }

      // URLs com www
      if (result.startsWith("www.")) {
        result = `https://${result}`
        urlValidationCache.set(currentUrl, result)
        return result
      }

      // URLs com subdomÃ­nios comuns
      const commonSubdomains = ["app.", "api.", "admin.", "blog.", "shop.", "store.", "mail."]
      for (const subdomain of commonSubdomains) {
        if (result.startsWith(subdomain)) {
          result = `https://${result}`
          urlValidationCache.set(currentUrl, result)
          return result
        }
      }

      urlValidationCache.set(currentUrl, result)
      return result
    }
  }, [])

  // FunÃ§Ãµes de escape otimizadas
  const escapeVCardString = useCallback((str: string | undefined): string => {
    if (!str) return ""
    return str.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n")
  }, [])

  const formatDateForVEvent = useCallback((dateStr: string, timeStr: string, isAllDay: boolean): string => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ""

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")

    if (isAllDay) {
      return `${year}${month}${day}`
    }

    const [hours, minutes] = timeStr ? timeStr.split(":").map((s) => s.padStart(2, "0")) : ["00", "00"]
    return `${year}${month}${day}T${hours}${minutes}00Z`
  }, [])

  const getFrameMeta = useCallback(() => {
    const frameActive = qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
    const frameHeight =
      frameActive &&
      (qrState.tipoFrameSelecionado === "textBottom" ||
        qrState.tipoFrameSelecionado === "scanMeBottom" ||
        qrState.tipoFrameSelecionado === "roundedBorderTextBottom" ||
        qrState.tipoFrameSelecionado === "topBottomText")
        ? FRAME_TEXT_AREA_HEIGHT
        : 0

    return {
      frameActive,
      frameHeight,
      totalWidth: qrState.tamanho + (frameActive ? FRAME_PADDING * 2 : 0),
      totalHeight: qrState.tamanho + frameHeight + (frameActive ? FRAME_PADDING * 2 : 0),
      qrX: frameActive ? FRAME_PADDING : 0,
      qrY: frameActive ? FRAME_PADDING : 0,
    }
  }, [
    qrState.habilitarCustomizacaoFrame,
    qrState.tipoFrameSelecionado,
    qrState.tamanho,
  ])

  const getExportTargets = useCallback(() => {
    const canvas = document.getElementById("qr-export-canvas") as HTMLCanvasElement | null
    const svg = document.getElementById("qr-export-svg") as SVGSVGElement | null

    return { canvas, svg }
  }, [])

  const loadImage = useCallback((src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("Falha ao carregar imagem"))
      image.src = src
    })
  }, [])

  const drawFrameOnCanvas = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      meta: {
        frameActive: boolean
        frameHeight: number
        totalWidth: number
        qrX: number
        qrY: number
      },
    ) => {
      if (!meta.frameActive) {
        return
      }

      ctx.strokeStyle = qrState.corFrente
      ctx.lineWidth = 2

      if (qrState.tipoFrameSelecionado === "roundedBorderTextBottom") {
        ctx.beginPath()
        ctx.roundRect(meta.qrX, meta.qrY, qrState.tamanho, qrState.tamanho, FRAME_BORDER_RADIUS)
        ctx.stroke()
      } else if (qrState.tipoFrameSelecionado === "decorativeBorder") {
        const cornerSize = 20
        ctx.lineWidth = 3

        ctx.beginPath()
        ctx.moveTo(meta.qrX, meta.qrY + cornerSize)
        ctx.lineTo(meta.qrX, meta.qrY)
        ctx.lineTo(meta.qrX + cornerSize, meta.qrY)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(meta.qrX + qrState.tamanho - cornerSize, meta.qrY)
        ctx.lineTo(meta.qrX + qrState.tamanho, meta.qrY)
        ctx.lineTo(meta.qrX + qrState.tamanho, meta.qrY + cornerSize)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(meta.qrX, meta.qrY + qrState.tamanho - cornerSize)
        ctx.lineTo(meta.qrX, meta.qrY + qrState.tamanho)
        ctx.lineTo(meta.qrX + cornerSize, meta.qrY + qrState.tamanho)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(meta.qrX + qrState.tamanho - cornerSize, meta.qrY + qrState.tamanho)
        ctx.lineTo(meta.qrX + qrState.tamanho, meta.qrY + qrState.tamanho)
        ctx.lineTo(meta.qrX + qrState.tamanho, meta.qrY + qrState.tamanho - cornerSize)
        ctx.stroke()
      } else {
        ctx.strokeRect(meta.qrX, meta.qrY, qrState.tamanho, qrState.tamanho)
      }

      if (meta.frameHeight <= 0) {
        return
      }

      const text = qrState.tipoFrameSelecionado === "scanMeBottom" ? "SCAN ME" : qrState.textoFrame || "QR CODE"

      ctx.fillStyle = qrState.corFrente
      ctx.font = "bold 16px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if (qrState.tipoFrameSelecionado === "topBottomText") {
        ctx.fillText("QR CODE", meta.totalWidth / 2, FRAME_PADDING / 2)
        ctx.fillText(text, meta.totalWidth / 2, meta.qrY + qrState.tamanho + FRAME_PADDING + meta.frameHeight / 2)
        return
      }

      ctx.fillText(text, meta.totalWidth / 2, meta.qrY + qrState.tamanho + FRAME_PADDING + meta.frameHeight / 2)
    },
    [qrState.corFrente, qrState.textoFrame, qrState.tipoFrameSelecionado, qrState.tamanho],
  )

  const buildExportCanvas = useCallback(async () => {
    const { canvas } = getExportTargets()
    if (!canvas) {
      throw new Error("QR Code de exportação não encontrado")
    }

    const meta = getFrameMeta()
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = meta.totalWidth
    exportCanvas.height = meta.totalHeight

    const ctx = exportCanvas.getContext("2d")
    if (!ctx) {
      throw new Error("Falha ao criar canvas de exportação")
    }

    ctx.fillStyle = qrState.corFundo
    ctx.fillRect(0, 0, meta.totalWidth, meta.totalHeight)

    if (qrState.habilitarCustomizacaoFundo && qrState.imagemFundo) {
      try {
        const backgroundImage = await loadImage(qrState.imagemFundo)
        ctx.drawImage(backgroundImage, 0, 0, meta.totalWidth, meta.totalHeight)
      } catch (error) {
      }
    }

    ctx.drawImage(canvas, meta.qrX, meta.qrY, qrState.tamanho, qrState.tamanho)
    drawFrameOnCanvas(ctx, meta)

    return exportCanvas
  }, [
    drawFrameOnCanvas,
    getExportTargets,
    getFrameMeta,
    loadImage,
    qrState.corFundo,
    qrState.habilitarCustomizacaoFundo,
    qrState.imagemFundo,
    qrState.tamanho,
  ])

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const handleGenerateQRCode = useCallback(() => {
    setIsLoading(true)

    let valorFinalParaCodificar = ""
    let inputOriginalParaHistorico = ""
    const tipoConteudoEntrada: TipoConteudoQR = qrState.tipoConteudoAtivo
    let detalhesEspecificosConteudo: Partial<EntradaQRCode> = {}

    try {
      switch (qrState.tipoConteudoAtivo) {
        case "url":
          const inputUsuarioBruto = qrState.inputUrl.trim()
          if (!inputUsuarioBruto) {
            toast({
              title: "âŒ Erro",
              description: "Digite uma URL ou texto para codificar",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          inputOriginalParaHistorico = inputUsuarioBruto
          valorFinalParaCodificar = sanitizeAndValidateUrl(inputUsuarioBruto)
          qrState.updateField("inputUrl", valorFinalParaCodificar)
          break

        case "wifi":
          if (!qrState.wifiSsid.trim()) {
            toast({
              title: "âŒ Erro",
              description: "SSID Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          const escapeWifi = (str: string) => str.replace(/([\\;,":])/g, "\\$1")
          valorFinalParaCodificar = `WIFI:T:${qrState.wifiEncriptacao};S:${escapeWifi(qrState.wifiSsid)};`
          if (qrState.wifiEncriptacao !== "nopass") {
            valorFinalParaCodificar += `P:${escapeWifi(qrState.wifiSenha)};`
          }
          if (qrState.wifiOculto) {
            valorFinalParaCodificar += `H:true;`
          }
          valorFinalParaCodificar += ";"
          inputOriginalParaHistorico = qrState.wifiSsid
          detalhesEspecificosConteudo = {
            wifiSsid: qrState.wifiSsid,
            wifiSenha: qrState.wifiSenha,
            wifiEncriptacao: qrState.wifiEncriptacao,
            wifiOculto: qrState.wifiOculto,
          }
          break

        case "vcard":
          if (!qrState.vcardNome.trim() && !qrState.vcardSobrenome.trim() && !qrState.vcardOrganizacao.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Pelo menos nome, sobrenome ou organizaÃ§Ã£o Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `BEGIN:VCARD\nVERSION:3.0\nN:${escapeVCardString(qrState.vcardSobrenome)};${escapeVCardString(qrState.vcardNome)}\nFN:${escapeVCardString(qrState.vcardNome)} ${escapeVCardString(qrState.vcardSobrenome)}\nORG:${escapeVCardString(qrState.vcardOrganizacao)}\nTITLE:${escapeVCardString(qrState.vcardTitulo)}\nTEL;TYPE=WORK,VOICE:${escapeVCardString(qrState.vcardTelefone)}\nEMAIL:${escapeVCardString(qrState.vcardEmail)}\nURL:${escapeVCardString(qrState.vcardWebsite)}\nADR;TYPE=WORK:;;${escapeVCardString(qrState.vcardEndereco)};${escapeVCardString(qrState.vcardCidade)};${escapeVCardString(qrState.vcardEstado)};${escapeVCardString(qrState.vcardCep)};${escapeVCardString(qrState.vcardPais)}\nEND:VCARD`
          inputOriginalParaHistorico =
              `${qrState.vcardNome} ${qrState.vcardSobrenome}`.trim() || qrState.vcardOrganizacao
          detalhesEspecificosConteudo = {
            vcardNome: qrState.vcardNome,
            vcardSobrenome: qrState.vcardSobrenome,
            vcardOrganizacao: qrState.vcardOrganizacao,
            vcardTitulo: qrState.vcardTitulo,
            vcardTelefone: qrState.vcardTelefone,
            vcardEmail: qrState.vcardEmail,
            vcardWebsite: qrState.vcardWebsite,
            vcardEndereco: qrState.vcardEndereco,
            vcardCidade: qrState.vcardCidade,
            vcardEstado: qrState.vcardEstado,
            vcardCep: qrState.vcardCep,
            vcardPais: qrState.vcardPais,
          }
          break

        case "vevent":
          if (!qrState.veventResumo.trim() || !qrState.veventDataInicio.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Resumo e data de inÃ­cio sÃ£o obrigatÃ³rios",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          const dtStart = formatDateForVEvent(qrState.veventDataInicio, qrState.veventHoraInicio, qrState.veventDiaTodo)
          const dtEnd = formatDateForVEvent(
              qrState.veventDataFim || qrState.veventDataInicio,
              qrState.veventHoraFim || qrState.veventHoraInicio,
              qrState.veventDiaTodo,
          )
          if (!dtStart || !dtEnd) {
            toast({
              title: "âŒ Erro",
              description: "Data invÃ¡lida",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `BEGIN:VEVENT\nSUMMARY:${escapeVCardString(qrState.veventResumo)}\nDESCRIPTION:${escapeVCardString(qrState.veventDescricao)}\nLOCATION:${escapeVCardString(qrState.veventLocalizacao)}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT`
          inputOriginalParaHistorico = qrState.veventResumo
          detalhesEspecificosConteudo = {
            veventResumo: qrState.veventResumo,
            veventDescricao: qrState.veventDescricao,
            veventLocalizacao: qrState.veventLocalizacao,
            veventDataInicio: qrState.veventDataInicio,
            veventHoraInicio: qrState.veventHoraInicio,
            veventDataFim: qrState.veventDataFim,
            veventHoraFim: qrState.veventHoraFim,
            veventDiaTodo: qrState.veventDiaTodo,
          }
          break

        case "email":
          if (!qrState.emailPara.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Email de destino Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `mailto:${qrState.emailPara}?subject=${encodeURIComponent(qrState.emailAssunto)}&body=${encodeURIComponent(qrState.emailCorpo)}`
          inputOriginalParaHistorico = qrState.emailPara
          detalhesEspecificosConteudo = {
            emailPara: qrState.emailPara,
            emailAssunto: qrState.emailAssunto,
            emailCorpo: qrState.emailCorpo,
          }
          break

        case "sms":
          if (!qrState.smsPara.trim()) {
            toast({
              title: "âŒ Erro",
              description: "NÃºmero de destino Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `SMSTO:${qrState.smsPara}:${qrState.smsCorpo}`
          inputOriginalParaHistorico = qrState.smsPara
          detalhesEspecificosConteudo = {
            smsPara: qrState.smsPara,
            smsCorpo: qrState.smsCorpo,
          }
          break

        case "geo":
          if (!qrState.geoLatitude.trim() || !qrState.geoLongitude.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Latitude e longitude sÃ£o obrigatÃ³rias",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `geo:${qrState.geoLatitude},${qrState.geoLongitude}`
          inputOriginalParaHistorico = `Lat: ${qrState.geoLatitude}, Lon: ${qrState.geoLongitude}`
          detalhesEspecificosConteudo = {
            geoLatitude: qrState.geoLatitude,
            geoLongitude: qrState.geoLongitude,
          }
          break

        case "whatsapp":
          if (!qrState.whatsappPara.trim()) {
            toast({
              title: "âŒ Erro",
              description: "NÃºmero do WhatsApp Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          const numeroApenas = qrState.whatsappPara.replace(/\D/g, "")
          valorFinalParaCodificar = `https://wa.me/${numeroApenas}?text=${encodeURIComponent(qrState.whatsappMensagem)}`
          inputOriginalParaHistorico = qrState.whatsappPara
          detalhesEspecificosConteudo = {
            whatsappPara: qrState.whatsappPara,
            whatsappMensagem: qrState.whatsappMensagem,
          }
          break

        case "whatsappGroup":
          if (!qrState.whatsappGroupLink.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Link do grupo WhatsApp Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = qrState.whatsappGroupLink
          inputOriginalParaHistorico = qrState.whatsappGroupLink
          detalhesEspecificosConteudo = {
            whatsappGroupLink: qrState.whatsappGroupLink,
            whatsappGroupMensagem: qrState.whatsappGroupMensagem,
          }
          break

        case "phone":
          if (!qrState.telefonePara.trim()) {
            toast({
              title: "âŒ Erro",
              description: "NÃºmero de telefone Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          valorFinalParaCodificar = `tel:${qrState.telefonePara.replace(/\D/g, "")}`
          inputOriginalParaHistorico = qrState.telefonePara
          detalhesEspecificosConteudo = {
            telefonePara: qrState.telefonePara,
          }
          break

        case "pix":
          if (!qrState.pixChave.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Chave PIX Ã© obrigatÃ³ria",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          // Formato PIX simplificado (EMV QR Code seria mais complexo)
          const pixData = {
            chave: qrState.pixChave,
            nome: qrState.pixNome || "BeneficiÃ¡rio",
            cidade: qrState.pixCidade || "Cidade",
            valor: qrState.pixValor ? Number.parseFloat(qrState.pixValor) : undefined,
            descricao: qrState.pixDescricao || "",
          }

          valorFinalParaCodificar = `PIX:${pixData.chave}|${pixData.nome}|${pixData.cidade}${pixData.valor ? `|${pixData.valor}` : ""}${pixData.descricao ? `|${pixData.descricao}` : ""}`
          inputOriginalParaHistorico = qrState.pixChave
          detalhesEspecificosConteudo = {
            pixChave: qrState.pixChave,
            pixNome: qrState.pixNome,
            pixCidade: qrState.pixCidade,
            pixValor: qrState.pixValor,
            pixDescricao: qrState.pixDescricao,
          }
          break

        case "appstore":
          if (qrState.appstorePlataforma === "ios" && !qrState.appstoreIosUrl.trim()) {
            toast({
              title: "âŒ Erro",
              description: "URL da App Store Ã© obrigatÃ³ria",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          if (qrState.appstorePlataforma === "android" && !qrState.appstoreAndroidUrl.trim()) {
            toast({
              title: "âŒ Erro",
              description: "URL da Play Store Ã© obrigatÃ³ria",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          if (
              qrState.appstorePlataforma === "ambos" &&
              (!qrState.appstoreIosUrl.trim() || !qrState.appstoreAndroidUrl.trim())
          ) {
            toast({
              title: "âŒ Erro",
              description: "URLs de ambas as lojas sÃ£o obrigatÃ³rias",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          if (qrState.appstorePlataforma === "ios") {
            valorFinalParaCodificar = qrState.appstoreIosUrl
          } else if (qrState.appstorePlataforma === "android") {
            valorFinalParaCodificar = qrState.appstoreAndroidUrl
          } else {
            // Para ambos, criar uma pÃ¡gina de redirecionamento ou usar a URL do iOS como padrÃ£o
            valorFinalParaCodificar = `APP:${qrState.appstoreNome}|iOS:${qrState.appstoreIosUrl}|Android:${qrState.appstoreAndroidUrl}`
          }

          inputOriginalParaHistorico = qrState.appstoreNome || "App"
          detalhesEspecificosConteudo = {
            appstorePlataforma: qrState.appstorePlataforma,
            appstoreIosUrl: qrState.appstoreIosUrl,
            appstoreAndroidUrl: qrState.appstoreAndroidUrl,
            appstoreNome: qrState.appstoreNome,
          }
          break

        case "spotify":
          if (!qrState.spotifyUrl.trim()) {
            toast({
              title: "âŒ Erro",
              description: "URL Ã© obrigatÃ³ria",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          valorFinalParaCodificar = qrState.spotifyUrl
          inputOriginalParaHistorico = qrState.spotifyTitulo || qrState.spotifyUrl
          detalhesEspecificosConteudo = {
            spotifyTipo: qrState.spotifyTipo,
            spotifyUrl: qrState.spotifyUrl,
            spotifyTitulo: qrState.spotifyTitulo,
            spotifyArtista: qrState.spotifyArtista,
          }
          break

        case "zoom":
          if (!qrState.zoomUrl.trim()) {
            toast({
              title: "âŒ Erro",
              description: "URL da reuniÃ£o Ã© obrigatÃ³ria",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          valorFinalParaCodificar = qrState.zoomUrl
          inputOriginalParaHistorico = qrState.zoomTitulo || qrState.zoomUrl
          detalhesEspecificosConteudo = {
            zoomTipo: qrState.zoomTipo,
            zoomUrl: qrState.zoomUrl,
            zoomId: qrState.zoomId,
            zoomSenha: qrState.zoomSenha,
            zoomTitulo: qrState.zoomTitulo,
          }
          break

        case "menu":
          if (!qrState.menuNome.trim()) {
            toast({
              title: "âŒ Erro",
              description: "Nome do restaurante Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          const menuInfo = [
            `RESTAURANTE: ${qrState.menuNome}`,
            qrState.menuCategoria ? `CATEGORIA: ${qrState.menuCategoria}` : "",
            qrState.menuDescricao ? `DESCRIÃ‡ÃƒO: ${qrState.menuDescricao}` : "",
            qrState.menuItens ? `ITENS:\n${qrState.menuItens}` : "",
            qrState.menuPreco ? `PREÃ‡OS: ${qrState.menuPreco}` : "",
          ]
              .filter(Boolean)
              .join("\n\n")

          valorFinalParaCodificar = menuInfo
          inputOriginalParaHistorico = qrState.menuNome
          detalhesEspecificosConteudo = {
            menuNome: qrState.menuNome,
            menuDescricao: qrState.menuDescricao,
            menuItens: qrState.menuItens,
            menuPreco: qrState.menuPreco,
            menuCategoria: qrState.menuCategoria,
          }
          break

        case "cupom":
          if (!qrState.cupomCodigo.trim()) {
            toast({
              title: "âŒ Erro",
              description: "CÃ³digo do cupom Ã© obrigatÃ³rio",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          const cupomInfo = [
            `CUPOM: ${qrState.cupomCodigo}`,
            `TIPO: ${qrState.cupomTipo.toUpperCase()}`,
            qrState.cupomValor ? `VALOR: ${qrState.cupomValor}` : "",
            qrState.cupomDescricao ? `DESCRIÃ‡ÃƒO: ${qrState.cupomDescricao}` : "",
            qrState.cupomValidade ? `VÃLIDO ATÃ‰: ${new Date(qrState.cupomValidade).toLocaleDateString(localeTag)}` : "",
          ]
              .filter(Boolean)
              .join("\n")

          valorFinalParaCodificar = cupomInfo
          inputOriginalParaHistorico = qrState.cupomCodigo
          detalhesEspecificosConteudo = {
            cupomCodigo: qrState.cupomCodigo,
            cupomDescricao: qrState.cupomDescricao,
            cupomValor: qrState.cupomValor,
            cupomValidade: qrState.cupomValidade,
            cupomTipo: qrState.cupomTipo,
          }
          break

        default:
          toast({
            title: "âŒ Erro",
            description: "Tipo de conteÃºdo invÃ¡lido",
            variant: "destructive",
          })
          setIsLoading(false)
          return
      }

      if (valorFinalParaCodificar) {
        qrState.updateField("qrValue", valorFinalParaCodificar)

        const existingEntry = qrState.historico.find(
          (entrada) =>
            entrada.tipoConteudo === tipoConteudoEntrada &&
            entrada.valorQR === valorFinalParaCodificar &&
            entrada.inputOriginal === inputOriginalParaHistorico,
        )

        const novaEntrada: EntradaQRCode = {
          id: existingEntry?.id || Date.now().toString(),
          tipoConteudo: tipoConteudoEntrada,
          inputOriginal: inputOriginalParaHistorico,
          valorQR: valorFinalParaCodificar,
          favorite: existingEntry?.favorite ?? false,
          tags: existingEntry?.tags ?? [],
          corFrente: qrState.corFrente,
          corFundo: qrState.corFundo,
          tamanho: qrState.tamanho,
          nivel: qrState.nivelCorrecaoErro,
          margem: qrState.zonaQuieta,
          habilitarCustomizacaoLogo: qrState.habilitarCustomizacaoLogo,
          logoDataUri: qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.logoDataUri : undefined,
          logoTamanhoRatio:
              qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.logoTamanhoRatio : undefined,
          escavarLogo: qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.escavarLogo : undefined,
          habilitarCustomizacaoFundo: qrState.habilitarCustomizacaoFundo,
          imagemFundo: qrState.habilitarCustomizacaoFundo && qrState.imagemFundo ? qrState.imagemFundo : undefined,
          habilitarCustomizacaoFrame: qrState.habilitarCustomizacaoFrame,
          tipoFrameSelecionado: qrState.habilitarCustomizacaoFrame ? qrState.tipoFrameSelecionado : "none",
          textoFrame:
              qrState.habilitarCustomizacaoFrame &&
              (qrState.tipoFrameSelecionado === "textBottom" ||
                  qrState.tipoFrameSelecionado === "roundedBorderTextBottom" ||
                  qrState.tipoFrameSelecionado === "topBottomText" ||
                  qrState.tipoFrameSelecionado === "decorativeBorder")
                  ? qrState.textoFrame
                  : undefined,
          timestamp: Date.now(),
          ...detalhesEspecificosConteudo,
        }

        const historicoAtualizado = [
          novaEntrada,
          ...qrState.historico.filter((entrada) => entrada.id !== novaEntrada.id).slice(0, HISTORY_LIMIT - 1),
        ]

        qrState.updateField("historico", historicoAtualizado)

        // Toast de sucesso
        toast({
          title: text("Sucesso", "Success"),
          description: text("QR Code gerado com sucesso!", "QR code generated successfully!"),
        })

        // No mobile, fechar controles
        if (isMobile) {
          onCloseControls?.()
        }
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
      toast({
        title: "âŒ Erro Inesperado",
        description: "Ocorreu um erro ao gerar o QR Code. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    qrState,
    toast,
    isMobile,
    onCloseControls,
    sanitizeAndValidateUrl,
    escapeVCardString,
    formatDateForVEvent,
  ])

  const handleContentTypeChange = useCallback(
      (novoTipo: TipoConteudoQR) => {
        const tipoParaReset = qrState.tipoConteudoAtivo
        qrState.resetCamposEspecificos(tipoParaReset)
        qrState.updateField("tipoConteudoAtivo", novoTipo)
      },
      [qrState],
  )

  // Reset granular melhorado
  const resetGranular = useCallback(
      (tipo?: string) => {
        switch (tipo) {
          case "content":
            // Reset apenas dados do conteÃºdo atual
            qrState.resetCamposEspecificos(qrState.tipoConteudoAtivo)
            qrState.updateField("qrValue", "")
            toast({
              title: "ðŸ—‘ï¸ Dados Limpos!",
              description: `Dados de ${qrState.tipoConteudoAtivo} foram removidos`,
            })
            break

          case "appearance":
          case "basic":
            // Reset configuraÃ§Ãµes bÃ¡sicas de aparÃªncia
            qrState.updateField("corFrente", "#000000")
            qrState.updateField("corFundo", "#FFFFFF")
            qrState.updateField("tamanho", 256)
            qrState.updateField("nivelCorrecaoErro", "H")
            qrState.updateField("zonaQuieta", 4)
            toast({
              title: "ðŸŽ¨ AparÃªncia Resetada!",
              description: "Cores e configuraÃ§Ãµes bÃ¡sicas foram restauradas",
            })
            break

          case "logo":
            // Reset apenas logo
            qrState.updateField("logoDataUri", "")
            qrState.updateField("logoTamanhoRatio", 0.2)
            qrState.updateField("escavarLogo", true)
            qrState.updateField("habilitarCustomizacaoLogo", false)
            if (fileInputRef.current) fileInputRef.current.value = ""

            // Remover do accordion mobile
            const novosValores = qrState.valoresAccordionMobile.filter((v: string) => v !== "logo")
            qrState.updateField("valoresAccordionMobile", novosValores)

            toast({
              title: "ðŸ–¼ï¸ Logo Removido!",
              description: "Logo personalizado foi removido",
            })
            break

          case "background":
            // Reset apenas fundo
            qrState.updateField("imagemFundo", "")
            qrState.updateField("habilitarCustomizacaoFundo", false)
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""

            // Remover do accordion mobile
            const novosValoresBg = qrState.valoresAccordionMobile.filter((v: string) => v !== "background")
            qrState.updateField("valoresAccordionMobile", novosValoresBg)

            toast({
              title: "ðŸŒ„ Fundo Removido!",
              description: "Imagem de fundo foi removida",
            })
            break

          case "frame":
            // Reset apenas frame
            qrState.updateField("tipoFrameSelecionado", "none")
            qrState.updateField("textoFrame", "")
            qrState.updateField("habilitarCustomizacaoFrame", false)

            // Remover do accordion mobile
            const novosValoresFrame = qrState.valoresAccordionMobile.filter((v: string) => v !== "frame")
            qrState.updateField("valoresAccordionMobile", novosValoresFrame)

            toast({
              title: "ðŸ–¼ï¸ Moldura Removida!",
              description: "Moldura personalizada foi removida",
            })
            break

          default:
            // Reset completo (comportamento original)
            qrState.updateField("qrValue", "")
            qrState.updateField("corFrente", "#000000")
            qrState.updateField("corFundo", "#FFFFFF")
            qrState.updateField("tamanho", 256)
            qrState.updateField("nivelCorrecaoErro", "H")
            qrState.updateField("zonaQuieta", 4)
            qrState.updateField("logoDataUri", "")
            qrState.updateField("logoTamanhoRatio", 0.2)
            qrState.updateField("escavarLogo", true)
            qrState.updateField("imagemFundo", "")
            qrState.updateField("tipoFrameSelecionado", "none")
            qrState.updateField("textoFrame", "")
            qrState.updateField("habilitarCustomizacaoLogo", false)
            qrState.updateField("habilitarCustomizacaoFundo", false)
            qrState.updateField("habilitarCustomizacaoFrame", false)
            qrState.updateField("valoresAccordionMobile", [])
            qrState.resetCamposEspecificos()

            if (fileInputRef.current) fileInputRef.current.value = ""
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""

            urlValidationCache.clear()

            toast({
              title: "ðŸ”„ Tudo Resetado!",
              description: "QR Code, campos e configuraÃ§Ãµes foram limpos completamente",
            })
        }
      },
      [qrState, toast],
  )

  const resetAppearanceCustomization = useCallback(() => {
    resetGranular("all")
  }, [resetGranular])

  const loadFromHistory = useCallback(
      (entrada: EntradaQRCode) => {
        applyContentFromHistory(entrada)
        applyVisualConfiguration({
          ...entrada,
          nivel: entrada.nivel,
          margem: entrada.margem,
        })

        toast({
          title: text("Configuracoes carregadas", "Settings loaded"),
          description: text("As configuracoes do historico foram aplicadas.", "History settings have been applied."),
        })
      },
      [applyContentFromHistory, applyVisualConfiguration, toast],
  )

  const clearHistory = useCallback(() => {
    qrState.updateField("historico", [])

    toast({
      title: text("Historico limpo", "History cleared"),
      description: text("Todo o historico foi removido com sucesso.", "The full history was removed successfully."),
    })
  }, [qrState, toast])

  const toggleHistoryFavorite = useCallback(
    (entryId: string) => {
      const targetEntry = qrState.historico.find((entrada) => entrada.id === entryId)
      if (!targetEntry) {
        return
      }

      qrState.updateField(
        "historico",
        qrState.historico.map((entrada) =>
          entrada.id === entryId ? { ...entrada, favorite: !entrada.favorite } : entrada,
        ),
      )

      toast({
        title: targetEntry.favorite ? text("Favorito removido", "Favorite removed") : text("Favorito salvo", "Favorite saved"),
        description: targetEntry.favorite
          ? text("O item saiu da lista de favoritos.", "The item was removed from favorites.")
          : text("O item foi marcado como favorito.", "The item was added to favorites."),
      })
    },
    [qrState, toast],
  )

  const updateHistoryTags = useCallback(
    (entryId: string, nextTags: string[]) => {
      const normalizedTags = normalizeTags(nextTags)
      qrState.updateField(
        "historico",
        qrState.historico.map((entrada) =>
          entrada.id === entryId ? { ...entrada, tags: normalizedTags } : entrada,
        ),
      )
    },
    [qrState],
  )

  const removeHistoryEntry = useCallback(
    (entryId: string) => {
      qrState.updateField(
        "historico",
        qrState.historico.filter((entrada) => entrada.id !== entryId),
      )

      toast({
        title: "Item removido",
        description: "O registro foi removido do historico.",
      })
    },
    [qrState, toast],
  )

  const saveVisualTemplate = useCallback(
    (name: string, templateId?: string) => {
      const existingTemplate = templateId
        ? qrState.templatesVisuais.find((template) => template.id === templateId)
        : undefined
      const nextName =
        name.trim() || existingTemplate?.name || `Tema ${Math.min(qrState.templatesVisuais.length + 1, TEMPLATE_LIMIT)}`
      const timestamp = Date.now()

      const nextTemplate: VisualTemplateQRCode = {
        id: existingTemplate?.id || timestamp.toString(),
        name: nextName,
        createdAt: existingTemplate?.createdAt || timestamp,
        updatedAt: timestamp,
        corFrente: qrState.corFrente,
        corFundo: qrState.corFundo,
        tamanho: qrState.tamanho,
        nivel: qrState.nivelCorrecaoErro,
        margem: qrState.zonaQuieta,
        habilitarCustomizacaoLogo: qrState.habilitarCustomizacaoLogo && !!qrState.logoDataUri,
        logoDataUri: qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.logoDataUri : undefined,
        logoTamanhoRatio:
          qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.logoTamanhoRatio : undefined,
        escavarLogo: qrState.habilitarCustomizacaoLogo && qrState.logoDataUri ? qrState.escavarLogo : undefined,
        habilitarCustomizacaoFundo: qrState.habilitarCustomizacaoFundo && !!qrState.imagemFundo,
        imagemFundo: qrState.habilitarCustomizacaoFundo && qrState.imagemFundo ? qrState.imagemFundo : undefined,
        habilitarCustomizacaoFrame:
          qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none",
        tipoFrameSelecionado:
          qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
            ? qrState.tipoFrameSelecionado
            : "none",
        textoFrame:
          qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
            ? qrState.textoFrame
            : undefined,
      }

      const nextTemplates = [
        nextTemplate,
        ...qrState.templatesVisuais.filter((template) => template.id !== nextTemplate.id),
      ].slice(0, TEMPLATE_LIMIT)

      qrState.updateField("templatesVisuais", nextTemplates)

      toast({
        title: existingTemplate ? text("Template atualizado", "Template updated") : text("Template salvo", "Template saved"),
        description: text(`"${nextTemplate.name}" esta pronto para reutilizar.`, `"${nextTemplate.name}" is ready to reuse.`),
      })
    },
    [qrState, toast],
  )

  const applyVisualTemplate = useCallback(
    (template: VisualTemplateQRCode) => {
      applyVisualConfiguration({
        ...template,
        nivel: template.nivel,
        margem: template.margem,
      })

      toast({
        title: text("Template aplicado", "Template applied"),
        description: text(`"${template.name}" foi aplicado ao visual atual.`, `"${template.name}" was applied to the current visual.`),
      })
    },
    [applyVisualConfiguration, toast],
  )

  const deleteVisualTemplate = useCallback(
    (templateId: string) => {
      const nextTemplates = qrState.templatesVisuais.filter((template) => template.id !== templateId)
      qrState.updateField("templatesVisuais", nextTemplates)

      toast({
        title: "Template removido",
        description: "O template visual foi excluido.",
      })
    },
    [qrState, toast],
  )

  const getFormattedDate = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`
  }

  const canvasToBlob = useCallback((canvas: HTMLCanvasElement, type: string) => {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error("Falha ao converter canvas para blob"))
      }, type)
    })
  }, [])

  const copyImageBlobToClipboard = useCallback(async (blob: Blob) => {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      throw new Error("Clipboard de imagem não suportado")
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
  }, [])

  const buildExportSvgBlob = useCallback(async () => {
    const { svg } = getExportTargets()
    const meta = getFrameMeta()

    if (svg && !meta.frameActive && !(qrState.habilitarCustomizacaoFundo && qrState.imagemFundo)) {
      const clonedSvg = svg.cloneNode(true) as SVGSVGElement
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      return new Blob([clonedSvg.outerHTML], { type: "image/svg+xml;charset=utf-8" })
    }

    const exportCanvas = await buildExportCanvas()
    const dataUrl = exportCanvas.toDataURL("image/png")
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.totalWidth}" height="${meta.totalHeight}" viewBox="0 0 ${meta.totalWidth} ${meta.totalHeight}"><image href="${dataUrl}" width="100%" height="100%" /></svg>`

    return new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
  }, [buildExportCanvas, getExportTargets, getFrameMeta, qrState.habilitarCustomizacaoFundo, qrState.imagemFundo])

  const handleDownloadQRCode = useCallback(
    async (formato: "png" | "svg" = "png") => {
      if (!qrState.qrValue) {
        toast({
          title: "❌ Erro",
          description: "Nenhum QR Code para baixar",
          variant: "destructive",
        })
        return
      }

      try {
        const filename = `qrcode_${getFormattedDate()}.${formato}`
        const blob =
          formato === "png"
            ? await canvasToBlob(await buildExportCanvas(), "image/png")
            : await buildExportSvgBlob()

        downloadBlob(blob, filename)

        toast({
          title: "Download concluído",
          description: `QR Code baixado como ${filename}`,
        })
      } catch (error) {
        toast({
          title: "❌ Erro no download",
          description: "Não foi possível baixar o QR Code",
          variant: "destructive",
        })
      }
    },
    [buildExportCanvas, buildExportSvgBlob, canvasToBlob, downloadBlob, qrState.qrValue, toast],
  )

  const handleCopyQRCodeImage = useCallback(async () => {
    if (!qrState.qrValue) {
      toast({
        title: "❌ Erro",
        description: "Nenhum QR Code para copiar",
        variant: "destructive",
      })
      return
    }

    try {
      const exportCanvas = await buildExportCanvas()
      const blob = await canvasToBlob(exportCanvas, "image/png")

      try {
        await copyImageBlobToClipboard(blob)
        toast({
          title: "Imagem copiada",
          description: "QR Code copiado para a área de transferência",
        })
        return
      } catch (error) {
      }

      await navigator.clipboard.writeText(qrState.qrValue)
      toast({
        title: "Texto copiado",
        description: "O navegador não suporta imagem no clipboard. O conteúdo foi copiado como texto.",
      })
    } catch (error) {
      try {
        await navigator.clipboard.writeText(qrState.qrValue)
        toast({
          title: "Texto copiado",
          description: "O conteúdo do QR Code foi copiado como texto.",
        })
      } catch (fallbackError) {
        toast({
          title: "❌ Erro ao copiar",
          description: "Não foi possível copiar o QR Code",
          variant: "destructive",
        })
      }
    }
  }, [buildExportCanvas, canvasToBlob, copyImageBlobToClipboard, qrState.qrValue, toast])

  const handleShareQRCode = useCallback(async () => {
    if (!qrState.qrValue) {
      toast({
        title: "❌ Erro",
        description: "Nenhum QR Code para compartilhar",
        variant: "destructive",
      })
      return
    }

    try {
      const exportCanvas = await buildExportCanvas()
      const blob = await canvasToBlob(exportCanvas, "image/png")
      const file = new File([blob], `qrcode_${getFormattedDate()}.png`, { type: "image/png" })

      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "QR Code gerado",
              text: "Confira este QR Code.",
              files: [file],
            })
          } else {
            await navigator.share({
              title: "QR Code gerado",
              text: qrState.qrValue,
            })
          }

          toast({
            title: "Compartilhado",
            description: "QR Code compartilhado com sucesso",
          })
          return
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return
          }
        }
      }

      try {
        await copyImageBlobToClipboard(blob)
        toast({
          title: "Copiado",
          description: "Compartilhamento indisponível. O QR Code foi copiado como imagem.",
        })
        return
      } catch (error) {
      }

      await navigator.clipboard.writeText(qrState.qrValue)
      toast({
        title: "Texto copiado",
        description: "Compartilhamento indisponível. O conteúdo foi copiado como texto.",
      })
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível compartilhar o QR Code",
        variant: "destructive",
      })
    }
  }, [buildExportCanvas, canvasToBlob, copyImageBlobToClipboard, qrState.qrValue, toast])

  const handleLogoUpload = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
          if (!file.type.startsWith("image/")) {
            toast({
              title: "âŒ Erro no Upload",
              description: "Por favor, selecione um arquivo de imagem vÃ¡lido.",
              variant: "destructive",
            })
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
          }

          // Verificar tamanho do arquivo (mÃ¡ximo 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "âŒ Arquivo Muito Grande",
              description: "Por favor, selecione uma imagem menor que 5MB.",
              variant: "destructive",
            })
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
          }

          const reader = new FileReader()
          reader.onloadend = () => {
            qrState.updateField("logoDataUri", reader.result as string)

            toast({
              title: "ðŸ–¼ï¸ Logo Carregado!",
              description: "Logo foi carregado com sucesso!",
            })
          }
          reader.onerror = () =>
              toast({
                title: "âŒ Erro de Leitura",
                description: "Erro ao ler o arquivo.",
                variant: "destructive",
              })
          reader.readAsDataURL(file)
        }
      },
      [qrState, toast],
  )

  const handleBackgroundImageUpload = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
          if (!file.type.startsWith("image/")) {
            toast({
              title: "âŒ Erro no Upload",
              description: "Por favor, selecione um arquivo de imagem vÃ¡lido.",
              variant: "destructive",
            })
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""
            return
          }

          // Verificar tamanho do arquivo (mÃ¡ximo 10MB)
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "âŒ Arquivo Muito Grande",
              description: "Por favor, selecione uma imagem menor que 10MB.",
              variant: "destructive",
            })
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""
            return
          }

          const reader = new FileReader()
          reader.onloadend = () => {
            qrState.updateField("imagemFundo", reader.result as string)

            toast({
              title: "ðŸŒ„ Imagem de Fundo Carregada!",
              description: "Imagem de fundo foi carregada com sucesso!",
            })
          }
          reader.onerror = () =>
              toast({
                title: "âŒ Erro de Leitura",
                description: "Erro ao ler o arquivo.",
                variant: "destructive",
              })
          reader.readAsDataURL(file)
        }
      },
      [qrState, toast],
  )

  const removeBackgroundImageFile = useCallback(() => {
    qrState.updateField("imagemFundo", "")
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = ""
    }

    toast({
      title: "ðŸ—‘ï¸ Imagem Removida!",
      description: "Imagem de fundo foi removida com sucesso.",
    })
  }, [qrState, toast])

  return {
    isLoading,
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
    removeBackgroundImageFile,
  }
}

