"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/components/language-provider"
import { PortfolioPanel } from "@/components/ui/portfolio-panel"
import { GithubPopup } from "@/components/ui/github-popup"
import { LanguageSelector } from "@/components/ui/language-selector"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LocalIcon } from "@/components/ui/local-icon"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { DialogScanner } from "../dialog/dialog-scanner"
import { DialogSettings } from "../dialog/dialog-settings"
import { HistoryPanel } from "./history-panel"
import { ContentForm } from "./content-form"
import { DevPopup } from "./dev-popup"
import { QrPreview } from "./qr-preview"
import { StylePanel } from "./style-panel"
import { TypeSelector } from "./type-selector"
import { SheetControlesMobile } from "../mobile/mobile-controls"
import { useQRCodeGenerator } from "@/hooks/use-qr-code-generator"
import { useQRCodeState, type TipoConteudoQR } from "@/hooks/use-qr-code-state"

const DEFAULT_VISIBLE_TYPES: TipoConteudoQR[] = [
  "url",
  "wifi",
  "whatsapp",
  "phone",
  "vcard",
  "vevent",
  "email",
  "sms",
  "geo",
]

const LS_KEY = "qr_visible_types"

function panelMotion(index: number) {
  return {
    initial: { opacity: 0, y: 18, scale: 0.988 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.42,
      delay: index * 0.055,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }
}

interface GeradorQRCodeProps {
  scannerAberto: boolean
  onScannerAbertoChange: (aberto: boolean) => void
  abaScannerInicial: "camera" | "image"
  onAbaScannerChange: (aba: "camera" | "image") => void
  historicoAberto: boolean
  onHistoricoAbertoChange: (aberto: boolean) => void
}

interface QuickActionProps {
  icon: string
  label: string
  onClick: () => void
  variant?: "default" | "outline"
}

function QuickAction({ icon, label, onClick, variant = "outline" }: QuickActionProps) {
  return (
    <Button
      variant={variant}
      className="h-9 justify-start gap-2 px-3 text-[13px] transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <span className="studio-icon-shell h-6 w-6 rounded-full flex-shrink-0">
        <LocalIcon name={icon} className="h-3 w-3 text-current" />
      </span>
      {label}
    </Button>
  )
}

export function QrGenerator({
  scannerAberto,
  onScannerAbertoChange,
  abaScannerInicial,
  onAbaScannerChange,
  historicoAberto,
  onHistoricoAbertoChange,
}: GeradorQRCodeProps) {
  const { language, t } = useLanguage()
  const isMobile = useIsMobile()
  const [isClient, setIsClient] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [controlesSheetAberto, setControlesSheetAberto] = useState(false)
  const [portfolioMobileAberto, setPortfolioMobileAberto] = useState(false)
  const [tiposVisiveis, setTiposVisiveis] = useState<TipoConteudoQR[]>(DEFAULT_VISIBLE_TYPES)

  useEffect(() => {
    setIsClient(true)

    if (typeof window === "undefined") {
      return
    }

    const stored = localStorage.getItem(LS_KEY)
    if (!stored) {
      return
    }

    try {
      const parsed = JSON.parse(stored) as TipoConteudoQR[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTiposVisiveis(parsed)
      }
    } catch {
      localStorage.removeItem(LS_KEY)
    }
  }, [])

  useEffect(() => {
    if (!isClient) {
      return
    }

    localStorage.setItem(LS_KEY, JSON.stringify(tiposVisiveis))
  }, [tiposVisiveis, isClient])

  const { toast } = useToast()
  const qrState = useQRCodeState()
  const qrGenerator = useQRCodeGenerator(qrState, toast, language, isMobile, () => setControlesSheetAberto(false))

  useEffect(() => {
    if (!tiposVisiveis.includes(qrState.tipoConteudoAtivo) && tiposVisiveis.length > 0) {
      qrState.updateField("tipoConteudoAtivo", tiposVisiveis[0])
    }
  }, [tiposVisiveis, qrState.tipoConteudoAtivo, qrState])

  const openConfigDialog = useCallback(() => setConfigDialogOpen(true), [])

  if (!isClient || isMobile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="portfolio-shell w-[240px] max-w-[90vw]">
            <div className="portfolio-inner flex items-center gap-3.5 p-6">
              <span className="studio-icon-shell h-11 w-11 rounded-[1.1rem] animate-float-soft">
                <LocalIcon name="qr" className="h-5 w-5 animate-pulse text-primary" />
              </span>
              <div>
                <p className="portfolio-kicker text-muted-foreground">Loading</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {t({ pt: "Preparando o studio...", en: "Preparing the studio..." })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const previewProps = {
    ...qrState,
    tipoConteudo: qrState.tipoConteudoAtivo,
    whatsappGroupMensagem: qrState.whatsappGroupMensagem,
    onDownload: qrGenerator.handleDownloadQRCode,
    onCopy: qrGenerator.handleCopyQRCodeImage,
    onShare: qrGenerator.handleShareQRCode,
    language,
  }

  const appDescription = t({
    pt: "Crie códigos QR personalizados para diferentes tipos de conteúdo.",
    en: "Create custom QR codes for different kinds of content.",
  })

  if (isMobile) {
    return (
      <>
        <div className="min-h-screen px-3.5 py-3.5 sm:px-4">
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <motion.div {...panelMotion(0)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2.5">
                      <span className="portfolio-chip w-fit">QR CODE STUDIO</span>

                      <div className="flex items-start gap-2.5">
                        <div className="studio-icon-shell h-12 w-12 rounded-[1.1rem] animate-float-soft flex-shrink-0">
                          <LocalIcon name="qr" className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="font-glancyr700 text-[1.65rem] uppercase leading-[0.92] tracking-tight text-foreground">
                            {t({ pt: "Gerador", en: "Generator" })}
                            <br />
                            QR Code
                          </h1>
                          <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-muted-foreground">{appDescription}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <GithubPopup />
                      <LanguageSelector />
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <QuickAction icon="scan" label={t({ pt: "Scanner", en: "Scanner" })} onClick={() => onScannerAbertoChange(true)} />
                    <QuickAction icon="palette" label={t({ pt: "Tipos", en: "Types" })} onClick={openConfigDialog} />
                    <QuickAction icon="history" label={t({ pt: "Historico", en: "History" })} onClick={() => onHistoricoAbertoChange(true)} />
                    <QuickAction icon="info" label={t({ pt: "Sobre", en: "About" })} onClick={() => setPortfolioMobileAberto(true)} />
                  </div>
                </div>
              </PortfolioPanel>
            </motion.div>

            <motion.div {...panelMotion(1)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <QrPreview {...previewProps} isMobile={true} />
              </PortfolioPanel>
            </motion.div>

            <motion.div {...panelMotion(2)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Controles", en: "Controls" })}</p>
                      <h2 className="mt-1.5 font-glancyr700 text-[1.2rem] uppercase leading-none tracking-tight text-foreground">
                        {t({ pt: "Conteudo e estilo", en: "Content and style" })}
                      </h2>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={qrGenerator.resetAppearanceCustomization}
                      title={t({ pt: "Resetar tudo", en: "Reset everything" })}
                      className="rounded-full h-8 w-8"
                    >
                      <LocalIcon name="reset" className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <Button onClick={() => setControlesSheetAberto(true)} className="h-11 w-full gap-2.5">
                    <span className="studio-icon-shell h-7 w-7 rounded-full border-white/10 bg-white/10 dark:border-dark-5/30 dark:bg-dark-4/10">
                      <LocalIcon name="sparkles" className="h-3.5 w-3.5 text-current" />
                    </span>
                    {t({ pt: "Abrir painel completo", en: "Open full panel" })}
                  </Button>
                </div>
              </PortfolioPanel>
            </motion.div>
          </div>
        </div>

        <SheetControlesMobile
          aberto={controlesSheetAberto}
          onAbertoChange={setControlesSheetAberto}
          qrState={qrState}
          onGenerate={qrGenerator.handleGenerateQRCode}
          onResetGranular={(tipo) => qrGenerator.resetGranular(tipo)}
          isLoading={qrGenerator.isLoading}
          tiposVisiveis={tiposVisiveis}
          visualTemplates={qrState.templatesVisuais}
          onSaveVisualTemplate={qrGenerator.saveVisualTemplate}
          onApplyVisualTemplate={qrGenerator.applyVisualTemplate}
          onDeleteVisualTemplate={qrGenerator.deleteVisualTemplate}
          language={language}
        />

        <DevPopup aberto={portfolioMobileAberto} onAbertoChange={setPortfolioMobileAberto} language={language} />

        <DialogScanner
          aberto={scannerAberto}
          onAbertoChange={onScannerAbertoChange}
          abaInicial={abaScannerInicial}
          onAbaChange={onAbaScannerChange}
          language={language}
        />

        <HistoryPanel
          aberto={historicoAberto}
          onAbertoChange={onHistoricoAbertoChange}
          historico={qrState.historico}
          onLoadFromHistory={qrGenerator.loadFromHistory}
          onClearHistory={qrGenerator.clearHistory}
          onToggleFavorite={qrGenerator.toggleHistoryFavorite}
          onUpdateTags={qrGenerator.updateHistoryTags}
          onRemoveFromHistory={qrGenerator.removeHistoryEntry}
          isMobile={true}
          language={language}
        />

        <DialogSettings
          aberto={configDialogOpen}
          onAbertoChange={setConfigDialogOpen}
          tiposVisiveis={tiposVisiveis}
          onTiposVisiveisChange={setTiposVisiveis}
          language={language}
        />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen px-4 py-4 sm:px-5 lg:px-7">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3">
          <div className="grid gap-3 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
            <div className="grid content-start gap-3 self-start">
              <motion.div {...panelMotion(0)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-5">
                      <div className="max-w-2xl space-y-3">
                        <span className="portfolio-chip w-fit">QR CODE STUDIO</span>

                        <div className="flex items-start gap-3">
                          <div
                            className="studio-icon-shell h-13 w-13 shrink-0 rounded-[1.15rem] animate-float-soft"
                            style={{ width: "3.25rem", height: "3.25rem" }}
                          >
                            <LocalIcon name="qr" className="h-6 w-6 text-primary" />
                          </div>

                          <div>
                            <h1 className="font-glancyr700 text-[2.2rem] uppercase leading-[0.9] tracking-tight text-foreground xl:text-[2.45rem]">
                              {t({ pt: "Gerador", en: "Generator" })}
                              <br />
                              QR Code
                            </h1>
                            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground sm:text-[13px]">{appDescription}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <GithubPopup />
                        <LanguageSelector />
                        <ThemeToggle />
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-4">
                      <QuickAction icon="scan" label={t({ pt: "Scanner", en: "Scanner" })} onClick={() => onScannerAbertoChange(true)} />
                      <QuickAction icon="palette" label={t({ pt: "Tipos", en: "Types" })} onClick={openConfigDialog} />
                      <QuickAction icon="history" label={t({ pt: "Historico", en: "History" })} onClick={() => onHistoricoAbertoChange(true)} />
                      <QuickAction icon="reset" label={t({ pt: "Resetar", en: "Reset" })} onClick={qrGenerator.resetAppearanceCustomization} />
                    </div>
                  </div>
                </PortfolioPanel>
              </motion.div>

              <motion.div {...panelMotion(1)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Tipo de conteudo", en: "Content type" })}</p>
                        <h2 className="mt-1.5 font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">
                          {t({ pt: "Escolha o formato", en: "Choose the format" })}
                        </h2>
                      </div>
                      <Badge variant="outline" className="gap-1.5 text-[11px]">
                        <LocalIcon name="sparkles" className="h-3 w-3" />
                        {tiposVisiveis.length} {t({ pt: "ativos", en: "active" })}
                      </Badge>
                    </div>

                    <TypeSelector
                      tipoAtivo={qrState.tipoConteudoAtivo}
                      onTipoChange={qrGenerator.handleContentTypeChange}
                      tiposVisiveis={tiposVisiveis}
                      language={language}
                    />
                  </div>
                </PortfolioPanel>
              </motion.div>

              <motion.div {...panelMotion(2)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Conteudo", en: "Content" })}</p>
                        <h2 className="mt-1.5 font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">
                          {t({ pt: "Dados do QR Code", en: "QR code data" })}
                        </h2>
                      </div>
                      <Badge variant="secondary" className="gap-1.5 text-[11px]">
                        <LocalIcon name="settings" className="h-3 w-3" />
                        {qrState.tipoConteudoAtivo}
                      </Badge>
                    </div>

                    <div className="studio-tile">
                      <ContentForm
                        tipo={qrState.tipoConteudoAtivo}
                        valores={qrState}
                        onChange={qrState.updateField}
                        isMobile={false}
                        language={language}
                      />
                    </div>

                    <Separator />

                    <Button onClick={qrGenerator.handleGenerateQRCode} disabled={qrGenerator.isLoading} className="h-10 w-full gap-2.5">
                      <span className="studio-icon-shell h-6 w-6 rounded-full border-white/10 bg-white/10 dark:border-dark-5/30 dark:bg-dark-4/10">
                        <LocalIcon name="qr" className="h-3.5 w-3.5 text-current" />
                      </span>
                      {qrGenerator.isLoading
                        ? t({ pt: "Gerando...", en: "Generating..." })
                        : t({ pt: "Gerar QR Code", en: "Generate QR Code" })}
                    </Button>
                  </div>
                </PortfolioPanel>
              </motion.div>
            </div>

            <div className="grid content-start gap-3 self-start">
              <motion.div {...panelMotion(3)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <QrPreview {...previewProps} isMobile={false} />
                </PortfolioPanel>
              </motion.div>

              <motion.div {...panelMotion(4)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <StylePanel
                    valores={qrState}
                    onChange={qrState.updateField}
                    onReset={qrGenerator.resetAppearanceCustomization}
                    onLogoUpload={qrGenerator.handleLogoUpload}
                    onBackgroundImageUpload={qrGenerator.handleBackgroundImageUpload}
                    onRemoveBackgroundImage={qrGenerator.removeBackgroundImageFile}
                    fileInputRef={qrGenerator.fileInputRef}
                    backgroundImageInputRef={qrGenerator.backgroundImageInputRef}
                    visualTemplates={qrState.templatesVisuais}
                    onSaveVisualTemplate={qrGenerator.saveVisualTemplate}
                    onApplyVisualTemplate={qrGenerator.applyVisualTemplate}
                    onDeleteVisualTemplate={qrGenerator.deleteVisualTemplate}
                    language={language}
                    isMobile={false}
                  />
                </PortfolioPanel>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-center gap-2.5 py-1 text-center text-[11px] text-muted-foreground"
          >
            <img src="/portfolio/images/github.svg" alt="" className="h-3 w-3 object-contain opacity-60 invert dark:invert-0" />
            <span>
              {t({ pt: "Feito por", en: "Made by" })}{" "}
              <a
                href="https://lucas-lima.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Lucas Lima
              </a>
            </span>
          </motion.div>
        </div>
      </div>

      <DialogScanner
        aberto={scannerAberto}
        onAbertoChange={onScannerAbertoChange}
        abaInicial={abaScannerInicial}
        onAbaChange={onAbaScannerChange}
        language={language}
      />

      <HistoryPanel
        aberto={historicoAberto}
        onAbertoChange={onHistoricoAbertoChange}
        historico={qrState.historico}
        onLoadFromHistory={qrGenerator.loadFromHistory}
        onClearHistory={qrGenerator.clearHistory}
        onToggleFavorite={qrGenerator.toggleHistoryFavorite}
        onUpdateTags={qrGenerator.updateHistoryTags}
        onRemoveFromHistory={qrGenerator.removeHistoryEntry}
        isMobile={false}
        language={language}
      />

      <DialogSettings
        aberto={configDialogOpen}
        onAbertoChange={setConfigDialogOpen}
        tiposVisiveis={tiposVisiveis}
        onTiposVisiveisChange={setTiposVisiveis}
        language={language}
      />
    </>
  )
}
