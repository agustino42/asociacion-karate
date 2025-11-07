"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

type Combate = {
  id: string
  categoria: string
  fecha_combate: string
  atleta1: {
    nombre: string
    apellido: string
  }
  atleta2: {
    nombre: string
    apellido: string
  }
}

interface ProximosTorneosProps {
  combates: Combate[]
}

export default function ProximosTorneos({ combates }: ProximosTorneosProps) {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Próximos Torneos</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          No te pierdas los emocionantes combates que están por venir
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Combates Programados</CardTitle>
          </div>
          <CardDescription>Próximos enfrentamientos que podrás presenciar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {combates && combates.length > 0 ? (
              combates.map((combate) => (
                <div key={combate.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {combate.atleta1.nombre} {combate.atleta1.apellido} vs {combate.atleta2.nombre} {combate.atleta2.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">{combate.categoria}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {new Date(combate.fecha_combate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay torneos programados próximamente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}