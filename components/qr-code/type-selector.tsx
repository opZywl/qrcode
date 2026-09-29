"use client"

import { m } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { LocalIcon } from "@/components/ui/local-icon"
import { CONTENT_TYPE_META } from "@/lib/qr/labels"
import { CONTENT_TYPES, DEFAULT_VISIBLE_TYPES, type TipoConteudoQR } from "@/lib/qr/types"

interface TypeSelectorProps {
  tipoAtivo: TipoConteudoQR
  onTipoChange: (tipo: TipoConteudoQR) => void
  tiposVisiveis?: TipoConteudoQR[]
}

export function TypeSelector({ tipoAtivo, onTipoChange, tiposVisiveis = DEFAULT_VISIBLE_TYPES }: TypeSelectorProps) {
  const { t } = useLanguage()
  const lista = CONTENT_TYPES.filter((tipo) => tiposVisiveis.includes(tipo))

  return (
    <div className="grid auto-rows-fr grid-cols-3 gap-2 xl:grid-cols-3">
      {lista.map((valor, index) => {
        const meta = CONTENT_TYPE_META[valor]
        const active = tipoAtivo === valor
        const label = t(meta.short)

        return (
          <m.button
            key={valor}
            type="button"
            aria-pressed={active}
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
            <div className="relative z-1 flex items-start justify-between gap-1.5">
              <div
                className={[
                  "studio-icon-shell h-7 w-7 shrink-0 rounded-[0.72rem] transition-all duration-200",
                  active
                    ? "border-slate-200/90 bg-white/90 text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white"
                    : "text-foreground group-hover:border-primary/30 group-hover:text-primary",
                ].join(" ")}
              >
                <LocalIcon name={meta.icon} className="h-3.5 w-3.5" />
              </div>

              <span
                className={[
                  "portfolio-chip px-1.5! py-0.5! text-[9px]! tracking-widest!",
                  active ? "bg-black/4 text-foreground dark:bg-white/10 dark:text-white" : "",
                ].join(" ")}
              >
                {label}
              </span>
            </div>

            <div className="relative z-1 mt-1">
              <p className="font-glancyr700 text-[0.78rem] uppercase leading-none tracking-tight">{label}</p>
              <p
                className={[
                  "mt-0.5 text-[10px] leading-tight",
                  active ? "text-foreground/65 dark:text-white/65" : "text-muted-foreground",
                ].join(" ")}
              >
                {t(meta.description)}
              </p>
            </div>
          </m.button>
        )
      })}
    </div>
  )
}

export default TypeSelector
