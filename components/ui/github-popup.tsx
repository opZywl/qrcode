"use client"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LocalIcon } from "@/components/ui/local-icon"
import type { TranslationValue } from "@/lib/i18n"

const LINKS: Array<{ title: TranslationValue; description: TranslationValue; href: string }> = [
  {
    title: { pt: "Repositório do projeto", en: "Project repository", es: "Repositorio del proyecto" },
    description: { pt: "Acesse o código-fonte completo", en: "Browse the full source code", es: "Consulta el código fuente completo" },
    href: "https://github.com/opZywl/qrcode",
  },
  {
    title: { pt: "Criador", en: "Author", es: "Autor" },
    description: { pt: "Perfil do desenvolvedor", en: "Developer profile", es: "Perfil del desarrollador" },
    href: "https://github.com/opZywl",
  },
  {
    title: { pt: "Relatar problema", en: "Report an issue", es: "Informar un problema" },
    description: { pt: "Abrir uma nova issue", en: "Open a new issue", es: "Abrir una nueva issue" },
    href: "https://github.com/opZywl/qrcode/issues/new",
  },
]

export function GithubPopup() {
  const { t } = useLanguage()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="studio-icon-shell rounded-full bg-transparent hover:border-primary/35 hover:bg-primary/5">
          <img src="/portfolio/images/github.svg" alt="" className="h-[1.1rem] w-[1.1rem] object-contain invert dark:invert-0" />
          <span className="sr-only">GitHub</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="studio-hairline pb-4">
          <DialogTitle className="flex items-center gap-3">
            <span className="studio-icon-shell h-10 w-10 rounded-full">
              <img src="/portfolio/images/github.svg" alt="" className="h-[1.15rem] w-[1.15rem] object-contain invert dark:invert-0" />
            </span>
            GitHub
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t({ pt: "Links do projeto no GitHub", en: "Project links on GitHub", es: "Enlaces del proyecto en GitHub" })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-tile flex w-full items-center justify-between gap-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/35"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{t(link.title)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(link.description)}</p>
              </div>
              <span className="studio-icon-shell h-10 w-10 rounded-full">
                <LocalIcon name="share" className="h-4 w-4 text-primary" />
              </span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
