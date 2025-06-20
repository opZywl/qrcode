"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ScanLine,
  Copy,
  CameraOff,
  RefreshCw,
  Upload,
  FileImage,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Camera,
  Eye,
  Download,
  RotateCcw,
  Flashlight,
  Target,
  Volume2,
  VolumeX,
  ClipboardCopy,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import jsQR from "jsqr"

interface DialogScannerProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  abaInicial: "camera" | "image"
  onAbaChange: (aba: "camera" | "image") => void
}

interface QRResult {
  data: string
  location: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
}

export function DialogScanner({ aberto, onAbertoChange, abaInicial, onAbaChange }: DialogScannerProps) {
  const isMobile = useIsMobile()

  const [temPermissaoCamera, setTemPermissaoCamera] = useState<boolean | null>(null)
  const [tentandoCamera, setTentandoCamera] = useState<boolean>(false)
  const [scanningFromCamera, setScanningFromCamera] = useState<boolean>(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment")
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false)
  const [torchSupported, setTorchSupported] = useState<boolean>(false)
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [scanCount, setScanCount] = useState<number>(0)
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null)

  // Estados da imagem
  const [previewImagemEscaneada, setPreviewImagemEscaneada] = useState<string | null>(null)
  const [resultadoQrImagemEscaneada, setResultadoQrImagemEscaneada] = useState<string | null>(null)
  const [escaneandoImagem, setEscaneandoImagem] = useState<boolean>(false)
  const [dragOver, setDragOver] = useState<boolean>(false)

  // Estados do resultado
  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageScanCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageScanInputRef = useRef<HTMLInputElement>(null)
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const { toast } = useToast()

  // Som de sucesso
  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)
    } catch (error) {
      console.warn("Não foi possível reproduzir som:", error)
    }
  }, [soundEnabled])

  // Verificar dispositivos de câmera disponíveis
  const checkCameraDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setHasMultipleCameras(videoDevices.length > 1)
    } catch (error) {
      console.warn("Erro ao enumerar dispositivos:", error)
    }
  }, [])

  // Verificar suporte a torch
  const checkTorchSupport = useCallback((stream: MediaStream) => {
    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.()
      setTorchSupported(!!(capabilities && "torch" in capabilities))
    } catch (error) {
      setTorchSupported(false)
    }
  }, [])

  // Controlar torch
  const toggleTorch = useCallback(async () => {
    if (!currentStream || !torchSupported) return

    try {
      const track = currentStream.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled } as any],
      })
      setTorchEnabled(!torchEnabled)

      toast({
        title: torchEnabled ? "🔦 Flash Desligado" : "🔦 Flash Ligado",
        description: torchEnabled ? "Flash da câmera foi desligado" : "Flash da câmera foi ligado",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro no Flash",
        description: "Não foi possível controlar o flash da câmera",
      })
    }
  }, [currentStream, torchSupported, torchEnabled, toast])

  // Desenhar overlay de detecção
  const drawDetectionOverlay = useCallback((canvas: HTMLCanvasElement, result: QRResult) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { location } = result

    // Limpar overlay anterior
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar contorno do QR Code detectado
    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 4
    ctx.shadowColor = "#00ff00"
    ctx.shadowBlur = 10

    ctx.beginPath()
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y)
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y)
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y)
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y)
    ctx.closePath()
    ctx.stroke()

    // Desenhar cantos destacados
    const cornerSize = 20
    const corners = [
      location.topLeftCorner,
      location.topRightCorner,
      location.bottomRightCorner,
      location.bottomLeftCorner,
    ]

    ctx.strokeStyle = "#ffff00"
    ctx.lineWidth = 6
    ctx.shadowColor = "#ffff00"

    corners.forEach((corner) => {
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, cornerSize / 2, 0, 2 * Math.PI)
      ctx.stroke()
    })
  }, [])

  // Scanner de câmera em tempo real MELHORADO
  const startCameraScanning = useCallback(() => {
    if (!videoRef.current || !cameraCanvasRef.current) return

    setScanningFromCamera(true)
    const video = videoRef.current
    const canvas = cameraCanvasRef.current
    const overlayCanvas = document.getElementById("detection-overlay") as HTMLCanvasElement
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    if (!ctx) return

    let frameCount = 0
    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Ajustar canvas para o tamanho do vídeo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        if (overlayCanvas) {
          overlayCanvas.width = video.videoWidth
          overlayCanvas.height = video.videoHeight
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Escanear apenas a cada 3 frames para performance
        if (frameCount % 3 === 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })

          if (code) {
            const now = Date.now()

            // Evitar detecções duplicadas muito rápidas
            if (now - lastScanTime > 1000) {
              setLastScanTime(now)
              setScanCount((prev) => prev + 1)
              setScanningFromCamera(false)

              // Parar escaneamento
              if (scanIntervalRef.current) {
                cancelAnimationFrame(scanIntervalRef.current)
                scanIntervalRef.current = null
              }

              // Desenhar overlay de detecção
              if (overlayCanvas) {
                drawDetectionOverlay(overlayCanvas, code as QRResult)
              }

              // Efeitos de feedback
              playSuccessSound()

              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }

              // Adicionar ao histórico
              setDetectionHistory((prev) => [code.data, ...prev.slice(0, 4)])
              setQrResult(code as QRResult)
              setResultadoQrImagemEscaneada(code.data)

              toast({
                title: "🎯 QR Code Detectado!",
                description: `Scan #${scanCount + 1} - ${code.data.substring(0, 50)}${code.data.length > 50 ? "..." : ""}`,
              })

              // Continuar escaneamento após 2 segundos
              setTimeout(() => {
                if (overlayCanvas) {
                  const overlayCtx = overlayCanvas.getContext("2d")
                  if (overlayCtx) {
                    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
                  }
                }
                setQrResult(null)
                setScanningFromCamera(true)
                if (scanIntervalRef.current === null) {
                  scanIntervalRef.current = requestAnimationFrame(scanFrame)
                }
              }, 2000)

              return
            }
          }
        }

        frameCount++
      }

      if (scanIntervalRef.current !== null) {
        scanIntervalRef.current = requestAnimationFrame(scanFrame)
      }
    }

    scanIntervalRef.current = requestAnimationFrame(scanFrame)
  }, [lastScanTime, scanCount, playSuccessSound, drawDetectionOverlay, toast])

  const stopCameraScanning = useCallback(() => {
    setScanningFromCamera(false)
    setQrResult(null)

    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    // Limpar overlay
    const overlayCanvas = document.getElementById("detection-overlay") as HTMLCanvasElement
    if (overlayCanvas) {
      const ctx = overlayCanvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
      }
    }
  }, [])

  // Iniciar câmera MELHORADO
  const iniciarCamera = useCallback(async () => {
    setTentandoCamera(true)
    setTemPermissaoCamera(null)
    setResultadoQrImagemEscaneada(null)
    setQrResult(null)
    setScanCount(0)
    setDetectionHistory([])

    try {
      // Parar stream anterior se existir
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCurrentStream(stream)
      setTemPermissaoCamera(true)
      setTentandoCamera(false)

      // Verificar suporte a torch
      checkTorchSupport(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        // Iniciar escaneamento após a câmera estar pronta
        setTimeout(() => {
          startCameraScanning()
        }, 1000)
      }

      toast({
        title: "📷 Câmera Ativada!",
        description: `Câmera ${cameraFacingMode === "environment" ? "traseira" : "frontal"} ativada. Aponte para um QR Code!`,
      })
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
      setTemPermissaoCamera(false)
      setTentandoCamera(false)
      setCurrentStream(null)

      let errorMessage = "Não foi possível acessar a câmera. Verifique as permissões."
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador."
            break
          case "NotFoundError":
            errorMessage = "Nenhuma câmera encontrada no dispositivo."
            break
          case "NotReadableError":
            errorMessage = "Câmera está sendo usada por outro aplicativo."
            break
          case "OverconstrainedError":
            errorMessage = "Configurações de câmera não suportadas. Tentando câmera frontal..."
            // Tentar com câmera frontal
            if (cameraFacingMode === "environment") {
              setCameraFacingMode("user")
              return
            }
            break
          default:
            errorMessage = `Erro desconhecido: ${error.message}`
        }
      }

      toast({
        variant: "destructive",
        title: "❌ Erro de Câmera",
        description: errorMessage,
      })
    }
  }, [cameraFacingMode, currentStream, checkTorchSupport, startCameraScanning, toast])

  const pararCamera = useCallback(() => {
    stopCameraScanning()

    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop())
      setCurrentStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setTemPermissaoCamera(null)
    setTorchEnabled(false)
    setQrResult(null)
    setScanCount(0)
    setDetectionHistory([])
  }, [stopCameraScanning, currentStream])

  // Alternar câmera
  const switchCamera = useCallback(() => {
    const newFacingMode = cameraFacingMode === "environment" ? "user" : "environment"
    setCameraFacingMode(newFacingMode)

    toast({
      title: "🔄 Alternando Câmera",
      description: `Mudando para câmera ${newFacingMode === "environment" ? "traseira" : "frontal"}...`,
    })
  }, [cameraFacingMode, toast])

  // Efeito para reiniciar câmera quando facing mode muda
  useEffect(() => {
    if (aberto && abaInicial === "camera" && temPermissaoCamera !== null) {
      iniciarCamera()
    }
  }, [cameraFacingMode])

  // Efeito para controlar a câmera quando a aba muda
  useEffect(() => {
    if (aberto && abaInicial === "camera") {
      checkCameraDevices()
      iniciarCamera()
    } else {
      pararCamera()
    }

    return () => {
      pararCamera()
    }
  }, [aberto, abaInicial])

  // Processamento de imagem (mantido igual)
  const processarImagemQr = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "❌ Erro no Upload",
          description: "Por favor, selecione um arquivo de imagem válido.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "❌ Arquivo Muito Grande",
          description: "Por favor, selecione uma imagem menor que 10MB.",
          variant: "destructive",
        })
        return
      }

      setEscaneandoImagem(true)
      setResultadoQrImagemEscaneada(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImagemEscaneada(e.target?.result as string)
        const img = new window.Image()
        img.onload = () => {
          const canvas = imageScanCanvasRef.current
          if (!canvas) {
            toast({
              title: "❌ Erro",
              description: "Erro no canvas de escaneamento.",
              variant: "destructive",
            })
            setEscaneandoImagem(false)
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d", { willReadFrequently: true })
          if (!ctx) {
            toast({
              title: "❌ Erro",
              description: "Erro no contexto do canvas.",
              variant: "destructive",
            })
            setEscaneandoImagem(false)
            return
          }

          ctx.drawImage(img, 0, 0, img.width, img.height)
          const imageData = ctx.getImageData(0, 0, img.width, img.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })

          if (code) {
            setResultadoQrImagemEscaneada(code.data)
            playSuccessSound()

            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200])
            }

            toast({
              title: "✅ QR Code Encontrado!",
              description: `Conteúdo detectado com sucesso`,
            })
          } else {
            setResultadoQrImagemEscaneada(null)
            toast({
              variant: "destructive",
              title: "❌ QR Code Não Encontrado",
              description: "Nenhum QR Code foi detectado na imagem. Tente uma imagem com melhor qualidade.",
            })
          }
          setEscaneandoImagem(false)
        }

        img.onerror = () => {
          toast({
            title: "❌ Erro",
            description: "Erro ao carregar a imagem.",
            variant: "destructive",
          })
          setEscaneandoImagem(false)
          setPreviewImagemEscaneada(null)
        }
        img.src = e.target?.result as string
      }

      reader.onerror = () => {
        toast({
          title: "❌ Erro de Leitura",
          description: "Erro ao ler o arquivo.",
          variant: "destructive",
        })
        setEscaneandoImagem(false)
        setPreviewImagemEscaneada(null)
      }
      reader.readAsDataURL(file)
    },
    [toast, playSuccessSound],
  )

  // Cleanup ao fechar
  useEffect(() => {
    if (!aberto) {
      setPreviewImagemEscaneada(null)
      setResultadoQrImagemEscaneada(null)
      setEscaneandoImagem(false)
      setDragOver(false)
      setTentandoCamera(false)
      setQrResult(null)
      setScanCount(0)
      setDetectionHistory([])
      if (imageScanInputRef.current) {
        imageScanInputRef.current.value = ""
      }
      pararCamera()
    }
  }, [aberto, pararCamera])

  // Handlers para imagem (mantidos iguais)
  const handleImageFileForScanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processarImagemQr(file)
    }
  }

  const handleCopyScannedResult = () => {
    if (resultadoQrImagemEscaneada) {
      navigator.clipboard
        .writeText(resultadoQrImagemEscaneada)
        .then(() =>
          toast({
            title: "📋 Copiado!",
            description: "Resultado do QR Code copiado para a área de transferência.",
          }),
        )
        .catch(() =>
          toast({
            variant: "destructive",
            title: "❌ Erro ao Copiar",
            description: "Não foi possível copiar o resultado.",
          }),
        )
    }
  }

  const handleOpenLink = () => {
    if (resultadoQrImagemEscaneada) {
      try {
        let url = resultadoQrImagemEscaneada
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          if (url.includes(".") && !url.includes(" ")) {
            url = "https://" + url
          } else {
            throw new Error("Not a valid URL")
          }
        }
        window.open(url, "_blank", "noopener,noreferrer")

        toast({
          title: "🔗 Link Aberto!",
          description: "Link foi aberto em uma nova aba",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "❌ Erro",
          description: "O conteúdo escaneado não é um link válido.",
        })
      }
    }
  }

  const handleDownloadResult = () => {
    if (resultadoQrImagemEscaneada) {
      const blob = new Blob([resultadoQrImagemEscaneada], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `qr_result_${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "📥 Resultado Baixado!",
        description: "Conteúdo do QR Code salvo em arquivo",
      })
    }
  }

  // Adicionar função para processar paste do clipboard
  const handlePasteImageForScan = useCallback(async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast({
          variant: "destructive",
          title: "❌ Paste Não Suportado",
          description: "Seu navegador não suporta colar imagens do clipboard",
        })
        return
      }

      const clipboardItems = await navigator.clipboard.read()

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type)
            const file = new File([blob], "pasted_image.png", { type: blob.type })
            processarImagemQr(file)

            toast({
              title: "📋 Imagem Colada!",
              description: "Imagem do clipboard foi processada com sucesso",
            })
            return
          }
        }
      }

      toast({
        variant: "destructive",
        title: "❌ Nenhuma Imagem",
        description: "Não há imagens no clipboard para colar",
      })
    } catch (err) {
      console.error("Paste error:", err)

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        toast({
          variant: "destructive",
          title: "❌ Permissão Negada",
          description: "Permissão para acessar clipboard foi negada",
        })
      } else {
        toast({
          variant: "destructive",
          title: "❌ Erro ao Colar",
          description: "Não foi possível colar a imagem do clipboard",
        })
      }
    }
  }, [processarImagemQr, toast])

  // Adicionar handlers para drag & drop melhorados:
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith("image/")) {
          processarImagemQr(file)
          toast({
            title: "📁 Arquivo Arrastado!",
            description: `Processando ${file.name}...`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "❌ Tipo Inválido",
            description: "Por favor, arraste apenas arquivos de imagem",
          })
        }
      }
    },
    [processarImagemQr, toast],
  )

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith("http") ? string : "https://" + string)
      return true
    } catch (_) {
      return false
    }
  }

  // Adicionar useEffect para listener de paste global:
  useEffect(() => {
    const handleGlobalPaste = (e: KeyboardEvent) => {
      if (aberto && abaInicial === "image" && (e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        handlePasteImageForScan()
      }
    }

    if (aberto && abaInicial === "image") {
      document.addEventListener("keydown", handleGlobalPaste)
      return () => document.removeEventListener("keydown", handleGlobalPaste)
    }
  }, [aberto, abaInicial, handlePasteImageForScan])

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[95vh] flex flex-col rounded-lg p-0">
        <DialogHeader className="p-4 border-b pr-10 sm:pr-12 shrink-0">
          <DialogTitle className="text-foreground text-left flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary animate-text-glow-primary" />
            Scanner de QR Code Avançado
            {scanCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {scanCount} scan{scanCount > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            Scanner em tempo real com detecção automática e múltiplas câmeras
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-auto p-4">
          <Tabs
            defaultValue="camera"
            value={abaInicial}
            onValueChange={(value) => onAbaChange(value as "camera" | "image")}
            className="flex flex-col h-full"
          >
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="camera" className="text-xs sm:text-sm">
                <Camera className="w-4 h-4 mr-1 sm:mr-2" />
                Câmera
                {scanningFromCamera && <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />}
              </TabsTrigger>
              <TabsTrigger value="image" className="text-xs sm:text-sm">
                <FileImage className="w-4 h-4 mr-1 sm:mr-2" />
                Imagem
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="flex-grow flex flex-col pt-4 min-h-0 space-y-4">
              {/* Controles da Câmera */}
              {temPermissaoCamera && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {hasMultipleCameras && (
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={tentandoCamera}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {cameraFacingMode === "environment" ? "Frontal" : "Traseira"}
                    </Button>
                  )}

                  {torchSupported && (
                    <Button
                      onClick={toggleTorch}
                      variant={torchEnabled ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      <Flashlight className="w-4 h-4 mr-1" />
                      Flash
                    </Button>
                  )}

                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant={soundEnabled ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
                    Som
                  </Button>

                  <Button
                    onClick={() => {
                      setDetectionHistory([])
                      setScanCount(0)
                      setResultadoQrImagemEscaneada(null)
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                </div>
              )}

              {/* Área do Vídeo */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />

                {/* Canvas para detecção */}
                <canvas ref={cameraCanvasRef} style={{ display: "none" }} />

                {/* Overlay de detecção */}
                <canvas
                  id="detection-overlay"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ mixBlendMode: "screen" }}
                />

                {/* Loading state */}
                {tentandoCamera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Iniciando câmera...</p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {abaInicial === "camera" && temPermissaoCamera === false && !tentandoCamera && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-sm">
                      <CameraOff className="h-5 w-5" />
                      <AlertTitle>Permissão Negada</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>Não foi possível acessar a câmera.</p>
                        <Button onClick={iniciarCamera} variant="outline" size="sm" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Tentar Novamente
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Scanning overlay */}
                {abaInicial === "camera" && temPermissaoCamera === true && !tentandoCamera && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    <div
                      className={`w-3/4 h-3/4 border-4 rounded-lg transition-all duration-300 ${
                        qrResult
                          ? "border-green-500 shadow-green-500/50 shadow-2xl"
                          : scanningFromCamera
                            ? "border-blue-500 animate-pulse shadow-blue-500/30 shadow-lg"
                            : "border-white/50"
                      }`}
                    >
                      {/* Cantos do scanner */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg"></div>

                      {/* Status do scanner */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {qrResult ? (
                          <div className="bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            QR Code Detectado!
                          </div>
                        ) : scanningFromCamera ? (
                          <div className="bg-blue-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 animate-pulse" />
                            Escaneando...
                          </div>
                        ) : (
                          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Aponte para um QR Code
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Histórico de Detecções */}
              {detectionHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Últimas Detecções:
                  </Label>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {detectionHistory.map((detection, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-muted rounded border font-mono break-all cursor-pointer hover:bg-muted/80"
                        onClick={() => {
                          navigator.clipboard.writeText(detection)
                          toast({ title: "📋 Copiado!", description: "Detecção copiada para área de transferência" })
                        }}
                      >
                        #{detectionHistory.length - index}: {detection.substring(0, 60)}
                        {detection.length > 60 ? "..." : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultado Atual */}
              {resultadoQrImagemEscaneada && abaInicial === "camera" && (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Último QR Code Detectado:
                        </span>
                      </div>

                      <div className="p-3 bg-background rounded border font-mono text-sm break-all max-h-32 overflow-y-auto custom-scrollbar">
                        {resultadoQrImagemEscaneada}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={handleCopyScannedResult} variant="outline" size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>

                        <Button onClick={handleDownloadResult} variant="outline" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>

                        {isValidUrl(resultadoQrImagemEscaneada) && (
                          <Button onClick={handleOpenLink} variant="default" size="sm" className="flex-1">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir Link
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="image" className="flex-grow flex flex-col space-y-4 pt-4 pb-2 min-h-0">
              <canvas ref={imageScanCanvasRef} style={{ display: "none" }} />

              {/* Área de Drag & Drop Melhorada */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
                  ${
                    dragOver
                      ? "border-primary bg-primary/5 scale-105 shadow-lg"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => imageScanInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`p-4 rounded-full transition-all duration-300 ${
                      dragOver ? "bg-primary/20 scale-110" : "bg-muted/50"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 transition-all duration-300 ${
                        dragOver ? "text-primary animate-bounce" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {dragOver ? "Solte a imagem aqui!" : "Arraste uma imagem ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Formatos suportados: JPG, PNG, GIF, WebP (máx. 10MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePasteImageForScan()
                      }}
                      className="mt-2"
                    >
                      <ClipboardCopy className="w-4 h-4 mr-2" />
                      Colar do Clipboard
                    </Button>
                  </div>
                </div>
                <Input
                  ref={imageScanInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileForScanChange}
                  className="hidden"
                />
              </div>

              {/* Dica de Atalho */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Dica:</strong> Você também pode usar{" "}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+V</kbd> para colar imagens
                </p>
              </div>

              {/* Preview da Imagem Melhorado */}
              {previewImagemEscaneada && !escaneandoImagem && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Imagem Carregada:</Label>
                  </div>

                  <Card className="p-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <img
                          src={previewImagemEscaneada || "/placeholder.svg"}
                          alt="Preview da imagem para escaneamento"
                          className="max-w-full max-h-48 object-contain border rounded-md shadow-sm bg-white"
                        />
                        {escaneandoImagem && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                            <div className="text-white text-center">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Escaneando...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Imagem carregada com sucesso. Aguarde o resultado do scan...
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Resultado do QR Code */}
              {resultadoQrImagemEscaneada && !escaneandoImagem && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <Label className="text-sm font-medium">Conteúdo do QR Code Escaneado:</Label>
                  </div>

                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-background rounded border font-mono text-sm break-all max-h-32 overflow-y-auto custom-scrollbar">
                          {resultadoQrImagemEscaneada}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button onClick={handleCopyScannedResult} variant="outline" size="sm" className="flex-1">
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>

                          <Button onClick={handleDownloadResult} variant="outline" size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>

                          {isValidUrl(resultadoQrImagemEscaneada) && (
                            <Button onClick={handleOpenLink} variant="default" size="sm" className="flex-1">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Abrir Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Estado de Erro */}
              {!resultadoQrImagemEscaneada && !escaneandoImagem && previewImagemEscaneada && (
                <Alert variant="default" className="border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    Nenhum QR Code foi detectado na imagem. Certifique-se de que:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>A imagem contém um QR Code visível</li>
                      <li>O QR Code está bem definido e não borrado</li>
                      <li>Há contraste suficiente entre o QR Code e o fundo</li>
                      <li>O QR Code não está muito pequeno na imagem</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onAbertoChange(false)} className="w-full sm:w-auto h-9">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
