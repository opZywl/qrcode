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
import { RotateCcw, AlertTriangle } from "lucide-react"

interface DialogConfirmacaoResetProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onConfirmar: () => void
  tipo: "content" | "appearance" | "all"
}

export function DialogConfirmacaoReset({ aberto, onAbertoChange, onConfirmar, tipo }: DialogConfirmacaoResetProps) {
  const getTextos = () => {
    switch (tipo) {
      case "content":
        return {
          titulo: "Limpar Dados do Conteúdo?",
          descricao:
            "Todos os dados inseridos (URL, texto, configurações de WiFi, contato, etc.) serão removidos. Esta ação não pode ser desfeita.",
          botao: "Sim, Limpar Dados",
        }
      case "appearance":
        return {
          titulo: "Resetar Personalização Visual?",
          descricao:
            "Todas as personalizações visuais (cores, logo, fundo, moldura, tamanho) serão restauradas para os valores padrão.",
          botao: "Sim, Resetar Visual",
        }
      case "all":
        return {
          titulo: "Resetar Tudo?",
          descricao:
            "Todos os dados e personalizações serão removidos, retornando o gerador ao estado inicial. Esta ação não pode ser desfeita.",
          botao: "Sim, Resetar Tudo",
        }
      default:
        return {
          titulo: "Confirmar Reset?",
          descricao: "Esta ação não pode ser desfeita.",
          botao: "Confirmar",
        }
    }
  }

  const textos = getTextos()

  return (
    <AlertDialog open={aberto} onOpenChange={onAbertoChange}>
      <AlertDialogContent className="max-w-md mx-4">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold">{textos.titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
            {textos.descricao}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirmar()
              onAbertoChange(false)
            }}
            className="w-full sm:w-auto order-1 sm:order-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {textos.botao}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}