"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"

interface DialogConfirmacaoResetProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onConfirmar: () => void
  tipo: "content" | "appearance" | "all"
  language?: AppLanguage
}

export function DialogReset({
  aberto,
  onAbertoChange,
  onConfirmar,
  tipo,
  language = "pt",
}: DialogConfirmacaoResetProps) {
  const isEnglish = language === "en"

  const getTextos = () => {
    switch (tipo) {
      case "content":
        return {
          titulo: isEnglish ? "Clear content data?" : "Limpar dados do conteúdo?",
          descricao: isEnglish
            ? "All entered data such as URL, text, Wi-Fi settings and contact information will be removed. This action cannot be undone."
            : "Todos os dados inseridos (URL, texto, configurações de WiFi, contato e afins) serão removidos. Esta ação não pode ser desfeita.",
          botao: isEnglish ? "Yes, clear data" : "Sim, limpar dados",
        }
      case "appearance":
        return {
          titulo: isEnglish ? "Reset visual customization?" : "Resetar personalização visual?",
          descricao: isEnglish
            ? "All visual customizations such as colors, logo, background, frame and size will be restored to the default values."
            : "Todas as personalizações visuais (cores, logo, fundo, moldura e tamanho) serão restauradas para os valores padrão.",
          botao: isEnglish ? "Yes, reset visuals" : "Sim, resetar visual",
        }
      case "all":
        return {
          titulo: isEnglish ? "Reset everything?" : "Resetar tudo?",
          descricao: isEnglish
            ? "All data and customizations will be removed, returning the generator to its initial state. This action cannot be undone."
            : "Todos os dados e personalizações serão removidos, retornando o gerador ao estado inicial. Esta ação não pode ser desfeita.",
          botao: isEnglish ? "Yes, reset everything" : "Sim, resetar tudo",
        }
      default:
        return {
          titulo: isEnglish ? "Confirm reset?" : "Confirmar reset?",
          descricao: isEnglish ? "This action cannot be undone." : "Esta ação não pode ser desfeita.",
          botao: isEnglish ? "Confirm" : "Confirmar",
        }
    }
  }

  const textos = getTextos()

  return (
    <AlertDialog open={aberto} onOpenChange={onAbertoChange}>
      <AlertDialogContent className="mx-4 max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="studio-icon-shell mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <LocalIcon name="info" className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold">{textos.titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
            {textos.descricao}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <AlertDialogCancel className="order-2 w-full sm:order-1 sm:w-auto">
            {isEnglish ? "Cancel" : "Cancelar"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirmar()
              onAbertoChange(false)
            }}
            className="order-1 w-full bg-orange-600 text-white hover:bg-orange-700 sm:order-2 sm:w-auto"
          >
            <LocalIcon name="reset" className="mr-2 h-4 w-4" />
            {textos.botao}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
