"use client"

import { useLanguage } from "@/components/language-provider"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  const { t } = useLanguage()
  const closeLabel = t({ pt: "Fechar notificação", en: "Close notification", es: "Cerrar notificación" })

  return (
    <ToastProvider duration={4500} label={t({ pt: "Notificação", en: "Notification", es: "Notificación" })}>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          {action}
          <ToastClose aria-label={closeLabel} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
