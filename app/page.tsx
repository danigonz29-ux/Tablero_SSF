"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Overview } from "@/components/dashboard/overview"
import { PublicationCalendar } from "@/components/dashboard/publication-calendar"
import { ImportantDates } from "@/components/dashboard/important-dates"
import { MetricsView } from "@/components/dashboard/metrics-view"
import { SettingsView } from "@/components/dashboard/settings-view"
import { NewPublicationModal } from "@/components/dashboard/new-publication-modal"
import { TodayNotifications } from "@/components/dashboard/today-notifications"
import { DAYS_OF_WEEK, IMPORTANT_DATES } from "@/lib/data"
import type { Publication, PublicationStatus, ContentObjective, ContentFormat } from "@/lib/types"
import type { PublicationFormData } from "@/components/dashboard/new-publication-modal"

import {
  fetchPublicacionesByMonthYear,
  insertPublicacion,
  updatePublicacion,
  deletePublicaciones,
} from "@/lib/supabase/publicaciones"

const TAB_TITLES: Record<string, string> = {
  overview: "Resumen General",
  calendar: "Programación de Publicaciones",
  dates: "Fechas Especiales",
  metrics: "Métricas y Análisis",
  settings: "Configuración",
}

/**
 * Normaliza publicaciones que vienen de Supabase
 * para que el UI no reviente y el modal tenga métricas.
 *
 * Nota: Algunas implementaciones guardan métricas en columnas (alcance, interacciones)
 * y el UI las espera en pub.networkMetrics o pub.metrics. Aquí las "puenteamos".
 */
function normalizePublication(pub: any): Publication {
  const alcance = typeof pub?.alcance === "number" ? pub.alcance : 0
  const interacciones = typeof pub?.interacciones === "number" ? pub.interacciones : 0

  const safe: any = { ...pub }

  // Arrays que el UI suele iterar
  safe.networks = Array.isArray(safe.networks) ? safe.networks : []
  safe.hashtags = Array.isArray(safe.hashtags) ? safe.hashtags : []
  safe.links = Array.isArray(safe.links) ? safe.links : []
  safe.responsibles = Array.isArray(safe.responsibles) ? safe.responsibles : []
  safe.attachments = Array.isArray(safe.attachments) ? safe.attachments : []

  // Métricas: garantizamos algo usable por el modal
  // 1) Si tu modal usa networkMetrics:
  safe.networkMetrics =
    safe.networkMetrics ??
    {
      // nombres genéricos (si tu UI usa estos)
      reach: alcance,
      interactions: interacciones,
      // por si tu UI usa directamente estas keys
      alcance,
      interacciones,
    }

  // 2) Si tu modal usa metrics:
  safe.metrics =
    safe.metrics ??
    {
      reach: alcance,
      interactions: interacciones,
      // por compatibilidad (si alguien lo renderiza así)
      alcance,
      interacciones,
    }

  return safe as Publication
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [showNewPublication, setShowNewPublication] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null)

  // ✅ Ahora viene de Supabase
  const [publications, setPublications] = useState<Publication[]>([])
  const [loadingPubs, setLoadingPubs] = useState(false)
  const [pubsError, setPubsError] = useState<string | null>(null)

  const [notifCount, setNotifCount] = useState(0)
  const [forceOpenNotifs, setForceOpenNotifs] = useState(false)

  const handleBellClick = useCallback(() => {
    setForceOpenNotifs(true)
  }, [])

  const handleForceOpenHandled = useCallback(() => {
    setForceOpenNotifs(false)
  }, [])

  const handleNotifCountChange = useCallback((count: number) => {
    setNotifCount(count)
  }, [])

  // ✅ Cargar publicaciones del mes/año desde Supabase
  const loadPublications = useCallback(async () => {
    try {
      setLoadingPubs(true)
      setPubsError(null)

      const pubs = await fetchPublicacionesByMonthYear(selectedMonth, selectedYear)

      // ✅ NORMALIZACIÓN CLAVE (esto te arregla el “Ver detalle” con métricas en 0)
      const normalized = (pubs || []).map((p: any) => normalizePublication(p))

      setPublications(normalized)
    } catch (e: any) {
      setPubsError(e?.message ?? "Error cargando publicaciones")
    } finally {
      setLoadingPubs(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    loadPublications()
  }, [loadPublications])

  // OJO: ya estás trayendo por mes/año desde Supabase, pero mantenemos este filtro
  // por seguridad si el fetch en algún momento cambia.
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const pubDate = new Date(pub.date)
      return pubDate.getMonth() + 1 === selectedMonth && pubDate.getFullYear() === selectedYear
    })
  }, [publications, selectedMonth, selectedYear])

  // ✅ Guardar en Supabase (insert/update)
  const handleSavePublication = useCallback(
    async (data: PublicationFormData) => {
      const date = new Date(data.date)

      if (editingPublication) {
        const updated: Publication = {
          ...editingPublication,
          date: data.date,
          dayOfWeek: DAYS_OF_WEEK[date.getDay()],
          theme: data.theme,
          description: data.description,
          objective: data.objective as ContentObjective,
          networks: data.networks,
          time: data.time,
          hashtags: data.hashtags.split(" ").filter(Boolean),
          caption: data.caption,
          format: data.format as ContentFormat,
          responsibles: data.responsibles,
          attachments: data.attachments,
          networkMetrics: data.networkMetrics,
        }

        await updatePublicacion(editingPublication.id, updated)
        setEditingPublication(null)
        await loadPublications()
        return
      }

      const newPublication: Publication = {
        id: "temp", // Supabase asigna el id real (uuid). Este "temp" no se usa.
        date: data.date,
        dayOfWeek: DAYS_OF_WEEK[date.getDay()],
        theme: data.theme,
        description: data.description,
        objective: data.objective as ContentObjective,
        networks: data.networks,
        time: data.time,
        hashtags: data.hashtags.split(" ").filter(Boolean),
        caption: data.caption,
        format: data.format as ContentFormat,
        responsibles: data.responsibles,
        observations: "",
        status: "pendiente" as PublicationStatus,
        links: [],
        attachments: data.attachments,
        networkMetrics: data.networkMetrics,
      }

      await insertPublicacion(newPublication)
      await loadPublications()
    },
    [editingPublication, loadPublications]
  )

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub)
    setShowNewPublication(true)
  }

  // ✅ Borrar en Supabase
  const handleDeletePublications = useCallback(
    async (ids: string[]) => {
      await deletePublicaciones(ids)
      await loadPublications()
    },
    [loadPublications]
  )

  const renderContent = () => {
    if (loadingPubs) {
      return <div className="p-4">Cargando publicaciones…</div>
    }

    if (pubsError) {
      return (
        <div className="p-4">
          <div className="mb-2">Error: {pubsError}</div>
          <button className="underline" onClick={loadPublications}>
            Reintentar
          </button>
        </div>
      )
    }

    switch (activeTab) {
      case "overview":
        return <Overview publications={filteredPublications} selectedMonth={selectedMonth} />
      case "calendar":
        return (
          <PublicationCalendar
            publications={filteredPublications}
            onEdit={handleEditPublication}
            onDelete={handleDeletePublications}
          />
        )
      case "dates":
        return <ImportantDates selectedMonth={selectedMonth} />
      case "metrics":
        return <MetricsView selectedMonth={selectedMonth} selectedYear={selectedYear} publications={publications} />
      case "settings":
        return <SettingsView />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={`
        fixed md:relative z-40 h-screen transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setMobileMenuOpen(false)
          }}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          title={TAB_TITLES[activeTab]}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onNewPublication={activeTab === "calendar" ? () => setShowNewPublication(true) : undefined}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          notificationCount={notifCount}
          onBellClick={handleBellClick}
        />

        <TodayNotifications
          publications={publications}
          importantDates={IMPORTANT_DATES}
          forceOpen={forceOpenNotifs}
          onForceOpenHandled={handleForceOpenHandled}
          onCountChange={handleNotifCountChange}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">{renderContent()}</main>
      </div>

      <NewPublicationModal
        open={showNewPublication}
        onOpenChange={(open) => {
          setShowNewPublication(open)
          if (!open) setEditingPublication(null)
        }}
        onSave={handleSavePublication}
        editingPublication={editingPublication}
      />
    </div>
  )
}