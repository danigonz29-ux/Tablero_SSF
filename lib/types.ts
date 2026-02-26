// lib/types.ts

export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "twitter" | "linkedin"

export type PublicationStatus = "pendiente" | "publicado" | "programado" | "cancelado"

// Permite formatos personalizados sin perder autocompletado de los básicos
export type ContentFormat = "video" | "imagen" | "carrusel" | "reel" | "story" | (string & {})

// Permite objetivos personalizados sin perder autocompletado de los básicos
export type ContentObjective = "educar" | "branding" | "engagement" | "venta" | "informar" | (string & {})

export interface PublicationAttachment {
  id: string
  name: string
  type: "image" | "video" | "gif" | "banner" | "other"
  url: string
  previewUrl: string
  size: number
}

/**
 * Métricas por red para una publicación específica.
 * Nota: Mantener todo en number evita tener que parsear strings al sumar.
 */
export type NetworkMetric = {
  network: SocialNetwork
  reach: number
  likes: number
  comments: number
  shares: number
  views: number
}

export interface PublicationMetrics {
  likes: number
  comments: number
  shares: number
  reach: number
  impressions: number
  engagement: number
}

/**
 * Link por red social.
 * Esto evita repetir el shape en varios lados.
 */
export type PublicationLink = {
  network: SocialNetwork
  url: string
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

  // ✅ Tipado consistente + reusable
  links: PublicationLink[]

  /**
   * Métricas generales (agregado) - opcional
   */
  metrics?: PublicationMetrics

  /**
   * Archivos adjuntos - opcional
   */
  attachments?: PublicationAttachment[]

  /**
   * ✅ IMPORTANTÍSIMO: siempre que sea posible, guarda esto como [] en el origen.
   * En runtime pueden venir datos sucios (null / {}), por eso en el código
   * SIEMPRE se valida con Array.isArray antes de iterar.
   */
  networkMetrics?: NetworkMetric[]
}

// Labels por red social
export const NETWORK_METRICS_CONFIG: Record<
  SocialNetwork,
  { reachLabel: string; showViews: "always" | "video" }
> = {
  facebook: { reachLabel: "Alcance de la publicacion", showViews: "video" },
  instagram: { reachLabel: "Alcance de la publicacion", showViews: "video" },
  twitter: { reachLabel: "Impresiones de la publicacion", showViews: "video" },
  tiktok: { reachLabel: "Alcance de la publicacion", showViews: "always" },
  linkedin: { reachLabel: "Impresiones de la publicacion", showViews: "video" },
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