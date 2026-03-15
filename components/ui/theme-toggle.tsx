"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) {
    return <div className="h-9 w-9 rounded-full bg-transparent" />
  }

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-full bg-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <span
        className={cn(
          "relative w-[1.2rem] rounded-full font-bold transition-all duration-100",
          theme === "dark"
            ? "scale-100 text-white hover:[box-shadow:1px_1px_50px_-1px_#fff]"
            : "scale-0 text-zinc-500",
        )}
      >
        {"\u591c"}
      </span>
      <span
        className={cn(
          "absolute w-[1.2rem] rounded-full font-bold transition-all duration-100",
          theme === "light"
            ? "scale-100 text-zinc-500 hover:[box-shadow:1px_1px_50px_20px_#c6c6c650]"
            : "scale-0 text-black",
        )}
      >
        {"\u671d"}
      </span>
      <span className="sr-only">{theme === "dark" ? "Tema escuro" : "Tema claro"}</span>
    </button>
  )
}
