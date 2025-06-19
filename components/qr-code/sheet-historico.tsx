"use client"

import { QRCodeCanvas } from "qrcode.react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HistoryIcon,
  Trash2,
  RefreshCw,
  LinkIcon,
  Wifi,
  User,
  CalendarDays,
  Mail,
  MessageSquare,
  MapPin,
  MessageSquareText,
  Phone,
  Clock,
  Palette,
  Maximize,
  ImageIcon,
  Frame,
  ChevronDown,
  ChevronRight,
  Info,
  Settings,
  Zap,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState } from "react"
import type { EntradaQRCode } from "@/hooks/use-qr-code-state"

interface SheetHistoricoProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  historico: EntradaQRCode[]
  onLoadFromHistory: (entrada: EntradaQRCode) => void
  onClearHistory: () => void
  isMobile: boolean
}

export function SheetHistorico({
  aberto,
  onAbertoChange,
  historico,
  onLoadFromHistory,
  onClearHistory,
  isMobile,
}: SheetHistoricoProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact")

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getIconForContentType = (tipo: string) => {
    switch (tipo) {
      case "url":
        return LinkIcon
      case "wifi":
        return Wifi
      case "vcard":
        return User
      case "vevent":
        return CalendarDays
      case "email":
        return Mail
      case "sms":
        return MessageSquare
      case "geo":
        return MapPin
      case "whatsapp":
        return MessageSquareText
      case "phone":
        return Phone
      default:
        return LinkIcon
    }
  }

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "url":
        return "URL/Texto"
      case "wifi":
        return "WiFi"
      case "vcard":
        return "Contato"
      case "vevent":
        return "Evento"
      case "email":
        return "Email"
      case "sms":
        return "SMS"
      case "geo":
        return "Localização"
      case "whatsapp":
        return "WhatsApp"
      case "phone":
        return "Telefone"
      default:
        return tipo
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  const getCustomizationBadges = (entrada: EntradaQRCode) => {
    const badges = []
    if (entrada.logoDataUri) badges.push({ label: "Logo", color: "bg-purple-500", icon: ImageIcon })
    if (entrada.imagemFundo) badges.push({ label: "Fundo", color: "bg-blue-500", icon: ImageIcon })
    if (entrada.tipoFrameSelecionado && entrada.tipoFrameSelecionado !== "none")
      badges.push({ label: "Frame", color: "bg-green-500", icon: Frame })
    return badges
  }

  const getQualityLevel = (nivel: string) => {
    switch (nivel) {
      case "L":
        return { label: "Baixo", color: "bg-red-500", percentage: "~7%" }
      case "M":
        return { label: "Médio", color: "bg-yellow-500", percentage: "~15%" }
      case "Q":
        return { label: "Alto", color: "bg-blue-500", percentage: "~25%" }
      case "H":
        return { label: "Muito Alto", color: "bg-green-500", percentage: "~30%" }
      default:
        return { label: nivel, color: "bg-gray-500", percentage: "" }
    }
  }

  const getDeviceIcon = (tamanho: number) => {
    return tamanho <= 200 ? Smartphone : Monitor
  }

  const renderDetailedMetadata = (entrada: EntradaQRCode) => {
    const quality = getQualityLevel(entrada.nivel)
    const customBadges = getCustomizationBadges(entrada)
    const DeviceIcon = getDeviceIcon(entrada.tamanho)

    return (
      <div className="space-y-4 pt-3 border-t border-muted">
        {/* Metadados Técnicos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Configurações
            </h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tamanho:</span>
                <div className="flex items-center gap-1">
                  <DeviceIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono">{entrada.tamanho}px</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Margem:</span>
                <span className="font-mono">{entrada.margem}px</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Correção:</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${quality.color}`} />
                  <span className="font-mono">{entrada.nivel}</span>
                  <span className="text-muted-foreground">({quality.percentage})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Cores
            </h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">QR Code:</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded border border-border/50"
                    style={{ backgroundColor: entrada.corFrente }}
                  />
                  <span className="font-mono text-xs">{entrada.corFrente}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fundo:</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded border border-border/50"
                    style={{ backgroundColor: entrada.corFundo }}
                  />
                  <span className="font-mono text-xs">{entrada.corFundo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customizações */}
        {customBadges.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Personalizações
            </h5>
            <div className="flex flex-wrap gap-1">
              {customBadges.map((badge, index) => {
                const IconComponent = badge.icon
                return (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                    <IconComponent className="w-3 h-3 mr-1" />
                    {badge.label}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Dados Específicos do Tipo */}
        {entrada.tipoConteudo !== "url" && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Info className="w-3 h-3" />
              Dados Específicos
            </h5>
            <div className="text-xs space-y-1">
              {entrada.tipoConteudo === "wifi" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SSID:</span>
                    <span className="font-mono">{entrada.wifiSsid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Segurança:</span>
                    <span className="font-mono">{entrada.wifiEncriptacao}</span>
                  </div>
                  {entrada.wifiOculto && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rede:</span>
                      <span className="text-amber-600">Oculta</span>
                    </div>
                  )}
                </>
              )}
              {entrada.tipoConteudo === "vcard" && (
                <>
                  {entrada.vcardOrganizacao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-mono">{entrada.vcardOrganizacao}</span>
                    </div>
                  )}
                  {entrada.vcardTelefone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-mono">{entrada.vcardTelefone}</span>
                    </div>
                  )}
                  {entrada.vcardEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-mono">{entrada.vcardEmail}</span>
                    </div>
                  )}
                </>
              )}
              {entrada.tipoConteudo === "geo" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-mono">{entrada.geoLatitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-mono">{entrada.geoLongitude}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Timestamp Detalhado */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Criação
          </h5>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data/Hora:</span>
              <span className="font-mono">{formatDate(entrada.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Há:</span>
              <span className="text-primary">{formatRelativeTime(entrada.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={aberto} onOpenChange={onAbertoChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`${isMobile ? "h-[85vh] rounded-t-lg" : "sm:max-w-lg w-full"} flex flex-col p-0 bg-background border-t-2 border-primary/20`}
      >
        <SheetHeader className="p-4 border-b bg-background shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <HistoryIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg text-foreground flex items-center gap-2">
                  Histórico Detalhado
                  {historico.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {historico.length} item{historico.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </SheetTitle>
                <DialogDescription className="text-muted-foreground text-left">
                  Histórico completo com metadados técnicos
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Controles de Visualização */}
          {historico.length > 0 && (
            <div className="flex items-center justify-between pt-3">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "compact" | "detailed")}>
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="compact" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Compacto
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="text-xs">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Detalhado
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50 h-9"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          )}
        </SheetHeader>

        <div className="flex-grow flex flex-col min-h-0">
          {historico.length > 0 ? (
            <ScrollArea className="flex-grow w-full px-4 pb-4 custom-scrollbar">
              <div className="space-y-4 pt-4">
                {historico.map((entrada) => {
                  const IconComponent = getIconForContentType(entrada.tipoConteudo)
                  const customBadges = getCustomizationBadges(entrada)
                  const isExpanded = expandedItems.has(entrada.id)

                  return (
                    <Card
                      key={entrada.id}
                      className="p-4 shadow-sm bg-card border border-border/50 hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="space-y-3">
                        {/* Header com tipo e data */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {getTypeLabel(entrada.tipoConteudo)}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {viewMode === "compact"
                                  ? formatRelativeTime(entrada.timestamp)
                                  : formatDate(entrada.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {customBadges.length > 0 && (
                              <div className="flex gap-1">
                                {customBadges.map((badge, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${badge.color}`}
                                    title={badge.label}
                                  />
                                ))}
                              </div>
                            )}
                            {viewMode === "detailed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(entrada.id)}
                                className="h-6 w-6 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Conteúdo principal */}
                        <div className="flex gap-3">
                          {/* QR Code Preview */}
                          <div className="shrink-0">
                            <div
                              className="p-1 rounded border border-border/50 bg-background"
                              style={{
                                backgroundColor: entrada.imagemFundo ? "transparent" : entrada.corFundo,
                              }}
                            >
                              <QRCodeCanvas
                                value={entrada.valorQR}
                                size={isMobile ? 56 : 72}
                                fgColor={entrada.corFrente}
                                bgColor={entrada.imagemFundo ? "transparent" : entrada.corFundo}
                                level={entrada.nivel}
                                margin={1}
                                includeMargin={true}
                                imageSettings={
                                  entrada.logoDataUri
                                    ? {
                                        src: entrada.logoDataUri,
                                        height: (isMobile ? 56 : 72) * (entrada.logoTamanhoRatio || 0.2),
                                        width: (isMobile ? 56 : 72) * (entrada.logoTamanhoRatio || 0.2),
                                        excavate: entrada.escavarLogo ?? true,
                                      }
                                    : undefined
                                }
                                className="rounded-sm"
                              />
                            </div>
                          </div>

                          {/* Informações */}
                          <div className="flex-grow min-w-0 space-y-2">
                            {/* Conteúdo original */}
                            <div>
                              <p className="text-sm font-medium text-foreground truncate" title={entrada.inputOriginal}>
                                {entrada.inputOriginal}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate" title={entrada.valorQR}>
                                {entrada.valorQR}
                              </p>
                            </div>

                            {/* Especificações técnicas compactas */}
                            {viewMode === "compact" && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <Palette className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Cores:</span>
                                  <div className="flex gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full border border-border/50"
                                      style={{ backgroundColor: entrada.corFrente }}
                                      title={`Frente: ${entrada.corFrente}`}
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full border border-border/50"
                                      style={{ backgroundColor: entrada.corFundo }}
                                      title={`Fundo: ${entrada.corFundo}`}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Maximize className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{entrada.tamanho}px</span>
                                </div>
                              </div>
                            )}

                            {/* Customizações */}
                            {customBadges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {customBadges.map((badge, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                                    <badge.icon className="w-3 h-3 mr-1" />
                                    {badge.label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metadados Detalhados (Collapsible) */}
                        {viewMode === "detailed" && isExpanded && renderDetailedMetadata(entrada)}

                        <Separator className="my-2" />

                        {/* Botão de ação */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-primary hover:bg-primary/10 hover:border-primary/50 border-primary/30"
                          onClick={() => onLoadFromHistory(entrada)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Reutilizar Configurações
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 sm:py-10 flex-grow flex flex-col justify-center items-center">
              <HistoryIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-base font-medium text-muted-foreground mb-2">Nenhum QR Code no histórico</p>
              <p className="text-sm text-muted-foreground">Gere seu primeiro QR Code para começar</p>
            </div>
          )}
        </div>

        <SheetClose asChild className="mt-auto shrink-0 p-4 border-t">
          <Button variant="outline" className="w-full h-9">
            Fechar
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}
