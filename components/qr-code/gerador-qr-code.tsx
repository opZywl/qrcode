"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QrCodeIcon as ScanQrCode, ScanLine, HistoryIcon, Info, RefreshCw, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { AlternadorTema } from "@/components/ui/alternador-tema"
import { SeletorTipoConteudo } from "./seletor-tipo-conteudo"
import { FormularioConteudo } from "./formulario-conteudo"
import { PersonalizacaoAparencia } from "./personalizacao-aparencia"
import { PreviewQRCode } from "./preview-qr-code"
import { DialogScanner } from "./dialog-scanner"
import { SheetHistorico } from "./sheet-historico"
import { SheetControlesMobile } from "./sheet-controles-mobile"
import { PopupPortfolioMobile } from "./popup-portfolio-mobile"
import { DialogConfiguracoes } from "./dialog-configuracoes"
import { useQRCodeState, type TipoConteudoQR } from "@/hooks/use-qr-code-state"
import { useQRCodeGenerator } from "@/hooks/use-qr-code-generator"
import { SeletorIdioma } from "@/components/ui/seletor-idioma"

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

interface GeradorQRCodeProps {
  scannerAberto: boolean
  onScannerAbertoChange: (aberto: boolean) => void
  abaScannerInicial: "camera" | "image"
  onAbaScannerChange: (aba: "camera" | "image") => void
  historicoAberto: boolean
  onHistoricoAbertoChange: (aberto: boolean) => void
}

export function GeradorQRCode({
                                scannerAberto,
                                onScannerAbertoChange,
                                abaScannerInicial,
                                onAbaScannerChange,
                                historicoAberto,
                                onHistoricoAbertoChange,
                              }: GeradorQRCodeProps) {
  const isMobile = useIsMobile()
  const [isClient, setIsClient] = useState(false)

  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [tiposVisiveis, setTiposVisiveis] = useState<TipoConteudoQR[]>(DEFAULT_VISIBLE_TYPES)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TipoConteudoQR[]
          if (Array.isArray(parsed)) {
            setTiposVisiveis(parsed)
          }
        } catch {

        }
      }
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LS_KEY, JSON.stringify(tiposVisiveis))
    }
  }, [tiposVisiveis, isClient])

  const { toast } = useToast()
  const qrState = useQRCodeState()
  const qrGenerator = useQRCodeGenerator(qrState, toast, isMobile, () => setControlesSheetAberto(false))

  const [controlesSheetAberto, setControlesSheetAberto] = useState(false)
  const [portfolioMobileAberto, setPortfolioMobileAberto] = useState(false)

  useEffect(() => {
    if (!tiposVisiveis.includes(qrState.tipoConteudoAtivo) && tiposVisiveis.length > 0) {
      qrState.updateField("tipoConteudoAtivo", tiposVisiveis[0])
    }
  }, [tiposVisiveis, qrState.tipoConteudoAtivo, qrState])

  const openConfigDialog = useCallback(() => setConfigDialogOpen(true), [])

  if (!isClient || isMobile === undefined) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ScanQrCode className="w-12 h-12 text-primary animate-pulse" />
        </div>
    )
  }

  if (isMobile) {
    return (
        <>
          <div className="flex flex-col h-screen bg-background">
            {/* Header Mobile */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center">
                <ScanQrCode className="w-6 h-6 text-primary mr-2 animate-text-glow-primary" />
                <h1 className="text-lg font-headline font-semibold text-foreground">Gerador de QR Code</h1>
              </div>
              <div className="flex items-center space-x-2">
                <SeletorIdioma />
                <AlternadorTema />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={qrGenerator.resetAppearanceCustomization}
                    className="w-10 h-10 rounded-full hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
                    title="Resetar tudo"
                >
                  <RefreshCw className="h-4 w-4 text-destructive" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPortfolioMobileAberto(true)}
                    className="w-10 h-10 rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <Info className="h-4 w-4 text-primary animate-text-glow-primary" />
                </Button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Button
                    variant="outline"
                    className="h-12 flex items-center justify-center gap-2 hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                    onClick={() => onScannerAbertoChange(true)}
                >
                  <ScanLine className="w-5 h-5 animate-text-glow-primary" />
                  <span className="text-sm font-medium">Escanear</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-12 flex items-center justify-center gap-2 hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                    onClick={openConfigDialog}
                >
                  <Palette className="w-5 h-5 animate-text-glow-primary" />
                  <span className="text-sm font-medium">Tipos</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-12 flex items-center justify-center gap-2 hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                    onClick={() => onHistoricoAbertoChange(true)}
                >
                  <HistoryIcon className="w-5 h-5 animate-text-glow-primary" />
                  <span className="text-sm font-medium">Histórico</span>
                </Button>
              </div>
            </div>

            {/* Área Central */}
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              {qrState.qrValue ? (
                  <PreviewQRCode
                      qrValue={qrState.qrValue}
                      {...qrState}
                      isMobile={true}
                      onDownload={qrGenerator.handleDownloadQRCode}
                      onCopy={qrGenerator.handleCopyQRCodeImage}
                      onShare={qrGenerator.handleShareQRCode}
                  />
              ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 max-w-sm w-full">
                    <div className="w-16 h-16 mb-4 opacity-50">
                      <ScanQrCode className="w-full h-full text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Gere seu primeiro QR code para vê-lo aqui</p>
                  </div>
              )}
            </div>

            {/* Botão flutuante de gerar */}
            <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
              <Button
                  onClick={() => setControlesSheetAberto(true)}
                  className="w-full py-3 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 border-2 border-green-400/50 hover:border-green-400 hover:shadow-green-glow focus:shadow-green-glow"
              >
                <ScanQrCode className="w-5 h-5 mr-2 animate-text-glow-primary" />
                Gerar QR Code
              </Button>
            </div>
          </div>

          {/* Dialogs */}
          <SheetControlesMobile
              aberto={controlesSheetAberto}
              onAbertoChange={setControlesSheetAberto}
              qrState={qrState}
              onGenerate={qrGenerator.handleGenerateQRCode}
              onResetGranular={qrGenerator.resetGranular}
              isLoading={qrGenerator.isLoading}
              tiposVisiveis={tiposVisiveis}
          />

          <PopupPortfolioMobile aberto={portfolioMobileAberto} onAbertoChange={setPortfolioMobileAberto} />

          <DialogScanner
              aberto={scannerAberto}
              onAbertoChange={onScannerAbertoChange}
              abaInicial={abaScannerInicial}
              onAbaChange={onAbaScannerChange}
          />

          <SheetHistorico
              aberto={historicoAberto}
              onAbertoChange={onHistoricoAbertoChange}
              historico={qrState.historico}
              onLoadFromHistory={qrGenerator.loadFromHistory}
              onClearHistory={qrGenerator.clearHistory}
              isMobile={true}
          />

          <DialogConfiguracoes
              aberto={configDialogOpen}
              onAbertoChange={setConfigDialogOpen}
              tiposVisiveis={tiposVisiveis}
              onTiposVisiveisChange={setTiposVisiveis}
          />
        </>
    )
  }

  return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 bg-background">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <ScanQrCode className="w-8 h-8 sm:w-10 sm:h-10 text-primary mr-2 animate-text-glow-primary" />
                    <CardTitle className="text-2xl sm:text-3xl font-headline text-primary animate-text-glow-primary">
                      Gerador QR Code
                    </CardTitle>
                  </div>
                  <CardDescription className="font-body text-xs sm:text-sm text-muted-foreground">
                    Crie códigos QR personalizados para diferentes tipos de conteúdo
                  </CardDescription>
                </div>
                <div className="hidden md:flex items-center space-x-2 shrink-0 ml-4">
                  <SeletorIdioma />
                  <AlternadorTema />
                </div>
              </div>
            </CardHeader>

            {/* Botões de ação desktop - layout mais compacto */}
            <div className="px-4 sm:px-6 pb-2 flex flex-wrap items-center justify-center gap-2 mb-4">
              <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                  onClick={() => onScannerAbertoChange(true)}
              >
                <ScanLine className="w-4 h-4 mr-2 animate-text-glow-primary" />
                Escanear
              </Button>

              <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                  onClick={openConfigDialog}
              >
                <Palette className="w-4 h-4 mr-2 animate-text-glow-primary" />
                Tipos
              </Button>

              <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary"
                  onClick={() => onHistoricoAbertoChange(true)}
              >
                <HistoryIcon className="w-4 h-4 mr-2 animate-text-glow-primary" />
                Histórico
              </Button>
            </div>

            {/* Seletor de tipo */}
            <div className="px-4 sm:px-6 mb-4">
              <SeletorTipoConteudo
                  tipoAtivo={qrState.tipoConteudoAtivo}
                  onTipoChange={qrGenerator.handleContentTypeChange}
                  tiposVisiveis={tiposVisiveis}
              />
            </div>

            {/* Formulário de conteúdo */}
            <div className="px-4 sm:px-6 mb-4">
              <FormularioConteudo
                  tipo={qrState.tipoConteudoAtivo}
                  valores={qrState}
                  onChange={qrState.updateField}
                  isMobile={false}
              />
            </div>

            <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
              <Separator />

              <PersonalizacaoAparencia
                  valores={qrState}
                  onChange={qrState.updateField}
                  onReset={qrGenerator.resetAppearanceCustomization}
                  onLogoUpload={qrGenerator.handleLogoUpload}
                  onBackgroundImageUpload={qrGenerator.handleBackgroundImageUpload}
                  onRemoveBackgroundImage={qrGenerator.removeBackgroundImageFile}
                  fileInputRef={qrGenerator.fileInputRef}
                  backgroundImageInputRef={qrGenerator.backgroundImageInputRef}
                  isMobile={false}
              />

              <Button
                  onClick={qrGenerator.handleGenerateQRCode}
                  disabled={qrGenerator.isLoading}
                  className="w-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 border-2 border-green-400/50 hover:border-green-400 hover:shadow-green-glow focus:shadow-green-glow text-base py-3"
              >
                <ScanQrCode className="w-5 h-5 mr-2 animate-text-glow-primary" />
                Gerar QR Code
              </Button>

              <PreviewQRCode
                  qrValue={qrState.qrValue}
                  {...qrState}
                  isMobile={false}
                  onDownload={qrGenerator.handleDownloadQRCode}
                  onCopy={qrGenerator.handleCopyQRCodeImage}
                  onShare={qrGenerator.handleShareQRCode}
              />
            </CardContent>

            <CardFooter className="flex flex-col items-center text-center pt-3 px-4 sm:px-6">
              <Separator className="mt-0 mb-3" />
              <p className="text-xs text-muted-foreground/70">
                Feito com ❤️ por{" "}
                <a
                    href="https://lucas-lima.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary animate-text-glow-footer hover:underline"
                >
                  Lucas Lima
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Dialogs */}
        <DialogScanner
            aberto={scannerAberto}
            onAbertoChange={onScannerAbertoChange}
            abaInicial={abaScannerInicial}
            onAbaChange={onAbaScannerChange}
        />

        <SheetHistorico
            aberto={historicoAberto}
            onAbertoChange={onHistoricoAbertoChange}
            historico={qrState.historico}
            onLoadFromHistory={qrGenerator.loadFromHistory}
            onClearHistory={qrGenerator.clearHistory}
            isMobile={false}
        />

        <DialogConfiguracoes
            aberto={configDialogOpen}
            onAbertoChange={setConfigDialogOpen}
            tiposVisiveis={tiposVisiveis}
            onTiposVisiveisChange={setTiposVisiveis}
        />
      </>
  )
}