"use client"

import { useState, useMemo, useCallback } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Overview } from "@/components/dashboard/overview"
import { PublicationCalendar } from "@/components/dashboard/publication-calendar"
import { ImportantDates } from "@/components/dashboard/important-dates"
import { MetricsView } from "@/components/dashboard/metrics-view"
import { SettingsView } from "@/components/dashboard/settings-view"
import { NewPublicationModal } from "@/components/dashboard/new-publication-modal"
import { TodayNotifications } from "@/components/dashboard/today-notifications"
import { SAMPLE_PUBLICATIONS, MONTHS, DAYS_OF_WEEK, IMPORTANT_DATES } from "@/lib/data"
import type { Publication, PublicationStatus, ContentObjective, ContentFormat, SocialNetwork, PublicationAttachment } from "@/lib/types"
import type { PublicationFormData } from "@/components/dashboard/new-publication-modal"

const TAB_TITLES: Record<string, string> = {
  overview: 'Resumen General',
  calendar: 'Programación de Publicaciones',
  dates: 'Fechas Especiales',
  metrics: 'Métricas y Análisis',
  settings: 'Configuración',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [showNewPublication, setShowNewPublication] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null)
  const [publications, setPublications] = useState<Publication[]>(SAMPLE_PUBLICATIONS)
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

  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const pubDate = new Date(pub.date)
      return pubDate.getMonth() + 1 === selectedMonth && pubDate.getFullYear() === selectedYear
    })
  }, [publications, selectedMonth, selectedYear])

  const handleSavePublication = (data: PublicationFormData) => {
    if (editingPublication) {
      // Editar publicacion existente
      setPublications(prev => prev.map(pub => {
        if (pub.id !== editingPublication.id) return pub
        const date = new Date(data.date)
        return {
          ...pub,
          date: data.date,
          dayOfWeek: DAYS_OF_WEEK[date.getDay()],
          theme: data.theme,
          description: data.description,
          objective: data.objective as ContentObjective,
          networks: data.networks,
          time: data.time,
          hashtags: data.hashtags.split(' ').filter(Boolean),
          caption: data.caption,
          format: data.format as ContentFormat,
          responsibles: data.responsibles,
          attachments: data.attachments,
          networkMetrics: data.networkMetrics,
        }
      }))
      setEditingPublication(null)
    } else {
      // Nueva publicacion
      const date = new Date(data.date)
      const newPublication: Publication = {
        id: `pub-${Date.now()}`,
        date: data.date,
        dayOfWeek: DAYS_OF_WEEK[date.getDay()],
        theme: data.theme,
        description: data.description,
        objective: data.objective as ContentObjective,
        networks: data.networks,
        time: data.time,
        hashtags: data.hashtags.split(' ').filter(Boolean),
        caption: data.caption,
        format: data.format as ContentFormat,
        responsibles: data.responsibles,
        observations: '',
        status: 'pendiente' as PublicationStatus,
        links: [],
        attachments: data.attachments,
        networkMetrics: data.networkMetrics,
      }
      setPublications(prev => [...prev, newPublication])
    }
  }

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub)
    setShowNewPublication(true)
  }

  const handleDeletePublications = (ids: string[]) => {
    setPublications(prev => prev.filter(p => !ids.includes(p.id)))
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview 
            publications={filteredPublications} 
            selectedMonth={selectedMonth}
          />
        )
      case 'calendar':
        return (
          <PublicationCalendar 
            publications={filteredPublications} 
            onEdit={handleEditPublication}
            onDelete={handleDeletePublications}
          />
        )
      case 'dates':
        return <ImportantDates selectedMonth={selectedMonth} />
      case 'metrics':
        return (
          <MetricsView 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            publications={publications}
          />
        )
      case 'settings':
        return <SettingsView />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed md:relative z-40 h-screen transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); setMobileMenuOpen(false) }}
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
          onNewPublication={activeTab === 'calendar' ? () => setShowNewPublication(true) : undefined}
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          {renderContent()}
        </main>
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
