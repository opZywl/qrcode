"use client"

import * as React from "react"
import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Idioma = "pt" | "en" | "es"

interface IdiomaInfo {
  codigo: Idioma
  nome: string
  bandeira: string
}

const idiomas: IdiomaInfo[] = [
  { codigo: "pt", nome: "Português", bandeira: "🇧🇷" },
  { codigo: "en", nome: "English", bandeira: "🇺🇸" },
  { codigo: "es", nome: "Español", bandeira: "🇪🇸" },
]

export function LanguageSelector() {
  const [idiomaSelecionado, setIdiomaSelecionado] = React.useState<Idioma>("pt")
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => setMontado(true), [])

  if (!montado) {
    return <div style={{ width: "40px", height: "40px" }} />
  }

  const idiomaAtual = idiomas.find((i) => i.codigo === idiomaSelecionado) || idiomas[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
        >
          <Languages className="h-[1.2rem] w-[1.2rem] text-primary animate-text-glow-primary" />
          <span className="absolute -bottom-1 -right-1 text-xs">{idiomaAtual.bandeira}</span>
          <span className="sr-only">Selecionar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {idiomas.map((idioma) => (
          <DropdownMenuItem
            key={idioma.codigo}
            onClick={() => setIdiomaSelecionado(idioma.codigo)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{idioma.bandeira}</span>
              <span className="text-sm">{idioma.nome}</span>
            </div>
            {idiomaSelecionado === idioma.codigo && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
