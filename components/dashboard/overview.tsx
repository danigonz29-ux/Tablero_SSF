"use client"

import { useMemo } from "react"
import { Calendar, CheckCircle, Clock, TrendingUp, Users, Heart, MessageCircle, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Publication, SocialNetwork } from "@/lib/types"
import { MONTHS } from "@/lib/data"

const NETWORK_LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
}

const NETWORK_ORDER: SocialNetwork[] = ["instagram", "facebook", "tiktok", "twitter", "linkedin"]

interface OverviewProps {
  publications: Publication[]
  selectedMonth: number
}

function normalizeNetworkMetrics(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return normalizeNetworkMetrics(parsed)
    } catch {
      return []
    }
  }

  if (typeof value === "object") {
    const v = value as any

    if (typeof v.network === "string") return [v]

    const entries = Object.entries(v)
    if (entries.length > 0) {
      return entries
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
    }
  }

  return []
}

export function Overview({ publications, selectedMonth }: OverviewProps) {
  const published = publications.filter((p) => p.status === "publicado").length
  const pending = publications.filter((p) => p.status === "pendiente").length
  const scheduled = publications.filter((p) => p.status === "programado").length

  const realMetrics = useMemo(() => {
    let totalReach = 0
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    let totalViews = 0

    const byNetwork: Record<
      string,
      { reach: number; likes: number; comments: number; shares: number; views: number; count: number }
    > = {}

    for (const pub of publications) {
      const metrics = normalizeNetworkMetrics((pub as any).networkMetrics)
      if (metrics.length === 0) continue

      for (const nm of metrics) {
        const net = String(nm.network || "")
        if (!net) continue

        const reach = Number(nm.reach ?? 0)
        const likes = Number(nm.likes ?? 0)
        const comments = Number(nm.comments ?? 0)
        const shares = Number(nm.shares ?? 0)
        const views = Number(nm.views ?? 0)

        totalReach += reach
        totalLikes += likes
        totalComments += comments
        totalShares += shares
        totalViews += views

        if (!byNetwork[net]) {
          byNetwork[net] = { reach: 0, likes: 0, comments: 0, shares: 0, views: 0, count: 0 }
        }

        byNetwork[net].reach += reach
        byNetwork[net].likes += likes
        byNetwork[net].comments += comments
        byNetwork[net].shares += shares
        byNetwork[net].views += views
        byNetwork[net].count++
      }
    }

    const networkEngagement = NETWORK_ORDER.map((net) => {
      const data = byNetwork[net]
      if (!data || data.reach === 0) return { network: net, engagement: 0, interactions: 0, reach: 0 }
      const interactions = data.likes + data.comments + data.shares
      const engagement = (interactions / data.reach) * 100
      return { network: net, engagement: Number(engagement.toFixed(1)), interactions, reach: data.reach }
    })

    const maxEngagement = Math.max(...networkEngagement.map((n) => n.engagement), 1)

    return {
      totalReach,
      totalLikes,
      totalComments,
      totalShares,
      totalViews,
      byNetwork,
      networkEngagement,
      maxEngagement,
    }
  }, [publications])

  const hasAnyMetrics = realMetrics.totalReach > 0 || realMetrics.totalLikes > 0

  const stats = [
    { title: "Total Publicaciones", value: publications.length, icon: Calendar, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    { title: "Publicadas", value: published, icon: CheckCircle, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    { title: "Pendientes", value: pending, icon: Clock, color: "text-chart-3", bgColor: "bg-chart-3/10" },
    { title: "Programadas", value: scheduled, icon: TrendingUp, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  ]

  const engagementStats = [
    { title: "Alcance Total", value: realMetrics.totalReach.toLocaleString(), icon: Users },
    { title: "Me gusta", value: realMetrics.totalLikes.toLocaleString(), icon: Heart },
    { title: "Comentarios", value: realMetrics.totalComments.toLocaleString(), icon: MessageCircle },
    { title: "Compartidos", value: realMetrics.totalShares.toLocaleString(), icon: Share2 },
  ]

  const upcomingPubs = useMemo(() => {
    return publications
      .filter((p) => p.status === "pendiente" || p.status === "programado")
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5)
  }, [publications])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">
          Estado de Publicaciones - {MONTHS[selectedMonth - 1]} {new Date().getFullYear()}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Metricas de Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementStats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Proximas Publicaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPubs.map((pub) => (
                <div key={pub.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{pub.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pub.date} - {pub.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${pub.status === "programado" ? "text-chart-2 border-chart-2" : "text-chart-3 border-chart-3"}`}
                    >
                      {pub.status}
                    </Badge>
                    <Badge variant="outline" className="text-chart-3 border-chart-3 text-xs">
                      {pub.format}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingPubs.length === 0 && <p className="text-center text-muted-foreground py-8">No hay publicaciones pendientes o programadas</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Rendimiento por Red Social</CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyMetrics ? (
              <div className="space-y-4">
                {realMetrics.networkEngagement.map((network) => (
                  <div key={network.network} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-foreground">{NETWORK_LABELS[network.network]}</div>
                    <div className="flex-1 bg-secondary rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${realMetrics.maxEngagement > 0 ? (network.engagement / realMetrics.maxEngagement) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">{network.engagement}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Sin datos de metricas</p>
                <p className="text-xs text-muted-foreground mt-1">Agrega metricas en cada publicacion para ver el rendimiento</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}