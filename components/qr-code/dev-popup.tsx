"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Removido AvatarImage
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"

interface PopupPortfolioMobileProps {
    aberto: boolean
    onAbertoChange: (aberto: boolean) => void
    language?: AppLanguage
}

export function DevPopup({ aberto, onAbertoChange }: PopupPortfolioMobileProps) {
    return (
        <Dialog open={aberto} onOpenChange={onAbertoChange}>
            <DialogContent className="sm:max-w-sm w-[90vw] p-0 bg-background/95 backdrop-blur-sm border border-border/50">
                <DialogTitle className="sr-only">Portfólio do Desenvolvedor</DialogTitle>
                {/* Conteúdo */}
                <div className="flex flex-col items-center text-center p-8 space-y-4">
                    {/* Avatar */}
                    <Avatar className="w-16 h-16 border-2 border-primary/50">
                        {/* AvatarFallback com fundo preto, texto branco e glow */}
                        <AvatarFallback className="bg-black text-white font-semibold text-lg animate-text-glow-primary">
                            ¥$
                        </AvatarFallback>
                    </Avatar>

                    {/* Nome e Título */}
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground animate-text-glow-footer">Lucas Lima</h3>
                        <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                    </div>

                    {/* Mensagem */}
                    <p className="text-sm text-muted-foreground">Gostou do gerador? Confira meu portfólio!</p>

                    {/* Botão Ver Portfólio */}
                    <Button
                        onClick={() => {
                            window.open("https://lucas-lima.vercel.app", "_blank")
                            onAbertoChange(false)
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-all duration-200 hover:scale-105"
                    >
                        <LocalIcon name="globe" className="h-4 w-4 mr-2" />
                        Ver Portfolio
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
