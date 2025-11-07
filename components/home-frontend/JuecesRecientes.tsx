"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

type Juez = {
  id: string
  nombre: string
  apellido: string
  nivel_certificacion: string
  anos_experiencia: number
  activo: boolean
}

interface JuecesRecientesProps {
  jueces: Juez[]
}

export default function JuecesRecientes({ jueces }: JuecesRecientesProps) {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Jueces Recientes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conoce a los árbitros más recientes que se han unido a nuestra asociación
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <CardTitle>Últimos Jueces Incorporados</CardTitle>
          </div>
          <CardDescription>Árbitros certificados que garantizan la imparcialidad en nuestros combates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jueces && jueces.length > 0 ? (
              jueces.map((juez) => (
                <div key={juez.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">
                      {juez.nombre} {juez.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {juez.nivel_certificacion} • {juez.anos_experiencia} años de experiencia
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={juez.activo ? "default" : "secondary"}>
                      {juez.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay jueces recientes para mostrar</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}