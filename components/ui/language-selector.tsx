"use client"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LocalIcon } from "@/components/ui/local-icon"
import type { AppLanguage } from "@/lib/i18n"

const LANGUAGE_OPTIONS: Array<{ code: AppLanguage; name: string; flag: string }> = [
  { code: "pt", name: "Português", flag: "BR" },
  { code: "en", name: "English", flag: "US" },
  { code: "es", name: "Español", flag: "ES" },
]

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const current = LANGUAGE_OPTIONS.find((option) => option.code === language) ?? LANGUAGE_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="studio-icon-shell relative rounded-full bg-transparent hover:border-primary/35 hover:bg-primary/5">
          <LocalIcon name="globe" className="h-[1.15rem] w-[1.15rem] text-primary" />
          <span className="absolute -bottom-1.5 -right-1 rounded-full border border-border/80 bg-background px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-foreground dark:border-dark-5/40 dark:bg-dark-4">
            {current.flag}
          </span>
          <span className="sr-only">{t({ pt: "Selecionar idioma", en: "Select language", es: "Seleccionar idioma" })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            lang={option.code}
            onClick={() => setLanguage(option.code)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border/70 px-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                {option.flag}
              </span>
              <span className="text-sm">{option.name}</span>
            </div>
            <span className={language === option.code ? "h-2 w-2 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-transparent"} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
