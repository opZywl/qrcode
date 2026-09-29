"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CONTENT_TYPE_META } from "@/lib/qr/labels"
import { CONTENT_TYPES, type TipoConteudoQR } from "@/lib/qr/types"

interface DialogSettingsProps {
  aberto: boolean
  onAbertoChange: (open: boolean) => void
  tiposVisiveis: TipoConteudoQR[]
  onTiposVisiveisChange: (tipos: TipoConteudoQR[]) => void
}

function SettingsBody({
  initial,
  onSave,
  onCancel,
}: {
  initial: TipoConteudoQR[]
  onSave: (tipos: TipoConteudoQR[]) => void
  onCancel: () => void
}) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<TipoConteudoQR[]>(initial)

  const toggle = (tipo: TipoConteudoQR) =>
    setSelected((current) => (current.includes(tipo) ? current.filter((item) => item !== tipo) : [...current, tipo]))

  const groups = [
    { title: t({ pt: "Tipos básicos", en: "Basic types", es: "Tipos básicos" }), items: CONTENT_TYPES.filter((tipo) => !CONTENT_TYPE_META[tipo].advanced) },
    { title: t({ pt: "Tipos avançados", en: "Advanced types", es: "Tipos avanzados" }), items: CONTENT_TYPES.filter((tipo) => CONTENT_TYPE_META[tipo].advanced) },
  ]

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setSelected([...CONTENT_TYPES])}>
          {t({ pt: "Selecionar todos", en: "Select all", es: "Seleccionar todos" })}
        </Button>
      </div>

      <ScrollArea className="h-80 pr-2">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">{group.title}</h4>
              <div className="space-y-2">
                {group.items.map((tipo) => (
                  <div key={tipo} className="flex items-center gap-3">
                    <Checkbox id={`chk-${tipo}`} checked={selected.includes(tipo)} onCheckedChange={() => toggle(tipo)} />
                    <label htmlFor={`chk-${tipo}`} className="cursor-pointer select-none text-sm font-medium">
                      {t(CONTENT_TYPE_META[tipo].name)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-end gap-2 pt-4">
        {selected.length === 0 && (
          <p className="mr-auto text-xs text-destructive">
            {t({ pt: "Escolha pelo menos um tipo.", en: "Pick at least one type.", es: "Elige al menos un tipo." })}
          </p>
        )}
        <Button variant="secondary" onClick={onCancel}>
          {t({ pt: "Cancelar", en: "Cancel", es: "Cancelar" })}
        </Button>
        <Button onClick={() => onSave(CONTENT_TYPES.filter((tipo) => selected.includes(tipo)))} disabled={selected.length === 0}>
          {t({ pt: "Salvar", en: "Save", es: "Guardar" })}
        </Button>
      </div>
    </>
  )
}

export function DialogSettings({ aberto, onAbertoChange, tiposVisiveis, onTiposVisiveisChange }: DialogSettingsProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t({ pt: "Personalizar tipos", en: "Customize types", es: "Personalizar tipos" })}</DialogTitle>
          <DialogDescription>
            {t({
              pt: "Escolha quais formatos aparecem no seletor.",
              en: "Choose which formats appear in the selector.",
              es: "Elige qué formatos aparecen en el selector.",
            })}
          </DialogDescription>
        </DialogHeader>
        <SettingsBody
          initial={tiposVisiveis}
          onCancel={() => onAbertoChange(false)}
          onSave={(tipos) => {
            onTiposVisiveisChange(tipos)
            onAbertoChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
