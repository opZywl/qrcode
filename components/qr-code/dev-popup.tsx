"use client"

import { useLanguage } from "@/components/language-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { LocalIcon } from "@/components/ui/local-icon"

interface DevPopupProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

export function DevPopup({ aberto, onAbertoChange }: DevPopupProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="w-[90vw] border border-border/50 bg-background/95 p-0 backdrop-blur-xs sm:max-w-sm">
        <DialogTitle className="sr-only">{t({ pt: "Portfólio do desenvolvedor", en: "Developer portfolio", es: "Portafolio del desarrollador" })}</DialogTitle>
        <DialogDescription className="sr-only">
          {t({ pt: "Conheça outros projetos de Lucas Lima.", en: "See other projects by Lucas Lima.", es: "Conoce otros proyectos de Lucas Lima." })}
        </DialogDescription>
        <div className="flex flex-col items-center space-y-4 p-8 text-center">
          <Avatar className="h-16 w-16 border-2 border-primary/50">
            <AvatarFallback className="animate-text-glow-primary bg-black text-lg font-semibold text-white">¥$</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="animate-text-glow-footer text-xl font-semibold text-foreground">Lucas Lima</h3>
            <p className="text-sm text-muted-foreground">
              {t({ pt: "Desenvolvedor Full Stack", en: "Full Stack Developer", es: "Desarrollador Full Stack" })}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {t({ pt: "Gostou do gerador? Confira meu portfólio!", en: "Liked the generator? Check out my portfolio!", es: "¿Te gustó el generador? ¡Mira mi portafolio!" })}
          </p>

          <Button asChild className="w-full py-2.5 font-medium transition-all duration-200 hover:scale-105">
            <a href="https://lucas-lima.vercel.app" target="_blank" rel="noopener noreferrer" onClick={() => onAbertoChange(false)}>
              <LocalIcon name="globe" className="mr-2 h-4 w-4" />
              {t({ pt: "Ver portfólio", en: "View portfolio", es: "Ver portafolio" })}
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
