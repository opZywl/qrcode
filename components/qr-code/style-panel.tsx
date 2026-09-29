"use client"

import type React from "react"
import { useState } from "react"
import { AnimatePresence, m } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocalIcon } from "@/components/ui/local-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { QrState, UpdateField } from "@/hooks/use-qr-code-state"
import { IMAGE_ACCEPT } from "@/lib/qr/image"
import { ERROR_LEVEL_LABELS, FRAME_LABELS } from "@/lib/qr/labels"
import {
  ERROR_LEVELS,
  FRAME_TYPES,
  FRAMES_WITH_CUSTOM_TEXT,
  type NivelCorrecaoErro,
  type TipoFrame,
  type VisualTemplateQRCode,
} from "@/lib/qr/types"

interface StylePanelProps {
  valores: QrState
  onChange: UpdateField
  onReset: () => void
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBackgroundImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveBackgroundImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  backgroundImageInputRef: React.RefObject<HTMLInputElement | null>
  visualTemplates: VisualTemplateQRCode[]
  onSaveVisualTemplate: (name: string, templateId?: string) => void
  onApplyVisualTemplate: (template: VisualTemplateQRCode) => void
  onDeleteVisualTemplate: (templateId: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

function StudioSection({
  active,
  icon,
  title,
  description,
  accentClassName,
  children,
}: {
  active?: boolean
  icon: string
  title: string
  description: string
  accentClassName?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        "studio-tile transition-all duration-200",
        active ? (accentClassName ?? "border-primary/30 bg-primary/5 dark:border-primary/25 dark:bg-primary/10") : "",
      ].join(" ")}
    >
      <div className="relative z-1 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="studio-icon-shell h-9 w-9 rounded-[0.9rem]">
            <LocalIcon name={icon} className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h4 className="text-[13.5px] font-semibold text-foreground">{title}</h4>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StylePanel({
  valores,
  onChange,
  onReset,
  onLogoUpload,
  onBackgroundImageUpload,
  onRemoveBackgroundImage,
  fileInputRef,
  backgroundImageInputRef,
  visualTemplates,
  onSaveVisualTemplate,
  onApplyVisualTemplate,
  onDeleteVisualTemplate,
}: StylePanelProps) {
  const { t, localeTag } = useLanguage()
  const [isOpen, setIsOpen] = useState(true)
  const [templateName, setTemplateName] = useState("")

  const backgroundLocked =
    (valores.habilitarCustomizacaoFundo && !!valores.imagemFundo) ||
    (valores.habilitarCustomizacaoFrame && valores.tipoFrameSelecionado !== "none")

  const handleSaveTemplate = () => {
    onSaveVisualTemplate(templateName)
    setTemplateName("")
  }

  const formatTemplateDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <span className="studio-icon-shell h-9 w-9 rounded-[0.9rem]">
            <LocalIcon name="settings" className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h3 className="text-[0.98rem] font-semibold text-foreground">
              {t({ pt: "Personalizar aparência", en: "Customize appearance", es: "Personalizar apariencia" })}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t({
                pt: "Cores, tamanho, fundo, logo e moldura",
                en: "Colors, size, background, logo and frame",
                es: "Colores, tamaño, fondo, logo y marco",
              })}
            </p>
          </div>
          <span className="studio-icon-shell ml-auto h-8 w-8 rounded-full">
            <LocalIcon name={isOpen ? "chevron-down" : "chevron-right"} className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </button>

        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1.5 rounded-full px-2.5 text-[12px]">
          <LocalIcon name="reset" className="h-3.5 w-3.5" />
          {t({ pt: "Resetar", en: "Reset", es: "Restablecer" })}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-0.5">
              <StudioSection
                icon="palette"
                title={t({ pt: "Base do QR Code", en: "QR base", es: "Base del código QR" })}
                description={t({
                  pt: "Controle fino de cor, tamanho e leitura",
                  en: "Fine control over color, size and scanning",
                  es: "Control fino de color, tamaño y lectura",
                })}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fg-color" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="palette" className="h-3.5 w-3.5 text-primary" />
                      {t({ pt: "Cor do QR Code", en: "QR color", es: "Color del QR" })}
                    </Label>
                    <Input
                      id="fg-color"
                      type="color"
                      value={valores.corFrente}
                      onChange={(event) => onChange("corFrente", event.target.value)}
                      className="h-9 cursor-pointer border-2 p-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bg-color" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="image" className="h-3.5 w-3.5 text-primary" />
                      {t({ pt: "Cor de fundo", en: "Background color", es: "Color de fondo" })}
                    </Label>
                    <Input
                      id="bg-color"
                      type="color"
                      value={valores.corFundo}
                      onChange={(event) => onChange("corFundo", event.target.value)}
                      className="h-9 cursor-pointer border-2 p-1 disabled:cursor-not-allowed"
                      disabled={backgroundLocked}
                    />
                    {backgroundLocked && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        {t({
                          pt: "Bloqueada quando há imagem ou moldura ativa.",
                          en: "Locked while a background image or frame is active.",
                          es: "Bloqueado mientras haya imagen o marco activo.",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="size-slider" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="size" className="h-3.5 w-3.5 text-primary" />
                      {t({ pt: "Tamanho", en: "Size", es: "Tamaño" })}
                    </Label>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {valores.tamanho}px
                    </Badge>
                  </div>
                  <Slider
                    id="size-slider"
                    min={50}
                    max={1000}
                    step={1}
                    value={[valores.tamanho]}
                    onValueChange={(value) => onChange("tamanho", value[0])}
                    aria-label={t({ pt: "Tamanho", en: "Size", es: "Tamaño" })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="error-correction" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="shield" className="h-3.5 w-3.5 text-emerald-600" />
                      {t({ pt: "Correção de erro", en: "Error correction", es: "Corrección de errores" })}
                    </Label>
                    <Select
                      value={valores.nivelCorrecaoErro}
                      onValueChange={(value) => onChange("nivelCorrecaoErro", value as NivelCorrecaoErro)}
                    >
                      <SelectTrigger id="error-correction" className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ERROR_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {t(ERROR_LEVEL_LABELS[level])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quiet-zone" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="frame" className="h-3.5 w-3.5 text-primary" />
                      {t({ pt: "Margem", en: "Margin", es: "Margen" })}
                    </Label>
                    <Input
                      id="quiet-zone"
                      type="number"
                      min={0}
                      max={40}
                      value={valores.zonaQuieta}
                      onChange={(event) => onChange("zonaQuieta", clamp(Number(event.target.value), 0, 40))}
                      className="h-9 text-[12px]"
                    />
                  </div>
                </div>
              </StudioSection>

              <StudioSection
                active={valores.habilitarCustomizacaoLogo}
                icon="image-plus"
                title={t({ pt: "Logo personalizado", en: "Custom logo", es: "Logo personalizado" })}
                description={t({
                  pt: "Adicione um logo central com proporção ajustável",
                  en: "Add a centered logo with adjustable size",
                  es: "Añade un logo central con tamaño ajustable",
                })}
                accentClassName="border-fuchsia-300/50 bg-fuchsia-50/60 dark:border-fuchsia-500/20 dark:bg-fuchsia-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    {t({
                      pt: "Use um PNG transparente para melhor resultado.",
                      en: "Use a transparent PNG for best results.",
                      es: "Usa un PNG transparente para un mejor resultado.",
                    })}
                  </div>
                  <Switch
                    id="enable-logo"
                    checked={valores.habilitarCustomizacaoLogo}
                    aria-label={t({ pt: "Logo personalizado", en: "Custom logo", es: "Logo personalizado" })}
                    onCheckedChange={(checked) => {
                      onChange("habilitarCustomizacaoLogo", checked)
                      if (!checked) {
                        onChange("logoDataUri", "")
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }
                    }}
                  />
                </div>

                {valores.habilitarCustomizacaoLogo && (
                  <div className="space-y-3">
                    <input
                      id="logo-upload"
                      type="file"
                      accept={IMAGE_ACCEPT}
                      ref={fileInputRef}
                      onChange={onLogoUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 w-full gap-2.5 border-dashed text-[12px]"
                    >
                      <span className="studio-icon-shell h-6 w-6 rounded-full">
                        <LocalIcon name="upload" className="h-3.5 w-3.5 text-primary" />
                      </span>
                      {t({ pt: "Selecionar logo", en: "Choose logo", es: "Elegir logo" })}
                    </Button>

                    {valores.logoDataUri && (
                      <div className="rounded-2xl border border-border/70 bg-background/70 p-2.5 dark:border-dark-5/30 dark:bg-dark-1/60">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={valores.logoDataUri}
                            alt={t({ pt: "Prévia do logo", en: "Logo preview", es: "Vista previa del logo" })}
                            className="h-10 w-10 rounded-md border bg-white object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-medium text-foreground">
                              {t({ pt: "Logo carregado", en: "Logo loaded", es: "Logo cargado" })}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {t({ pt: "Ajuste o tamanho abaixo.", en: "Adjust the size below.", es: "Ajusta el tamaño abajo." })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="logo-size-ratio" className="text-[12px] font-medium text-foreground">
                          {t({ pt: "Tamanho do logo", en: "Logo size", es: "Tamaño del logo" })}
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            id="logo-size-ratio"
                            type="number"
                            min={5}
                            max={40}
                            step={1}
                            value={Math.round(valores.logoTamanhoRatio * 100)}
                            onChange={(event) => onChange("logoTamanhoRatio", clamp(Number(event.target.value), 5, 40) / 100)}
                            disabled={!valores.logoDataUri}
                            className="h-9 text-[12px]"
                          />
                          <span className="text-[12px] text-muted-foreground">%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id="excavate-logo"
                          checked={valores.escavarLogo}
                          onCheckedChange={(checked) => onChange("escavarLogo", checked === true)}
                          disabled={!valores.logoDataUri}
                        />
                        <Label htmlFor="excavate-logo" className="text-[12px] font-medium text-foreground">
                          {t({ pt: "Limpar área do logo", en: "Clear area behind logo", es: "Despejar área del logo" })}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </StudioSection>

              <StudioSection
                active={valores.habilitarCustomizacaoFundo}
                icon="image"
                title={t({ pt: "Fundo personalizado", en: "Custom background", es: "Fondo personalizado" })}
                description={t({
                  pt: "Aplique uma imagem no container do QR Code",
                  en: "Apply an image behind the QR code",
                  es: "Aplica una imagen detrás del código QR",
                })}
                accentClassName="border-sky-300/50 bg-sky-50/60 dark:border-sky-500/20 dark:bg-sky-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    {t({
                      pt: "Incorporado ao preview e à exportação.",
                      en: "Included in the preview and export.",
                      es: "Incluido en la vista previa y la exportación.",
                    })}
                  </div>
                  <Switch
                    id="enable-background"
                    checked={valores.habilitarCustomizacaoFundo}
                    aria-label={t({ pt: "Fundo personalizado", en: "Custom background", es: "Fondo personalizado" })}
                    onCheckedChange={(checked) => {
                      onChange("habilitarCustomizacaoFundo", checked)
                      if (!checked) {
                        onChange("imagemFundo", "")
                        if (backgroundImageInputRef.current) {
                          backgroundImageInputRef.current.value = ""
                        }
                      }
                    }}
                  />
                </div>

                {valores.habilitarCustomizacaoFundo && (
                  <div className="space-y-3">
                    <input
                      id="bg-image-upload"
                      type="file"
                      accept={IMAGE_ACCEPT}
                      ref={backgroundImageInputRef}
                      onChange={onBackgroundImageUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => backgroundImageInputRef.current?.click()}
                      className="h-10 w-full gap-2.5 border-dashed text-[12px]"
                    >
                      <span className="studio-icon-shell h-6 w-6 rounded-full">
                        <LocalIcon name="upload" className="h-3.5 w-3.5 text-primary" />
                      </span>
                      {t({ pt: "Selecionar imagem", en: "Choose image", es: "Elegir imagen" })}
                    </Button>

                    {valores.imagemFundo && (
                      <div className="rounded-2xl border border-border/70 bg-background/70 p-2.5 dark:border-dark-5/30 dark:bg-dark-1/60">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={valores.imagemFundo}
                            alt={t({ pt: "Prévia da imagem de fundo", en: "Background preview", es: "Vista previa del fondo" })}
                            className="h-10 w-10 rounded-md border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-medium text-foreground">
                              {t({ pt: "Imagem carregada", en: "Image loaded", es: "Imagen cargada" })}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {t({ pt: "Base visual do QR Code.", en: "Visual base of the QR code.", es: "Base visual del código QR." })}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={onRemoveBackgroundImage}
                            aria-label={t({ pt: "Remover imagem de fundo", en: "Remove background image", es: "Quitar imagen de fondo" })}
                            className="h-8 w-8 rounded-full"
                          >
                            <LocalIcon name="trash" className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </StudioSection>

              <StudioSection
                active={valores.habilitarCustomizacaoFrame}
                icon="frame"
                title={t({ pt: "Moldura personalizada", en: "Custom frame", es: "Marco personalizado" })}
                description={t({
                  pt: "Bordas extras e textos de apoio para peças promocionais",
                  en: "Extra borders and supporting text for promotional pieces",
                  es: "Bordes extra y textos de apoyo para piezas promocionales",
                })}
                accentClassName="border-emerald-300/50 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    {t({
                      pt: "Molduras alteram o visual do preview e da exportação.",
                      en: "Frames change the preview and export design.",
                      es: "Los marcos cambian la vista previa y la exportación.",
                    })}
                  </div>
                  <Switch
                    id="enable-frame"
                    checked={valores.habilitarCustomizacaoFrame}
                    aria-label={t({ pt: "Moldura personalizada", en: "Custom frame", es: "Marco personalizado" })}
                    onCheckedChange={(checked) => {
                      onChange("habilitarCustomizacaoFrame", checked)
                      if (!checked) {
                        onChange("tipoFrameSelecionado", "none")
                        onChange("textoFrame", "")
                      }
                    }}
                  />
                </div>

                {valores.habilitarCustomizacaoFrame && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="frame-type" className="text-[12px] font-medium text-foreground">
                        {t({ pt: "Tipo de moldura", en: "Frame type", es: "Tipo de marco" })}
                      </Label>
                      <Select value={valores.tipoFrameSelecionado} onValueChange={(value) => onChange("tipoFrameSelecionado", value as TipoFrame)}>
                        <SelectTrigger id="frame-type" className="h-9 text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAME_TYPES.map((frame) => (
                            <SelectItem key={frame} value={frame}>
                              {t(FRAME_LABELS[frame])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {FRAMES_WITH_CUSTOM_TEXT.includes(valores.tipoFrameSelecionado) && (
                      <div className="space-y-1.5">
                        <Label htmlFor="frame-text" className="text-[12px] font-medium text-foreground">
                          {t({ pt: "Texto da moldura", en: "Frame text", es: "Texto del marco" })}
                        </Label>
                        <Input
                          id="frame-text"
                          type="text"
                          maxLength={40}
                          value={valores.textoFrame}
                          onChange={(event) => onChange("textoFrame", event.target.value)}
                          placeholder={t({ pt: "Digite o texto da moldura", en: "Enter the frame text", es: "Escribe el texto del marco" })}
                          className="h-9 text-[12px]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </StudioSection>

              <StudioSection
                active={visualTemplates.length > 0}
                icon="sparkles"
                title={t({ pt: "Templates visuais", en: "Visual templates", es: "Plantillas visuales" })}
                description={t({
                  pt: "Salve combinações completas de cor, logo, fundo e moldura",
                  en: "Save full combinations of color, logo, background and frame",
                  es: "Guarda combinaciones completas de color, logo, fondo y marco",
                })}
                accentClassName="border-amber-300/50 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-950/10"
              >
                <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    type="text"
                    maxLength={60}
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        handleSaveTemplate()
                      }
                    }}
                    placeholder={t({ pt: "Nome do template", en: "Template name", es: "Nombre de la plantilla" })}
                    aria-label={t({ pt: "Nome do template", en: "Template name", es: "Nombre de la plantilla" })}
                    className="h-10 text-[12px]"
                  />
                  <Button type="button" onClick={handleSaveTemplate} className="h-10 gap-2.5 px-4 text-[12px]">
                    <LocalIcon name="plus" className="h-3.5 w-3.5" />
                    {t({ pt: "Salvar tema", en: "Save theme", es: "Guardar tema" })}
                  </Button>
                </div>

                {visualTemplates.length > 0 ? (
                  <div className="space-y-2.5">
                    {visualTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="rounded-[1.1rem] border border-border/70 bg-background/70 p-3 dark:border-dark-5/30 dark:bg-dark-1/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-foreground">{template.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {t({ pt: "Atualizado em", en: "Updated on", es: "Actualizado el" })} {formatTemplateDate(template.updatedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full border border-border/60" style={{ backgroundColor: template.corFrente }} />
                            <span className="h-5 w-5 rounded-full border border-border/60" style={{ backgroundColor: template.corFundo }} />
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="normal-case tracking-normal">
                            {template.tamanho}px
                          </Badge>
                          <Badge variant="outline" className="normal-case tracking-normal">
                            {t({ pt: "Correção", en: "Correction", es: "Corrección" })} {template.nivel}
                          </Badge>
                          {template.habilitarCustomizacaoLogo && template.logoDataUri && (
                            <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                              <LocalIcon name="image-plus" className="h-3 w-3" />
                              Logo
                            </Badge>
                          )}
                          {template.habilitarCustomizacaoFundo && template.imagemFundo && (
                            <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                              <LocalIcon name="image" className="h-3 w-3" />
                              {t({ pt: "Fundo", en: "Background", es: "Fondo" })}
                            </Badge>
                          )}
                          {template.habilitarCustomizacaoFrame && template.tipoFrameSelecionado && template.tipoFrameSelecionado !== "none" && (
                            <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                              <LocalIcon name="frame" className="h-3 w-3" />
                              {t({ pt: "Moldura", en: "Frame", es: "Marco" })}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <Button type="button" variant="outline" onClick={() => onApplyVisualTemplate(template)} className="h-9 gap-1.5 text-[11px]">
                            <LocalIcon name="check" className="h-3.5 w-3.5" />
                            {t({ pt: "Aplicar", en: "Apply", es: "Aplicar" })}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onSaveVisualTemplate(template.name, template.id)}
                            className="h-9 gap-1.5 text-[11px]"
                          >
                            <LocalIcon name="reset" className="h-3.5 w-3.5" />
                            {t({ pt: "Atualizar", en: "Update", es: "Actualizar" })}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onDeleteVisualTemplate(template.id)}
                            className="h-9 gap-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <LocalIcon name="trash" className="h-3.5 w-3.5" />
                            {t({ pt: "Excluir", en: "Delete", es: "Eliminar" })}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 px-4 py-4 text-center dark:border-dark-5/30 dark:bg-dark-1/40">
                    <p className="text-[12px] font-medium text-foreground">
                      {t({ pt: "Nenhum template salvo", en: "No saved templates", es: "No hay plantillas guardadas" })}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t({
                        pt: "Guarde combinações prontas para reutilizar o mesmo visual rapidamente.",
                        en: "Save ready-made combinations to reuse the same design quickly.",
                        es: "Guarda combinaciones listas para reutilizar el mismo diseño rápidamente.",
                      })}
                    </p>
                  </div>
                )}
              </StudioSection>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
