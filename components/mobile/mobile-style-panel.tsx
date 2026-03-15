"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"
import type { NivelCorrecaoErro, VisualTemplateQRCode } from "@/hooks/use-qr-code-state"

interface PersonalizacaoAparenciaMobileProps {
  valores: any
  onChange: (campo: string, valor: any) => void
  onResetGranular: (tipo: string) => void
  valoresAccordion: string[]
  onValoresAccordionChange: (values: string[]) => void
  visualTemplates: VisualTemplateQRCode[]
  onSaveVisualTemplate: (name: string, templateId?: string) => void
  onApplyVisualTemplate: (template: VisualTemplateQRCode) => void
  onDeleteVisualTemplate: (templateId: string) => void
  language?: AppLanguage
}

export function MobileStylePanel({
  valores,
  onChange,
  onResetGranular,
  valoresAccordion,
  onValoresAccordionChange,
  visualTemplates,
  onSaveVisualTemplate,
  onApplyVisualTemplate,
  onDeleteVisualTemplate,
  language = "pt",
}: PersonalizacaoAparenciaMobileProps) {
  const [templateName, setTemplateName] = useState("")
  const copy =
    language === "en"
      ? {
          templates: "Visual templates",
          saveCurrent: "Save current theme",
          apply: "Apply",
          update: "Update",
          remove: "Delete",
          none: "No saved template",
          noneDescription: "Save full styles to reuse later.",
        }
      : {
          templates: "Templates Visuais",
          saveCurrent: "Salvar tema atual",
          apply: "Aplicar",
          update: "Atualizar",
          remove: "Excluir",
          none: "Nenhum template salvo",
          noneDescription: "Guarde estilos completos para reutilizar depois.",
        }

  const hasBasicCustomizations = () => {
    return (
      valores.corFrente !== "#000000" ||
      valores.corFundo !== "#FFFFFF" ||
      valores.tamanho !== 256 ||
      valores.nivelCorrecaoErro !== "H" ||
      valores.zonaQuieta !== 4
    )
  }

  const hasLogoCustomizations = () => {
    return !!valores.logoDataUri
  }

  const hasBackgroundCustomizations = () => {
    return !!valores.imagemFundo
  }

  const hasFrameCustomizations = () => {
    return valores.tipoFrameSelecionado && valores.tipoFrameSelecionado !== "none"
  }

  const handleSaveTemplate = () => {
    onSaveVisualTemplate(templateName)
    setTemplateName("")
  }

  const formatTemplateDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(language === "en" ? "en-US" : "pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  return (
    <Accordion type="multiple" value={valoresAccordion} onValueChange={onValoresAccordionChange} className="space-y-2">
      {/* Cores e Tamanho */}
      <AccordionItem
        value="appearance"
        className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-slate-500/10">
                <LocalIcon name="palette" className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="font-medium">Cores e Tamanho</span>
              {hasBasicCustomizations() && (
                <Badge variant="secondary" className="text-xs">
                  <LocalIcon name="sparkles" className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
            {hasBasicCustomizations() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResetGranular("basic")
                }}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive mr-2"
              >
                <LocalIcon name="reset" className="w-3 h-3" />
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-4">
            {/* Cores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cor do QR</label>
                <div className="relative">
                  <input
                    type="color"
                    value={valores.corFrente}
                    onChange={(e) => onChange("corFrente", e.target.value)}
                    className="w-full h-10 rounded border-2 cursor-pointer hover:border-primary/50 transition-all duration-200"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cor de Fundo</label>
                <div className="relative">
                  <input
                    type="color"
                    value={valores.corFundo}
                    onChange={(e) => onChange("corFundo", e.target.value)}
                    className="w-full h-10 rounded border-2 cursor-pointer hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={valores.imagemFundo || hasFrameCustomizations()}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
                {(valores.imagemFundo || hasFrameCustomizations()) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Desabilitado quando há imagem de fundo ou frame
                  </p>
                )}
              </div>
            </div>

            {/* Tamanho */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Tamanho</label>
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
                className="transition-all duration-300"
              />
            </div>

            {/* Configurações Avançadas */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="error-correction"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <LocalIcon name="shield" className="w-4 h-4 text-green-600" />
                  Correção de Erro
                </Label>
                <Select
                  onValueChange={(value) => onChange("nivelCorrecaoErro", value as NivelCorrecaoErro)}
                  value={valores.nivelCorrecaoErro}
                >
                  <SelectTrigger id="error-correction" className="text-sm h-10">
                    <SelectValue placeholder="Nível de correção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Baixo (~7%)
                      </div>
                    </SelectItem>
                    <SelectItem value="M" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Médio (~15%)
                      </div>
                    </SelectItem>
                    <SelectItem value="Q" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Alto (~25%)
                      </div>
                    </SelectItem>
                    <SelectItem value="H" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Muito Alto (~30%)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-zone" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <LocalIcon name="frame" className="w-4 h-4 text-primary" />
                  Margem
                </Label>
                <Input
                  id="quiet-zone"
                  type="number"
                  min="0"
                  max="40"
                  value={valores.zonaQuieta}
                  onChange={(e) => onChange("zonaQuieta", Number(e.target.value))}
                  className="h-10"
                  placeholder="Tamanho da margem"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Logo Personalizado */}
      <AccordionItem
        value="logo"
        className="bg-purple-50/50 dark:bg-purple-900/50 rounded-lg border border-purple-200/50 dark:border-purple-700/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <LocalIcon name="image-plus" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">Logo Personalizado</span>
              {hasLogoCustomizations() && (
                <Badge variant="secondary" className="text-xs">
                  <LocalIcon name="sparkles" className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
            {hasLogoCustomizations() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResetGranular("logo")
                }}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive mr-2"
              >
                <LocalIcon name="trash" className="w-3 h-3" />
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = () => onChange("logoDataUri", reader.result)
                  reader.readAsDataURL(file)
                }
              }}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {valores.logoDataUri && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img
                    src={valores.logoDataUri || "/placeholder.svg"}
                    alt="Logo"
                    className="w-8 h-8 object-contain border rounded"
                  />
                  <span className="text-xs text-muted-foreground">Logo carregado</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Tamanho do Logo (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="5"
                      max="40"
                      step="1"
                      value={Math.round(valores.logoTamanhoRatio * 100)}
                      onChange={(e) => onChange("logoTamanhoRatio", Number.parseFloat(e.target.value) / 100)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excavate-logo"
                    checked={valores.escavarLogo}
                    onCheckedChange={(checked) => onChange("escavarLogo", checked as boolean)}
                  />
                  <Label htmlFor="excavate-logo" className="text-sm font-medium text-foreground">
                    Escavar área do QR Code
                  </Label>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Fundo Personalizado */}
      <AccordionItem
        value="background"
        className="bg-blue-50/50 dark:bg-blue-900/50 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <LocalIcon name="image" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">Fundo Personalizado</span>
              {hasBackgroundCustomizations() && (
                <Badge variant="secondary" className="text-xs">
                  <LocalIcon name="sparkles" className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
            {hasBackgroundCustomizations() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResetGranular("background")
                }}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive mr-2"
              >
                <LocalIcon name="trash" className="w-3 h-3" />
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = () => onChange("imagemFundo", reader.result)
                  reader.readAsDataURL(file)
                }
              }}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {valores.imagemFundo && (
              <div className="flex items-center gap-2">
                <img
                  src={valores.imagemFundo || "/placeholder.svg"}
                  alt="Fundo"
                  className="w-8 h-8 object-cover border rounded"
                />
                <span className="text-xs text-muted-foreground">Imagem de fundo carregada</span>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Moldura Personalizada */}
      <AccordionItem
        value="frame"
        className="bg-green-50/50 dark:bg-green-900/50 rounded-lg border border-green-200/50 dark:border-green-700/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <LocalIcon name="frame" className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">Moldura Personalizada</span>
              {hasFrameCustomizations() && (
                <Badge variant="secondary" className="text-xs">
                  <LocalIcon name="sparkles" className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
            {hasFrameCustomizations() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResetGranular("frame")
                }}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive mr-2"
              >
                <LocalIcon name="trash" className="w-3 h-3" />
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            <select
              value={valores.tipoFrameSelecionado}
              onChange={(e) => onChange("tipoFrameSelecionado", e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-sm"
            >
              <option value="none">Nenhuma</option>
              <option value="simpleBorder">Borda Simples</option>
              <option value="textBottom">Texto na Parte Inferior</option>
              <option value="scanMeBottom">"SCAN ME" na Parte Inferior</option>
              <option value="roundedBorderTextBottom">Borda Arredondada com Texto</option>
              <option value="topBottomText">Texto Superior e Inferior</option>
              <option value="decorativeBorder">Bordas Decorativas</option>
              <option value="modernFrame">Moldura Moderna</option>
              <option value="classicFrame">Moldura Clássica</option>
            </select>

            {(valores.tipoFrameSelecionado === "textBottom" ||
              valores.tipoFrameSelecionado === "roundedBorderTextBottom" ||
              valores.tipoFrameSelecionado === "topBottomText" ||
              valores.tipoFrameSelecionado === "decorativeBorder") && (
              <input
                type="text"
                value={valores.textoFrame}
                onChange={(e) => onChange("textoFrame", e.target.value)}
                placeholder="Digite o texto da moldura"
                className="w-full p-2 border rounded-md bg-background text-sm"
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="templates"
        className="bg-amber-50/50 dark:bg-amber-900/40 rounded-lg border border-amber-200/60 dark:border-amber-700/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <LocalIcon name="sparkles" className="w-4 h-4 text-amber-600 dark:text-amber-300" />
              </div>
              <span className="font-medium">{copy.templates}</span>
              {visualTemplates.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {visualTemplates.length} salvo{visualTemplates.length > 1 ? "s" : ""}
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
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Nome do template"
                className="h-10 text-sm"
              />
              <Button type="button" onClick={handleSaveTemplate} className="h-10 gap-2">
                <LocalIcon name="plus" className="w-4 h-4" />
                {copy.saveCurrent}
              </Button>
            </div>

            {visualTemplates.length > 0 ? (
              <div className="space-y-2.5">
                {visualTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl border border-amber-200/60 bg-background/80 p-3 dark:border-amber-700/40 dark:bg-background/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Atualizado em {formatTemplateDate(template.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="h-4 w-4 rounded-full border border-border/60"
                          style={{ backgroundColor: template.corFrente }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-border/60"
                          style={{ backgroundColor: template.corFundo }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="normal-case tracking-normal text-[10px]">
                        {template.tamanho}px
                      </Badge>
                      {template.habilitarCustomizacaoLogo && template.logoDataUri && (
                        <Badge variant="outline" className="gap-1 normal-case tracking-normal text-[10px]">
                          <LocalIcon name="image-plus" className="w-3 h-3" />
                          Logo
                        </Badge>
                      )}
                      {template.habilitarCustomizacaoFundo && template.imagemFundo && (
                        <Badge variant="outline" className="gap-1 normal-case tracking-normal text-[10px]">
                          <LocalIcon name="image" className="w-3 h-3" />
                          Fundo
                        </Badge>
                      )}
                      {template.habilitarCustomizacaoFrame &&
                        template.tipoFrameSelecionado &&
                        template.tipoFrameSelecionado !== "none" && (
                          <Badge variant="outline" className="gap-1 normal-case tracking-normal text-[10px]">
                            <LocalIcon name="frame" className="w-3 h-3" />
                            Moldura
                          </Badge>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onApplyVisualTemplate(template)}
                        className="h-9 text-[11px]"
                      >
                        {copy.apply}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSaveVisualTemplate(template.name, template.id)}
                        className="h-9 text-[11px]"
                      >
                        {copy.update}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onDeleteVisualTemplate(template.id)}
                        className="h-9 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {copy.remove}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-300/70 px-4 py-4 text-center dark:border-amber-700/50">
                <p className="text-sm font-medium text-foreground">{copy.none}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.noneDescription}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
