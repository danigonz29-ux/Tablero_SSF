"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// Select components no longer used - using custom AddableSelect dropdown
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileImage, FileVideo, ImageIcon, Film, File, Eye, Plus, Instagram, Facebook, Twitter, Linkedin, Music2, BarChart3, Link2 } from "lucide-react"
import type { ContentFormat, ContentObjective, SocialNetwork, Publication, PublicationAttachment, NetworkPublicationMetrics } from "@/lib/types"
import { NETWORK_METRICS_CONFIG } from "@/lib/types"

interface NewPublicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: PublicationFormData) => void
  editingPublication?: Publication | null
}

export interface PublicationFormData {
  date: string
  time: string
  theme: string
  description: string
  objective: string
  networks: SocialNetwork[]
  hashtags: string
  caption: string
  format: string
  responsibles: string[]
  attachments: PublicationAttachment[]
  networkMetrics: NetworkPublicationMetrics[]
}

const NETWORKS: { id: SocialNetwork; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'linkedin', label: 'LinkedIn' },
]

const DEFAULT_THEMES = [
  'APRENDE CON LA SUPER',
  'LA SUPER TE RESPONDE',
  'RESUMEN: ASI VA LA SUPER',
  'NOTICIAS SUPER',
  'TIPS SUPER',
]

const DEFAULT_OBJECTIVES = [
  'Educar',
  'Branding',
  'Engagement',
  'Venta',
  'Informar',
]

const DEFAULT_FORMATS = [
  'Video',
  'Imagen',
  'Carrusel',
  'Reel',
  'Story',
]

const DEFAULT_HASHTAGS = [
  '#Supersubsidio',
  '#SupervisarEsCuidar',
  '#SubsidioFamiliar',
  '#CuotaMonetaria',
  '#SubsidioDeVivienda',
  '#CajadeCompensacion',
  '#BienestarLaboral',
  '#TrabajadoresColombia',
]

const RESPONSIBLES = [
  'Javier Diaz',
  'Isabella Caro',
  'Jennifer Quintero',
]

const ACCEPTED_TYPES: Record<string, PublicationAttachment['type']> = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
}

function getFileIcon(type: PublicationAttachment['type']) {
  switch (type) {
    case 'image': return <FileImage className="h-5 w-5 text-chart-1" />
    case 'video': return <FileVideo className="h-5 w-5 text-chart-2" />
    case 'gif': return <Film className="h-5 w-5 text-chart-3" />
    case 'banner': return <ImageIcon className="h-5 w-5 text-chart-4" />
    default: return <File className="h-5 w-5 text-muted-foreground" />
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const NETWORK_ICONS: Record<SocialNetwork, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Music2,
}

const NETWORK_COLORS: Record<SocialNetwork, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#000000',
}

const DEFAULT_FORM: PublicationFormData = {
  date: '',
  time: '10:00',
  theme: 'APRENDE CON LA SUPER',
  description: '',
  objective: 'Educar',
  networks: ['instagram', 'facebook'],
  hashtags: '#Supersubsidio #SupervisarEsCuidar',
  caption: '',
  format: 'Video',
  responsibles: [],
  attachments: [],
  networkMetrics: [],
}

// --- Custom dropdown with inline "+ Nuevo" inside the list ---
function AddableSelect({
  label,
  value,
  options,
  onChange,
  onAddOption,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  onAddOption: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [adding])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setAdding(false)
        setNewValue('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAdd = () => {
    const trimmed = newValue.trim()
    if (trimmed && !options.some(o => o.toLowerCase() === trimmed.toLowerCase())) {
      onAddOption(trimmed)
      onChange(trimmed)
    } else if (trimmed) {
      const existing = options.find(o => o.toLowerCase() === trimmed.toLowerCase())
      if (existing) onChange(existing)
    }
    setNewValue('')
    setAdding(false)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value || `Seleccionar ${label.toLowerCase()}...`}
          </span>
          <svg className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="max-h-56 overflow-y-auto py-1">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setIsOpen(false); setAdding(false) }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-secondary transition-colors ${
                    value === opt ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  <span>{opt}</span>
                  {value === opt && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="h-px bg-border" />

            {/* + Nuevo inline */}
            {adding ? (
              <div className="p-2 flex gap-2 bg-secondary/30">
                <Input
                  ref={inputRef}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
                    if (e.key === 'Escape') { setAdding(false); setNewValue('') }
                  }}
                  placeholder={`Nuevo ${label.toLowerCase()}...`}
                  className="bg-secondary border-border text-foreground h-8 text-sm"
                />
                <Button type="button" size="sm" onClick={handleAdd} disabled={!newValue.trim()} className="h-8 px-3 text-xs">
                  OK
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-primary hover:bg-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo {label.toLowerCase()}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Hashtag Carousel Selector ---
function HashtagSelector({
  selected,
  availableTags,
  onChange,
  onAddTag,
}: {
  selected: string[]
  availableTags: string[]
  onChange: (tags: string[]) => void
  onAddTag: (tag: string) => void
}) {
  const [newTag, setNewTag] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [adding])

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  const handleAddNew = () => {
    let tag = newTag.trim()
    if (!tag) return
    if (!tag.startsWith('#')) tag = `#${tag}`
    if (!availableTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      onAddTag(tag)
    }
    if (!selected.includes(tag)) {
      onChange([...selected, tag])
    }
    setNewTag('')
    setAdding(false)
  }

  return (
    <div className="space-y-3 min-w-0">
      <Label className="text-foreground">Hashtags</Label>

      {/* Tags that wrap on mobile, scroll on desktop */}
      <div className="flex flex-wrap gap-2 rounded-lg bg-secondary/50 p-3">
        {availableTags.map(tag => {
          const isSelected = selected.includes(tag)
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all select-none px-2.5 py-1 text-xs sm:text-sm ${
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {isSelected && (
                <svg className="h-3 w-3 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </Badge>
          )
        })}

        {/* + Nuevo inline */}
        {adding ? (
          <div className="flex gap-1.5 items-center w-full sm:w-auto mt-1 sm:mt-0">
            <Input
              ref={inputRef}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddNew() }
                if (e.key === 'Escape') { setAdding(false); setNewTag('') }
              }}
              placeholder="#NuevoHashtag"
              className="bg-secondary border-border text-foreground h-7 flex-1 sm:w-36 sm:flex-none text-xs"
            />
            <Button type="button" size="sm" onClick={handleAddNew} disabled={!newTag.trim()} className="h-7 px-2 text-xs">
              OK
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setNewTag('') }} className="h-7 w-7 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer px-2.5 py-1 text-xs sm:text-sm border-dashed border-primary text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nuevo
          </Badge>
        )}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted-foreground mr-1">{selected.length} seleccionados:</span>
          {selected.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-primary text-xs">
              {tag}
              <button type="button" onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Main Modal ---
export function NewPublicationModal({ open, onOpenChange, onSave, editingPublication }: NewPublicationModalProps) {
  const [formData, setFormData] = useState<PublicationFormData>(DEFAULT_FORM)
  const [previewAttachment, setPreviewAttachment] = useState<PublicationAttachment | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamic option lists
  const [themes, setThemes] = useState<string[]>(DEFAULT_THEMES)
  const [objectives, setObjectives] = useState<string[]>(DEFAULT_OBJECTIVES)
  const [formats, setFormats] = useState<string[]>(DEFAULT_FORMATS)
  const [hashtagOptions, setHashtagOptions] = useState<string[]>(DEFAULT_HASHTAGS)

  // Selected hashtags as array
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['#Supersubsidio', '#SupervisarEsCuidar'])

  useEffect(() => {
    if (editingPublication) {
      setFormData({
        date: editingPublication.date,
        time: editingPublication.time,
        theme: editingPublication.theme,
        description: editingPublication.description,
        objective: editingPublication.objective,
        networks: editingPublication.networks,
        hashtags: editingPublication.hashtags.join(' '),
        caption: editingPublication.caption,
        format: editingPublication.format,
        responsibles: editingPublication.responsibles,
        attachments: editingPublication.attachments || [],
        networkMetrics: editingPublication.networkMetrics || [],
      })
      setSelectedHashtags(editingPublication.hashtags || [])
      // Ensure editing values exist in option lists
      if (editingPublication.theme && !themes.includes(editingPublication.theme)) {
        setThemes(prev => [...prev, editingPublication.theme])
      }
    } else {
      setFormData(DEFAULT_FORM)
      setSelectedHashtags(['#Supersubsidio', '#SupervisarEsCuidar'])
    }
  }, [editingPublication, open])

  const handleNetworkToggle = (network: SocialNetwork) => {
    setFormData(prev => ({
      ...prev,
      networks: prev.networks.includes(network)
        ? prev.networks.filter(n => n !== network)
        : [...prev.networks, network]
    }))
  }

  const handleResponsibleToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      responsibles: prev.responsibles.includes(name)
        ? prev.responsibles.filter(r => r !== name)
        : [...prev.responsibles, name]
    }))
  }

  // --- Network Metrics helpers ---
  const isVideoFormat = ['video', 'reel'].includes(formData.format.toLowerCase())

  const getNetworkMetric = (network: SocialNetwork): NetworkPublicationMetrics => {
    return formData.networkMetrics.find(m => m.network === network) || {
      network,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      url: '',
    }
  }

  const updateNetworkMetric = (network: SocialNetwork, field: keyof Omit<NetworkPublicationMetrics, 'network'>, value: number | string) => {
    setFormData(prev => {
      const existing = prev.networkMetrics.find(m => m.network === network)
      if (existing) {
        return {
          ...prev,
          networkMetrics: prev.networkMetrics.map(m => 
            m.network === network ? { ...m, [field]: value } : m
          ),
        }
      }
      return {
        ...prev,
        networkMetrics: [
          ...prev.networkMetrics,
          { network, reach: 0, likes: 0, comments: 0, shares: 0, views: 0, url: '', [field]: value },
        ],
      }
    })
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newAttachments: PublicationAttachment[] = []
    Array.from(files).forEach(file => {
      const fileType = ACCEPTED_TYPES[file.type] || 'other'
      const url = URL.createObjectURL(file)
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        type: fileType,
        url,
        previewUrl: url,
        size: file.size,
      })
    })
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id),
    }))
  }

  const handleSubmit = () => {
    // Only include metrics for selected networks
    const filteredMetrics = formData.networkMetrics.filter(m => formData.networks.includes(m.network))
    onSave({
      ...formData,
      hashtags: selectedHashtags.join(' '),
      networkMetrics: filteredMetrics,
    })
    onOpenChange(false)
    setFormData(DEFAULT_FORM)
    setSelectedHashtags(['#Supersubsidio', '#SupervisarEsCuidar'])
  }

  const isEditing = !!editingPublication

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border w-[calc(100vw-1rem)] sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto overflow-x-hidden mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {isEditing ? 'Editar Publicacion' : 'Nueva Publicacion'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>

            {/* Tema - con + para agregar nuevos */}
            <AddableSelect
              label="Tema"
              value={formData.theme}
              options={themes}
              onChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
              onAddOption={(value) => setThemes(prev => [...prev, value])}
            />

            {/* Descripcion */}
            <div className="space-y-2">
              <Label className="text-foreground">Descripcion del contenido</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripcion breve del contenido..."
                className="bg-secondary border-border text-foreground"
              />
            </div>

            {/* Objetivo y Formato - ambos con + */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AddableSelect
                label="Objetivo"
                value={formData.objective}
                options={objectives}
                onChange={(value) => setFormData(prev => ({ ...prev, objective: value }))}
                onAddOption={(value) => setObjectives(prev => [...prev, value])}
              />
              <AddableSelect
                label="Formato"
                value={formData.format}
                options={formats}
                onChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
                onAddOption={(value) => setFormats(prev => [...prev, value])}
              />
            </div>

            {/* Redes Sociales */}
            <div className="space-y-2">
              <Label className="text-foreground">Redes Sociales</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3 p-3 rounded-lg bg-secondary/50">
                {NETWORKS.map(network => (
                  <div key={network.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`net-${network.id}`}
                      checked={formData.networks.includes(network.id)}
                      onCheckedChange={() => handleNetworkToggle(network.id)}
                    />
                    <Label htmlFor={`net-${network.id}`} className="text-foreground cursor-pointer text-sm">
                      {network.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label className="text-foreground">Caption / Mensaje</Label>
              <Textarea
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Escribe el mensaje de la publicacion..."
                className="bg-secondary border-border text-foreground min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            {/* Hashtags - selector con badges */}
            <HashtagSelector
              selected={selectedHashtags}
              availableTags={hashtagOptions}
              onChange={setSelectedHashtags}
              onAddTag={(tag) => setHashtagOptions(prev => [...prev, tag])}
            />

            {/* Responsables */}
            <div className="space-y-2">
              <Label className="text-foreground">Responsables</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-3 p-3 rounded-lg bg-secondary/50">
                {RESPONSIBLES.map(name => (
                  <div key={name} className="flex items-center gap-2">
                    <Checkbox
                      id={`resp-${name}`}
                      checked={formData.responsibles.includes(name)}
                      onCheckedChange={() => handleResponsibleToggle(name)}
                    />
                    <Label htmlFor={`resp-${name}`} className="text-foreground cursor-pointer text-sm">
                      {name}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.responsibles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.responsibles.map(name => (
                    <Badge key={name} variant="secondary" className="flex items-center gap-1">
                      {name}
                      <button type="button" onClick={() => handleResponsibleToggle(name)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Metricas por Red Social */}
            {formData.networks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <Label className="text-foreground font-semibold">Metricas por Red Social</Label>
                  <span className="text-xs text-muted-foreground">(opcional)</span>
                </div>
                <div className="space-y-3">
                  {formData.networks.map(networkId => {
                    const config = NETWORK_METRICS_CONFIG[networkId]
                    const metrics = getNetworkMetric(networkId)
                    const networkLabel = NETWORKS.find(n => n.id === networkId)?.label || networkId
                    const Icon = NETWORK_ICONS[networkId]
                    const color = NETWORK_COLORS[networkId]
                    const showViews = config.showViews === 'always' || (config.showViews === 'video' && isVideoFormat)

                    return (
                      <div key={networkId} className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
                        {/* Network header */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="h-4 w-4" style={{ color }} />
                          <span className="text-sm font-medium text-foreground">{networkLabel}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{config.reachLabel}</span>
                        </div>

                        {/* Metric fields */}
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {/* Reach / Impressions */}
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{networkId === 'twitter' || networkId === 'linkedin' ? 'Impresiones' : 'Alcance'}</label>
                            <Input
                              type="number"
                              min="0"
                              value={metrics.reach || ''}
                              onChange={(e) => updateNetworkMetric(networkId, 'reach', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-secondary border-border text-foreground h-8 text-sm"
                            />
                          </div>

                          {/* Likes */}
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Me gusta</label>
                            <Input
                              type="number"
                              min="0"
                              value={metrics.likes || ''}
                              onChange={(e) => updateNetworkMetric(networkId, 'likes', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-secondary border-border text-foreground h-8 text-sm"
                            />
                          </div>

                          {/* Comments */}
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Comentarios</label>
                            <Input
                              type="number"
                              min="0"
                              value={metrics.comments || ''}
                              onChange={(e) => updateNetworkMetric(networkId, 'comments', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-secondary border-border text-foreground h-8 text-sm"
                            />
                          </div>

                          {/* Shares */}
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Compartidos</label>
                            <Input
                              type="number"
                              min="0"
                              value={metrics.shares || ''}
                              onChange={(e) => updateNetworkMetric(networkId, 'shares', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-secondary border-border text-foreground h-8 text-sm"
                            />
                          </div>

                          {/* Views (conditional) */}
                          {showViews && (
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Reproducciones</label>
                              <Input
                                type="number"
                                min="0"
                                value={metrics.views || ''}
                                onChange={(e) => updateNetworkMetric(networkId, 'views', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="bg-secondary border-border text-foreground h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* URL de la publicacion */}
                        <div className="px-3 pb-3 space-y-1">
                          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Link2 className="h-3 w-3" />
                            URL de la publicacion
                          </label>
                          <Input
                            type="url"
                            value={metrics.url || ''}
                            onChange={(e) => updateNetworkMetric(networkId, 'url', e.target.value)}
                            placeholder={`https://${networkId === 'twitter' ? 'x.com' : networkId + '.com'}/...`}
                            className="bg-secondary border-border text-foreground h-8 text-sm"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Adjuntos */}
            <div className="space-y-3">
              <Label className="text-foreground">Adjuntos (Imagenes, Videos, Banners, GIFs)</Label>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground hover:bg-secondary/30'
                }`}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-foreground font-medium">
                  Arrastra archivos aqui o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, GIF, MP4, WEBM - Max 50MB por archivo
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.gif"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{formData.attachments.length} archivo(s) adjunto(s)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.attachments.map(att => (
                      <div key={att.id} className="relative group rounded-lg border border-border bg-secondary/30 overflow-hidden">
                        {att.type === 'image' || att.type === 'gif' || att.type === 'banner' ? (
                          <div className="aspect-video relative bg-background/50">
                            <img 
                              src={att.previewUrl} 
                              alt={att.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : att.type === 'video' ? (
                          <div className="aspect-video relative bg-background/50">
                            <video 
                              src={att.previewUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                                <Film className="h-5 w-5 text-foreground" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-background/50">
                            {getFileIcon(att.type)}
                          </div>
                        )}
                        <div className="p-2 flex items-center gap-2">
                          {getFileIcon(att.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">{att.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(att.size)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); setPreviewAttachment(att) }}
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); removeAttachment(att.id) }}
                            >
                              <X className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              {isEditing ? 'Guardar Cambios' : 'Guardar Publicacion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview attachment modal */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-4xl mx-2">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {previewAttachment && getFileIcon(previewAttachment.type)}
              {previewAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          {previewAttachment && (
            <div className="flex items-center justify-center">
              {previewAttachment.type === 'video' ? (
                <video
                  src={previewAttachment.previewUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg"
                />
              ) : (
                <img
                  src={previewAttachment.previewUrl}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[70vh] rounded-lg object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
