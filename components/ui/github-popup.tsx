"use client"

import * as React from "react"
import { Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function GithubPopup() {
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => setMontado(true), [])

  if (!montado) {
    return <div style={{ width: "40px", height: "40px" }} />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 bg-transparent"
        >
          <Github className="h-[1.2rem] w-[1.2rem] text-primary" />
          <span className="sr-only">GitHub</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto p-4 bg-transparent"
              onClick={() => window.open("https://github.com/opZywl/qrcode", "_blank")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Repositório do projeto</span>
                </div>
                <span className="text-sm text-muted-foreground">Acesse o código fonte completo</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto p-4 bg-transparent"
              onClick={() => window.open("https://github.com/opZywl", "_blank")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Criador</span>
                </div>
                <span className="text-sm text-muted-foreground">Perfil do desenvolvedor</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto p-4 bg-transparent"
              onClick={() => window.open("https://github.com/opZywl/qrcode/issues/new", "_blank")}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Relatar um problema ou sugestão</span>
                </div>
                <span className="text-sm text-muted-foreground">Abrir uma nova issue</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
