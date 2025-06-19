"use client"

import type React from "react"

import { useRef, useMemo } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, ClipboardCopy, Share2, ImageIcon, FileJson, Sparkles, Eye, Zap } from "lucide-react"
import type { TipoFrame } from "@/hooks/use-qr-code-state"

interface PreviewQRCodeProps {
  qrValue: string
  corFrente: string
  corFundo: string
  tamanho: number
  nivelCorrecaoErro: "L" | "M" | "Q" | "H"
  zonaQuieta: number
  logoDataUri?: string
  logoTamanhoRatio?: number
  escavarLogo?: boolean
  imagemFundo?: string
  habilitarCustomizacaoLogo?: boolean
  habilitarCustomizacaoFundo?: boolean
  habilitarCustomizacaoFrame?: boolean
  tipoFrameSelecionado?: TipoFrame
  textoFrame?: string
  isMobile: boolean
  onDownload: (formato: "png" | "svg") => void
  onCopy: () => void
  onShare: () => void
}

export function PreviewQRCode({
  qrValue,
  corFrente,
  corFundo,
  tamanho,
  nivelCorrecaoErro,
  zonaQuieta,
  logoDataUri,
  logoTamanhoRatio = 0.2,
  escavarLogo = true,
  imagemFundo,
  habilitarCustomizacaoLogo,
  habilitarCustomizacaoFundo,
  habilitarCustomizacaoFrame,
  tipoFrameSelecionado = "none",
  textoFrame = "",
  isMobile,
  onDownload,
  onCopy,
  onShare,
}: PreviewQRCodeProps) {
  const qrCanvasRef = useRef<HTMLDivElement>(null)

  const qrConfig = useMemo(() => {
    const displaySize = Math.min(tamanho, isMobile ? 200 : 280)
    const useActualBackground = habilitarCustomizacaoFundo && imagemFundo
    const qrCanvasActualBgColor = useActualBackground ? "transparent" : corFundo
    const logoActuallyActive = habilitarCustomizacaoLogo && logoDataUri
    const frameActive = habilitarCustomizacaoFrame && tipoFrameSelecionado !== "none"

    return {
      displaySize,
      useActualBackground,
      qrCanvasActualBgColor,
      logoActuallyActive,
      frameActive,
    }
  }, [
    tamanho,
    isMobile,
    habilitarCustomizacaoFundo,
    imagemFundo,
    corFundo,
    habilitarCustomizacaoLogo,
    logoDataUri,
    habilitarCustomizacaoFrame,
    tipoFrameSelecionado,
  ])

  const frameStyles = useMemo(() => {
    const { frameActive, displaySize } = qrConfig
    const frameSize = frameActive ? displaySize + 80 : displaySize
    const framePadding = frameActive ? 40 : 0

    const getQrWrapperStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
        padding: frameActive ? `${framePadding}px` : "0px",
        border: frameActive ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
        borderRadius: frameActive && tipoFrameSelecionado?.includes("rounded") ? "20px" : "8px",
        display: "inline-block",
        position: "relative",
        backgroundColor: frameActive
          ? "hsl(var(--background))"
          : qrConfig.useActualBackground
            ? "transparent"
            : corFundo,
        boxShadow: frameActive
          ? "0 8px 32px rgba(0,0,0,0.1), 0 0 20px hsl(var(--primary) / 0.2)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        width: frameActive ? `${frameSize}px` : "auto",
        height: frameActive ? `${frameSize}px` : "auto",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }

      if (qrConfig.useActualBackground && !frameActive) {
        style.backgroundImage = `url(${imagemFundo})`
        style.backgroundSize = "cover"
        style.backgroundPosition = "center"
      }

      return style
    }

    return { getQrWrapperStyle, frameSize, framePadding }
  }, [qrConfig, tipoFrameSelecionado, corFundo, imagemFundo])

  if (!qrValue) {
    if (isMobile) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted h-64 w-full max-w-xs">
          <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Nenhum QR Code gerado</p>
          <p className="text-xs text-muted-foreground">Use o botão abaixo para criar um</p>
        </div>
      )
    }
    return null
  }

  const { displaySize, qrCanvasActualBgColor, logoActuallyActive, frameActive } = qrConfig

  const qrCanvasWrapperStyle: React.CSSProperties = {
    backgroundColor: qrCanvasActualBgColor,
    display: "inline-block",
    maxWidth: "100%",
    borderRadius: frameActive ? "4px" : "calc(0.375rem - 1px)",
    padding: "0px",
    position: frameActive ? "relative" : "static",
  }

  const renderFrameText = () => {
    if (!frameActive) return null

    const text = tipoFrameSelecionado === "scanMeBottom" ? "SCAN ME" : textoFrame || "QR CODE"

    const frameTextConfigs = {
      textBottom: {
        position: "bottom-2 left-0 right-0 text-center",
        content: (
          <span className="text-sm font-bold text-primary bg-background/90 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
            {text}
          </span>
        ),
      },
      scanMeBottom: {
        position: "bottom-2 left-0 right-0 text-center",
        content: (
          <span className="text-sm font-bold text-primary bg-background/90 px-3 py-1 rounded-full border border-primary/20 shadow-sm animate-pulse">
            <Zap className="w-3 h-3 inline mr-1" />
            SCAN ME
          </span>
        ),
      },
      roundedBorderTextBottom: {
        position: "bottom-2 left-0 right-0 text-center",
        content: (
          <span className="text-sm font-bold text-primary bg-background/90 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
            {text}
          </span>
        ),
      },
      topBottomText: {
        position: "",
        content: (
          <>
            <div className="absolute top-2 left-0 right-0 text-center">
              <span className="text-xs font-semibold text-primary bg-background/90 px-2 py-1 rounded border border-primary/20 shadow-sm">
                QR CODE
              </span>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs font-semibold text-primary bg-background/90 px-2 py-1 rounded border border-primary/20 shadow-sm">
                {text}
              </span>
            </div>
          </>
        ),
      },
      decorativeBorder: {
        position: "",
        content: (
          <>
            <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl-lg shadow-sm"></div>
            <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr-lg shadow-sm"></div>
            <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl-lg shadow-sm"></div>
            <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br-lg shadow-sm"></div>
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs font-bold text-primary bg-background/90 px-2 py-1 rounded border border-primary/20 shadow-sm">
                {text}
              </span>
            </div>
          </>
        ),
      },
      modernFrame: {
        position: "",
        content: (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
        ),
      },
      classicFrame: {
        position: "",
        content: (
          <div className="absolute inset-1 border-2 border-double border-primary/30 rounded-lg pointer-events-none" />
        ),
      },
    }

    const config = frameTextConfigs[tipoFrameSelecionado as keyof typeof frameTextConfigs]
    if (!config) return null

    if (config.position) {
      return <div className={`absolute ${config.position}`}>{config.content}</div>
    }

    return config.content
  }

  const getCustomizations = () => {
    const customizations = []
    if (logoActuallyActive) customizations.push("Logo")
    if (qrConfig.useActualBackground) customizations.push("Fundo")
    if (frameActive) customizations.push("Moldura")
    return customizations
  }

  const customizations = getCustomizations()

  return (
    <div className="mt-6 p-4 sm:p-6 border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-sm flex flex-col items-center space-y-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Header com informações */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold text-foreground">Preview do QR Code</Label>
          </div>
          {customizations.length > 0 && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <Badge variant="secondary" className="text-xs animate-pulse">
                {customizations.join(", ")}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3 border rounded-lg bg-muted/50 w-full transition-all duration-200 hover:bg-muted/70">
          <Label className="text-xs text-muted-foreground block mb-1">Conteúdo Codificado:</Label>
          <p
            className="text-sm font-mono break-all text-foreground bg-background/50 p-2 rounded border transition-all duration-200 hover:bg-background/70"
            title={qrValue}
          >
            {qrValue}
          </p>
        </div>
      </div>

      {/* QR Code com moldura */}
      <div className="relative transition-all duration-300 hover:scale-105">
        <div className="qr-code-outer-wrapper" style={frameStyles.getQrWrapperStyle()}>
          <div ref={qrCanvasRef} className="qr-code-canvas-wrapper" style={qrCanvasWrapperStyle}>
            <QRCodeCanvas
              value={qrValue}
              size={displaySize}
              fgColor={corFrente}
              bgColor={qrCanvasActualBgColor}
              level={nivelCorrecaoErro}
              margin={zonaQuieta}
              includeMargin={true}
              imageSettings={
                logoActuallyActive
                  ? {
                      src: logoDataUri,
                      height: displaySize * logoTamanhoRatio,
                      width: displaySize * logoTamanhoRatio,
                      excavate: escavarLogo,
                    }
                  : undefined
              }
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          </div>
          {renderFrameText()}
        </div>
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-muted/30 rounded border transition-all duration-200 hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Tamanho</p>
          <p className="text-sm font-semibold text-foreground">{tamanho}px</p>
        </div>
        <div className="p-2 bg-muted/30 rounded border transition-all duration-200 hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Correção</p>
          <p className="text-sm font-semibold text-foreground">{nivelCorrecaoErro}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded border transition-all duration-200 hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Margem</p>
          <p className="text-sm font-semibold text-foreground">{zonaQuieta}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded border transition-all duration-200 hover:bg-muted/50">
          <p className="text-xs text-muted-foreground">Formato</p>
          <p className="text-sm font-semibold text-foreground">PNG/SVG</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-primary/40 hover:border-primary/70 hover:bg-primary/10 transition-all duration-200 bg-gradient-to-r from-background to-muted/30 hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">Baixar QR Code</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className={isMobile ? "w-[calc(100vw-4rem)]" : ""}>
            <DropdownMenuItem onClick={() => onDownload("png")} className="cursor-pointer">
              <ImageIcon className="w-4 h-4 mr-2" />
              <span>PNG (Recomendado)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload("svg")} className="cursor-pointer">
              <FileJson className="w-4 h-4 mr-2" />
              <span>SVG (Vetorial)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(qrValue)

                const button = document.activeElement as HTMLButtonElement
                if (button) {
                  const originalContent = button.innerHTML
                  const originalClassName = button.className

                  button.innerHTML = `
                    <div class="flex items-center justify-center w-full">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="font-medium">Copiado!</span>
                    </div>
                  `
                  button.className =
                    "h-12 border-2 border-green-500 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 dark:border-green-400 transition-all duration-300 rounded-lg shadow-md"

                  setTimeout(() => {
                    button.innerHTML = originalContent
                    button.className = originalClassName
                  }, 2500)
                }
              } catch (error) {
                console.error("Erro ao copiar:", error)

                const button = document.activeElement as HTMLButtonElement
                if (button) {
                  const originalContent = button.innerHTML
                  const originalClassName = button.className

                  button.innerHTML = `
                    <div class="flex items-center justify-center w-full">
                      <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span class="font-medium">Erro!</span>
                    </div>
                  `
                  button.className =
                    "h-12 border-2 border-red-500 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 dark:border-red-400 transition-all duration-300 rounded-lg shadow-md"

                  setTimeout(() => {
                    button.innerHTML = originalContent
                    button.className = originalClassName
                  }, 2500)
                }

                try {
                  const textArea = document.createElement("textarea")
                  textArea.value = qrValue
                  textArea.style.position = "fixed"
                  textArea.style.left = "-999999px"
                  textArea.style.top = "-999999px"
                  document.body.appendChild(textArea)
                  textArea.focus()
                  textArea.select()
                  document.execCommand("copy")
                  document.body.removeChild(textArea)

                  const button = document.activeElement as HTMLButtonElement
                  if (button) {
                    const originalContent = button.innerHTML
                    const originalClassName = button.className

                    button.innerHTML = `
                      <div class="flex items-center justify-center w-full">
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span class="font-medium">Copiado!</span>
                      </div>
                    `
                    button.className =
                      "h-12 border-2 border-green-500 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 dark:border-green-400 transition-all duration-300 rounded-lg shadow-md"

                    setTimeout(() => {
                      button.innerHTML = originalContent
                      button.className = originalClassName
                    }, 2500)
                  }
                } catch (fallbackError) {
                  alert(`Copie manualmente: ${qrValue}`)
                }
              }
            }}
            variant="outline"
            className="h-12 border-2 border-blue-400/40 hover:border-blue-500/70 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 hover:scale-105"
          >
            <ClipboardCopy className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Copiar</span>
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            className="h-12 border-2 border-green-400/40 hover:border-green-500/70 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 hover:scale-105"
          >
            <Share2 className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            <span className="font-medium">Compartilhar</span>
          </Button>
        </div>
      </div>

      {(logoActuallyActive || qrConfig.useActualBackground) && (
        <div className="w-full p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg transition-all duration-200 hover:bg-amber-100 dark:hover:bg-amber-950/30">
          <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
            ⚠️ Personalizações podem afetar a leitura do QR Code. Teste antes de usar.
          </p>
        </div>
      )}
    </div>
  )
}
