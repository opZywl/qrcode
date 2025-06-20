"use client"

import * as React from "react"
import { ExternalLink, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

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
    setIsDesktopMinimized((prev) => !prev)
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
    return <div className="fixed bottom-4 right-4 h-10 w-10 opacity-0 pointer-events-none" />
  }

  if (isMobile) {
    return null
  }

  if (isDesktopMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer group"
        onClick={handleDesktopToggleMinimize}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleDesktopToggleMinimize()
        }}
        aria-label="Expandir popup do portfólio"
      >
        <Avatar className="h-12 w-12 border-2 border-primary/70 shadow-lg group-hover:scale-110 transition-transform duration-200">
          <AvatarImage src="https://placehold.co/48x48.png?text=LL" alt="Lucas Lima" />
          <AvatarFallback>
            <User size={24} />
          </AvatarFallback>
        </Avatar>
        <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card z-10" />
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-4 right-4 w-full max-w-[280px] sm:w-72 shadow-xl z-50 border-primary/20 bg-card/95 dark:bg-[#0A0A0A] dark:border-gray-800 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
      )}
      style={{ transformOrigin: "bottom right" }}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src="https://placehold.co/40x40.png?text=LL" alt="Lucas Lima" />
            <AvatarFallback>
              <User size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-card-foreground animate-text-glow-footer">Lucas Lima</p>
            <p className="text-xs text-muted-foreground">Desenvolvedor Full Stack</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <div className="absolute top-[-4px] right-[8px] h-3 w-3 rounded-full bg-green-500 border-2 border-card z-10" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleDesktopToggleMinimize}
            aria-label="Minimizar popup do portfólio"
          >
            <ChevronDown size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-sm text-card-foreground mb-3">
          Confira meu portfólio para ver mais projetos incríveis!
        </p>
        <Button
          variant="outline"
          className="w-full group hover:bg-primary/10 hover:border-primary"
          onClick={() => window.open("https://lucas-lima.vercel.app", "_blank")}
        >
          <ExternalLink size={16} className="mr-2 group-hover:text-primary transition-colors" />
          Ver Portfólio
        </Button>
      </CardContent>
    </Card>
  )
}
