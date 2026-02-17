// Configuración de redes sociales y sus APIs

export type SocialNetwork = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'

export interface NetworkConfig {
  id: SocialNetwork
  name: string
  color: string
  icon: string
  requiredEnvVars: string[]
  apiBaseUrl: string
  scopes: string[]
}

export const NETWORK_CONFIGS: Record<SocialNetwork, NetworkConfig> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
    requiredEnvVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_ACCESS_TOKEN'],
    apiBaseUrl: 'https://graph.facebook.com/v18.0',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'read_insights'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
    requiredEnvVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_ACCESS_TOKEN'],
    apiBaseUrl: 'https://graph.facebook.com/v18.0',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    color: '#1DA1F2',
    icon: 'twitter',
    requiredEnvVars: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    apiBaseUrl: 'https://api.twitter.com/2',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: 'linkedin',
    requiredEnvVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_ACCESS_TOKEN'],
    apiBaseUrl: 'https://api.linkedin.com/v2',
    scopes: ['r_liteprofile', 'r_organization_social', 'w_organization_social', 'rw_organization_admin'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    icon: 'music2',
    requiredEnvVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_ACCESS_TOKEN'],
    apiBaseUrl: 'https://open.tiktokapis.com/v2',
    scopes: ['user.info.basic', 'video.list', 'video.publish'],
  },
}

export interface ConnectionStatus {
  network: SocialNetwork
  connected: boolean
  accountName?: string
  accountId?: string
  profileImage?: string
  followers?: number
  lastSync?: string
  error?: string
}

export interface NetworkMetrics {
  network: SocialNetwork
  period: string
  reach: number
  impressions: number
  engagement: number
  engagementRate: number
  likes: number
  comments: number
  shares: number
  saves?: number
  followers: number
  followerGrowth: number
  posts: number
  topPost?: {
    id: string
    content: string
    engagement: number
    reach: number
  }
}

// Verificar si las credenciales están configuradas
export function checkCredentials(network: SocialNetwork): { configured: boolean; missing: string[] } {
  const config = NETWORK_CONFIGS[network]
  const missing: string[] = []
  
  for (const envVar of config.requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  return {
    configured: missing.length === 0,
    missing,
  }
}

// Datos de prueba para cuando no hay credenciales
export function getMockMetrics(network: SocialNetwork, month: string): NetworkMetrics {
  const baseMetrics: Record<SocialNetwork, Omit<NetworkMetrics, 'network' | 'period'>> = {
    instagram: {
      reach: 52000,
      impressions: 78000,
      engagement: 4850,
      engagementRate: 5.8,
      likes: 3800,
      comments: 520,
      shares: 340,
      saves: 190,
      followers: 12500,
      followerGrowth: 320,
      posts: 28,
    },
    facebook: {
      reach: 42000,
      impressions: 65000,
      engagement: 3300,
      engagementRate: 4.5,
      likes: 2400,
      comments: 380,
      shares: 520,
      followers: 8900,
      followerGrowth: 180,
      posts: 24,
    },
    twitter: {
      reach: 32000,
      impressions: 48000,
      engagement: 3190,
      engagementRate: 4.2,
      likes: 2100,
      comments: 340,
      shares: 750,
      followers: 5600,
      followerGrowth: 95,
      posts: 45,
    },
    linkedin: {
      reach: 25000,
      impressions: 38000,
      engagement: 2000,
      engagementRate: 3.6,
      likes: 1400,
      comments: 220,
      shares: 380,
      followers: 4200,
      followerGrowth: 120,
      posts: 18,
    },
    tiktok: {
      reach: 78000,
      impressions: 125000,
      engagement: 8600,
      engagementRate: 7.4,
      likes: 6100,
      comments: 1050,
      shares: 1450,
      followers: 15800,
      followerGrowth: 890,
      posts: 22,
    },
  }

  // Agregar variación aleatoria basada en el mes
  const monthVariation = month.charCodeAt(0) % 10 / 100
  const metrics = baseMetrics[network]
  
  return {
    network,
    period: month,
    reach: Math.round(metrics.reach * (1 + monthVariation)),
    impressions: Math.round(metrics.impressions * (1 + monthVariation)),
    engagement: Math.round(metrics.engagement * (1 + monthVariation)),
    engagementRate: Number((metrics.engagementRate * (1 + monthVariation / 2)).toFixed(1)),
    likes: Math.round(metrics.likes * (1 + monthVariation)),
    comments: Math.round(metrics.comments * (1 + monthVariation)),
    shares: Math.round(metrics.shares * (1 + monthVariation)),
    saves: metrics.saves ? Math.round(metrics.saves * (1 + monthVariation)) : undefined,
    followers: Math.round(metrics.followers * (1 + monthVariation)),
    followerGrowth: Math.round(metrics.followerGrowth * (1 + monthVariation)),
    posts: metrics.posts,
  }
}

export function getMockConnectionStatus(network: SocialNetwork): ConnectionStatus {
  const config = NETWORK_CONFIGS[network]
  const { configured } = checkCredentials(network)
  
  if (!configured) {
    return {
      network,
      connected: false,
      error: 'Credenciales no configuradas',
    }
  }
  
  // Simular conexión exitosa si hay credenciales
  return {
    network,
    connected: true,
    accountName: `Supersubsidio ${config.name}`,
    accountId: `super_${network}_123`,
    followers: Math.floor(Math.random() * 10000) + 5000,
    lastSync: new Date().toISOString(),
  }
}
