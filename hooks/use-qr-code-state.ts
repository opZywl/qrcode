"use client"

import { useState, useEffect } from "react"

export type TipoConteudoQR = "url" | "wifi" | "vcard" | "vevent" | "email" | "sms" | "geo" | "whatsapp" | "phone"
export type NivelCorrecaoErro = "L" | "M" | "Q" | "H"
export type TipoEncriptacaoWifi = "WPA" | "WEP" | "nopass"
export type TipoFrame =
  | "none"
  | "textBottom"
  | "scanMeBottom"
  | "simpleBorder"
  | "roundedBorderTextBottom"
  | "topBottomText"
  | "decorativeBorder"
  | "modernFrame"
  | "classicFrame"

export interface EntradaQRCode {
  id: string
  tipoConteudo: TipoConteudoQR
  inputOriginal: string
  valorQR: string
  corFrente: string
  corFundo: string
  tamanho: number
  nivel: NivelCorrecaoErro
  margem: number
  logoDataUri?: string
  logoTamanhoRatio?: number
  escavarLogo?: boolean
  imagemFundo?: string
  timestamp: number
  habilitarCustomizacaoLogo?: boolean
  habilitarCustomizacaoFundo?: boolean
  habilitarCustomizacaoFrame?: boolean
  tipoFrameSelecionado?: TipoFrame
  textoFrame?: string

  // WiFi
  wifiSsid?: string
  wifiSenha?: string
  wifiEncriptacao?: TipoEncriptacaoWifi
  wifiOculto?: boolean

  // vCard
  vcardNome?: string
  vcardSobrenome?: string
  vcardOrganizacao?: string
  vcardTitulo?: string
  vcardTelefone?: string
  vcardEmail?: string
  vcardWebsite?: string
  vcardEndereco?: string
  vcardCidade?: string
  vcardEstado?: string
  vcardCep?: string
  vcardPais?: string

  // vEvent
  veventResumo?: string
  veventDescricao?: string
  veventLocalizacao?: string
  veventDataInicio?: string
  veventHoraInicio?: string
  veventDataFim?: string
  veventHoraFim?: string
  veventDiaTodo?: boolean

  // Email
  emailPara?: string
  emailAssunto?: string
  emailCorpo?: string

  // SMS
  smsPara?: string
  smsCorpo?: string

  // Geo
  geoLatitude?: string
  geoLongitude?: string

  // WhatsApp
  whatsappPara?: string
  whatsappMensagem?: string

  // Phone
  telefonePara?: string
}

export function useQRCodeState() {
  const [isClient, setIsClient] = useState(false)

  // Estado principal
  const [tipoConteudoAtivo, setTipoConteudoAtivo] = useState<TipoConteudoQR>("url")
  const [qrValue, setQrValue] = useState<string>("")

  // Aparência
  const [corFrente, setCorFrente] = useState<string>("#000000")
  const [corFundo, setCorFundo] = useState<string>("#FFFFFF")
  const [tamanho, setTamanho] = useState<number>(256)
  const [nivelCorrecaoErro, setNivelCorrecaoErro] = useState<NivelCorrecaoErro>("H")
  const [zonaQuieta, setZonaQuieta] = useState<number>(4)

  // Customizações
  const [logoDataUri, setLogoDataUri] = useState<string>("")
  const [logoTamanhoRatio, setLogoTamanhoRatio] = useState<number>(0.2)
  const [escavarLogo, setEscavarLogo] = useState<boolean>(true)
  const [imagemFundo, setImagemFundo] = useState<string>("")
  const [tipoFrameSelecionado, setTipoFrameSelecionado] = useState<TipoFrame>("none")
  const [textoFrame, setTextoFrame] = useState<string>("")

  // Habilitadores de customização
  const [habilitarCustomizacaoLogo, setHabilitarCustomizacaoLogo] = useState<boolean>(false)
  const [habilitarCustomizacaoFundo, setHabilitarCustomizacaoFundo] = useState<boolean>(false)
  const [habilitarCustomizacaoFrame, setHabilitarCustomizacaoFrame] = useState<boolean>(false)

  // Mobile accordion values
  const [valoresAccordionMobile, setValoresAccordionMobile] = useState<string[]>([])

  // Conteúdo específico - URL
  const [inputUrl, setInputUrl] = useState<string>("")

  // Conteúdo específico - WiFi
  const [wifiSsid, setWifiSsid] = useState<string>("")
  const [wifiSenha, setWifiSenha] = useState<string>("")
  const [wifiEncriptacao, setWifiEncriptacao] = useState<TipoEncriptacaoWifi>("WPA")
  const [wifiOculto, setWifiOculto] = useState<boolean>(false)

  // vCard
  const [vcardNome, setVcardNome] = useState("")
  const [vcardSobrenome, setVcardSobrenome] = useState("")
  const [vcardOrganizacao, setVcardOrganizacao] = useState("")
  const [vcardTitulo, setVcardTitulo] = useState("")
  const [vcardTelefone, setVcardTelefone] = useState("")
  const [vcardEmail, setVcardEmail] = useState("")
  const [vcardWebsite, setVcardWebsite] = useState("")
  const [vcardEndereco, setVcardEndereco] = useState("")
  const [vcardCidade, setVcardCidade] = useState("")
  const [vcardEstado, setVcardEstado] = useState("")
  const [vcardCep, setVcardCep] = useState("")
  const [vcardPais, setVcardPais] = useState("")

  // vEvent
  const [veventResumo, setVeventResumo] = useState("")
  const [veventDescricao, setVeventDescricao] = useState("")
  const [veventLocalizacao, setVeventLocalizacao] = useState("")
  const [veventDataInicio, setVeventDataInicio] = useState("")
  const [veventHoraInicio, setVeventHoraInicio] = useState("")
  const [veventDataFim, setVeventDataFim] = useState("")
  const [veventHoraFim, setVeventHoraFim] = useState("")
  const [veventDiaTodo, setVeventDiaTodo] = useState(false)

  // Email
  const [emailPara, setEmailPara] = useState("")
  const [emailAssunto, setEmailAssunto] = useState("")
  const [emailCorpo, setEmailCorpo] = useState("")

  // SMS
  const [smsPara, setSmsPara] = useState("")
  const [smsCorpo, setSmsCorpo] = useState("")

  // Geo
  const [geoLatitude, setGeoLatitude] = useState("")
  const [geoLongitude, setGeoLongitude] = useState("")

  // WhatsApp
  const [whatsappPara, setWhatsappPara] = useState("")
  const [whatsappMensagem, setWhatsappMensagem] = useState("")

  // Phone
  const [telefonePara, setTelefonePara] = useState("")

  // Histórico
  const [historico, setHistorico] = useState<EntradaQRCode[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const historicoSalvo = localStorage.getItem("qrCodeHistorico")
    if (historicoSalvo) {
      setHistorico(JSON.parse(historicoSalvo))
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    if (historico.length > 0) {
      localStorage.setItem("qrCodeHistorico", JSON.stringify(historico))
    } else if (localStorage.getItem("qrCodeHistorico")) {
      localStorage.removeItem("qrCodeHistorico")
    }
  }, [historico, isClient])

  // Efeito para mobile accordion
  useEffect(() => {
    setHabilitarCustomizacaoLogo(valoresAccordionMobile.includes("logo"))
    setHabilitarCustomizacaoFundo(valoresAccordionMobile.includes("background"))
    setHabilitarCustomizacaoFrame(valoresAccordionMobile.includes("frame"))
  }, [valoresAccordionMobile])

  const updateField = (campo: string, valor: any) => {
    switch (campo) {
      case "tipoConteudoAtivo":
        setTipoConteudoAtivo(valor)
        break
      case "qrValue":
        setQrValue(valor)
        break
      case "corFrente":
        setCorFrente(valor)
        break
      case "corFundo":
        setCorFundo(valor)
        break
      case "tamanho":
        setTamanho(valor)
        break
      case "nivelCorrecaoErro":
        setNivelCorrecaoErro(valor)
        break
      case "zonaQuieta":
        setZonaQuieta(valor)
        break
      case "logoDataUri":
        setLogoDataUri(valor)
        break
      case "logoTamanhoRatio":
        setLogoTamanhoRatio(valor)
        break
      case "escavarLogo":
        setEscavarLogo(valor)
        break
      case "imagemFundo":
        setImagemFundo(valor)
        break
      case "tipoFrameSelecionado":
        setTipoFrameSelecionado(valor)
        break
      case "textoFrame":
        setTextoFrame(valor)
        break
      case "habilitarCustomizacaoLogo":
        setHabilitarCustomizacaoLogo(valor)
        break
      case "habilitarCustomizacaoFundo":
        setHabilitarCustomizacaoFundo(valor)
        break
      case "habilitarCustomizacaoFrame":
        setHabilitarCustomizacaoFrame(valor)
        break
      case "valoresAccordionMobile":
        setValoresAccordionMobile(valor)
        break
      case "inputUrl":
        setInputUrl(valor)
        break
      case "wifiSsid":
        setWifiSsid(valor)
        break
      case "wifiSenha":
        setWifiSenha(valor)
        break
      case "wifiEncriptacao":
        setWifiEncriptacao(valor)
        break
      case "wifiOculto":
        setWifiOculto(valor)
        break
      case "vcardNome":
        setVcardNome(valor)
        break
      case "vcardSobrenome":
        setVcardSobrenome(valor)
        break
      case "vcardOrganizacao":
        setVcardOrganizacao(valor)
        break
      case "vcardTitulo":
        setVcardTitulo(valor)
        break
      case "vcardTelefone":
        setVcardTelefone(valor)
        break
      case "vcardEmail":
        setVcardEmail(valor)
        break
      case "vcardWebsite":
        setVcardWebsite(valor)
        break
      case "vcardEndereco":
        setVcardEndereco(valor)
        break
      case "vcardCidade":
        setVcardCidade(valor)
        break
      case "vcardEstado":
        setVcardEstado(valor)
        break
      case "vcardCep":
        setVcardCep(valor)
        break
      case "vcardPais":
        setVcardPais(valor)
        break
      case "veventResumo":
        setVeventResumo(valor)
        break
      case "veventDescricao":
        setVeventDescricao(valor)
        break
      case "veventLocalizacao":
        setVeventLocalizacao(valor)
        break
      case "veventDataInicio":
        setVeventDataInicio(valor)
        break
      case "veventHoraInicio":
        setVeventHoraInicio(valor)
        break
      case "veventDataFim":
        setVeventDataFim(valor)
        break
      case "veventHoraFim":
        setVeventHoraFim(valor)
        break
      case "veventDiaTodo":
        setVeventDiaTodo(valor)
        break
      case "emailPara":
        setEmailPara(valor)
        break
      case "emailAssunto":
        setEmailAssunto(valor)
        break
      case "emailCorpo":
        setEmailCorpo(valor)
        break
      case "smsPara":
        setSmsPara(valor)
        break
      case "smsCorpo":
        setSmsCorpo(valor)
        break
      case "geoLatitude":
        setGeoLatitude(valor)
        break
      case "geoLongitude":
        setGeoLongitude(valor)
        break
      case "whatsappPara":
        setWhatsappPara(valor)
        break
      case "whatsappMensagem":
        setWhatsappMensagem(valor)
        break
      case "telefonePara":
        setTelefonePara(valor)
        break
      case "historico":
        setHistorico(valor)
        break
      default:
        console.warn(`Campo não reconhecido: ${campo}`)
    }
  }

  const resetCamposEspecificos = (tipoParaReset?: TipoConteudoQR) => {
    setQrValue("")

    if (tipoParaReset === "url" || !tipoParaReset) {
      setInputUrl("")
    }
    if (tipoParaReset === "wifi" || !tipoParaReset) {
      setWifiSsid("")
      setWifiSenha("")
      setWifiEncriptacao("WPA")
      setWifiOculto(false)
    }
    if (tipoParaReset === "vcard" || !tipoParaReset) {
      setVcardNome("")
      setVcardSobrenome("")
      setVcardOrganizacao("")
      setVcardTitulo("")
      setVcardTelefone("")
      setVcardEmail("")
      setVcardWebsite("")
      setVcardEndereco("")
      setVcardCidade("")
      setVcardEstado("")
      setVcardCep("")
      setVcardPais("")
    }
    if (tipoParaReset === "vevent" || !tipoParaReset) {
      setVeventResumo("")
      setVeventDescricao("")
      setVeventLocalizacao("")
      setVeventDataInicio("")
      setVeventHoraInicio("")
      setVeventDataFim("")
      setVeventHoraFim("")
      setVeventDiaTodo(false)
    }
    if (tipoParaReset === "email" || !tipoParaReset) {
      setEmailPara("")
      setEmailAssunto("")
      setEmailCorpo("")
    }
    if (tipoParaReset === "sms" || !tipoParaReset) {
      setSmsPara("")
      setSmsCorpo("")
    }
    if (tipoParaReset === "geo" || !tipoParaReset) {
      setGeoLatitude("")
      setGeoLongitude("")
    }
    if (tipoParaReset === "whatsapp" || !tipoParaReset) {
      setWhatsappPara("")
      setWhatsappMensagem("")
    }
    if (tipoParaReset === "phone" || !tipoParaReset) {
      setTelefonePara("")
    }
  }

  return {
    // Estado
    tipoConteudoAtivo,
    qrValue,
    corFrente,
    corFundo,
    tamanho,
    nivelCorrecaoErro,
    zonaQuieta,
    logoDataUri,
    logoTamanhoRatio,
    escavarLogo,
    imagemFundo,
    tipoFrameSelecionado,
    textoFrame,
    habilitarCustomizacaoLogo,
    habilitarCustomizacaoFundo,
    habilitarCustomizacaoFrame,
    valoresAccordionMobile,
    inputUrl,
    wifiSsid,
    wifiSenha,
    wifiEncriptacao,
    wifiOculto,
    vcardNome,
    vcardSobrenome,
    vcardOrganizacao,
    vcardTitulo,
    vcardTelefone,
    vcardEmail,
    vcardWebsite,
    vcardEndereco,
    vcardCidade,
    vcardEstado,
    vcardCep,
    vcardPais,
    veventResumo,
    veventDescricao,
    veventLocalizacao,
    veventDataInicio,
    veventHoraInicio,
    veventDataFim,
    veventHoraFim,
    veventDiaTodo,
    emailPara,
    emailAssunto,
    emailCorpo,
    smsPara,
    smsCorpo,
    geoLatitude,
    geoLongitude,
    whatsappPara,
    whatsappMensagem,
    telefonePara,
    historico,

    // Métodos
    updateField,
    resetCamposEspecificos,
  }
}
