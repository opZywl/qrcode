"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ScanLine,
  Upload,
  Camera,
  X,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Smartphone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DialogScannerProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

interface ScanResult {
  text: string
  format?: string
  timestamp: number
}

export function DialogScanner({ aberto, onAbertoChange }: DialogScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string>("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Verificar se há câmera disponível
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setHasCamera(videoDevices.length > 0)
      } catch (error) {
        console.error("Erro ao verificar câmeras:", error)
        setHasCamera(false)
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      checkCamera()
    }
  }, [])

  // Limpar stream quando fechar o dialog
  useEffect(() => {
    if (!aberto && stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsScanning(false)
      setScanResult(null)
      setError("")
    }
  }, [aberto, stream])

  const startCamera = useCallback(async () => {
    try {
      setError("")
      setIsScanning(true)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Câmera traseira preferencialmente
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      toast({
        title: "📷 Câmera Ativada",
        description: "Posicione o QR Code na frente da câmera",
      })
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
      setError("Não foi possível acessar a câmera. Verifique as permissões.")
      setIsScanning(false)

      toast({
        title: "❌ Erro na Câmera",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }, [stream])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL("image/png")
  }, [])

  // Simulação de detecção de QR Code (em produção, usar biblioteca como jsQR)
  const processQRCode = useCallback(
    async (imageData: string) => {
      setIsProcessing(true)

      try {
        // Simular processamento
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulação de resultado (em produção, usar jsQR ou similar)
        const mockResults = [
          "https://github.com/usuario/projeto",
          "WIFI:T:WPA;S:MinhaRede;P:senha123;;",
          "BEGIN:VCARD\nVERSION:3.0\nFN:João Silva\nORG:Empresa XYZ\nTEL:+5511999999999\nEMAIL:joao@exemplo.com\nEND:VCARD",
          "mailto:contato@exemplo.com?subject=Assunto&body=Mensagem",
          "geo:-23.5505,-46.6333",
          "SMSTO:+5511999999999:Olá, como vai?",
          "tel:+5511999999999",
          "Este é um texto simples do QR Code",
        ]

        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]

        const result: ScanResult = {
          text: randomResult,
          format: "QR_CODE",
          timestamp: Date.now(),
        }

        setScanResult(result)
        stopCamera()

        toast({
          title: "✅ QR Code Detectado!",
          description: "QR Code foi lido com sucesso",
        })
      } catch (error) {
        console.error("Erro ao processar QR Code:", error)
        setError("Erro ao processar a imagem. Tente novamente.")

        toast({
          title: "❌ Erro no Processamento",
          description: "Não foi possível ler o QR Code",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [stopCamera, toast],
  )

  const handleCapture = useCallback(() => {
    const imageData = captureFrame()
    if (imageData) {
      processQRCode(imageData)
    }
  }, [captureFrame, processQRCode])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast({
          title: "❌ Arquivo Inválido",
          description: "Por favor, selecione uma imagem",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        if (imageData) {
          processQRCode(imageData)
        }
      }
      reader.readAsDataURL(file)

      toast({
        title: "📁 Imagem Carregada",
        description: "Processando QR Code da imagem...",
      })
    },
    [processQRCode, toast],
  )

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: "📋 Copiado!",
          description: "Texto copiado para a área de transferência",
        })
      } catch (error) {
        toast({
          title: "❌ Erro ao Copiar",
          description: "Não foi possível copiar o texto",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const openLink = useCallback(
    (url: string) => {
      try {
        window.open(url, "_blank", "noopener,noreferrer")
        toast({
          title: "🔗 Link Aberto",
          description: "Link foi aberto em uma nova aba",
        })
      } catch (error) {
        toast({
          title: "❌ Erro ao Abrir Link",
          description: "Não foi possível abrir o link",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const formatQRContent = (text: string) => {
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return { type: "URL", icon: ExternalLink, color: "text-blue-600" }
    } else if (text.startsWith("WIFI:")) {
      return { type: "WiFi", icon: Smartphone, color: "text-green-600" }
    } else if (text.startsWith("BEGIN:VCARD")) {
      return { type: "Contato", icon: Copy, color: "text-purple-600" }
    } else if (text.startsWith("mailto:")) {
      return { type: "Email", icon: Copy, color: "text-orange-600" }
    } else if (text.startsWith("geo:")) {
      return { type: "Localização", icon: Copy, color: "text-red-600" }
    } else if (text.startsWith("SMSTO:") || text.startsWith("sms:")) {
      return { type: "SMS", icon: Copy, color: "text-indigo-600" }
    } else if (text.startsWith("tel:")) {
      return { type: "Telefone", icon: Copy, color: "text-teal-600" }
    } else {
      return { type: "Texto", icon: Copy, color: "text-gray-600" }
    }
  }

  const resetScanner = useCallback(() => {
    setScanResult(null)
    setError("")
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/20">
              <ScanLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Scanner de QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!scanResult && !isScanning && (
            <div className="space-y-4">
              {/* Opções de Scan */}
              <div className="grid grid-cols-1 gap-3">
                {hasCamera && (
                  <Button
                    onClick={startCamera}
                    className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={isProcessing}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Usar Câmera
                  </Button>
                )}

                <div className="relative">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed hover:border-primary"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Carregar Imagem
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {!hasCamera && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">Câmera não detectada. Use a opção de carregar imagem.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Visualização da Câmera */}
          {isScanning && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay de Scan */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>

                    {/* Linha de scan animada */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCapture}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4 mr-2" />
                      Capturar
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="icon"
                  className="border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Resultado do Scan */}
          {scanResult && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 dark:text-green-400">QR Code Detectado</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {formatQRContent(scanResult.text).type}
                    </Badge>
                  </div>

                  <ScrollArea className="max-h-32">
                    <p className="text-sm text-green-700 dark:text-green-300 font-mono break-all whitespace-pre-wrap">
                      {scanResult.text}
                    </p>
                  </ScrollArea>

                  <Separator className="my-3" />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(scanResult.text)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>

                    {(scanResult.text.startsWith("http://") || scanResult.text.startsWith("https://")) && (
                      <Button onClick={() => openLink(scanResult.text)} variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={resetScanner} variant="outline" className="w-full">
                <ScanLine className="w-4 h-4 mr-2" />
                Escanear Novamente
              </Button>
            </div>
          )}

          {/* Erro */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
