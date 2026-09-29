"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { m } from "framer-motion"
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Label } from "@/components/ui/label"
import { LocalIcon } from "@/components/ui/local-icon"
import { toast } from "@/hooks/use-toast"
import { QR_BYTE_CAPACITY, fitsInQr } from "@/lib/qr/payload"
import { isSafeImageDataUrl } from "@/lib/qr/storage"
import type { NivelCorrecaoErro, TipoConteudoQR, TipoFrame } from "@/lib/qr/types"

interface QrPreviewProps {
  qrValue: string
  qrTipo: TipoConteudoQR | null
  corFrente: string
  corFundo: string
  tamanho: number
  nivelCorrecaoErro: NivelCorrecaoErro
  zonaQuieta: number
  logoDataUri: string
  logoTamanhoRatio: number
  escavarLogo: boolean
  imagemFundo: string
  habilitarCustomizacaoLogo: boolean
  habilitarCustomizacaoFundo: boolean
  habilitarCustomizacaoFrame: boolean
  tipoFrameSelecionado: TipoFrame
  textoFrame: string
  whatsappGroupMensagem: string
  isMobile: boolean
  onDownload: (format: "png" | "svg") => void
  onCopy: () => Promise<boolean>
  onShare: () => Promise<void>
}

export function QrPreview({
  qrValue,
  qrTipo,
  corFrente,
  corFundo,
  tamanho,
  nivelCorrecaoErro,
  zonaQuieta,
  logoDataUri,
  logoTamanhoRatio,
  escavarLogo,
  imagemFundo,
  habilitarCustomizacaoLogo,
  habilitarCustomizacaoFundo,
  habilitarCustomizacaoFrame,
  tipoFrameSelecionado,
  textoFrame,
  whatsappGroupMensagem,
  isMobile,
  onDownload,
  onCopy,
  onShare,
}: QrPreviewProps) {
  const { t } = useLanguage()
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle")

  const config = useMemo(() => {
    const displaySize = Math.min(tamanho, isMobile ? 214 : 272)
    const useBackgroundImage = habilitarCustomizacaoFundo && isSafeImageDataUrl(imagemFundo)
    return {
      displaySize,
      useBackgroundImage,
      canvasBackground: useBackgroundImage ? "transparent" : corFundo,
      logoActive: habilitarCustomizacaoLogo && isSafeImageDataUrl(logoDataUri),
      frameActive: habilitarCustomizacaoFrame && tipoFrameSelecionado !== "none",
    }
  }, [corFundo, habilitarCustomizacaoFrame, habilitarCustomizacaoFundo, habilitarCustomizacaoLogo, imagemFundo, isMobile, logoDataUri, tamanho, tipoFrameSelecionado])

  const fits = qrValue ? fitsInQr(qrValue, nivelCorrecaoErro) : true
  const frameSize = config.frameActive ? config.displaySize + 72 : config.displaySize

  const wrapperStyle: React.CSSProperties = {
    padding: config.frameActive ? "36px" : "0px",
    border: config.frameActive ? "1.5px solid hsl(var(--primary) / 0.3)" : "1px solid hsl(var(--border) / 0.82)",
    borderRadius: config.frameActive && tipoFrameSelecionado.includes("rounded") ? "24px" : "20px",
    display: "inline-block",
    position: "relative",
    backgroundColor: config.frameActive ? "hsl(var(--background))" : config.useBackgroundImage ? "transparent" : corFundo,
    boxShadow: config.frameActive ? "0 30px 70px -34px rgba(15, 23, 42, 0.42)" : "0 24px 60px -38px rgba(15, 23, 42, 0.3)",
    width: config.frameActive ? `${frameSize}px` : "auto",
    height: config.frameActive ? `${frameSize}px` : "auto",
    transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
    overflow: "hidden",
    ...(config.useBackgroundImage && !config.frameActive
      ? { backgroundImage: `url("${imagemFundo}")`, backgroundSize: "cover", backgroundPosition: "center" }
      : {}),
  }

  const canvasWrapperStyle: React.CSSProperties = {
    backgroundColor: config.canvasBackground,
    display: "inline-block",
    maxWidth: "100%",
    borderRadius: config.frameActive ? "16px" : "18px",
    padding: "0px",
    position: config.frameActive ? "relative" : "static",
    overflow: "hidden",
  }

  const imageSettings = (size: number) =>
    config.logoActive
      ? { src: logoDataUri, height: size * logoTamanhoRatio, width: size * logoTamanhoRatio, excavate: escavarLogo }
      : undefined

  const customizations = [
    config.logoActive && { label: "Logo", icon: "image-plus" },
    config.useBackgroundImage && { label: t({ pt: "Fundo", en: "Background", es: "Fondo" }), icon: "image" },
    config.frameActive && { label: t({ pt: "Moldura", en: "Frame", es: "Marco" }), icon: "frame" },
  ].filter((item): item is { label: string; icon: string } => Boolean(item))

  const handleCopy = async () => {
    const copied = await onCopy()
    setCopyStatus(copied ? "success" : "error")
    window.setTimeout(() => setCopyStatus("idle"), 2200)
  }

  const handleCopyWelcome = async () => {
    try {
      await navigator.clipboard.writeText(whatsappGroupMensagem)
      toast({
        title: t({ pt: "Mensagem copiada", en: "Message copied", es: "Mensaje copiado" }),
        description: t({
          pt: "Cole no grupo depois de entrar.",
          en: "Paste it in the group after joining.",
          es: "Pégalo en el grupo después de entrar.",
        }),
      })
    } catch {
      toast({
        variant: "destructive",
        title: t({ pt: "Erro", en: "Error", es: "Error" }),
        description: t({ pt: "Não foi possível copiar.", en: "Could not copy.", es: "No se pudo copiar." }),
      })
    }
  }

  const renderFrameText = () => {
    if (!config.frameActive) {
      return null
    }

    const bottomChip = (
      <div className="absolute inset-x-0 bottom-3 text-center">
        <span className="portfolio-chip bg-background/90 text-foreground">{textoFrame || "QR CODE"}</span>
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
        return <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-br from-primary/12 to-transparent" />
      case "classicFrame":
        return <div className="pointer-events-none absolute inset-2.5 rounded-[22px] border-2 border-double border-primary/30" />
      case "textBottom":
      case "roundedBorderTextBottom":
        return bottomChip
      default:
        return null
    }
  }

  const tooLarge = (
    <div className="flex min-h-50 max-w-68 flex-col items-center justify-center gap-2 rounded-[20px] border border-amber-400/40 bg-amber-50/70 p-5 text-center text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
      <LocalIcon name="info" className="h-5 w-5" />
      {t({
        pt: `Conteúdo grande demais para a correção ${nivelCorrecaoErro} (máx. ${QR_BYTE_CAPACITY[nivelCorrecaoErro]} bytes). Reduza o texto ou escolha uma correção menor.`,
        en: `Content too large for ${nivelCorrecaoErro} correction (max ${QR_BYTE_CAPACITY[nivelCorrecaoErro]} bytes). Shorten it or pick a lower correction level.`,
        es: `Contenido demasiado grande para la corrección ${nivelCorrecaoErro} (máx. ${QR_BYTE_CAPACITY[nivelCorrecaoErro]} bytes). Acórtalo o elige una corrección menor.`,
      })}
    </div>
  )

  const statItems = [
    { label: t({ pt: "Tamanho", en: "Size", es: "Tamaño" }), value: `${tamanho}px`, icon: "size" },
    { label: t({ pt: "Correção", en: "Correction", es: "Corrección" }), value: nivelCorrecaoErro, icon: "shield" },
    { label: t({ pt: "Margem", en: "Margin", es: "Margen" }), value: `${zonaQuieta}`, icon: "frame" },
    { label: t({ pt: "Exportar", en: "Export", es: "Exportar" }), value: "PNG / SVG", icon: "download" },
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
            <h3 className="font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">QR Output</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {t({
                pt: "Visual final com exportação pronta em PNG e SVG.",
                en: "Final design ready to export as PNG and SVG.",
                es: "Diseño final listo para exportar en PNG y SVG.",
              })}
            </p>
          </div>
        </div>

        {customizations.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {customizations.map((customization) => (
              <Badge key={customization.icon} variant="outline" className="gap-2">
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
              {t({ pt: "Conteúdo codificado", en: "Encoded content", es: "Contenido codificado" })}
            </Label>
            <p
              className="relative z-1 max-h-32 overflow-y-auto whitespace-pre-wrap break-all rounded-2xl border border-border/70 bg-background/80 px-3.5 py-2.5 font-mono text-[13px] text-foreground shadow-inner dark:border-dark-5/30 dark:bg-dark-1/70 sm:text-sm"
              title={qrValue}
            >
              {qrValue}
            </p>
          </div>

          <div className="flex justify-center">
            {fits ? (
              <m.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
                data-qr-export-root
              >
                <ErrorBoundary fallback={tooLarge} resetKey={`${qrValue}|${nivelCorrecaoErro}|${config.logoActive}`}>
                  <div className="qr-code-outer-wrapper" style={wrapperStyle}>
                    <div className="qr-code-canvas-wrapper" style={canvasWrapperStyle}>
                      <QRCodeCanvas
                        id="qr-preview-canvas"
                        value={qrValue}
                        size={config.displaySize}
                        fgColor={corFrente}
                        bgColor={config.canvasBackground}
                        level={nivelCorrecaoErro}
                        marginSize={zonaQuieta}
                        imageSettings={imageSettings(config.displaySize)}
                        role="img"
                        aria-label={t({ pt: "QR Code gerado", en: "Generated QR code", es: "Código QR generado" })}
                        style={{ display: "block", height: "auto", maxWidth: "100%" }}
                      />
                    </div>

                    <div className="hidden" aria-hidden>
                      <QRCodeCanvas
                        id="qr-export-canvas"
                        value={qrValue}
                        size={tamanho}
                        fgColor={corFrente}
                        bgColor={config.canvasBackground}
                        level={nivelCorrecaoErro}
                        marginSize={zonaQuieta}
                        imageSettings={imageSettings(tamanho)}
                      />
                      <QRCodeSVG
                        id="qr-export-svg"
                        value={qrValue}
                        size={tamanho}
                        fgColor={corFrente}
                        bgColor={corFundo}
                        level={nivelCorrecaoErro}
                        marginSize={zonaQuieta}
                        imageSettings={imageSettings(tamanho)}
                      />
                    </div>

                    {renderFrameText()}

                    <m.div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-[14%] top-6 h-px bg-linear-to-r from-transparent via-primary/55 to-transparent"
                      animate={{ y: [0, config.displaySize * 0.72, 0], opacity: [0.12, 0.52, 0.12] }}
                      transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                  </div>
                </ErrorBoundary>
              </m.div>
            ) : (
              tooLarge
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <m.div
                key={item.icon}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 + index * 0.03 }}
                className="studio-tile px-3! py-2.5!"
              >
                <div className="relative z-1 flex items-center gap-2">
                  <span className="studio-icon-shell h-7 w-7 rounded-full">
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {qrTipo === "whatsappGroup" && whatsappGroupMensagem.trim() && (
            <div className="studio-tile border-emerald-400/30 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-950/10">
              <div className="relative z-1">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <LocalIcon name="whatsapp" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <Label className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      {t({ pt: "Mensagem de boas-vindas", en: "Welcome message", es: "Mensaje de bienvenida" })}
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleCopyWelcome()}
                    className="h-8 gap-1.5 rounded-full px-3 text-[11px] text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200"
                  >
                    <LocalIcon name="copy" className="h-3.5 w-3.5" />
                    {t({ pt: "Copiar", en: "Copy", es: "Copiar" })}
                  </Button>
                </div>
                <div className="rounded-2xl border border-emerald-300/30 bg-white/80 p-3 dark:border-emerald-500/20 dark:bg-dark-1/70">
                  <p className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-foreground">{whatsappGroupMensagem}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full gap-2.5" disabled={!fits}>
                  <span className="studio-icon-shell h-6 w-6 rounded-full">
                    <LocalIcon name="download" className="h-3.5 w-3.5 text-primary" />
                  </span>
                  {t({ pt: "Baixar QR Code", en: "Download QR code", es: "Descargar código QR" })}
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
              <Button variant="outline" className="h-10 gap-2.5" onClick={() => void handleCopy()} disabled={!fits}>
                <span className="studio-icon-shell h-6 w-6 rounded-full">
                  <LocalIcon name="copy" className="h-3.5 w-3.5 text-primary" />
                </span>
                {copyStatus === "idle" && t({ pt: "Copiar", en: "Copy", es: "Copiar" })}
                {copyStatus === "success" && t({ pt: "Copiado!", en: "Copied!", es: "¡Copiado!" })}
                {copyStatus === "error" && t({ pt: "Erro", en: "Error", es: "Error" })}
              </Button>

              <Button variant="outline" className="h-10 gap-2.5" onClick={() => void onShare()} disabled={!fits}>
                <span className="studio-icon-shell h-6 w-6 rounded-full">
                  <LocalIcon name="share" className="h-3.5 w-3.5 text-primary" />
                </span>
                {t({ pt: "Compartilhar", en: "Share", es: "Compartir" })}
              </Button>
            </div>
          </div>

          {(config.logoActive || config.useBackgroundImage) && (
            <div className="rounded-[1.4rem] border border-amber-400/30 bg-amber-50/70 px-4 py-3 text-center text-xs text-amber-700 dark:border-amber-400/20 dark:bg-amber-950/10 dark:text-amber-300">
              {t({
                pt: "Personalizações visuais podem afetar a leitura. Teste o QR Code antes de publicar.",
                en: "Visual customizations can affect scanning. Test the QR code before publishing.",
                es: "Las personalizaciones visuales pueden afectar la lectura. Prueba el código QR antes de publicarlo.",
              })}
            </div>
          )}
        </>
      ) : (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="studio-tile flex min-h-65 flex-col items-center justify-center px-5 py-6 text-center"
        >
          <div className="studio-icon-shell mb-3.5 h-12 w-12 animate-float-soft rounded-full">
            <LocalIcon name="image" className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="font-glancyr700 text-[1.05rem] uppercase tracking-tight text-foreground">
            {t({ pt: "Nada gerado ainda", en: "Nothing generated yet", es: "Nada generado todavía" })}
          </h4>
          <p className="mt-1.5 max-w-sm text-[12px] text-muted-foreground">
            {t({
              pt: "Preencha os campos, ajuste o visual e gere o QR Code para ver o preview final aqui.",
              en: "Fill in the fields, adjust the design and generate the QR code to see the final preview here.",
              es: "Completa los campos, ajusta el diseño y genera el código QR para ver la vista previa aquí.",
            })}
          </p>
        </m.div>
      )}
    </div>
  )
}
