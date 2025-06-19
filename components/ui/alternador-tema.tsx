"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Tema = "light" | "dark" | "system"

export function AlternadorTema() {
  const [tema, setTemaState] = React.useState<Tema>("system")
  const [temaEfetivo, setTemaEfetivo] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const temaSalvo = localStorage.getItem("tema") as Tema | null
    if (temaSalvo) {
      setTemaState(temaSalvo)
    }
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const aplicarTema = (escolhaAtualTema: Tema) => {
      let temaFinal: "light" | "dark"
      if (escolhaAtualTema === "system") {
        temaFinal = mediaQuery.matches ? "dark" : "light"
      } else {
        temaFinal = escolhaAtualTema
      }

      root.classList.remove("light", "dark")
      root.classList.add(temaFinal)
      setTemaEfetivo(temaFinal)
    }

    aplicarTema(tema)

    const handleChange = () => {
      if (tema === "system") {
        aplicarTema("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [tema])

  const setTema = (novoTema: Tema) => {
    localStorage.setItem("tema", novoTema)
    setTemaState(novoTema)
  }

  const [montado, setMontado] = React.useState(false)
  React.useEffect(() => setMontado(true), [])

  if (!montado) {
    return <div style={{ width: "40px", height: "40px" }} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {temaEfetivo === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTema("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTema("dark")}>Escuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTema("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
