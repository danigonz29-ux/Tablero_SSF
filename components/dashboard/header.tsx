"use client"

import { Bell, Search, Plus, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MONTHS } from "@/lib/data"

interface HeaderProps {
  title: string
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onNewPublication?: () => void
  onMenuToggle?: () => void
  notificationCount?: number
  onBellClick?: () => void
}

export function Header({ 
  title, 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange,
  onNewPublication,
  onMenuToggle,
  notificationCount = 0,
  onBellClick,
}: HeaderProps) {
  const years = [2025, 2026, 2027]

  return (
    <header className="border-b border-border bg-card px-3 sm:px-6 py-3 flex flex-col gap-3">
      {/* Top row: menu + title + actions */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-base sm:text-xl font-semibold text-foreground truncate flex-1 min-w-0">{title}</h2>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground relative"
            onClick={onBellClick}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center min-w-[18px]">
                {notificationCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom row: filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            className="w-full pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
          />
        </div>

        <Select value={selectedMonth.toString()} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="w-28 sm:w-36 bg-secondary border-border text-foreground h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-20 sm:w-24 bg-secondary border-border text-foreground h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onNewPublication && (
          <Button onClick={onNewPublication} size="sm" className="gap-1.5 h-9 ml-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Publicacion</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        )}
      </div>
    </header>
  )
}
