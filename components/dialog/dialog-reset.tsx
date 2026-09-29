"use client"

import { useLanguage } from "@/components/language-provider"
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
import type { TranslationValue } from "@/lib/i18n"

export type ResetDialogKind = "content" | "appearance" | "all"

interface DialogResetProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onConfirmar: () => void
  tipo: ResetDialogKind
}

const TEXTS: Record<ResetDialogKind, { title: TranslationValue; description: TranslationValue; action: TranslationValue }> = {
  content: {
    title: { pt: "Limpar dados do conteúdo?", en: "Clear content data?", es: "¿Borrar los datos del contenido?" },
    description: {
      pt: "Os dados preenchidos no formato atual (URL, Wi-Fi, contato e afins) serão removidos. Essa ação não pode ser desfeita.",
      en: "The data filled in for the current format (URL, Wi-Fi, contact and so on) will be removed. This cannot be undone.",
      es: "Se eliminarán los datos del formato actual (URL, Wi-Fi, contacto, etc.). Esta acción no se puede deshacer.",
    },
    action: { pt: "Sim, limpar dados", en: "Yes, clear data", es: "Sí, borrar datos" },
  },
  appearance: {
    title: { pt: "Resetar personalização visual?", en: "Reset visual customization?", es: "¿Restablecer la personalización visual?" },
    description: {
      pt: "Cores, tamanho, correção e margem voltarão aos valores padrão.",
      en: "Colors, size, correction and margin will go back to the defaults.",
      es: "Los colores, el tamaño, la corrección y el margen volverán a los valores predeterminados.",
    },
    action: { pt: "Sim, resetar visual", en: "Yes, reset design", es: "Sí, restablecer diseño" },
  },
  all: {
    title: { pt: "Resetar tudo?", en: "Reset everything?", es: "¿Restablecer todo?" },
    description: {
      pt: "Todos os dados e personalizações serão removidos, voltando o gerador ao estado inicial. Essa ação não pode ser desfeita.",
      en: "All data and customizations will be removed, returning the generator to its initial state. This cannot be undone.",
      es: "Se eliminarán todos los datos y personalizaciones y el generador volverá a su estado inicial. Esta acción no se puede deshacer.",
    },
    action: { pt: "Sim, resetar tudo", en: "Yes, reset everything", es: "Sí, restablecer todo" },
  },
}

export function DialogReset({ aberto, onAbertoChange, onConfirmar, tipo }: DialogResetProps) {
  const { t } = useLanguage()
  const texts = TEXTS[tipo]

  return (
    <AlertDialog open={aberto} onOpenChange={onAbertoChange}>
      <AlertDialogContent className="mx-4 max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="studio-icon-shell mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <LocalIcon name="info" className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold">{t(texts.title)}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
            {t(texts.description)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          <AlertDialogCancel className="order-2 w-full sm:order-1 sm:w-auto">{t({ pt: "Cancelar", en: "Cancel", es: "Cancelar" })}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirmar()
              onAbertoChange(false)
            }}
            className="order-1 w-full bg-orange-600 text-white hover:bg-orange-700 sm:order-2 sm:w-auto"
          >
            <LocalIcon name="reset" className="mr-2 h-4 w-4" />
            {t(texts.action)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
