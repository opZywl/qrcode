export const LANGUAGES = ["pt", "en", "es"] as const

export type AppLanguage = (typeof LANGUAGES)[number]

export type TranslationValue = Record<AppLanguage, string>

export const LOCALE_TAGS: Record<AppLanguage, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
}

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value)
}
