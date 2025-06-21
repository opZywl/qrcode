"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, RefreshCw, Sparkles, RotateCcw, Trash2, Zap } from "lucide-react"
import { SeletorTipoConteudo } from "./seletor-tipo-conteudo"
import { FormularioConteudo } from "./formulario-conteudo"
import { PersonalizacaoAparenciaMobile } from "./personalizacao-aparencia-mobile"
import { DialogConfirmacaoReset } from "./dialog-confirmacao-reset"
import { DialogDescription } from "@/components/ui/dialog"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

interface SheetControlesMobileProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  qrState: any
  onGenerate: () => void
  onResetGranular: (tipo?: string) => void
  isLoading: boolean
  tiposVisiveis?: TipoConteudoQR[]
}

export function SheetControlesMobile({
   aberto,
   onAbertoChange,
   qrState,
   onGenerate,
   onResetGranular,
   isLoading,
   tiposVisiveis,
}: SheetControlesMobileProps) {
  const [dialogResetAberto, setDialogResetAberto] = useState(false)
  const [tipoReset, setTipoReset] = useState<"content" | "appearance" | "all">("all")

  const getActiveCustomizations = () => {
    const active = []
    if (qrState.habilitarCustomizacaoLogo || qrState.valoresAccordionMobile.includes("logo")) active.push("Logo")
    if (qrState.habilitarCustomizacaoFundo || qrState.valoresAccordionMobile.includes("background"))
      active.push("Fundo")
    if (qrState.habilitarCustomizacaoFrame || qrState.valoresAccordionMobile.includes("frame")) active.push("Frame")
    return active
  }

  const activeCustomizations = getActiveCustomizations()

  const getContentTypeLabel = (tipo: string) => {
    const labels = {
      url: "URL/Texto",
      wifi: "WiFi",
      vcard: "Contato",
      vevent: "Evento",
      email: "Email",
      sms: "SMS",
      geo: "Localização",
      whatsapp: "WhatsApp",
      phone: "Telefone",
      pix: "PIX",
      appstore: "App Store",
      spotify: "Música/Vídeo",
      zoom: "Videochamada",
      menu: "Menu",
      cupom: "Cupom",
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const hasContentData = () => {
    switch (qrState.tipoConteudoAtivo) {
      case "url":
        return !!qrState.inputUrl?.trim()
      case "wifi":
        return !!qrState.wifiSsid?.trim()
      case "vcard":
        return !!(qrState.vcardNome?.trim() || qrState.vcardSobrenome?.trim() || qrState.vcardOrganizacao?.trim())
      case "vevent":
        return !!(qrState.veventResumo?.trim() && qrState.veventDataInicio)
      case "email":
        return !!qrState.emailPara?.trim()
      case "sms":
        return !!qrState.smsPara?.trim()
      case "geo":
        return !!(qrState.geoLatitude?.trim() && qrState.geoLongitude?.trim())
      case "whatsapp":
        return !!qrState.whatsappPara?.trim()
      case "phone":
        return !!qrState.telefonePara?.trim()
      case "pix":
        return !!qrState.pixChave?.trim()
      case "appstore":
        return !!(qrState.appstoreIosUrl?.trim() || qrState.appstoreAndroidUrl?.trim())
      case "spotify":
        return !!qrState.spotifyUrl?.trim()
      case "zoom":
        return !!qrState.zoomUrl?.trim()
      case "menu":
        return !!qrState.menuNome?.trim()
      case "cupom":
        return !!qrState.cupomCodigo?.trim()
      default:
        return false
    }
  }

  const hasCustomizations = () => {
    return (
        qrState.corFrente !== "#000000" ||
        qrState.corFundo !== "#FFFFFF" ||
        qrState.tamanho !== 256 ||
        qrState.nivelCorrecaoErro !== "H" ||
        qrState.zonaQuieta !== 4 ||
        qrState.logoDataUri ||
        qrState.imagemFundo ||
        (qrState.tipoFrameSelecionado && qrState.tipoFrameSelecionado !== "none")
    )
  }

  const handleResetClick = (tipo: "content" | "appearance" | "all") => {
    setTipoReset(tipo)
    setDialogResetAberto(true)
  }

  const handleConfirmarReset = () => {
    onResetGranular(tipoReset)
  }

  return (
      <>
        <Sheet open={aberto} onOpenChange={onAbertoChange}>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 bg-background border-t-2 border-primary/20">
            {/* Header */}
            <SheetHeader className="p-4 border-b bg-background shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg text-foreground flex items-center gap-2">
                    Gerador QR Code
                    {activeCustomizations.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {activeCustomizations.length} ativa{activeCustomizations.length > 1 ? "s" : ""}
                        </Badge>
                    )}
                  </SheetTitle>
                  <DialogDescription className="text-muted-foreground text-left">
                    Crie códigos QR personalizados para diferentes tipos de conteúdo
                  </DialogDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-grow custom-scrollbar">
              <div className="p-4 space-y-6 pb-6">
                {/* Seletor de tipo de conteúdo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <h3 className="font-semibold text-foreground">Tipo de Conteúdo</h3>
                    </div>
                    {hasContentData() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetClick("content")}
                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Limpar
                        </Button>
                    )}
                  </div>
                  <SeletorTipoConteudo
                      tipoAtivo={qrState.tipoConteudoAtivo}
                      onTipoChange={(tipo) => qrState.updateField("tipoConteudoAtivo", tipo)}
                      tiposVisiveis={tiposVisiveis}
                  />
                </div>

                {/* Formulário dinâmico */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="font-semibold text-foreground">Configurações</h3>
                    </div>
                    {hasContentData() && (
                        <Badge variant="outline" className="text-xs">
                          {getContentTypeLabel(qrState.tipoConteudoAtivo)}
                        </Badge>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-muted-foreground/20">
                    <FormularioConteudo
                        tipo={qrState.tipoConteudoAtivo}
                        valores={qrState}
                        onChange={qrState.updateField}
                        isMobile={true}
                    />
                  </div>
                </div>

                {/* Personalização */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <h3 className="font-semibold text-foreground">Personalização</h3>
                      {activeCustomizations.length > 0 && (
                          <div className="flex gap-1">
                            {activeCustomizations.map((custom) => (
                                <Badge key={custom} variant="outline" className="text-xs px-2 py-0">
                                  {custom}
                                </Badge>
                            ))}
                          </div>
                      )}
                    </div>
                    {hasCustomizations() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetClick("appearance")}
                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                    )}
                  </div>

                  <PersonalizacaoAparenciaMobile
                      valores={qrState}
                      onChange={qrState.updateField}
                      onResetGranular={onResetGranular}
                      valoresAccordion={qrState.valoresAccordionMobile}
                      onValoresAccordionChange={(values) => qrState.updateField("valoresAccordionMobile", values)}
                  />
                </div>

                {/* Ações Rápidas */}
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h3 className="font-semibold text-foreground">Ações Rápidas</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetClick("content")}
                        disabled={!hasContentData()}
                        className="text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpar Dados
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetClick("appearance")}
                        disabled={!hasCustomizations()}
                        className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset Visual
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Botão gerador */}
            <div className="p-4 border-t bg-background shrink-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasContentData() ? "bg-green-500" : "bg-gray-400"}`} />
                  Dados: {hasContentData() ? "OK" : "Pendente"}
                </span>
                  <span className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasCustomizations() ? "bg-blue-500" : "bg-gray-400"}`} />
                  Estilo: {hasCustomizations() ? "Personalizado" : "Padrão"}
                </span>
                </div>

                <Button
                    onClick={onGenerate}
                    disabled={isLoading || !hasContentData()}
                    className="w-full py-3 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 border-2 border-green-400/50 hover:border-green-400 hover:shadow-green-glow focus:shadow-green-glow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2 w-5 h-5" />
                        Gerando...
                      </>
                  ) : (
                      <>
                        <Zap className="mr-2 w-5 h-5 animate-text-glow-primary" />
                        Gerar QR Code
                      </>
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog de Confirmação */}
        <DialogConfirmacaoReset
            aberto={dialogResetAberto}
            onAbertoChange={setDialogResetAberto}
            onConfirmar={handleConfirmarReset}
            tipo={tipoReset}
        />
      </>
  )
}
