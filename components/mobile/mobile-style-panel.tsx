"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocalIcon } from "@/components/ui/local-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { ResetKind } from "@/hooks/use-qr-code-generator"
import type { QrState, UpdateField } from "@/hooks/use-qr-code-state"
import { IMAGE_ACCEPT } from "@/lib/qr/image"
import { ERROR_LEVEL_LABELS, FRAME_LABELS } from "@/lib/qr/labels"
import {
  DEFAULT_APPEARANCE,
  ERROR_LEVELS,
  FRAME_TYPES,
  FRAMES_WITH_CUSTOM_TEXT,
  type NivelCorrecaoErro,
  type TipoFrame,
  type VisualTemplateQRCode,
} from "@/lib/qr/types"

interface MobileStylePanelProps {
  valores: QrState
  onChange: UpdateField
  onResetGranular: (kind: ResetKind) => void
  valoresAccordion: string[]
  onValoresAccordionChange: (values: string[]) => void
  onLogoFile: (file: File) => void | Promise<void>
  onBackgroundFile: (file: File) => void | Promise<void>
  visualTemplates: VisualTemplateQRCode[]
  onSaveVisualTemplate: (name: string, templateId?: string) => void
  onApplyVisualTemplate: (template: VisualTemplateQRCode) => void
  onDeleteVisualTemplate: (templateId: string) => void
}

const LEVEL_COLORS: Record<NivelCorrecaoErro, string> = {
  L: "bg-red-500",
  M: "bg-yellow-500",
  Q: "bg-blue-500",
  H: "bg-green-500",
}

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

function SectionTrigger({
  icon,
  iconClassName,
  shellClassName,
  title,
  active,
  activeLabel,
  resetLabel,
  resetIcon,
  onReset,
}: {
  icon: string
  iconClassName: string
  shellClassName: string
  title: string
  active: boolean
  activeLabel: string
  resetLabel: string
  resetIcon: string
  onReset: () => void
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-md p-1.5 ${shellClassName}`}>
          <LocalIcon name={icon} className={`h-4 w-4 ${iconClassName}`} />
        </div>
        <span className="font-medium">{title}</span>
        {active && (
          <Badge variant="secondary" className="text-xs">
            <LocalIcon name="sparkles" className="mr-1 h-3 w-3" />
            {activeLabel}
          </Badge>
        )}
      </div>
      {active && (
        <span
          role="button"
          tabIndex={0}
          aria-label={resetLabel}
          onClick={(event) => {
            event.stopPropagation()
            onReset()
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              event.stopPropagation()
              onReset()
            }
          }}
          className="mr-2 inline-flex h-8 items-center justify-center rounded-xl px-3 text-xs text-destructive hover:bg-destructive/10"
        >
          <LocalIcon name={resetIcon} className="h-3 w-3" />
        </span>
      )}
    </div>
  )
}

export function MobileStylePanel({
  valores,
  onChange,
  onResetGranular,
  valoresAccordion,
  onValoresAccordionChange,
  onLogoFile,
  onBackgroundFile,
  visualTemplates,
  onSaveVisualTemplate,
  onApplyVisualTemplate,
  onDeleteVisualTemplate,
}: MobileStylePanelProps) {
  const { t, localeTag } = useLanguage()
  const [templateName, setTemplateName] = useState("")

  const activeLabel = t({ pt: "Ativo", en: "Active", es: "Activo" })
  const hasBasic =
    valores.corFrente !== DEFAULT_APPEARANCE.corFrente ||
    valores.corFundo !== DEFAULT_APPEARANCE.corFundo ||
    valores.tamanho !== DEFAULT_APPEARANCE.tamanho ||
    valores.nivelCorrecaoErro !== DEFAULT_APPEARANCE.nivelCorrecaoErro ||
    valores.zonaQuieta !== DEFAULT_APPEARANCE.zonaQuieta
  const hasFrame = valores.tipoFrameSelecionado !== "none"
  const backgroundLocked = !!valores.imagemFundo || hasFrame

  const pickFile = (handler: (file: File) => void | Promise<void>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (file) {
      void handler(file)
    }
  }

  const handleSaveTemplate = () => {
    onSaveVisualTemplate(templateName)
    setTemplateName("")
  }

  return (
    <Accordion type="multiple" value={valoresAccordion} onValueChange={onValoresAccordionChange} className="space-y-2">
      <AccordionItem value="appearance" className="rounded-lg border border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-900/50">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <SectionTrigger
            icon="palette"
            iconClassName="text-slate-600 dark:text-slate-400"
            shellClassName="bg-slate-500/10"
            title={t({ pt: "Cores e tamanho", en: "Colors and size", es: "Colores y tamaño" })}
            active={hasBasic}
            activeLabel={activeLabel}
            resetLabel={t({ pt: "Restaurar cores e tamanho", en: "Reset colors and size", es: "Restablecer colores y tamaño" })}
            resetIcon="reset"
            onReset={() => onResetGranular("basic")}
          />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label htmlFor="mobile-fg-color" className="text-sm font-medium text-foreground">
                  {t({ pt: "Cor do QR", en: "QR color", es: "Color del QR" })}
                </label>
                <input
                  id="mobile-fg-color"
                  type="color"
                  value={valores.corFrente}
                  onChange={(event) => onChange("corFrente", event.target.value)}
                  className="h-10 w-full cursor-pointer rounded border-2 transition-all duration-200 hover:border-primary/50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="mobile-bg-color" className="text-sm font-medium text-foreground">
                  {t({ pt: "Cor de fundo", en: "Background color", es: "Color de fondo" })}
                </label>
                <input
                  id="mobile-bg-color"
                  type="color"
                  value={valores.corFundo}
                  onChange={(event) => onChange("corFundo", event.target.value)}
                  disabled={backgroundLocked}
                  className="h-10 w-full cursor-pointer rounded border-2 transition-all duration-200 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {backgroundLocked && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t({
                      pt: "Desabilitada quando há imagem de fundo ou moldura",
                      en: "Disabled while a background image or frame is active",
                      es: "Desactivado mientras haya imagen de fondo o marco",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">{t({ pt: "Tamanho", en: "Size", es: "Tamaño" })}</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {valores.tamanho}px
                </Badge>
              </div>
              <Slider
                min={50}
                max={1000}
                step={1}
                value={[valores.tamanho]}
                onValueChange={(value) => onChange("tamanho", value[0])}
                aria-label={t({ pt: "Tamanho", en: "Size", es: "Tamaño" })}
                className="transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="mobile-error-correction" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <LocalIcon name="shield" className="h-4 w-4 text-green-600" />
                  {t({ pt: "Correção de erro", en: "Error correction", es: "Corrección de errores" })}
                </Label>
                <Select value={valores.nivelCorrecaoErro} onValueChange={(value) => onChange("nivelCorrecaoErro", value as NivelCorrecaoErro)}>
                  <SelectTrigger id="mobile-error-correction" className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ERROR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${LEVEL_COLORS[level]}`} />
                          {t(ERROR_LEVEL_LABELS[level])}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mobile-quiet-zone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <LocalIcon name="frame" className="h-4 w-4 text-primary" />
                  {t({ pt: "Margem", en: "Margin", es: "Margen" })}
                </Label>
                <Input
                  id="mobile-quiet-zone"
                  type="number"
                  min={0}
                  max={40}
                  value={valores.zonaQuieta}
                  onChange={(event) => onChange("zonaQuieta", clamp(Number(event.target.value), 0, 40))}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="logo" className="rounded-lg border border-purple-200/50 bg-purple-50/50 dark:border-purple-700/50 dark:bg-purple-900/50">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <SectionTrigger
            icon="image-plus"
            iconClassName="text-purple-600 dark:text-purple-400"
            shellClassName="bg-purple-500/10"
            title={t({ pt: "Logo personalizado", en: "Custom logo", es: "Logo personalizado" })}
            active={!!valores.logoDataUri}
            activeLabel={activeLabel}
            resetLabel={t({ pt: "Remover logo", en: "Remove logo", es: "Quitar logo" })}
            resetIcon="trash"
            onReset={() => onResetGranular("logo")}
          />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              aria-label={t({ pt: "Selecionar logo", en: "Choose logo", es: "Elegir logo" })}
              onChange={pickFile(onLogoFile)}
              className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
            />
            {valores.logoDataUri && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src={valores.logoDataUri} alt="Logo" className="h-8 w-8 rounded border object-contain" />
                  <span className="text-xs text-muted-foreground">{t({ pt: "Logo carregado", en: "Logo loaded", es: "Logo cargado" })}</span>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mobile-logo-size" className="text-sm font-medium text-foreground">
                    {t({ pt: "Tamanho do logo (%)", en: "Logo size (%)", es: "Tamaño del logo (%)" })}
                  </Label>
                  <Input
                    id="mobile-logo-size"
                    type="number"
                    min={5}
                    max={40}
                    step={1}
                    value={Math.round(valores.logoTamanhoRatio * 100)}
                    onChange={(event) => onChange("logoTamanhoRatio", clamp(Number(event.target.value), 5, 40) / 100)}
                    className="h-9"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="mobile-excavate-logo" checked={valores.escavarLogo} onCheckedChange={(checked) => onChange("escavarLogo", checked === true)} />
                  <Label htmlFor="mobile-excavate-logo" className="text-sm font-medium text-foreground">
                    {t({ pt: "Limpar área atrás do logo", en: "Clear area behind logo", es: "Despejar el área detrás del logo" })}
                  </Label>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="background" className="rounded-lg border border-blue-200/50 bg-blue-50/50 dark:border-blue-700/50 dark:bg-blue-900/50">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <SectionTrigger
            icon="image"
            iconClassName="text-blue-600 dark:text-blue-400"
            shellClassName="bg-blue-500/10"
            title={t({ pt: "Fundo personalizado", en: "Custom background", es: "Fondo personalizado" })}
            active={!!valores.imagemFundo}
            activeLabel={activeLabel}
            resetLabel={t({ pt: "Remover fundo", en: "Remove background", es: "Quitar fondo" })}
            resetIcon="trash"
            onReset={() => onResetGranular("background")}
          />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              aria-label={t({ pt: "Selecionar imagem de fundo", en: "Choose background image", es: "Elegir imagen de fondo" })}
              onChange={pickFile(onBackgroundFile)}
              className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {valores.imagemFundo && (
              <div className="flex items-center gap-2">
                <img
                  src={valores.imagemFundo}
                  alt={t({ pt: "Fundo", en: "Background", es: "Fondo" })}
                  className="h-8 w-8 rounded border object-cover"
                />
                <span className="text-xs text-muted-foreground">
                  {t({ pt: "Imagem de fundo carregada", en: "Background image loaded", es: "Imagen de fondo cargada" })}
                </span>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="frame" className="rounded-lg border border-green-200/50 bg-green-50/50 dark:border-green-700/50 dark:bg-green-900/50">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <SectionTrigger
            icon="frame"
            iconClassName="text-green-600 dark:text-green-400"
            shellClassName="bg-green-500/10"
            title={t({ pt: "Moldura personalizada", en: "Custom frame", es: "Marco personalizado" })}
            active={hasFrame}
            activeLabel={activeLabel}
            resetLabel={t({ pt: "Remover moldura", en: "Remove frame", es: "Quitar marco" })}
            resetIcon="trash"
            onReset={() => onResetGranular("frame")}
          />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <select
              aria-label={t({ pt: "Tipo de moldura", en: "Frame type", es: "Tipo de marco" })}
              value={valores.tipoFrameSelecionado}
              onChange={(event) => onChange("tipoFrameSelecionado", event.target.value as TipoFrame)}
              className="w-full rounded-md border bg-background p-2 text-sm"
            >
              {FRAME_TYPES.map((frame) => (
                <option key={frame} value={frame}>
                  {t(FRAME_LABELS[frame])}
                </option>
              ))}
            </select>

            {FRAMES_WITH_CUSTOM_TEXT.includes(valores.tipoFrameSelecionado) && (
              <input
                type="text"
                maxLength={40}
                aria-label={t({ pt: "Texto da moldura", en: "Frame text", es: "Texto del marco" })}
                value={valores.textoFrame}
                onChange={(event) => onChange("textoFrame", event.target.value)}
                placeholder={t({ pt: "Digite o texto da moldura", en: "Enter the frame text", es: "Escribe el texto del marco" })}
                className="w-full rounded-md border bg-background p-2 text-sm"
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="templates" className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/40">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-amber-500/10 p-1.5">
                <LocalIcon name="sparkles" className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              </div>
              <span className="font-medium">{t({ pt: "Templates visuais", en: "Visual templates", es: "Plantillas visuales" })}</span>
              {visualTemplates.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {visualTemplates.length}{" "}
                  {visualTemplates.length > 1
                    ? t({ pt: "salvos", en: "saved", es: "guardadas" })
                    : t({ pt: "salvo", en: "saved", es: "guardada" })}
                </Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <div className="grid gap-2">
              <Input
                type="text"
                maxLength={60}
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder={t({ pt: "Nome do template", en: "Template name", es: "Nombre de la plantilla" })}
                aria-label={t({ pt: "Nome do template", en: "Template name", es: "Nombre de la plantilla" })}
                className="h-10 text-sm"
              />
              <Button type="button" onClick={handleSaveTemplate} className="h-10 gap-2">
                <LocalIcon name="plus" className="h-4 w-4" />
                {t({ pt: "Salvar tema atual", en: "Save current theme", es: "Guardar tema actual" })}
              </Button>
            </div>

            {visualTemplates.length > 0 ? (
              <div className="space-y-2.5">
                {visualTemplates.map((template) => (
                  <div key={template.id} className="rounded-xl border border-amber-200/60 bg-background/80 p-3 dark:border-amber-700/40 dark:bg-background/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t({ pt: "Atualizado em", en: "Updated on", es: "Actualizado el" })}{" "}
                          {new Date(template.updatedAt).toLocaleDateString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-4 w-4 rounded-full border border-border/60" style={{ backgroundColor: template.corFrente }} />
                        <span className="h-4 w-4 rounded-full border border-border/60" style={{ backgroundColor: template.corFundo }} />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] normal-case tracking-normal">
                        {template.tamanho}px
                      </Badge>
                      {template.habilitarCustomizacaoLogo && template.logoDataUri && (
                        <Badge variant="outline" className="gap-1 text-[10px] normal-case tracking-normal">
                          <LocalIcon name="image-plus" className="h-3 w-3" />
                          Logo
                        </Badge>
                      )}
                      {template.habilitarCustomizacaoFundo && template.imagemFundo && (
                        <Badge variant="outline" className="gap-1 text-[10px] normal-case tracking-normal">
                          <LocalIcon name="image" className="h-3 w-3" />
                          {t({ pt: "Fundo", en: "Background", es: "Fondo" })}
                        </Badge>
                      )}
                      {template.habilitarCustomizacaoFrame && template.tipoFrameSelecionado && template.tipoFrameSelecionado !== "none" && (
                        <Badge variant="outline" className="gap-1 text-[10px] normal-case tracking-normal">
                          <LocalIcon name="frame" className="h-3 w-3" />
                          {t({ pt: "Moldura", en: "Frame", es: "Marco" })}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Button type="button" variant="outline" onClick={() => onApplyVisualTemplate(template)} className="h-9 text-[11px]">
                        {t({ pt: "Aplicar", en: "Apply", es: "Aplicar" })}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => onSaveVisualTemplate(template.name, template.id)} className="h-9 text-[11px]">
                        {t({ pt: "Atualizar", en: "Update", es: "Actualizar" })}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onDeleteVisualTemplate(template.id)}
                        className="h-9 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {t({ pt: "Excluir", en: "Delete", es: "Eliminar" })}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-300/70 px-4 py-4 text-center dark:border-amber-700/50">
                <p className="text-sm font-medium text-foreground">
                  {t({ pt: "Nenhum template salvo", en: "No saved templates", es: "No hay plantillas guardadas" })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t({
                    pt: "Guarde estilos completos para reutilizar depois.",
                    en: "Save complete styles to reuse later.",
                    es: "Guarda estilos completos para reutilizarlos después.",
                  })}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
