export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'linkedin'

export type PublicationStatus = 'pendiente' | 'publicado' | 'programado' | 'cancelado'

export type ContentFormat = 'video' | 'imagen' | 'carrusel' | 'reel' | 'story' | (string & {})

export type ContentObjective = 'educar' | 'branding' | 'engagement' | 'venta' | 'informar' | (string & {})

export interface PublicationAttachment {
  id: string
  name: string
  type: 'image' | 'video' | 'gif' | 'banner' | 'other'
  url: string
  previewUrl: string
  size: number
}

export interface Publication {
  id: string
  date: string
  dayOfWeek: string
  theme: string
  description: string
  objective: ContentObjective
  networks: SocialNetwork[]
  time: string
  hashtags: string[]
  caption: string
  format: ContentFormat
  responsibles: string[]
  observations: string
  status: PublicationStatus
  links: { network: SocialNetwork; url: string }[]
  metrics?: PublicationMetrics
  attachments?: PublicationAttachment[]
  networkMetrics?: NetworkPublicationMetrics[]
}

export interface NetworkPublicationMetrics {
  network: SocialNetwork
  reach: number       // Alcance (FB, IG, TikTok) o Impresiones (X, LinkedIn)
  likes: number       // Me gusta
  comments: number    // Comentarios
  shares: number      // Compartidos
  views: number       // Reproducciones (video)
  url: string         // URL de la publicacion en la red social
}

export interface PublicationMetrics {
  likes: number
  comments: number
  shares: number
  reach: number
  impressions: number
  engagement: number
}

// Labels por red social
export const NETWORK_METRICS_CONFIG: Record<SocialNetwork, { reachLabel: string; showViews: 'always' | 'video' }> = {
  facebook: { reachLabel: 'Alcance de la publicacion', showViews: 'video' },
  instagram: { reachLabel: 'Alcance de la publicacion', showViews: 'video' },
  twitter: { reachLabel: 'Impresiones de la publicacion', showViews: 'video' },
  tiktok: { reachLabel: 'Alcance de la publicacion', showViews: 'always' },
  linkedin: { reachLabel: 'Impresiones de la publicacion', showViews: 'video' },
}

export interface ImportantDate {
  id: string
  date: string
  title: string
  month: number
}

export interface MonthlyMetrics {
  month: string
  totalPublications: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalReach: number
  avgEngagement: number
  byNetwork: {
    network: SocialNetwork
    publications: number
    engagement: number
  }[]
}
