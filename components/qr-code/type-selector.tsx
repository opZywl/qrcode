"use client"

import { motion } from "framer-motion"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/components/language-provider"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

interface ContentTypeItem {
  valor: TipoConteudoQR
  icon: string
  label: string
  descricao: string
}

interface SeletorTipoConteudoProps {
  tipoAtivo: TipoConteudoQR
  onTipoChange: (tipo: TipoConteudoQR) => void
  tiposVisiveis?: TipoConteudoQR[]
  language?: AppLanguage
}

const contentTypes: Record<"pt" | "en", ContentTypeItem[]> = {
  pt: [
    { valor: "url" as const, icon: "link", label: "URL", descricao: "Sites, links e texto" },
    { valor: "wifi" as const, icon: "wifi", label: "Wi-Fi", descricao: "Rede e senha" },
    { valor: "whatsapp" as const, icon: "whatsapp", label: "WhatsApp", descricao: "Contato direto" },
    { valor: "whatsappGroup" as const, icon: "group", label: "Grupo", descricao: "Link de grupo" },
    { valor: "phone" as const, icon: "phone", label: "Telefone", descricao: "Chamada rapida" },
    { valor: "vcard" as const, icon: "user", label: "Contato", descricao: "Cartao virtual" },
    { valor: "vevent" as const, icon: "calendar", label: "Evento", descricao: "Agenda e data" },
    { valor: "email" as const, icon: "email", label: "Email", descricao: "Mensagem pronta" },
    { valor: "sms" as const, icon: "sms", label: "SMS", descricao: "Texto curto" },
    { valor: "geo" as const, icon: "geo", label: "Local", descricao: "Latitude e longitude" },
    { valor: "pix" as const, icon: "pix", label: "PIX", descricao: "Pagamento" },
    { valor: "appstore" as const, icon: "app", label: "App", descricao: "iOS e Android" },
    { valor: "spotify" as const, icon: "media", label: "Midia", descricao: "Musica e video" },
    { valor: "zoom" as const, icon: "video", label: "Chamada", descricao: "Reunioes online" },
    { valor: "menu" as const, icon: "menu", label: "Menu", descricao: "Catalogo e cardapio" },
    { valor: "cupom" as const, icon: "coupon", label: "Cupom", descricao: "Codigo promocional" },
  ],
  en: [
    { valor: "url" as const, icon: "link", label: "URL", descricao: "Sites, links and text" },
    { valor: "wifi" as const, icon: "wifi", label: "Wi-Fi", descricao: "Network and password" },
    { valor: "whatsapp" as const, icon: "whatsapp", label: "WhatsApp", descricao: "Direct contact" },
    { valor: "whatsappGroup" as const, icon: "group", label: "Group", descricao: "Group invite link" },
    { valor: "phone" as const, icon: "phone", label: "Phone", descricao: "Quick call" },
    { valor: "vcard" as const, icon: "user", label: "Contact", descricao: "Digital card" },
    { valor: "vevent" as const, icon: "calendar", label: "Event", descricao: "Schedule and date" },
    { valor: "email" as const, icon: "email", label: "Email", descricao: "Pre-filled message" },
    { valor: "sms" as const, icon: "sms", label: "SMS", descricao: "Short text" },
    { valor: "geo" as const, icon: "geo", label: "Location", descricao: "Latitude and longitude" },
    { valor: "pix" as const, icon: "pix", label: "PIX", descricao: "Payment" },
    { valor: "appstore" as const, icon: "app", label: "App", descricao: "iOS and Android" },
    { valor: "spotify" as const, icon: "media", label: "Media", descricao: "Music and video" },
    { valor: "zoom" as const, icon: "video", label: "Meeting", descricao: "Online meetings" },
    { valor: "menu" as const, icon: "menu", label: "Menu", descricao: "Catalog and menu" },
    { valor: "cupom" as const, icon: "coupon", label: "Coupon", descricao: "Promo code" },
  ],
}

const DEFAULT_VISIBLE: TipoConteudoQR[] = [
  "url",
  "wifi",
  "whatsapp",
  "whatsappGroup",
  "phone",
  "vcard",
  "vevent",
  "email",
  "sms",
  "geo",
]

export function TypeSelector({ tipoAtivo, onTipoChange, tiposVisiveis, language = "pt" }: SeletorTipoConteudoProps) {
  const visiveis = tiposVisiveis ?? DEFAULT_VISIBLE
  const locale = language === "en" ? "en" : "pt"
  const lista = contentTypes[locale].filter((tipo) => visiveis.includes(tipo.valor))

  return (
    <div className="grid auto-rows-fr grid-cols-3 gap-2 xl:grid-cols-3">
      {lista.map(({ valor, icon, label, descricao }, index) => {
        const active = tipoAtivo === valor

        return (
          <motion.button
            key={valor}
            type="button"
            onClick={() => onTipoChange(valor)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.018 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.978 }}
            className={[
              "group relative flex min-h-[70px] flex-col justify-between rounded-[1.1rem] border p-2.5 text-left transition-all duration-200",
              active ? "studio-tile-strong shadow-[0_18px_48px_-28px_rgba(15,23,42,0.45)]" : "studio-tile hover:border-primary/30",
            ].join(" ")}
          >
            <div className="relative z-[1] flex items-start justify-between gap-1.5">
              <div
                className={[
                  "studio-icon-shell h-7 w-7 flex-shrink-0 rounded-[0.72rem] transition-all duration-200",
                  active
                    ? "border-slate-200/90 bg-white/90 text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white"
                    : "text-foreground group-hover:border-primary/30 group-hover:text-primary",
                ].join(" ")}
              >
                <LocalIcon name={icon} className="h-3.5 w-3.5" />
              </div>

              <span
                className={[
                  "portfolio-chip !px-1.5 !py-0.5 !text-[9px] !tracking-[0.10em]",
                  active ? "bg-black/[0.04] text-foreground dark:bg-white/10 dark:text-white" : "",
                ].join(" ")}
              >
                {label}
              </span>
            </div>

            <div className="relative z-[1] mt-1">
              <p className="font-glancyr700 text-[0.78rem] uppercase leading-none tracking-tight">{label}</p>
              <p className={["mt-0.5 text-[10px] leading-tight", active ? "text-foreground/65 dark:text-white/65" : "text-muted-foreground"].join(" ")}>
                {descricao}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default TypeSelector
