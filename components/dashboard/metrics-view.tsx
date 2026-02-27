"use client"

import { useState, useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { Publication, SocialNetwork } from "@/lib/types"
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Music2,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Play,
  CalendarDays,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"

interface MetricsViewProps {
  selectedMonth: number
  selectedYear: number
  publications?: Publication[]
}

const ALL_NETWORKS: SocialNetwork[] = ["instagram", "facebook", "twitter", "tiktok", "linkedin"]

const NETWORK_INFO: Record<SocialNetwork, { name: string; icon: typeof Instagram; color: string }> = {
  instagram: { name: "Instagram", icon: Instagram, color: "#E4405F" },
  facebook: { name: "Facebook", icon: Facebook, color: "#1877F2" },
  twitter: { name: "Twitter/X", icon: Twitter, color: "#1DA1F2" },
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  tiktok: { name: "TikTok", icon: Music2, color: "#00f2ea" },
}

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"]

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
}

/**
 * Normaliza networkMetrics a un array SIEMPRE.
 * - null/undefined -> []
 * - string JSON -> parse -> array u objeto
 * - objeto single metric -> [obj]
 * - objeto tipo map { instagram: {...}, facebook: {...} } -> lo convierte a array
 */
function normalizeNetworkMetrics(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value

  // Si viene como string JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return normalizeNetworkMetrics(parsed)
    } catch {
      return []
    }
  }

  // Si viene como objeto single con shape { network, reach, likes... }
  if (typeof value === "object") {
    const v = value as any

    if (typeof v.network === "string") {
      return [v]
    }

    // Si viene como "mapa" por red: { instagram: {reach...}, facebook: {...} }
    const entries = Object.entries(v)
    if (entries.length > 0) {
      const arr = entries
        .map(([net, data]) => {
          if (!data || typeof data !== "object") return null
          return {
            network: net,
            reach: Number((data as any).reach ?? 0),
            likes: Number((data as any).likes ?? 0),
            comments: Number((data as any).comments ?? 0),
            shares: Number((data as any).shares ?? 0),
            views: Number((data as any).views ?? 0),
            url: (data as any).url ?? "",
          }
        })
        .filter(Boolean) as any[]
      return arr
    }
  }

  return []
}

export function MetricsView({ selectedMonth, selectedYear, publications = [] }: MetricsViewProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [expandedNetworks, setExpandedNetworks] = useState<Set<string>>(new Set())

  const toggleNetworkExpand = (network: string) => {
    setExpandedNetworks((prev) => {
      const next = new Set(prev)
      if (next.has(network)) next.delete(network)
      else next.add(network)
      return next
    })
  }

  // Filter publications: by date range if set, otherwise by selected month/year
  const filteredPubs = useMemo(() => {
    if (dateFrom || dateTo) {
      return publications.filter((pub) => {
        if (dateFrom && pub.date < dateFrom) return false
        if (dateTo && pub.date > dateTo) return false
        return true
      })
    }

    return publications.filter((pub) => {
      const d = new Date(pub.date)
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [publications, dateFrom, dateTo, selectedMonth, selectedYear])

  const clearDateFilter = () => {
    setDateFrom("")
    setDateTo("")
  }

  const hasDateFilter = dateFrom || dateTo

  // ------- Compute ALL data from filteredPubs.networkMetrics -------
  const computed = useMemo(() => {
    const byNetwork: Record<
      string,
      { reach: number; likes: number; comments: number; shares: number; views: number; pubCount: number }
    > = {}

    for (const net of ALL_NETWORKS) {
      byNetwork[net] = { reach: 0, likes: 0, comments: 0, shares: 0, views: 0, pubCount: 0 }
    }

    let totalReach = 0
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    let totalViews = 0
    let pubsWithMetrics = 0

    for (const pub of filteredPubs) {
      const metrics = normalizeNetworkMetrics((pub as any).networkMetrics)
      if (metrics.length === 0) continue

      pubsWithMetrics++

      for (const nm of metrics) {
        const net = String(nm.network || "")
        if (!net) continue

        if (!byNetwork[net]) {
          byNetwork[net] = { reach: 0, likes: 0, comments: 0, shares: 0, views: 0, pubCount: 0 }
        }

        const reach = Number(nm.reach ?? 0)
        const likes = Number(nm.likes ?? 0)
        const comments = Number(nm.comments ?? 0)
        const shares = Number(nm.shares ?? 0)
        const views = Number(nm.views ?? 0)

        byNetwork[net].reach += reach
        byNetwork[net].likes += likes
        byNetwork[net].comments += comments
        byNetwork[net].shares += shares
        byNetwork[net].views += views
        byNetwork[net].pubCount++

        totalReach += reach
        totalLikes += likes
        totalComments += comments
        totalShares += shares
        totalViews += views
      }
    }

    const totalInteractions = totalLikes + totalComments + totalShares
    const engagement = totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0

    return {
      byNetwork,
      totals: {
        reach: totalReach,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        views: totalViews,
        interactions: totalInteractions,
      },
      engagement: Math.round(engagement * 10) / 10,
      totalPublications: filteredPubs.length,
      pubsWithMetrics,
    }
  }, [filteredPubs])

  // Filtered stats by selected network
  const filteredStats = useMemo(() => {
    if (selectedNetwork === "all") {
      return {
        reach: computed.totals.reach,
        likes: computed.totals.likes,
        comments: computed.totals.comments,
        shares: computed.totals.shares,
        views: computed.totals.views,
        interactions: computed.totals.interactions,
        engagement: computed.engagement,
        publications: computed.totalPublications,
      }
    }

    const nd = computed.byNetwork[selectedNetwork]
    if (!nd) {
      return { reach: 0, likes: 0, comments: 0, shares: 0, views: 0, interactions: 0, engagement: 0, publications: 0 }
    }

    const interactions = nd.likes + nd.comments + nd.shares
    const eng = nd.reach > 0 ? Math.round(((interactions / nd.reach) * 100) * 10) / 10 : 0

    return {
      reach: nd.reach,
      likes: nd.likes,
      comments: nd.comments,
      shares: nd.shares,
      views: nd.views,
      interactions,
      engagement: eng,
      publications: nd.pubCount,
    }
  }, [selectedNetwork, computed])

  const interactionsBarData = useMemo(() => {
    return ALL_NETWORKS.map((net) => ({
      name: NETWORK_INFO[net].name,
      likes: computed.byNetwork[net]?.likes || 0,
      comentarios: computed.byNetwork[net]?.comments || 0,
      compartidos: computed.byNetwork[net]?.shares || 0,
    }))
  }, [computed])

  const pieData = useMemo(() => {
    return ALL_NETWORKS.filter((net) => (computed.byNetwork[net]?.reach || 0) > 0).map((net) => ({
      name: NETWORK_INFO[net].name,
      value: computed.byNetwork[net].reach,
      color: NETWORK_INFO[net].color,
    }))
  }, [computed])

  const pubTrendData = useMemo(() => {
    const sorted = [...filteredPubs]
      .map((p) => ({ pub: p, metrics: normalizeNetworkMetrics((p as any).networkMetrics) }))
      .filter((x) => x.metrics.length > 0)
      .sort((a, b) => a.pub.date.localeCompare(b.pub.date) || a.pub.time.localeCompare(b.pub.time))

    return sorted.map(({ pub, metrics }, i) => {
      if (selectedNetwork === "all") {
        const reach = metrics.reduce((s, m) => s + Number(m.reach ?? 0), 0)
        const likes = metrics.reduce((s, m) => s + Number(m.likes ?? 0), 0)
        return { name: `P${i + 1}`, alcance: reach, likes }
      }
      const nm = metrics.find((m) => m.network === selectedNetwork)
      return { name: `P${i + 1}`, alcance: Number(nm?.reach ?? 0), likes: Number(nm?.likes ?? 0) }
    })
  }, [filteredPubs, selectedNetwork])

  const viewsBarData = useMemo(() => {
    return ALL_NETWORKS.map((net) => ({
      name: NETWORK_INFO[net].name,
      reproducciones: computed.byNetwork[net]?.views || 0,
      color: NETWORK_INFO[net].color,
    }))
  }, [computed])

  const pubsByNetwork = useMemo(() => {
    const result: Record<
      string,
      Array<{
        id: string
        date: string
        time: string
        description: string
        theme: string
        format: string
        reach: number
        likes: number
        comments: number
        shares: number
        views: number
        url: string
      }>
    > = {}

    for (const net of ALL_NETWORKS) result[net] = []

    for (const pub of filteredPubs) {
      const metrics = normalizeNetworkMetrics((pub as any).networkMetrics)
      if (metrics.length === 0) continue

      for (const nm of metrics) {
        const net = String(nm.network || "")
        if (!net) continue
        if (!result[net]) result[net] = []

        result[net].push({
          id: pub.id,
          date: pub.date,
          time: pub.time,
          description: pub.description,
          theme: pub.theme,
          format: pub.format,
          reach: Number(nm.reach ?? 0),
          likes: Number(nm.likes ?? 0),
          comments: Number(nm.comments ?? 0),
          shares: Number(nm.shares ?? 0),
          views: Number(nm.views ?? 0),
          url: String(nm.url ?? ""),
        })
      }
    }

    for (const net of Object.keys(result)) {
      result[net].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    }

    return result
  }, [filteredPubs])

  const selectedNetworkInfo = selectedNetwork !== "all" ? NETWORK_INFO[selectedNetwork as SocialNetwork] : null
  const networkColor = selectedNetworkInfo?.color || "#10b981"

  const FILTER_OPTIONS = [
    { id: "all", name: "Todas", icon: Filter },
    ...Object.entries(NETWORK_INFO).map(([id, info]) => ({ id, name: info.name, icon: info.icon, color: info.color })),
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrar por Red Social:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((network) => {
                const Icon = network.icon
                const isSelected = selectedNetwork === network.id
                return (
                  <Button
                    key={network.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNetwork(network.id)}
                    className={`flex items-center gap-2 transition-all ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                    style={isSelected && "color" in network && (network as any).color ? { backgroundColor: (network as any).color, borderColor: (network as any).color } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{network.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrar por rango de fechas:</span>
              {hasDateFilter && (
                <Button variant="ghost" size="sm" onClick={clearDateFilter} className="text-xs text-muted-foreground hover:text-foreground ml-auto h-7 px-2">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpiar filtro
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Desde:</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-secondary border-border text-foreground h-9 text-sm w-full sm:w-44" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Hasta:</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-secondary border-border text-foreground h-9 text-sm w-full sm:w-44" />
              </div>
              {!hasDateFilter && <span className="text-xs text-muted-foreground">Mostrando datos del mes seleccionado. Usa las fechas para un rango personalizado.</span>}
              {hasDateFilter && <span className="text-xs text-primary font-medium">Rango personalizado activo ({filteredPubs.length} publicaciones)</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs sm:text-sm text-muted-foreground">Engagement</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{filteredStats.engagement}%</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedNetwork === "twitter" || selectedNetwork === "linkedin" ? "Impresiones" : "Alcance"} Total
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{filteredStats.reach.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs sm:text-sm text-muted-foreground">Interacciones Totales</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{filteredStats.interactions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs sm:text-sm text-muted-foreground">Publicaciones</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{filteredStats.publications}</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Me gusta</p>
              <p className="text-lg font-bold text-foreground">{filteredStats.likes.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Comentarios</p>
              <p className="text-lg font-bold text-foreground">{filteredStats.comments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <Share2 className="h-5 w-5 text-green-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Compartidos</p>
              <p className="text-lg font-bold text-foreground">{filteredStats.shares.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <Play className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Reproducciones</p>
              <p className="text-lg font-bold text-foreground">{filteredStats.views.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Interacciones por Red Social</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="likes" name="Me gusta" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comentarios" name="Comentarios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compartidos" name="Compartidos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribucion de Alcance</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Sin datos de alcance. Agrega metricas a las publicaciones.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tendencia por Publicacion</CardTitle>
          </CardHeader>
          <CardContent>
            {pubTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pubTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="alcance" name="Alcance" stroke={selectedNetwork === "all" ? "#3b82f6" : networkColor} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="likes" name="Me gusta" stroke={selectedNetwork === "all" ? "#10b981" : `${networkColor}99`} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Sin datos de tendencia. Agrega metricas a las publicaciones.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Reproducciones por Red Social</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="reproducciones" name="Reproducciones" radius={[4, 4, 0, 0]}>
                  {viewsBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Detalle por Red Social</CardTitle>
          <p className="text-sm text-muted-foreground">
            {computed.pubsWithMetrics > 0
              ? `Datos reales de ${computed.pubsWithMetrics} publicacion(es) con metricas ingresadas de ${filteredPubs.length} total`
              : `${filteredPubs.length} publicacion(es) en el periodo. Aun sin metricas ingresadas.`}{" "}
            <span className="text-xs text-muted-foreground/70">Haz clic en una red para ver el detalle por publicacion.</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium text-sm w-8"></th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium text-sm">Red Social</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Alcance</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Me gusta</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Comentarios</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Compartidos</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Reproducciones</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Pubs.</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium text-sm">Engagement</th>
                </tr>
              </thead>

              <tbody>
                {ALL_NETWORKS.map((network) => {
                  const data = computed.byNetwork[network] || { reach: 0, likes: 0, comments: 0, shares: 0, views: 0, pubCount: 0 }
                  const info = NETWORK_INFO[network]
                  const Icon = info.icon
                  const netInteractions = data.likes + data.comments + data.shares
                  const netEngagement = data.reach > 0 ? Math.round(((netInteractions / data.reach) * 100) * 10) / 10 : 0
                  const isExpanded = expandedNetworks.has(network)
                  const pubs = pubsByNetwork[network] || []

                  return (
                    <Fragment key={network}>
                      <tr
                        className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-secondary/30 ${isExpanded ? "bg-secondary/20" : ""}`}
                        onClick={() => toggleNetworkExpand(network)}
                      >
                        <td className="py-3 px-2 text-center">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-primary inline-block" /> : <ChevronRight className="h-4 w-4 text-muted-foreground inline-block" />}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: info.color }} />
                            <span className="text-foreground font-medium text-sm">{info.name}</span>
                            {pubs.length > 0 && <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">{pubs.length}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.reach.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.likes.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.comments.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.shares.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.views.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-foreground text-sm font-medium">{data.pubCount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-sm font-semibold text-primary">{netEngagement}%</span>
                        </td>
                      </tr>

                      {isExpanded &&
                        (pubs.length > 0 ? (
                          pubs.map((pub, idx) => {
                            const pubInteractions = pub.likes + pub.comments + pub.shares
                            const pubEng = pub.reach > 0 ? Math.round(((pubInteractions / pub.reach) * 100) * 10) / 10 : 0
                            return (
                              <tr key={`${network}-${pub.id}-${idx}`} className="bg-secondary/10 border-b border-border/30">
                                <td className="py-2 px-2"></td>
                                <td className="py-2 px-3">
                                  <div className="flex flex-col">
                                    {pub.url ? (
                                      <a
                                        href={pub.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary hover:text-primary/80 hover:underline truncate max-w-[200px] inline-flex items-center gap-1 transition-colors"
                                        title={`Abrir publicacion: ${pub.description || pub.theme}`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {pub.description || pub.theme}
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                      </a>
                                    ) : (
                                      <span className="text-xs font-medium text-foreground/80 truncate max-w-[200px]" title={pub.description}>
                                        {pub.description || pub.theme}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {pub.date} - {pub.time} - {pub.format}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">{pub.reach.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">{pub.likes.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">{pub.comments.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">{pub.shares.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">{pub.views.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center text-foreground/70 text-xs">1</td>
                                <td className="py-2 px-3 text-center">
                                  <span className="text-xs text-primary/70">{pubEng}%</span>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr key={`${network}-empty`} className="bg-secondary/10 border-b border-border/30">
                            <td className="py-2 px-2"></td>
                            <td colSpan={8} className="py-4 px-3 text-center text-xs text-muted-foreground">
                              No hay publicaciones con metricas para {info.name} en este periodo.
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  )
                })}

                <tr className="border-t-2 border-primary/30 bg-secondary/30 font-semibold">
                  <td className="py-3 px-2"></td>
                  <td className="py-3 px-3 text-foreground text-sm">Total</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">{computed.totals.reach.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">{computed.totals.likes.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">{computed.totals.comments.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">{computed.totals.shares.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">{computed.totals.views.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-foreground text-sm">
                    {Object.values(computed.byNetwork).reduce((s, d) => s + (d?.pubCount || 0), 0)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm font-bold text-primary">{computed.engagement}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}