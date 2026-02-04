"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

const TIPOS_DISPONIVEIS: Array<{ valor: TipoConteudoQR; label: string; categoria: string }> = [
    { valor: "url", label: "URL", categoria: "Básico" },
    { valor: "wifi", label: "WiFi", categoria: "Básico" },
    { valor: "whatsapp", label: "WhatsApp", categoria: "Básico" },
    { valor: "whatsappGroup", label: "Grupo WhatsApp", categoria: "Básico" },
    { valor: "phone", label: "Telefone", categoria: "Básico" },
    { valor: "vcard", label: "Contato", categoria: "Básico" },
    { valor: "vevent", label: "Evento", categoria: "Básico" },
    { valor: "email", label: "Email", categoria: "Básico" },
    { valor: "sms", label: "SMS", categoria: "Básico" },
    { valor: "geo", label: "Localização", categoria: "Básico" },
    { valor: "pix", label: "PIX", categoria: "Avançado" },
    { valor: "appstore", label: "App Store", categoria: "Avançado" },
    { valor: "spotify", label: "Música/Vídeo", categoria: "Avançado" },
    { valor: "zoom", label: "Videochamada", categoria: "Avançado" },
    { valor: "menu", label: "Menu", categoria: "Avançado" },
    { valor: "cupom", label: "Cupom", categoria: "Avançado" },
]

const DEFAULT_VISIBLE: TipoConteudoQR[] = ["url", "wifi", "whatsapp", "whatsappGroup", "phone", "vcard", "vevent", "email", "sms", "geo"]

interface DialogConfiguracoesProps {
    aberto: boolean
    onAbertoChange: (open: boolean) => void
    tiposVisiveis: TipoConteudoQR[]
    onTiposVisiveisChange: (tipos: TipoConteudoQR[]) => void
}

export function DialogSettings({
    aberto,
    onAbertoChange,
    tiposVisiveis,
    onTiposVisiveisChange,
}: DialogConfiguracoesProps) {
    const [localList, setLocalList] = useState<TipoConteudoQR[]>(tiposVisiveis.length ? tiposVisiveis : DEFAULT_VISIBLE)

    useEffect(() => {
        setLocalList(tiposVisiveis)
    }, [tiposVisiveis])

    function toggleType(tipo: TipoConteudoQR) {
        setLocalList((prev) => {
            if (prev.includes(tipo)) {
                return prev.filter((t) => t !== tipo)
            } else {
                return [...prev, tipo]
            }
        })
    }

    function handleSave() {
        onTiposVisiveisChange(localList)
        onAbertoChange(false)
    }

    const tiposBasicos = TIPOS_DISPONIVEIS.filter((t) => t.categoria === "Básico")
    const tiposAvancados = TIPOS_DISPONIVEIS.filter((t) => t.categoria === "Avançado")

    return (
        <Dialog open={aberto} onOpenChange={onAbertoChange}>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Personalizar Tipos</DialogTitle>
                    <div className="flex justify-end pt-2">
                        <Button variant="outline" size="sm" onClick={() => setLocalList(TIPOS_DISPONIVEIS.map((t) => t.valor))}>
                            Selecionar Todos
                        </Button>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-80 pr-2">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Tipos Básicos</h4>
                            <div className="space-y-2">
                                {tiposBasicos.map((tipo) => (
                                    <div key={tipo.valor} className="flex items-center gap-3">
                                        <Checkbox
                                            checked={localList.includes(tipo.valor)}
                                            id={`chk-${tipo.valor}`}
                                            onCheckedChange={() => toggleType(tipo.valor)}
                                        />
                                        <label htmlFor={`chk-${tipo.valor}`} className="text-sm font-medium cursor-pointer select-none">
                                            {tipo.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Tipos Avançados</h4>
                            <div className="space-y-2">
                                {tiposAvancados.map((tipo) => (
                                    <div key={tipo.valor} className="flex items-center gap-3">
                                        <Checkbox
                                            checked={localList.includes(tipo.valor)}
                                            id={`chk-${tipo.valor}`}
                                            onCheckedChange={() => toggleType(tipo.valor)}
                                        />
                                        <label htmlFor={`chk-${tipo.valor}`} className="text-sm font-medium cursor-pointer select-none">
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
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}