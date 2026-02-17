"use client"

import { useState, useMemo, useEffect } from "react"
import { Bell, X, Calendar, Clock, Star, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Publication } from "@/lib/types"
import type { ImportantDate } from "@/lib/types"

interface TodayNotificationsProps {
  publications: Publication[]
  importantDates: ImportantDate[]
  forceOpen?: boolean
  onForceOpenHandled?: () => void
  onCountChange?: (count: number) => void
}

export function TodayNotifications({ publications, importantDates, forceOpen, onForceOpenHandled, onCountChange }: TodayNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const today = mounted ? new Date() : null
  const todayDay = today?.getDate() ?? 0
  const todayMonth = today ? today.getMonth() + 1 : 0
  const todayYear = today?.getFullYear() ?? 0

  // Match publications for today
  const todayPublications = useMemo(() => {
    return publications.filter(pub => {
      const pubDate = new Date(pub.date)
      return (
        pubDate.getDate() === todayDay &&
        pubDate.getMonth() + 1 === todayMonth &&
        pubDate.getFullYear() === todayYear
      )
    })
  }, [publications, todayDay, todayMonth, todayYear])

  // Match important dates for today (format DD/MM)
  const todaySpecialDates = useMemo(() => {
    const todayStr = `${String(todayDay).padStart(2, '0')}/${String(todayMonth).padStart(2, '0')}`
    return importantDates.filter(d => d.date === todayStr)
  }, [importantDates, todayDay, todayMonth])

  const totalItems = todayPublications.length + todaySpecialDates.length

  // Report count to parent
  useEffect(() => {
    onCountChange?.(totalItems)
  }, [totalItems, onCountChange])

  // Handle external toggle from bell button
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setDismissed(false)
      onForceOpenHandled?.()
    }
  }, [forceOpen, onForceOpenHandled])

  if (!mounted || totalItems === 0 || dismissed) return null

  const statusColors: Record<string, string> = {
    publicado: 'bg-chart-1/20 text-chart-1',
    pendiente: 'bg-warning/20 text-warning',
    programado: 'bg-info/20 text-info',
    borrador: 'bg-muted text-muted-foreground',
  }

  return (
    <>
      {/* Collapsed bar */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 bg-primary/10 border-b border-primary/20 hover:bg-primary/15 transition-colors"
        >
          <div className="relative shrink-0">
            <Bell className="h-4 w-4 text-primary" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <p className="text-sm text-foreground flex-1 text-left truncate">
            <span className="font-medium">Hoy:</span>{" "}
            {todayPublications.length > 0 && (
              <span>{todayPublications.length} publicacion{todayPublications.length > 1 ? 'es' : ''}</span>
            )}
            {todayPublications.length > 0 && todaySpecialDates.length > 0 && ' y '}
            {todaySpecialDates.length > 0 && (
              <span>{todaySpecialDates.length} fecha{todaySpecialDates.length > 1 ? 's' : ''} especial{todaySpecialDates.length > 1 ? 'es' : ''}</span>
            )}
          </p>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div className="border-b border-primary/20 bg-card/80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-primary/10">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <Bell className="h-4 w-4 text-primary" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                Agenda de hoy - {today!.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDismissed(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 sm:px-4 py-3 space-y-3 max-h-72 overflow-y-auto">
            {/* Special dates */}
            {todaySpecialDates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  Fechas Especiales
                </p>
                {todaySpecialDates.map(date => (
                  <div
                    key={date.id}
                    className="flex items-center gap-3 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2.5"
                  >
                    <Calendar className="h-4 w-4 text-warning shrink-0" />
                    <p className="text-sm text-foreground">{date.title}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Publications */}
            {todayPublications.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Publicaciones programadas
                </p>
                {todayPublications.map(pub => (
                  <div
                    key={pub.id}
                    className="flex items-start sm:items-center gap-3 rounded-lg bg-secondary/50 border border-border px-3 py-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xs font-mono text-primary shrink-0">{pub.time}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{pub.description}</p>
                        <p className="text-xs text-muted-foreground truncate">{pub.theme}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs capitalize">{pub.format}</Badge>
                      <Badge className={`text-xs capitalize ${statusColors[pub.status] || ''}`}>
                        {pub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
