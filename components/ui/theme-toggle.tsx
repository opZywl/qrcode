"use client"

import { useLanguage } from "@/components/language-provider"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const label =
    theme === "dark"
      ? t({ pt: "Mudar para tema claro", en: "Switch to light theme", es: "Cambiar al tema claro" })
      : t({ pt: "Mudar para tema escuro", en: "Switch to dark theme", es: "Cambiar al tema oscuro" })

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-full bg-transparent text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <span
        aria-hidden
        className={cn(
          "relative w-[1.2rem] rounded-full font-bold transition-all duration-100",
          theme === "dark" ? "scale-100 text-white hover:[box-shadow:1px_1px_50px_-1px_#fff]" : "scale-0 text-zinc-500",
        )}
      >
        {"夜"}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute w-[1.2rem] rounded-full font-bold transition-all duration-100",
          theme === "light" ? "scale-100 text-zinc-500 hover:[box-shadow:1px_1px_50px_20px_#c6c6c650]" : "scale-0 text-black",
        )}
      >
        {"朝"}
      </span>
    </button>
  )
}
