"use client"

import { useState } from "react"
import { ChevronRight, ExternalLink, Instagram, Facebook, Twitter, Linkedin, Trash2, Pencil, ImageIcon, Download, Maximize2, Play, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Publication, SocialNetwork, PublicationAttachment } from "@/lib/types"

interface PublicationCalendarProps {
  publications: Publication[]
  onEdit: (publication: Publication) => void
  onDelete: (ids: string[]) => void
}

const statusColors: Record<string, string> = {
  pendiente: 'bg-chart-3/20 text-chart-3 border-chart-3',
  publicado: 'bg-chart-1/20 text-chart-1 border-chart-1',
  programado: 'bg-chart-2/20 text-chart-2 border-chart-2',
  cancelado: 'bg-destructive/20 text-destructive border-destructive',
}

const formatColors: Record<string, string> = {
  video: 'bg-chart-2/20 text-chart-2',
  imagen: 'bg-chart-1/20 text-chart-1',
  carrusel: 'bg-chart-4/20 text-chart-4',
  reel: 'bg-chart-5/20 text-chart-5',
  story: 'bg-chart-3/20 text-chart-3',
}

function getObjectiveLabel(obj: string) {
  const map: Record<string, string> = {
    educar: 'EDUCAR', branding: 'BRANDING', engagement: 'ENGAGEMENT',
    venta: 'VENTA', informar: 'INFORMAR', Educar: 'EDUCAR',
    Branding: 'BRANDING', Engagement: 'ENGAGEMENT', Venta: 'VENTA', Informar: 'INFORMAR',
  }
  return map[obj] || obj.toUpperCase()
}

function NetworkIcon({ network }: { network: SocialNetwork }) {
  switch (network) {
    case 'instagram': return <Instagram className="h-3.5 w-3.5" />
    case 'facebook': return <Facebook className="h-3.5 w-3.5" />
    case 'twitter': return <Twitter className="h-3.5 w-3.5" />
    case 'linkedin': return <Linkedin className="h-3.5 w-3.5" />
    case 'tiktok': return <span className="text-[10px] font-bold leading-none">TT</span>
    default: return null
  }
}

export function PublicationCalendar({ publications, onEdit, onDelete }: PublicationCalendarProps) {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null)
  const [previewAttachment, setPreviewAttachment] = useState<PublicationAttachment | null>(null)

  const allSelected = publications.length > 0 && selectedIds.size === publications.length
  const someSelected = selectedIds.size > 0

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(publications.map(p => p.id)))
  }

  const handleDeleteSelected = () => {
    onDelete(Array.from(selectedIds))
    setSelectedIds(new Set())
    setShowDeleteConfirm(false)
  }

  const handleSingleDelete = () => {
    if (singleDeleteId) {
      onDelete([singleDeleteId])
      setSingleDeleteId(null)
    }
  }

  const handleEditSelected = () => {
    if (selectedIds.size === 1) {
      const pub = publications.find(p => p.id === Array.from(selectedIds)[0])
      if (pub) { onEdit(pub); setSelectedIds(new Set()) }
    }
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-foreground text-base sm:text-lg">Programacion de Publicaciones</CardTitle>
            {someSelected && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {selectedIds.size} seleccionada{selectedIds.size > 1 ? 's' : ''}
                </span>
                {selectedIds.size === 1 && (
                  <Button variant="outline" size="sm" onClick={handleEditSelected} className="bg-transparent gap-1.5 h-8 text-xs">
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                )}
                <Button
                  variant="outline" size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-transparent gap-1.5 h-8 text-xs border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Desktop table (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-10 px-3">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Seleccionar todas" />
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs">Fecha</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Tema</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Descripcion</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Obj.</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Redes</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Hora</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Formato</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Responsables</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-xs w-28">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((pub) => {
                  const isSelected = selectedIds.has(pub.id)
                  return (
                    <TableRow key={pub.id} className={`border-border transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-secondary/50'}`}>
                      <TableCell className="px-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(pub.id)} />
                      </TableCell>
                      <TableCell className="text-foreground text-xs whitespace-nowrap">
                        {new Date(pub.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-foreground text-xs max-w-[120px] truncate">{pub.theme}</TableCell>
                      <TableCell className="text-foreground text-xs max-w-[180px] truncate">{pub.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{getObjectiveLabel(pub.objective)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {pub.networks.slice(0, 3).map((network) => (
                            <div key={network} className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                              <NetworkIcon network={network} />
                            </div>
                          ))}
                          {pub.networks.length > 3 && (
                            <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[9px] text-muted-foreground">
                              +{pub.networks.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{pub.time}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${formatColors[pub.format.toLowerCase()] || 'bg-secondary text-foreground'}`} variant="secondary">
                          {pub.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 max-w-[120px]">
                          {pub.responsibles.slice(0, 2).map((p) => (
                            <span key={p} className="text-[10px] text-muted-foreground truncate">{p}</span>
                          ))}
                          {pub.responsibles.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{pub.responsibles.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusColors[pub.status]}`}>
                          {pub.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(pub)} className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setSingleDeleteId(pub.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedPublication(pub)} className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Ver detalle">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards (hidden on desktop) */}
          <div className="md:hidden space-y-3 px-3">
            {/* Select all for mobile */}
            <div className="flex items-center gap-2 py-2">
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Seleccionar todas" />
              <span className="text-xs text-muted-foreground">Seleccionar todas</span>
            </div>

            {publications.map((pub) => {
              const isSelected = selectedIds.has(pub.id)
              return (
                <div
                  key={pub.id}
                  className={`rounded-lg border border-border p-3 space-y-2.5 transition-colors ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}
                >
                  {/* Top: checkbox + date + status */}
                  <div className="flex items-start gap-2">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(pub.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(pub.date).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })} - {pub.time}
                        </span>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[pub.status]}`}>
                          {pub.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1 truncate">{pub.theme}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{pub.description}</p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-1.5 pl-7">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getObjectiveLabel(pub.objective)}</Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${formatColors[pub.format.toLowerCase()] || 'bg-secondary text-foreground'}`} variant="secondary">
                      {pub.format.toUpperCase()}
                    </Badge>
                    <div className="flex gap-0.5 ml-1">
                      {pub.networks.slice(0, 4).map((network) => (
                        <div key={network} className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                          <NetworkIcon network={network} />
                        </div>
                      ))}
                      {pub.networks.length > 4 && (
                        <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[9px] text-muted-foreground">
                          +{pub.networks.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPublication(pub)} className="h-7 text-xs text-muted-foreground gap-1">
                      Ver detalle
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(pub)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSingleDeleteId(pub.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {publications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay publicaciones programadas para este mes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
        <DialogContent className="bg-card border-border max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalle de Publicacion</DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm text-foreground font-medium">
                    {new Date(selectedPublication.date).toLocaleDateString('es-CO', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="text-sm text-foreground font-medium">{selectedPublication.time}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tema</p>
                <p className="text-sm text-foreground font-medium">{selectedPublication.theme}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Descripcion</p>
                <p className="text-sm text-foreground">{selectedPublication.description}</p>
              </div>

              {selectedPublication.caption && (
                <div>
                  <p className="text-xs text-muted-foreground">Caption</p>
                  <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg whitespace-pre-wrap break-words">
                    {selectedPublication.caption}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPublication.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-primary text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Responsables</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPublication.responsibles.map((person) => (
                    <Badge key={person} variant="outline" className="text-xs">{person}</Badge>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {selectedPublication.attachments && selectedPublication.attachments.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Adjuntos ({selectedPublication.attachments.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPublication.attachments.map(att => (
                      <div key={att.id} className="rounded-lg border border-border overflow-hidden bg-secondary/30">
                        <div className="aspect-video relative bg-background/50">
                          {att.type === 'video' ? (
                            <>
                              <video src={att.previewUrl} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(att)}
                                className="absolute inset-0 flex items-center justify-center bg-background/30 hover:bg-background/50 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                  <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                                </div>
                              </button>
                            </>
                          ) : (
                            <button type="button" onClick={() => setPreviewAttachment(att)} className="w-full h-full">
                              <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                            </button>
                          )}
                        </div>
                        <div className="p-2 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate font-medium">{att.name}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0" title="Ver en grande" onClick={() => setPreviewAttachment(att)}>
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                          <a href={att.previewUrl} download={att.name} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0" title="Descargar">
                              <Download className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPublication.links.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Links</p>
                  <div className="space-y-1.5">
                    {selectedPublication.links.map((link) => (
                      <a key={link.network} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                        <NetworkIcon network={link.network} />
                        <span className="capitalize">{link.network}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedPublication.metrics && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Metricas</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Me gusta', value: selectedPublication.metrics.likes },
                      { label: 'Comentarios', value: selectedPublication.metrics.comments },
                      { label: 'Compartidos', value: selectedPublication.metrics.shares },
                      { label: 'Alcance', value: selectedPublication.metrics.reach.toLocaleString() },
                      { label: 'Impresiones', value: selectedPublication.metrics.impressions.toLocaleString() },
                      { label: 'Engagement', value: `${selectedPublication.metrics.engagement}%`, highlight: true },
                    ].map(item => (
                      <div key={item.label} className="bg-secondary/50 p-2.5 rounded-lg text-center">
                        <p className={`text-lg font-bold ${item.highlight ? 'text-primary' : 'text-foreground'}`}>{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => { setSelectedPublication(null); onEdit(selectedPublication) }} className="gap-2" size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Editar publicacion
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar publicaciones</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Estas a punto de eliminar {selectedIds.size} publicacion{selectedIds.size > 1 ? 'es' : ''}. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen attachment preview */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-4xl max-h-[95vh] mx-2">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between gap-2">
              <span className="truncate text-sm">{previewAttachment?.name}</span>
              {previewAttachment && (
                <a href={previewAttachment.previewUrl} download={previewAttachment.name} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="bg-transparent gap-1.5 shrink-0 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Descargar</span>
                  </Button>
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewAttachment && (
            <div className="flex items-center justify-center overflow-auto">
              {previewAttachment.type === 'video' ? (
                <video src={previewAttachment.previewUrl} controls autoPlay className="max-w-full max-h-[78vh] rounded-lg" />
              ) : (
                <img src={previewAttachment.previewUrl} alt={previewAttachment.name} className="max-w-full max-h-[78vh] rounded-lg object-contain" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single delete confirm */}
      <AlertDialog open={!!singleDeleteId} onOpenChange={(open) => { if (!open) setSingleDeleteId(null) }}>
        <AlertDialogContent className="bg-card border-border mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar publicacion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {(() => {
                const pub = publications.find(p => p.id === singleDeleteId)
                return pub
                  ? `Vas a eliminar "${pub.description}" del ${new Date(pub.date).toLocaleDateString('es-CO')}. Esta accion no se puede deshacer.`
                  : 'Esta accion no se puede deshacer.'
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSingleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
