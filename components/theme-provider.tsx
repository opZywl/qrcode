"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Background } from "@/components/layout/background"
import { ThemeSwitchAnimation } from "@/components/ui/theme-switch-animation"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
  isAnimating: boolean
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>
  }
}

const THEME_STORAGE_KEY = "theme"
const LEGACY_THEME_STORAGE_KEY = "tema"

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  isAnimating: false,
})

function getInitialTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const themeFromDom = document.documentElement.getAttribute("data-theme")
    if (themeFromDom === "light" || themeFromDom === "dark") {
      return themeFromDom
    }
  }

  return "dark"
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.setAttribute("data-theme", theme)
  root.style.colorScheme = theme

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    if (localStorage.getItem(LEGACY_THEME_STORAGE_KEY) !== null) {
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY)
    }
  } catch (error) {
    /* ignore */
  }
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isAnimating,
      toggleTheme: () => {
        const switchTheme = () => {
          setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
        }

        const finishAnimation = () => {
          window.setTimeout(() => setIsAnimating(false), 1500)
        }

        setIsAnimating(true)

        const documentWithTransition = document as ViewTransitionDocument

        if (!documentWithTransition.startViewTransition) {
          switchTheme()
          finishAnimation()
          return
        }

        const transition = documentWithTransition.startViewTransition(switchTheme)
        transition.finished.finally(finishAnimation)
      },
    }),
    [theme, isAnimating],
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeSwitchAnimation isAnimating={isAnimating} theme={theme} />
      <Background />
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
