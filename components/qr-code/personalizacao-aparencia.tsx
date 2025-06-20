"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Palette,
  RefreshCw,
  ShieldCheck,
  Maximize,
  ImageIcon,
  ImagePlus,
  Trash2,
  Frame,
  Upload,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { NivelCorrecaoErro, TipoFrame } from "@/hooks/use-qr-code-state"

interface PersonalizacaoAparenciaProps {
  valores: any
  onChange: (campo: string, valor: any) => void
  onReset: () => void
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBackgroundImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveBackgroundImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  backgroundImageInputRef: React.RefObject<HTMLInputElement>
  isMobile: boolean
}

export function PersonalizacaoAparencia({
  valores,
  onChange,
  onReset,
  onLogoUpload,
  onBackgroundImageUpload,
  onRemoveBackgroundImage,
  fileInputRef,
  backgroundImageInputRef,
  isMobile,
}: PersonalizacaoAparenciaProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-0 h-auto hover:bg-transparent bg-transparent border-none text-left"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/20">
              <Settings2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-headline text-foreground">Personalizar Aparência</h3>
              <p className="text-xs text-muted-foreground">Customize cores, tamanho e elementos visuais</p>
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Resetar
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Configurações básicas */}
          <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fg-color" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Cor do QR Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="fg-color"
                      type="color"
                      value={valores.corFrente}
                      onChange={(e) => onChange("corFrente", e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer border-2 hover:border-primary/50 transition-all duration-200"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-color" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-current" />
                    Cor de Fundo
                  </Label>
                  <div className="relative">
                    <Input
                      id="bg-color"
                      type="color"
                      value={valores.corFundo}
                      onChange={(e) => onChange("corFundo", e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer border-2 hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        (valores.habilitarCustomizacaoFundo && !!valores.imagemFundo) ||
                        (valores.habilitarCustomizacaoFrame && valores.tipoFrameSelecionado !== "none")
                      }
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                  {((valores.habilitarCustomizacaoFundo && !!valores.imagemFundo) ||
                    (valores.habilitarCustomizacaoFrame && valores.tipoFrameSelecionado !== "none")) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Desabilitado quando há imagem de fundo ou frame
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="size-slider" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-primary" />
                    Tamanho
                  </Label>
                  <Badge variant="secondary" className="font-mono">
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
                  className="transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="error-correction"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Correção de Erro
                  </Label>
                  <Select
                    onValueChange={(value) => onChange("nivelCorrecaoErro", value as NivelCorrecaoErro)}
                    value={valores.nivelCorrecaoErro}
                  >
                    <SelectTrigger
                      id="error-correction"
                      className="text-sm h-10 border-2 hover:border-primary/50 transition-all duration-200"
                    >
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
                    <div className="w-4 h-4 border-2 border-dashed border-current rounded" />
                    Margem
                  </Label>
                  <Input
                    id="quiet-zone"
                    type="number"
                    min="0"
                    max="40"
                    value={valores.zonaQuieta}
                    onChange={(e) => onChange("zonaQuieta", Number(e.target.value))}
                    className="h-10 border-2 hover:border-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="Tamanho da margem"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Personalizado */}
          <Card
            className={`transition-all duration-300 ${valores.habilitarCustomizacaoLogo ? "ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${valores.habilitarCustomizacaoLogo ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" : "bg-muted"}`}
                  >
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Logo Personalizado</h4>
                    <p className="text-xs text-muted-foreground">Adicione seu logo no centro do QR Code</p>
                  </div>
                </div>
                <Switch
                  id="enable-logo"
                  checked={valores.habilitarCustomizacaoLogo}
                  onCheckedChange={(checked) => {
                    onChange("habilitarCustomizacaoLogo", checked)
                    if (!checked) {
                      onChange("logoDataUri", "")
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }
                  }}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                />
              </div>

              {valores.habilitarCustomizacaoLogo && (
                <div className="space-y-4 border-l-4 border-gradient-to-b from-purple-500 to-pink-500 pl-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload" className="text-sm font-medium text-foreground">
                      Upload de Logo
                    </Label>
                    <div className="relative">
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
                        className="w-full h-12 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="text-purple-700 dark:text-purple-300">Selecionar Logo</span>
                      </Button>
                    </div>

                    {valores.logoDataUri && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                        <img
                          src={valores.logoDataUri || "/placeholder.svg"}
                          alt="Preview do logo"
                          className="h-12 w-12 object-contain border rounded-md bg-white"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Logo carregado</p>
                          <p className="text-xs text-muted-foreground">Ajuste o tamanho abaixo</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo-size-ratio" className="text-sm font-medium text-foreground">
                        Tamanho do Logo
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo-size-ratio"
                          type="number"
                          min="5"
                          max="40"
                          step="1"
                          value={Math.round(valores.logoTamanhoRatio * 100)}
                          onChange={(e) => onChange("logoTamanhoRatio", Number.parseFloat(e.target.value) / 100)}
                          disabled={!valores.logoDataUri}
                          className="h-9"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="excavate-logo"
                        checked={valores.escavarLogo}
                        onCheckedChange={(checked) => onChange("escavarLogo", checked as boolean)}
                        disabled={!valores.logoDataUri}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor="excavate-logo" className="text-sm font-medium text-foreground">
                        Escavar área do QR Code
                      </Label>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-4 border-purple-500/30">
                    Remove os pontos do QR Code por trás do logo para melhor visibilidade
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fundo Personalizado */}
          <Card
            className={`transition-all duration-300 ${valores.habilitarCustomizacaoFundo ? "ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${valores.habilitarCustomizacaoFundo ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white" : "bg-muted"}`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Fundo Personalizado</h4>
                    <p className="text-xs text-muted-foreground">Use uma imagem como fundo do QR Code</p>
                  </div>
                </div>
                <Switch
                  id="enable-background"
                  checked={valores.habilitarCustomizacaoFundo}
                  onCheckedChange={(checked) => {
                    onChange("habilitarCustomizacaoFundo", checked)
                    if (!checked) {
                      onChange("imagemFundo", "")
                      if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = ""
                    }
                  }}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                />
              </div>

              {valores.habilitarCustomizacaoFundo && (
                <div className="space-y-4 border-l-4 border-gradient-to-b from-blue-500 to-cyan-500 pl-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-image-upload" className="text-sm font-medium text-foreground">
                      Upload de Imagem de Fundo
                    </Label>
                    <div className="relative">
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
                        className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-blue-700 dark:text-blue-300">Selecionar Imagem</span>
                      </Button>
                    </div>

                    {valores.imagemFundo && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                        <img
                          src={valores.imagemFundo || "/placeholder.svg"}
                          alt="Preview da imagem de fundo"
                          className="h-12 w-12 object-cover border rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Imagem carregada</p>
                          <p className="text-xs text-muted-foreground">Será usada como fundo do QR Code</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onRemoveBackgroundImage}
                          className="text-destructive hover:bg-destructive/10 hover:border-destructive/50 border-destructive/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moldura Personalizada */}
          <Card
            className={`transition-all duration-300 ${valores.habilitarCustomizacaoFrame ? "ring-2 ring-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${valores.habilitarCustomizacaoFrame ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white" : "bg-muted"}`}
                  >
                    <Frame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Moldura Personalizada</h4>
                    <p className="text-xs text-muted-foreground">Adicione bordas e texto ao QR Code</p>
                  </div>
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
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                />
              </div>

              {valores.habilitarCustomizacaoFrame && (
                <div className="space-y-4 border-l-4 border-gradient-to-b from-green-500 to-emerald-500 pl-4">
                  <div className="space-y-2">
                    <Label htmlFor="frame-type" className="text-sm font-medium text-foreground">
                      Tipo de Moldura
                    </Label>
                    <Select
                      value={valores.tipoFrameSelecionado}
                      onValueChange={(value) => onChange("tipoFrameSelecionado", value as TipoFrame)}
                    >
                      <SelectTrigger
                        id="frame-type"
                        className="text-sm h-10 border-2 hover:border-green-500/50 transition-all duration-200"
                      >
                        <SelectValue placeholder="Selecione o tipo de moldura" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-dashed border-muted-foreground rounded" />
                            Nenhuma
                          </div>
                        </SelectItem>
                        <SelectItem value="simpleBorder" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current rounded" />
                            Borda Simples
                          </div>
                        </SelectItem>
                        <SelectItem value="textBottom" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-current rounded flex items-end justify-center text-[6px]">
                              T
                            </div>
                            Texto na Parte Inferior
                          </div>
                        </SelectItem>
                        <SelectItem value="scanMeBottom" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-current rounded flex items-end justify-center text-[6px]">
                              S
                            </div>
                            "SCAN ME" na Parte Inferior
                          </div>
                        </SelectItem>
                        <SelectItem value="roundedBorderTextBottom" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current rounded-full flex items-end justify-center text-[6px]">
                              T
                            </div>
                            Borda Arredondada com Texto
                          </div>
                        </SelectItem>
                        <SelectItem value="topBottomText" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-current rounded flex flex-col items-center justify-between text-[4px] py-0.5">
                              <span>T</span>
                              <span>B</span>
                            </div>
                            Texto Superior e Inferior
                          </div>
                        </SelectItem>
                        <SelectItem value="decorativeBorder" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-current rounded relative">
                              <div className="absolute top-0 left-0 w-1 h-1 border-l border-t border-current"></div>
                              <div className="absolute top-0 right-0 w-1 h-1 border-r border-t border-current"></div>
                              <div className="absolute bottom-0 left-0 w-1 h-1 border-l border-b border-current"></div>
                              <div className="absolute bottom-0 right-0 w-1 h-1 border-r border-b border-current"></div>
                            </div>
                            Bordas Decorativas
                          </div>
                        </SelectItem>
                        <SelectItem value="modernFrame" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current rounded-lg bg-gradient-to-br from-transparent to-current/10"></div>
                            Moldura Moderna
                          </div>
                        </SelectItem>
                        <SelectItem value="classicFrame" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-4 border-double border-current rounded"></div>
                            Moldura Clássica
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(valores.tipoFrameSelecionado === "textBottom" ||
                    valores.tipoFrameSelecionado === "roundedBorderTextBottom" ||
                    valores.tipoFrameSelecionado === "topBottomText" ||
                    valores.tipoFrameSelecionado === "decorativeBorder") && (
                    <div className="space-y-2">
                      <Label htmlFor="frame-text" className="text-sm font-medium text-foreground">
                        Texto da Moldura
                      </Label>
                      <Input
                        id="frame-text"
                        type="text"
                        value={valores.textoFrame}
                        onChange={(e) => onChange("textoFrame", e.target.value)}
                        placeholder="Digite o texto da moldura"
                        className="h-10 border-2 hover:border-green-500/50 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-muted/30 rounded border-l-4 border-green-500/30">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Dica:</strong> Molduras podem afetar a escaneabilidade do QR Code. Use cores
                      contrastantes e teste sempre.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
