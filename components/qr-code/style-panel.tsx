"use client"

import type React from "react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"
import type { NivelCorrecaoErro, TipoFrame, VisualTemplateQRCode } from "@/hooks/use-qr-code-state"

interface PersonalizacaoAparenciaProps {
  valores: any
  onChange: (campo: string, valor: any) => void
  onReset: () => void
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBackgroundImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveBackgroundImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  backgroundImageInputRef: React.RefObject<HTMLInputElement>
  visualTemplates: VisualTemplateQRCode[]
  onSaveVisualTemplate: (name: string, templateId?: string) => void
  onApplyVisualTemplate: (template: VisualTemplateQRCode) => void
  onDeleteVisualTemplate: (templateId: string) => void
  language?: AppLanguage
  isMobile: boolean
}

const frameOptions: Array<{ value: TipoFrame; label: string }> = [
  { value: "none", label: "Nenhuma" },
  { value: "simpleBorder", label: "Borda simples" },
  { value: "textBottom", label: "Texto inferior" },
  { value: "scanMeBottom", label: "Scan me" },
  { value: "roundedBorderTextBottom", label: "Borda arredondada com texto" },
  { value: "topBottomText", label: "Texto superior e inferior" },
  { value: "decorativeBorder", label: "Bordas decorativas" },
  { value: "modernFrame", label: "Moldura moderna" },
  { value: "classicFrame", label: "Moldura classica" },
]

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
        active ? accentClassName ?? "border-primary/30 bg-primary/5 dark:border-primary/25 dark:bg-primary/10" : "",
      ].join(" ")}
    >
      <div className="relative z-[1] space-y-3">
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
  language = "pt",
}: PersonalizacaoAparenciaProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [templateName, setTemplateName] = useState("")
  const copy =
    language === "en"
      ? {
          title: "Customize appearance",
          subtitle: "Colors, size, background, logo and frame",
          reset: "Reset",
          baseTitle: "QR base",
          baseDescription: "Fine control over colors, size and scanning quality",
          fg: "QR color",
          bg: "Background color",
          size: "Size",
          error: "Error correction",
          margin: "Margin",
          logoTitle: "Custom logo",
          bgTitle: "Custom background",
          frameTitle: "Custom frame",
          templatesTitle: "Visual templates",
          saveTheme: "Save theme",
          apply: "Apply",
          update: "Update",
          remove: "Delete",
          emptyTemplate: "No saved template",
          emptyTemplateDescription: "Store complete styles to reuse the same visual setup quickly.",
        }
      : {
          title: "Personalizar aparencia",
          subtitle: "Cores, tamanho, fundo, logo e moldura",
          reset: "Resetar",
          baseTitle: "Base do QR Code",
          baseDescription: "Controle fino de cor, tamanho e leitura",
          fg: "Cor do QR Code",
          bg: "Cor de fundo",
          size: "Tamanho",
          error: "Correcao de erro",
          margin: "Margem",
          logoTitle: "Logo personalizado",
          bgTitle: "Fundo personalizado",
          frameTitle: "Moldura personalizada",
          templatesTitle: "Templates visuais",
          saveTheme: "Salvar tema",
          apply: "Aplicar",
          update: "Atualizar",
          remove: "Excluir",
          emptyTemplate: "Nenhum template salvo",
          emptyTemplateDescription: "Guarde combinacoes prontas para reutilizar o mesmo visual rapidamente.",
        }

  const backgroundLocked =
    (valores.habilitarCustomizacaoFundo && !!valores.imagemFundo) ||
    (valores.habilitarCustomizacaoFrame && valores.tipoFrameSelecionado !== "none")

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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <span className="studio-icon-shell h-9 w-9 rounded-[0.9rem]">
            <LocalIcon name="settings" className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h3 className="text-[0.98rem] font-semibold text-foreground">{copy.title}</h3>
            <p className="text-[11px] text-muted-foreground">{copy.subtitle}</p>
          </div>
          <span className="studio-icon-shell ml-auto h-8 w-8 rounded-full">
            <LocalIcon
              name={isOpen ? "chevron-down" : "chevron-right"}
              className="h-3.5 w-3.5 text-muted-foreground"
            />
          </span>
        </button>

        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 rounded-full text-[12px] h-8 px-2.5">
          <LocalIcon name="reset" className="h-3.5 w-3.5" />
          {copy.reset}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-0.5">
              {/* Base QR */}
              <StudioSection icon="palette" title={copy.baseTitle} description={copy.baseDescription}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fg-color" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="palette" className="h-3.5 w-3.5 text-primary" />
                      {copy.fg}
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
                      {copy.bg}
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
                        Bloqueada quando ha imagem ou moldura ativa.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="size-slider" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="size" className="h-3.5 w-3.5 text-primary" />
                      {copy.size}
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="error-correction" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="shield" className="h-3.5 w-3.5 text-emerald-600" />
                      {copy.error}
                    </Label>
                    <Select
                      onValueChange={(value) => onChange("nivelCorrecaoErro", value as NivelCorrecaoErro)}
                      value={valores.nivelCorrecaoErro}
                    >
                      <SelectTrigger id="error-correction" className="h-9 text-[12px]">
                        <SelectValue placeholder="Nivel de correcao" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Baixo (~7%)</SelectItem>
                        <SelectItem value="M">Medio (~15%)</SelectItem>
                        <SelectItem value="Q">Alto (~25%)</SelectItem>
                        <SelectItem value="H">Muito alto (~30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quiet-zone" className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                      <LocalIcon name="frame" className="h-3.5 w-3.5 text-primary" />
                      {copy.margin}
                    </Label>
                    <Input
                      id="quiet-zone"
                      type="number"
                      min="0"
                      max="40"
                      value={valores.zonaQuieta}
                      onChange={(event) => onChange("zonaQuieta", Number(event.target.value))}
                      className="h-9 text-[12px]"
                      placeholder="Margem"
                    />
                  </div>
                </div>
              </StudioSection>

              {/* Logo */}
              <StudioSection
                active={valores.habilitarCustomizacaoLogo}
                icon="image-plus"
                title={copy.logoTitle}
                description="Adicione um logo central com proporcao ajustavel"
                accentClassName="border-fuchsia-300/50 bg-fuchsia-50/60 dark:border-fuchsia-500/20 dark:bg-fuchsia-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Use um PNG transparente para melhor resultado.
                  </div>
                  <Switch
                    id="enable-logo"
                    checked={valores.habilitarCustomizacaoLogo}
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
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
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
                      Selecionar logo
                    </Button>

                    {valores.logoDataUri && (
                      <div className="rounded-[1rem] border border-border/70 bg-background/70 p-2.5 dark:border-dark-5/30 dark:bg-dark-1/60">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={valores.logoDataUri || "/placeholder.svg"}
                            alt="Preview do logo"
                            className="h-10 w-10 rounded-md border bg-white object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-medium text-foreground">Logo carregado</p>
                            <p className="text-[11px] text-muted-foreground">Ajuste o tamanho abaixo.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="logo-size-ratio" className="text-[12px] font-medium text-foreground">
                          Tamanho do logo
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            id="logo-size-ratio"
                            type="number"
                            min="5"
                            max="40"
                            step="1"
                            value={Math.round(valores.logoTamanhoRatio * 100)}
                            onChange={(event) =>
                              onChange("logoTamanhoRatio", Number.parseFloat(event.target.value || "0") / 100)
                            }
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
                          onCheckedChange={(checked) => onChange("escavarLogo", checked as boolean)}
                          disabled={!valores.logoDataUri}
                        />
                        <Label htmlFor="excavate-logo" className="text-[12px] font-medium text-foreground">
                          Escavar area
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </StudioSection>

              {/* Background */}
              <StudioSection
                active={valores.habilitarCustomizacaoFundo}
                icon="image"
                title={copy.bgTitle}
                description="Aplique uma imagem no container do QR Code"
                accentClassName="border-sky-300/50 bg-sky-50/60 dark:border-sky-500/20 dark:bg-sky-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Incorporado ao wrapper visual do preview e exportacao.
                  </div>
                  <Switch
                    id="enable-background"
                    checked={valores.habilitarCustomizacaoFundo}
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
                    <Input
                      id="bg-image-upload"
                      type="file"
                      accept="image/*"
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
                      Selecionar imagem
                    </Button>

                    {valores.imagemFundo && (
                      <div className="rounded-[1rem] border border-border/70 bg-background/70 p-2.5 dark:border-dark-5/30 dark:bg-dark-1/60">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={valores.imagemFundo || "/placeholder.svg"}
                            alt="Preview da imagem de fundo"
                            className="h-10 w-10 rounded-md border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-medium text-foreground">Imagem carregada</p>
                            <p className="text-[11px] text-muted-foreground">Base visual do wrapper.</p>
                          </div>
                          <Button variant="outline" size="icon" onClick={onRemoveBackgroundImage} className="rounded-full h-8 w-8">
                            <LocalIcon name="trash" className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </StudioSection>

              {/* Frame */}
              <StudioSection
                active={valores.habilitarCustomizacaoFrame}
                icon="frame"
                title={copy.frameTitle}
                description="Bordas extras e textos de apoio para composicoes promocionais"
                accentClassName="border-emerald-300/50 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Molduras alteram o wrapper visual do preview.
                  </div>
                  <Switch
                    id="enable-frame"
                    checked={valores.habilitarCustomizacaoFrame}
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
                        Tipo de moldura
                      </Label>
                      <Select
                        value={valores.tipoFrameSelecionado}
                        onValueChange={(value) => onChange("tipoFrameSelecionado", value as TipoFrame)}
                      >
                        <SelectTrigger id="frame-type" className="h-9 text-[12px]">
                          <SelectValue placeholder="Selecione o tipo de moldura" />
                        </SelectTrigger>
                        <SelectContent>
                          {frameOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(valores.tipoFrameSelecionado === "textBottom" ||
                      valores.tipoFrameSelecionado === "roundedBorderTextBottom" ||
                      valores.tipoFrameSelecionado === "topBottomText" ||
                      valores.tipoFrameSelecionado === "decorativeBorder") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="frame-text" className="text-[12px] font-medium text-foreground">
                          Texto da moldura
                        </Label>
                        <Input
                          id="frame-text"
                          type="text"
                          value={valores.textoFrame}
                          onChange={(event) => onChange("textoFrame", event.target.value)}
                          placeholder="Digite o texto da moldura"
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
                title={copy.templatesTitle}
                description="Salve combinacoes completas de cor, logo, fundo e moldura"
                accentClassName="border-amber-300/50 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-950/10"
              >
                <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    type="text"
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    placeholder="Nome do template"
                    className="h-10 text-[12px]"
                  />
                  <Button type="button" onClick={handleSaveTemplate} className="h-10 gap-2.5 px-4 text-[12px]">
                    <LocalIcon name="plus" className="h-3.5 w-3.5" />
                    {copy.saveTheme}
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
                              Atualizado em {formatTemplateDate(template.updatedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-5 w-5 rounded-full border border-border/60"
                              style={{ backgroundColor: template.corFrente }}
                            />
                            <span
                              className="h-5 w-5 rounded-full border border-border/60"
                              style={{ backgroundColor: template.corFundo }}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="normal-case tracking-normal">
                            {template.tamanho}px
                          </Badge>
                          <Badge variant="outline" className="normal-case tracking-normal">
                            Correcao {template.nivel}
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
                              Fundo
                            </Badge>
                          )}
                          {template.habilitarCustomizacaoFrame &&
                            template.tipoFrameSelecionado &&
                            template.tipoFrameSelecionado !== "none" && (
                              <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                                <LocalIcon name="frame" className="h-3 w-3" />
                                Moldura
                              </Badge>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onApplyVisualTemplate(template)}
                            className="h-9 gap-1.5 text-[11px]"
                          >
                            <LocalIcon name="check" className="h-3.5 w-3.5" />
                            {copy.apply}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onSaveVisualTemplate(template.name, template.id)}
                            className="h-9 gap-1.5 text-[11px]"
                          >
                            <LocalIcon name="reset" className="h-3.5 w-3.5" />
                            {copy.update}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onDeleteVisualTemplate(template.id)}
                            className="h-9 gap-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <LocalIcon name="trash" className="h-3.5 w-3.5" />
                            {copy.remove}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-border/70 bg-background/50 px-4 py-4 text-center dark:border-dark-5/30 dark:bg-dark-1/40">
                    <p className="text-[12px] font-medium text-foreground">{copy.emptyTemplate}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {copy.emptyTemplateDescription}
                    </p>
                  </div>
                )}
              </StudioSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
