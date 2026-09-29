"use client"

import { useState, type ReactNode } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocalIcon } from "@/components/ui/local-icon"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import type { QrState, UpdateField } from "@/hooks/use-qr-code-state"
import type { TranslationValue } from "@/lib/i18n"
import { MESSAGES } from "@/lib/messages"
import { detectPixKey, type PixKeyType } from "@/lib/qr/pix"
import {
  APPSTORE_PLATFORMS,
  COUPON_TYPES,
  MEDIA_TYPES,
  MEETING_TYPES,
  WIFI_ENCRYPTIONS,
  type AppstorePlataforma,
  type CupomTipo,
  type SpotifyTipo,
  type TipoConteudoQR,
  type TipoEncriptacaoWifi,
  type ZoomTipo,
} from "@/lib/qr/types"
import { normalizeUrlInput } from "@/lib/qr/url"

interface ContentFormProps {
  tipo: TipoConteudoQR
  valores: QrState
  onChange: UpdateField
  isMobile: boolean
}

const WIFI_LABELS: Record<TipoEncriptacaoWifi, TranslationValue> = {
  WPA: { pt: "WPA/WPA2/WPA3", en: "WPA/WPA2/WPA3", es: "WPA/WPA2/WPA3" },
  WEP: { pt: "WEP", en: "WEP", es: "WEP" },
  nopass: { pt: "Sem senha", en: "No password", es: "Sin contraseña" },
}

const APPSTORE_LABELS: Record<AppstorePlataforma, TranslationValue> = {
  ios: { pt: "iOS (App Store)", en: "iOS (App Store)", es: "iOS (App Store)" },
  android: { pt: "Android (Play Store)", en: "Android (Play Store)", es: "Android (Play Store)" },
  ambos: { pt: "Ambos", en: "Both", es: "Ambos" },
}

const MEDIA_LABELS: Record<SpotifyTipo, TranslationValue> = {
  track: { pt: "Música (Spotify)", en: "Song (Spotify)", es: "Canción (Spotify)" },
  album: { pt: "Álbum (Spotify)", en: "Album (Spotify)", es: "Álbum (Spotify)" },
  playlist: { pt: "Playlist (Spotify)", en: "Playlist (Spotify)", es: "Playlist (Spotify)" },
  artist: { pt: "Artista (Spotify)", en: "Artist (Spotify)", es: "Artista (Spotify)" },
  youtube: { pt: "Vídeo (YouTube)", en: "Video (YouTube)", es: "Vídeo (YouTube)" },
}

const MEETING_LABELS: Record<ZoomTipo, string> = {
  zoom: "Zoom",
  meet: "Google Meet",
  teams: "Microsoft Teams",
}

const COUPON_LABELS: Record<CupomTipo, TranslationValue> = {
  desconto: { pt: "Desconto", en: "Discount", es: "Descuento" },
  frete: { pt: "Frete grátis", en: "Free shipping", es: "Envío gratis" },
  produto: { pt: "Produto grátis", en: "Free product", es: "Producto gratis" },
}

const PIX_KEY_LABELS: Record<PixKeyType, TranslationValue> = {
  cpf: { pt: "CPF", en: "CPF", es: "CPF" },
  cnpj: { pt: "CNPJ", en: "CNPJ", es: "CNPJ" },
  phone: { pt: "telefone", en: "phone", es: "teléfono" },
  email: { pt: "email", en: "email", es: "correo" },
  evp: { pt: "chave aleatória", en: "random key", es: "clave aleatoria" },
}

function Field({ id, label, hint, children }: { id?: string; label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium leading-5 text-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ContentForm({ tipo, valores, onChange, isMobile }: ContentFormProps) {
  const { t } = useLanguage()
  const [locating, setLocating] = useState(false)
  const [showWifiPassword, setShowWifiPassword] = useState(false)

  const inputClass = "h-9"
  const textareaClass = isMobile ? "min-h-15 py-1.5" : "min-h-20 py-2"
  const twoColumns = `grid grid-cols-1 gap-3 ${isMobile ? "" : "sm:grid-cols-2"}`

  const handleUrlBlur = () => {
    if (!valores.inputUrl.trim()) {
      return
    }
    const normalized = normalizeUrlInput(valores.inputUrl)
    if (normalized !== valores.inputUrl.trim()) {
      toast({
        title: t(MESSAGES.urlCorrectedTitle),
        description: t(MESSAGES.urlCorrected(normalized.length > 60 ? `${normalized.slice(0, 60)}…` : normalized)),
      })
    }
    if (normalized !== valores.inputUrl) {
      onChange("inputUrl", normalized)
    }
  }

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      toast({
        variant: "destructive",
        title: t({ pt: "Geolocalização indisponível", en: "Geolocation unavailable", es: "Geolocalización no disponible" }),
        description: t({
          pt: "Seu navegador não suporta geolocalização.",
          en: "Your browser does not support geolocation.",
          es: "Tu navegador no admite geolocalización.",
        }),
      })
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6)
        const longitude = position.coords.longitude.toFixed(6)
        onChange("geoLatitude", latitude)
        onChange("geoLongitude", longitude)
        setLocating(false)
        toast({
          title: t({ pt: "Localização obtida", en: "Location found", es: "Ubicación obtenida" }),
          description: `Lat: ${latitude}, Lon: ${longitude}`,
        })
      },
      (error) => {
        setLocating(false)
        const description =
          error.code === error.PERMISSION_DENIED
            ? t({
                pt: "Permissão negada. Libere a localização nas configurações do navegador.",
                en: "Permission denied. Allow location access in the browser settings.",
                es: "Permiso denegado. Permite la ubicación en los ajustes del navegador.",
              })
            : error.code === error.POSITION_UNAVAILABLE
              ? t({ pt: "Localização indisponível.", en: "Location unavailable.", es: "Ubicación no disponible." })
              : error.code === error.TIMEOUT
                ? t({ pt: "Tempo esgotado ao obter a localização.", en: "Timed out getting the location.", es: "Se agotó el tiempo al obtener la ubicación." })
                : t({ pt: "Erro ao obter a localização.", en: "Could not get the location.", es: "No se pudo obtener la ubicación." })
        toast({
          variant: "destructive",
          title: t({ pt: "Erro de localização", en: "Location error", es: "Error de ubicación" }),
          description,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  switch (tipo) {
    case "url":
      return (
        <Field id="url-input" label={t({ pt: "URL ou texto para codificar", en: "URL or text to encode", es: "URL o texto para codificar" })}>
          <Input
            id="url-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder={t({ pt: "Digite uma URL ou qualquer texto...", en: "Enter a URL or any text...", es: "Escribe una URL o cualquier texto..." })}
            value={valores.inputUrl}
            onChange={(event) => onChange("inputUrl", event.target.value)}
            onBlur={handleUrlBlur}
            className={isMobile ? "h-9 py-1.5" : "h-10 py-2"}
          />
        </Field>
      )

    case "wifi":
      return (
        <div className="space-y-3 py-2">
          <Field id="wifi-ssid" label={t({ pt: "Nome da rede (SSID)", en: "Network name (SSID)", es: "Nombre de la red (SSID)" })}>
            <Input
              id="wifi-ssid"
              autoComplete="off"
              value={valores.wifiSsid}
              onChange={(event) => onChange("wifiSsid", event.target.value)}
              placeholder={t({ pt: "Nome da rede Wi-Fi", en: "Wi-Fi network name", es: "Nombre de la red Wi-Fi" })}
              className={inputClass}
            />
          </Field>
          <Field id="wifi-password" label={t({ pt: "Senha", en: "Password", es: "Contraseña" })}>
            <div className="relative">
              <Input
                id="wifi-password"
                type={showWifiPassword ? "text" : "password"}
                autoComplete="off"
                value={valores.wifiSenha}
                onChange={(event) => onChange("wifiSenha", event.target.value)}
                placeholder={t({ pt: "Senha da rede", en: "Network password", es: "Contraseña de la red" })}
                disabled={valores.wifiEncriptacao === "nopass"}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowWifiPassword((current) => !current)}
                disabled={valores.wifiEncriptacao === "nopass"}
                aria-label={
                  showWifiPassword
                    ? t({ pt: "Ocultar senha", en: "Hide password", es: "Ocultar contraseña" })
                    : t({ pt: "Mostrar senha", en: "Show password", es: "Mostrar contraseña" })
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-2xl text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <LocalIcon name={showWifiPassword ? "eye-off" : "eye"} className="h-4 w-4" />
              </button>
            </div>
          </Field>
          <Field id="wifi-encryption" label={t({ pt: "Tipo de segurança", en: "Security type", es: "Tipo de seguridad" })}>
            <Select value={valores.wifiEncriptacao} onValueChange={(value) => onChange("wifiEncriptacao", value as TipoEncriptacaoWifi)}>
              <SelectTrigger id="wifi-encryption" className={`${inputClass} text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIFI_ENCRYPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {t(WIFI_LABELS[option])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="wifi-hidden" checked={valores.wifiOculto} onCheckedChange={(checked) => onChange("wifiOculto", checked === true)} />
            <Label htmlFor="wifi-hidden" className="text-sm font-medium text-foreground">
              {t({ pt: "Rede oculta", en: "Hidden network", es: "Red oculta" })}
            </Label>
          </div>
        </div>
      )

    case "vcard":
      return (
        <ScrollArea className="h-62.5 pr-3 sm:h-75">
          <div className="space-y-3">
            <div className={twoColumns}>
              <Field id="vcard-firstName" label={t({ pt: "Nome", en: "First name", es: "Nombre" })}>
                <Input
                  id="vcard-firstName"
                  autoComplete="given-name"
                  value={valores.vcardNome}
                  onChange={(event) => onChange("vcardNome", event.target.value)}
                  placeholder={t({ pt: "Nome", en: "First name", es: "Nombre" })}
                  className={inputClass}
                />
              </Field>
              <Field id="vcard-lastName" label={t({ pt: "Sobrenome", en: "Last name", es: "Apellido" })}>
                <Input
                  id="vcard-lastName"
                  autoComplete="family-name"
                  value={valores.vcardSobrenome}
                  onChange={(event) => onChange("vcardSobrenome", event.target.value)}
                  placeholder={t({ pt: "Sobrenome", en: "Last name", es: "Apellido" })}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field id="vcard-organization" label={t({ pt: "Organização", en: "Organization", es: "Organización" })}>
              <Input
                id="vcard-organization"
                autoComplete="organization"
                value={valores.vcardOrganizacao}
                onChange={(event) => onChange("vcardOrganizacao", event.target.value)}
                placeholder={t({ pt: "Nome da empresa", en: "Company name", es: "Nombre de la empresa" })}
                className={inputClass}
              />
            </Field>
            <Field id="vcard-title" label={t({ pt: "Cargo", en: "Job title", es: "Cargo" })}>
              <Input
                id="vcard-title"
                autoComplete="organization-title"
                value={valores.vcardTitulo}
                onChange={(event) => onChange("vcardTitulo", event.target.value)}
                placeholder={t({ pt: "Cargo ou função", en: "Role or position", es: "Cargo o función" })}
                className={inputClass}
              />
            </Field>
            <Field id="vcard-phone" label={t({ pt: "Telefone", en: "Phone", es: "Teléfono" })}>
              <Input
                id="vcard-phone"
                type="tel"
                autoComplete="tel"
                value={valores.vcardTelefone}
                onChange={(event) => onChange("vcardTelefone", event.target.value)}
                placeholder="+55 11 99999-9999"
                className={inputClass}
              />
            </Field>
            <Field id="vcard-email" label={t({ pt: "Email", en: "Email", es: "Correo" })}>
              <Input
                id="vcard-email"
                type="email"
                autoComplete="email"
                value={valores.vcardEmail}
                onChange={(event) => onChange("vcardEmail", event.target.value)}
                placeholder={t({ pt: "email@exemplo.com", en: "email@example.com", es: "correo@ejemplo.com" })}
                className={inputClass}
              />
            </Field>
            <Field id="vcard-website" label="Website">
              <Input
                id="vcard-website"
                type="url"
                autoComplete="url"
                value={valores.vcardWebsite}
                onChange={(event) => onChange("vcardWebsite", event.target.value)}
                placeholder={t({ pt: "https://exemplo.com", en: "https://example.com", es: "https://ejemplo.com" })}
                className={inputClass}
              />
            </Field>
            <Field id="vcard-address" label={t({ pt: "Endereço", en: "Address", es: "Dirección" })}>
              <Input
                id="vcard-address"
                autoComplete="street-address"
                value={valores.vcardEndereco}
                onChange={(event) => onChange("vcardEndereco", event.target.value)}
                placeholder={t({ pt: "Rua, número", en: "Street, number", es: "Calle, número" })}
                className={inputClass}
              />
            </Field>
            <div className={twoColumns}>
              <Field id="vcard-city" label={t({ pt: "Cidade", en: "City", es: "Ciudad" })}>
                <Input
                  id="vcard-city"
                  autoComplete="address-level2"
                  value={valores.vcardCidade}
                  onChange={(event) => onChange("vcardCidade", event.target.value)}
                  placeholder={t({ pt: "Cidade", en: "City", es: "Ciudad" })}
                  className={inputClass}
                />
              </Field>
              <Field id="vcard-state" label={t({ pt: "Estado", en: "State", es: "Estado o provincia" })}>
                <Input
                  id="vcard-state"
                  autoComplete="address-level1"
                  value={valores.vcardEstado}
                  onChange={(event) => onChange("vcardEstado", event.target.value)}
                  placeholder={t({ pt: "Estado", en: "State", es: "Provincia" })}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className={twoColumns}>
              <Field id="vcard-zip" label={t({ pt: "CEP", en: "ZIP code", es: "Código postal" })}>
                <Input
                  id="vcard-zip"
                  autoComplete="postal-code"
                  value={valores.vcardCep}
                  onChange={(event) => onChange("vcardCep", event.target.value)}
                  placeholder="00000-000"
                  className={inputClass}
                />
              </Field>
              <Field id="vcard-country" label={t({ pt: "País", en: "Country", es: "País" })}>
                <Input
                  id="vcard-country"
                  autoComplete="country-name"
                  value={valores.vcardPais}
                  onChange={(event) => onChange("vcardPais", event.target.value)}
                  placeholder={t({ pt: "Brasil", en: "Brazil", es: "Brasil" })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </ScrollArea>
      )

    case "vevent":
      return (
        <ScrollArea className="h-62.5 pr-3 sm:h-75">
          <div className="space-y-3">
            <Field id="vevent-summary" label={t({ pt: "Título do evento", en: "Event title", es: "Título del evento" })}>
              <Input
                id="vevent-summary"
                value={valores.veventResumo}
                onChange={(event) => onChange("veventResumo", event.target.value)}
                placeholder={t({ pt: "Nome do evento", en: "Event name", es: "Nombre del evento" })}
                className={inputClass}
              />
            </Field>
            <Field id="vevent-location" label={t({ pt: "Local", en: "Location", es: "Lugar" })}>
              <Input
                id="vevent-location"
                value={valores.veventLocalizacao}
                onChange={(event) => onChange("veventLocalizacao", event.target.value)}
                placeholder={t({ pt: "Local do evento", en: "Event location", es: "Lugar del evento" })}
                className={inputClass}
              />
            </Field>
            <Field id="vevent-description" label={t({ pt: "Descrição", en: "Description", es: "Descripción" })}>
              <Textarea
                id="vevent-description"
                value={valores.veventDescricao}
                onChange={(event) => onChange("veventDescricao", event.target.value)}
                placeholder={t({ pt: "Descrição do evento", en: "Event description", es: "Descripción del evento" })}
                className={textareaClass}
              />
            </Field>
            <div className={twoColumns}>
              <Field id="vevent-startDate" label={t({ pt: "Data de início", en: "Start date", es: "Fecha de inicio" })}>
                <Input
                  id="vevent-startDate"
                  type="date"
                  value={valores.veventDataInicio}
                  onChange={(event) => onChange("veventDataInicio", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field id="vevent-startTime" label={t({ pt: "Hora de início", en: "Start time", es: "Hora de inicio" })}>
                <Input
                  id="vevent-startTime"
                  type="time"
                  value={valores.veventHoraInicio}
                  onChange={(event) => onChange("veventHoraInicio", event.target.value)}
                  disabled={valores.veventDiaTodo}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className={twoColumns}>
              <Field id="vevent-endDate" label={t({ pt: "Data de fim", en: "End date", es: "Fecha de fin" })}>
                <Input
                  id="vevent-endDate"
                  type="date"
                  min={valores.veventDataInicio || undefined}
                  value={valores.veventDataFim}
                  onChange={(event) => onChange("veventDataFim", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field id="vevent-endTime" label={t({ pt: "Hora de fim", en: "End time", es: "Hora de fin" })}>
                <Input
                  id="vevent-endTime"
                  type="time"
                  value={valores.veventHoraFim}
                  onChange={(event) => onChange("veventHoraFim", event.target.value)}
                  disabled={valores.veventDiaTodo}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="vevent-isAllDay"
                checked={valores.veventDiaTodo}
                onCheckedChange={(checked) => onChange("veventDiaTodo", checked === true)}
              />
              <Label htmlFor="vevent-isAllDay" className="text-sm font-medium text-foreground">
                {t({ pt: "Evento de dia inteiro", en: "All-day event", es: "Evento de todo el día" })}
              </Label>
            </div>
          </div>
        </ScrollArea>
      )

    case "email":
      return (
        <div className="space-y-3">
          <Field id="email-to" label={t({ pt: "Para", en: "To", es: "Para" })}>
            <Input
              id="email-to"
              type="email"
              autoComplete="email"
              value={valores.emailPara}
              onChange={(event) => onChange("emailPara", event.target.value)}
              placeholder={t({ pt: "destinatario@exemplo.com", en: "recipient@example.com", es: "destinatario@ejemplo.com" })}
              className={inputClass}
            />
          </Field>
          <Field id="email-subject" label={t({ pt: "Assunto", en: "Subject", es: "Asunto" })}>
            <Input
              id="email-subject"
              value={valores.emailAssunto}
              onChange={(event) => onChange("emailAssunto", event.target.value)}
              placeholder={t({ pt: "Assunto do email", en: "Email subject", es: "Asunto del correo" })}
              className={inputClass}
            />
          </Field>
          <Field id="email-body" label={t({ pt: "Mensagem", en: "Message", es: "Mensaje" })}>
            <Textarea
              id="email-body"
              value={valores.emailCorpo}
              onChange={(event) => onChange("emailCorpo", event.target.value)}
              placeholder={t({ pt: "Corpo do email", en: "Email body", es: "Cuerpo del correo" })}
              className={textareaClass}
            />
          </Field>
        </div>
      )

    case "sms":
      return (
        <div className="space-y-3">
          <Field id="sms-to" label={t({ pt: "Para", en: "To", es: "Para" })}>
            <Input
              id="sms-to"
              type="tel"
              autoComplete="tel"
              value={valores.smsPara}
              onChange={(event) => onChange("smsPara", event.target.value)}
              placeholder="+55 11 99999-9999"
              className={inputClass}
            />
          </Field>
          <Field id="sms-body" label={t({ pt: "Mensagem", en: "Message", es: "Mensaje" })}>
            <Textarea
              id="sms-body"
              value={valores.smsCorpo}
              onChange={(event) => onChange("smsCorpo", event.target.value)}
              placeholder={t({ pt: "Mensagem do SMS", en: "SMS message", es: "Mensaje SMS" })}
              className={textareaClass}
            />
          </Field>
        </div>
      )

    case "geo":
      return (
        <div className="space-y-3">
          <Field id="geo-latitude" label="Latitude">
            <Input
              id="geo-latitude"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={valores.geoLatitude}
              onChange={(event) => onChange("geoLatitude", event.target.value)}
              placeholder="-23.5505"
              className={inputClass}
            />
          </Field>
          <Field id="geo-longitude" label="Longitude">
            <Input
              id="geo-longitude"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={valores.geoLongitude}
              onChange={(event) => onChange("geoLongitude", event.target.value)}
              placeholder="-46.6333"
              className={inputClass}
            />
          </Field>
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleLocate}
              disabled={locating}
              variant="outline"
              className="h-10 w-full border-2 border-blue-400/40 transition-all duration-200 hover:border-blue-500/70 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              {locating ? (
                <>
                  <LocalIcon name="reset" className="mr-2 h-4 w-4 animate-spin" />
                  {t({ pt: "Localizando...", en: "Locating...", es: "Localizando..." })}
                </>
              ) : (
                <>
                  <LocalIcon name="geo" className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{t({ pt: "Usar minha localização", en: "Use my location", es: "Usar mi ubicación" })}</span>
                </>
              )}
            </Button>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {t({
                pt: "Preenche automaticamente com a sua localização atual.",
                en: "Fills in your current location automatically.",
                es: "Rellena automáticamente con tu ubicación actual.",
              })}
            </p>
          </div>
        </div>
      )

    case "whatsapp":
      return (
        <div className="space-y-3">
          <Field
            id="whatsapp-to"
            label={t({ pt: "Número do WhatsApp", en: "WhatsApp number", es: "Número de WhatsApp" })}
            hint={t({ pt: "Com DDI e DDD, ex.: 5511999999999.", en: "With country code, e.g. 15551234567.", es: "Con código de país, p. ej. 34612345678." })}
          >
            <Input
              id="whatsapp-to"
              type="tel"
              autoComplete="tel"
              value={valores.whatsappPara}
              onChange={(event) => onChange("whatsappPara", event.target.value)}
              placeholder="5511999999999"
              className={inputClass}
            />
          </Field>
          <Field id="whatsapp-message" label={t({ pt: "Mensagem", en: "Message", es: "Mensaje" })}>
            <Textarea
              id="whatsapp-message"
              value={valores.whatsappMensagem}
              onChange={(event) => onChange("whatsappMensagem", event.target.value)}
              placeholder={t({ pt: "Mensagem do WhatsApp", en: "WhatsApp message", es: "Mensaje de WhatsApp" })}
              className={textareaClass}
            />
          </Field>
        </div>
      )

    case "whatsappGroup":
      return (
        <div className="space-y-3">
          <Field
            id="whatsapp-group-link"
            label={t({ pt: "Link do grupo do WhatsApp", en: "WhatsApp group link", es: "Enlace del grupo de WhatsApp" })}
            hint={t({
              pt: "Cole o link de convite do grupo do WhatsApp.",
              en: "Paste the WhatsApp group invite link.",
              es: "Pega el enlace de invitación del grupo de WhatsApp.",
            })}
          >
            <Input
              id="whatsapp-group-link"
              type="url"
              inputMode="url"
              value={valores.whatsappGroupLink}
              onChange={(event) => onChange("whatsappGroupLink", event.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className={inputClass}
            />
          </Field>
          <Field
            id="whatsapp-group-message"
            label={t({ pt: "Mensagem de boas-vindas / validação", en: "Welcome / validation message", es: "Mensaje de bienvenida / validación" })}
            hint={t({
              pt: "Essa mensagem aparece junto ao QR Code como instrução para quem entrar no grupo.",
              en: "This message is shown with the QR code as instructions for people joining the group.",
              es: "Este mensaje aparece junto al código QR como instrucción para quien entre al grupo.",
            })}
          >
            <Textarea
              id="whatsapp-group-message"
              value={valores.whatsappGroupMensagem}
              onChange={(event) => onChange("whatsappGroupMensagem", event.target.value)}
              placeholder={t({
                pt: "Por favor, preencha:\nRA:\nNome:\nSemestre:",
                en: "Please fill in:\nStudent ID:\nName:\nSemester:",
                es: "Por favor, completa:\nMatrícula:\nNombre:\nSemestre:",
              })}
              className={isMobile ? "min-h-25 py-1.5" : "min-h-30 py-2"}
            />
          </Field>
        </div>
      )

    case "phone":
      return (
        <Field id="phone-to" label={t({ pt: "Número de telefone", en: "Phone number", es: "Número de teléfono" })}>
          <Input
            id="phone-to"
            type="tel"
            autoComplete="tel"
            value={valores.telefonePara}
            onChange={(event) => onChange("telefonePara", event.target.value)}
            placeholder="+55 11 99999-9999"
            className={inputClass}
          />
        </Field>
      )

    case "pix": {
      const detectedKey = valores.pixChave.trim() ? detectPixKey(valores.pixChave) : null
      const keyHint = !valores.pixChave.trim()
        ? t({
            pt: "Gera o PIX copia e cola oficial (BR Code), aceito pelos apps de banco.",
            en: "Creates the official PIX copy-and-paste code (BR Code) accepted by banking apps.",
            es: "Genera el código PIX oficial (BR Code) aceptado por las apps bancarias.",
          })
        : detectedKey
          ? `${t({ pt: "Chave detectada", en: "Detected key", es: "Clave detectada" })}: ${t(PIX_KEY_LABELS[detectedKey.type])}`
          : t({ pt: "Chave não reconhecida.", en: "Key not recognized.", es: "Clave no reconocida." })

      return (
        <div className="space-y-3">
          <Field id="pix-chave" label={t({ pt: "Chave PIX", en: "PIX key", es: "Clave PIX" })} hint={keyHint}>
            <Input
              id="pix-chave"
              autoComplete="off"
              value={valores.pixChave}
              onChange={(event) => onChange("pixChave", event.target.value)}
              placeholder={t({
                pt: "CPF, CNPJ, email, telefone ou chave aleatória",
                en: "CPF, CNPJ, email, phone or random key",
                es: "CPF, CNPJ, correo, teléfono o clave aleatoria",
              })}
              aria-invalid={valores.pixChave.trim() !== "" && !detectedKey}
              className={inputClass}
            />
          </Field>
          <Field id="pix-nome" label={t({ pt: "Nome do beneficiário", en: "Recipient name", es: "Nombre del beneficiario" })}>
            <Input
              id="pix-nome"
              autoComplete="name"
              maxLength={60}
              value={valores.pixNome}
              onChange={(event) => onChange("pixNome", event.target.value)}
              placeholder={t({ pt: "Nome completo", en: "Full name", es: "Nombre completo" })}
              className={inputClass}
            />
          </Field>
          <Field id="pix-cidade" label={t({ pt: "Cidade", en: "City", es: "Ciudad" })}>
            <Input
              id="pix-cidade"
              autoComplete="address-level2"
              maxLength={40}
              value={valores.pixCidade}
              onChange={(event) => onChange("pixCidade", event.target.value)}
              placeholder={t({ pt: "Cidade do beneficiário", en: "Recipient city", es: "Ciudad del beneficiario" })}
              className={inputClass}
            />
          </Field>
          <Field id="pix-valor" label={t({ pt: "Valor (opcional)", en: "Amount (optional)", es: "Importe (opcional)" })}>
            <Input
              id="pix-valor"
              inputMode="decimal"
              value={valores.pixValor}
              onChange={(event) => onChange("pixValor", event.target.value)}
              placeholder="0,00"
              className={inputClass}
            />
          </Field>
          <Field id="pix-descricao" label={t({ pt: "Descrição (opcional)", en: "Description (optional)", es: "Descripción (opcional)" })}>
            <Input
              id="pix-descricao"
              maxLength={72}
              value={valores.pixDescricao}
              onChange={(event) => onChange("pixDescricao", event.target.value)}
              placeholder={t({ pt: "Descrição do pagamento", en: "Payment description", es: "Descripción del pago" })}
              className={inputClass}
            />
          </Field>
        </div>
      )
    }

    case "appstore":
      return (
        <div className="space-y-3">
          <Field id="appstore-nome" label={t({ pt: "Nome do app", en: "App name", es: "Nombre de la app" })}>
            <Input
              id="appstore-nome"
              value={valores.appstoreNome}
              onChange={(event) => onChange("appstoreNome", event.target.value)}
              placeholder={t({ pt: "Nome do aplicativo", en: "Application name", es: "Nombre de la aplicación" })}
              className={inputClass}
            />
          </Field>
          <Field id="appstore-plataforma" label={t({ pt: "Plataforma", en: "Platform", es: "Plataforma" })}>
            <Select value={valores.appstorePlataforma} onValueChange={(value) => onChange("appstorePlataforma", value as AppstorePlataforma)}>
              <SelectTrigger id="appstore-plataforma" className={`${inputClass} text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPSTORE_PLATFORMS.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {t(APPSTORE_LABELS[option])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {valores.appstorePlataforma !== "android" && (
            <Field id="appstore-ios" label={t({ pt: "URL da App Store (iOS)", en: "App Store URL (iOS)", es: "URL de App Store (iOS)" })}>
              <Input
                id="appstore-ios"
                inputMode="url"
                value={valores.appstoreIosUrl}
                onChange={(event) => onChange("appstoreIosUrl", event.target.value)}
                placeholder="https://apps.apple.com/app/..."
                className={inputClass}
              />
            </Field>
          )}
          {valores.appstorePlataforma !== "ios" && (
            <Field id="appstore-android" label={t({ pt: "URL da Play Store (Android)", en: "Play Store URL (Android)", es: "URL de Play Store (Android)" })}>
              <Input
                id="appstore-android"
                inputMode="url"
                value={valores.appstoreAndroidUrl}
                onChange={(event) => onChange("appstoreAndroidUrl", event.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className={inputClass}
              />
            </Field>
          )}
        </div>
      )

    case "spotify":
      return (
        <div className="space-y-3">
          <Field id="spotify-tipo" label={t({ pt: "Tipo de conteúdo", en: "Content type", es: "Tipo de contenido" })}>
            <Select value={valores.spotifyTipo} onValueChange={(value) => onChange("spotifyTipo", value as SpotifyTipo)}>
              <SelectTrigger id="spotify-tipo" className={`${inputClass} text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {t(MEDIA_LABELS[option])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="spotify-url"
            label={t({
              pt: `URL do ${valores.spotifyTipo === "youtube" ? "YouTube" : "Spotify"}`,
              en: `${valores.spotifyTipo === "youtube" ? "YouTube" : "Spotify"} URL`,
              es: `URL de ${valores.spotifyTipo === "youtube" ? "YouTube" : "Spotify"}`,
            })}
          >
            <Input
              id="spotify-url"
              inputMode="url"
              value={valores.spotifyUrl}
              onChange={(event) => onChange("spotifyUrl", event.target.value)}
              placeholder={valores.spotifyTipo === "youtube" ? "https://youtube.com/watch?v=..." : "https://open.spotify.com/..."}
              className={inputClass}
            />
          </Field>
          <Field id="spotify-titulo" label={t({ pt: "Título", en: "Title", es: "Título" })}>
            <Input
              id="spotify-titulo"
              value={valores.spotifyTitulo}
              onChange={(event) => onChange("spotifyTitulo", event.target.value)}
              placeholder={t({ pt: "Nome da música, álbum ou playlist", en: "Song, album or playlist name", es: "Nombre de la canción, álbum o playlist" })}
              className={inputClass}
            />
          </Field>
          <Field id="spotify-artista" label={t({ pt: "Artista/Canal", en: "Artist/Channel", es: "Artista/Canal" })}>
            <Input
              id="spotify-artista"
              value={valores.spotifyArtista}
              onChange={(event) => onChange("spotifyArtista", event.target.value)}
              placeholder={t({ pt: "Nome do artista ou canal", en: "Artist or channel name", es: "Nombre del artista o canal" })}
              className={inputClass}
            />
          </Field>
        </div>
      )

    case "zoom":
      return (
        <div className="space-y-3">
          <Field id="zoom-tipo" label={t({ pt: "Plataforma", en: "Platform", es: "Plataforma" })}>
            <Select value={valores.zoomTipo} onValueChange={(value) => onChange("zoomTipo", value as ZoomTipo)}>
              <SelectTrigger id="zoom-tipo" className={`${inputClass} text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {MEETING_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="zoom-titulo" label={t({ pt: "Título da reunião", en: "Meeting title", es: "Título de la reunión" })}>
            <Input
              id="zoom-titulo"
              value={valores.zoomTitulo}
              onChange={(event) => onChange("zoomTitulo", event.target.value)}
              placeholder={t({ pt: "Nome da reunião", en: "Meeting name", es: "Nombre de la reunión" })}
              className={inputClass}
            />
          </Field>
          <Field id="zoom-url" label={t({ pt: "URL da reunião", en: "Meeting URL", es: "URL de la reunión" })}>
            <Input
              id="zoom-url"
              inputMode="url"
              value={valores.zoomUrl}
              onChange={(event) => onChange("zoomUrl", event.target.value)}
              placeholder="https://zoom.us/j/... / https://meet.google.com/..."
              className={inputClass}
            />
          </Field>
          {valores.zoomTipo === "zoom" && (
            <>
              <Field id="zoom-id" label={t({ pt: "ID da reunião (opcional)", en: "Meeting ID (optional)", es: "ID de la reunión (opcional)" })}>
                <Input
                  id="zoom-id"
                  value={valores.zoomId}
                  onChange={(event) => onChange("zoomId", event.target.value)}
                  placeholder="123 456 7890"
                  className={inputClass}
                />
              </Field>
              <Field
                id="zoom-senha"
                label={t({ pt: "Senha (opcional)", en: "Passcode (optional)", es: "Contraseña (opcional)" })}
                hint={t({
                  pt: "O QR Code abre a URL; ID e senha ficam salvos só como referência.",
                  en: "The QR code opens the URL; ID and passcode are kept only for reference.",
                  es: "El código QR abre la URL; el ID y la contraseña se guardan solo como referencia.",
                })}
              >
                <Input
                  id="zoom-senha"
                  type="password"
                  autoComplete="off"
                  value={valores.zoomSenha}
                  onChange={(event) => onChange("zoomSenha", event.target.value)}
                  placeholder={t({ pt: "Senha da reunião", en: "Meeting passcode", es: "Contraseña de la reunión" })}
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </div>
      )

    case "menu":
      return (
        <ScrollArea className="h-62.5 pr-3 sm:h-75">
          <div className="space-y-3">
            <Field id="menu-nome" label={t({ pt: "Nome do restaurante", en: "Restaurant name", es: "Nombre del restaurante" })}>
              <Input
                id="menu-nome"
                value={valores.menuNome}
                onChange={(event) => onChange("menuNome", event.target.value)}
                placeholder={t({ pt: "Nome do estabelecimento", en: "Business name", es: "Nombre del establecimiento" })}
                className={inputClass}
              />
            </Field>
            <Field id="menu-categoria" label={t({ pt: "Categoria", en: "Category", es: "Categoría" })}>
              <Input
                id="menu-categoria"
                value={valores.menuCategoria}
                onChange={(event) => onChange("menuCategoria", event.target.value)}
                placeholder={t({ pt: "Ex.: Pratos principais, Bebidas", en: "E.g. Main dishes, Drinks", es: "P. ej.: Platos principales, Bebidas" })}
                className={inputClass}
              />
            </Field>
            <Field id="menu-descricao" label={t({ pt: "Descrição", en: "Description", es: "Descripción" })}>
              <Textarea
                id="menu-descricao"
                value={valores.menuDescricao}
                onChange={(event) => onChange("menuDescricao", event.target.value)}
                placeholder={t({ pt: "Descrição do restaurante ou categoria", en: "Restaurant or category description", es: "Descripción del restaurante o categoría" })}
                className={textareaClass}
              />
            </Field>
            <Field id="menu-itens" label={t({ pt: "Itens do menu", en: "Menu items", es: "Platos del menú" })}>
              <Textarea
                id="menu-itens"
                value={valores.menuItens}
                onChange={(event) => onChange("menuItens", event.target.value)}
                placeholder={t({ pt: "Um item por linha", en: "One item per line", es: "Un plato por línea" })}
                className={isMobile ? "min-h-20 py-1.5" : "min-h-25 py-2"}
              />
            </Field>
            <Field id="menu-preco" label={t({ pt: "Informações de preço", en: "Price information", es: "Información de precios" })}>
              <Input
                id="menu-preco"
                value={valores.menuPreco}
                onChange={(event) => onChange("menuPreco", event.target.value)}
                placeholder={t({ pt: "Ex.: A partir de R$ 25,00", en: "E.g. From $10", es: "P. ej.: Desde 10 €" })}
                className={inputClass}
              />
            </Field>
          </div>
        </ScrollArea>
      )

    case "cupom":
      return (
        <div className="space-y-3">
          <Field id="cupom-codigo" label={t({ pt: "Código do cupom", en: "Coupon code", es: "Código del cupón" })}>
            <Input
              id="cupom-codigo"
              autoComplete="off"
              value={valores.cupomCodigo}
              onChange={(event) => onChange("cupomCodigo", event.target.value)}
              placeholder="DESCONTO20"
              className={inputClass}
            />
          </Field>
          <Field id="cupom-tipo" label={t({ pt: "Tipo de desconto", en: "Discount type", es: "Tipo de descuento" })}>
            <Select value={valores.cupomTipo} onValueChange={(value) => onChange("cupomTipo", value as CupomTipo)}>
              <SelectTrigger id="cupom-tipo" className={`${inputClass} text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUPON_TYPES.map((option) => (
                  <SelectItem key={option} value={option} className="text-sm">
                    {t(COUPON_LABELS[option])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="cupom-valor" label={t({ pt: "Valor do desconto", en: "Discount amount", es: "Valor del descuento" })}>
            <Input
              id="cupom-valor"
              value={valores.cupomValor}
              onChange={(event) => onChange("cupomValor", event.target.value)}
              placeholder={t({ pt: "20% ou R$ 50,00", en: "20% or $50", es: "20% o 50 €" })}
              className={inputClass}
            />
          </Field>
          <Field id="cupom-descricao" label={t({ pt: "Descrição", en: "Description", es: "Descripción" })}>
            <Textarea
              id="cupom-descricao"
              value={valores.cupomDescricao}
              onChange={(event) => onChange("cupomDescricao", event.target.value)}
              placeholder={t({ pt: "Descrição da promoção", en: "Promotion description", es: "Descripción de la promoción" })}
              className={textareaClass}
            />
          </Field>
          <Field id="cupom-validade" label={t({ pt: "Validade", en: "Valid until", es: "Válido hasta" })}>
            <Input
              id="cupom-validade"
              type="date"
              value={valores.cupomValidade}
              onChange={(event) => onChange("cupomValidade", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )
  }
}
