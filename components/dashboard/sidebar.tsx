"use client"

import { Calendar, LayoutGrid, BarChart3, CalendarDays, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const menuItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutGrid },
  { id: 'calendar', label: 'Programación', icon: Calendar },
  { id: 'dates', label: 'Fechas Especiales', icon: CalendarDays },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }: SidebarProps) {
  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SS</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-sidebar-foreground">Supersubsidio</h1>
              <p className="text-xs text-muted-foreground">Redes Sociales</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">SS</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-foreground",
              activeTab === item.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground"
          onClick={() => onCollapse(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
