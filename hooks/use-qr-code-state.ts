"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import {
  STORAGE_KEYS,
  persistHistory,
  persistTemplates,
  readStorage,
  removeStorage,
  sanitizeHistory,
  sanitizeTemplates,
  sanitizeVisibleTypes,
  writeStorage,
  type PersistStatus,
} from "@/lib/qr/storage"
import {
  DEFAULT_APPEARANCE,
  DEFAULT_CONTENT,
  DEFAULT_VISIBLE_TYPES,
  contentDefaultsFor,
  type EntradaQRCode,
  type QrAppearance,
  type QrContentFields,
  type TipoConteudoQR,
  type VisualTemplateQRCode,
} from "@/lib/qr/types"

export type {
  EntradaQRCode,
  NivelCorrecaoErro,
  TipoConteudoQR,
  TipoEncriptacaoWifi,
  TipoFrame,
  VisualTemplateQRCode,
} from "@/lib/qr/types"

export interface QrState extends QrContentFields, QrAppearance {
  tipoConteudoAtivo: TipoConteudoQR
  qrValue: string
  qrTipo: TipoConteudoQR | null
  valoresAccordionMobile: string[]
  historico: EntradaQRCode[]
  templatesVisuais: VisualTemplateQRCode[]
  tiposVisiveis: TipoConteudoQR[]
}

export type UpdateField = <K extends keyof QrState>(field: K, value: QrState[K]) => void

export interface QrStateApi extends QrState {
  updateField: UpdateField
  updateFields: (patch: Partial<QrState>) => void
  resetCamposEspecificos: (tipo?: TipoConteudoQR) => void
}

interface PersistHandlers {
  onHistoryPersist?: (status: PersistStatus) => void
  onTemplatesPersist?: (status: PersistStatus) => void
}

const CUSTOMIZATION_SECTIONS = [
  ["logo", "habilitarCustomizacaoLogo"],
  ["background", "habilitarCustomizacaoFundo"],
  ["frame", "habilitarCustomizacaoFrame"],
] as const

function createInitialState(): QrState {
  const base: QrState = {
    ...DEFAULT_CONTENT,
    ...DEFAULT_APPEARANCE,
    tipoConteudoAtivo: "url",
    qrValue: "",
    qrTipo: null,
    valoresAccordionMobile: [],
    historico: [],
    templatesVisuais: [],
    tiposVisiveis: DEFAULT_VISIBLE_TYPES,
  }

  if (typeof window === "undefined") {
    return base
  }

  const tiposVisiveis = readStorage(STORAGE_KEYS.visibleTypes, sanitizeVisibleTypes) ?? DEFAULT_VISIBLE_TYPES
  return {
    ...base,
    historico: readStorage(STORAGE_KEYS.history, sanitizeHistory) ?? [],
    templatesVisuais: readStorage(STORAGE_KEYS.templates, sanitizeTemplates) ?? [],
    tiposVisiveis,
    tipoConteudoAtivo: tiposVisiveis.includes("url") ? "url" : tiposVisiveis[0],
  }
}

function withAccordion(current: QrState, sections: string[]): QrState {
  const next: QrState = { ...current, valoresAccordionMobile: sections }
  for (const [section, flag] of CUSTOMIZATION_SECTIONS) {
    if (current.valoresAccordionMobile.includes(section) !== sections.includes(section)) {
      next[flag] = sections.includes(section)
    }
  }
  return next
}

function withVisibleTypes(current: QrState, types: TipoConteudoQR[]): QrState {
  const tiposVisiveis = types.length > 0 ? types : DEFAULT_VISIBLE_TYPES
  return {
    ...current,
    tiposVisiveis,
    tipoConteudoAtivo: tiposVisiveis.includes(current.tipoConteudoAtivo) ? current.tipoConteudoAtivo : tiposVisiveis[0],
  }
}

function applyPatch(current: QrState, patch: Partial<QrState>): QrState {
  const { valoresAccordionMobile, tiposVisiveis, ...rest } = patch
  let next: QrState = { ...current, ...rest }
  if (valoresAccordionMobile) {
    next = withAccordion(next, valoresAccordionMobile)
  }
  if (tiposVisiveis) {
    next = withVisibleTypes(next, tiposVisiveis)
  }
  return next
}

export function useQRCodeState(handlers: PersistHandlers = {}): QrStateApi {
  const [state, setState] = useState<QrState>(createInitialState)
  const persistedHistory = useRef(state.historico)
  const persistedTemplates = useRef(state.templatesVisuais)
  const persistedTypes = useRef(state.tiposVisiveis)

  const notifyHistory = useEffectEvent((status: PersistStatus) => handlers.onHistoryPersist?.(status))
  const notifyTemplates = useEffectEvent((status: PersistStatus) => handlers.onTemplatesPersist?.(status))

  useEffect(() => {
    removeStorage(STORAGE_KEYS.legacyVisibleTypes)
  }, [])

  useEffect(() => {
    if (persistedHistory.current === state.historico) {
      return
    }
    persistedHistory.current = state.historico
    const status = persistHistory(state.historico)
    if (status !== "saved") {
      notifyHistory(status)
    }
  }, [state.historico])

  useEffect(() => {
    if (persistedTemplates.current === state.templatesVisuais) {
      return
    }
    persistedTemplates.current = state.templatesVisuais
    const status = persistTemplates(state.templatesVisuais)
    if (status !== "saved") {
      notifyTemplates(status)
    }
  }, [state.templatesVisuais])

  useEffect(() => {
    if (persistedTypes.current === state.tiposVisiveis) {
      return
    }
    persistedTypes.current = state.tiposVisiveis
    writeStorage(STORAGE_KEYS.visibleTypes, state.tiposVisiveis)
  }, [state.tiposVisiveis])

  const updateField = useCallback<UpdateField>((field, value) => {
    setState((current) => applyPatch(current, { [field]: value } as Partial<QrState>))
  }, [])

  const updateFields = useCallback((patch: Partial<QrState>) => {
    setState((current) => applyPatch(current, patch))
  }, [])

  const resetCamposEspecificos = useCallback((tipo?: TipoConteudoQR) => {
    setState((current) => ({ ...current, ...contentDefaultsFor(tipo), qrValue: "", qrTipo: null }))
  }, [])

  return { ...state, updateField, updateFields, resetCamposEspecificos }
}
