"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LocalIcon } from "@/components/ui/local-icon"
import { PortfolioPanel } from "@/components/ui/portfolio-panel"
import { useHydrated } from "@/hooks/use-hydrated"
import { useIsMobile } from "@/hooks/use-mobile"

export function PopupPortfolio() {
  const { t } = useLanguage()
  const hydrated = useHydrated()
  const isMobile = useIsMobile()
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    if (!minimized || isMobile) {
      return
    }
    const timer = window.setTimeout(() => setMinimized(false), 3000)
    return () => window.clearTimeout(timer)
  }, [minimized, isMobile])

  if (!hydrated || isMobile) {
    return null
  }

  if (minimized) {
    return (
      <button
        type="button"
        className="group fixed bottom-4 right-4 z-50 cursor-pointer rounded-full"
        onClick={() => setMinimized(false)}
        aria-label={t({ pt: "Expandir popup do portfólio", en: "Expand portfolio popup", es: "Expandir ventana del portafolio" })}
      >
        <Avatar className="h-12 w-12 border-2 border-primary/70 shadow-lg transition-transform duration-200 group-hover:scale-110">
          <AvatarFallback className="animate-text-glow-primary bg-black text-sm font-semibold text-white">Y$</AvatarFallback>
        </Avatar>
        <span className="absolute right-0 top-0 z-10 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
      </button>
    )
  }

  return (
    <PortfolioPanel
      className="fixed bottom-4 right-4 z-50 w-full max-w-70 transition-all duration-300 ease-out sm:w-72"
      innerClassName="p-3"
      style={{ transformOrigin: "bottom right" }}
    >
      <div className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarFallback className="animate-text-glow-primary bg-black text-sm font-semibold text-white">Y$</AvatarFallback>
          </Avatar>
          <div>
            <p className="animate-text-glow-footer text-sm font-semibold text-card-foreground">Lucas Lima</p>
            <p className="text-xs text-muted-foreground">
              {t({ pt: "Desenvolvedor Full Stack", en: "Full Stack Developer", es: "Desarrollador Full Stack" })}
            </p>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="absolute -top-1 right-2 z-10 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setMinimized(true)}
            aria-label={t({ pt: "Minimizar popup do portfólio", en: "Minimize portfolio popup", es: "Minimizar ventana del portafolio" })}
          >
            <LocalIcon name="chevron-down" className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-card-foreground">
          {t({
            pt: "Confira meu portfólio para ver mais projetos incríveis.",
            en: "Check out my portfolio to see more projects.",
            es: "Mira mi portafolio para ver más proyectos.",
          })}
        </p>
        <Button asChild variant="outline" className="group w-full gap-2.5 bg-transparent">
          <a href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer">
            <span className="studio-icon-shell h-6 w-6 rounded-full">
              <LocalIcon name="share" className="h-3.5 w-3.5 transition-colors group-hover:text-primary" />
            </span>
            {t({ pt: "Ver portfólio", en: "View portfolio", es: "Ver portafolio" })}
          </a>
        </Button>
      </div>
    </PortfolioPanel>
  )
}
