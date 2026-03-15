"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LocalIcon } from "@/components/ui/local-icon"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { PortfolioPanel } from "@/components/ui/portfolio-panel"

export function PopupPortfolio() {
  const isMobile = useIsMobile()
  const [isDesktopMinimized, setIsDesktopMinimized] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleDesktopToggleMinimize = () => {
    clearTimer()
    setIsDesktopMinimized((current) => !current)
  }

  React.useEffect(() => {
    if (isDesktopMinimized && !isMobile) {
      timerRef.current = setTimeout(() => {
        if (!isMobile) {
          setIsDesktopMinimized(false)
        }
      }, 3000)
    } else {
      clearTimer()
    }

    return clearTimer
  }, [isDesktopMinimized, isMobile])

  if (isMobile === undefined) {
    return <div className="pointer-events-none fixed bottom-4 right-4 h-10 w-10 opacity-0" />
  }

  if (isMobile) {
    return null
  }

  if (isDesktopMinimized) {
    return (
      <div
        className="group fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={handleDesktopToggleMinimize}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            handleDesktopToggleMinimize()
          }
        }}
        aria-label="Expandir popup do portfolio"
        >
        <Avatar className="h-12 w-12 border-2 border-primary/70 shadow-lg transition-transform duration-200 group-hover:scale-110">
          <AvatarFallback className="bg-black text-sm font-semibold text-white animate-text-glow-primary">
            Y$
          </AvatarFallback>
        </Avatar>
        <div className="absolute right-0 top-0 z-10 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
      </div>
    )
  }

  return (
    <PortfolioPanel
      className={cn(
        "fixed bottom-4 right-4 z-50 w-full max-w-[280px] transition-all duration-300 ease-out sm:w-72",
      )}
      innerClassName="p-3"
      style={{ transformOrigin: "bottom right" }}
    >
      <div className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarFallback className="bg-black text-sm font-semibold text-white animate-text-glow-primary">
              Y$
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="animate-text-glow-footer text-sm font-semibold text-card-foreground">Lucas Lima</p>
            <p className="text-xs text-muted-foreground">Desenvolvedor Full Stack</p>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="absolute right-[8px] top-[-4px] z-10 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleDesktopToggleMinimize}
            aria-label="Minimizar popup do portfolio"
          >
            <LocalIcon name="chevron-down" className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-card-foreground">
          Confira meu portfolio para ver mais projetos incríveis.
        </p>
        <Button
          variant="outline"
          className="group w-full gap-2.5 bg-transparent"
          onClick={() => window.open("https://lucas-lima.vercel.app", "_blank")}
        >
          <span className="studio-icon-shell h-6 w-6 rounded-full">
            <LocalIcon name="share" className="h-3.5 w-3.5 transition-colors group-hover:text-primary" />
          </span>
          Ver portfolio
        </Button>
      </div>
    </PortfolioPanel>
  )
}
