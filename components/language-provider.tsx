"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react"
import { LOCALE_TAGS, isAppLanguage, type AppLanguage, type TranslationValue } from "@/lib/i18n"

export type { AppLanguage, TranslationValue } from "@/lib/i18n"

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  localeTag: string
  t: (value: TranslationValue) => string
}

const STORAGE_KEY = "qrCodeLanguage"
const CHANGE_EVENT = "qrcode:language-change"

let memoryLanguage: AppLanguage | null = null

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getSnapshot(): AppLanguage {
  if (memoryLanguage) {
    return memoryLanguage
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isAppLanguage(stored)) {
      return stored
    }
  } catch {}
  return "pt"
}

function getServerSnapshot(): AppLanguage {
  return "pt"
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      memoryLanguage = null
      onChange()
    }
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function setLanguage(language: AppLanguage) {
  memoryLanguage = language
  try {
    window.localStorage.setItem(STORAGE_KEY, language)
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const localeTag = LOCALE_TAGS[language]

  useEffect(() => {
    document.documentElement.lang = localeTag
  }, [localeTag])

  const t = useCallback((value: TranslationValue) => value[language], [language])

  const contextValue = useMemo(() => ({ language, setLanguage, localeTag, t }), [language, localeTag, t])

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
