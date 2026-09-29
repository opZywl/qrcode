"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Search, Star, Tag, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Input } from "@/components/ui/input"
import { LocalIcon } from "@/components/ui/local-icon"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CONTENT_TYPE_META } from "@/lib/qr/labels"
import { fitsInQr } from "@/lib/qr/payload"
import { isSafeImageDataUrl } from "@/lib/qr/storage"
import type { EntradaQRCode } from "@/lib/qr/types"

interface HistoryPanelProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  historico: EntradaQRCode[]
  onLoadFromHistory: (entrada: EntradaQRCode) => void
  onClearHistory: () => void
  onToggleFavorite: (entryId: string) => void
  onUpdateTags: (entryId: string, tags: string[]) => void
  onRemoveFromHistory: (entryId: string) => void
  isMobile: boolean
}

function splitTags(value: string) {
  return value.split(",")
}

function subscribeClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 30000)
  return () => window.clearInterval(timer)
}

function getClockMinute() {
  return Math.floor(Date.now() / 60000)
}

function getServerClockMinute() {
  return 0
}

export function HistoryPanel({
  aberto,
  onAbertoChange,
  historico,
  onLoadFromHistory,
  onClearHistory,
  onToggleFavorite,
  onUpdateTags,
  onRemoveFromHistory,
  isMobile,
}: HistoryPanelProps) {
  const { t, localeTag } = useLanguage()
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed")
  const [searchTerm, setSearchTerm] = useState("")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({})
  const [confirmClear, setConfirmClear] = useState(false)
  const nowMinute = useSyncExternalStore(subscribeClock, getClockMinute, getServerClockMinute)

  const availableTags = useMemo(
    () =>
      Array.from(new Set(historico.flatMap((entrada) => entrada.tags ?? []).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, localeTag),
      ),
    [historico, localeTag],
  )

  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return historico.filter((entrada) => {
      if (favoritesOnly && !entrada.favorite) {
        return false
      }
      if (selectedTag && !(entrada.tags ?? []).includes(selectedTag)) {
        return false
      }
      if (!query) {
        return true
      }
      const haystack = [entrada.inputOriginal, entrada.valorQR, t(CONTENT_TYPE_META[entrada.tipoConteudo].short), ...(entrada.tags ?? [])]
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [favoritesOnly, historico, searchTerm, selectedTag, t])

  const formatAbsoluteDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

  const formatRelativeTime = (timestamp: number) => {
    const minutes = Math.max(0, nowMinute - Math.floor(timestamp / 60000))
    if (minutes < 1) {
      return t({ pt: "Agora", en: "Now", es: "Ahora" })
    }
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    return hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} d`
  }

  const draftFor = (entrada: EntradaQRCode) => tagDrafts[entrada.id] ?? (entrada.tags ?? []).join(", ")

  const handleTagSave = (entrada: EntradaQRCode) => {
    onUpdateTags(entrada.id, splitTags(draftFor(entrada)))
    setTagDrafts((current) => {
      const next = { ...current }
      delete next[entrada.id]
      return next
    })
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFavoritesOnly(false)
    setSelectedTag(null)
  }

  return (
    <Sheet open={aberto} onOpenChange={onAbertoChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("flex flex-col p-0", isMobile ? "h-[88vh] rounded-t-[1.6rem]" : "w-full sm:max-w-155")}
      >
        <SheetHeader className="shrink-0 border-b border-border/60 bg-background/90 px-4 pb-4 pr-12 pt-4 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="studio-icon-shell h-10 w-10 rounded-2xl">
                <LocalIcon name="history" className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2 font-glancyr700 text-[1rem] uppercase tracking-tight text-foreground">
                  {t({ pt: "Histórico", en: "History", es: "Historial" })}
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                    {historico.length}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="mt-1 text-left text-[11px] text-muted-foreground">
                  {t({
                    pt: "Busque registros, favorite os melhores e organize com tags.",
                    en: "Search records, favorite the best ones and organize them with tags.",
                    es: "Busca registros, marca los mejores como favoritos y organízalos con etiquetas.",
                  })}
                </SheetDescription>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t({
                  pt: "Buscar por conteúdo, link ou tag",
                  en: "Search by content, link or tag",
                  es: "Buscar por contenido, enlace o etiqueta",
                })}
                aria-label={t({ pt: "Buscar no histórico", en: "Search history", es: "Buscar en el historial" })}
                className="h-10 pl-10 text-[12px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
                <Button
                  type="button"
                  variant={viewMode === "compact" ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={viewMode === "compact"}
                  onClick={() => setViewMode("compact")}
                  className="h-7 rounded-full px-3 text-[11px]"
                >
                  <LocalIcon name="eye" className="h-3 w-3" />
                  {t({ pt: "Compacto", en: "Compact", es: "Compacto" })}
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "detailed" ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={viewMode === "detailed"}
                  onClick={() => setViewMode("detailed")}
                  className="h-7 rounded-full px-3 text-[11px]"
                >
                  <LocalIcon name="eye-off" className="h-3 w-3" />
                  {t({ pt: "Detalhado", en: "Detailed", es: "Detallado" })}
                </Button>
              </div>

              <Button
                type="button"
                variant={favoritesOnly ? "secondary" : "outline"}
                size="sm"
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly((current) => !current)}
                className="h-8 gap-1.5 rounded-full text-[11px]"
              >
                <Star className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current text-amber-500")} />
                {t({ pt: "Favoritos", en: "Favorites", es: "Favoritos" })}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmClear(true)}
                disabled={historico.length === 0}
                className="ml-auto h-8 gap-1.5 rounded-full text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LocalIcon name="trash" className="h-3.5 w-3.5" />
                {t({ pt: "Limpar", en: "Clear", es: "Borrar" })}
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => setSelectedTag(null)}>
                  <Badge variant={selectedTag === null ? "secondary" : "outline"} className="cursor-pointer normal-case tracking-normal">
                    {t({ pt: "Todas", en: "All", es: "Todas" })}
                  </Badge>
                </button>
                {availableTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} aria-pressed={selectedTag === tag}>
                    <Badge variant={selectedTag === tag ? "secondary" : "outline"} className="cursor-pointer gap-1 normal-case tracking-normal">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1">
          {historico.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="studio-icon-shell mb-4 h-12 w-12 animate-float-soft rounded-full">
                <LocalIcon name="history" className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">
                {t({ pt: "Nenhum QR salvo ainda", en: "No QR saved yet", es: "Todavía no hay QR guardados" })}
              </p>
              <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
                {t({
                  pt: "Gere um QR Code para criar o primeiro registro no histórico.",
                  en: "Generate a QR code to create the first history record.",
                  es: "Genera un código QR para crear el primer registro del historial.",
                })}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="studio-icon-shell mb-4 h-12 w-12 rounded-full">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">{t({ pt: "Nada encontrado", en: "Nothing found", es: "No se encontró nada" })}</p>
              <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
                {t({
                  pt: "Ajuste a busca ou limpe os filtros para ver os registros novamente.",
                  en: "Adjust the search or clear the filters to see the records again.",
                  es: "Ajusta la búsqueda o borra los filtros para volver a ver los registros.",
                })}
              </p>
              <Button type="button" variant="outline" onClick={resetFilters} className="mt-4 h-9 text-[12px]">
                {t({ pt: "Limpar filtros", en: "Clear filters", es: "Borrar filtros" })}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full px-3 pb-3">
              <div className="space-y-3 pt-3">
                {filteredHistory.map((entrada) => {
                  const meta = CONTENT_TYPE_META[entrada.tipoConteudo]
                  const previewSize = isMobile ? 56 : 68
                  const background = isSafeImageDataUrl(entrada.imagemFundo) ? entrada.imagemFundo : null
                  const logo = isSafeImageDataUrl(entrada.logoDataUri) ? entrada.logoDataUri : null
                  const badges = [
                    entrada.habilitarCustomizacaoLogo && logo && { label: "Logo", icon: "image-plus" },
                    entrada.habilitarCustomizacaoFundo && background && { label: t({ pt: "Fundo", en: "Background", es: "Fondo" }), icon: "image" },
                    entrada.habilitarCustomizacaoFrame &&
                      entrada.tipoFrameSelecionado &&
                      entrada.tipoFrameSelecionado !== "none" && { label: t({ pt: "Moldura", en: "Frame", es: "Marco" }), icon: "frame" },
                  ].filter((badge): badge is { label: string; icon: string } => Boolean(badge))

                  return (
                    <div key={entrada.id} className="studio-tile transition-all duration-200 hover:border-primary/30">
                      <div className="relative z-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="studio-icon-shell h-9 w-9 rounded-[0.9rem]">
                              <LocalIcon name={meta.icon} className="h-4 w-4 text-primary" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{t(meta.short)}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="normal-case tracking-normal">
                                  {formatRelativeTime(entrada.timestamp)}
                                </Badge>
                                {entrada.favorite && (
                                  <Badge variant="secondary" className="gap-1 normal-case tracking-normal">
                                    <Star className="h-3 w-3 fill-current text-amber-500" />
                                    {t({ pt: "Favorito", en: "Favorite", es: "Favorito" })}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleFavorite(entrada.id)}
                              className="h-8 w-8 rounded-full"
                              aria-pressed={!!entrada.favorite}
                              aria-label={
                                entrada.favorite
                                  ? t({ pt: "Remover dos favoritos", en: "Remove from favorites", es: "Quitar de favoritos" })
                                  : t({ pt: "Adicionar aos favoritos", en: "Add to favorites", es: "Añadir a favoritos" })
                              }
                            >
                              <Star className={cn("h-4 w-4 text-muted-foreground", entrada.favorite && "fill-current text-amber-500")} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveFromHistory(entrada.id)}
                              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={t({ pt: "Remover item do histórico", en: "Remove history item", es: "Eliminar del historial" })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="shrink-0">
                            <div
                              className="overflow-hidden rounded-[0.9rem] border border-border/60 p-1.5"
                              style={
                                background
                                  ? { backgroundImage: `url("${background}")`, backgroundPosition: "center", backgroundSize: "cover" }
                                  : { backgroundColor: entrada.corFundo }
                              }
                            >
                              {fitsInQr(entrada.valorQR, entrada.nivel) ? (
                                <ErrorBoundary fallback={<div style={{ width: previewSize, height: previewSize }} />} resetKey={entrada.valorQR}>
                                  <QRCodeCanvas
                                    value={entrada.valorQR}
                                    size={previewSize}
                                    fgColor={entrada.corFrente}
                                    bgColor={background ? "transparent" : entrada.corFundo}
                                    level={entrada.nivel}
                                    marginSize={1}
                                    imageSettings={
                                      logo
                                        ? {
                                            src: logo,
                                            height: previewSize * (entrada.logoTamanhoRatio ?? 0.2),
                                            width: previewSize * (entrada.logoTamanhoRatio ?? 0.2),
                                            excavate: entrada.escavarLogo ?? true,
                                          }
                                        : undefined
                                    }
                                  />
                                </ErrorBoundary>
                              ) : (
                                <div style={{ width: previewSize, height: previewSize }} />
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            <div>
                              <p className="truncate text-[13px] font-semibold text-foreground" title={entrada.inputOriginal}>
                                {entrada.inputOriginal || t({ pt: "Sem título", en: "Untitled", es: "Sin título" })}
                              </p>
                              <p className="mt-1 line-clamp-3 break-all text-[11px] text-muted-foreground" title={entrada.valorQR}>
                                {entrada.valorQR}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline" className="normal-case tracking-normal">
                                {entrada.tamanho}px
                              </Badge>
                              <Badge variant="outline" className="normal-case tracking-normal">
                                {t({ pt: "Correção", en: "Correction", es: "Corrección" })} {entrada.nivel}
                              </Badge>
                              <Badge variant="outline" className="normal-case tracking-normal">
                                {t({ pt: "Margem", en: "Margin", es: "Margen" })} {entrada.margem}
                              </Badge>
                              {badges.map((badge) => (
                                <Badge key={`${entrada.id}-${badge.icon}`} variant="outline" className="gap-1 normal-case tracking-normal">
                                  <LocalIcon name={badge.icon} className="h-3 w-3" />
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>

                            {(entrada.tags ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {(entrada.tags ?? []).map((tag) => (
                                  <button
                                    key={`${entrada.id}-${tag}`}
                                    type="button"
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    aria-pressed={selectedTag === tag}
                                  >
                                    <Badge variant={selectedTag === tag ? "secondary" : "outline"} className="cursor-pointer gap-1 normal-case tracking-normal">
                                      <Tag className="h-3 w-3" />
                                      {tag}
                                    </Badge>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {viewMode === "detailed" && (
                          <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 dark:border-dark-5/25 dark:bg-dark-1/50">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {t({ pt: "Cores", en: "Colors", es: "Colores" })}
                                </p>
                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">QR</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="h-3.5 w-3.5 rounded-full border border-border/60" style={{ backgroundColor: entrada.corFrente }} />
                                      <span className="font-mono">{entrada.corFrente}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{t({ pt: "Fundo", en: "Background", es: "Fondo" })}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="h-3.5 w-3.5 rounded-full border border-border/60" style={{ backgroundColor: entrada.corFundo }} />
                                      <span className="font-mono">{entrada.corFundo}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {t({ pt: "Registro", en: "Record", es: "Registro" })}
                                </p>
                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{t({ pt: "Criado", en: "Created", es: "Creado" })}</span>
                                    <span className="font-mono">{formatAbsoluteDate(entrada.timestamp)}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{t({ pt: "Conteúdo", en: "Content", es: "Contenido" })}</span>
                                    <span className="font-mono">{t(meta.short)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor={`tags-${entrada.id}`} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                                <Tag className="h-3.5 w-3.5 text-primary" />
                                {t({ pt: "Tags", en: "Tags", es: "Etiquetas" })}
                              </label>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                  id={`tags-${entrada.id}`}
                                  value={draftFor(entrada)}
                                  onChange={(event) => setTagDrafts((current) => ({ ...current, [entrada.id]: event.target.value }))}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault()
                                      handleTagSave(entrada)
                                    }
                                  }}
                                  placeholder={t({ pt: "Ex.: evento, cliente, wifi", en: "E.g. event, client, wifi", es: "P. ej.: evento, cliente, wifi" })}
                                  className="h-9 text-[12px]"
                                />
                                <Button type="button" variant="outline" onClick={() => handleTagSave(entrada)} className="h-9 gap-1.5 text-[12px]">
                                  <LocalIcon name="check" className="h-3.5 w-3.5" />
                                  {t({ pt: "Salvar tags", en: "Save tags", es: "Guardar etiquetas" })}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onLoadFromHistory(entrada)}
                            className="h-9 flex-1 gap-2 text-[12px] text-primary hover:border-primary/40 hover:bg-primary/8"
                          >
                            <LocalIcon name="reset" className="h-3.5 w-3.5" />
                            {t({ pt: "Reaplicar configurações", en: "Reapply settings", es: "Volver a aplicar ajustes" })}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="shrink-0 border-t border-border/60 bg-background/90 p-4">
          <SheetClose asChild>
            <Button variant="outline" className="h-10 w-full text-[12px]">
              {t({ pt: "Fechar", en: "Close", es: "Cerrar" })}
            </Button>
          </SheetClose>
        </div>

        <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{t({ pt: "Limpar todo o histórico?", en: "Clear the whole history?", es: "¿Borrar todo el historial?" })}</AlertDialogTitle>
              <AlertDialogDescription>
                {historico.length === 1
                  ? t({
                      pt: "O único registro será removido deste navegador. Essa ação não pode ser desfeita.",
                      en: "The only record will be removed from this browser. This cannot be undone.",
                      es: "Se eliminará el único registro de este navegador. Esta acción no se puede deshacer.",
                    })
                  : t({
                      pt: `Os ${historico.length} registros serão removidos deste navegador. Essa ação não pode ser desfeita.`,
                      en: `All ${historico.length} records will be removed from this browser. This cannot be undone.`,
                      es: `Se eliminarán los ${historico.length} registros de este navegador. Esta acción no se puede deshacer.`,
                    })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t({ pt: "Cancelar", en: "Cancel", es: "Cancelar" })}</AlertDialogCancel>
              <AlertDialogAction onClick={onClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t({ pt: "Limpar histórico", en: "Clear history", es: "Borrar historial" })}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
