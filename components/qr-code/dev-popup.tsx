"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, User } from "lucide-react"

interface PopupPortfolioMobileProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

export function DevPopup({ aberto, onAbertoChange }: PopupPortfolioMobileProps) {
  return (
      <Dialog open={aberto} onOpenChange={onAbertoChange}>
        <DialogContent className="sm:max-w-sm w-[90vw] p-0 bg-background/95 backdrop-blur-sm border border-border/50">
          <DialogTitle className="sr-only">Portfólio do Desenvolvedor</DialogTitle>
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <Avatar className="w-16 h-16 border-2 border-primary/50">
              <AvatarImage src="https://placehold.co/64x64.png?text=LL" alt="Lucas Lima" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                <User size={24} />
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground animate-text-glow-footer">Lucas Lima</h3>
              <p className="text-sm text-muted-foreground">Full Stack Developer</p>
            </div>

            <p className="text-sm text-muted-foreground">Gostou do gerador? Confira meu portfólio!</p>

            <Button
                onClick={() => {
                  window.open("https://lucas-lima.vercel.app", "_blank")
                  onAbertoChange(false)
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-all duration-200 hover:scale-105"
            >
              <ExternalLink size={16} className="mr-2" />
              Ver Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  )
}