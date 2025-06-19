"use client"

import { useState } from "react"
import { GeradorQRCode } from "@/components/qr-code/gerador-qr-code"
import { PopupPortfolio } from "@/components/ui/popup-portfolio"

export default function HomePage() {
  const [scannerAberto, setScannerAberto] = useState(false)
  const [abaScanner, setAbaScanner] = useState<"camera" | "image">("camera")
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <GeradorQRCode
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
