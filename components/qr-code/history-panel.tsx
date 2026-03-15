"use client"

import { useEffect, useMemo, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Search, Star, Tag, Trash2 } from "lucide-react"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LocalIcon } from "@/components/ui/local-icon"
import { cn } from "@/lib/utils"
import type { AppLanguage } from "@/components/language-provider"
import type { EntradaQRCode } from "@/hooks/use-qr-code-state"

interface SheetHistoricoProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  historico: EntradaQRCode[]
  onLoadFromHistory: (entrada: EntradaQRCode) => void
  onClearHistory: () => void
  onToggleFavorite: (entryId: string) => void
  onUpdateTags: (entryId: string, tags: string[]) => void
  onRemoveFromHistory: (entryId: string) => void
  isMobile: boolean
  language?: AppLanguage
}

const CONTENT_TYPE_META: Record<string, { icon: string; label: string }> = {
  url: { icon: "link", label: "URL/Texto" },
  wifi: { icon: "wifi", label: "Wi-Fi" },
  vcard: { icon: "user", label: "Contato" },
  vevent: { icon: "calendar", label: "Evento" },
  email: { icon: "email", label: "Email" },
  sms: { icon: "sms", label: "SMS" },
  geo: { icon: "geo", label: "Localizacao" },
  whatsapp: { icon: "whatsapp", label: "WhatsApp" },
  whatsappGroup: { icon: "group", label: "Grupo" },
  phone: { icon: "phone", label: "Telefone" },
  pix: { icon: "pix", label: "PIX" },
  appstore: { icon: "app", label: "App" },
  spotify: { icon: "media", label: "Midia" },
  zoom: { icon: "video", label: "Reuniao" },
  menu: { icon: "menu", label: "Menu" },
  cupom: { icon: "coupon", label: "Cupom" },
}

function getTypeMeta(tipo: string, language: AppLanguage = "pt") {
  const meta = CONTENT_TYPE_META[tipo] ?? { icon: "link", label: tipo }
  if (language !== "en") {
    return meta
  }

  const englishLabels: Record<string, string> = {
    "URL/Texto": "URL/Text",
    Contato: "Contact",
    Evento: "Event",
    Localizacao: "Location",
    Grupo: "Group",
    Telefone: "Phone",
    Midia: "Media",
    Reuniao: "Meeting",
    Cupom: "Coupon",
  }

  return { ...meta, label: englishLabels[meta.label] ?? meta.label }
}

function formatAbsoluteDate(timestamp: number, language: AppLanguage = "pt") {
  return new Date(timestamp).toLocaleString(language === "en" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(timestamp: number, language: AppLanguage = "pt") {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (language === "en") {
    if (minutes < 1) return "Now"
    if (minutes < 60) return `${minutes} min`
    if (hours < 24) return `${hours} h`
    return `${days} d`
  }

  if (minutes < 1) return "Agora"
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours} h`
  return `${days} d`
}

function getCustomizationBadges(entrada: EntradaQRCode, language: AppLanguage = "pt") {
  const labels =
    language === "en"
      ? { logo: "Logo", background: "Background", frame: "Frame" }
      : { logo: "Logo", background: "Fundo", frame: "Moldura" }

  return [
    entrada.habilitarCustomizacaoLogo && entrada.logoDataUri
      ? { label: labels.logo, icon: "image-plus" }
      : null,
    entrada.habilitarCustomizacaoFundo && entrada.imagemFundo
      ? { label: labels.background, icon: "image" }
      : null,
    entrada.habilitarCustomizacaoFrame &&
    entrada.tipoFrameSelecionado &&
    entrada.tipoFrameSelecionado !== "none"
      ? { label: labels.frame, icon: "frame" }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: string }>
}

function normalizeTagsInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 24)),
    ),
  ).slice(0, 8)
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
  language = "pt",
}: SheetHistoricoProps) {
  const copy =
    language === "en"
      ? {
          title: "History",
          subtitle: "Search records, favorite the best ones and organize everything with tags.",
          searchPlaceholder: "Search by content, link or tag",
          compact: "Compact",
          detailed: "Detailed",
          favorites: "Favorites",
          clear: "Clear",
          all: "All",
          emptyTitle: "No QR saved yet",
          emptyDescription: "Generate a QR code to create the first history record.",
          noResultsTitle: "Nothing found",
          noResultsDescription: "Adjust the search or clear the filters to see the records again.",
          clearFilters: "Clear filters",
          favorite: "Favorite",
          colors: "Colors",
          record: "Record",
          created: "Created",
          content: "Content",
          tags: "Tags",
          saveTags: "Save tags",
          tagsPlaceholder: "Ex.: event, client, wifi",
          reapply: "Reapply settings",
          removeHistory: "Remove history item",
          close: "Close",
          qr: "QR",
          background: "Background",
          error: "Error",
          margin: "Margin",
          createdNow: "Created",
          titleFallback: "Untitled",
        }
      : {
          title: "Historico",
          subtitle: "Busque registros, favorite os melhores e organize com tags.",
          searchPlaceholder: "Buscar por conteudo, link ou tag",
          compact: "Compacto",
          detailed: "Detalhado",
          favorites: "Favoritos",
          clear: "Limpar",
          all: "Todas",
          emptyTitle: "Nenhum QR salvo ainda",
          emptyDescription: "Gere um QR Code para criar o primeiro registro no historico.",
          noResultsTitle: "Nada encontrado",
          noResultsDescription: "Ajuste a busca ou limpe os filtros para ver novamente os registros.",
          clearFilters: "Limpar filtros",
          favorite: "Favorito",
          colors: "Cores",
          record: "Registro",
          created: "Criado",
          content: "Conteudo",
          tags: "Tags",
          saveTags: "Salvar tags",
          tagsPlaceholder: "Ex.: evento, cliente, wifi",
          reapply: "Reaplicar configuracoes",
          removeHistory: "Remover item do historico",
          close: "Fechar",
          qr: "QR",
          background: "Fundo",
          error: "Erro",
          margin: "Margem",
          createdNow: "Criado",
          titleFallback: "Sem titulo",
        }

  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed")
  const [searchTerm, setSearchTerm] = useState("")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    setTagDrafts(
      historico.reduce<Record<string, string>>((acc, entrada) => {
        acc[entrada.id] = (entrada.tags ?? []).join(", ")
        return acc
      }, {}),
    )
  }, [historico])

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(
        historico.flatMap((entrada) => entrada.tags ?? []).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, language === "en" ? "en-US" : "pt-BR"))
  }, [historico, language])

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

      const typeLabel = getTypeMeta(entrada.tipoConteudo, language).label.toLowerCase()
      const haystack = [
        entrada.inputOriginal,
        entrada.valorQR,
        typeLabel,
        ...(entrada.tags ?? []),
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [favoritesOnly, historico, language, searchTerm, selectedTag])

  const handleTagSave = (entryId: string) => {
    onUpdateTags(entryId, normalizeTagsInput(tagDrafts[entryId] ?? ""))
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
        className={cn(
          "flex flex-col p-0",
          isMobile ? "h-[88vh] rounded-t-[1.6rem]" : "w-full sm:max-w-[620px]",
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border/60 bg-background/90 px-4 pb-4 pt-4 pr-12 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="studio-icon-shell h-10 w-10 rounded-[1rem]">
                <LocalIcon name="history" className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2 text-[1rem] font-glancyr700 uppercase tracking-tight text-foreground">
                  {copy.title}
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                    {historico.length}
                  </Badge>
                </SheetTitle>
                <DialogDescription className="mt-1 text-left text-[11px] text-muted-foreground">
                  {copy.subtitle}
                </DialogDescription>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-10 pl-10 text-[12px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
                <Button
                  type="button"
                  variant={viewMode === "compact" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                  className="h-7 rounded-full px-3 text-[11px]"
                >
                  <LocalIcon name="eye" className="h-3 w-3" />
                  {copy.compact}
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "detailed" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("detailed")}
                  className="h-7 rounded-full px-3 text-[11px]"
                >
                  <LocalIcon name="eye-off" className="h-3 w-3" />
                  {copy.detailed}
                </Button>
              </div>

              <Button
                type="button"
                variant={favoritesOnly ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFavoritesOnly((current) => !current)}
                className="h-8 gap-1.5 rounded-full text-[11px]"
              >
                <Star className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current text-amber-500")} />
                {copy.favorites}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                disabled={historico.length === 0}
                className="ml-auto h-8 gap-1.5 rounded-full text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LocalIcon name="trash" className="h-3.5 w-3.5" />
                {copy.clear}
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={selectedTag === null ? "secondary" : "outline"}
                  className="cursor-pointer normal-case tracking-normal"
                  onClick={() => setSelectedTag(null)}
                >
                  {copy.all}
                </Badge>
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "secondary" : "outline"}
                    className="cursor-pointer gap-1 normal-case tracking-normal"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1">
          {historico.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="studio-icon-shell mb-4 h-12 w-12 rounded-full animate-float-soft">
                <LocalIcon name="history" className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">{copy.emptyTitle}</p>
              <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
                {copy.emptyDescription}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="studio-icon-shell mb-4 h-12 w-12 rounded-full">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">{copy.noResultsTitle}</p>
              <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
                {copy.noResultsDescription}
              </p>
              <Button type="button" variant="outline" onClick={resetFilters} className="mt-4 h-9 text-[12px]">
                {copy.clearFilters}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full px-3 pb-3">
              <div className="space-y-3 pt-3">
                {filteredHistory.map((entrada) => {
                  const typeMeta = getTypeMeta(entrada.tipoConteudo, language)
                  const customizationBadges = getCustomizationBadges(entrada, language)
                  const previewSize = isMobile ? 56 : 68

                  return (
                    <div key={entrada.id} className="studio-tile transition-all duration-200 hover:border-primary/30">
                      <div className="relative z-[1] space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="studio-icon-shell h-9 w-9 rounded-[0.9rem]">
                              <LocalIcon name={typeMeta.icon} className="h-4 w-4 text-primary" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-foreground">{typeMeta.label}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="normal-case tracking-normal">
                                  {formatRelativeTime(entrada.timestamp, language)}
                                </Badge>
                                {entrada.favorite && (
                                  <Badge variant="secondary" className="gap-1 normal-case tracking-normal">
                                    <Star className="h-3 w-3 fill-current text-amber-500" />
                                  {copy.favorite}
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
                              aria-label={entrada.favorite ? copy.favorites : copy.favorite}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4 text-muted-foreground",
                                  entrada.favorite && "fill-current text-amber-500",
                                )}
                              />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveFromHistory(entrada.id)}
                              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={copy.removeHistory}
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
                                entrada.imagemFundo
                                  ? {
                                      backgroundImage: `url(${entrada.imagemFundo})`,
                                      backgroundPosition: "center",
                                      backgroundSize: "cover",
                                    }
                                  : {
                                      backgroundColor: entrada.corFundo,
                                    }
                              }
                            >
                              <QRCodeCanvas
                                value={entrada.valorQR}
                                size={previewSize}
                                fgColor={entrada.corFrente}
                                bgColor={entrada.imagemFundo ? "transparent" : entrada.corFundo}
                                level={entrada.nivel}
                                marginSize={1}
                                includeMargin={true}
                                imageSettings={
                                  entrada.logoDataUri
                                    ? {
                                        src: entrada.logoDataUri,
                                        height: previewSize * (entrada.logoTamanhoRatio || 0.2),
                                        width: previewSize * (entrada.logoTamanhoRatio || 0.2),
                                        excavate: entrada.escavarLogo ?? true,
                                      }
                                    : undefined
                                }
                              />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            <div>
                              <p
                                className="truncate text-[13px] font-semibold text-foreground"
                                title={entrada.inputOriginal}
                              >
                                {entrada.inputOriginal || copy.titleFallback}
                              </p>
                              <p
                                className="mt-1 break-all text-[11px] text-muted-foreground"
                                title={entrada.valorQR}
                              >
                                {entrada.valorQR}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline" className="normal-case tracking-normal">
                                {entrada.tamanho}px
                              </Badge>
                              <Badge variant="outline" className="normal-case tracking-normal">
                                Erro {entrada.nivel}
                              </Badge>
                              <Badge variant="outline" className="normal-case tracking-normal">
                                Margem {entrada.margem}
                              </Badge>
                              {customizationBadges.map((badge) => (
                                <Badge
                                  key={`${entrada.id}-${badge.label}`}
                                  variant="outline"
                                  className="gap-1 normal-case tracking-normal"
                                >
                                  <LocalIcon name={badge.icon} className="h-3 w-3" />
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>

                            {(entrada.tags ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {(entrada.tags ?? []).map((tag) => (
                                  <Badge
                                    key={`${entrada.id}-${tag}`}
                                    variant={selectedTag === tag ? "secondary" : "outline"}
                                    className="cursor-pointer gap-1 normal-case tracking-normal"
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                  >
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {viewMode === "detailed" && (
                          <div className="grid gap-3 rounded-[1rem] border border-border/60 bg-background/60 p-3 dark:border-dark-5/25 dark:bg-dark-1/50">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {copy.colors}
                                </p>
                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{copy.qr}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-3.5 w-3.5 rounded-full border border-border/60"
                                        style={{ backgroundColor: entrada.corFrente }}
                                      />
                                      <span className="font-mono">{entrada.corFrente}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{copy.background}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-3.5 w-3.5 rounded-full border border-border/60"
                                        style={{ backgroundColor: entrada.corFundo }}
                                      />
                                      <span className="font-mono">{entrada.corFundo}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  {copy.record}
                                </p>
                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{copy.created}</span>
                                    <span className="font-mono">{formatAbsoluteDate(entrada.timestamp, language)}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{copy.content}</span>
                                    <span className="font-mono">{typeMeta.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                                <Tag className="h-3.5 w-3.5 text-primary" />
                                {copy.tags}
                              </label>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                  value={tagDrafts[entrada.id] ?? ""}
                                  onChange={(event) =>
                                    setTagDrafts((current) => ({
                                      ...current,
                                      [entrada.id]: event.target.value,
                                    }))
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault()
                                      handleTagSave(entrada.id)
                                    }
                                  }}
                                  placeholder={copy.tagsPlaceholder}
                                  className="h-9 text-[12px]"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleTagSave(entrada.id)}
                                  className="h-9 gap-1.5 text-[12px]"
                                >
                                  <LocalIcon name="check" className="h-3.5 w-3.5" />
                                  {copy.saveTags}
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
                            {copy.reapply}
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
              {copy.close}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
