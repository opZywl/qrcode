"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"
import { LocalIcon } from "@/components/ui/local-icon"

type Idioma = "pt" | "en" | "es"

interface IdiomaInfo {
  codigo: Idioma
  nome: string
  bandeira: string
}

const idiomas: IdiomaInfo[] = [
  { codigo: "pt", nome: "Portuguese", bandeira: "BR" },
  { codigo: "en", nome: "English", bandeira: "US" },
  { codigo: "es", nome: "Spanish", bandeira: "ES" },
]

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => setMontado(true), [])

  if (!montado) {
    return <div className="h-10 w-10 rounded-full border border-border/60 bg-background/40" />
  }

  const idiomaAtual = idiomas.find((idioma) => idioma.codigo === language) ?? idiomas[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="studio-icon-shell relative rounded-full bg-transparent hover:border-primary/35 hover:bg-primary/5"
        >
          <LocalIcon name="globe" className="h-[1.15rem] w-[1.15rem] text-primary" />
          <span className="absolute -bottom-1.5 -right-1 rounded-full border border-border/80 bg-background px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-foreground dark:border-dark-5/40 dark:bg-dark-4">
            {idiomaAtual.bandeira}
          </span>
          <span className="sr-only">{t({ pt: "Selecionar idioma", en: "Select language", es: "Seleccionar idioma" })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {idiomas.map((idioma) => (
          <DropdownMenuItem
            key={idioma.codigo}
            onClick={() => setLanguage(idioma.codigo)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border/70 px-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                {idioma.bandeira}
              </span>
              <span className="text-sm">{idioma.nome}</span>
            </div>
            <span
              className={language === idioma.codigo ? "h-2 w-2 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-transparent"}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
