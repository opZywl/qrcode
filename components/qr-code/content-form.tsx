"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Loader2, Navigation } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { TipoConteudoQR, TipoEncriptacaoWifi } from "@/hooks/use-qr-code-state"

interface FormularioConteudoProps {
  tipo: TipoConteudoQR
  valores: any
  onChange: (campo: string, valor: any) => void
  isMobile: boolean
}

export function ContentForm({ tipo, valores, onChange, isMobile }: FormularioConteudoProps) {
  const [localizandoGPS, setLocalizandoGPS] = useState(false)
  const { toast } = useToast()

  const inputHeightClass = "h-9"
  const inputPaddingClass = "py-1.5"
  const mainInputPaddingClass = isMobile ? "py-1.5" : "py-2"

  const sanitizeAndValidateUrl = (inputUrl: string): string => {
    let currentUrl = inputUrl.trim()
    if (!currentUrl) return ""

    // Corrigir protocolos malformados (ex: https:example.com -> https://example.com)
    if (/^https?:[^/][^/]/i.test(currentUrl) && !/^https?:\/\//i.test(currentUrl)) {
      currentUrl = currentUrl.replace(/^(https?:)/i, "$1//")
    }

    // Se já tem protocolo válido, retornar como está
    const protocolRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|mailto:|tel:|geo:|sms:|smsto:|vcard:|vevent:|whatsapp:)/i
    if (protocolRegex.test(currentUrl)) return currentUrl

    // Detectar localhost e IPs locais
    const localhostRegex = /^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/
    if (localhostRegex.test(currentUrl)) return `http://${currentUrl}`

    // Detectar domínios válidos
    const domainLikeRegex = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}(:\d+)?(\/.*)?$/
    if (
        domainLikeRegex.test(currentUrl) ||
        (currentUrl.includes(".") && !currentUrl.includes(" ") && !currentUrl.startsWith("/"))
    ) {
      return `https://${currentUrl}`
    }

    return currentUrl
  }

  const handleUrlBlur = () => {
    if (valores.inputUrl && tipo === "url") {
      const original = valores.inputUrl
      const sanitized = sanitizeAndValidateUrl(valores.inputUrl)

      if (original !== sanitized) {
        toast({
          title: "🔗 URL Corrigida Automaticamente",
          description: `Protocolo adicionado: ${sanitized.substring(0, 50)}${sanitized.length > 50 ? "..." : ""}`,
        })
      }

      onChange("inputUrl", sanitized)
    }
  }

  const handleLocalizarTempoReal = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "❌ Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      })
      return
    }

    setLocalizandoGPS(true)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(6)
          const longitude = position.coords.longitude.toFixed(6)

          onChange("geoLatitude", latitude)
          onChange("geoLongitude", longitude)

          setLocalizandoGPS(false)

          toast({
            title: "📍 Localização Obtida!",
            description: `Lat: ${latitude}, Lon: ${longitude}`,
          })
        },
        (error) => {
          setLocalizandoGPS(false)

          let errorMessage = "Erro ao obter localização"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permissão de localização negada. Permita o acesso à localização nas configurações."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Informações de localização não disponíveis."
              break
            case error.TIMEOUT:
              errorMessage = "Tempo limite para obter localização excedido."
              break
            default:
              errorMessage = "Erro desconhecido ao obter localização."
              break
          }

          toast({
            title: "❌ Erro de Localização",
            description: errorMessage,
            variant: "destructive",
          })
        },
        options,
    )
  }

  switch (tipo) {
    case "url":
      return (
          <div className="space-y-2">
            <Label htmlFor="url-input" className="text-sm font-medium text-foreground">
              URL ou Texto para Codificar
            </Label>
            <Input
                id="url-input"
                type="text"
                placeholder="Digite uma URL ou qualquer texto..."
                value={valores.inputUrl}
                onChange={(e) => onChange("inputUrl", e.target.value)}
                onBlur={handleUrlBlur}
                className={`${isMobile ? `h-9 ${mainInputPaddingClass}` : "h-10 py-2"} transition-all duration-300 focus:shadow-outline-primary`}
            />
          </div>
      )

    case "wifi":
      return (
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="wifi-ssid" className="text-sm font-medium text-foreground">
                Nome da Rede (SSID)
              </Label>
              <Input
                  id="wifi-ssid"
                  value={valores.wifiSsid}
                  onChange={(e) => onChange("wifiSsid", e.target.value)}
                  placeholder="Nome da rede WiFi"
                  className={inputHeightClass}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wifi-password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <Input
                  id="wifi-password"
                  type="password"
                  value={valores.wifiSenha}
                  onChange={(e) => onChange("wifiSenha", e.target.value)}
                  placeholder="Senha da rede"
                  disabled={valores.wifiEncriptacao === "nopass"}
                  className={inputHeightClass}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wifi-encryption" className="text-sm font-medium text-foreground">
                Tipo de Segurança
              </Label>
              <Select
                  value={valores.wifiEncriptacao}
                  onValueChange={(v) => onChange("wifiEncriptacao", v as TipoEncriptacaoWifi)}
              >
                <SelectTrigger id="wifi-encryption" className={`${inputHeightClass} text-sm`}>
                  <SelectValue placeholder="Selecione o tipo de segurança" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA" className="text-sm">
                    WPA/WPA2
                  </SelectItem>
                  <SelectItem value="WEP" className="text-sm">
                    WEP
                  </SelectItem>
                  <SelectItem value="nopass" className="text-sm">
                    Sem senha
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                  id="wifi-hidden"
                  checked={valores.wifiOculto}
                  onCheckedChange={(c) => onChange("wifiOculto", c as boolean)}
              />
              <Label htmlFor="wifi-hidden" className="text-sm font-medium text-foreground">
                Rede oculta
              </Label>
            </div>
          </div>
      )

    case "vcard":
      return (
          <ScrollArea className="h-[250px] sm:h-[300px] pr-3">
            <div className="space-y-3">
              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-3`}>
                <div>
                  <Label htmlFor="vcard-firstName" className="text-sm font-medium text-foreground">
                    Nome
                  </Label>
                  <Input
                      id="vcard-firstName"
                      value={valores.vcardNome}
                      onChange={(e) => onChange("vcardNome", e.target.value)}
                      placeholder="Nome"
                      className={inputHeightClass}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-lastName" className="text-sm font-medium text-foreground">
                    Sobrenome
                  </Label>
                  <Input
                      id="vcard-lastName"
                      value={valores.vcardSobrenome}
                      onChange={(e) => onChange("vcardSobrenome", e.target.value)}
                      placeholder="Sobrenome"
                      className={inputHeightClass}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vcard-organization" className="text-sm font-medium text-foreground">
                  Organização
                </Label>
                <Input
                    id="vcard-organization"
                    value={valores.vcardOrganizacao}
                    onChange={(e) => onChange("vcardOrganizacao", e.target.value)}
                    placeholder="Nome da empresa"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vcard-title" className="text-sm font-medium text-foreground">
                  Cargo
                </Label>
                <Input
                    id="vcard-title"
                    value={valores.vcardTitulo}
                    onChange={(e) => onChange("vcardTitulo", e.target.value)}
                    placeholder="Cargo ou função"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vcard-phone" className="text-sm font-medium text-foreground">
                  Telefone
                </Label>
                <Input
                    id="vcard-phone"
                    type="tel"
                    value={valores.vcardTelefone}
                    onChange={(e) => onChange("vcardTelefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vcard-email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                    id="vcard-email"
                    type="email"
                    value={valores.vcardEmail}
                    onChange={(e) => onChange("vcardEmail", e.target.value)}
                    placeholder="email@exemplo.com"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vcard-website" className="text-sm font-medium text-foreground">
                  Website
                </Label>
                <Input
                    id="vcard-website"
                    type="url"
                    value={valores.vcardWebsite}
                    onChange={(e) => onChange("vcardWebsite", e.target.value)}
                    placeholder="https://exemplo.com"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vcard-address" className="text-sm font-medium text-foreground">
                  Endereço
                </Label>
                <Input
                    id="vcard-address"
                    value={valores.vcardEndereco}
                    onChange={(e) => onChange("vcardEndereco", e.target.value)}
                    placeholder="Rua, número"
                    className={inputHeightClass}
                />
              </div>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-3`}>
                <div>
                  <Label htmlFor="vcard-city" className="text-sm font-medium text-foreground">
                    Cidade
                  </Label>
                  <Input
                      id="vcard-city"
                      value={valores.vcardCidade}
                      onChange={(e) => onChange("vcardCidade", e.target.value)}
                      placeholder="Cidade"
                      className={inputHeightClass}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-state" className="text-sm font-medium text-foreground">
                    Estado
                  </Label>
                  <Input
                      id="vcard-state"
                      value={valores.vcardEstado}
                      onChange={(e) => onChange("vcardEstado", e.target.value)}
                      placeholder="Estado"
                      className={inputHeightClass}
                  />
                </div>
              </div>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-3`}>
                <div>
                  <Label htmlFor="vcard-zip" className="text-sm font-medium text-foreground">
                    CEP
                  </Label>
                  <Input
                      id="vcard-zip"
                      value={valores.vcardCep}
                      onChange={(e) => onChange("vcardCep", e.target.value)}
                      placeholder="00000-000"
                      className={inputHeightClass}
                  />
                </div>
                <div>
                  <Label htmlFor="vcard-country" className="text-sm font-medium text-foreground">
                    País
                  </Label>
                  <Input
                      id="vcard-country"
                      value={valores.vcardPais}
                      onChange={(e) => onChange("vcardPais", e.target.value)}
                      placeholder="Brasil"
                      className={inputHeightClass}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
      )

    case "vevent":
      return (
          <ScrollArea className="h-[250px] sm:h-[300px] pr-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="vevent-summary" className="text-sm font-medium text-foreground">
                  Título do Evento
                </Label>
                <Input
                    id="vevent-summary"
                    value={valores.veventResumo}
                    onChange={(e) => onChange("veventResumo", e.target.value)}
                    placeholder="Nome do evento"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vevent-location" className="text-sm font-medium text-foreground">
                  Local
                </Label>
                <Input
                    id="vevent-location"
                    value={valores.veventLocalizacao}
                    onChange={(e) => onChange("veventLocalizacao", e.target.value)}
                    placeholder="Local do evento"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="vevent-description" className="text-sm font-medium text-foreground">
                  Descrição
                </Label>
                <Textarea
                    id="vevent-description"
                    value={valores.veventDescricao}
                    onChange={(e) => onChange("veventDescricao", e.target.value)}
                    placeholder="Descrição do evento"
                    className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
                />
              </div>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-3`}>
                <div>
                  <Label htmlFor="vevent-startDate" className="text-sm font-medium text-foreground">
                    Data de Início
                  </Label>
                  <Input
                      id="vevent-startDate"
                      type="date"
                      value={valores.veventDataInicio}
                      onChange={(e) => onChange("veventDataInicio", e.target.value)}
                      className={inputHeightClass}
                  />
                </div>
                <div>
                  <Label htmlFor="vevent-startTime" className="text-sm font-medium text-foreground">
                    Hora de Início
                  </Label>
                  <Input
                      id="vevent-startTime"
                      type="time"
                      value={valores.veventHoraInicio}
                      onChange={(e) => onChange("veventHoraInicio", e.target.value)}
                      disabled={valores.veventDiaTodo}
                      className={inputHeightClass}
                  />
                </div>
              </div>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-2"} gap-3`}>
                <div>
                  <Label htmlFor="vevent-endDate" className="text-sm font-medium text-foreground">
                    Data de Fim
                  </Label>
                  <Input
                      id="vevent-endDate"
                      type="date"
                      value={valores.veventDataFim}
                      onChange={(e) => onChange("veventDataFim", e.target.value)}
                      className={inputHeightClass}
                  />
                </div>
                <div>
                  <Label htmlFor="vevent-endTime" className="text-sm font-medium text-foreground">
                    Hora de Fim
                  </Label>
                  <Input
                      id="vevent-endTime"
                      type="time"
                      value={valores.veventHoraFim}
                      onChange={(e) => onChange("veventHoraFim", e.target.value)}
                      disabled={valores.veventDiaTodo}
                      className={inputHeightClass}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                    id="vevent-isAllDay"
                    checked={valores.veventDiaTodo}
                    onCheckedChange={(c) => onChange("veventDiaTodo", c as boolean)}
                />
                <Label htmlFor="vevent-isAllDay" className="text-sm font-medium text-foreground">
                  Evento de dia inteiro
                </Label>
              </div>
            </div>
          </ScrollArea>
      )

    case "email":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-to" className="text-sm font-medium text-foreground">
                Para
              </Label>
              <Input
                  id="email-to"
                  type="email"
                  value={valores.emailPara}
                  onChange={(e) => onChange("emailPara", e.target.value)}
                  placeholder="destinatario@exemplo.com"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="email-subject" className="text-sm font-medium text-foreground">
                Assunto
              </Label>
              <Input
                  id="email-subject"
                  value={valores.emailAssunto}
                  onChange={(e) => onChange("emailAssunto", e.target.value)}
                  placeholder="Assunto do email"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="email-body" className="text-sm font-medium text-foreground">
                Mensagem
              </Label>
              <Textarea
                  id="email-body"
                  value={valores.emailCorpo}
                  onChange={(e) => onChange("emailCorpo", e.target.value)}
                  placeholder="Corpo do email"
                  className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
              />
            </div>
          </div>
      )

    case "sms":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="sms-to" className="text-sm font-medium text-foreground">
                Para
              </Label>
              <Input
                  id="sms-to"
                  type="tel"
                  value={valores.smsPara}
                  onChange={(e) => onChange("smsPara", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="sms-body" className="text-sm font-medium text-foreground">
                Mensagem
              </Label>
              <Textarea
                  id="sms-body"
                  value={valores.smsCorpo}
                  onChange={(e) => onChange("smsCorpo", e.target.value)}
                  placeholder="Mensagem do SMS"
                  className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
              />
            </div>
          </div>
      )

    case "geo":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="geo-latitude" className="text-sm font-medium text-foreground">
                Latitude
              </Label>
              <Input
                  id="geo-latitude"
                  type="number"
                  step="any"
                  value={valores.geoLatitude}
                  onChange={(e) => onChange("geoLatitude", e.target.value)}
                  placeholder="-23.5505"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="geo-longitude" className="text-sm font-medium text-foreground">
                Longitude
              </Label>
              <Input
                  id="geo-longitude"
                  type="number"
                  step="any"
                  value={valores.geoLongitude}
                  onChange={(e) => onChange("geoLongitude", e.target.value)}
                  placeholder="-46.6333"
                  className={inputHeightClass}
              />
            </div>

            {/* Botão de Localização em Tempo Real */}
            <div className="pt-2">
              <Button
                  type="button"
                  onClick={handleLocalizarTempoReal}
                  disabled={localizandoGPS}
                  variant="outline"
                  className="w-full h-10 border-2 border-blue-400/40 hover:border-blue-500/70 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
              >
                {localizandoGPS ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Localizando...
                    </>
                ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Localizar em Tempo Real</span>
                    </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Clique para preencher automaticamente com sua localização atual
              </p>
            </div>
          </div>
      )

    case "whatsapp":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="whatsapp-to" className="text-sm font-medium text-foreground">
                Número do WhatsApp
              </Label>
              <Input
                  id="whatsapp-to"
                  type="tel"
                  value={valores.whatsappPara}
                  onChange={(e) => onChange("whatsappPara", e.target.value)}
                  placeholder="5511999999999"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp-message" className="text-sm font-medium text-foreground">
                Mensagem
              </Label>
              <Textarea
                  id="whatsapp-message"
                  value={valores.whatsappMensagem}
                  onChange={(e) => onChange("whatsappMensagem", e.target.value)}
                  placeholder="Mensagem do WhatsApp"
                  className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
              />
            </div>
          </div>
      )

    case "phone":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone-to" className="text-sm font-medium text-foreground">
                Número de Telefone
              </Label>
              <Input
                  id="phone-to"
                  type="tel"
                  value={valores.telefonePara}
                  onChange={(e) => onChange("telefonePara", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={inputHeightClass}
              />
            </div>
          </div>
      )

    case "pix":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="pix-chave" className="text-sm font-medium text-foreground">
                Chave PIX
              </Label>
              <Input
                  id="pix-chave"
                  value={valores.pixChave}
                  onChange={(e) => onChange("pixChave", e.target.value)}
                  placeholder="CPF, email, telefone ou chave aleatória"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="pix-nome" className="text-sm font-medium text-foreground">
                Nome do Beneficiário
              </Label>
              <Input
                  id="pix-nome"
                  value={valores.pixNome}
                  onChange={(e) => onChange("pixNome", e.target.value)}
                  placeholder="Nome completo"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="pix-cidade" className="text-sm font-medium text-foreground">
                Cidade
              </Label>
              <Input
                  id="pix-cidade"
                  value={valores.pixCidade}
                  onChange={(e) => onChange("pixCidade", e.target.value)}
                  placeholder="Cidade do beneficiário"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="pix-valor" className="text-sm font-medium text-foreground">
                Valor (opcional)
              </Label>
              <Input
                  id="pix-valor"
                  type="number"
                  step="0.01"
                  value={valores.pixValor}
                  onChange={(e) => onChange("pixValor", e.target.value)}
                  placeholder="0.00"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="pix-descricao" className="text-sm font-medium text-foreground">
                Descrição (opcional)
              </Label>
              <Input
                  id="pix-descricao"
                  value={valores.pixDescricao}
                  onChange={(e) => onChange("pixDescricao", e.target.value)}
                  placeholder="Descrição do pagamento"
                  className={inputHeightClass}
              />
            </div>
          </div>
      )

    case "appstore":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="appstore-nome" className="text-sm font-medium text-foreground">
                Nome do App
              </Label>
              <Input
                  id="appstore-nome"
                  value={valores.appstoreNome}
                  onChange={(e) => onChange("appstoreNome", e.target.value)}
                  placeholder="Nome do aplicativo"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="appstore-plataforma" className="text-sm font-medium text-foreground">
                Plataforma
              </Label>
              <Select value={valores.appstorePlataforma} onValueChange={(v) => onChange("appstorePlataforma", v)}>
                <SelectTrigger id="appstore-plataforma" className={`${inputHeightClass} text-sm`}>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios" className="text-sm">
                    iOS (App Store)
                  </SelectItem>
                  <SelectItem value="android" className="text-sm">
                    Android (Play Store)
                  </SelectItem>
                  <SelectItem value="ambos" className="text-sm">
                    Ambos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(valores.appstorePlataforma === "ios" || valores.appstorePlataforma === "ambos") && (
                <div>
                  <Label htmlFor="appstore-ios" className="text-sm font-medium text-foreground">
                    URL da App Store (iOS)
                  </Label>
                  <Input
                      id="appstore-ios"
                      value={valores.appstoreIosUrl}
                      onChange={(e) => onChange("appstoreIosUrl", e.target.value)}
                      placeholder="https://apps.apple.com/app/..."
                      className={inputHeightClass}
                  />
                </div>
            )}
            {(valores.appstorePlataforma === "android" || valores.appstorePlataforma === "ambos") && (
                <div>
                  <Label htmlFor="appstore-android" className="text-sm font-medium text-foreground">
                    URL da Play Store (Android)
                  </Label>
                  <Input
                      id="appstore-android"
                      value={valores.appstoreAndroidUrl}
                      onChange={(e) => onChange("appstoreAndroidUrl", e.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      className={inputHeightClass}
                  />
                </div>
            )}
          </div>
      )

    case "spotify":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="spotify-tipo" className="text-sm font-medium text-foreground">
                Tipo de Conteúdo
              </Label>
              <Select value={valores.spotifyTipo} onValueChange={(v) => onChange("spotifyTipo", v)}>
                <SelectTrigger id="spotify-tipo" className={`${inputHeightClass} text-sm`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="track" className="text-sm">
                    Música (Spotify)
                  </SelectItem>
                  <SelectItem value="album" className="text-sm">
                    Álbum (Spotify)
                  </SelectItem>
                  <SelectItem value="playlist" className="text-sm">
                    Playlist (Spotify)
                  </SelectItem>
                  <SelectItem value="artist" className="text-sm">
                    Artista (Spotify)
                  </SelectItem>
                  <SelectItem value="youtube" className="text-sm">
                    Vídeo (YouTube)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="spotify-url" className="text-sm font-medium text-foreground">
                URL do {valores.spotifyTipo === "youtube" ? "YouTube" : "Spotify"}
              </Label>
              <Input
                  id="spotify-url"
                  value={valores.spotifyUrl}
                  onChange={(e) => onChange("spotifyUrl", e.target.value)}
                  placeholder={
                    valores.spotifyTipo === "youtube" ? "https://youtube.com/watch?v=..." : "https://open.spotify.com/..."
                  }
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="spotify-titulo" className="text-sm font-medium text-foreground">
                Título
              </Label>
              <Input
                  id="spotify-titulo"
                  value={valores.spotifyTitulo}
                  onChange={(e) => onChange("spotifyTitulo", e.target.value)}
                  placeholder="Nome da música/álbum/playlist"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="spotify-artista" className="text-sm font-medium text-foreground">
                Artista/Canal
              </Label>
              <Input
                  id="spotify-artista"
                  value={valores.spotifyArtista}
                  onChange={(e) => onChange("spotifyArtista", e.target.value)}
                  placeholder="Nome do artista ou canal"
                  className={inputHeightClass}
              />
            </div>
          </div>
      )

    case "zoom":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="zoom-tipo" className="text-sm font-medium text-foreground">
                Plataforma
              </Label>
              <Select value={valores.zoomTipo} onValueChange={(v) => onChange("zoomTipo", v)}>
                <SelectTrigger id="zoom-tipo" className={`${inputHeightClass} text-sm`}>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom" className="text-sm">
                    Zoom
                  </SelectItem>
                  <SelectItem value="meet" className="text-sm">
                    Google Meet
                  </SelectItem>
                  <SelectItem value="teams" className="text-sm">
                    Microsoft Teams
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zoom-titulo" className="text-sm font-medium text-foreground">
                Título da Reunião
              </Label>
              <Input
                  id="zoom-titulo"
                  value={valores.zoomTitulo}
                  onChange={(e) => onChange("zoomTitulo", e.target.value)}
                  placeholder="Nome da reunião"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="zoom-url" className="text-sm font-medium text-foreground">
                URL da Reunião
              </Label>
              <Input
                  id="zoom-url"
                  value={valores.zoomUrl}
                  onChange={(e) => onChange("zoomUrl", e.target.value)}
                  placeholder="https://zoom.us/j/... ou https://meet.google.com/..."
                  className={inputHeightClass}
              />
            </div>
            {valores.zoomTipo === "zoom" && (
                <>
                  <div>
                    <Label htmlFor="zoom-id" className="text-sm font-medium text-foreground">
                      ID da Reunião (opcional)
                    </Label>
                    <Input
                        id="zoom-id"
                        value={valores.zoomId}
                        onChange={(e) => onChange("zoomId", e.target.value)}
                        placeholder="123 456 7890"
                        className={inputHeightClass}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zoom-senha" className="text-sm font-medium text-foreground">
                      Senha (opcional)
                    </Label>
                    <Input
                        id="zoom-senha"
                        type="password"
                        value={valores.zoomSenha}
                        onChange={(e) => onChange("zoomSenha", e.target.value)}
                        placeholder="Senha da reunião"
                        className={inputHeightClass}
                    />
                  </div>
                </>
            )}
          </div>
      )

    case "menu":
      return (
          <ScrollArea className="h-[250px] sm:h-[300px] pr-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="menu-nome" className="text-sm font-medium text-foreground">
                  Nome do Restaurante
                </Label>
                <Input
                    id="menu-nome"
                    value={valores.menuNome}
                    onChange={(e) => onChange("menuNome", e.target.value)}
                    placeholder="Nome do estabelecimento"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="menu-categoria" className="text-sm font-medium text-foreground">
                  Categoria
                </Label>
                <Input
                    id="menu-categoria"
                    value={valores.menuCategoria}
                    onChange={(e) => onChange("menuCategoria", e.target.value)}
                    placeholder="Ex: Pratos principais, Bebidas, Sobremesas"
                    className={inputHeightClass}
                />
              </div>
              <div>
                <Label htmlFor="menu-descricao" className="text-sm font-medium text-foreground">
                  Descrição
                </Label>
                <Textarea
                    id="menu-descricao"
                    value={valores.menuDescricao}
                    onChange={(e) => onChange("menuDescricao", e.target.value)}
                    placeholder="Descrição do restaurante ou categoria"
                    className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
                />
              </div>
              <div>
                <Label htmlFor="menu-itens" className="text-sm font-medium text-foreground">
                  Itens do Menu
                </Label>
                <Textarea
                    id="menu-itens"
                    value={valores.menuItens}
                    onChange={(e) => onChange("menuItens", e.target.value)}
                    placeholder="Liste os itens do menu, um por linha"
                    className={isMobile ? `min-h-[80px] ${inputPaddingClass}` : `min-h-[100px] py-2`}
                />
              </div>
              <div>
                <Label htmlFor="menu-preco" className="text-sm font-medium text-foreground">
                  Informações de Preço
                </Label>
                <Input
                    id="menu-preco"
                    value={valores.menuPreco}
                    onChange={(e) => onChange("menuPreco", e.target.value)}
                    placeholder="Ex: A partir de R$ 25,00"
                    className={inputHeightClass}
                />
              </div>
            </div>
          </ScrollArea>
      )

    case "cupom":
      return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cupom-codigo" className="text-sm font-medium text-foreground">
                Código do Cupom
              </Label>
              <Input
                  id="cupom-codigo"
                  value={valores.cupomCodigo}
                  onChange={(e) => onChange("cupomCodigo", e.target.value)}
                  placeholder="DESCONTO20"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="cupom-tipo" className="text-sm font-medium text-foreground">
                Tipo de Desconto
              </Label>
              <Select value={valores.cupomTipo} onValueChange={(v) => onChange("cupomTipo", v)}>
                <SelectTrigger id="cupom-tipo" className={`${inputHeightClass} text-sm`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desconto" className="text-sm">
                    Desconto
                  </SelectItem>
                  <SelectItem value="frete" className="text-sm">
                    Frete Grátis
                  </SelectItem>
                  <SelectItem value="produto" className="text-sm">
                    Produto Grátis
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cupom-valor" className="text-sm font-medium text-foreground">
                Valor do Desconto
              </Label>
              <Input
                  id="cupom-valor"
                  value={valores.cupomValor}
                  onChange={(e) => onChange("cupomValor", e.target.value)}
                  placeholder="20% ou R$ 50,00"
                  className={inputHeightClass}
              />
            </div>
            <div>
              <Label htmlFor="cupom-descricao" className="text-sm font-medium text-foreground">
                Descrição
              </Label>
              <Textarea
                  id="cupom-descricao"
                  value={valores.cupomDescricao}
                  onChange={(e) => onChange("cupomDescricao", e.target.value)}
                  placeholder="Descrição da promoção"
                  className={isMobile ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`}
              />
            </div>
            <div>
              <Label htmlFor="cupom-validade" className="text-sm font-medium text-foreground">
                Validade
              </Label>
              <Input
                  id="cupom-validade"
                  type="date"
                  value={valores.cupomValidade}
                  onChange={(e) => onChange("cupomValidade", e.target.value)}
                  className={inputHeightClass}
              />
            </div>
          </div>
      )

    default:
      return (
          <div className="text-center py-4 text-muted-foreground">
            <p>Formulário para {tipo} será implementado em breve</p>
          </div>
      )
  }
}