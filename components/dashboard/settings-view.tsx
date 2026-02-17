"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Music2,
  Link2, 
  Bell, 
  Shield, 
  Palette,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import type { ConnectionStatus } from "@/lib/social-networks"

const NETWORK_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Music2,
}

const NETWORK_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  twitter: 'bg-black',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-black',
}

const NETWORK_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
}

const SETUP_GUIDES: Record<string, string> = {
  instagram: 'https://developers.facebook.com/docs/instagram-api/getting-started',
  facebook: 'https://developers.facebook.com/docs/pages/getting-started',
  twitter: 'https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api',
  linkedin: 'https://learn.microsoft.com/en-us/linkedin/marketing/getting-started',
  tiktok: 'https://developers.tiktok.com/doc/getting-started-create-an-app/',
}

export function SettingsView() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social/status')
      const data = await response.json()
      setConnections(data.statuses || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleRefresh = async (network: string) => {
    setRefreshing(network)
    await fetchConnections()
    setRefreshing(null)
  }

  const handleRefreshAll = async () => {
    setLoading(true)
    await fetchConnections()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Conexiones de Redes Sociales
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Conecta tus cuentas de redes sociales para habilitar métricas automáticas
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshAll}
              disabled={loading}
              className="bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Verificando conexiones...</span>
            </div>
          ) : (
            <>
              {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map((network) => {
                const connection = connections.find(c => c.network === network)
                const Icon = NETWORK_ICONS[network]
                const isConnected = connection?.connected
                const isRefreshing = refreshing === network
                
                return (
                  <div 
                    key={network}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isConnected ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${NETWORK_COLORS[network]} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{NETWORK_NAMES[network]}</p>
                          {isConnected ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {isConnected ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{connection.accountName}</p>
                            {connection.followers && (
                              <span className="text-xs text-muted-foreground">
                                ({connection.followers.toLocaleString()} seguidores)
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-destructive/80 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {connection?.error || 'No conectado'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRefresh(network)}
                            disabled={isRefreshing}
                            className="text-muted-foreground"
                          >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary border-primary bg-transparent"
                          >
                            Conectado
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-muted-foreground"
                          >
                            <a href={SETUP_GUIDES[network]} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Guía
                            </a>
                          </Button>
                          <Button variant="default" size="sm">
                            Conectar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Variables de entorno requeridas
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Para conectar las redes sociales, agrega las siguientes variables en la sección "Vars" del sidebar:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-background">
                    <p className="text-primary mb-1">Meta (FB + IG):</p>
                    <p className="text-muted-foreground">FACEBOOK_APP_ID</p>
                    <p className="text-muted-foreground">FACEBOOK_APP_SECRET</p>
                    <p className="text-muted-foreground">FACEBOOK_ACCESS_TOKEN</p>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <p className="text-primary mb-1">Twitter/X:</p>
                    <p className="text-muted-foreground">TWITTER_API_KEY</p>
                    <p className="text-muted-foreground">TWITTER_API_SECRET</p>
                    <p className="text-muted-foreground">TWITTER_ACCESS_TOKEN</p>
                    <p className="text-muted-foreground">TWITTER_ACCESS_SECRET</p>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <p className="text-primary mb-1">LinkedIn:</p>
                    <p className="text-muted-foreground">LINKEDIN_CLIENT_ID</p>
                    <p className="text-muted-foreground">LINKEDIN_CLIENT_SECRET</p>
                    <p className="text-muted-foreground">LINKEDIN_ACCESS_TOKEN</p>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <p className="text-primary mb-1">TikTok:</p>
                    <p className="text-muted-foreground">TIKTOK_CLIENT_KEY</p>
                    <p className="text-muted-foreground">TIKTOK_CLIENT_SECRET</p>
                    <p className="text-muted-foreground">TIKTOK_ACCESS_TOKEN</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificaciones
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configura cómo y cuándo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Recordatorios de publicación</p>
              <p className="text-sm text-muted-foreground">Recibe alertas 30 minutos antes de publicar</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Resumen diario de métricas</p>
              <p className="text-sm text-muted-foreground">Recibe un resumen diario del rendimiento</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Alertas de engagement alto</p>
              <p className="text-sm text-muted-foreground">Notificaciones cuando una publicación supera el promedio</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Fechas especiales próximas</p>
              <p className="text-sm text-muted-foreground">Recordatorios de fechas importantes 3 días antes</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Equipo y Permisos
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Gestiona los miembros del equipo y sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Agregar miembro del equipo</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="correo@supersubsidio.gov.co" 
                className="bg-secondary border-border text-foreground"
              />
              <Button>Invitar</Button>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Miembros actuales</p>
            {['JAVIER DIAZ', 'ISABELLA CARO', 'JENNIFER QUINTERO', 'OLGA CARANTONIO'].map((name) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-foreground">{name}</span>
                </div>
                <span className="text-sm text-muted-foreground">Editor</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Preferencias de Visualización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Tema oscuro</p>
              <p className="text-sm text-muted-foreground">Usar tema oscuro en toda la aplicación</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sidebar compacto</p>
              <p className="text-sm text-muted-foreground">Mostrar el menú lateral en modo compacto</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
