"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { IMPORTANT_DATES, MONTHS } from "@/lib/data"

interface ImportantDatesProps {
  selectedMonth: number
}

export function ImportantDates({ selectedMonth }: ImportantDatesProps) {
  const monthDates = IMPORTANT_DATES.filter(d => d.month === selectedMonth)
  
  const allDatesByMonth = MONTHS.map((month, index) => ({
    month,
    dates: IMPORTANT_DATES.filter(d => d.month === index + 1)
  })).filter(m => m.dates.length > 0)

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Fechas Especiales - {MONTHS[selectedMonth - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthDates.length > 0 ? (
            <div className="grid gap-3">
              {monthDates.map((date) => (
                <div 
                  key={date.id} 
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {date.date.split('/')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {MONTHS[selectedMonth - 1].slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{date.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {date.date}/{new Date().getFullYear()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    Especial
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay fechas especiales registradas para este mes
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Calendario Anual de Fechas Especiales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allDatesByMonth.map(({ month, dates }) => (
              <div key={month}>
                <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
                  {month}
                </h4>
                <div className="grid gap-2">
                  {dates.map((date) => (
                    <div 
                      key={date.id}
                      className="flex items-center gap-3 p-2 rounded bg-secondary/30 text-sm"
                    >
                      <span className="w-12 text-muted-foreground font-mono">
                        {date.date}
                      </span>
                      <span className="text-foreground">{date.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
