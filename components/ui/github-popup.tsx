"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LocalIcon } from "@/components/ui/local-icon"

const links = [
  {
    title: "Repositorio do projeto",
    description: "Acesse o codigo fonte completo",
    href: "https://github.com/opZywl/qrcode",
  },
  {
    title: "Criador",
    description: "Perfil do desenvolvedor",
    href: "https://github.com/opZywl",
  },
  {
    title: "Relatar problema",
    description: "Abrir uma nova issue",
    href: "https://github.com/opZywl/qrcode/issues/new",
  },
]

export function GithubPopup() {
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => setMontado(true), [])

  if (!montado) {
    return <div className="h-10 w-10 rounded-full border border-border/60 bg-background/40" />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="studio-icon-shell rounded-full bg-transparent hover:border-primary/35 hover:bg-primary/5"
        >
          <img
            src="/portfolio/images/github.svg"
            alt=""
            className="h-[1.1rem] w-[1.1rem] object-contain invert dark:invert-0"
          />
          <span className="sr-only">GitHub</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="studio-hairline pb-4">
          <DialogTitle className="flex items-center gap-3">
            <span className="studio-icon-shell h-10 w-10 rounded-full">
              <img
                src="/portfolio/images/github.svg"
                alt=""
                className="h-[1.15rem] w-[1.15rem] object-contain invert dark:invert-0"
              />
            </span>
            GitHub
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => window.open(link.href, "_blank")}
              className="studio-tile flex w-full items-center justify-between gap-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/35"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{link.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
              </div>
              <span className="studio-icon-shell h-10 w-10 rounded-full">
                <LocalIcon name="share" className="h-4 w-4 text-primary" />
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
