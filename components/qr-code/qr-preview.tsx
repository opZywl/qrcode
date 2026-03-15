"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"
import type { TipoFrame, TipoConteudoQR } from "@/hooks/use-qr-code-state"

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
  tipoConteudo?: TipoConteudoQR
  whatsappGroupMensagem?: string
  isMobile: boolean
  language?: AppLanguage
  onDownload: (formato: "png" | "svg") => void
  onCopy: () => Promise<void> | void
  onShare: () => Promise<void> | void
}

export function QrPreview({
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
  tipoConteudo,
  whatsappGroupMensagem,
  isMobile,
  onDownload,
  onCopy,
  onShare,
}: PreviewQRCodeProps) {
  const qrCanvasRef = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle")

  const qrConfig = useMemo(() => {
    const displaySize = Math.min(tamanho, isMobile ? 214 : 272)
    const useActualBackground = Boolean(habilitarCustomizacaoFundo && imagemFundo)
    const qrCanvasActualBgColor = useActualBackground ? "transparent" : corFundo
    const logoActuallyActive = Boolean(habilitarCustomizacaoLogo && logoDataUri)
    const frameActive = Boolean(habilitarCustomizacaoFrame && tipoFrameSelecionado !== "none")

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
    const frameSize = frameActive ? displaySize + 72 : displaySize
    const framePadding = frameActive ? 36 : 0

    const getQrWrapperStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
        padding: frameActive ? `${framePadding}px` : "0px",
        border: frameActive ? "1.5px solid hsl(var(--primary) / 0.3)" : "1px solid hsl(var(--border) / 0.82)",
        borderRadius: frameActive && tipoFrameSelecionado.includes("rounded") ? "24px" : "20px",
        display: "inline-block",
        position: "relative",
        backgroundColor: frameActive
          ? "hsl(var(--background))"
          : qrConfig.useActualBackground
            ? "transparent"
            : corFundo,
        boxShadow: frameActive
          ? "0 30px 70px -34px rgba(15, 23, 42, 0.42)"
          : "0 24px 60px -38px rgba(15, 23, 42, 0.3)",
        width: frameActive ? `${frameSize}px` : "auto",
        height: frameActive ? `${frameSize}px` : "auto",
        transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden",
      }

      if (qrConfig.useActualBackground && !frameActive) {
        style.backgroundImage = `url(${imagemFundo})`
        style.backgroundSize = "cover"
        style.backgroundPosition = "center"
      }

      return style
    }

    return { getQrWrapperStyle }
  }, [qrConfig, tipoFrameSelecionado, corFundo, imagemFundo])

  const customizations = useMemo(() => {
    const values: Array<{ label: string; icon: string }> = []

    if (qrConfig.logoActuallyActive) values.push({ label: "Logo", icon: "image-plus" })
    if (qrConfig.useActualBackground) values.push({ label: "Fundo", icon: "image" })
    if (qrConfig.frameActive) values.push({ label: "Moldura", icon: "frame" })

    return values
  }, [qrConfig])

  const qrCanvasWrapperStyle: React.CSSProperties = {
    backgroundColor: qrConfig.qrCanvasActualBgColor,
    display: "inline-block",
    maxWidth: "100%",
    borderRadius: qrConfig.frameActive ? "16px" : "18px",
    padding: "0px",
    position: qrConfig.frameActive ? "relative" : "static",
    overflow: "hidden",
  }

  const logoImageSettings =
    qrConfig.logoActuallyActive && logoDataUri
      ? {
          src: logoDataUri,
          height: qrConfig.displaySize * logoTamanhoRatio,
          width: qrConfig.displaySize * logoTamanhoRatio,
          excavate: escavarLogo,
        }
      : undefined

  const exportLogoImageSettings =
    qrConfig.logoActuallyActive && logoDataUri
      ? {
          src: logoDataUri,
          height: tamanho * logoTamanhoRatio,
          width: tamanho * logoTamanhoRatio,
          excavate: escavarLogo,
        }
      : undefined

  const handleCopy = async () => {
    try {
      await Promise.resolve(onCopy())
      setCopyStatus("success")
    } catch {
      setCopyStatus("error")
    } finally {
      window.setTimeout(() => setCopyStatus("idle"), 2200)
    }
  }

  const renderFrameText = () => {
    if (!qrConfig.frameActive) {
      return null
    }

    const text = tipoFrameSelecionado === "scanMeBottom" ? "SCAN ME" : textoFrame || "QR CODE"

    const bottomChip = (
      <div className="absolute inset-x-0 bottom-3 text-center">
        <span className="portfolio-chip bg-background/90 text-foreground">{text}</span>
      </div>
    )

    switch (tipoFrameSelecionado) {
      case "scanMeBottom":
        return (
          <div className="absolute inset-x-0 bottom-3 text-center">
            <span className="portfolio-chip bg-background/90 text-foreground">
              <LocalIcon name="scan" className="h-3 w-3" />
              SCAN ME
            </span>
          </div>
        )
      case "topBottomText":
        return (
          <>
            <div className="absolute inset-x-0 top-3 text-center">
              <span className="portfolio-chip bg-background/90 text-foreground">QR CODE</span>
            </div>
            {bottomChip}
          </>
        )
      case "decorativeBorder":
        return (
          <>
            <div className="absolute left-2 top-2 h-5 w-5 rounded-tl-xl border-l-2 border-t-2 border-primary" />
            <div className="absolute right-2 top-2 h-5 w-5 rounded-tr-xl border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-2 left-2 h-5 w-5 rounded-bl-xl border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-2 right-2 h-5 w-5 rounded-br-xl border-b-2 border-r-2 border-primary" />
            {bottomChip}
          </>
        )
      case "modernFrame":
        return <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/12 to-transparent" />
      case "classicFrame":
        return <div className="pointer-events-none absolute inset-[10px] rounded-[22px] border-2 border-double border-primary/30" />
      case "textBottom":
      case "roundedBorderTextBottom":
        return bottomChip
      default:
        return null
    }
  }

  const statItems = [
    { label: "Tamanho", value: `${tamanho}px`, icon: "size" },
    { label: "Correcao", value: nivelCorrecaoErro, icon: "shield" },
    { label: "Margem", value: `${zonaQuieta}`, icon: "frame" },
    { label: "Export", value: "PNG / SVG", icon: "download" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="space-y-1.5">
          <div className="portfolio-chip w-fit">
            <LocalIcon name="eye" className="h-3 w-3" />
            Preview
          </div>
          <div>
            <h3 className="font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">
              QR Output
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Visual final com exportacao pronta em PNG e SVG.
            </p>
          </div>
        </div>

        {customizations.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {customizations.map((customization) => (
              <Badge key={customization.label} variant="outline" className="gap-2">
                <LocalIcon name={customization.icon} className="h-3 w-3" />
                {customization.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {qrValue ? (
        <>
          <div className="studio-tile">
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Conteudo codificado
            </Label>
            <p
              className="relative z-[1] rounded-[1rem] border border-border/70 bg-background/80 px-3.5 py-2.5 font-mono text-[13px] text-foreground shadow-inner dark:border-dark-5/30 dark:bg-dark-1/70 sm:text-sm"
              title={qrValue}
            >
              {qrValue}
            </p>
          </div>

          <div className="flex justify-center">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              data-qr-export-root
            >
              <div className="qr-code-outer-wrapper" style={frameStyles.getQrWrapperStyle()}>
                <div ref={qrCanvasRef} className="qr-code-canvas-wrapper" style={qrCanvasWrapperStyle}>
                  <QRCodeCanvas
                    id="qr-preview-canvas"
                    value={qrValue}
                    size={qrConfig.displaySize}
                    fgColor={corFrente}
                    bgColor={qrConfig.qrCanvasActualBgColor}
                    level={nivelCorrecaoErro}
                    marginSize={zonaQuieta}
                    includeMargin={true}
                    imageSettings={logoImageSettings}
                    style={{ display: "block", height: "auto", maxWidth: "100%" }}
                  />
                </div>

                <div className="hidden">
                  <QRCodeCanvas
                    id="qr-export-canvas"
                    value={qrValue}
                    size={tamanho}
                    fgColor={corFrente}
                    bgColor={qrConfig.qrCanvasActualBgColor}
                    level={nivelCorrecaoErro}
                    marginSize={zonaQuieta}
                    includeMargin={true}
                    imageSettings={exportLogoImageSettings}
                  />
                  <QRCodeSVG
                    id="qr-export-svg"
                    value={qrValue}
                    size={tamanho}
                    fgColor={corFrente}
                    bgColor={corFundo}
                    level={nivelCorrecaoErro}
                    marginSize={zonaQuieta}
                    includeMargin={true}
                    imageSettings={exportLogoImageSettings}
                  />
                </div>

                {renderFrameText()}

                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[14%] top-6 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent"
                  animate={{ y: [0, qrConfig.displaySize * 0.72, 0], opacity: [0.12, 0.52, 0.12] }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 + index * 0.03 }}
                className="studio-tile !px-3 !py-2.5"
              >
                <div className="relative z-[1] flex items-center gap-2">
                  <span className="studio-icon-shell h-7 w-7 rounded-full">
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {tipoConteudo === "whatsappGroup" && whatsappGroupMensagem && whatsappGroupMensagem.trim() && (
            <div className="studio-tile border-emerald-400/30 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-950/10">
              <div className="relative z-[1]">
                <div className="mb-3 flex items-center gap-2">
                  <LocalIcon name="whatsapp" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  <Label className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    Mensagem de boas-vindas
                  </Label>
                </div>
                <div className="rounded-[1rem] border border-emerald-300/30 bg-white/80 p-3 dark:border-emerald-500/20 dark:bg-dark-1/70">
                  <p className="whitespace-pre-wrap font-mono text-sm text-foreground">{whatsappGroupMensagem}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full gap-2.5">
                  <span className="studio-icon-shell h-6 w-6 rounded-full">
                    <LocalIcon name="download" className="h-3.5 w-3.5 text-primary" />
                  </span>
                  Baixar QR Code
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className={isMobile ? "w-[calc(100vw-4rem)]" : ""}>
                <DropdownMenuItem onClick={() => onDownload("png")} className="cursor-pointer gap-2">
                  <LocalIcon name="image" className="h-4 w-4" />
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload("svg")} className="cursor-pointer gap-2">
                  <LocalIcon name="frame" className="h-4 w-4" />
                  SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 gap-2.5" onClick={handleCopy}>
                <span className="studio-icon-shell h-6 w-6 rounded-full">
                  <LocalIcon name="copy" className="h-3.5 w-3.5 text-primary" />
                </span>
                {copyStatus === "idle" && "Copiar"}
                {copyStatus === "success" && "Copiado!"}
                {copyStatus === "error" && "Erro"}
              </Button>

              <Button variant="outline" className="h-10 gap-2.5" onClick={() => void Promise.resolve(onShare())}>
                <span className="studio-icon-shell h-6 w-6 rounded-full">
                  <LocalIcon name="share" className="h-3.5 w-3.5 text-primary" />
                </span>
                Compartilhar
              </Button>
            </div>
          </div>

          {(qrConfig.logoActuallyActive || qrConfig.useActualBackground) && (
            <div className="rounded-[1.4rem] border border-amber-400/30 bg-amber-50/70 px-4 py-3 text-center text-xs text-amber-700 dark:border-amber-400/20 dark:bg-amber-950/10 dark:text-amber-300">
              Personalizacoes visuais podem afetar a leitura. Teste o QR Code antes de publicar.
            </div>
          )}
        </>
      ) : (
          <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="studio-tile flex min-h-[260px] flex-col items-center justify-center px-5 py-6 text-center"
        >
          <div className="studio-icon-shell mb-3.5 h-12 w-12 rounded-full animate-float-soft">
            <LocalIcon name="image" className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="font-glancyr700 text-[1.05rem] uppercase tracking-tight text-foreground">Nada gerado ainda</h4>
          <p className="mt-1.5 max-w-sm text-[12px] text-muted-foreground">
            Preencha os campos, ajuste o visual e gere o QR Code para ver o preview final aqui.
          </p>
        </motion.div>
      )}
    </div>
  )
}
