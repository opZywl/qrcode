"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { m } from "framer-motion"
import type { ScannerTab } from "@/components/dialog/dialog-scanner"
import { useLanguage } from "@/components/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GithubPopup } from "@/components/ui/github-popup"
import { LanguageSelector } from "@/components/ui/language-selector"
import { LocalIcon } from "@/components/ui/local-icon"
import { PortfolioPanel } from "@/components/ui/portfolio-panel"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useHydrated } from "@/hooks/use-hydrated"
import { useIsMobile } from "@/hooks/use-mobile"
import { useQRCodeGenerator } from "@/hooks/use-qr-code-generator"
import { useQRCodeState } from "@/hooks/use-qr-code-state"
import { toast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"
import { CONTENT_TYPE_META } from "@/lib/qr/labels"
import type { PersistStatus } from "@/lib/qr/storage"
import { ContentForm } from "./content-form"
import { QrPreview } from "./qr-preview"
import { StylePanel } from "./style-panel"
import { TypeSelector } from "./type-selector"

const loadScanner = () => import("@/components/dialog/dialog-scanner")
const loadHistory = () => import("./history-panel")
const loadSettings = () => import("@/components/dialog/dialog-settings")
const loadAbout = () => import("./dev-popup")
const loadMobileControls = () => import("@/components/mobile/mobile-controls")

const DialogScanner = dynamic(() => loadScanner().then((module) => module.DialogScanner), { ssr: false })
const HistoryPanel = dynamic(() => loadHistory().then((module) => module.HistoryPanel), { ssr: false })
const DialogSettings = dynamic(() => loadSettings().then((module) => module.DialogSettings), { ssr: false })
const DevPopup = dynamic(() => loadAbout().then((module) => module.DevPopup), { ssr: false })
const SheetControlesMobile = dynamic(() => loadMobileControls().then((module) => module.SheetControlesMobile), { ssr: false })

type LazyPanel = "scanner" | "history" | "settings" | "about" | "controls"

function warm(loader: () => Promise<unknown>) {
  return () => {
    void loader()
  }
}

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

interface QuickActionProps {
  icon: string
  label: string
  onClick: () => void
  onIntent?: () => void
}

function QuickAction({ icon, label, onClick, onIntent }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="h-9 justify-start gap-2 px-3 text-[13px] transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
      onPointerEnter={onIntent}
      onFocus={onIntent}
    >
      <span className="studio-icon-shell h-6 w-6 shrink-0 rounded-full">
        <LocalIcon name={icon} className="h-3 w-3 text-current" />
      </span>
      {label}
    </Button>
  )
}

export function QrGenerator() {
  const { t } = useLanguage()
  const hydrated = useHydrated()
  const isMobile = useIsMobile()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerTab, setScannerTab] = useState<ScannerTab>("camera")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [loadedPanels, setLoadedPanels] = useState<Record<LazyPanel, boolean>>({
    scanner: false,
    history: false,
    settings: false,
    about: false,
    controls: false,
  })

  const markLoaded = useCallback((panel: LazyPanel) => {
    setLoadedPanels((current) => (current[panel] ? current : { ...current, [panel]: true }))
  }, [])

  const notifyStorage = useCallback(
    (status: PersistStatus) => {
      toast({
        variant: status === "failed" ? "destructive" : "default",
        title: t(MESSAGES.storageTitle),
        description: t(status === "failed" ? MESSAGES.storageFailed : MESSAGES.historyWithoutImages),
      })
    },
    [t],
  )

  const qrState = useQRCodeState({ onHistoryPersist: notifyStorage, onTemplatesPersist: notifyStorage })
  const closeControls = useCallback(() => setControlsOpen(false), [])
  const generator = useQRCodeGenerator(qrState, { isMobile, onGenerated: isMobile ? closeControls : undefined })

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="portfolio-shell w-60 max-w-[90vw]">
            <div className="portfolio-inner flex items-center gap-3.5 p-6">
              <span className="studio-icon-shell h-11 w-11 animate-float-soft rounded-[1.1rem]">
                <LocalIcon name="qr" className="h-5 w-5 animate-pulse text-primary" />
              </span>
              <div>
                <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Carregando", en: "Loading", es: "Cargando" })}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {t({ pt: "Preparando o studio...", en: "Preparing the studio...", es: "Preparando el estudio..." })}
                </p>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    )
  }

  const previewProps = {
    qrValue: qrState.qrValue,
    qrTipo: qrState.qrTipo,
    corFrente: qrState.corFrente,
    corFundo: qrState.corFundo,
    tamanho: qrState.tamanho,
    nivelCorrecaoErro: qrState.nivelCorrecaoErro,
    zonaQuieta: qrState.zonaQuieta,
    logoDataUri: qrState.logoDataUri,
    logoTamanhoRatio: qrState.logoTamanhoRatio,
    escavarLogo: qrState.escavarLogo,
    imagemFundo: qrState.imagemFundo,
    habilitarCustomizacaoLogo: qrState.habilitarCustomizacaoLogo,
    habilitarCustomizacaoFundo: qrState.habilitarCustomizacaoFundo,
    habilitarCustomizacaoFrame: qrState.habilitarCustomizacaoFrame,
    tipoFrameSelecionado: qrState.tipoFrameSelecionado,
    textoFrame: qrState.textoFrame,
    whatsappGroupMensagem: qrState.whatsappGroupMensagem,
    onDownload: generator.handleDownloadQRCode,
    onCopy: generator.handleCopyQRCodeImage,
    onShare: generator.handleShareQRCode,
  }

  const openScanner = () => {
    markLoaded("scanner")
    setScannerOpen(true)
  }
  const openHistory = () => {
    markLoaded("history")
    setHistoryOpen(true)
  }
  const openSettings = () => {
    markLoaded("settings")
    setSettingsOpen(true)
  }
  const openAbout = () => {
    markLoaded("about")
    setAboutOpen(true)
  }
  const openControls = () => {
    markLoaded("controls")
    setControlsOpen(true)
  }

  const appDescription = t({
    pt: "Crie códigos QR personalizados para diferentes tipos de conteúdo.",
    en: "Create custom QR codes for different kinds of content.",
    es: "Crea códigos QR personalizados para distintos tipos de contenido.",
  })

  const overlays = (
    <>
      {loadedPanels.scanner && (
        <DialogScanner aberto={scannerOpen} onAbertoChange={setScannerOpen} aba={scannerTab} onAbaChange={setScannerTab} />
      )}
      {loadedPanels.history && (
        <HistoryPanel
          aberto={historyOpen}
          onAbertoChange={setHistoryOpen}
          historico={qrState.historico}
          onLoadFromHistory={generator.loadFromHistory}
          onClearHistory={generator.clearHistory}
          onToggleFavorite={generator.toggleHistoryFavorite}
          onUpdateTags={generator.updateHistoryTags}
          onRemoveFromHistory={generator.removeHistoryEntry}
          isMobile={isMobile}
        />
      )}
      {loadedPanels.settings && (
        <DialogSettings
          aberto={settingsOpen}
          onAbertoChange={setSettingsOpen}
          tiposVisiveis={qrState.tiposVisiveis}
          onTiposVisiveisChange={(tipos) => qrState.updateField("tiposVisiveis", tipos)}
        />
      )}
    </>
  )

  if (isMobile) {
    return (
      <>
        <div className="min-h-screen px-3.5 py-3.5 sm:px-4">
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <m.div {...panelMotion(0)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2.5">
                      <span className="portfolio-chip w-fit">QR CODE STUDIO</span>
                      <div className="flex items-start gap-2.5">
                        <div className="studio-icon-shell h-12 w-12 shrink-0 animate-float-soft rounded-[1.1rem]">
                          <LocalIcon name="qr" className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h1 className="font-glancyr700 text-[1.65rem] uppercase leading-[0.92] tracking-tight text-foreground">
                            {t({ pt: "Gerador", en: "Generator", es: "Generador" })}
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
                    <QuickAction icon="scan" label="Scanner" onClick={openScanner} onIntent={warm(loadScanner)} />
                    <QuickAction icon="palette" label={t({ pt: "Tipos", en: "Types", es: "Tipos" })} onClick={openSettings} onIntent={warm(loadSettings)} />
                    <QuickAction icon="history" label={t({ pt: "Histórico", en: "History", es: "Historial" })} onClick={openHistory} onIntent={warm(loadHistory)} />
                    <QuickAction icon="info" label={t({ pt: "Sobre", en: "About", es: "Acerca de" })} onClick={openAbout} onIntent={warm(loadAbout)} />
                  </div>
                </div>
              </PortfolioPanel>
            </m.div>

            <m.div {...panelMotion(1)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <QrPreview {...previewProps} isMobile />
              </PortfolioPanel>
            </m.div>

            <m.div {...panelMotion(2)}>
              <PortfolioPanel innerClassName="p-3.5 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Controles", en: "Controls", es: "Controles" })}</p>
                      <h2 className="mt-1.5 font-glancyr700 text-[1.2rem] uppercase leading-none tracking-tight text-foreground">
                        {t({ pt: "Conteúdo e estilo", en: "Content and style", es: "Contenido y estilo" })}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={generator.resetAppearanceCustomization}
                      title={t({ pt: "Resetar tudo", en: "Reset everything", es: "Restablecer todo" })}
                      aria-label={t({ pt: "Resetar tudo", en: "Reset everything", es: "Restablecer todo" })}
                      className="h-8 w-8 rounded-full"
                    >
                      <LocalIcon name="reset" className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <Button onClick={openControls} onPointerEnter={warm(loadMobileControls)} onFocus={warm(loadMobileControls)} className="h-11 w-full gap-2.5">
                    <span className="studio-icon-shell h-7 w-7 rounded-full border-white/10 bg-white/10 dark:border-dark-5/30 dark:bg-dark-4/10">
                      <LocalIcon name="sparkles" className="h-3.5 w-3.5 text-current" />
                    </span>
                    {t({ pt: "Abrir painel completo", en: "Open full panel", es: "Abrir panel completo" })}
                  </Button>
                </div>
              </PortfolioPanel>
            </m.div>
          </div>
        </div>

        {loadedPanels.controls && (
          <SheetControlesMobile aberto={controlsOpen} onAbertoChange={setControlsOpen} qrState={qrState} generator={generator} />
        )}
        {loadedPanels.about && <DevPopup aberto={aboutOpen} onAbertoChange={setAboutOpen} />}
        {overlays}
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen px-4 py-4 sm:px-5 lg:px-7">
        <div className="mx-auto flex max-w-310 flex-col gap-3">
          <div className="grid gap-3 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
            <div className="grid content-start gap-3 self-start">
              <m.div {...panelMotion(0)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-5">
                      <div className="max-w-2xl space-y-3">
                        <span className="portfolio-chip w-fit">QR CODE STUDIO</span>
                        <div className="flex items-start gap-3">
                          <div className="studio-icon-shell h-13 w-13 shrink-0 animate-float-soft rounded-[1.15rem]">
                            <LocalIcon name="qr" className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h1 className="font-glancyr700 text-[2.2rem] uppercase leading-[0.9] tracking-tight text-foreground xl:text-[2.45rem]">
                              {t({ pt: "Gerador", en: "Generator", es: "Generador" })}
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
                      <QuickAction icon="scan" label="Scanner" onClick={openScanner} onIntent={warm(loadScanner)} />
                      <QuickAction icon="palette" label={t({ pt: "Tipos", en: "Types", es: "Tipos" })} onClick={openSettings} onIntent={warm(loadSettings)} />
                      <QuickAction icon="history" label={t({ pt: "Histórico", en: "History", es: "Historial" })} onClick={openHistory} onIntent={warm(loadHistory)} />
                      <QuickAction icon="reset" label={t({ pt: "Resetar", en: "Reset", es: "Restablecer" })} onClick={generator.resetAppearanceCustomization} />
                    </div>
                  </div>
                </PortfolioPanel>
              </m.div>

              <m.div {...panelMotion(1)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Tipo de conteúdo", en: "Content type", es: "Tipo de contenido" })}</p>
                        <h2 className="mt-1.5 font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">
                          {t({ pt: "Escolha o formato", en: "Choose the format", es: "Elige el formato" })}
                        </h2>
                      </div>
                      <Badge variant="outline" className="gap-1.5 text-[11px]">
                        <LocalIcon name="sparkles" className="h-3 w-3" />
                        {qrState.tiposVisiveis.length} {t({ pt: "ativos", en: "active", es: "activos" })}
                      </Badge>
                    </div>

                    <TypeSelector tipoAtivo={qrState.tipoConteudoAtivo} onTipoChange={generator.handleContentTypeChange} tiposVisiveis={qrState.tiposVisiveis} />
                  </div>
                </PortfolioPanel>
              </m.div>

              <m.div {...panelMotion(2)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <form
                    noValidate
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      generator.handleGenerateQRCode()
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="portfolio-kicker text-muted-foreground">{t({ pt: "Conteúdo", en: "Content", es: "Contenido" })}</p>
                        <h2 className="mt-1.5 font-glancyr700 text-[1.18rem] uppercase leading-none tracking-tight text-foreground">
                          {t({ pt: "Dados do QR Code", en: "QR code data", es: "Datos del código QR" })}
                        </h2>
                      </div>
                      <Badge variant="secondary" className="gap-1.5 text-[11px]">
                        <LocalIcon name="settings" className="h-3 w-3" />
                        {t(CONTENT_TYPE_META[qrState.tipoConteudoAtivo].short)}
                      </Badge>
                    </div>

                    <div className="studio-tile">
                      <ContentForm tipo={qrState.tipoConteudoAtivo} valores={qrState} onChange={qrState.updateField} isMobile={false} />
                    </div>

                    <Separator />

                    <Button type="submit" className="h-10 w-full gap-2.5">
                      <span className="studio-icon-shell h-6 w-6 rounded-full border-white/10 bg-white/10 dark:border-dark-5/30 dark:bg-dark-4/10">
                        <LocalIcon name="qr" className="h-3.5 w-3.5 text-current" />
                      </span>
                      {t({ pt: "Gerar QR Code", en: "Generate QR code", es: "Generar código QR" })}
                    </Button>
                  </form>
                </PortfolioPanel>
              </m.div>
            </div>

            <div className="grid content-start gap-3 self-start">
              <m.div {...panelMotion(3)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <QrPreview {...previewProps} isMobile={false} />
                </PortfolioPanel>
              </m.div>

              <m.div {...panelMotion(4)}>
                <PortfolioPanel innerClassName="p-4 sm:p-5">
                  <StylePanel
                    valores={qrState}
                    onChange={qrState.updateField}
                    onReset={generator.resetAppearanceCustomization}
                    onLogoUpload={generator.handleLogoUpload}
                    onBackgroundImageUpload={generator.handleBackgroundImageUpload}
                    onRemoveBackgroundImage={generator.removeBackgroundImageFile}
                    fileInputRef={generator.fileInputRef}
                    backgroundImageInputRef={generator.backgroundImageInputRef}
                    visualTemplates={qrState.templatesVisuais}
                    onSaveVisualTemplate={generator.saveVisualTemplate}
                    onApplyVisualTemplate={generator.applyVisualTemplate}
                    onDeleteVisualTemplate={generator.deleteVisualTemplate}
                  />
                </PortfolioPanel>
              </m.div>
            </div>
          </div>

          <m.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-center gap-2.5 py-1 text-center text-[11px] text-muted-foreground"
          >
            <img src="/portfolio/images/github.svg" alt="" className="h-3 w-3 object-contain opacity-60 invert dark:invert-0" />
            <span>
              {t({ pt: "Feito por", en: "Made by", es: "Hecho por" })}{" "}
              <a
                href="https://lucas-lima.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Lucas Lima
              </a>
            </span>
          </m.footer>
        </div>
      </div>

      {overlays}
    </>
  )
}
