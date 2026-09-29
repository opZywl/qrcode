"use client"

import type React from "react"
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import jsQR, { type QRCode } from "jsqr"
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  ClipboardCopy,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  Flashlight,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Target,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { toHttpUrl } from "@/lib/qr/url"

export type ScannerTab = "camera" | "image"

interface DialogScannerProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  aba: ScannerTab
  onAbaChange: (aba: ScannerTab) => void
}

type CameraStatus = "active" | "denied" | "notFound" | "busy" | "unsupported" | "error"

type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean }

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const CAMERA_SCAN_SIZE = 720
const IMAGE_SCAN_SIZES = [1600, 1000, 600]
const DETECTION_PAUSE_MS = 2000
const SCAN_INTERVAL_MS = 120

let sharedScanCanvas: HTMLCanvasElement | null = null

function getScanCanvas() {
  sharedScanCanvas ??= document.createElement("canvas")
  return sharedScanCanvas
}

function decodeFrom(source: CanvasImageSource, width: number, height: number, maxSize: number, canvas: HTMLCanvasElement) {
  const scale = Math.min(1, maxSize / Math.max(width, height))
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) {
    return null
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  return jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" })
}

function drawOverlay(canvas: HTMLCanvasElement, width: number, height: number, code: QRCode) {
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) {
    return
  }
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = code.location
  context.clearRect(0, 0, width, height)
  context.strokeStyle = "#00ff00"
  context.lineWidth = 4
  context.shadowColor = "#00ff00"
  context.shadowBlur = 10
  context.beginPath()
  context.moveTo(topLeftCorner.x, topLeftCorner.y)
  context.lineTo(topRightCorner.x, topRightCorner.y)
  context.lineTo(bottomRightCorner.x, bottomRightCorner.y)
  context.lineTo(bottomLeftCorner.x, bottomLeftCorner.y)
  context.closePath()
  context.stroke()
  context.strokeStyle = "#ffff00"
  context.lineWidth = 6
  context.shadowColor = "#ffff00"
  for (const corner of [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner]) {
    context.beginPath()
    context.arc(corner.x, corner.y, 10, 0, 2 * Math.PI)
    context.stroke()
  }
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
}

function cameraStatusFromError(error: unknown): CameraStatus {
  if (!(error instanceof DOMException)) {
    return "error"
  }
  switch (error.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "denied"
    case "NotFoundError":
    case "OverconstrainedError":
      return "notFound"
    case "NotReadableError":
    case "AbortError":
      return "busy"
    default:
      return "error"
  }
}

export function DialogScanner({ aberto, onAbertoChange, aba, onAbaChange }: DialogScannerProps) {
  const { t } = useLanguage()

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [attempt, setAttempt] = useState(0)
  const [cameraResult, setCameraResult] = useState<{ key: string; status: CameraStatus } | null>(null)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [detected, setDetected] = useState(false)
  const [scanCount, setScanCount] = useState(0)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])
  const [cameraResultText, setCameraResultText] = useState<string | null>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageResult, setImageResult] = useState<string | null>(null)
  const [imageScanning, setImageScanning] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoMounted, setVideoMounted] = useState(false)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const cameraKey = aberto && aba === "camera" ? `${facingMode}:${attempt}` : null
  const cameraStatus = cameraKey === null ? "idle" : cameraResult?.key === cameraKey ? cameraResult.status : "starting"

  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) {
      return
    }
    try {
      audioContextRef.current ??= new AudioContext()
      const context = audioContextRef.current
      void context.resume()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.frequency.setValueAtTime(800, context.currentTime)
      oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1)
      gain.gain.setValueAtTime(0, context.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05)
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.2)
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.2)
    } catch {}
  }, [soundEnabled])

  const notifyDetection = useCallback(
    (data: string, source: "camera" | "image") => {
      playSuccessSound()
      navigator.vibrate?.([200, 100, 200])
      toast({
        title: t({ pt: "QR Code detectado", en: "QR code detected", es: "Código QR detectado" }),
        description: source === "camera" ? `${data.slice(0, 60)}${data.length > 60 ? "…" : ""}` : t({ pt: "Conteúdo lido com sucesso.", en: "Content read successfully.", es: "Contenido leído correctamente." }),
      })
    },
    [playSuccessSound, t],
  )

  const onCameraDetection = useEffectEvent((code: QRCode, width: number, height: number) => {
    if (overlayRef.current) {
      drawOverlay(overlayRef.current, width, height, code)
    }
    setDetected(true)
    setScanCount((count) => count + 1)
    setCameraResultText(code.data)
    setDetectionHistory((history) => [code.data, ...history.filter((item) => item !== code.data)].slice(0, 5))
    notifyDetection(code.data, "camera")
  })

  const onDetectionCleared = useEffectEvent(() => {
    clearCanvas(overlayRef.current)
    setDetected(false)
  })

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    setVideoMounted(node !== null)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!cameraKey || !videoMounted || !video) {
      return
    }

    let cancelled = false
    let frame = 0
    let lastScan = 0
    let pausedUntil = 0
    let resumeTimer = 0
    const overlay = overlayRef.current

    const loop = (timestamp: number) => {
      if (cancelled) {
        return
      }
      if (video.readyState >= video.HAVE_ENOUGH_DATA && timestamp - lastScan >= SCAN_INTERVAL_MS && Date.now() >= pausedUntil) {
        lastScan = timestamp
        const canvas = getScanCanvas()
        const code = decodeFrom(video, video.videoWidth, video.videoHeight, CAMERA_SCAN_SIZE, canvas)
        if (code?.data) {
          pausedUntil = Date.now() + DETECTION_PAUSE_MS
          onCameraDetection(code, canvas.width, canvas.height)
          window.clearTimeout(resumeTimer)
          resumeTimer = window.setTimeout(onDetectionCleared, DETECTION_PAUSE_MS)
        }
      }
      frame = requestAnimationFrame(loop)
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraResult({ key: cameraKey, status: "unsupported" })
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        video.srcObject = stream
        void video.play().catch(() => {})

        const [track] = stream.getVideoTracks()
        const capabilities = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
        setTorchSupported(!!capabilities?.torch)
        setTorchEnabled(false)
        setDetected(false)

        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
        if (cancelled) {
          return
        }
        setHasMultipleCameras(devices.filter((device) => device.kind === "videoinput").length > 1)
        setCameraResult({ key: cameraKey, status: "active" })
        frame = requestAnimationFrame(loop)
      } catch (error) {
        if (!cancelled) {
          setCameraResult({ key: cameraKey, status: cameraStatusFromError(error) })
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(resumeTimer)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      video.srcObject = null
      clearCanvas(overlay)
    }
  }, [cameraKey, facingMode, videoMounted])

  useEffect(() => {
    return () => {
      void audioContextRef.current?.close().catch(() => {})
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const setPreviewUrl = useCallback((url: string | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = url
    setImagePreview(url)
  }, [])

  const processImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: t({ pt: "Arquivo inválido", en: "Invalid file", es: "Archivo no válido" }),
          description: t({ pt: "Selecione uma imagem.", en: "Choose an image.", es: "Elige una imagen." }),
        })
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast({
          variant: "destructive",
          title: t({ pt: "Arquivo muito grande", en: "File too large", es: "Archivo demasiado grande" }),
          description: t({ pt: "Use uma imagem de até 10 MB.", en: "Use an image up to 10 MB.", es: "Usa una imagen de hasta 10 MB." }),
        })
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setImageResult(null)
      setImageScanning(true)

      try {
        const image = new Image()
        image.src = url
        await image.decode()
        let code: QRCode | null = null
        for (const size of IMAGE_SCAN_SIZES) {
          code = decodeFrom(image, image.naturalWidth, image.naturalHeight, size, getScanCanvas())
          if (code?.data) {
            break
          }
        }
        if (code?.data) {
          setImageResult(code.data)
          notifyDetection(code.data, "image")
        } else {
          toast({
            variant: "destructive",
            title: t({ pt: "QR Code não encontrado", en: "QR code not found", es: "Código QR no encontrado" }),
            description: t({
              pt: "Tente uma imagem mais nítida ou com o QR Code maior.",
              en: "Try a sharper image or one where the QR code is bigger.",
              es: "Prueba una imagen más nítida o con el código QR más grande.",
            }),
          })
        }
      } catch {
        toast({
          variant: "destructive",
          title: t({ pt: "Erro", en: "Error", es: "Error" }),
          description: t({ pt: "Não foi possível abrir a imagem.", en: "Could not open the image.", es: "No se pudo abrir la imagen." }),
        })
        setPreviewUrl(null)
      } finally {
        setImageScanning(false)
      }
    },
    [notifyDetection, setPreviewUrl, t],
  )

  useEffect(() => {
    if (!aberto || aba !== "image") {
      return
    }
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"))
      if (file) {
        event.preventDefault()
        void processImage(file)
      }
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [aberto, aba, processImage])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewUrl(null)
      setImageResult(null)
      setImageScanning(false)
      setDragOver(false)
      setCameraResultText(null)
      setDetectionHistory([])
      setScanCount(0)
      setDetected(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
    onAbertoChange(open)
  }

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) {
      return
    }
    const next = !torchEnabled
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraint] })
      setTorchEnabled(next)
    } catch {
      toast({
        variant: "destructive",
        title: t({ pt: "Flash indisponível", en: "Flash unavailable", es: "Flash no disponible" }),
        description: t({ pt: "Não foi possível controlar o flash.", en: "Could not control the flash.", es: "No se pudo controlar el flash." }),
      })
    }
  }

  const pasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        throw new Error("unsupported")
      }
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((entry) => entry.startsWith("image/"))
        if (type) {
          const blob = await item.getType(type)
          await processImage(new File([blob], "clipboard", { type: blob.type }))
          return
        }
      }
      toast({
        variant: "destructive",
        title: t({ pt: "Nenhuma imagem", en: "No image", es: "Sin imagen" }),
        description: t({ pt: "Não há imagem na área de transferência.", en: "There is no image in the clipboard.", es: "No hay ninguna imagen en el portapapeles." }),
      })
    } catch {
      toast({
        variant: "destructive",
        title: t({ pt: "Não foi possível colar", en: "Could not paste", es: "No se pudo pegar" }),
        description: t({
          pt: "Use Ctrl+V com a janela em foco ou selecione o arquivo.",
          en: "Press Ctrl+V with this window focused or choose the file.",
          es: "Pulsa Ctrl+V con esta ventana activa o elige el archivo.",
        }),
      })
    }
  }

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: t({ pt: "Copiado", en: "Copied", es: "Copiado" }), description: t({ pt: "Conteúdo copiado.", en: "Content copied.", es: "Contenido copiado." }) })
    } catch {
      toast({ variant: "destructive", title: t({ pt: "Erro", en: "Error", es: "Error" }), description: t({ pt: "Não foi possível copiar.", en: "Could not copy.", es: "No se pudo copiar." }) })
    }
  }

  const downloadText = (value: string) => {
    const url = URL.createObjectURL(new Blob([value], { type: "text/plain;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `qr_result_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const renderResultActions = (value: string) => {
    const url = toHttpUrl(value)
    return (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void copyText(value)} variant="outline" size="sm" className="flex-1">
          <Copy className="mr-2 h-4 w-4" />
          {t({ pt: "Copiar", en: "Copy", es: "Copiar" })}
        </Button>
        <Button onClick={() => downloadText(value)} variant="outline" size="sm" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          {t({ pt: "Baixar", en: "Download", es: "Descargar" })}
        </Button>
        {url && (
          <Button asChild variant="default" size="sm" className="min-w-0 flex-1">
            <a href={url.href} target="_blank" rel="noopener noreferrer nofollow" title={url.href}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span className="truncate">
                {t({ pt: "Abrir", en: "Open", es: "Abrir" })} {url.hostname}
              </span>
            </a>
          </Button>
        )}
      </div>
    )
  }

  const cameraErrorMessage =
    cameraStatus === "denied"
      ? t({
          pt: "Permissão de câmera negada. Libere o acesso nas configurações do navegador.",
          en: "Camera permission denied. Allow access in the browser settings.",
          es: "Permiso de cámara denegado. Permite el acceso en los ajustes del navegador.",
        })
      : cameraStatus === "notFound"
        ? t({ pt: "Nenhuma câmera encontrada.", en: "No camera found.", es: "No se encontró ninguna cámara." })
        : cameraStatus === "busy"
          ? t({ pt: "A câmera está em uso por outro aplicativo.", en: "The camera is being used by another app.", es: "Otra aplicación está usando la cámara." })
          : cameraStatus === "unsupported"
            ? t({
                pt: "Este navegador não permite acesso à câmera aqui (é preciso HTTPS).",
                en: "This browser does not allow camera access here (HTTPS is required).",
                es: "Este navegador no permite acceder a la cámara aquí (se requiere HTTPS).",
              })
            : t({ pt: "Não foi possível acessar a câmera.", en: "Could not access the camera.", es: "No se pudo acceder a la cámara." })

  const cameraFailed = cameraStatus !== "idle" && cameraStatus !== "starting" && cameraStatus !== "active"

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[95vh] w-[95vw] flex-col rounded-lg p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b p-4 pr-10 sm:pr-12">
          <DialogTitle className="flex items-center gap-2 text-left text-foreground">
            <ScanLine className="h-5 w-5 animate-text-glow-primary text-primary" />
            Scanner
            {scanCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {scanCount} scan{scanCount > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground">
            {t({
              pt: "Leia QR Codes pela câmera ou por uma imagem.",
              en: "Read QR codes with the camera or from an image.",
              es: "Lee códigos QR con la cámara o desde una imagen.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grow overflow-auto p-4">
          <Tabs value={aba} onValueChange={(value) => onAbaChange(value as ScannerTab)} className="flex h-full flex-col">
            <TabsList className="grid w-full shrink-0 grid-cols-2">
              <TabsTrigger value="camera" className="text-xs sm:text-sm">
                <Camera className="mr-1 h-4 w-4 sm:mr-2" />
                {t({ pt: "Câmera", en: "Camera", es: "Cámara" })}
                {cameraStatus === "active" && !detected && <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="image" className="text-xs sm:text-sm">
                <FileImage className="mr-1 h-4 w-4 sm:mr-2" />
                {t({ pt: "Imagem", en: "Image", es: "Imagen" })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="flex min-h-0 grow flex-col space-y-4 pt-4">
              {cameraStatus === "active" && (
                <div className="flex flex-wrap justify-center gap-2">
                  {hasMultipleCameras && (
                    <Button
                      onClick={() => setFacingMode((current) => (current === "environment" ? "user" : "environment"))}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      {facingMode === "environment"
                        ? t({ pt: "Frontal", en: "Front", es: "Frontal" })
                        : t({ pt: "Traseira", en: "Rear", es: "Trasera" })}
                    </Button>
                  )}
                  {torchSupported && (
                    <Button onClick={() => void toggleTorch()} variant={torchEnabled ? "default" : "outline"} size="sm" className="text-xs" aria-pressed={torchEnabled}>
                      <Flashlight className="mr-1 h-4 w-4" />
                      Flash
                    </Button>
                  )}
                  <Button
                    onClick={() => setSoundEnabled((current) => !current)}
                    variant={soundEnabled ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? <Volume2 className="mr-1 h-4 w-4" /> : <VolumeX className="mr-1 h-4 w-4" />}
                    {t({ pt: "Som", en: "Sound", es: "Sonido" })}
                  </Button>
                  <Button
                    onClick={() => {
                      setDetectionHistory([])
                      setScanCount(0)
                      setCameraResultText(null)
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    {t({ pt: "Limpar", en: "Clear", es: "Borrar" })}
                  </Button>
                </div>
              )}

              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <video ref={attachVideo} className="h-full w-full object-cover" autoPlay muted playsInline />
                <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ mixBlendMode: "screen" }} />

                {cameraStatus === "starting" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
                      <p className="text-sm">{t({ pt: "Iniciando câmera...", en: "Starting camera...", es: "Iniciando cámara..." })}</p>
                    </div>
                  </div>
                )}

                {cameraFailed && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-sm">
                      <CameraOff className="h-5 w-5" />
                      <AlertTitle>{t({ pt: "Câmera indisponível", en: "Camera unavailable", es: "Cámara no disponible" })}</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>{cameraErrorMessage}</p>
                        <Button onClick={() => setAttempt((current) => current + 1)} variant="outline" size="sm" className="w-full">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t({ pt: "Tentar novamente", en: "Try again", es: "Intentar de nuevo" })}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {cameraStatus === "active" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                    <div
                      className={`h-3/4 w-3/4 rounded-lg border-4 transition-all duration-300 ${
                        detected ? "border-green-500 shadow-2xl shadow-green-500/50" : "animate-pulse border-blue-500 shadow-lg shadow-blue-500/30"
                      }`}
                    >
                      <div className="absolute left-2 top-2 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-white" />
                      <div className="absolute right-2 top-2 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-white" />
                      <div className="absolute bottom-2 left-2 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-white" />
                      <div className="absolute bottom-2 right-2 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-white" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {detected ? (
                          <div className="flex items-center gap-2 rounded-full bg-green-500/90 px-4 py-2 text-sm font-medium text-white">
                            <CheckCircle className="h-4 w-4" />
                            {t({ pt: "QR Code detectado!", en: "QR code detected!", es: "¡Código QR detectado!" })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-blue-500/90 px-4 py-2 text-sm font-medium text-white">
                            <Target className="h-4 w-4 animate-pulse" />
                            {t({ pt: "Escaneando...", en: "Scanning...", es: "Escaneando..." })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {detectionHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary" />
                    {t({ pt: "Últimas detecções", en: "Latest detections", es: "Últimas detecciones" })}
                  </Label>
                  <div className="max-h-24 space-y-1 overflow-y-auto">
                    {detectionHistory.map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => void copyText(item)}
                        title={t({ pt: "Copiar", en: "Copy", es: "Copiar" })}
                        className="w-full break-all rounded border bg-muted p-2 text-left font-mono text-xs hover:bg-muted/80"
                      >
                        #{detectionHistory.length - index}: {item.slice(0, 60)}
                        {item.length > 60 ? "…" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {cameraResultText && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {t({ pt: "Último QR Code detectado", en: "Last detected QR code", es: "Último código QR detectado" })}
                        </span>
                      </div>
                      <div className="custom-scrollbar max-h-32 overflow-y-auto whitespace-pre-wrap break-all rounded border bg-background p-3 font-mono text-sm">
                        {cameraResultText}
                      </div>
                      {renderResultActions(cameraResultText)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="image" className="flex min-h-0 grow flex-col space-y-4 pb-2 pt-4">
              <div
                role="button"
                tabIndex={0}
                aria-label={t({ pt: "Selecionar imagem para escanear", en: "Choose an image to scan", es: "Elegir una imagen para escanear" })}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  dragOver ? "scale-105 border-primary bg-primary/5 shadow-lg" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setDragOver(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOver(false)
                  const file = event.dataTransfer.files[0]
                  if (file) {
                    void processImage(file)
                  }
                }}
                onClick={() => imageInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    imageInputRef.current?.click()
                  }
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`rounded-full p-4 transition-all duration-300 ${dragOver ? "scale-110 bg-primary/20" : "bg-muted/50"}`}>
                    <Upload className={`h-8 w-8 transition-all duration-300 ${dragOver ? "animate-bounce text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      {dragOver
                        ? t({ pt: "Solte a imagem aqui!", en: "Drop the image here!", es: "¡Suelta la imagen aquí!" })
                        : t({
                            pt: "Arraste uma imagem ou clique para selecionar",
                            en: "Drag an image or click to choose one",
                            es: "Arrastra una imagen o haz clic para elegirla",
                          })}
                    </p>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {t({ pt: "JPG, PNG, GIF ou WebP (máx. 10 MB)", en: "JPG, PNG, GIF or WebP (max 10 MB)", es: "JPG, PNG, GIF o WebP (máx. 10 MB)" })}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        void pasteFromClipboard()
                      }}
                      className="mt-2"
                    >
                      <ClipboardCopy className="mr-2 h-4 w-4" />
                      {t({ pt: "Colar da área de transferência", en: "Paste from clipboard", es: "Pegar del portapapeles" })}
                    </Button>
                  </div>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void processImage(file)
                    }
                  }}
                  className="hidden"
                />
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {t({ pt: "Dica: você também pode usar", en: "Tip: you can also use", es: "Consejo: también puedes usar" })}{" "}
                <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Ctrl+V</kbd>{" "}
                {t({ pt: "para colar imagens", en: "to paste images", es: "para pegar imágenes" })}
              </p>

              {imagePreview && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">{t({ pt: "Imagem carregada", en: "Loaded image", es: "Imagen cargada" })}</Label>
                  </div>
                  <Card className="p-4">
                    <div className="relative mx-auto">
                      <img
                        src={imagePreview}
                        alt={t({ pt: "Imagem enviada para leitura", en: "Image sent for scanning", es: "Imagen enviada para escanear" })}
                        className="mx-auto max-h-48 max-w-full rounded-md border bg-white object-contain shadow-sm"
                      />
                      {imageScanning && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                          <div className="text-center text-white">
                            <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
                            <p className="text-sm">{t({ pt: "Escaneando...", en: "Scanning...", es: "Escaneando..." })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {imageResult && !imageScanning && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-medium">{t({ pt: "Conteúdo do QR Code", en: "QR code content", es: "Contenido del código QR" })}</Label>
                  </div>
                  <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="custom-scrollbar max-h-32 overflow-y-auto whitespace-pre-wrap break-all rounded border bg-background p-3 font-mono text-sm">
                          {imageResult}
                        </div>
                        {renderResultActions(imageResult)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!imageResult && !imageScanning && imagePreview && (
                <Alert variant="default" className="border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    {t({ pt: "Nenhum QR Code foi detectado. Confira se:", en: "No QR code was detected. Check that:", es: "No se detectó ningún código QR. Comprueba que:" })}
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>{t({ pt: "O QR Code está visível e inteiro", en: "The QR code is visible and complete", es: "El código QR es visible y está completo" })}</li>
                      <li>{t({ pt: "A imagem não está borrada", en: "The image is not blurry", es: "La imagen no está borrosa" })}</li>
                      <li>{t({ pt: "Há contraste entre o QR e o fundo", en: "There is contrast between the QR and the background", es: "Hay contraste entre el QR y el fondo" })}</li>
                      <li>{t({ pt: "O QR Code não está pequeno demais", en: "The QR code is not too small", es: "El código QR no es demasiado pequeño" })}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="shrink-0 border-t p-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-9 w-full sm:w-auto">
            {t({ pt: "Fechar", en: "Close", es: "Cerrar" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
