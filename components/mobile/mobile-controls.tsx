"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { DialogReset, type ResetDialogKind } from "@/components/dialog/dialog-reset"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LocalIcon } from "@/components/ui/local-icon"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { QrGeneratorApi } from "@/hooks/use-qr-code-generator"
import type { QrStateApi } from "@/hooks/use-qr-code-state"
import { CONTENT_TYPE_META } from "@/lib/qr/labels"
import { hasRequiredContent } from "@/lib/qr/payload"
import { DEFAULT_APPEARANCE } from "@/lib/qr/types"
import { ContentForm } from "../qr-code/content-form"
import { TypeSelector } from "../qr-code/type-selector"
import { MobileStylePanel } from "./mobile-style-panel"

interface MobileControlsProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  qrState: QrStateApi
  generator: QrGeneratorApi
}

export function SheetControlesMobile({ aberto, onAbertoChange, qrState, generator }: MobileControlsProps) {
  const { t } = useLanguage()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetKind, setResetKind] = useState<ResetDialogKind>("all")

  const activeCustomizations = [
    qrState.habilitarCustomizacaoLogo && "Logo",
    qrState.habilitarCustomizacaoFundo && t({ pt: "Fundo", en: "Background", es: "Fondo" }),
    qrState.habilitarCustomizacaoFrame && t({ pt: "Moldura", en: "Frame", es: "Marco" }),
  ].filter((item): item is string => Boolean(item))

  const hasContent = hasRequiredContent(qrState.tipoConteudoAtivo, qrState)
  const hasCustomizations =
    qrState.corFrente !== DEFAULT_APPEARANCE.corFrente ||
    qrState.corFundo !== DEFAULT_APPEARANCE.corFundo ||
    qrState.tamanho !== DEFAULT_APPEARANCE.tamanho ||
    qrState.nivelCorrecaoErro !== DEFAULT_APPEARANCE.nivelCorrecaoErro ||
    qrState.zonaQuieta !== DEFAULT_APPEARANCE.zonaQuieta ||
    !!qrState.logoDataUri ||
    !!qrState.imagemFundo ||
    qrState.tipoFrameSelecionado !== "none"

  const openReset = (kind: ResetDialogKind) => {
    setResetKind(kind)
    setResetDialogOpen(true)
  }

  return (
    <>
      <Sheet open={aberto} onOpenChange={onAbertoChange}>
        <SheetContent side="bottom" className="flex h-[90vh] flex-col border-t-2 border-primary/20 bg-background p-0">
          <SheetHeader className="shrink-0 border-b bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                <LocalIcon name="settings" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="flex items-center gap-2 text-lg text-foreground">
                  {t({ pt: "Gerador QR Code", en: "QR Code Generator", es: "Generador de QR" })}
                  {activeCustomizations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <LocalIcon name="sparkles" className="mr-1 h-3 w-3" />
                      {activeCustomizations.length}{" "}
                      {activeCustomizations.length > 1
                        ? t({ pt: "ativas", en: "active", es: "activas" })
                        : t({ pt: "ativa", en: "active", es: "activa" })}
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="text-left text-muted-foreground">
                  {t({
                    pt: "Crie códigos QR personalizados para diferentes tipos de conteúdo",
                    en: "Create custom QR codes for different kinds of content",
                    es: "Crea códigos QR personalizados para distintos tipos de contenido",
                  })}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="custom-scrollbar grow">
            <div className="space-y-6 p-4 pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <h3 className="font-semibold text-foreground">{t({ pt: "Tipo de conteúdo", en: "Content type", es: "Tipo de contenido" })}</h3>
                  </div>
                  {hasContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReset("content")}
                      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LocalIcon name="trash" className="mr-1 h-3 w-3" />
                      {t({ pt: "Limpar", en: "Clear", es: "Borrar" })}
                    </Button>
                  )}
                </div>
                <TypeSelector tipoAtivo={qrState.tipoConteudoAtivo} onTipoChange={generator.handleContentTypeChange} tiposVisiveis={qrState.tiposVisiveis} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <h3 className="font-semibold text-foreground">{t({ pt: "Dados", en: "Data", es: "Datos" })}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t(CONTENT_TYPE_META[qrState.tipoConteudoAtivo].name)}
                  </Badge>
                </div>
                <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-4">
                  <ContentForm tipo={qrState.tipoConteudoAtivo} valores={qrState} onChange={qrState.updateField} isMobile />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <h3 className="font-semibold text-foreground">{t({ pt: "Personalização", en: "Customization", es: "Personalización" })}</h3>
                    {activeCustomizations.length > 0 && (
                      <div className="flex gap-1">
                        {activeCustomizations.map((custom) => (
                          <Badge key={custom} variant="outline" className="px-2 py-0 text-xs">
                            {custom}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {hasCustomizations && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReset("appearance")}
                      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LocalIcon name="reset" className="mr-1 h-3 w-3" />
                      {t({ pt: "Resetar", en: "Reset", es: "Restablecer" })}
                    </Button>
                  )}
                </div>

                <MobileStylePanel
                  valores={qrState}
                  onChange={qrState.updateField}
                  onResetGranular={generator.resetGranular}
                  valoresAccordion={qrState.valoresAccordionMobile}
                  onValoresAccordionChange={(values) => qrState.updateField("valoresAccordionMobile", values)}
                  onLogoFile={generator.uploadLogoFile}
                  onBackgroundFile={generator.uploadBackgroundFile}
                  visualTemplates={qrState.templatesVisuais}
                  onSaveVisualTemplate={generator.saveVisualTemplate}
                  onApplyVisualTemplate={generator.applyVisualTemplate}
                  onDeleteVisualTemplate={generator.deleteVisualTemplate}
                />
              </div>

              <div className="space-y-3">
                <Separator />
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <h3 className="font-semibold text-foreground">{t({ pt: "Ações rápidas", en: "Quick actions", es: "Acciones rápidas" })}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openReset("content")} disabled={!hasContent} className="text-xs">
                    <LocalIcon name="trash" className="mr-1 h-3 w-3" />
                    {t({ pt: "Limpar dados", en: "Clear data", es: "Borrar datos" })}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openReset("appearance")} disabled={!hasCustomizations} className="text-xs">
                    <LocalIcon name="reset" className="mr-1 h-3 w-3" />
                    {t({ pt: "Resetar visual", en: "Reset design", es: "Restablecer diseño" })}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t bg-background p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasContent ? "bg-green-500" : "bg-gray-400"}`} />
                  {t({ pt: "Dados", en: "Data", es: "Datos" })}:{" "}
                  {hasContent ? "OK" : t({ pt: "Pendente", en: "Pending", es: "Pendiente" })}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasCustomizations ? "bg-blue-500" : "bg-gray-400"}`} />
                  {t({ pt: "Estilo", en: "Style", es: "Estilo" })}:{" "}
                  {hasCustomizations
                    ? t({ pt: "Personalizado", en: "Custom", es: "Personalizado" })
                    : t({ pt: "Padrão", en: "Default", es: "Predeterminado" })}
                </span>
              </div>

              <Button
                onClick={generator.handleGenerateQRCode}
                disabled={!hasContent}
                className="w-full transform border-2 border-green-400/50 py-3 text-base font-semibold transition-all duration-300 ease-in-out hover:scale-105 hover:border-green-400 hover:shadow-green-glow focus:shadow-green-glow focus:outline-hidden focus:ring-2 focus:ring-green-500/50 active:scale-95"
              >
                <LocalIcon name="qr" className="mr-2 h-5 w-5 animate-text-glow-primary" />
                {t({ pt: "Gerar QR Code", en: "Generate QR code", es: "Generar código QR" })}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DialogReset
        aberto={resetDialogOpen}
        onAbertoChange={setResetDialogOpen}
        onConfirmar={() => generator.resetGranular(resetKind)}
        tipo={resetKind}
      />
    </>
  )
}
