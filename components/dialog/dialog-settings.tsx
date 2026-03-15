"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AppLanguage } from "@/components/language-provider"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

interface DialogTypeItem {
  valor: TipoConteudoQR
  label: string
  categoria: string
}

const TYPES_BY_LANGUAGE: Record<"pt" | "en", DialogTypeItem[]> = {
  pt: [
    { valor: "url" as const, label: "URL", categoria: "Basico" },
    { valor: "wifi" as const, label: "WiFi", categoria: "Basico" },
    { valor: "whatsapp" as const, label: "WhatsApp", categoria: "Basico" },
    { valor: "whatsappGroup" as const, label: "Grupo WhatsApp", categoria: "Basico" },
    { valor: "phone" as const, label: "Telefone", categoria: "Basico" },
    { valor: "vcard" as const, label: "Contato", categoria: "Basico" },
    { valor: "vevent" as const, label: "Evento", categoria: "Basico" },
    { valor: "email" as const, label: "Email", categoria: "Basico" },
    { valor: "sms" as const, label: "SMS", categoria: "Basico" },
    { valor: "geo" as const, label: "Localizacao", categoria: "Basico" },
    { valor: "pix" as const, label: "PIX", categoria: "Avancado" },
    { valor: "appstore" as const, label: "App Store", categoria: "Avancado" },
    { valor: "spotify" as const, label: "Musica/Video", categoria: "Avancado" },
    { valor: "zoom" as const, label: "Videochamada", categoria: "Avancado" },
    { valor: "menu" as const, label: "Menu", categoria: "Avancado" },
    { valor: "cupom" as const, label: "Cupom", categoria: "Avancado" },
  ],
  en: [
    { valor: "url" as const, label: "URL", categoria: "Basic" },
    { valor: "wifi" as const, label: "Wi-Fi", categoria: "Basic" },
    { valor: "whatsapp" as const, label: "WhatsApp", categoria: "Basic" },
    { valor: "whatsappGroup" as const, label: "WhatsApp Group", categoria: "Basic" },
    { valor: "phone" as const, label: "Phone", categoria: "Basic" },
    { valor: "vcard" as const, label: "Contact", categoria: "Basic" },
    { valor: "vevent" as const, label: "Event", categoria: "Basic" },
    { valor: "email" as const, label: "Email", categoria: "Basic" },
    { valor: "sms" as const, label: "SMS", categoria: "Basic" },
    { valor: "geo" as const, label: "Location", categoria: "Basic" },
    { valor: "pix" as const, label: "PIX", categoria: "Advanced" },
    { valor: "appstore" as const, label: "App Store", categoria: "Advanced" },
    { valor: "spotify" as const, label: "Music/Video", categoria: "Advanced" },
    { valor: "zoom" as const, label: "Video call", categoria: "Advanced" },
    { valor: "menu" as const, label: "Menu", categoria: "Advanced" },
    { valor: "cupom" as const, label: "Coupon", categoria: "Advanced" },
  ],
}

const DEFAULT_VISIBLE: TipoConteudoQR[] = ["url", "wifi", "whatsapp", "whatsappGroup", "phone", "vcard", "vevent", "email", "sms", "geo"]

interface DialogConfiguracoesProps {
  aberto: boolean
  onAbertoChange: (open: boolean) => void
  tiposVisiveis: TipoConteudoQR[]
  onTiposVisiveisChange: (tipos: TipoConteudoQR[]) => void
  language?: AppLanguage
}

export function DialogSettings({
  aberto,
  onAbertoChange,
  tiposVisiveis,
  onTiposVisiveisChange,
  language = "pt",
}: DialogConfiguracoesProps) {
  const [localList, setLocalList] = useState<TipoConteudoQR[]>(tiposVisiveis.length ? tiposVisiveis : DEFAULT_VISIBLE)

  useEffect(() => {
    setLocalList(tiposVisiveis)
  }, [tiposVisiveis])

  const copy =
    language === "en"
      ? {
          title: "Customize types",
          selectAll: "Select all",
          basic: "Basic types",
          advanced: "Advanced types",
          cancel: "Cancel",
          save: "Save",
        }
      : {
          title: "Personalizar tipos",
          selectAll: "Selecionar todos",
          basic: "Tipos basicos",
          advanced: "Tipos avancados",
          cancel: "Cancelar",
          save: "Salvar",
        }

  function toggleType(tipo: TipoConteudoQR) {
    setLocalList((prev) => (prev.includes(tipo) ? prev.filter((item) => item !== tipo) : [...prev, tipo]))
  }

  function handleSave() {
    onTiposVisiveisChange(localList)
    onAbertoChange(false)
  }

  const locale = language === "en" ? "en" : "pt"
  const source = TYPES_BY_LANGUAGE[locale]
  const basicCategory = language === "en" ? "Basic" : "Basico"
  const advancedCategory = language === "en" ? "Advanced" : "Avancado"
  const tiposBasicos = source.filter((item) => item.categoria === basicCategory)
  const tiposAvancados = source.filter((item) => item.categoria === advancedCategory)

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setLocalList(source.map((item) => item.valor))}>
              {copy.selectAll}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-80 pr-2">
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">{copy.basic}</h4>
              <div className="space-y-2">
                {tiposBasicos.map((tipo) => (
                  <div key={tipo.valor} className="flex items-center gap-3">
                    <Checkbox checked={localList.includes(tipo.valor)} id={`chk-${tipo.valor}`} onCheckedChange={() => toggleType(tipo.valor)} />
                    <label htmlFor={`chk-${tipo.valor}`} className="cursor-pointer select-none text-sm font-medium">
                      {tipo.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">{copy.advanced}</h4>
              <div className="space-y-2">
                {tiposAvancados.map((tipo) => (
                  <div key={tipo.valor} className="flex items-center gap-3">
                    <Checkbox checked={localList.includes(tipo.valor)} id={`chk-${tipo.valor}`} onCheckedChange={() => toggleType(tipo.valor)} />
                    <label htmlFor={`chk-${tipo.valor}`} className="cursor-pointer select-none text-sm font-medium">
                      {tipo.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => onAbertoChange(false)}>
            {copy.cancel}
          </Button>
          <Button onClick={handleSave}>{copy.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
