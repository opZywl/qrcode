"use client"

import { useState } from "react"
import { QrGenerator } from "@/components/qr-code/qr-generator"
import { PopupPortfolio } from "@/components/ui/popup-portfolio"

export default function HomePage() {
  const [scannerAberto, setScannerAberto] = useState(false)
  const [abaScanner, setAbaScanner] = useState<"camera" | "image">("camera")
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <QrGenerator
        scannerAberto={scannerAberto}
        onScannerAbertoChange={setScannerAberto}
        abaScannerInicial={abaScanner}
        onAbaScannerChange={setAbaScanner}
        historicoAberto={historicoAberto}
        onHistoricoAbertoChange={setHistoricoAberto}
      />
      <PopupPortfolio />
    </div>
  )
}
